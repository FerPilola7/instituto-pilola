"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/perfil`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-premium flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl w-96 h-96 top-1/4 left-1/4 -z-10" />
      <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-3xl w-96 h-96 bottom-1/4 right-1/4 -z-10" />

      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Login</span>
        </Link>

        {/* Card Contenedora */}
        <div className="glass-card rounded-3xl p-8 border-white/10 shadow-2xl relative overflow-hidden">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/40 shadow-[0_0_20px_rgba(55,216,76,0.3)] mb-4">
              <Image
                src="/images/logo.jpeg"
                alt="Instituto de Artes Pilola"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="font-extrabold text-xl text-white tracking-wider">PILOLA</h1>
            <span className="text-[10px] text-primary tracking-widest uppercase font-semibold mt-1">Recuperar Acceso</span>
          </div>

          {!success ? (
            <form onSubmit={handleRecover} className="space-y-5 text-left">
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Ingresa el correo electrónico asociado a tu cuenta de alumno. Te enviaremos un enlace seguro para restablecer tu contraseña.
              </p>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <Mail size={12} className="text-primary" />
                  <span>Correo Electrónico</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                variant="premium"
                className="w-full rounded-xl py-6 font-bold text-xs"
              >
                {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-white text-base">¡Enlace Enviado!</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Hemos enviado un correo a <span className="text-white font-semibold">{email}</span> con las instrucciones para recuperar tu acceso.
                </p>
                <p className="text-[10px] text-gray-500">
                  Si no lo recibes en unos minutos, revisa tu bandeja de spam.
                </p>
              </div>

              <Link href="/login" className="block w-full">
                <Button variant="premium" className="w-full rounded-xl py-5 text-xs">
                  Volver al Inicio de Sesión
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
