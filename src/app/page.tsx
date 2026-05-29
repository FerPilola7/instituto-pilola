import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { ClassesSection } from "@/components/home/ClassesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ClassesSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
