'use client';

import React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { CheckCircle2, Info } from 'lucide-react';
import { useDiyStore } from '../../lib/store';

export default function CustomToast() {
  const { toastOpen, toastMessage, setToastOpen } = useDiyStore();

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root 
        open={toastOpen} 
        onOpenChange={setToastOpen}
        className="bg-slate-900 border border-slate-800 text-slate-100 shadow-xl rounded-xl p-4 flex items-center gap-3.5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom-full duration-200 z-[200] max-w-sm"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-[#00D4FF] flex items-center justify-center border border-emerald-500/15">
          <CheckCircle2 className="w-4 h-4 text-[#00D4FF]" />
        </div>
        
        <div className="flex-1">
          <Toast.Title className="text-xs font-bold leading-normal">
            {toastMessage}
          </Toast.Title>
        </div>
      </Toast.Root>

      <Toast.Viewport className="fixed bottom-4 right-4 p-4 w-full sm:w-auto max-w-sm z-[200] flex flex-col gap-2 outline-none" />
    </Toast.Provider>
  );
}
