'use client';

import React, { useState, useEffect } from 'react';
import { User, Award, ShieldAlert, Sparkles, Check, CheckCircle2, Moon, Sun, ArrowRight, Loader2 } from 'lucide-react';
import { useDiyStore } from '../../lib/store';
import Navbar from '../../components/layout/Navbar';
import AuthDialog from '../../components/ui/AuthDialog';
import CustomToast from '../../components/ui/CustomToast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function ProfilePage() {
  const { session, dbUser, setDbUser, showToast, setAuthOpen } = useDiyStore();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('Designing ecological string designs and plastic recyclables. Hobbyist DIY enthusiast.');
  const [skills, setSkills] = useState<string[]>(['cardboard crafting', 'hot gluing', 'wood measuring']);
  const [skillInput, setSkillInput] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || '');
    }
  }, [dbUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ name, bio })
      });
      
      if (response.ok) {
        const data = await response.json();
        setDbUser({ ...dbUser, name: data.name });
        showToast('Profile updated successfully.');
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend update failed, applying locally:', err);
      setDbUser({ ...dbUser, name });
      showToast('Profile updated locally.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().toLowerCase();
      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (tag: string) => {
    setSkills(skills.filter(s => s !== tag));
  };

  // Stripe Checkout billing upgrade
  const handleUpgrade = async () => {
    if (!session) {
      setAuthOpen(true);
      return;
    }
    setIsUpgrading(true);
    try {
      const response = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn('Billing endpoint failed, simulating checkout upgrade:', e);
      // Simulate upgrade locally
      setTimeout(() => {
        setDbUser({ ...dbUser, isPremium: true });
        showToast('Simulated upgrade: Premium features unlocked!');
        setIsUpgrading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {!session ? (
          <div className="rounded-2xl border border-slate-850 bg-[#1E293B]/20 p-12 text-center space-y-4 max-w-md mx-auto">
            <ShieldAlert className="w-10 h-10 text-slate-655 mx-auto" />
            <h3 className="text-lg font-bold font-display text-white">Profile Restricted</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in to update creator bio details, manage capabilities, and access subscription billing.
            </p>
            <button 
              onClick={() => setAuthOpen(true)}
              className="px-6 py-2.5 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6C63FF]/15 cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: General Settings Form (7/12) */}
            <form onSubmit={handleUpdateProfile} className="md:col-span-7 space-y-6">
              
              {/* Form card */}
              <div className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5 shadow-md glass-panel">
                <div className="border-b border-slate-850 pb-3.5">
                  <h3 className="text-lg font-bold text-slate-100 font-display flex items-center gap-2">
                    <User className="w-5 h-5 text-[#6C63FF]" />
                    Profile Workspace
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage your creator metadata shown to other community builders.
                  </p>
                </div>

                <div className="space-y-4">
                  
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
                      Creator Handle / Name
                    </label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="maker_name"
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#6C63FF]"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
                      Bio Description
                    </label>
                    <textarea 
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#6C63FF] resize-none"
                    />
                  </div>

                  {/* Skills tags list */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold flex justify-between">
                      <span>Craft Capabilities</span>
                      <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-450">Press Enter</span>
                    </label>
                    
                    <div className="min-h-[80px] p-2.5 rounded-xl border border-slate-850 bg-slate-900/30 flex flex-wrap gap-2 content-start items-start">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-750"
                        >
                          {skill}
                          <button 
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-slate-500 hover:text-rose-500 transition-colors ml-1 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      
                      <input 
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder={skills.length === 0 ? "Type craft skill (e.g. woodwork)..." : "Add..."}
                        className="bg-transparent outline-none py-0.5 text-[10px] text-slate-200 placeholder:text-slate-655 font-mono flex-1 min-w-[100px]"
                      />
                    </div>
                  </div>

                  {/* Preferences Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-850/50">
                    <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
                      Appearance Theme
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          theme === 'dark' 
                            ? 'bg-[#1E293B] text-slate-100 border-[#6C63FF]/30' 
                            : 'bg-transparent text-slate-450 border-slate-850 hover:text-slate-250'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Dark Theme</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => { setTheme('light'); showToast('System theme is locked to Dark for premium aesthetic.'); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          theme === 'light' 
                            ? 'bg-[#1E293B] text-slate-100 border-[#6C63FF]/30' 
                            : 'bg-transparent text-slate-450 border-slate-850 hover:text-slate-250'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>Light Theme</span>
                      </button>
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-slate-850/50 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2.5 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6C63FF]/10 cursor-pointer flex items-center gap-1.5"
                  >
                    {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Settings
                  </button>
                </div>

              </div>

            </form>

            {/* Right: Subscription Info (5/12) */}
            <div className="md:col-span-5 space-y-6">
              
              <div className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5 shadow-md glass-panel text-center">
                
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] text-white flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white font-display">
                    SaaS subscription Plan
                  </h4>
                  <p className="text-xs text-slate-400">
                    Unlock professional PDF exports, DALL-E covering graphics, and unlimited AI scans.
                  </p>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850/80">
                  <span className="text-3xl font-extrabold text-white font-display">$9.99</span>
                  <span className="text-xs text-slate-500 font-mono"> / mo</span>
                </div>

                {dbUser?.isPremium ? (
                  <div className="py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Premium Plan Active
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="w-full py-3 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#6C63FF]/10"
                  >
                    {isUpgrading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Upgrading...
                      </>
                    ) : (
                      <>
                        Upgrade via Stripe
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                <ul className="text-[10px] text-slate-450 text-left space-y-2 border-t border-slate-850/60 pt-4 leading-normal">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Unlimited AI vision scanner uploads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>DALL-E 3 visual illustrations generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Downloadable styled print blueprints</span>
                  </li>
                </ul>

              </div>

            </div>

          </div>
        )}

      </main>

      <AuthDialog />
      <CustomToast />
    </div>
  );
}
