"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { Home, QrCode, Gift, User, Bell, LogOut, Shield, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, loading } = useProfile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(profile?.id);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { label: "Inicio", path: "/inicio", icon: Home },
    { label: "Mi Credencial", path: "/wallet", icon: QrCode },
    { label: "Promociones", path: "/promociones", icon: Gift },
    { label: "Mi Perfil", path: "/perfil", icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin-reverse" />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Cargando tu academia digital...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-premium text-foreground flex flex-col pb-24 md:pb-0 md:pl-64">
      {/* Header Superior */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4 md:px-8 md:left-64 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/30 md:hidden">
            <Image
              src="/images/logo.jpeg"
              alt="Instituto de Artes Pilola"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="font-bold text-lg text-white md:text-xl tracking-wide">
            {pathname === "/inicio" && "Mi Portal"}
            {pathname === "/wallet" && "Credencial Digital"}
            {pathname === "/promociones" && "Promociones y Canjes"}
            {pathname === "/perfil" && "Mi Cuenta"}
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Si es Admin, botón de acceso directo */}
          {profile?.role === "admin" && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex border-primary/40 hover:bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider rounded-full py-1.5 px-4"
              >
                <Shield size={14} className="mr-1" /> Panel Admin
              </Button>
            </Link>
          )}

          {/* Menú de Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-gray-300 hover:text-white"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  {/* Backdrop para cerrar */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                      <span className="font-semibold text-sm text-white">Notificaciones</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary hover:underline"
                        >
                          Marcar todo como leído
                        </button>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          No tienes notificaciones por el momento.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              if (!notification.is_read) markAsRead(notification.id);
                            }}
                            className={`p-4 transition-colors cursor-pointer text-left ${
                              notification.is_read ? "bg-transparent hover:bg-white/[0.02]" : "bg-primary/5 hover:bg-primary/10"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`font-medium text-xs sm:text-sm ${notification.is_read ? "text-gray-300" : "text-primary"}`}>
                                {notification.title}
                              </span>
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar de Escritorio (Desktop Navigation) */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-black/80 border-r border-white/5 z-40 hidden md:flex flex-col p-6">
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
            <span className="text-[10px] text-primary tracking-widest uppercase">Portal Alumno</span>
          </div>
        </Link>

        {/* Info Alumno */}
        <div className="mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <p className="text-xs text-gray-400 mb-0.5">Alumno</p>
          <p className="font-bold text-sm text-white truncate">
            {profile?.first_name} {profile?.last_name}
          </p>
          <div className="mt-3 flex justify-between items-center">
            <div className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              {profile?.level}
            </div>
            <span className="text-xs font-mono text-gray-400">{profile?.points} pts</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <span
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-black font-semibold shadow-[0_0_15px_rgba(55,216,76,0.3)]"
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

        {profile?.role === "admin" && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <Link href="/admin">
              <span className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 border border-primary/20 transition-all">
                <Shield size={18} />
                Panel Admin
              </span>
            </Link>
          </div>
        )}
      </aside>

      {/* Navegación Inferior (Mobile Bottom Navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-white/5 z-40 flex items-center justify-around md:hidden px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="flex-1 max-w-[80px]">
              <span className="flex flex-col items-center gap-1 justify-center py-2 text-[10px] font-medium transition-colors">
                <span
                  className={`p-1.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-black shadow-[0_0_12px_rgba(55,216,76,0.4)] scale-110"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <span className={isActive ? "text-primary font-bold" : "text-gray-400 text-[9px]"}>
                  {item.label}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Contenido Principal con padding top para el header */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
