"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await signup(formData);
      return result || prevState;
    },
    null
  );

  return (
    <main className="min-h-screen bg-gradient-premium flex items-center justify-center p-4 relative overflow-hidden py-12">
      <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-white flex items-center gap-2 transition-colors z-10">
        <ArrowLeft size={20} /> Volver
      </Link>

      {/* Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 md:p-10 rounded-3xl border border-primary/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 border border-primary/30">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Únete al Instituto</h1>
            <p className="text-muted-foreground">Crea tu cuenta para obtener tu credencial digital y empezar a ganar puntos.</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="first_name">
                  Nombre
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="last_name">
                  Apellido
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all"
                placeholder="tu@correo.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            {state?.error && (
              <div className="p-3 bg-destructive/20 border border-destructive/50 text-destructive-foreground rounded-lg text-sm text-center">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              variant="premium"
              size="xl"
              className="w-full mt-6"
            >
              {isPending ? "Creando cuenta..." : "Completar Registro"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:text-emerald-300 transition-colors font-medium">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
