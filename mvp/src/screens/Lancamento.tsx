import { useState } from 'react';
import {
  Campos, PROFILES, Pesos, Profile, Unidade, chaveMatriz, indicadoresDaUnidade, pctDe, progressoDe, tipoParaPerfil, unidadesVisiveis,
} from '../domain';
import { portariaVigente, salvarLancamento, submeter, useStore } from '../store';
import { ProgressBar, pctColor } from '../components/ui';

export function IndicadoresScreen({ profile, unidade, onUnidade }: { profile: Profile; unidade: Unidade; onUnidade: (id: number) => void }) {
  const st = useStore();
  const portaria = portariaVigente(st);
  const p = PROFILES[profile];
  const visiveis = unidadesVisiveis(profile);

  const salvo = st.lancamentos[unidade.id] ?? {};
  const [campos, setCampos] = useState<Campos>(salvo);
  const [activeInd, setActiveInd] = useState(0);
  const [aviso, setAviso] = useState('');

  const indicadores = indicadoresDaUnidade(unidade, portaria.pesos);
  const ativos = indicadores.filter(i => i.ativo);
  const { total: totalSubs, preenchidos: filledSubs, pct: progPct } = progressoDe(indicadores, campos);
  const pronto = totalSubs > 0 && filledSubs === totalSubs;
  const enviada = !!st.enviadas[unidade.id];
  const pesos = portaria.pesos;

  const setCampo = (id: string, field: 'n' | 'd', val: string) => {
    setAviso('');
    setCampos(prev => ({ ...prev, [id]: { ...(prev[id] ?? { n: '', d: '' }), [field]: val } }));
  };

  const salvar = () => setAviso(salvarLancamento(profile, unidade.id, campos) ? 'Rascunho salvo.' : 'Sem permissão para editar esta unidade.');
  const enviar = () => setAviso(submeter(profile, unidade.id, campos) ? 'Indicadores submetidos para a CAM.' : 'Não foi possível submeter: preencha todos os subindicadores.');

  const ind = indicadores[Math.min(activeInd, indicadores.length - 1)];
  const mi = indicadores.indexOf(ind);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans,sans-serif' }}>Lançamento de Indicadores</h1>
          <p className="text-xs text-slate-500 mt-0.5">Perfil: {p.label} · Ciclo 3º Quad. 2024 · Entrada via Numerador / Denominador</p>
        </div>
        <div className="flex items-center gap-2">
          {enviada && <span className="text-[10px] font-semibold px-2.5 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg">Submetido · Em Análise</span>}
          <button onClick={salvar} className="px-4 py-2 bg-[#0f172a] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3a8a] transition-colors cursor-pointer">Salvar Rascunho</button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3 flex-wrap">
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Unidade de Saúde</p>
        {visiveis.length > 1 ? (
          <select value={unidade.id} onChange={e => onUnidade(Number(e.target.value))}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold">
            {visiveis.map(u => <option key={u.id} value={u.id}>{u.nome} · {u.tipo} · {u.distrito}</option>)}
          </select>
        ) : (
          <p className="text-xs font-semibold text-slate-800">{unidade.nome} <span className="font-mono text-slate-400">· {unidade.tipo} · {unidade.distrito}</span></p>
        )}
        <span className="text-[10px] text-slate-400 ml-auto">Portaria vigente: {portaria.nome}</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 px-5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-slate-500 font-medium">Progresso de preenchimento</p>
          <span className="text-[10px] font-mono font-bold text-slate-700">{progPct}%</span>
        </div>
        <ProgressBar value={progPct} color={pctColor(progPct)} />
        <p className="text-[9px] text-slate-400 mt-1">{filledSubs} de {totalSubs} subindicadores preenchidos e válidos</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {ativos.map(i => {
            const idx = indicadores.indexOf(i);
            return (
              <button key={i.id} onClick={() => setActiveInd(idx)}
                className={`relative px-4 py-3 text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 flex items-center gap-1.5
                  ${mi === idx ? 'border-[#1e3a8a] text-[#1e3a8a] bg-blue-50/40' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                <span className="font-mono">Ind {i.id}</span>
                <span className="hidden lg:inline">· {i.nome.split('—')[1]?.trim().split('(')[0].trim()}</span>
                <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1 rounded">{pesoDe(unidade, pesos, idx)}%</span>
              </button>
            );
          })}
        </div>

        {ind && (
          !ind.ativo ? (
            <div className="p-10 text-center text-xs text-slate-400">Este indicador não se aplica à unidade {unidade.tipo}.</div>
          ) : (
            <div className="p-5">
              <div className="mb-4">
                <p className="text-sm font-bold text-slate-800">{ind.nome}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{ind.descricao}</p>
              </div>
              <div className="space-y-4">
                {ind.subs.map(sub => {
                  const c = campos[sub.id];
                  const pct = pctDe(c);
                  return (
                    <div key={sub.id} className={`rounded-xl border p-4 transition-all ${sub.lgpd ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
                      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{sub.id}</span>
                            <p className="text-xs font-semibold text-slate-800">{sub.nome}</p>
                            {sub.lgpd && <span className="text-[9px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full">🔒 LGPD</span>}
                          </div>
                          {sub.descricao && <p className="text-[10px] text-slate-400 mt-0.5">{sub.descricao}</p>}
                          <p className="text-[10px] text-slate-400 mt-0.5">Meta: <span className="font-mono font-semibold text-slate-600">{sub.meta}{sub.meta <= 100 ? '%' : ''}</span></p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-center">
                            <p className="text-[9px] text-slate-400 mb-0.5">Numerador (n)</p>
                            <input type="number" min={0} placeholder="0" value={c?.n ?? ''} onChange={e => setCampo(sub.id, 'n', e.target.value)}
                              className="w-24 text-center text-xs font-mono font-semibold px-2 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" />
                          </div>
                          <span className="text-slate-400 text-lg mt-4">/</span>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-400 mb-0.5">Denominador (d)</p>
                            <input type="number" min={0} placeholder="0" value={c?.d ?? ''} onChange={e => setCampo(sub.id, 'd', e.target.value)}
                              className="w-24 text-center text-xs font-mono font-semibold px-2 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" />
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-400 mb-0.5">% Obtido</p>
                            <div className={`w-20 text-center text-sm font-mono font-black px-2 py-2 rounded-lg border
                              ${pct === null ? 'border-slate-200 bg-slate-50 text-slate-300' : pct >= sub.meta ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                              {pct !== null ? `${pct.toFixed(1)}%` : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                      {pct !== null && (
                        <div className="mt-1.5">
                          <ProgressBar value={Math.min(pct, 100)} color={pct >= sub.meta ? '#10b981' : pct >= 70 ? '#f59e0b' : '#e11d48'} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50 gap-3 flex-wrap">
          <p className="text-[11px]">
            {aviso ? <span className="text-slate-600 font-semibold">{aviso}</span>
              : pronto ? <span className="text-emerald-600 font-semibold">✓ Formulário pronto para submissão</span>
              : <span className="text-amber-600 font-semibold">Preencha todos os subindicadores para submeter.</span>}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => { setCampos(salvo); setAviso(''); }} className="px-3 py-2 border border-slate-300 text-slate-600 text-[11px] font-medium rounded-lg hover:bg-white cursor-pointer">Cancelar</button>
            <button disabled={!pronto} onClick={enviar}
              className="px-4 py-2 bg-[#0f172a] text-white text-[11px] font-semibold rounded-lg hover:bg-[#1e3a8a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors">
              Submeter para CAM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function pesoDe(u: Unidade, pesos: Pesos, idx: number) {
  return pesos[chaveMatriz(tipoParaPerfil(u.tipo))][idx];
}
