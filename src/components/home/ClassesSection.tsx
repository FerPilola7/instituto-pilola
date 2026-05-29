"use client";

import { motion } from "framer-motion";
import { CLASSES } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ClassesSection() {
  return (
    <section id="clases" className="py-24 relative z-10 bg-black/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-4"
            >
              Nuestras <span className="text-primary">Disciplinas</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg"
            >
              Aprende de los mejores profesionales en instalaciones de primer nivel.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/registro" className="text-primary hover:text-white transition-colors flex items-center gap-2 font-medium">
              Ver horarios y precios
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLASSES.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-3xl aspect-square sm:aspect-auto sm:h-[400px]"
            >
              {/* Fallback gradient background if no image */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cls.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col justify-end h-full">
                <div className="text-4xl mb-4 transform group-hover:-translate-y-2 transition-transform duration-300">
                  {cls.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 transform group-hover:-translate-y-1 transition-transform duration-300">
                  {cls.title}
                </h3>
                <p className="text-gray-300 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {cls.description}
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* Join card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: CLASSES.length * 0.1 }}
            className="group relative overflow-hidden rounded-3xl aspect-square sm:aspect-auto sm:h-[400px] glass-panel border-primary/40 flex items-center justify-center text-center p-8 cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                ¿Listo para empezar?
              </h3>
              <p className="text-muted-foreground mb-6">
                Únete a la comunidad de artistas y descubre tu verdadero potencial.
              </p>
              <Link href="/registro" className="inline-flex items-center gap-2 text-primary font-bold hover:text-white transition-colors">
                Inscribirme ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
