"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/constants";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section id="testimonios" className="py-24 relative z-10 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Nuestra <span className="text-primary">Comunidad</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Historias de éxito de artistas que transformaron su pasión en talento con nosotros.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 rounded-3xl relative"
            >
              <div className="flex text-primary mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-current" />
                ))}
              </div>
              
              <p className="text-lg text-gray-200 mb-8 italic relative z-10">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-bold text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-primary">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
