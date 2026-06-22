import PublicNavbar from "@/components/layout/PublicNavbar";
import MissionHero from "@/components/public/MissionHero";
import StatsBar from "@/components/public/StatsBar";
import TechStack from "@/components/public/TechStack";
import TeamSection from "@/components/public/TeamSection";

export default function TentangPage() {
  return (
    <>
      <PublicNavbar />
      <main>
        <MissionHero />
        <StatsBar />
        <TeamSection />
        <TechStack />
      </main>
      <footer className="text-center text-sm text-ink-muted py-8 border-t border-border">
        <p>&copy; {new Date().getFullYear()} AbsenYuk. Seluruh hak cipta dilindungi.</p>
      </footer>
    </>
  );
}
