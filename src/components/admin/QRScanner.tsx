"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  active: boolean;
}

export function QRScanner({ onScanSuccess, active }: QRScannerProps) {
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const readerId = "qr-reader-container";

  useEffect(() => {
    if (!active) {
      cleanupScanner();
      return;
    }

    const startScanner = async () => {
      try {
        setPermissionError(null);
        // Esperar a que el elemento DOM esté disponible
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const html5QrCode = new Html5Qrcode(readerId);
        qrRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            },
          },
          (decodedText) => {
            // Detener el escáner al escanear con éxito
            onScanSuccess(decodedText);
            cleanupScanner();
          },
          () => {
            // Ignorar errores detallados de escaneo (ruido de imagen)
          }
        );
        setScannerStarted(true);
      } catch (err: any) {
        console.error("Camera start error:", err);
        setPermissionError(
          "No se pudo acceder a la cámara. Asegúrate de otorgar permisos de cámara en tu navegador."
        );
      }
    };

    startScanner();

    return () => {
      cleanupScanner();
    };
  }, [active]);

  const cleanupScanner = () => {
    if (qrRef.current) {
      if (qrRef.current.isScanning) {
        qrRef.current
          .stop()
          .then(() => {
            qrRef.current = null;
            setScannerStarted(false);
          })
          .catch((err) => console.log("Error stopping scanner:", err));
      } else {
        qrRef.current = null;
        setScannerStarted(false);
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      <div className="relative aspect-square w-full max-w-[320px] mx-auto overflow-hidden rounded-3xl border border-white/10 bg-black/60 flex items-center justify-center">
        {/* Lector QR de html5-qrcode */}
        <div id={readerId} className="w-full h-full object-cover" />

        {/* Línea de escaneo animada tipo láser */}
        {scannerStarted && (
          <div className="absolute inset-x-8 top-0 h-0.5 bg-primary shadow-[0_0_15px_#37D84C] animate-scan-line z-10 pointer-events-none" />
        )}

        {/* Capa de permiso denegado o error */}
        {permissionError && (
          <div className="absolute inset-0 bg-[#0c0c0c]/90 flex flex-col items-center justify-center p-6 text-center z-20">
            <AlertCircle className="text-red-500 mb-3" size={36} />
            <p className="text-xs text-red-400 font-semibold mb-4 leading-relaxed">
              {permissionError}
            </p>
            <Button
              onClick={() => {
                cleanupScanner();
                // Forzar reintento
                onScanSuccess(""); 
              }}
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5 rounded-xl text-xs gap-1.5"
            >
              <RefreshCw size={12} /> Reintentar Permisos
            </Button>
          </div>
        )}

        {/* Capa de carga inicial */}
        {!scannerStarted && !permissionError && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10">
            <Camera className="text-primary/40 animate-pulse mb-2" size={32} />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              Encendiendo cámara...
            </span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-500 text-center leading-relaxed max-w-xs mx-auto">
        Apunta la cámara trasera del dispositivo hacia el código QR de la credencial del alumno para escanearlo automáticamente.
      </p>
    </div>
  );
}
