'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench, LogOut, User, Sparkles, Menu, X, LogIn } from 'lucide-react';
import { useDiyStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, dbUser, setSession, setDbUser, setAuthOpen, showToast } = useDiyStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
    setSession(null);
    setDbUser(null);
    showToast('Signed out successfully.');
    router.push('/');
  };

  const navLinks = [
    { label: 'Workspace', path: '/generate' },
    { label: 'Discover', path: '/discover' },
    { label: 'Community', path: '/community' },
    { label: 'Dashboard', path: '/dashboard' }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo brand */}
        <Link 
          href={session ? '/generate' : '/'} 
          className="flex items-center gap-2.5 font-semibold text-sm tracking-tight"
        >
          <div className="w-8 h-8 rounded-lg bg-[#6C63FF] flex items-center justify-center text-white shadow-md shadow-[#6C63FF]/20">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="font-mono uppercase tracking-widest text-xs font-bold text-white">
            DIY Genius<span className="text-[#00D4FF]">.AI</span>
          </span>
        </Link>

        {/* Desktop Navigation links */}
        {session && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#6C63FF]/15 text-[#6C63FF]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right tools / Profile */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              {dbUser?.isPremium && (
                <span className="bg-gradient-to-r from-amber-500/15 to-amber-600/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-semibold">
                  Premium
                </span>
              )}
              
              <Link 
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E293B] border border-slate-850 hover:border-slate-750 transition-all text-xs text-slate-200 font-semibold"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] text-white flex items-center justify-center font-bold text-[9px]">
                  {dbUser?.name?.[0]?.toUpperCase() || 'M'}
                </div>
                <span>{dbUser?.name || 'Maker'}</span>
              </Link>

              <button 
                onClick={handleSignOut}
                className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setAuthOpen(true)}
              className="px-4.5 py-2 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-md shadow-[#6C63FF]/15 cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Start Creating
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2.5">
          {session && (
            <Link 
              href="/profile"
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] text-white flex items-center justify-center font-bold text-[9px]"
            >
              {dbUser?.name?.[0]?.toUpperCase() || 'M'}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-850 bg-[#0F172A] px-4 py-4 space-y-3.5 animate-in slide-in-from-top-full duration-250">
          {session ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 px-3 rounded-lg text-center text-xs font-semibold tracking-wide border transition-all ${
                      isActive(link.path)
                        ? 'bg-[#6C63FF]/10 text-[#6C63FF] border-[#6C63FF]/20'
                        : 'bg-slate-900 text-slate-400 border-slate-850'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                {dbUser?.isPremium && (
                  <span className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-semibold">
                    Premium
                  </span>
                )}
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-xs text-rose-500 hover:underline font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}
              className="w-full py-2.5 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-md shadow-[#6C63FF]/15 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Start Creating
            </button>
          )}
        </div>
      )}
    </header>
  );
}
