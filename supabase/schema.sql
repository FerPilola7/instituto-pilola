-- ============================================================
-- INSTITUTO DE ARTES PILOLA — Esquema de Base de Datos
-- Supabase PostgreSQL con Row Level Security (RLS)
-- ============================================================

-- ==========================================
-- 1. TABLA DE PERFILES (vinculada a auth.users)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  member_id TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  level TEXT DEFAULT 'bronce' CHECK (level IN ('bronce', 'plata', 'oro', 'platino')),
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_member_id ON public.profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==========================================
-- 2. HISTORIAL DE PUNTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed')),
  concept TEXT NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_points_user ON public.points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_created ON public.points_history(created_at DESC);

-- ==========================================
-- 3. PAGOS / MENSUALIDADES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  month_corresponding TEXT NOT NULL,
  status TEXT DEFAULT 'pagado' CHECK (status IN ('pagado', 'pendiente')),
  points_awarded INTEGER DEFAULT 100,
  registered_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);

-- ==========================================
-- 4. PROMOCIONES / RECOMPENSAS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  is_active BOOLEAN DEFAULT true,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 5. CANJES DE PROMOCIONES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id),
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'entregado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.reward_redemptions(user_id);

-- ==========================================
-- 6. NOTIFICACIONES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('points', 'reward', 'level', 'system', 'payment')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ==========================================
-- 7. LOGS DE ADMINISTRADOR
-- ==========================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON public.admin_logs(created_at DESC);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Función: Generar member_id único (PILOLA-XXXXXXXX)
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    new_id := 'PILOLA-' || upper(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 8));
    SELECT COUNT(*) INTO exists_count FROM public.profiles WHERE member_id = new_id;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Función: Calcular nivel basado en puntos
CREATE OR REPLACE FUNCTION public.calculate_level(p_points INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_points >= 5000 THEN RETURN 'platino';
  ELSIF p_points >= 2500 THEN RETURN 'oro';
  ELSIF p_points >= 1000 THEN RETURN 'plata';
  ELSE RETURN 'bronce';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función: Actualizar nivel del usuario automáticamente
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level TEXT;
  old_level TEXT;
BEGIN
  SELECT level INTO old_level FROM public.profiles WHERE id = NEW.id;
  new_level := public.calculate_level(NEW.points);
  
  IF new_level != old_level THEN
    NEW.level := new_level;
    -- Crear notificación de cambio de nivel
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      '¡Nuevo nivel alcanzado!',
      'Has alcanzado el nivel ' || initcap(new_level) || '. ¡Felicidades!',
      'level'
    );
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar nivel cuando cambian los puntos
CREATE OR REPLACE TRIGGER on_points_change
  BEFORE UPDATE OF points ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- Función: Crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, member_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    public.generate_member_id(),
    CASE 
      WHEN NEW.email = 'lu.soporte.studio@gmail.com' THEN 'admin'
      ELSE 'student'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Crear perfil cuando se registra un usuario nuevo
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Función: Registrar pago y asignar puntos automáticamente
CREATE OR REPLACE FUNCTION public.register_payment_and_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pagado' THEN
    -- Agregar puntos al perfil
    UPDATE public.profiles 
    SET points = points + NEW.points_awarded 
    WHERE id = NEW.user_id;
    
    -- Registrar en historial de puntos
    INSERT INTO public.points_history (user_id, points, type, concept, assigned_by)
    VALUES (
      NEW.user_id,
      NEW.points_awarded,
      'earned',
      'Mensualidad: ' || NEW.month_corresponding,
      NEW.registered_by
    );
    
    -- Notificación
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      '¡Puntos recibidos!',
      'Has recibido ' || NEW.points_awarded || ' puntos por tu mensualidad de ' || NEW.month_corresponding || '.',
      'points'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Al insertar un pago, asignar puntos
CREATE OR REPLACE TRIGGER on_payment_insert
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.register_payment_and_points();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Helper: verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- POINTS HISTORY
CREATE POLICY "Users can view own points" ON public.points_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all points" ON public.points_history
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert points" ON public.points_history
  FOR INSERT WITH CHECK (public.is_admin());

-- PAYMENTS
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert payments" ON public.payments
  FOR INSERT WITH CHECK (public.is_admin());

-- REWARDS
CREATE POLICY "Everyone can view active rewards" ON public.rewards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage rewards" ON public.rewards
  FOR ALL USING (public.is_admin());

-- REWARD REDEMPTIONS
CREATE POLICY "Users can view own redemptions" ON public.reward_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can redeem rewards" ON public.reward_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions" ON public.reward_redemptions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update redemptions" ON public.reward_redemptions
  FOR UPDATE USING (public.is_admin());

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ADMIN LOGS
CREATE POLICY "Admins can view logs" ON public.admin_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert logs" ON public.admin_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- DATOS INICIALES (Promociones de ejemplo)
-- ============================================================
INSERT INTO public.rewards (title, description, points_cost, image_url, is_active) VALUES
  ('Playera Oficial Pilola', 'Playera edición limitada del Instituto de Artes Pilola con diseño exclusivo.', 500, NULL, true),
  ('Clase Gratis', 'Una clase completamente gratis en la disciplina de tu elección.', 300, NULL, true),
  ('Kit de Material Artístico', 'Kit completo con pinceles, acrílicos y lienzo profesional.', 800, NULL, true),
  ('Acceso VIP a Evento', 'Pase VIP para el próximo evento o recital del Instituto.', 1000, NULL, true),
  ('20% Descuento en Mensualidad', 'Descuento del 20% aplicable a tu próxima mensualidad.', 400, NULL, true);
