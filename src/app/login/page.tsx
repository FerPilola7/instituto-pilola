"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await login(formData);
      return result || prevState;
    },
    null
  );

  return (
    <main className="min-h-screen bg-gradient-premium flex items-center justify-center p-4 relative overflow-hidden">
      <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-white flex items-center gap-2 transition-colors z-10">
        <ArrowLeft size={20} /> Volver
      </Link>

      {/* Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 md:p-10 rounded-3xl border border-primary/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 border border-primary/30">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
            <p className="text-muted-foreground">Inicia sesión en tu cuenta Pilola</p>
          </div>

          <form action={formAction} className="space-y-5">
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
                placeholder="••••••••"
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
              className="w-full mt-4"
            >
              {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-primary hover:text-emerald-300 transition-colors font-medium">
              Únete al instituto
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
