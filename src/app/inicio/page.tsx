"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LEVELS, type PointsHistory, type LevelKey } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { QrCode, Gift, ChevronRight, Award, Plus, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function InicioPage() {
  const { profile } = useProfile();
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const profileId = profile?.id;
    if (!profileId) return;

    async function fetchPointsHistory() {
      try {
        const { data, error } = await supabase
          .from("points_history")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        if (data) setHistory(data);
      } catch (err) {
        console.error("Error fetching points history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchPointsHistory();
  }, [profile?.id, supabase]);

  // Calcular barra de progreso
  const getProgressDetails = () => {
    if (!profile) return { pct: 0, nextLevelLabel: "", pointsNeeded: 0 };
    const currentPoints = profile.points;
    const currentLevel = profile.level as LevelKey;
    const levelInfo = LEVELS[currentLevel];

    if (!levelInfo || !levelInfo.next) {
      return { pct: 100, nextLevelLabel: "Máximo Nivel", pointsNeeded: 0 };
    }

    const nextLevelKey = levelInfo.next as LevelKey;
    const nextLevelInfo = LEVELS[nextLevelKey];
    
    // El progreso se mide desde el mínimo del nivel actual hasta el mínimo del siguiente nivel
    const minRange = levelInfo.min;
    const maxRange = nextLevelInfo.min; // Los puntos requeridos para el siguiente nivel
    
    const range = maxRange - minRange;
    const currentProgress = currentPoints - minRange;
    const pct = Math.min(100, Math.max(0, (currentProgress / range) * 100));
    const pointsNeeded = maxRange - currentPoints;

    return {
      pct,
      nextLevelLabel: nextLevelInfo.label,
      pointsNeeded,
    };
  };

  const { pct, nextLevelLabel, pointsNeeded } = getProgressDetails();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Banner de Bienvenida */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-gradient-to-r from-secondary/80 to-emerald-950/20 border border-primary/20 shadow-[0_0_30px_rgba(55,216,76,0.05)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="max-w-xl">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {profile?.level === "bronce" && "Estrella de Bronce"}
              {profile?.level === "plata" && "Artista de Plata"}
              {profile?.level === "oro" && "Maestro de Oro"}
              {profile?.level === "platino" && "Leyenda de Platino"}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3 mb-2">
              ¡Hola, {profile?.first_name}! 👋
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Es grandioso verte hoy. Sigue asistiendo a tus clases de arte, acumula puntos con tus mensualidades y canjea increíbles recompensas.
            </p>
          </div>
        </motion.div>

        {/* Sección de Tarjetas Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card de Puntos */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm font-medium">Puntos Acumulados</span>
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Award size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-extrabold text-white tracking-tight">{profile?.points}</span>
                <span className="text-primary font-bold text-sm">pts</span>
              </div>
              <p className="text-xs text-gray-500">
                Nivel actual: <span className="text-white font-semibold uppercase">{profile?.level}</span>
              </p>
            </div>

            {/* Barra de progreso */}
            {pointsNeeded > 0 && (
              <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Progreso a {nextLevelLabel}</span>
                  <span className="text-primary font-bold">{Math.round(pct)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  Faltan <span className="text-primary font-bold">{pointsNeeded}</span> puntos para subir de nivel.
                </p>
              </div>
            )}
          </motion.div>

          {/* Card Credencial Digital Rápida */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Gradiente de fondo de tarjeta */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0F3B19]/40 via-transparent to-transparent -z-10" />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm font-medium">Credencial Digital</span>
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <QrCode size={18} />
                </div>
              </div>

              {/* Miniprevisualización de ID */}
              <div className="py-2">
                <p className="text-xs text-gray-400 mb-0.5">Matrícula de Alumno</p>
                <p className="text-xl font-mono text-white tracking-widest font-bold">{profile?.member_id}</p>
                <p className="text-[11px] text-gray-500 mt-1">Presenta tu código QR en el instituto para registrar asistencias, mensualidades y sumar puntos.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <Link href="/wallet" className="w-full">
                <Button variant="premium" className="w-full justify-between rounded-xl py-5 text-sm">
                  <span>Ver Código QR</span>
                  <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Catálogo y Promociones Rápidas */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm font-medium">Beneficios Disponibles</span>
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Gift size={18} />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs text-white font-medium">Playera Oficial Pilola</p>
                    <p className="text-[10px] text-gray-500">Playera de edición limitada</p>
                  </div>
                  <span className="text-xs text-primary font-bold">500 pts</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs text-white font-medium">Clase Adicional Gratis</p>
                    <p className="text-[10px] text-gray-500">Clase libre en cualquier taller</p>
                  </div>
                  <span className="text-xs text-primary font-bold">300 pts</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <Link href="/promociones" className="w-full">
                <Button variant="outline" className="w-full justify-between border-white/10 hover:bg-white/5 rounded-xl py-5 text-sm">
                  <span>Ver todas las promociones</span>
                  <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Historial de Puntos */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-3xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-6">Historial Reciente</h3>
          
          {loadingHistory ? (
            <div className="py-8 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              <Calendar className="mx-auto mb-2 text-gray-600" size={32} />
              Aún no tienes registros de puntos. Tus mensualidades pagadas aparecerán aquí.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {history.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      item.type === "earned" ? "bg-primary/10 text-primary border border-primary/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {item.type === "earned" ? <Plus size={16} /> : <MinusIcon />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{item.concept}</p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(item.created_at).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-sm">
                    {item.type === "earned" ? (
                      <span className="text-primary flex items-center gap-0.5"><ArrowUpRight size={14} /> +{item.points}</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-0.5"><ArrowDownRight size={14} /> -{item.points}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

// Mini componente para el ícono de restar puntos
function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
