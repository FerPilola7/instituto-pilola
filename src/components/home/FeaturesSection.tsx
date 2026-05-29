"use client";

import { motion } from "framer-motion";
import { Award, QrCode, Sparkles, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <QrCode className="w-8 h-8 text-primary" />,
    title: "Credencial Digital",
    description: "Tu identidad como artista en tu bolsillo. Accede a las instalaciones con tu QR único.",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
    title: "Sube de Nivel",
    description: "Desde Bronce hasta Platino. Tu constancia te hace subir de nivel y obtener estatus.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: "Puntos por Mensualidad",
    description: "Cada mes que inviertes en tu talento te recompensa con puntos automáticos.",
  },
  {
    icon: <Award className="w-8 h-8 text-primary" />,
    title: "Canjea Beneficios",
    description: "Usa tus puntos para masterclasses, mercancía oficial y descuentos exclusivos.",
  },
];

export function FeaturesSection() {
  return (
    <section id="beneficios" className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Más que una <span className="text-primary">escuela</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Nuestra plataforma te premia por tu constancia y dedicación al arte.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-3xl p-8 flex flex-col items-start gap-4"
            >
              <div className="p-3 bg-primary/10 rounded-2xl">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
