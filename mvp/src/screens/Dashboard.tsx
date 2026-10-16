import { useState } from 'react';
import {
  CLASS_COLOR, DS_COLORS, Profile, classificar, distritosVisiveis, jurisdicao, preenchimentoEfetivo,
  statusEfetivo, unidadesVisiveis,
} from '../domain';
import { portariaVigente, useStore } from '../store';
import { ProgressBar, pctColor, statusColor } from '../components/ui';

export function DashboardScreen({ profile, onVer }: { profile: Profile; onVer: (unidadeId: number) => void }) {
  const st = useStore();
  const pesos = portariaVigente(st).pesos;
  const [filterDS, setFilterDS] = useState('Todos');
  const [filterSt, setFilterSt] = useState('Todos');

  const global = profile === 'cam';
  const distritos = distritosVisiveis(profile);
  const unidades = unidadesVisiveis(profile).map(u => ({
    ...u,
    preenchimento: preenchimentoEfetivo(u, st.lancamentos[u.id], pesos),
    status: statusEfetivo(u, !!st.enviadas[u.id]),
  }));

  const totalGestores = distritos.reduce((s, d) => s + d.gestores, 0);
  const avgGlobal = (distritos.reduce((s, d) => s + d.media, 0) / Math.max(distritos.length, 1)).toFixed(1);

  const filtered = unidades.filter(u =>
    (filterDS === 'Todos' || u.distrito === filterDS) &&
    (filterSt === 'Todos' || u.status === filterSt),
  );

  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans,sans-serif' }}>Painel Geral de Desempenho</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {global ? 'Monitorização territorial · DS I ao DS VIII · 3º Quadrimestre 2024' : `Jurisdição: ${jurisdicao(profile)} · 3º Quadrimestre 2024`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Gestores Monitorizados', value: String(totalGestores), sub: `${totalGestores} previstos no ciclo`, icon: '◈', c: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Distritos Parametrizados', value: global ? 'DS I — DS VIII' : distritos.map(d => d.id).join(', '), sub: `${distritos.length} ${distritos.length === 1 ? 'distrito sanitário' : 'distritos sanitários'}`, icon: '◉', c: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Índice Médio Global', value: `${avgGlobal} pts`, sub: classificar(parseFloat(avgGlobal)), icon: '◆', c: `${parseFloat(avgGlobal) >= 80 ? 'text-emerald-600' : parseFloat(avgGlobal) >= 70 ? 'text-blue-600' : parseFloat(avgGlobal) >= 60 ? 'text-amber-600' : 'text-rose-600'}`, bg: `${parseFloat(avgGlobal) >= 80 ? 'bg-emerald-50' : parseFloat(avgGlobal) >= 70 ? 'bg-blue-50' : parseFloat(avgGlobal) >= 60 ? 'bg-amber-50' : 'bg-rose-50'}` },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{card.label}</p>
              <span className={`w-6 h-6 rounded-md ${card.bg} flex items-center justify-center ${card.c} text-sm`}>{card.icon}</span>
            </div>
            <p className="text-lg font-black text-slate-900 font-mono leading-none">{card.value}</p>
            <p className="text-[10px] text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">{global ? 'Grelha Territorial — DS I a DS VIII' : 'Grelha Territorial — sua jurisdição'}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Faixas: Insuficiente &lt;60% · Regular 60–69% · Satisfatório 70–79% · Excelente ≥80%</p>
        </div>
        <div className="divide-y divide-slate-50">
          {distritos.map(ds => {
            const cls = classificar(ds.media);
            return (
              <div key={ds.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: DS_COLORS[ds.id] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{ds.nome}</p>
                  <p className="text-[10px] text-slate-400">{ds.unidades} unidades · {ds.gestores} gestores</p>
                </div>
                <div className="w-36 shrink-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-mono">preenchimento</span>
                    <span className="text-[9px] font-mono font-semibold text-slate-600">{ds.preenchimento}%</span>
                  </div>
                  <ProgressBar value={ds.preenchimento} color={pctColor(ds.preenchimento)} />
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-base font-black font-mono ${ds.media >= 80 ? 'text-emerald-600' : ds.media >= 70 ? 'text-blue-600' : ds.media >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{ds.media.toFixed(1)}</p>
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${CLASS_COLOR[cls]}`}>{cls}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-slate-800">Status por Unidade de Saúde</h3>
          <div className="flex items-center gap-2">
            <select value={filterDS} onChange={e => setFilterDS(e.target.value)}
              className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Todos</option>
              {distritos.map(d => <option key={d.id}>{d.id}</option>)}
            </select>
            <select value={filterSt} onChange={e => setFilterSt(e.target.value)}
              className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Todos</option>
              {['Aprovado', 'Em Análise', 'Pendente', 'Bloqueado'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['Unidade', 'Tipo', 'Responsável', 'Distrito', 'Preench.', 'Nota', 'Status', 'Ações'].map(h => (
                <th key={h} className="text-left text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                  <td className="px-4 py-2.5"><p className="text-xs font-medium text-slate-800">{u.nome}</p></td>
                  <td className="px-4 py-2.5"><span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{u.tipo}</span></td>
                  <td className="px-4 py-2.5"><p className="text-xs text-slate-600">{u.responsavel}</p></td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: DS_COLORS[u.distrito] + '18', color: DS_COLORS[u.distrito] }}>{u.distrito}</span>
                  </td>
                  <td className="px-4 py-2.5 w-28">
                    <div className="flex items-center gap-1.5">
                      <ProgressBar value={u.preenchimento} color={pctColor(u.preenchimento)} />
                      <span className="text-[10px] font-mono text-slate-500 w-7 shrink-0">{u.preenchimento}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {u.nota != null ? <span className={`text-xs font-mono font-bold ${u.nota >= 80 ? 'text-emerald-600' : u.nota >= 70 ? 'text-blue-600' : u.nota >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{u.nota.toFixed(1)}</span>
                      : <span className="text-[10px] text-slate-300 font-mono">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColor(u.status)}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => onVer(u.id)} className="text-[10px] px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors cursor-pointer">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2.5 border-t border-slate-100">
          <p className="text-[10px] text-slate-400">{filtered.length} de {unidades.length} unidades exibidas</p>
        </div>
      </div>
    </div>
  );
}
