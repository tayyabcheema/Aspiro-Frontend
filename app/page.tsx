"use client";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { NeuroButton } from "@/components/ui/neuro-button";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import {
  ArrowRight,
  Brain,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";

const features = [
  {
    icon: Brain,
    title: "AI Career Roadmap",
    description:
      "Get personalized career paths powered by AI analysis of your skills, goals, and market trends.",
  },
  {
    icon: FileText,
    title: "CV Collection & Analysis",
    description:
      "Provide your CV information through our intelligent questionnaire for personalized career insights.",
  },
  {
    icon: BarChart3,
    title: "Progress Dashboard",
    description:
      "Track your learning progress, skill development, and career milestones in one comprehensive view.",
  },
  {
    icon: Settings,
    title: "Admin Panel",
    description:
      "Comprehensive management tools for courses, users, and platform analytics.",
  },
];

const howItWorksSteps: TimelineItem[] = [
  {
    id: "1",
    title: "Complete Your Profile",
    description:
      "Answer our intelligent questionnaire about your skills, experience, and career aspirations.",
    status: "completed",
    date: "Step 1",
  },
  {
    id: "2",
    title: "Provide CV Information",
    description:
      "Our AI analyzes your CV information to understand your current position and identify growth opportunities.",
    status: "current",
    date: "Step 2",
  },
  {
    id: "3",
    title: "Get Your Roadmap",
    description:
      "Receive a personalized Aspiro with specific skills, courses, and milestones to achieve your goals.",
    status: "upcoming",
    date: "Step 3",
  },
  {
    id: "4",
    title: "Track Progress",
    description:
      "Monitor your advancement through interactive dashboards and receive ongoing AI-powered recommendations.",
    status: "upcoming",
    date: "Step 4",
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect authenticated users based on their progress
  const hasOnboarded = user.hasCompletedOnboarding || !!localStorage.getItem("onboardingData") || !!sessionStorage.getItem("onboardingData");
  router.push(hasOnboarded ? "/dashboard" : "/onboarding");
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Don't show landing page if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-foreground/80">
                Powered by Advanced AI Technology
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Navigate Your
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}
                AI Career{" "}
              </span>
              Path
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground text-pretty sm:text-xl">
              Discover your personalized AI career roadmap with expert guidance,
              skill assessments, and curated learning paths. Transform your
              career with intelligent insights and actionable recommendations.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <NeuroButton size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </NeuroButton>
              </Link>
              <Link href="/login">
                <NeuroButton variant="glass" size="lg">
                  Login
                </NeuroButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl mb-4">
              Powerful Features for Your Success
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
              Everything you need to accelerate your AI career journey, powered
              by cutting-edge technology.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <GlassCard
                key={index}
                className="group hover:scale-105 transition-smooth neuro"
              >
                <GlassCardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <GlassCardTitle className="text-xl">
                    {feature.title}
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <GlassCardDescription className="text-center">
                    {feature.description}
                  </GlassCardDescription>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
              Follow our simple 4-step process to unlock your AI career
              potential and achieve your professional goals.
            </p>
          </div>

          <Timeline items={howItWorksSteps} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <GlassCard variant="strong" className="text-center neuro">
            <GlassCardHeader>
              <GlassCardTitle className="text-3xl sm:text-4xl mb-4">
                Ready to Transform Your Career?
              </GlassCardTitle>
              <GlassCardDescription className="text-lg">
                Join thousands of professionals who have accelerated their AI
                careers with our platform.
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/register">
                  <NeuroButton size="lg" className="group">
                    Start Your Journey
                    <Zap className="ml-2 h-4 w-4" />
                  </NeuroButton>
                </Link>

                {/* <NeuroButton variant="outline" size="lg">
                  Learn More
                </NeuroButton> */}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Aspiro</span>
              </div>
              <p className="text-muted-foreground text-pretty max-w-md">
                Empowering professionals to navigate and excel in the rapidly
                evolving world of artificial intelligence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition-smooth"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-smooth"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-foreground transition-smooth"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-smooth"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-smooth"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-foreground transition-smooth"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Aspiro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
