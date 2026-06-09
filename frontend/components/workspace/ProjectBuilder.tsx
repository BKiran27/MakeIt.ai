'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle, Award, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Step } from '../../lib/store';

interface ProjectBuilderProps {
  steps: Step[];
  projectTitle: string;
  onCompleteToggle?: (percent: number) => void;
}

export default function ProjectBuilder({ steps, projectTitle, onCompleteToggle }: ProjectBuilderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

  // Reset completed array if steps changes
  useEffect(() => {
    setCompletedSteps(new Array(steps.length).fill(false));
    setCurrentStepIndex(0);
  }, [steps]);

  const toggleStep = (idx: number) => {
    const updated = [...completedSteps];
    updated[idx] = !updated[idx];
    setCompletedSteps(updated);

    const percent = Math.round((updated.filter(Boolean).length / steps.length) * 100);
    if (onCompleteToggle) {
      onCompleteToggle(percent);
    }
  };

  const progressPercent = steps.length > 0 
    ? Math.round((completedSteps.filter(Boolean).length / steps.length) * 100)
    : 0;

  const isAllComplete = progressPercent === 100;

  return (
    <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 sm:p-6 space-y-5 shadow-inner glass-panel">
      
      {/* Header with stats */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#00D4FF] font-bold">
            Interactive Project Builder
          </h4>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block line-clamp-1">
            Tracking: {projectTitle}
          </span>
        </div>
        
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full transition-colors ${
          isAllComplete 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
        }`}>
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00D4FF]" 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Interactive Step Card with AnimatePresence */}
      <div className="min-h-[170px] relative overflow-hidden flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {isAllComplete ? (
            <motion.div
              key="complete-banner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 text-center space-y-3 flex flex-col items-center justify-center py-8"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-md">
                <Award className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-white font-display">🎉 DIY Project Completed!</h5>
                <p className="text-xs text-slate-455 max-w-sm">
                  Awesome work! You successfully assembled the blueprint. You unlocked the <strong>Eco Master</strong> badge. Share your creation on the Community tab!
                </p>
              </div>
              <button 
                onClick={() => setCompletedSteps(new Array(steps.length).fill(false))}
                className="px-4 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-mono uppercase tracking-wider font-semibold border border-slate-750 transition-colors cursor-pointer"
              >
                Reset Checklist
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key={currentStepIndex}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1E293B]/70 rounded-xl border border-slate-800 p-4 sm:p-5 space-y-4 relative"
            >
              {/* Step info row */}
              <div className="flex items-start gap-3.5">
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-[#6C63FF]/15 text-[#6C63FF] font-mono text-xs font-black mt-0.5 border border-[#6C63FF]/10 shadow-sm">
                  {steps[currentStepIndex].stepNumber}
                </span>
                <div className="space-y-3 flex-1">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                    {steps[currentStepIndex].instruction}
                  </p>
                  
                  {steps[currentStepIndex].safetyWarning && (
                    <div className="text-[11px] text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2 flex items-center gap-2.5 shadow-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span className="font-semibold">{steps[currentStepIndex].safetyWarning}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete toggle checkbox & buttons row */}
              <div className="pt-3.5 border-t border-slate-850 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={completedSteps[currentStepIndex] || false}
                      onChange={() => toggleStep(currentStepIndex)}
                      className="peer sr-only"
                    />
                    <div className="w-4.5 h-4.5 rounded border border-slate-700 bg-slate-900 flex items-center justify-center transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-500 text-transparent peer-checked:text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                    Mark Step {steps[currentStepIndex].stepNumber} Complete
                  </span>
                </label>

                {/* Sub-navigation */}
                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex(c => Math.max(0, c - 1))}
                    className="p-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                    title="Previous Step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentStepIndex === steps.length - 1}
                    onClick={() => setCurrentStepIndex(c => Math.min(steps.length - 1, c + 1))}
                    className="p-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                    title="Next Step"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Dots Indicator */}
      {steps.length > 0 && !isAllComplete && (
        <div className="flex justify-center flex-wrap gap-2 pt-1">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex 
                  ? 'bg-[#00D4FF] w-5' 
                  : completedSteps[idx] 
                    ? 'bg-emerald-500' 
                    : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Go to Step ${idx + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  );
}
