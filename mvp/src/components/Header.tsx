import { useState } from 'react';
import { PROFILES } from '../domain';
import { trocarSenha } from '../store';
import type { Usuario } from '../api';

export function Header({ user, onLogout }: { user: Usuario; onLogout: () => void }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [alterarSenha, setAlterarSenha] = useState(false);
  const profile = user.perfil;
  const p = PROFILES[profile];

  const salvarSenha = async () => {
    try {
      await trocarSenha(senhaAtual, novaSenha);
      setSenhaAtual('');
      setNovaSenha('');
      setMensagem('Senha alterada. As outras sessões foram encerradas.');
    } catch (error) {
      setMensagem(error instanceof Error ? error.message : 'Não foi possível alterar a senha.');
    }
  };

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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
            <div className="w-6 h-6 rounded-md bg-[#0f172a] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">{p.sigla.slice(0,3)}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-semibold text-slate-800 leading-tight">{user.nome}</p>
              <p className="text-[9px] text-slate-400 font-mono">{p.sigla} · {user.distrito ?? user.unidadeNome ?? 'Rede'}</p>
            </div>
          </div>
          <button onClick={() => { setAlterarSenha(!alterarSenha); setMensagem(''); }}
            className="rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-medium text-slate-600 hover:bg-slate-50">Senha</button>
          <button onClick={onLogout} className="rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-medium text-slate-600 hover:bg-slate-50">Sair</button>
        </div>
      </div>
      {alterarSenha && (
        <div className="absolute right-5 top-14 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <p className="mb-3 text-xs font-bold text-slate-800">Alterar senha</p>
          <input type="password" autoComplete="current-password" placeholder="Senha atual" value={senhaAtual}
            onChange={event => setSenhaAtual(event.target.value)} className="mb-2 w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs" />
          <input type="password" autoComplete="new-password" placeholder="Nova senha (mín. 12 caracteres)" value={novaSenha}
            onChange={event => setNovaSenha(event.target.value)} className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs" />
          {mensagem && <p role="status" className="mt-2 text-[10px] text-slate-600">{mensagem}</p>}
          <button onClick={() => { void salvarSenha(); }} disabled={!senhaAtual || novaSenha.length < 12}
            className="mt-3 w-full rounded-md bg-[#0f172a] px-3 py-2 text-[10px] font-semibold text-white disabled:opacity-50">Salvar nova senha</button>
        </div>
      )}
    </header>
  );
}
