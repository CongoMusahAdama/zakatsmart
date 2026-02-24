import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import Partners from "@/components/sections/Partners";
import ProblemSolution from "@/components/sections/ProblemSolution";
import FeaturesGrid from "@/components/sections/Features";
import DashboardShowcase from "@/components/sections/DashboardShowcase";
import HowItWorks from "@/components/sections/Causes";
import FAQ from "@/components/sections/FAQ";

export default function Home() {
  return (
    <main>
      <Hero />
      <Intro />
      <Partners />
      <ProblemSolution />
      <FeaturesGrid />
      <DashboardShowcase />
      <HowItWorks />
      <FAQ />
    </main>
  );
}
