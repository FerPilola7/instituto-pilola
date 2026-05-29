"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { registerPaymentAction } from "./actions";
import { CreditCard, Search, CheckCircle2, User, DollarSign, Calendar, Gift, AlertCircle, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPagos() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlumno, setSelectedAlumno] = useState<any | null>(null);

  // Campos del formulario
  const [amount, setAmount] = useState<number>(1000);
  const [month, setMonth] = useState("");
  const [points, setPoints] = useState<number>(100);

  // Estados del envío
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagos recientes
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const supabase = createClient();

  // Generar meses sugeridos
  const getMonthSuggestions = () => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();

    const suggestions = [];
    for (let i = -2; i <= 2; i++) {
      let index = currentMonthIndex + i;
      let year = currentYear;
      if (index < 0) {
        index += 12;
        year -= 1;
      } else if (index > 11) {
        index -= 12;
        year += 1;
      }
      suggestions.push(`${months[index]} ${year}`);
    }
    return suggestions;
  };

  const monthSuggestions = getMonthSuggestions();

  const loadAlumnosAndPayments = async () => {
    try {
      // Cargar lista de alumnos activos
      const { data: alumnosData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .eq("is_active", true)
        .order("first_name", { ascending: true });

      if (alumnosData) setAlumnos(alumnosData);

      // Cargar pagos recientes
      setLoadingPayments(true);
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*, profile:profiles(*)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (paymentsData) setRecentPayments(paymentsData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadAlumnosAndPayments();
    // Poner el mes actual por defecto
    setMonth(monthSuggestions[2]); // Sugerencia index 2 corresponde al mes actual en la lista generada
  }, []);

  const handleSelectStudent = (alumno: any) => {
    setSelectedAlumno(alumno);
    setSearchQuery("");
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumno) {
      setError("Por favor, selecciona un alumno de la lista.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const res = await registerPaymentAction(
        selectedAlumno.id,
        amount,
        month,
        points
      );

      if (res.success) {
        setSuccess(true);
        setSelectedAlumno(null);
        // Recargar datos y pagos recientes
        await loadAlumnosAndPayments();
      } else {
        setError(res.error || "Error al registrar el pago.");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de alumnos para buscador
  const searchedAlumnos = searchQuery.trim()
    ? alumnos.filter(
        (a) =>
          a.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.member_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Columna de Formulario (Register payment) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              <span>Registrar Mensualidad</span>
            </h3>

            <form onSubmit={handleRegisterPayment} className="space-y-4">
              {/* Buscador de Alumno */}
              <div className="space-y-1.5 relative">
                <label className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <User size={12} className="text-primary" />
                  <span>Seleccionar Alumno</span>
                </label>
                
                {selectedAlumno ? (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-xs text-gray-400 font-semibold">Alumno Seleccionado</p>
                      <p className="text-sm font-bold text-white">
                        {selectedAlumno.first_name} {selectedAlumno.last_name}
                      </p>
                      <p className="text-[10px] text-primary font-mono">{selectedAlumno.member_id}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSelectedAlumno(null)}
                      className="text-red-400 hover:text-red-500 hover:bg-white/5 h-8 text-[10px] font-bold px-2.5 rounded-lg border border-red-500/10"
                    >
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="Buscar por nombre o matrícula..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    
                    {/* Resultados del buscador dropdown */}
                    {searchQuery.trim() && (
                      <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-20 divide-y divide-white/5">
                        {searchedAlumnos.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-xs">
                            No se encontraron alumnos activos.
                          </div>
                        ) : (
                          searchedAlumnos.map((alumno) => (
                            <div
                              key={alumno.id}
                              onClick={() => handleSelectStudent(alumno)}
                              className="p-3 text-left hover:bg-white/[0.03] cursor-pointer transition-colors"
                            >
                              <p className="text-xs font-bold text-white">
                                {alumno.first_name} {alumno.last_name}
                              </p>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{alumno.member_id}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Monto de Colegiatura */}
              <div className="space-y-1.5">
                <label htmlFor="amount" className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <DollarSign size={12} className="text-primary" />
                  <span>Monto Pagado ($ MXN)</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Mes Correspondiente */}
              <div className="space-y-1.5">
                <label htmlFor="month" className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <Calendar size={12} className="text-primary" />
                  <span>Mes Correspondiente</span>
                </label>
                <input
                  type="text"
                  id="month"
                  required
                  placeholder="Ej. Junio 2026"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors mb-2"
                />
                
                {/* Sugerencias de meses */}
                <div className="flex flex-wrap gap-1.5">
                  {monthSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setMonth(sug)}
                      className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border transition-all ${
                        month === sug
                          ? "bg-primary/20 border-primary text-primary"
                          : "border-white/5 bg-white/[0.01] text-gray-500 hover:text-white"
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Puntos Otorgados */}
              <div className="space-y-1.5">
                <label htmlFor="points" className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <Gift size={12} className="text-primary" />
                  <span>Puntos a Otorgar</span>
                </label>
                <input
                  type="number"
                  id="points"
                  min="0"
                  required
                  value={points}
                  onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                  <CheckCircle2 size={18} className="shrink-0 animate-bounce" />
                  <div>
                    <p className="font-bold text-white">¡Pago registrado exitosamente!</p>
                    <p className="text-gray-400 font-medium mt-0.5">Se han acreditado los {points} puntos automáticamente al alumno.</p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  variant="premium"
                  className="w-full rounded-xl py-5"
                >
                  {loading ? "Registrando Pago..." : "Confirmar y Registrar Pago"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna de Pagos Recientes */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-base font-bold text-white mb-6">Últimos Registros</h3>
            
            {loadingPayments ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                No hay pagos registrados recientemente.
              </div>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((p) => (
                  <div key={p.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <p className="text-xs font-bold text-white truncate max-w-[130px]">
                          {p.profile?.first_name} {p.profile?.last_name}
                        </p>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">{p.profile?.member_id}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        ${Number(p.amount).toLocaleString()} MXN
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2 mt-1">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar size={10} /> {p.month_corresponding}
                      </span>
                      <span className="text-primary font-bold flex items-center gap-0.5">
                        <ArrowUpRight size={10} /> +{p.points_awarded} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
