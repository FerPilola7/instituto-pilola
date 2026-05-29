"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { adjustPointsAction, toggleStudentStatusAction } from "./actions";
import { Search, UserCheck, UserX, Award, Shield, FileText, Settings, X, Plus, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAlumnos() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [filteredAlumnos, setFilteredAlumnos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Alumno seleccionado y su modal
  const [selectedAlumno, setSelectedAlumno] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<"points" | "status" | "history">("points");
  
  // Historial del alumno seleccionado
  const [alumnoHistory, setAlumnoHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Formulario de puntos
  const [pointsAmount, setPointsAmount] = useState(100);
  const [pointsType, setPointsType] = useState<"earned" | "redeemed">("earned");
  const [pointsConcept, setPointsConcept] = useState("");
  const [adjustingPoints, setAdjustingPoints] = useState(false);

  const supabase = createClient();

  const loadAlumnos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("first_name", { ascending: true });

      if (error) throw error;
      if (data) {
        setAlumnos(data);
        setFilteredAlumnos(data);
      }
    } catch (err) {
      console.error("Error loading students list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlumnos();
  }, []);

  // Filtrado de alumnos en tiempo real
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredAlumnos(alumnos);
      return;
    }

    const filtered = alumnos.filter(
      (a) =>
        a.first_name.toLowerCase().includes(term) ||
        a.last_name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term) ||
        a.member_id.toLowerCase().includes(term)
    );
    setFilteredAlumnos(filtered);
  }, [searchTerm, alumnos]);

  // Cargar historial del alumno al abrir pestaña de historial
  useEffect(() => {
    if (!selectedAlumno || modalTab !== "history") return;

    async function fetchAlumnoHistory() {
      try {
        setLoadingHistory(true);
        const { data, error } = await supabase
          .from("points_history")
          .select("*")
          .eq("user_id", selectedAlumno.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setAlumnoHistory(data);
      } catch (err) {
        console.error("Error loading student history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchAlumnoHistory();
  }, [selectedAlumno, modalTab, supabase]);

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumno) return;

    try {
      setAdjustingPoints(true);
      const res = await adjustPointsAction(
        selectedAlumno.id,
        pointsAmount,
        pointsType,
        pointsConcept
      );

      if (res.success) {
        // Actualizar alumno seleccionado localmente
        const nextPoints = pointsType === "earned" 
          ? selectedAlumno.points + pointsAmount
          : selectedAlumno.points - pointsAmount;

        setSelectedAlumno({
          ...selectedAlumno,
          points: nextPoints
        });

        // Recargar alumnos
        await loadAlumnos();
        setPointsConcept("");
        alert("¡Puntos ajustados correctamente!");
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdjustingPoints(false);
    }
  };

  const handleToggleStatus = async (isActive: boolean) => {
    if (!selectedAlumno) return;
    if (!confirm(`¿Seguro que deseas ${isActive ? "ACTIVAR" : "INACTIVAR"} a este alumno?`)) return;

    try {
      const res = await toggleStudentStatusAction(selectedAlumno.id, isActive);
      if (res.success) {
        setSelectedAlumno({
          ...selectedAlumno,
          is_active: isActive
        });
        await loadAlumnos();
        alert(`Alumno ${isActive ? "activado" : "desactivado"} exitosamente.`);
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Barra superior de búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-secondary/10 p-4 rounded-2xl border border-white/5">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, correo o matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="text-xs text-gray-400 self-stretch sm:self-auto flex items-center justify-between gap-4">
            <span>Alumnos Encontrados: <strong className="text-white">{filteredAlumnos.length}</strong></span>
          </div>
        </div>

        {/* Listado de Alumnos */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredAlumnos.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No se encontraron alumnos registrados que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumnos.map((alumno) => (
              <motion.div
                key={alumno.id}
                layout
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedAlumno(alumno);
                  setModalTab("points");
                }}
                className={`glass-card rounded-3xl p-6 text-left border cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden ${
                  !alumno.is_active ? "border-red-500/25 opacity-75" : "border-white/10 hover:border-primary/40"
                }`}
              >
                {!alumno.is_active && (
                  <div className="absolute top-3 right-3 bg-red-950/40 border border-red-500/30 text-red-400 text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full">
                    Inactivo
                  </div>
                )}
                
                <div>
                  <h4 className="font-extrabold text-base text-white truncate pr-12">
                    {alumno.first_name} {alumno.last_name}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono tracking-wider mt-0.5">{alumno.member_id}</p>
                  <p className="text-xs text-gray-400 truncate mt-2">{alumno.email}</p>
                </div>

                <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Nivel</span>
                    <span className="block font-bold text-xs uppercase text-primary tracking-wider mt-0.5">
                      {alumno.level}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Puntos</span>
                    <span className="block font-black text-lg text-white leading-none mt-0.5">
                      {alumno.points} <span className="text-xs text-primary font-bold">pts</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MODAL DETALLE / ACCIONES */}
        <AnimatePresence>
          {selectedAlumno && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                onClick={() => setSelectedAlumno(null)}
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-black/40 flex justify-between items-start text-left">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      {selectedAlumno.first_name} {selectedAlumno.last_name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedAlumno.member_id} • {selectedAlumno.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedAlumno(null)}
                    className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-black/20 text-xs font-bold uppercase tracking-wider">
                  <button
                    onClick={() => setModalTab("points")}
                    className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                      modalTab === "points" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-white"
                    }`}
                  >
                    <Award size={14} /> Ajustar Puntos
                  </button>
                  <button
                    onClick={() => setModalTab("status")}
                    className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                      modalTab === "status" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-white"
                    }`}
                  >
                    <Settings size={14} /> Estatus
                  </button>
                  <button
                    onClick={() => setModalTab("history")}
                    className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                      modalTab === "history" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-white"
                    }`}
                  >
                    <FileText size={14} /> Historial
                  </button>
                </div>

                {/* Content Area (Scrollable) */}
                <div className="p-6 overflow-y-auto flex-1 text-left">
                  {/* TAB 1: Ajuste de puntos */}
                  {modalTab === "points" && (
                    <form onSubmit={handleAdjustPoints} className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl mb-4">
                        <span className="text-xs text-gray-400 font-semibold">Saldo de Puntos Actual</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white font-mono">{selectedAlumno.points}</span>
                          <span className="text-xs text-primary font-bold font-mono">pts</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => setPointsType("earned")}
                          className={`py-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                            pointsType === "earned"
                              ? "bg-primary/10 border-primary text-primary"
                              : "border-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          <Plus size={14} className="stroke-[3]" /> Sumar Puntos
                        </button>
                        <button
                          type="button"
                          onClick={() => setPointsType("redeemed")}
                          className={`py-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                            pointsType === "redeemed"
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : "border-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          <Minus size={14} className="stroke-[3]" /> Restar Puntos
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-400 font-semibold">Cantidad de Puntos</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={pointsAmount}
                          onChange={(e) => setPointsAmount(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-400 font-semibold">Concepto / Motivo</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Premio por puntualidad, Mensualidad de Junio, etc."
                          value={pointsConcept}
                          onChange={(e) => setPointsConcept(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <Button
                          type="submit"
                          disabled={adjustingPoints}
                          variant="premium"
                          className="w-full rounded-xl py-5"
                        >
                          {adjustingPoints ? "Actualizando..." : `Confirmar y ${pointsType === "earned" ? "Abonar" : "Deducir"}`}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* TAB 2: Estado Activo / Inactivo */}
                  {modalTab === "status" && (
                    <div className="space-y-6">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Estado de cuenta:</span>
                          <span
                            className={`font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px] ${
                              selectedAlumno.is_active
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {selectedAlumno.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="text-gray-500 leading-relaxed">
                          Un alumno inactivo no podrá iniciar sesión en la aplicación, canjear recompensas ni acumular puntos hasta que sea reactivado por el personal autorizado.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-3">
                        {selectedAlumno.is_active ? (
                          <Button
                            onClick={() => handleToggleStatus(false)}
                            className="w-full bg-red-950/20 text-red-400 hover:bg-red-900/30 border border-red-500/20 rounded-xl py-5 text-xs font-bold gap-1.5"
                          >
                            <UserX size={16} /> Desactivar Cuenta Alumno
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleToggleStatus(true)}
                            variant="premium"
                            className="w-full rounded-xl py-5 text-xs font-bold gap-1.5"
                          >
                            <UserCheck size={16} /> Activar Cuenta Alumno
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Historial de Puntos */}
                  {modalTab === "history" && (
                    <div className="space-y-4">
                      {loadingHistory ? (
                        <div className="py-8 flex justify-center">
                          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                      ) : alumnoHistory.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 text-xs">
                          El alumno no tiene transacciones de puntos registradas.
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {alumnoHistory.map((item) => (
                            <div key={item.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                              <div>
                                <p className="text-xs font-bold text-white">{item.concept}</p>
                                <p className="text-[10px] text-gray-500">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center font-mono font-bold text-xs">
                                {item.type === "earned" ? (
                                  <span className="text-primary flex items-center gap-0.5"><ArrowUpRight size={12} /> +{item.points}</span>
                                ) : (
                                  <span className="text-red-400 flex items-center gap-0.5"><ArrowDownRight size={12} /> -{item.points}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
