"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { deliverRedemptionAction, cancelRedemptionAction } from "./actions";
import { Users, CreditCard, Gift, ShieldAlert, Award, ArrowUpRight, ArrowRight, Check, X, Clock, HelpCircle, QrCode } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface AdminStats {
  totalStudents: number;
  totalPayments: number;
  totalPointsAwarded: number;
  activeRewardsCount: number;
  pendingClaimsCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalPayments: 0,
    totalPointsAwarded: 0,
    activeRewardsCount: 0,
    pendingClaimsCount: 0
  });
  
  const [pendingClaims, setPendingClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  
  const supabase = createClient();

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Obtener total alumnos
      const { count: studentCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");

      // 2. Obtener suma de pagos y total pagos
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount");
      const totalPaymentsSum = paymentsData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      // 3. Obtener suma total de puntos otorgados
      const { data: pointsData } = await supabase
        .from("points_history")
        .select("points")
        .eq("type", "earned");
      const totalPointsSum = pointsData?.reduce((acc, curr) => acc + curr.points, 0) || 0;

      // 4. Obtener premios activos
      const { count: rewardsCount } = await supabase
        .from("rewards")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // 5. Obtener canjes pendientes
      const { data: claimsData, count: claimsCount } = await supabase
        .from("reward_redemptions")
        .select("*, reward:rewards(*), profile:profiles(*)", { count: "exact" })
        .eq("status", "pendiente")
        .order("created_at", { ascending: false });

      setStats({
        totalStudents: studentCount || 0,
        totalPayments: totalPaymentsSum,
        totalPointsAwarded: totalPointsSum,
        activeRewardsCount: rewardsCount || 0,
        pendingClaimsCount: claimsCount || 0
      });

      if (claimsData) {
        setPendingClaims(claimsData);
      }
    } catch (err) {
      console.error("Error loading admin dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeliver = async (redemptionId: string) => {
    try {
      setActioningId(redemptionId);
      const res = await deliverRedemptionAction(redemptionId);
      if (res.success) {
        setPendingClaims(prev => prev.filter(c => c.id !== redemptionId));
        setStats(prev => ({
          ...prev,
          pendingClaimsCount: Math.max(0, prev.pendingClaimsCount - 1)
        }));
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = async (redemptionId: string) => {
    if (!confirm("¿Seguro que deseas cancelar este canje y devolver los puntos al alumno?")) return;
    
    try {
      setActioningId(redemptionId);
      const res = await cancelRedemptionAction(redemptionId);
      if (res.success) {
        setPendingClaims(prev => prev.filter(c => c.id !== redemptionId));
        setStats(prev => ({
          ...prev,
          pendingClaimsCount: Math.max(0, prev.pendingClaimsCount - 1)
        }));
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const statCards = [
    { label: "Alumnos Activos", value: stats.totalStudents, icon: Users, color: "text-primary border-primary/20 bg-primary/5" },
    { label: "Ingresos Totales", value: `$${stats.totalPayments.toLocaleString()}`, icon: CreditCard, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
    { label: "Puntos Asignados", value: `${stats.totalPointsAwarded.toLocaleString()} pts`, icon: Award, color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" },
    { label: "Canjes Pendientes", value: stats.pendingClaimsCount, icon: Gift, color: stats.pendingClaimsCount > 0 ? "text-amber-400 border-amber-500/25 bg-amber-500/10 animate-pulse" : "text-gray-400 border-white/5 bg-white/[0.02]" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Banner Admin */}
        <div className="bg-secondary/15 rounded-3xl p-6 border border-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Consola de Administración</h2>
            <p className="text-gray-400 text-xs mt-1">Supervisa pagos, autoriza canjes y gestiona la matrícula del instituto.</p>
          </div>
          <Link href="/admin/scanner">
            <Button variant="premium" className="rounded-xl px-5 py-5 text-xs font-bold gap-2">
              <QrCode size={16} /> Escanear Código QR
            </Button>
          </Link>
        </div>

        {/* Grid de Estadísticas */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="glass-card h-28 rounded-2xl animate-pulse bg-white/[0.02]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={card.label}
                  className={`glass-card rounded-3xl p-5 border flex justify-between items-center ${card.color}`}
                >
                  <div className="text-left">
                    <p className="text-xs text-gray-400 font-semibold">{card.label}</p>
                    <p className="text-2xl font-extrabold text-white mt-2">{card.value}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                    <Icon size={20} className="stroke-[2.5]" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Acceso Rápido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canjes Pendientes (Tabla de Acciones Rápidas) */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 text-left flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white mb-6 flex items-center gap-2">
                <Gift size={18} className="text-primary" />
                <span>Entregas Pendientes de Premios</span>
              </h3>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
              ) : pendingClaims.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  <Check className="mx-auto mb-2 text-primary" size={32} />
                  No hay canjes pendientes de entrega en este momento.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                        <th className="pb-3 font-bold">Alumno</th>
                        <th className="pb-3 font-bold">Premio</th>
                        <th className="pb-3 font-bold">Costo</th>
                        <th className="pb-3 font-bold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pendingClaims.map((claim) => (
                        <tr key={claim.id} className="hover:bg-white/[0.01]">
                          <td className="py-4">
                            <p className="font-bold text-white text-xs sm:text-sm">
                              {claim.profile?.first_name} {claim.profile?.last_name}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{claim.profile?.member_id}</p>
                          </td>
                          <td className="py-4 text-xs sm:text-sm font-medium text-gray-300">
                            {claim.reward?.title}
                          </td>
                          <td className="py-4 text-xs font-mono font-bold text-primary">
                            {claim.points_spent} pts
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                disabled={actioningId !== null}
                                onClick={() => handleDeliver(claim.id)}
                                className="bg-primary/10 hover:bg-primary text-primary hover:text-black rounded-lg h-8 w-8 p-0"
                                title="Entregar Premio"
                              >
                                <Check size={14} className="stroke-[3]" />
                              </Button>
                              <Button
                                size="sm"
                                disabled={actioningId !== null}
                                onClick={() => handleCancel(claim.id)}
                                className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg h-8 w-8 p-0 border border-red-500/20"
                                title="Cancelar / Reembolsar"
                              >
                                <X size={14} className="stroke-[3]" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Menú de Accesos Administrativos */}
          <div className="glass-card rounded-3xl p-6 text-left flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white mb-6 flex items-center gap-2">
                <ShieldAlert size={18} className="text-primary" />
                <span>Enlaces Rápidos</span>
              </h3>

              <div className="space-y-3.5">
                <Link href="/admin/scanner" className="block">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center hover:border-primary/30 transition-all group">
                    <div>
                      <p className="text-xs font-extrabold text-white">Escáner de Asistencias</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Usa la cámara para validar a un alumno</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                <Link href="/admin/pagos" className="block">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center hover:border-primary/30 transition-all group">
                    <div>
                      <p className="text-xs font-extrabold text-white">Registrar Colegiatura</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Carga mensualidades y suma 100 puntos</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                <Link href="/admin/alumnos" className="block">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center hover:border-primary/30 transition-all group">
                    <div>
                      <p className="text-xs font-extrabold text-white">Directorio de Alumnos</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Buscar, desactivar o modificar perfiles</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                <Link href="/admin/promociones" className="block">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center hover:border-primary/30 transition-all group">
                    <div>
                      <p className="text-xs font-extrabold text-white">Inventario de Premios</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">CRUD de regalos del catálogo</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 mt-6 text-xs text-gray-500 flex justify-between items-center">
              <span>Matrícula activa: {stats.totalStudents}</span>
              <span>Premios en catálogo: {stats.activeRewardsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
