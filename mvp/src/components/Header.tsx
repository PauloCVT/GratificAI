import { useEffect, useRef, useState } from 'react';
import { PROFILES, PROFILE_ORDER, Profile } from '../domain';

export function Header({ profile, onChange }: { profile:Profile; onChange:(p:Profile)=>void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const p = PROFILES[profile];
  useEffect(() => {
    const h = (e:MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h);
  },[]);
  return (
    <header className="h-13 bg-white border-b border-slate-200 flex items-center justify-between px-5 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[11px] text-slate-400 font-mono hidden sm:block">Prefeitura do Recife · SESAU</span>
        <span className="text-slate-300 hidden sm:block">/</span>
        <span className="text-[11px] text-slate-600 font-medium truncate">Gratificação Variável por Desempenho</span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full">
          <svg width="10" height="10" viewBox="0 0 12 12"><path d="M6 1L2 2.5v3C2 8 4 10.5 6 11c2-.5 4-3 4-5.5v-3L6 1z" stroke="#64748b" strokeWidth="1.2"/></svg>
          <span className="text-[9px] text-slate-500 font-mono">LGPD · Art. 5º II</span>
        </div>
        <div ref={ref} className="relative">
          <button onClick={()=>setOpen(!open)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
            <div className="w-6 h-6 rounded-md bg-[#0f172a] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">{p.sigla.slice(0,3)}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-semibold text-slate-800 leading-tight">{p.label.length>28?p.label.slice(0,28)+'…':p.label}</p>
              <p className="text-[9px] text-slate-400 font-mono">{p.nivel} · Trocar</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" className={`text-slate-400 transition-transform ${open?'rotate-180':''}`}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          {open && (
            <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden max-h-[85vh] overflow-y-auto">
              {PROFILE_ORDER.map(key => {
                const v = PROFILES[key];
                return (
                  <button key={key} onClick={()=>{onChange(key);setOpen(false);}}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer ${profile===key?'bg-blue-50':''}`}>
                    <div className="w-7 h-7 rounded-md bg-[#0f172a] flex items-center justify-center shrink-0">
                      <span className="text-white text-[9px] font-bold">{v.sigla.slice(0,3)}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium text-slate-800 truncate">{v.label}</p>
                      <span className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border ${v.color}`}>{v.nivel}</span>
                    </div>
                    {profile===key && <span className="text-blue-500 text-xs">●</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
