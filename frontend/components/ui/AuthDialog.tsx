'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useDiyStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

export default function AuthDialog() {
  const { authOpen, setAuthOpen, setSession, syncUser, showToast } = useDiyStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setAuthLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { name: authName } }
        });
        if (signUpError) throw signUpError;
        showToast('Signed up successfully! Verify your email if needed.');
        setAuthOpen(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (signInError) throw signInError;
        if (data.session) {
          setSession(data.session);
          await syncUser(data.session);
        }
        showToast('Signed in successfully.');
        setAuthOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    const mockSession = {
      access_token: 'mock-token-guest',
      user: {
        id: 'mock-user-id',
        email: 'maker@diygenius.ai',
        user_metadata: { name: 'DIY Master' }
      }
    };
    setSession(mockSession);
    await syncUser(mockSession);
    setAuthOpen(false);
    showToast('Logged in as Demo Guest.');
  };

  return (
    <Dialog.Root open={authOpen} onOpenChange={setAuthOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm transition-opacity" />
        
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-[92vw] max-w-md bg-[#1E293B] border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl focus:outline-none glass-panel">
          
          <div className="text-center space-y-2 mb-6">
            <Dialog.Title className="text-2xl font-bold tracking-tight text-white font-display">
              {isSignUp ? 'Create SaaS Account' : 'Welcome Maker'}
            </Dialog.Title>
            <Dialog.Description className="text-xs text-slate-400">
              {isSignUp ? 'Sign up to build, scan, and generate DIY projects.' : 'Sign in to access your DIY Workspace.'}
            </Dialog.Description>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#6C63FF] transition-all"
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">Email Address</label>
              <input 
                type="email" 
                required
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                placeholder="maker@diygenius.ai"
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#6C63FF] transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">Password</label>
              <input 
                type="password" 
                required
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#6C63FF] transition-all"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-500 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#6C63FF]/10"
            >
              {authLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            {!isSignUp && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-850"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-[9px] font-mono uppercase font-black">Or</span>
                  <div className="flex-grow border-t border-slate-850"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-slate-100 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 border border-slate-800 shadow-inner cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00D4FF] fill-current" />
                  Continue as Demo Guest
                </button>
              </>
            )}
          </form>

          <div className="text-center pt-4.5 border-t border-slate-850/60 mt-5">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <Dialog.Close asChild>
            <button 
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </Dialog.Close>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
