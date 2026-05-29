import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black pt-16 pb-8 z-10 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-[100%] blur-[80px] -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block font-bold text-2xl tracking-tight mb-4">
              {APP_NAME}
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              Transformando el talento en arte. Un espacio dedicado al crecimiento artístico integral con beneficios exclusivos.
            </p>
            <div className="flex gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-white">Enlaces</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link href="#beneficios" className="hover:text-primary transition-colors">Beneficios</Link></li>
              <li><Link href="#clases" className="hover:text-primary transition-colors">Clases</Link></li>
              <li><Link href="#testimonios" className="hover:text-primary transition-colors">Testimonios</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Portal de Alumnos</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-white">Contacto</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>lu.soporte.studio@gmail.com</li>
              <li>+52 (55) 1234-5678</li>
              <li>Av. del Arte 123, Ciudad</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
