"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Reward, RewardRedemption } from "@/types";
import { redeemRewardAction } from "./actions";
import { motion, AnimatePresence } from "framer-motion";
import { Award, CheckCircle2, AlertCircle, ShoppingBag, Gift, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function PromocionesPage() {
  const { profile, setProfile } = useProfile();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [activeTab, setActiveTab] = useState<"catalog" | "my-claims">("catalog");
  const [loading, setLoading] = useState(true);

  // Estados para canjes
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCatalogAndRedemptions = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      // Obtener catálogo de recompensas
      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_cost", { ascending: true });

      // Obtener mis canjes realizados
      const { data: redemptionsData } = await supabase
        .from("reward_redemptions")
        .select("*, reward:rewards(*)")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (rewardsData) setRewards(rewardsData);
      if (redemptionsData) setRedemptions(redemptionsData as any);
    } catch (err) {
      console.error("Error loading rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchCatalogAndRedemptions();
    }
  }, [profile?.id]);

  const handleRedeem = async () => {
    if (!selectedReward || !profile) return;
    try {
      setRedeeming(true);
      setRedeemError(null);
      
      const result = await redeemRewardAction(selectedReward.id);
      
      if (result.success) {
        setRedeemSuccess(true);
        // Actualizar puntos del alumno localmente
        if (setProfile && result.newPoints !== undefined) {
          setProfile({
            ...profile,
            points: result.newPoints
          });
        }
        // Recargar datos
        await fetchCatalogAndRedemptions();
      } else {
        setRedeemError(result.error || "Ocurrió un error al canjear.");
      }
    } catch (err) {
      setRedeemError("Error al procesar la solicitud.");
    } finally {
      setRedeeming(false);
    }
  };

  const closeModals = () => {
    setSelectedReward(null);
    setRedeemSuccess(false);
    setRedeemError(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Encabezado con balance de puntos */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-secondary/20 p-6 rounded-3xl border border-primary/20">
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Catálogo de Recompensas</h2>
            <p className="text-gray-400 text-sm">Usa tus puntos acumulados para canjear regalos oficiales o descuentos.</p>
          </div>
          <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/5 self-stretch md:self-auto justify-between">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Tus Puntos</span>
            <div className="flex items-center gap-1.5 ml-4">
              <span className="text-2xl font-black text-primary font-mono">{profile?.points}</span>
              <span className="text-[10px] text-primary font-bold">PTS</span>
            </div>
          </div>
        </div>

        {/* Selector de pestañas */}
        <div className="flex border-b border-white/5 gap-6">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === "catalog"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            Beneficios Disponibles
          </button>
          <button
            onClick={() => setActiveTab("my-claims")}
            className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === "my-claims"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            Mis Canjes
          </button>
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          </div>
        ) : activeTab === "catalog" ? (
          rewards.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No hay promociones activas en este momento. Vuelve pronto.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => {
                const canAfford = (profile?.points ?? 0) >= reward.points_cost;
                const isOutOfStock = reward.stock !== null && reward.stock <= 0;

                return (
                  <motion.div
                    key={reward.id}
                    layout
                    className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between"
                  >
                    {/* Imagen de la Recompensa */}
                    <div className="relative h-48 bg-gradient-to-br from-secondary/40 to-black flex items-center justify-center p-6 border-b border-white/5">
                      {reward.image_url ? (
                        <Image
                          src={reward.image_url}
                          alt={reward.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-primary/40 gap-2">
                          <Gift size={48} className="animate-pulse" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-primary/30">Pilola Reward</span>
                        </div>
                      )}

                      {/* Badge de puntos flotante */}
                      <span className="absolute top-4 right-4 bg-primary text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-[0_0_15px_rgba(55,216,76,0.3)]">
                        {reward.points_cost} PTS
                      </span>
                    </div>

                    {/* Detalles */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2 text-left">
                        <h4 className="font-extrabold text-base text-white">{reward.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{reward.description}</p>
                      </div>

                      <div className="pt-2">
                        {/* Indicador de stock */}
                        {reward.stock !== null && (
                          <div className="flex justify-between items-center text-[10px] text-gray-500 mb-3">
                            <span>Disponibles:</span>
                            <span className={reward.stock > 0 ? "text-white font-medium" : "text-red-400 font-bold"}>
                              {reward.stock > 0 ? `${reward.stock} piezas` : "Agotado"}
                            </span>
                          </div>
                        )}

                        {isOutOfStock ? (
                          <Button disabled className="w-full bg-red-950/20 text-red-400 border border-red-500/10 rounded-xl py-5">
                            Agotado
                          </Button>
                        ) : !canAfford ? (
                          <Button disabled className="w-full bg-white/5 text-gray-500 border border-white/5 rounded-xl py-5 text-xs">
                            Te faltan {reward.points_cost - (profile?.points ?? 0)} pts
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setSelectedReward(reward)}
                            variant="premium"
                            className="w-full rounded-xl py-5 text-xs justify-between"
                          >
                            <span>Canjear Beneficio</span>
                            <ArrowRight size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        ) : redemptions.length === 0 ? (
          <div className="py-24 text-center text-gray-500 text-sm">
            <ShoppingBag className="mx-auto mb-2 text-gray-600 animate-bounce" size={32} />
            No has realizado ningún canje todavía.
          </div>
        ) : (
          <div className="glass-card rounded-3xl overflow-hidden divide-y divide-white/5">
            {redemptions.map((redemption) => (
              <div key={redemption.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/[0.01] transition-colors">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 rounded-2xl bg-secondary/30 text-primary border border-primary/20">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">{redemption.reward?.title || "Recompensa"}</h5>
                    <p className="text-[10px] text-gray-500">
                      Canjeado el:{" "}
                      {new Date(redemption.created_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-400">Costo</p>
                    <p className="font-mono font-bold text-sm text-primary">-{redemption.points_spent} pts</p>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full ${
                      redemption.status === "entregado"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : redemption.status === "cancelado"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                    }`}
                  >
                    {redemption.status === "pendiente" && "Pendiente"}
                    {redemption.status === "entregado" && "Entregado"}
                    {redemption.status === "cancelado" && "Cancelado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DE CONFIRMACIÓN */}
        <AnimatePresence>
          {selectedReward && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={closeModals}
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 overflow-hidden shadow-2xl text-center z-10"
              >
                {!redeemSuccess ? (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                      <Gift size={28} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-extrabold text-white">¿Confirmar Canje?</h4>
                      <p className="text-xs text-gray-400">
                        Estás a punto de canjear <span className="text-white font-semibold">"{selectedReward.title}"</span> por{" "}
                        <span className="text-primary font-bold font-mono">{selectedReward.points_cost} puntos</span>.
                      </p>
                    </div>

                    {redeemError && (
                      <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-left">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{redeemError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        onClick={closeModals}
                        variant="outline"
                        disabled={redeeming}
                        className="rounded-xl border-white/10 hover:bg-white/5"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleRedeem}
                        disabled={redeeming}
                        variant="premium"
                        className="rounded-xl"
                      >
                        {redeeming ? "Canjeando..." : "Confirmar"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 py-4">
                    <div className="w-16 h-16 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-extrabold text-white">¡Canje Completado!</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Tu solicitud de canje para <span className="text-white font-semibold">"{selectedReward.title}"</span> ha sido registrada exitosamente.
                      </p>
                      <div className="mt-4 p-3 bg-primary/10 rounded-2xl border border-primary/20 inline-block">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Estado del premio</p>
                        <p className="text-xs text-white font-bold mt-0.5">Pendiente de entrega</p>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2">
                        Acércate con el administrador para escanear tu QR y recoger tu premio.
                      </p>
                    </div>

                    <Button onClick={closeModals} variant="premium" className="w-full rounded-xl mt-4">
                      Listo
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
