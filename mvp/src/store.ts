import { useSyncExternalStore } from 'react';
import {
  Campos, Portaria, Profile, Pesos, Regras, indicadoresDaUnidade, pesosValidos, podeEditarUnidade,
  podeParametrizar, portariasIniciais, progressoDe, regrasValidas, UNIDADES,
} from './domain';

export interface State {
  portarias: Portaria[];
  vigenteId: string;
  lancamentos: Record<number, Campos>;
  enviadas: Record<number, boolean>;
}

const KEY = 'gratificai-mvp-figma-v1';
const inicial = (): State => ({ portarias: portariasIniciais(), vigenteId: 'cam-1.2', lancamentos: {}, enviadas: {} });

const hasStorage = () => typeof localStorage !== 'undefined';

function carregar(): State {
  try {
    const raw = hasStorage() ? localStorage.getItem(KEY) : null;
    if (raw) {
      const s = { ...inicial(), ...JSON.parse(raw) } as State;
      if (s.portarias.some(p => p.id === s.vigenteId)) return s;
    }
  } catch { /* estado corrompido: recomeça */ }
  return inicial();
}

let state: State = carregar();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try { if (hasStorage()) localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* sem persistência */ }
  listeners.forEach(l => l());
}

export const getState = () => state;
export function useStore(): State {
  return useSyncExternalStore(l => { listeners.add(l); return () => { listeners.delete(l); }; }, () => state);
}
export const portariaVigente = (s: State = state) => s.portarias.find(p => p.id === s.vigenteId) ?? s.portarias[0];

// Toda escrita revalida a permissão: esconder botões na tela não é a barreira de segurança.
export function salvarLancamento(perfil: Profile, unidadeId: number, campos: Campos): boolean {
  if (!podeEditarUnidade(perfil, unidadeId)) return false;
  commit({ ...state, lancamentos: { ...state.lancamentos, [unidadeId]: campos }, enviadas: { ...state.enviadas, [unidadeId]: false } });
  return true;
}

export function submeter(perfil: Profile, unidadeId: number, campos: Campos): boolean {
  const un = UNIDADES.find(u => u.id === unidadeId);
  if (!un || !podeEditarUnidade(perfil, unidadeId)) return false;
  if (progressoDe(indicadoresDaUnidade(un, portariaVigente().pesos), campos).pct < 100) return false;
  commit({ ...state, lancamentos: { ...state.lancamentos, [unidadeId]: campos }, enviadas: { ...state.enviadas, [unidadeId]: true } });
  return true;
}

export function definirVigente(perfil: Profile, id: string): boolean {
  if (!podeParametrizar(perfil) || !state.portarias.some(p => p.id === id)) return false;
  commit({ ...state, vigenteId: id });
  return true;
}

export function publicarPortaria(perfil: Profile, id: string, pesos: Pesos, regras: Regras): boolean {
  if (!podeParametrizar(perfil) || !pesosValidos(pesos) || !regrasValidas(regras)) return false;
  if (!state.portarias.some(p => p.id === id)) return false;
  commit({ ...state, portarias: state.portarias.map(p => (p.id === id ? { ...p, pesos, regras } : p)) });
  return true;
}

export function criarPortaria(perfil: Profile, nome: string): string | null {
  const nomeLimpo = nome.trim();
  if (!podeParametrizar(perfil) || !nomeLimpo) return null;
  const base = portariaVigente();
  const id = `portaria-${Date.now()}`;
  const nova: Portaria = { id, nome: nomeLimpo, pesos: structuredClone(base.pesos), regras: { ...base.regras } };
  commit({ ...state, portarias: [...state.portarias, nova], vigenteId: id });
  return id;
}

export const resetar = () => commit(inicial());
