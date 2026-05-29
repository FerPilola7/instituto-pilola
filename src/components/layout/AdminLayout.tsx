"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { BarChart2, QrCode, Users, CreditCard, Gift, LogOut, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { profile, loading } = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: BarChart2 },
    { label: "Escanear QR", path: "/admin/scanner", icon: QrCode },
    { label: "Alumnos", path: "/admin/alumnos", icon: Users },
    { label: "Registrar Pago", path: "/admin/pagos", icon: CreditCard },
    { label: "Recompensas", path: "/admin/promociones", icon: Gift },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin-reverse" />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Cargando Panel de Control...</p>
      </div>
    );
  }

  // Si no está cargando pero no es admin, no permitir ver
  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <Shield size={64} className="text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-extrabold text-white mb-2">Acceso No Autorizado</h1>
        <p className="text-gray-400 text-sm max-w-sm mb-6">
          Esta sección está restringida exclusivamente para administradores del Instituto de Artes Pilola.
        </p>
        <Link href="/inicio">
          <Button variant="premium" className="rounded-xl px-6 py-2.5">
            Volver al Portal de Alumnos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-premium text-foreground flex flex-col pb-24 md:pb-0 md:pl-64">
      {/* Header Superior Admin */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4 md:px-8 md:left-64 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/30 md:hidden">
            <Image
              src="/images/logo.jpeg"
              alt="Instituto de Artes Pilola"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="font-bold text-base text-white md:text-lg tracking-wide flex items-center gap-1.5">
            <Shield size={16} className="text-primary" />
            <span className="hidden sm:inline">Panel Admin —</span>
            <span>
              {pathname === "/admin" && "Resumen"}
              {pathname === "/admin/scanner" && "Escáner de Credenciales"}
              {pathname === "/admin/alumnos" && "Gestión de Alumnos"}
              {pathname === "/admin/pagos" && "Registro de Pagos"}
              {pathname === "/admin/promociones" && "Inventario de Premios"}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Volver a Alumno */}
          <Link href="/inicio">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5 text-gray-300 text-xs rounded-full py-1.5 px-4 flex items-center gap-1.5"
            >
              <ArrowLeft size={12} /> Portal Alumno
            </Button>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors ml-2"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar Admin (Desktop) */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-black/95 border-r border-white/5 z-40 hidden md:flex flex-col p-6">
        <Link href="/" className="flex items-center gap-3 mb-8 px-2">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(55,216,76,0.2)]">
            <Image
              src="/images/logo.jpeg"
              alt="Instituto de Artes Pilola"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-bold text-lg text-white block tracking-wider leading-none">PILOLA</span>
            <span className="text-[10px] text-primary tracking-widest uppercase font-bold">Administrador</span>
          </div>
        </Link>

        {/* Info Admin */}
        <div className="mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
          <p className="text-[10px] text-primary uppercase tracking-widest font-extrabold flex items-center gap-1">
            <Shield size={10} /> Sesión Activa
          </p>
          <p className="font-bold text-sm text-white truncate mt-1">
            {profile?.first_name} {profile?.last_name}
          </p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <span
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-black shadow-[0_0_15px_rgba(55,216,76,0.3)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 pt-4 border-t border-white/5">
          <Link href="/inicio">
            <span className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              <ArrowLeft size={18} />
              Portal Alumno
            </span>
          </Link>
        </div>
      </aside>

      {/* Bottom Nav Admin (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-lg border-t border-white/5 z-40 flex items-center justify-around md:hidden px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="flex-1 max-w-[70px]">
              <span className="flex flex-col items-center gap-1 justify-center py-2 text-[9px] font-medium transition-colors">
                <span
                  className={`p-1.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-black shadow-[0_0_12px_rgba(55,216,76,0.4)] scale-115"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className={isActive ? "text-primary font-bold" : "text-gray-400 text-[8px]"}>
                  {item.label === "Registrar Pago" ? "Pago" : item.label === "Escanear QR" ? "Escanear" : item.label}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
