import { FloatingCTA } from '@/components/landing/ConversionElements';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';
import HeroSection from '@/components/landing/HeroSection';
import { LazyDemoSection, LazyPricingSection, LazyTestimonialsSection } from '@/components/landing/LazySection';
import ProblemSection from '@/components/landing/ProblemSection';
import StructuredData from '@/components/landing/StructuredData';
import TransparencySection from '@/components/landing/TransparencySection';

export default async function HomePage() {
  return (
    <>
      <StructuredData />
      <main className="min-h-screen">
        <HeroSection />
        <ProblemSection />
        <LazyDemoSection />
        <LazyPricingSection />
        <LazyTestimonialsSection />
        <TransparencySection />
        <CTASection />
        <FooterSection />
        <FloatingCTA />
      </main>
    </>
  );
}
