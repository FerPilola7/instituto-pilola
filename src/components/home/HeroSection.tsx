"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-premium z-0" />
      
      {/* Animated glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] opacity-50 mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] opacity-50 mix-blend-screen" style={{ animationDelay: '2s', animationDuration: '4s' }} />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-emerald-300 font-medium mb-4"
          >
            <Sparkles size={16} />
            <span>El arte llevado al siguiente nivel</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.1]">
            Despierta tu <br />
            <span className="text-gradient">Talento Artístico</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Únete a la comunidad de artistas más exclusiva. Acumula puntos, canjea beneficios premium y domina la música, pintura, danza y teatro.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link href="/registro" className="w-full sm:w-auto">
              <Button variant="premium" size="xl" className="w-full sm:w-auto group">
                Comenzar mi viaje
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="xl" className="w-full sm:w-auto glass-panel border-white/10 hover:bg-white/5 text-white">
                Ya soy alumno
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative bottom element */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
