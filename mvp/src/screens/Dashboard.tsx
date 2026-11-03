import { useMemo, useState } from 'react';
import { Usuario } from '../api';
import { DS_COLORS, DISTRITOS, Profile, PROFILES } from '../domain';
import { useStore } from '../store';
import { ProgressBar, pctColor, statusColor } from '../components/ui';

export function DashboardScreen({
  user,
  onVer,
  onAdministracao,
}: {
  user: Usuario;
  onVer: (unidadeId: number) => void;
  onAdministracao: () => void;
}) {
  const st = useStore();
  const profile: Profile = user.perfil;
  const [filterDS, setFilterDS] = useState('Todos');
  const [filterSt, setFilterSt] = useState('Todos');
  const unidades = st.unidades;
  const distritos = profile === 'cam'
    ? DISTRITOS
    : st.distritos.filter(distrito => user.distrito === distrito.id || unidades.some(unidade => unidade.distrito === distrito.id));
  const distritosComUnidades = distritos.filter(distrito => unidades.some(unidade => unidade.distrito === distrito.id));
  const mediaPreenchimento = unidades.length
    ? unidades.reduce((total, unidade) => total + unidade.preenchimento, 0) / unidades.length
    : null;
  const enviados = Object.values(st.enviadas).filter(Boolean).length;
  const filtradas = useMemo(() => unidades.filter(unidade =>
    (filterDS === 'Todos' || unidade.distrito === filterDS) &&
    (filterSt === 'Todos' || unidade.status === filterSt),
  ), [unidades, filterDS, filterSt]);

  const resumoDistritos = distritos.map(distrito => {
    const daRegiao = unidades.filter(unidade => unidade.distrito === distrito.id);
    const preenchimento = daRegiao.length
      ? daRegiao.reduce((total, unidade) => total + unidade.preenchimento, 0) / daRegiao.length
      : 0;
    return {
      ...distrito,
      unidades: daRegiao.length,
      enviadas: daRegiao.filter(unidade => st.enviadas[unidade.id]).length,
      preenchimento,
    };
  });

  const cards = [
    { label: 'Unidades cadastradas', value: String(unidades.length), sub: 'Registros reais na base', icon: '◈', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Distritos com unidades', value: String(distritosComUnidades.length), sub: `${distritos.length} distritos no escopo`, icon: '◉', color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Lançamentos submetidos', value: String(enviados), sub: mediaPreenchimento === null ? 'Sem dados de desempenho' : `Preenchimento médio ${mediaPreenchimento.toFixed(1)}%`, icon: '◆', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-5 p-5">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Painel de desempenho</h1>
        <p className="mt-1 text-xs text-slate-500">
          Perfil: {PROFILES[profile].label} · Escopo: {user.distrito ?? user.unidadeNome ?? 'Rede completa'}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map(card => (
          <div key={card.label} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
              <span className={`flex h-6 w-6 items-center justify-center rounded-md text-sm ${card.bg} ${card.color}`}>{card.icon}</span>
            </div>
            <p className="font-mono text-lg font-black leading-none text-slate-900">{card.value}</p>
            <p className="text-[10px] text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-800">Resumo territorial</h2>
          <p className="mt-0.5 text-[10px] text-slate-400">Indicadores calculados somente a partir dos lançamentos atualmente cadastrados.</p>
        </div>
        {resumoDistritos.length ? <div className="divide-y divide-slate-50">
          {resumoDistritos.map(distrito => (
            <div key={distrito.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
              <div className="h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: DS_COLORS[distrito.id] ?? '#64748b' }} />
              <div className="min-w-32 flex-1">
                <p className="text-xs font-semibold text-slate-800">{distrito.nome}</p>
                <p className="text-[10px] text-slate-400">{distrito.unidades} unidades · {distrito.enviadas} submetidas</p>
              </div>
              <div className="w-40 space-y-1">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>preenchimento médio</span>
                  <span className="font-mono font-semibold text-slate-600">{distrito.unidades ? `${distrito.preenchimento.toFixed(1)}%` : 'Sem dados'}</span>
                </div>
                <ProgressBar value={distrito.preenchimento} color={pctColor(distrito.preenchimento)} />
              </div>
            </div>
          ))}
        </div> : <p className="px-5 py-6 text-xs text-slate-500">Seu perfil ainda não tem distrito ou unidade associados.</p>}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Unidades no seu escopo</h2>
            <p className="mt-0.5 text-[10px] text-slate-400">A pontuação final só será exibida quando o cálculo normativo estiver configurado.</p>
          </div>
          <div className="flex gap-2">
            <select value={filterDS} onChange={event => setFilterDS(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-600">
              <option>Todos</option>{distritos.map(distrito => <option key={distrito.id}>{distrito.id}</option>)}
            </select>
            <select value={filterSt} onChange={event => setFilterSt(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-600">
              <option>Todos</option><option>Pendente</option><option>Em Análise</option>
            </select>
          </div>
        </div>
        {filtradas.length ? <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['Unidade', 'Tipo', 'Distrito', 'Preenchimento', 'Status', 'Ações'].map(label => (
                <th key={label} className="px-4 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</th>
              ))}
            </tr></thead>
            <tbody>{filtradas.map((unidade, index) => (
              <tr key={unidade.id} className={`border-b border-slate-50 hover:bg-slate-50 ${index % 2 ? 'bg-slate-50/30' : ''}`}>
                <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{unidade.nome}</td>
                <td className="px-4 py-2.5"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600">{unidade.tipo}</span></td>
                <td className="px-4 py-2.5"><span className="rounded px-2 py-0.5 font-mono text-[10px] font-semibold" style={{ backgroundColor: `${DS_COLORS[unidade.distrito] ?? '#64748b'}18`, color: DS_COLORS[unidade.distrito] ?? '#475569' }}>{unidade.distrito}</span></td>
                <td className="w-40 px-4 py-2.5"><div className="flex items-center gap-2"><ProgressBar value={unidade.preenchimento} color={pctColor(unidade.preenchimento)} /><span className="w-8 shrink-0 font-mono text-[10px] text-slate-500">{unidade.preenchimento}%</span></div></td>
                <td className="px-4 py-2.5"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor(unidade.status)}`}>{unidade.status}</span></td>
                <td className="px-4 py-2.5"><button onClick={() => onVer(unidade.id)} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-200">Abrir</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div> : (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-semibold text-slate-700">A base está limpa</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">Não há unidades ou dados demonstrativos cadastrados neste escopo. Cadastre unidades e contas para começar.</p>
            {profile === 'cam' && <button onClick={onAdministracao} className="mt-4 rounded-lg bg-[#0f172a] px-4 py-2 text-xs font-semibold text-white">Abrir cadastros da CAM</button>}
          </div>
        )}
        <div className="border-t border-slate-100 px-5 py-2.5"><p className="text-[10px] text-slate-400">{filtradas.length} de {unidades.length} unidades exibidas</p></div>
      </section>
    </div>
  );
}
