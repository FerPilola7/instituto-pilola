"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LEVELS, type LevelKey } from "@/types";
import { Download, Share2, Copy, Check, Award, Eye } from "lucide-react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import Image from "next/image";

export default function WalletPage() {
  const { profile } = useProfile();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!profile?.member_id) return;

    // Generar el código QR con el member_id del usuario
    QRCode.toDataURL(
      profile.member_id,
      {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (err, url) => {
        if (err) {
          console.error("Error generating QR:", err);
          return;
        }
        setQrCodeUrl(url);
      }
    );
  }, [profile?.member_id]);

  const handleCopyId = () => {
    if (!profile?.member_id) return;
    navigator.clipboard.writeText(profile.member_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!profile) return;
    const shareData = {
      title: "Mi Credencial Pilola",
      text: `Mi matrícula del Instituto de Artes Pilola es: ${profile.member_id}`,
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopyId();
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !profile) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `QR-Pilola-${profile.member_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Obtener estilos del nivel
  const getLevelStyles = (level: LevelKey) => {
    switch (level) {
      case "platino":
        return {
          bg: "from-slate-300 via-slate-100 to-zinc-400 text-black",
          badgeBg: "bg-black/10 text-black border-black/25",
          glassText: "text-zinc-900",
          accentColor: "#E5E4E2",
          shadowGlow: "shadow-[0_0_40px_rgba(229,228,226,0.35)]",
        };
      case "oro":
        return {
          bg: "from-amber-600 via-yellow-400 to-amber-500 text-black",
          badgeBg: "bg-black/10 text-black border-black/25",
          glassText: "text-amber-950",
          accentColor: "#FFD700",
          shadowGlow: "shadow-[0_0_40px_rgba(255,215,0,0.35)]",
        };
      case "plata":
        return {
          bg: "from-zinc-500 via-slate-300 to-zinc-400 text-black",
          badgeBg: "bg-black/10 text-black border-black/25",
          glassText: "text-zinc-900",
          accentColor: "#C0C0C0",
          shadowGlow: "shadow-[0_0_40px_rgba(192,192,192,0.3)]",
        };
      default: // bronce
        return {
          bg: "from-amber-800 via-amber-700 to-orange-950 text-white",
          badgeBg: "bg-white/10 text-white border-white/20",
          glassText: "text-amber-100",
          accentColor: "#CD7F32",
          shadowGlow: "shadow-[0_0_40px_rgba(205,127,50,0.25)]",
        };
    }
  };

  const levelInfo = profile?.level ? getLevelStyles(profile.level as LevelKey) : getLevelStyles("bronce");

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-8 py-4">
        {/* Contenedor de la Credencial Interactiva (Flipped Card) */}
        <div className="perspective-1000 h-[520px] w-full">
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full relative preserve-3d cursor-pointer"
            onClick={() => setFlipped(!flipped)}
          >
            {/* VISTA FRONTAL (Front Side) */}
            <div
              className={`absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6 bg-gradient-to-br ${levelInfo.bg} ${levelInfo.shadowGlow} border border-white/20 flex flex-col justify-between`}
            >
              {/* Header de la tarjeta */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-black/20 bg-black/10">
                    <Image
                      src="/images/logo.jpeg"
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-sm tracking-wider block">PILOLA</span>
                    <span className="text-[8px] uppercase tracking-widest block font-bold opacity-75">
                      Instituto de Artes
                    </span>
                  </div>
                </div>
                
                <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${levelInfo.badgeBg}`}>
                  {profile?.level}
                </span>
              </div>

              {/* Centro: Código QR Principal */}
              <div className="flex flex-col items-center justify-center my-4 bg-white p-4 rounded-2xl w-48 h-48 mx-auto shadow-inner border border-black/5">
                {qrCodeUrl ? (
                  <Image
                    src={qrCodeUrl}
                    alt="Código QR del Alumno"
                    width={180}
                    height={180}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Footer de la tarjeta */}
              <div className="space-y-4">
                <div className="flex justify-between items-end border-t border-black/10 pt-4">
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-wider block opacity-70 font-semibold">Alumno</span>
                    <span className="font-extrabold text-base block truncate max-w-[200px]">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider block opacity-70 font-semibold">Matrícula</span>
                    <span className="font-mono font-bold text-sm block tracking-wider">
                      {profile?.member_id}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] opacity-70 font-medium">
                  <span className="flex items-center gap-1">
                    <Award size={12} /> {profile?.points} Puntos
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> Toca para voltear
                  </span>
                </div>
              </div>
            </div>

            {/* VISTA TRASERA (Back Side) */}
            <div
              className={`absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6 bg-[#0a0a0a] text-white border border-white/10 flex flex-col justify-between [transform:rotateY(180deg)]`}
            >
              {/* Header trasero */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <Image
                      src="/images/logo.jpeg"
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-sm text-white tracking-wider block">PILOLA</span>
                    <span className="text-[8px] text-primary tracking-widest block uppercase font-medium">
                      Membresía Oficial
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-gray-500 font-mono">
                  {profile?.id.substring(0, 8)}
                </span>
              </div>

              {/* Contenido trasero */}
              <div className="flex-1 py-6 space-y-4 text-left">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Términos del Alumno</p>
                  <ul className="text-xs text-gray-400 list-disc list-inside space-y-1.5 leading-relaxed">
                    <li>Esta credencial es personal e intransferible.</li>
                    <li>Cada mensualidad pagada otorga 100 puntos.</li>
                    <li>Los puntos acumulados se pueden canjear en el catálogo de beneficios de la app.</li>
                    <li>Presenta el código QR en la entrada o al personal para registrar tus pagos.</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Miembro desde</p>
                  <p className="text-sm font-medium text-white">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Reciente"}
                  </p>
                </div>
              </div>

              {/* Footer trasero */}
              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs text-gray-500">
                <span>Versión PWA v1.0</span>
                <span className="flex items-center gap-1 text-primary">
                  <Eye size={12} /> Volver al frente
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={handleDownloadQR}
            variant="outline"
            className="flex-col gap-2 h-20 rounded-2xl border-white/10 hover:bg-white/5 text-xs text-gray-300 font-medium"
          >
            <Download size={18} className="text-primary" />
            <span>Guardar QR</span>
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-col gap-2 h-20 rounded-2xl border-white/10 hover:bg-white/5 text-xs text-gray-300 font-medium"
          >
            <Share2 size={18} className="text-primary" />
            <span>Compartir ID</span>
          </Button>

          <Button
            onClick={handleCopyId}
            variant="outline"
            className="flex-col gap-2 h-20 rounded-2xl border-white/10 hover:bg-white/5 text-xs text-gray-300 font-medium"
          >
            {copied ? (
              <>
                <Check size={18} className="text-primary animate-bounce" />
                <span className="text-primary font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={18} className="text-primary" />
                <span>Copiar ID</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
