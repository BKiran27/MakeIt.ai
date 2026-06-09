'use client';

import React, { useState } from 'react';
import { Camera, X, Loader2, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';
import { useDiyStore } from '../../lib/store';

export default function MaterialScanner() {
  const { 
    materials, 
    isScanning, 
    inputValue, 
    setInputValue, 
    addMaterial, 
    removeMaterial, 
    scanMaterials, 
    showToast 
  } = useDiyStore();

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await scanMaterials(file);
      } else {
        showToast('Please drop an image file (PNG/JPG/WEBP).');
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await scanMaterials(e.target.files[0]);
    }
  };

  const handleAddKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addMaterial(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6 shadow-md glass-panel">
      <div>
        <h3 className="text-lg font-bold text-slate-100 font-display flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#6C63FF] fill-current" />
          Material Workspace
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Scan your crafting materials with AI Vision or type them in manually.
        </p>
      </div>

      {/* Visual Image scanner dropzone */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-widest text-[#00D4FF] flex items-center justify-between font-bold">
          <span>01. Scan Materials (AI Vision)</span>
          {isScanning && (
            <span className="text-[#6C63FF] font-semibold flex items-center gap-1 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning Image...
            </span>
          )}
        </label>

        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all bg-slate-900/20 overflow-hidden ${
            dragActive ? 'border-[#6C63FF] bg-[#6C63FF]/5' : 'border-slate-800 hover:border-slate-750 hover:bg-slate-800/10'
          }`}
        >
          {isScanning && (
            <div className="absolute inset-x-0 h-1.5 bg-[#22C55E]/60 shadow-[0_0_12px_#22C55E] z-10 animate-scan pointer-events-none" />
          )}

          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            id="image-file-scanner"
            onChange={handleFileInput}
            disabled={isScanning}
          />
          <label htmlFor="image-file-scanner" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 flex items-center justify-center border border-slate-700/60 text-slate-400 group-hover:text-slate-200 shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-300 hover:underline block">
                Click to upload photo or Drag & Drop
              </span>
              <span className="text-[10px] text-slate-500 block">
                Supports JPG, PNG, WEBP files
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Manual item listing */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-widest text-[#00D4FF] flex items-center justify-between font-bold">
          <span>02. Available Materials List</span>
          <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-450 font-semibold font-mono">
            Press Enter
          </span>
        </label>

        <div className="min-h-[110px] p-3 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-wrap gap-2 items-start content-start transition-colors focus-within:border-[#6C63FF]/45">
          {materials.map((mat) => (
            <span
              key={mat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E293B] text-xs font-medium text-slate-200 border border-slate-800 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
              {mat}
              <button 
                onClick={() => removeMaterial(mat)} 
                className="text-slate-450 hover:text-rose-500 transition-colors cursor-pointer"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleAddKeydown}
            placeholder={materials.length === 0 ? "Type material (e.g. rope, cardboard box)..." : "Add another..."}
            className="flex-1 min-w-[150px] bg-transparent border-none outline-none py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono"
            disabled={isScanning}
          />
        </div>
      </div>
    </div>
  );
}
