import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

import nnArchImg from "@/assets/nn-arch.jpg";
import siliconEdgeImg from "@/assets/silicon-edge.jpg";
import heroBgImg from "@/assets/hero-bg.jpg";
import instructor1Img from "@/assets/instructor-1.jpg";
import instructor2Img from "@/assets/instructor-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Certification Academy — Master the Intelligence Age" },
      { name: "description", content: "Deep-tier AI certifications for engineers moving from implementation to innovation. Join 12,000+ certified professionals worldwide." },
      { property: "og:title", content: "AI Certification Academy — Master the Intelligence Age" },
      { property: "og:description", content: "Deep-tier AI certifications for engineers moving from implementation to innovation." },
    ],
  }),
  component: Index,
});

function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-[Instrument_Sans,sans-serif] selection:bg-accent/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-accent rounded-full flex items-center justify-center">
            <div className="size-4 bg-background rounded-sm rotate-45" />
          </div>
          <span className="font-bold tracking-tight text-lg">ACA</span>
        </div>
        <button
          className="size-10 rounded-full bg-surface border border-input flex items-center justify-center lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          ) : (
            <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 5h12M2 8h12M2 11h8" />
            </svg>
          )}
        </button>
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Programs</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Faculty</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Alumni</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-widest hover:bg-primary/90 transition-colors">
            Apply Now
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20 px-6">
          <div className="flex flex-col gap-6">
            <Link to="/" className="text-lg font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Programs</Link>
            <Link to="/" className="text-lg font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Faculty</Link>
            <Link to="/" className="text-lg font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Alumni</Link>
            <Link to="/" className="text-lg font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <button className="mt-4 w-full py-3 bg-primary text-primary-foreground text-sm font-bold rounded-full uppercase tracking-widest">
              Apply Now
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative px-6 pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20">
          <img
            src={heroBgImg}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        <div className="max-w-xl mx-auto lg:max-w-4xl lg:text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <span className="size-1.5 rounded-full bg-accent animate-[pulse-glow_2s_ease-in-out_infinite]" />
            <span className="text-[10px] font-[JetBrains_Mono,monospace] font-medium text-accent uppercase tracking-wider">Enrolling Now: Fall 2025</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
            Architect the <span className="text-accent">Intelligence</span> Age.
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-[320px] lg:max-w-lg lg:mx-auto mb-8">
            Deep-tier certifications for engineers moving from implementation to innovation. Join the next cohort of AI leaders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 lg:justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-widest hover:bg-primary/90 transition-colors">
              View Certification Tracks
            </button>
            <button className="px-6 py-3 border border-input text-foreground text-xs font-bold rounded-full uppercase tracking-widest hover:bg-surface transition-colors">
              Download Prospectus
            </button>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="px-6 pb-12">
        <div className="max-w-xl mx-auto lg:max-w-4xl grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 lg:p-6 rounded-2xl bg-surface border border-border">
            <div className="text-2xl lg:text-3xl font-[JetBrains_Mono,monospace] font-bold">12k+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Certified</div>
          </div>
          <div className="p-4 lg:p-6 rounded-2xl bg-surface border border-border">
            <div className="text-2xl lg:text-3xl font-[JetBrains_Mono,monospace] font-bold text-accent">98%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Placement</div>
          </div>
          <div className="p-4 lg:p-6 rounded-2xl bg-surface border border-border">
            <div className="text-2xl lg:text-3xl font-[JetBrains_Mono,monospace] font-bold">4.9</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Rating</div>
          </div>
          <div className="p-4 lg:p-6 rounded-2xl bg-surface border border-border">
            <div className="text-2xl lg:text-3xl font-[JetBrains_Mono,monospace] font-bold">50+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Countries</div>
          </div>
        </div>
      </div>

      {/* Certification Tracks */}
      <section className="px-6 pb-16">
        <div className="max-w-xl mx-auto lg:max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-[JetBrains_Mono,monospace] font-medium uppercase tracking-[0.2em] text-muted-foreground">Active Tracks</h2>
            <span className="text-xs text-accent underline underline-offset-4 cursor-pointer">View All</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Course Card 1 */}
            <div className="group relative p-4 rounded-3xl bg-card border border-border space-y-4 transition-all hover:border-accent/30">
              <div className="w-full aspect-[16/9] bg-surface rounded-2xl overflow-hidden">
                <img
                  src={nnArchImg}
                  alt="LLM Orchestration and Operations course visualization"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                  width={1024}
                  height={576}
                />
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-semibold leading-tight">LLM Orchestration & Ops</h3>
                  <span className="text-[10px] font-[JetBrains_Mono,monospace] bg-background px-2 py-0.5 rounded border border-border uppercase">Advanced</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">Master the stack for deploying and scaling production-grade generative models.</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2">
                  <div className="size-7 rounded-full border-2 border-card bg-surface" />
                  <div className="size-7 rounded-full border-2 border-card bg-surface" />
                  <div className="size-7 rounded-full border-2 border-card bg-surface" />
                </div>
                <button className="px-5 py-2 bg-primary text-background text-xs font-bold rounded-full uppercase tracking-widest hover:bg-primary/90 transition-colors">
                  Join Cohort
                </button>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="group relative p-4 rounded-3xl bg-card border border-border space-y-4 transition-all hover:border-accent/30">
              <div className="w-full aspect-[16/9] bg-surface rounded-2xl overflow-hidden">
                <img
                  src={siliconEdgeImg}
                  alt="Edge AI and Robotics course visualization"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                  width={1024}
                  height={576}
                />
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-semibold leading-tight">Edge AI & Robotics</h3>
                  <span className="text-[10px] font-[JetBrains_Mono,monospace] bg-background px-2 py-0.5 rounded border border-border uppercase">Expert</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">Optimizing deep learning models for constrained hardware and real-time execution.</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-accent" />
                  <span className="text-[10px] font-[JetBrains_Mono,monospace] text-muted-foreground">Starts Oct 12</span>
                </div>
                <button className="px-5 py-2 border border-input text-foreground text-xs font-bold rounded-full uppercase tracking-widest hover:bg-surface transition-colors">
                  Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section className="px-6 pb-16">
        <div className="max-w-xl mx-auto lg:max-w-4xl">
          <span className="text-[10px] font-[JetBrains_Mono,monospace] text-accent mb-4 block uppercase tracking-[0.2em]">Instructional Faculty</span>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter mb-4 leading-none">Taught by the architects of the field.</h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-lg">
            Our faculty consists of senior engineers from the world's leading AI labs, ensuring that the curriculum remains grounded in real-world constraints.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-3">
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface border border-border">
                <img
                  src={instructor1Img}
                  alt="Dr. Elias Thorne, Lead Instructor"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={512}
                  height={640}
                />
              </div>
              <div>
                <p className="font-bold text-sm">Dr. Elias Thorne</p>
                <p className="text-[10px] font-[JetBrains_Mono,monospace] text-muted-foreground uppercase">Ex-Google Brain</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface border border-border">
                <img
                  src={instructor2Img}
                  alt="Sarah Chen, Principal Architect"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={512}
                  height={640}
                />
              </div>
              <div>
                <p className="font-bold text-sm">Sarah Chen</p>
                <p className="text-[10px] font-[JetBrains_Mono,monospace] text-muted-foreground uppercase">Principal Architect</p>
              </div>
            </div>
            <div className="space-y-3 hidden lg:block">
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface border border-border">
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <span className="text-xs font-[JetBrains_Mono,monospace] text-muted-foreground uppercase">Coming Soon</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-sm">Dr. Marcus Webb</p>
                <p className="text-[10px] font-[JetBrains_Mono,monospace] text-muted-foreground uppercase">Ex-DeepMind</p>
              </div>
            </div>
            <div className="space-y-3 hidden lg:block">
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface border border-border">
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <span className="text-xs font-[JetBrains_Mono,monospace] text-muted-foreground uppercase">Coming Soon</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-sm">Dr. Aisha Patel</p>
                <p className="text-[10px] font-[JetBrains_Mono,monospace] text-muted-foreground uppercase">Ex-OpenAI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-xl mx-auto lg:max-w-2xl">
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="size-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0l2.47 5.01L16 6.1l-4 3.9L12.94 16 8 13.27 3.06 16 4 10 0 6.1l5.53-1.09L8 0z" />
              </svg>
            ))}
          </div>
          <blockquote className="text-xl lg:text-2xl font-medium leading-relaxed mb-6">
            "The only academy that treats AI as an engineering discipline rather than a series of prompts. The certification gave me the technical vocabulary to lead high-stakes deployments."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-surface border border-border" />
            <div>
              <p className="text-sm font-medium">Marcus Vogel</p>
              <p className="text-[10px] font-[JetBrains_Mono,monospace] text-muted-foreground uppercase">Lead Dev, Tesla</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-xl mx-auto lg:max-w-2xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter mb-4">Standardize Your Future.</h2>
          <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
            Admissions are rolling. Secure your place in the next professional intake and join the global standard for AI certification.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-8 py-4 bg-primary text-background text-sm font-bold rounded-full uppercase tracking-widest hover:bg-primary/90 transition-colors">
              Apply for Cohort 04
            </button>
            <button className="px-8 py-4 border border-input text-foreground text-sm font-bold rounded-full uppercase tracking-widest hover:bg-surface transition-colors">
              Schedule a Call
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border bg-surface/50">
        <div className="max-w-xl mx-auto lg:max-w-4xl">
          <div className="flex items-center gap-2 mb-8">
            <div className="size-8 bg-accent rounded-full flex items-center justify-center">
              <div className="size-4 bg-background rounded-sm rotate-45" />
            </div>
            <span className="font-bold tracking-tight text-lg">ACA</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <h4 className="text-[10px] font-[JetBrains_Mono,monospace] font-medium uppercase tracking-widest text-muted-foreground">Programs</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">LLM Orchestration</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Edge AI</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Neural Architecture</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">AI Ethics</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-[JetBrains_Mono,monospace] font-medium uppercase tracking-widest text-muted-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Press</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-[JetBrains_Mono,monospace] font-medium uppercase tracking-widest text-muted-foreground">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Community</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-[JetBrains_Mono,monospace] font-medium uppercase tracking-widest text-muted-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link to="/" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-[JetBrains_Mono,monospace] text-muted-foreground uppercase">
              © 2025 AI Certification Academy. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
