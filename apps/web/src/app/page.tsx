"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem";
import { SolutionSection } from "@/components/landing/solution";
import { CoreFeatures } from "@/components/landing/core-features";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { BuiltForAcademia } from "@/components/landing/built-for-academia";
import { CTASection } from "@/components/landing/cta";
import { FooterSection } from "@/components/landing/footer";

export default function Home() {
	return (
		<main className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10">
			<Navbar />
			<HeroSection />
			<ProblemSection />
			<SolutionSection />
			<CoreFeatures />
			<HowItWorksSection />
			<BuiltForAcademia />
			<CTASection />
			<FooterSection />
		</main>
	);
}
