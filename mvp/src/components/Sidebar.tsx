import { Profile, Screen } from '../domain';

export function Sidebar({ screen, onNav, profile }: { screen:Screen; onNav:(s:Screen)=>void; profile:Profile }) {
  const nav = [
    { id:'dashboard'  as Screen, icon:'⊞', label:'Painel Geral' },
    { id:'indicadores'as Screen, icon:'⊟', label:'Lançamento' },
    { id:'motor'      as Screen, icon:'⊙', label:'Motor de Regras', cam:true },
  ].filter(n => !n.cam || profile === 'cam');
  return (
    <aside className="w-56 shrink-0 bg-[#0f172a] flex flex-col h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 2v16M3 6l7 4 7-4" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SESAU Recife</p>
            <p className="text-white/40 text-[9px] font-mono uppercase tracking-widest">SIG-Desempenho v2.0</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        <p className="text-white/25 text-[9px] font-mono uppercase tracking-widest px-2 pb-2">Menu</p>
        {nav.map(n => (
          <button key={n.id} onClick={()=>onNav(n.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer
              ${screen===n.id ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white hover:bg-white/8'}`}>
            <span className="text-sm w-4 text-center">{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-white/10">
        <div className="bg-white/8 rounded-lg p-3 space-y-1">
          <p className="text-white/40 text-[9px] font-mono uppercase tracking-wider">Ciclo Vigente</p>
          <p className="text-white font-semibold text-xs">3º Quad. 2024</p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
            <span className="text-emerald-300 text-[10px] font-mono">Aberto · 214 gestores</span>
          </div>
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-white/10">
        <p className="text-white/20 text-[8px] font-mono">Lei Municipal nº 19.060/2023</p>
        <p className="text-white/20 text-[8px] font-mono">Portarias SESAU/SEPLAGTD</p>
      </div>
    </aside>
  );
}
