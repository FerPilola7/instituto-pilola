"use client";

import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { updateProfileDetailsAction, updatePasswordAction } from "./actions";
import { User, Lock, Mail, Clipboard, Check, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PerfilPage() {
  const { profile, setProfile } = useProfile();
  
  // Datos personales
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [detailsSuccess, setDetailsSuccess] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Contraseña
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Copia de matrícula
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
    }
  }, [profile]);

  const handleCopyId = () => {
    if (!profile?.member_id) return;
    navigator.clipboard.writeText(profile.member_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingDetails(true);
    setDetailsSuccess(false);
    setDetailsError(null);

    const result = await updateProfileDetailsAction(firstName, lastName);

    if (result.success) {
      setDetailsSuccess(true);
      // Actualizar perfil localmente
      if (setProfile && profile) {
        setProfile({
          ...profile,
          first_name: firstName,
          last_name: lastName
        });
      }
    } else {
      setDetailsError(result.error || "Ocurrió un error al guardar.");
    }
    setUpdatingDetails(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);
    setPasswordSuccess(false);
    setPasswordError(null);

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      setUpdatingPassword(false);
      return;
    }

    const result = await updatePasswordAction(password);

    if (result.success) {
      setPasswordSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } else {
      setPasswordError(result.error || "Ocurrió un error al actualizar la contraseña.");
    }
    setUpdatingPassword(false);
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Columna de Información General (Read-only status card) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
            
            <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
              <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center border-2 border-primary/30 text-primary text-3xl font-black mb-4">
                {profile?.first_name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-lg text-white">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <span className="text-xs font-bold uppercase text-primary tracking-widest mt-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {profile?.role === "admin" ? "Administrador" : `Nivel ${profile?.level}`}
              </span>
            </div>

            <div className="pt-6 space-y-4">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Matrícula</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-white text-sm font-bold tracking-wider">
                    {profile?.member_id}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={14} className="text-primary animate-bounce" /> : <Clipboard size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Email de Registro</span>
                <span className="text-white text-sm mt-1 block truncate">
                  {profile?.email}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Fecha de Ingreso</span>
                <span className="text-white text-sm mt-1 block flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    : "Reciente"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formularios de edición */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Personales */}
          <div className="glass-card rounded-3xl p-6">
            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User size={18} className="text-primary" />
              <span>Datos del Alumno</span>
            </h4>

            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-xs text-gray-400 font-semibold">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-xs text-gray-400 font-semibold">Apellido</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {detailsError && (
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{detailsError}</span>
                </div>
              )}

              {detailsSuccess && (
                <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <Check size={14} className="shrink-0" />
                  <span>Cambios guardados con éxito.</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={updatingDetails}
                  variant="premium"
                  className="rounded-xl px-6 py-2.5 text-xs"
                >
                  {updatingDetails ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>

          {/* Seguridad / Contraseña */}
          <div className="glass-card rounded-3xl p-6">
            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              <span>Seguridad</span>
            </h4>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs text-gray-400 font-semibold">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-xs text-gray-400 font-semibold">Confirmar Contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <Check size={14} className="shrink-0" />
                  <span>Contraseña cambiada con éxito.</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={updatingPassword}
                  variant="premium"
                  className="rounded-xl px-6 py-2.5 text-xs"
                >
                  {updatingPassword ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
