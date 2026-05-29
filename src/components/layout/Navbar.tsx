"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div
          className={`flex items-center justify-between rounded-full transition-all duration-300 ${
            scrolled
              ? "glass-panel px-6 py-2 shadow-lg"
              : "bg-transparent px-4 py-2"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(55,216,76,0.2)]">
              <Image
                src="/images/logo.jpeg"
                alt="Instituto de Artes Pilola"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight hidden sm:block">
              PILOLA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#beneficios" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Beneficios
            </Link>
            <Link href="#clases" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Clases
            </Link>
            <Link href="#testimonios" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Testimonios
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-white">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button variant="premium" className="rounded-full">
                Unirse Ahora
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 md:hidden"
          >
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 shadow-2xl border border-primary/20">
              <Link
                href="#beneficios"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                Beneficios
              </Link>
              <Link
                href="#clases"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                Clases
              </Link>
              <Link
                href="#testimonios"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                Testimonios
              </Link>
              <div className="h-px bg-border my-2" />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-lg h-12">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/registro" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="premium" className="w-full text-lg h-12 rounded-xl">
                  Unirse Ahora
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
