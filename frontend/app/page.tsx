'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Camera, Heart, CheckCircle2, MessageSquare, 
  ArrowRight, Play, Wrench, ShieldCheck, HelpCircle, 
  Tv, Bookmark, FileText, ChevronDown 
} from 'lucide-react';
import { useDiyStore } from '../lib/store';
import Navbar from '../components/layout/Navbar';
import AuthDialog from '../components/ui/AuthDialog';
import CustomToast from '../components/ui/CustomToast';

export default function LandingPage() {
  const router = useRouter();
  const { session, setAuthOpen, setSession, syncUser, showToast } = useDiyStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto navigate to generate workspace if session is loaded
  useEffect(() => {
    if (session) {
      router.push('/generate');
    }
  }, [session, router]);

  const handleStartCreating = () => {
    if (session) {
      router.push('/generate');
    } else {
      setAuthOpen(true);
    }
  };

  const handleWatchDemo = () => {
    // Guest bypass mode
    const mockSession = {
      access_token: 'mock-token-guest',
      user: {
        id: 'mock-user-id',
        email: 'maker@diygenius.ai',
        user_metadata: { name: 'DIY Master' }
      }
    };
    setSession(mockSession);
    syncUser(mockSession);
    showToast('Logged in as guest demo.');
    router.push('/generate');
  };

  const features = [
    {
      icon: <Camera className="w-5 h-5 text-[#00D4FF]" />,
      title: 'Material Scanner',
      desc: 'Snap a picture of your recycling box or crafting desk. AI automatically identifies usable items.'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#6C63FF]" />,
      title: 'Custom Blueprint AI',
      desc: 'Specify your available tools and target difficulty. AI designs detailed structural steps customized for you.'
    },
    {
      icon: <FileText className="w-5 h-5 text-amber-500" />,
      title: 'Printable Formats',
      desc: 'Download clean, high-contrast, double-column PDF cards designed to carry straight into your workshop.'
    },
    {
      icon: <Tv className="w-5 h-5 text-emerald-400" />,
      title: 'Illustrated Blueprints',
      desc: 'Unlock active cover visuals and step-by-step schematics generated dynamically by DALL-E.'
    }
  ];

  const faqs = [
    {
      q: "What kinds of materials are supported?",
      a: "Anything! You can scan cardboards, plastic bottles, strings, wood scraps, old metal cans, electronic wires, fabrics, and more. If the scanner misses an item, you can type it in manually in seconds."
    },
    {
      q: "Are the safety guidelines reliable?",
      a: "Yes. Safety precautions are integrated directly into our AI generation system. It highlights hazards such as sharp blade cutter angles, glue gun heat thresholds, and recommends mask safety when dealing with volatile chemicals or fumes."
    },
    {
      q: "Can I use it completely offline?",
      a: "Our app is built with a dual-mode local fallback. You can access and checklist all your bookmarked instructions offline! Only generating new blueprints requires active AI connections."
    },
    {
      q: "How does the Stripe subscription billing work?",
      a: "Standard accounts get 5 material scans per day. Genius Premium ($9.99/mo) unlocks unlimited custom generations, printable blueprints, and DALL-E illustrations."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-[#6C63FF]/30 pb-16 relative overflow-hidden">
      
      {/* Decorative backdrop elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6C63FF]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#00D4FF]/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 text-center pt-20 pb-16 sm:py-32 space-y-8">
        
        {/* Banner indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20 text-xs font-semibold tracking-wide uppercase font-mono animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 fill-current text-amber-400" />
          AI DIY Project Generator
        </div>
        
        {/* Title */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.15] text-white">
          Turn Your Materials <br />
          Into <span className="bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] bg-clip-text text-transparent">Amazing DIY Projects</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto font-medium">
          Upload what you have. Let AI scan your items, suggest step-by-step blueprints, and visual assembly designs instantly.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-sm mx-auto sm:max-w-none">
          <button 
            onClick={handleStartCreating}
            className="w-full sm:w-auto px-8 py-4 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#6C63FF]/15 cursor-pointer flex items-center justify-center gap-2"
          >
            Start Creating
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleWatchDemo}
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl font-bold text-xs tracking-wider uppercase transition-all border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current text-[#00D4FF]" />
            Try Guest Demo
          </button>
        </div>

      </section>

      {/* Showcase Grid Features */}
      <section className="max-w-5xl mx-auto px-6 space-y-12 py-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
            Smart Features for DIY Makers
          </h2>
          <p className="text-xs sm:text-sm text-slate-450 max-w-md mx-auto leading-relaxed">
            Everything you need to turn scrap materials into functional household items.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-5.5 space-y-4 hover:border-[#6C63FF]/30 transition-all duration-300 glass-panel"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
                {feat.icon}
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-200">{feat.title}</h4>
                <p className="text-xs text-slate-450 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 space-y-12 py-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">How It Works</h2>
          <p className="text-xs sm:text-sm text-slate-450 max-w-sm mx-auto">From messy scrap piles to finished creations in three quick steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-[#1E293B]/30 rounded-2xl border border-slate-850 p-6 space-y-4 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/20 flex items-center justify-center font-mono font-bold text-xs mx-auto sm:mx-0">
              01
            </div>
            <h4 className="text-sm font-bold text-white">Specify Materials</h4>
            <p className="text-xs text-slate-450 leading-relaxed">
              Drop an image of your recycling pile or input material tags manually. The AI structures your inventory checklist instantly.
            </p>
          </div>

          <div className="bg-[#1E293B]/30 rounded-2xl border border-slate-850 p-6 space-y-4 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/20 flex items-center justify-center font-mono font-bold text-xs mx-auto sm:mx-0">
              02
            </div>
            <h4 className="text-sm font-bold text-white">Assemble Blueprint</h4>
            <p className="text-xs text-slate-450 leading-relaxed">
              Choose categories (gardening, school, etc.) and difficulty. The AI designs safety limits, required tools, and outlines.
            </p>
          </div>

          <div className="bg-[#1E293B]/30 rounded-2xl border border-slate-850 p-6 space-y-4 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-mono font-bold text-xs mx-auto sm:mx-0">
              03
            </div>
            <h4 className="text-sm font-bold text-white">Start Building</h4>
            <p className="text-xs text-slate-450 leading-relaxed">
              Use our interactive checklist step navigator, view DALL-E diagrams, export to printer, and log comment feedback.
            </p>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 space-y-12 py-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
            Loved by Crafters
          </h2>
          <p className="text-xs sm:text-sm text-slate-455 max-w-sm mx-auto">
            See how hobbyists are building items from scrap resources.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-[#1E293B]/20 rounded-2xl border border-slate-800 p-5 space-y-3.5 glass-panel">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-white">
                S
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Sarah Jenkins</h5>
                <p className="text-[9px] text-slate-500">Eco Crafter</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "I scanned old cardboard boxes and soda bottles. DIY Genius gave me blueprints for self-watering pots. The safety guidelines were extremely helpful!"
            </p>
          </div>

          <div className="bg-[#1E293B]/20 rounded-2xl border border-slate-800 p-5 space-y-3.5 glass-panel">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-white">
                D
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">David Miller</h5>
                <p className="text-[9px] text-slate-500">Student Hobbyist</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "The interactive checklist is so handy. I built a desktop divider and marked each step off. The PDF print format fits straight into my workshop desk."
            </p>
          </div>

          <div className="bg-[#1E293B]/20 rounded-2xl border border-slate-800 p-5 space-y-3.5 glass-panel">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-white">
                M
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Maria Lopez</h5>
                <p className="text-[9px] text-slate-500">Parent DIYer</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Great family activity creator. My kids and I scanned some plastic items and built seed feeders. Highly recommend the guest mode to check it out."
            </p>
          </div>

        </div>
      </section>

      {/* SaaS Pricing Plans */}
      <section className="max-w-4xl mx-auto px-6 space-y-12 py-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">Simple Pricing Plans</h2>
          <p className="text-xs sm:text-sm text-slate-450 max-w-sm mx-auto">Subscribe to unlock visual drawings, unlimited scans, and PDF downloads.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          
          {/* Maker Free */}
          <div className="bg-[#1E293B]/30 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 glass-panel">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Maker Free</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Explore base plans</p>
              </div>
              <div className="text-3xl font-black text-white">$0</div>
              <ul className="text-xs text-slate-400 space-y-2.5 pt-2 border-t border-slate-850/50">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 5 Material scans per day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Basic step-by-step checklists</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Community feed access</li>
              </ul>
            </div>
            <button 
              onClick={handleStartCreating} 
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Start Free
            </button>
          </div>

          {/* Premium */}
          <div className="bg-[#1E293B]/80 rounded-2xl border border-[#6C63FF]/50 p-6 flex flex-col justify-between space-y-6 relative shadow-lg shadow-[#6C63FF]/5 glass-panel">
            <div className="absolute -top-3.5 right-6 bg-[#6C63FF] text-white text-[9px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full">
              Popular
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#6C63FF]">Genius Premium</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Unlock the complete library</p>
              </div>
              <div className="text-3xl font-black text-white">$9.99<span className="text-xs text-slate-500 font-mono font-normal"> / mo</span></div>
              <ul className="text-xs text-slate-350 space-y-2.5 pt-2 border-t border-slate-850/50">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited AI project blueprints</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> DALL-E illustrated covers</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Downloadable styled print blueprints</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Chatbot assistant panels</li>
              </ul>
            </div>
            
            <button 
              onClick={handleStartCreating} 
              className="w-full py-2.5 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-md shadow-[#6C63FF]/15"
            >
              Upgrade Now
            </button>
          </div>

        </div>
      </section>

      {/* FAQ Accordions */}
      <section className="max-w-3xl mx-auto px-6 space-y-12 py-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-455 max-w-sm mx-auto">
            Got questions about scanning, safety, or exports? We have answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-[#1E293B]/30 border border-slate-800 rounded-xl overflow-hidden glass-panel"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#00D4FF] shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4.5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-850/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 pt-12 text-center text-slate-500 text-[10px] font-mono max-w-6xl mx-auto space-y-2.5">
        <p>© 2026 DIY Genius AI. All rights reserved. Made by BKiran27.</p>
        <p className="text-slate-655">Empowering craft creators to build items from available home scrap resource materials.</p>
      </footer>

      {/* Global overlays */}
      <AuthDialog />
      <CustomToast />
    </div>
  );
}
