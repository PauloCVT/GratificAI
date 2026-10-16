import { beforeEach, describe, expect, it } from 'vitest';
import {
  Campos, UNIDADES, buildIndicadores, distritosVisiveis, indicadoresDaUnidade, pesosPadrao, pesosValidos,
  podeEditarUnidade, preenchimentoEfetivo, unidadesVisiveis,
} from './domain';
import { criarPortaria, definirVigente, getState, portariaVigente, publicarPortaria, resetar, salvarLancamento, submeter } from './store';

beforeEach(() => resetar());

const un = (id: number) => UNIDADES.find(u => u.id === id)!;
const preencherTudo = (unidade: typeof UNIDADES[number]): Campos =>
  Object.fromEntries(
    indicadoresDaUnidade(unidade, portariaVigente().pesos).flatMap(m => m.subs).map(s => [s.id, { n: '8', d: '10' }]),
  );

describe('História 1 — RBAC', () => {
  it('CAM enxerga a rede inteira', () => {
    expect(unidadesVisiveis('cam')).toHaveLength(UNIDADES.length);
    expect(distritosVisiveis('cam')).toHaveLength(8);
  });

  it('gestor distrital enxerga só o próprio distrito', () => {
    const v = unidadesVisiveis('gg');
    expect(v.length).toBeGreaterThan(0);
    expect(v.every(u => u.distrito === 'DS I')).toBe(true);
    expect(distritosVisiveis('gg').map(d => d.id)).toEqual(['DS I']);
  });

  it('técnico de área enxerga só a própria unidade', () => {
    expect(unidadesVisiveis('usf').map(u => u.id)).toEqual([1]);
  });

  it('bloqueia edição fora da jurisdição (também no store)', () => {
    expect(podeEditarUnidade('gg', 3)).toBe(false);
    expect(salvarLancamento('gg', 3, { '1.1': { n: '1', d: '2' } })).toBe(false);
    expect(getState().lancamentos[3]).toBeUndefined();
    expect(salvarLancamento('gg', 1, { '1.1': { n: '1', d: '2' } })).toBe(true);
  });
});

describe('História 2 — Lançamento de indicadores', () => {
  it('USF exibe os 11 subindicadores do Ind 4', () => {
    const ind4 = indicadoresDaUnidade(un(1), pesosPadrao())[3];
    expect(ind4.subs).toHaveLength(11);
  });

  it('persiste o lançamento e atualiza o preenchimento', () => {
    const c: Campos = { '1.1': { n: '9', d: '10' } };
    expect(salvarLancamento('usf', 1, c)).toBe(true);
    expect(getState().lancamentos[1]).toEqual(c);
    expect(preenchimentoEfetivo(un(1), getState().lancamentos[1], pesosPadrao())).toBeLessThan(100);
  });

  it('só submete com todos os subindicadores preenchidos', () => {
    expect(submeter('usf', 1, { '1.1': { n: '9', d: '10' } })).toBe(false);
    expect(submeter('usf', 1, preencherTudo(un(1)))).toBe(true);
    expect(getState().enviadas[1]).toBe(true);
  });
});

describe('História 3 — Ajuste de pesos e regras pela CAM', () => {
  it('pesos precisam somar 100% por linha', () => {
    const p = pesosPadrao();
    expect(pesosValidos(p)).toBe(true);
    p.usf = [20, 20, 20, 30, 0];
    expect(pesosValidos(p)).toBe(false);
  });

  it('só a CAM publica; pesos inválidos são recusados', () => {
    const base = portariaVigente();
    const novos = { ...base.pesos, usf: [10, 20, 20, 50, 0] };
    expect(publicarPortaria('gg', base.id, novos, base.regras)).toBe(false);
    expect(publicarPortaria('cam', base.id, { ...base.pesos, usf: [10, 10, 10, 10, 0] }, base.regras)).toBe(false);
    expect(publicarPortaria('cam', base.id, novos, base.regras)).toBe(true);
    expect(portariaVigente().pesos.usf).toEqual([10, 20, 20, 50, 0]);
  });

  it('novo peso se reflete nos indicadores do lançamento (sem mexer no código)', () => {
    const base = portariaVigente();
    publicarPortaria('cam', base.id, { ...base.pesos, usf: [0, 20, 20, 60, 0] }, base.regras);
    const macros = indicadoresDaUnidade(un(1), portariaVigente().pesos);
    expect(macros[0].ativo).toBe(false);
  });

  it('cria nova portaria a partir da vigente e a torna vigente', () => {
    expect(criarPortaria('gg', 'X')).toBeNull();
    const id = criarPortaria('cam', 'Portaria 05/2025')!;
    expect(getState().portarias).toHaveLength(3);
    expect(portariaVigente().id).toBe(id);
    expect(definirVigente('cam', 'cam-1.2')).toBe(true);
  });

  it('Ind 5 só aparece quando o peso é maior que zero', () => {
    expect(buildIndicadores('usf', [20, 20, 20, 40, 0])[4].ativo).toBe(false);
    expect(buildIndicadores('usf', [20, 20, 20, 20, 20])[4].subs).toHaveLength(3);
  });
});
