import { pctDe } from './domain.ts';
import type { Campos, MacroInd, SubInd } from './domain.ts';

export type SeveridadeValidacao = 'invalid' | 'warning';

export interface ResultadoCampo {
  severidade: SeveridadeValidacao;
  mensagem: string;
  score: number;
  precisaJustificativa: boolean;
  observacoesHistoricas: number;
}

export interface ResultadoAnalise {
  modelo: string;
  campos: Record<string, ResultadoCampo>;
}

interface ObservacaoHistorica {
  subId: string;
  valor: number;
}

const MODELO = 'detector-robusto-v1';
const METRICAS_MEDIA = new Set(['4.M2', '4.M3']);

const mediana = (valores: number[]) => {
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2
    ? ordenados[meio]
    : (ordenados[meio - 1] + ordenados[meio]) / 2;
};

function valorNumerico(valor: string): number | null {
  if (!valor.trim()) return null;
  const normalizado = valor.trim().replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalizado)) return null;
  const convertido = Number(normalizado);
  return Number.isFinite(convertido) ? convertido : null;
}

function invalid(mensagem: string): ResultadoCampo {
  return { severidade: 'invalid', mensagem, score: 1, precisaJustificativa: false, observacoesHistoricas: 0 };
}

function warning(mensagem: string, score = 0.75, observacoesHistoricas = 0): ResultadoCampo {
  return { severidade: 'warning', mensagem, score, precisaJustificativa: true, observacoesHistoricas };
}

function analisarSubindicador(
  sub: SubInd,
  campos: Campos,
  historico: ObservacaoHistorica[],
): ResultadoCampo | undefined {
  const campo = campos[sub.id];
  if (!campo || (!campo.n.trim() && !campo.d.trim())) return undefined;
  if (!campo.n.trim() || !campo.d.trim()) return invalid('Informe numerador e denominador.');

  const n = valorNumerico(campo.n);
  const d = valorNumerico(campo.d);
  if (n === null || d === null) return invalid('Use valores numéricos válidos.');
  if (n < 0 || d < 0) return invalid('Numerador e denominador não podem ser negativos.');
  if (d === 0) return invalid('O denominador deve ser maior que zero.');

  if (sub.id === '1.1' && n === 0) {
    return warning('Nenhuma requisição Hórus foi informada. Confirme o dado ou registre a justificativa técnica.');
  }
  if (sub.id === '2.2' && n > 0) {
    return warning('Há abonos sem justificativa legal. Confirme a quantidade e registre a justificativa técnica.');
  }
  if (!METRICAS_MEDIA.has(sub.id) && n > d) {
    return invalid('O numerador não pode ser maior que o denominador neste indicador.');
  }
  if (METRICAS_MEDIA.has(sub.id) && n / d > sub.meta) {
    return warning(`O resultado excede a meta de ${sub.meta}. Confirme a unidade e o valor informado.`);
  }

  const observacoes = historico.filter(item => item.subId === sub.id).map(item => item.valor);
  const minimoHistorico = 3;
  if (observacoes.length < minimoHistorico) return undefined;

  const centro = mediana(observacoes);
  const desvios = observacoes.map(valor => Math.abs(valor - centro));
  const mad = mediana(desvios);
  const observado = METRICAS_MEDIA.has(sub.id) ? n / d : (pctDe(campo) ?? 0);
  const limite = Math.max(3.5 * 1.4826 * mad, METRICAS_MEDIA.has(sub.id) ? Math.max(Math.abs(centro) * 0.25, 1) : 15);
  const distancia = Math.abs(observado - centro);

  if (distancia <= limite) return undefined;

  const score = Math.min(0.99, Math.max(0.75, distancia / (limite * 2)));
  return warning(
    `Valor discrepante do histórico desta unidade (mediana ${centro.toFixed(1)}; informado ${observado.toFixed(1)}). Confirme ou justifique.`,
    score,
    observacoes.length,
  );
}

export function analisarCampos(
  indicadores: MacroInd[],
  campos: Campos,
  historico: ObservacaoHistorica[] = [],
): ResultadoAnalise {
  const subsAtivos = indicadores.filter(indicador => indicador.ativo).flatMap(indicador => indicador.subs);
  const porId = new Map(subsAtivos.map(sub => [sub.id, sub]));
  const resultados: Record<string, ResultadoCampo> = {};

  for (const id of Object.keys(campos)) {
    if (!porId.has(id)) resultados[id] = invalid('Este subindicador não pertence à unidade ou à portaria vigente.');
  }
  for (const sub of subsAtivos) {
    const resultado = analisarSubindicador(sub, campos, historico);
    if (resultado) resultados[sub.id] = resultado;
  }

  return { modelo: MODELO, campos: resultados };
}

export function resultadoImpedeEnvio(resultado: ResultadoCampo | undefined, justificativa = ''): boolean {
  if (!resultado) return false;
  if (resultado.severidade === 'invalid') return true;
  return resultado.precisaJustificativa && justificativa.trim().length < 20;
}
