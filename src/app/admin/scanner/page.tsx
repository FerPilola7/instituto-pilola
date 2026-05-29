"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { QRScanner } from "@/components/admin/QRScanner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { registerPaymentAction } from "../pagos/actions";
import { adjustPointsAction } from "../alumnos/actions";
import { deliverRedemptionAction, cancelRedemptionAction } from "../actions";
import { QrCode, User, Check, X, ShieldAlert, Award, Calendar, DollarSign, Gift, ArrowUpRight, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminScanner() {
  const [scanning, setScanning] = useState(true);
  const [scannedId, setScannedId] = useState<string | null>(null);
  
  // Alumno encontrado
  const [alumno, setAlumno] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingAlumno, setLoadingAlumno] = useState(false);

  // Canjes pendientes del alumno
  const [alumnoClaims, setAlumnoClaims] = useState<any[]>([]);

  // Estados de formularios rápidos
  const [amount, setAmount] = useState<number>(1000);
  const [month, setMonth] = useState("");
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const [pointsAmount, setPointsAmount] = useState<number>(100);
  const [pointsConcept, setPointsConcept] = useState("");
  const [pointsType, setPointsType] = useState<"earned" | "redeemed">("earned");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  const [actioningClaimId, setActioningClaimId] = useState<string | null>(null);

  const supabase = createClient();

  // Generar mes por defecto
  const getDefaultMonth = () => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const d = new Date();
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  useEffect(() => {
    setMonth(getDefaultMonth());
  }, []);

  const handleScanSuccess = async (decodedText: string) => {
    if (!decodedText) return; // Reintento de permisos
    
    setScannedId(decodedText);
    setScanning(false);
    setSearchError(null);
    setAlumno(null);
    
    try {
      setLoadingAlumno(true);
      // Buscar alumno por member_id
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("member_id", decodedText.toUpperCase().trim())
        .single();

      if (profileErr || !profileData) {
        setSearchError(`No se encontró ningún alumno con la matrícula: ${decodedText.toUpperCase()}`);
        return;
      }

      setAlumno(profileData);
      
      // Buscar canjes pendientes del alumno
      const { data: claimsData } = await supabase
        .from("reward_redemptions")
        .select("*, reward:rewards(*)")
        .eq("user_id", profileData.id)
        .eq("status", "pendiente")
        .order("created_at", { ascending: false });

      if (claimsData) {
        setAlumnoClaims(claimsData);
      }
    } catch (err) {
      console.error(err);
      setSearchError("Error de conexión al buscar en la base de datos.");
    } finally {
      setLoadingAlumno(false);
    }
  };

  const handleResetScanner = () => {
    setScannedId(null);
    setAlumno(null);
    setAlumnoClaims([]);
    setSearchError(null);
    setPaySuccess(false);
    setAdjustSuccess(false);
    setPointsConcept("");
    setScanning(true);
  };

  const handleQuickPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumno) return;

    try {
      setPaying(true);
      setErrorState(null);
      const res = await registerPaymentAction(alumno.id, amount, month, 100);

      if (res.success) {
        setPaySuccess(true);
        // Recargar datos del alumno
        const { data } = await supabase.from("profiles").select("points").eq("id", alumno.id).single();
        if (data) {
          setAlumno({
            ...alumno,
            points: data.points
          });
        }
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  const handleQuickPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumno) return;

    try {
      setAdjusting(true);
      setErrorState(null);
      const res = await adjustPointsAction(alumno.id, pointsAmount, pointsType, pointsConcept);

      if (res.success) {
        setAdjustSuccess(true);
        // Recargar datos del alumno
        const { data } = await supabase.from("profiles").select("points").eq("id", alumno.id).single();
        if (data) {
          setAlumno({
            ...alumno,
            points: data.points
          });
        }
        setPointsConcept("");
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdjusting(false);
    }
  };

  const handleDeliverClaim = async (claimId: string) => {
    try {
      setActioningClaimId(claimId);
      const res = await deliverRedemptionAction(claimId);
      if (res.success) {
        setAlumnoClaims(prev => prev.filter(c => c.id !== claimId));
        alert("¡Recompensa entregada correctamente!");
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningClaimId(null);
    }
  };

  const [errorState, setErrorState] = useState<string | null>(null);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {scanning ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <QrCode size={28} />
              </div>
              <h2 className="text-xl font-extrabold text-white">Escáner de Credenciales</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Escanea el código QR de un alumno para cargar su perfil y registrar pagos o ajustar puntos instantáneamente.
              </p>
            </div>
            
            {/* Componente del Escáner */}
            <div className="glass-card rounded-3xl p-6 border-white/5 max-w-md mx-auto">
              <QRScanner onScanSuccess={handleScanSuccess} active={scanning} />
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn text-left">
            {/* Botón de volver a escanear */}
            <div className="flex justify-between items-center bg-secondary/15 p-4 rounded-2xl border border-primary/20">
              <span className="text-xs text-gray-300 font-medium">Credencial escaneada: <strong className="font-mono text-primary uppercase">{scannedId}</strong></span>
              <Button onClick={handleResetScanner} variant="premium" className="rounded-xl px-4 py-4 text-xs font-bold">
                Escanear de Nuevo
              </Button>
            </div>

            {loadingAlumno ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-3" />
                <p className="text-xs text-gray-500">Buscando perfil del alumno...</p>
              </div>
            ) : searchError ? (
              <div className="glass-card rounded-3xl p-8 border-red-500/20 text-center space-y-4 max-w-md mx-auto">
                <ShieldAlert className="text-red-500 mx-auto" size={48} />
                <h4 className="font-extrabold text-lg text-white">Error de Búsqueda</h4>
                <p className="text-xs text-red-400 leading-relaxed">{searchError}</p>
                <Button onClick={handleResetScanner} variant="premium" className="w-full rounded-xl mt-4">
                  Reintentar Escaneo
                </Button>
              </div>
            ) : alumno ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Resumen del alumno y canjes pendientes */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Tarjeta del Alumno */}
                  <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
                    
                    <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
                      <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center border-2 border-primary/30 text-primary text-2xl font-black mb-3">
                        {alumno.first_name?.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="font-extrabold text-base text-white">
                        {alumno.first_name} {alumno.last_name}
                      </h4>
                      <span className="text-[10px] font-mono text-gray-500 mt-0.5">{alumno.member_id}</span>
                      <span className="text-[9px] font-bold uppercase text-primary tracking-widest mt-2 bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        {alumno.level}
                      </span>
                    </div>

                    <div className="pt-6 space-y-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Puntos Disponibles</span>
                        <span className="font-extrabold text-white font-mono">{alumno.points} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Estatus</span>
                        <span className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded-full ${alumno.is_active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {alumno.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Correo</span>
                        <span className="text-white truncate max-w-[130px] font-medium">{alumno.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Canjes Pendientes del Alumno */}
                  <div className="glass-card rounded-3xl p-6">
                    <h5 className="font-extrabold text-sm text-white mb-4 flex items-center gap-1.5">
                      <Gift size={16} className="text-primary" />
                      <span>Canjes por Entregar</span>
                    </h5>

                    {alumnoClaims.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">
                        Este alumno no tiene canjes de premios pendientes de entrega.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {alumnoClaims.map(claim => (
                          <div key={claim.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2">
                            <div className="text-left">
                              <p className="text-xs font-bold text-white">{claim.reward?.title}</p>
                              <p className="text-[9px] text-gray-500 mt-0.5">Costo: {claim.points_spent} pts</p>
                            </div>
                            <Button
                              onClick={() => handleDeliverClaim(claim.id)}
                              disabled={actioningClaimId !== null}
                              size="sm"
                              className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-black rounded-xl h-8 text-[10px] font-bold"
                            >
                              {actioningClaimId === claim.id ? "Registrando..." : "Registrar Entrega"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Formularios Rápidos */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Registrar Pago Rápido */}
                  <div className="glass-card rounded-3xl p-6">
                    <h5 className="font-extrabold text-sm text-white mb-4 flex items-center gap-1.5">
                      <CreditCard size={16} className="text-primary" />
                      <span>Registrar Mensualidad Rápida</span>
                    </h5>

                    {paySuccess ? (
                      <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                        <CheckCircle2 size={18} className="shrink-0 animate-bounce" />
                        <div>
                          <p className="font-bold text-white">¡Mensualidad Registrada!</p>
                          <p className="text-gray-400 font-medium mt-0.5">Pago de colegiatura cargado y +100 puntos acreditados.</p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleQuickPayment} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-semibold uppercase">Monto ($ MXN)</label>
                            <input
                              type="number"
                              required
                              value={amount}
                              onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-semibold uppercase">Mes Correspondiente</label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. Junio 2026"
                              value={month}
                              onChange={(e) => setMonth(e.target.value)}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={paying}
                          variant="premium"
                          className="w-full rounded-xl py-4 text-xs"
                        >
                          {paying ? "Registrando..." : "Registrar Colegiatura (+100 pts)"}
                        </Button>
                      </form>
                    )}
                  </div>

                  {/* Ajustar Puntos Rápido */}
                  <div className="glass-card rounded-3xl p-6">
                    <h5 className="font-extrabold text-sm text-white mb-4 flex items-center gap-1.5">
                      <Award size={16} className="text-primary" />
                      <span>Modificar Puntos</span>
                    </h5>

                    {adjustSuccess ? (
                      <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                        <CheckCircle2 size={18} className="shrink-0 animate-bounce" />
                        <div>
                          <p className="font-bold text-white">¡Ajuste de Puntos Completado!</p>
                          <p className="text-gray-400 font-medium mt-0.5">La cuenta del alumno ha sido actualizada con éxito.</p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleQuickPoints} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPointsType("earned")}
                            className={`py-2 rounded-xl border flex items-center justify-center gap-1 text-xs font-bold transition-all ${
                              pointsType === "earned"
                                ? "bg-primary/10 border-primary text-primary"
                                : "border-white/10 text-gray-400"
                            }`}
                          >
                            Abonar Puntos
                          </button>
                          <button
                            type="button"
                            onClick={() => setPointsType("redeemed")}
                            className={`py-2 rounded-xl border flex items-center justify-center gap-1 text-xs font-bold transition-all ${
                              pointsType === "redeemed"
                                ? "bg-red-500/10 border-red-500/30 text-red-400"
                                : "border-white/10 text-gray-400"
                            }`}
                          >
                            Deducir Puntos
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-[10px] text-gray-500 font-semibold uppercase">Puntos</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={pointsAmount}
                              onChange={(e) => setPointsAmount(Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] text-gray-500 font-semibold uppercase">Concepto / Motivo</label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. Premio por dibujo destacado"
                              value={pointsConcept}
                              onChange={(e) => setPointsConcept(e.target.value)}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={adjusting}
                          variant="premium"
                          className="w-full rounded-xl py-4 text-xs"
                        >
                          {adjusting ? "Guardando..." : `Confirmar y ${pointsType === "earned" ? "Sumar" : "Deducir"}`}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
