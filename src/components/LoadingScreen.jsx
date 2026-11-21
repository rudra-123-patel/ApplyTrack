import { Layers, Loader2 } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading workspace...' }) {
  return (
    <div className="min-h-screen bg-[#0F1012] text-[#EDEDED] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#18191D] border border-[#26282E] flex items-center justify-center text-[#7C3AED] shadow-sm">
          <Layers className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8E929B]">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7C3AED]" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
