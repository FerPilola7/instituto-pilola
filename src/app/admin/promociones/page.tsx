"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { createRewardAction, updateRewardAction, deleteRewardAction } from "./actions";
import { Plus, Edit2, Trash2, Gift, Check, X, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPromociones() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any | null>(null);

  // Campos del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsCost, setPointsCost] = useState<number>(300);
  const [hasStock, setHasStock] = useState(false);
  const [stockValue, setStockValue] = useState<number>(10);
  const [isActive, setIsActive] = useState(true);

  // Envío
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const loadRewards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setRewards(data);
    } catch (err) {
      console.error("Error loading rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, []);

  const openCreateModal = () => {
    setEditingReward(null);
    setTitle("");
    setDescription("");
    setPointsCost(300);
    setHasStock(false);
    setStockValue(10);
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (reward: any) => {
    setEditingReward(reward);
    setTitle(reward.title);
    setDescription(reward.description);
    setPointsCost(reward.points_cost);
    setHasStock(reward.stock !== null);
    setStockValue(reward.stock ?? 10);
    setIsActive(reward.is_active);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const finalStock = hasStock ? stockValue : null;

      let res;
      if (editingReward) {
        res = await updateRewardAction(
          editingReward.id,
          title,
          description,
          pointsCost,
          finalStock,
          isActive
        );
      } else {
        res = await createRewardAction(
          title,
          description,
          pointsCost,
          finalStock,
          isActive
        );
      }

      if (res.success) {
        setModalOpen(false);
        await loadRewards();
      } else {
        setError(res.error || "Ocurrió un error al guardar.");
      }
    } catch (err) {
      setError("Error al procesar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este premio del catálogo?")) return;

    try {
      const res = await deleteRewardAction(id);
      if (res.success) {
        await loadRewards();
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Banner */}
        <div className="bg-secondary/15 rounded-3xl p-6 border border-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Catálogo de Premios</h2>
            <p className="text-gray-400 text-xs mt-1">Crea, edita o retira artículos y beneficios canjeables por puntos.</p>
          </div>
          <Button onClick={openCreateModal} variant="premium" className="rounded-xl px-5 py-5 text-xs font-bold gap-2">
            <Plus size={16} /> Crear Recompensa
          </Button>
        </div>

        {/* Listado Grid */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          </div>
        ) : rewards.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No hay recompensas registradas en el catálogo. Comienza creando una nueva.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <motion.div
                key={reward.id}
                layout
                className={`glass-card rounded-3xl p-6 text-left border flex flex-col justify-between h-64 ${
                  !reward.is_active ? "border-red-500/20 opacity-75" : "border-white/10"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">🎁</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${
                          reward.is_active
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {reward.is_active ? "Activo" : "Inactivo"}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                        {reward.points_cost} pts
                      </span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-base text-white truncate mt-2">{reward.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-3 mt-1.5 leading-relaxed">{reward.description}</p>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-4">
                  <div className="text-xs text-gray-500">
                    Stock:{" "}
                    <span className={reward.stock === null ? "text-gray-400 font-semibold" : reward.stock > 0 ? "text-white font-bold" : "text-red-400 font-bold"}>
                      {reward.stock === null ? "Ilimitado" : `${reward.stock} uds`}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      onClick={() => openEditModal(reward)}
                      variant="outline"
                      size="sm"
                      className="border-white/10 hover:bg-white/5 h-8 w-8 p-0 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 size={12} className="text-primary" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(reward.id)}
                      variant="outline"
                      size="sm"
                      className="border-white/10 hover:bg-white/5 h-8 w-8 p-0 rounded-lg border-red-500/20"
                      title="Eliminar"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MODAL CREAR / EDITAR */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                onClick={() => setModalOpen(false)}
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 text-left overflow-hidden"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Gift size={18} className="text-primary" />
                    <span>{editingReward ? "Modificar Recompensa" : "Nueva Recompensa"}</span>
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Título */}
                  <div className="space-y-1.5">
                    <label htmlFor="modalTitle" className="text-xs text-gray-400 font-semibold">Título del Premio</label>
                    <input
                      type="text"
                      id="modalTitle"
                      required
                      placeholder="Ej. Playera Oficial, Taza, Descuento..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1.5">
                    <label htmlFor="modalDesc" className="text-xs text-gray-400 font-semibold">Descripción</label>
                    <textarea
                      id="modalDesc"
                      required
                      rows={3}
                      placeholder="Detalles sobre el premio y cómo reclamarlo..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Costo Puntos */}
                  <div className="space-y-1.5">
                    <label htmlFor="modalPoints" className="text-xs text-gray-400 font-semibold">Costo en Puntos</label>
                    <input
                      type="number"
                      id="modalPoints"
                      min="1"
                      required
                      value={pointsCost}
                      onChange={(e) => setPointsCost(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="modalHasStock"
                        checked={hasStock}
                        onChange={(e) => setHasStock(e.target.checked)}
                        className="rounded border-white/10 text-primary focus:ring-primary bg-black/60 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="modalHasStock" className="text-xs text-gray-400 font-semibold cursor-pointer">
                        Limitar Stock (Inventario de Piezas)
                      </label>
                    </div>

                    {hasStock && (
                      <div className="space-y-1.5 animate-fadeIn">
                        <label htmlFor="modalStock" className="text-xs text-gray-400 font-semibold">Piezas Disponibles</label>
                        <input
                          type="number"
                          id="modalStock"
                          min="0"
                          required
                          value={stockValue}
                          onChange={(e) => setStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  {/* Activo / Inactivo */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="modalIsActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-white/10 text-primary focus:ring-primary bg-black/60 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="modalIsActive" className="text-xs text-gray-400 font-semibold cursor-pointer">
                      Premio Activo (Visible en Catálogo de Alumnos)
                    </label>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <Button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      variant="outline"
                      disabled={submitting}
                      className="rounded-xl border-white/10 hover:bg-white/5"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      variant="premium"
                      className="rounded-xl"
                    >
                      {submitting ? "Guardando..." : "Guardar Recompensa"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
