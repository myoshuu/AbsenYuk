import dynamic from "next/dynamic";
import PublicNavbar from "@/components/layout/PublicNavbar";
import HeroSection from "@/components/public/HeroSection";
import FeatureHighlight from "@/components/public/FeatureHighlight";
import FAQAccordion from "@/components/public/FAQAccordion";
import CTABanner from "@/components/public/CTABanner";

const StatsBar = dynamic(() => import("@/components/public/StatsBar"));
const AnimatedDemo = dynamic(() => import("@/components/public/AnimatedDemo"));

export default function HomePage() {
  return (
    <>
      <PublicNavbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FeatureHighlight />
        <AnimatedDemo />
        <FAQAccordion />
        <CTABanner />
      </main>
      <footer className="text-center text-sm text-ink-muted py-8 border-t border-border">
        <p>&copy; {new Date().getFullYear()} AbsenYuk. Seluruh hak cipta dilindungi.</p>
      </footer>
    </>
  );
}
