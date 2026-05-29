"use server";

import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";

// Helper para verificar rol de administrador
async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) return { isAdmin: false, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    isAdmin: profile?.role === "admin",
    user
  };
}

// Registrar Pago Mensual
export async function registerPaymentAction(
  studentId: string,
  amount: number,
  monthCorresponding: string,
  pointsAwarded: number = 100
) {
  try {
    const { isAdmin, user } = await verifyAdmin();
    if (!isAdmin || !user) {
      return { success: false, error: "No autorizado" };
    }

    if (amount <= 0) {
      return { success: false, error: "El monto del pago debe ser mayor a cero." };
    }

    if (!monthCorresponding.trim()) {
      return { success: false, error: "Debes especificar el mes correspondiente." };
    }

    const adminSupabase = await createAdminClient();

    // 1. Validar que exista el alumno
    const { data: profile, error: profileErr } = await adminSupabase
      .from("profiles")
      .select("first_name, last_name, is_active")
      .eq("id", studentId)
      .single();

    if (profileErr || !profile) {
      return { success: false, error: "No se encontró el alumno seleccionado." };
    }

    if (!profile.is_active) {
      return { success: false, error: "El alumno seleccionado está inactivo." };
    }

    // 2. Insertar el pago (El Trigger SQL se encargará de otorgar puntos e historial)
    const { error: insertErr } = await adminSupabase
      .from("payments")
      .insert({
        user_id: studentId,
        amount: amount,
        month_corresponding: monthCorresponding.trim(),
        status: "pagado",
        points_awarded: pointsAwarded,
        registered_by: user.id
      });

    if (insertErr) throw insertErr;

    // 3. Registrar en logs de administrador
    await adminSupabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "register_payment",
      target_user_id: studentId,
      details: { amount, month: monthCorresponding.trim(), points_awarded: pointsAwarded }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in registerPaymentAction:", err);
    return { success: false, error: "Ocurrió un error inesperado al registrar el pago." };
  }
}
