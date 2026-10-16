// ─── Tipos ─────────────────────────────────────────────────────────────────────
export type Profile = 'cam' | 'gg' | 'sna' | 'snb1' | 'snb2' | 'usf' | 'caps' | 'cecon' | 'mac';
export type Screen = 'dashboard' | 'indicadores' | 'motor';
export type StatusEnvio = 'Pendente' | 'Em Análise' | 'Aprovado' | 'Bloqueado';
export type Classificacao = 'Insuficiente' | 'Regular' | 'Satisfatório' | 'Excelente';

// ─── Perfis (RBAC) ─────────────────────────────────────────────────────────────
// distrito  → gestor distrital: só enxerga/edita unidades do seu distrito
// unidadeId → técnico de área: só enxerga/edita a própria unidade
export interface ProfileCfg {
  label: string; sigla: string; nivel: string; color: string; screens: Screen[];
  distrito?: string; unidadeId?: number;
}

export const PROFILES: Record<Profile, ProfileCfg> = {
  cam:   { label: 'CAM · Comissão de Avaliação',    sigla: 'CAM',  nivel: 'Global',            color: 'bg-rose-100 text-rose-700 border-rose-200',     screens: ['dashboard','indicadores','motor'] },
  gg:    { label: 'GG · Gerente Geral Distrital',   sigla: 'GG',   nivel: 'Distrito · DS I',   color: 'bg-blue-100 text-blue-700 border-blue-200',      screens: ['dashboard','indicadores'], distrito: 'DS I' },
  sna:   { label: 'SnA · Supervisor Atenção Saúde', sigla: 'SnA',  nivel: 'Distrito · DS II',  color: 'bg-blue-100 text-blue-700 border-blue-200',      screens: ['dashboard','indicadores'], distrito: 'DS II' },
  snb1:  { label: 'SnB1 · Supervisor Vigilância',   sigla: 'SnB1', nivel: 'Distrito · DS III', color: 'bg-violet-100 text-violet-700 border-violet-200', screens: ['dashboard','indicadores'], distrito: 'DS III' },
  snb2:  { label: 'SnB2 · Supervisor Adm-Financ.',  sigla: 'SnB2', nivel: 'Distrito · DS VII', color: 'bg-amber-100 text-amber-700 border-amber-200',   screens: ['dashboard','indicadores'], distrito: 'DS VII' },
  usf:   { label: 'USF / UBT · Atenção Primária',   sigla: 'USF',  nivel: 'Unidade',           color: 'bg-emerald-100 text-emerald-700 border-emerald-200', screens: ['dashboard','indicadores'], unidadeId: 1 },
  caps:  { label: 'CAPS · Saúde Mental',            sigla: 'CAPS', nivel: 'Unidade',           color: 'bg-teal-100 text-teal-700 border-teal-200',      screens: ['dashboard','indicadores'], unidadeId: 3 },
  cecon: { label: 'CECON / CECO · Convivência',     sigla: 'CECO', nivel: 'Unidade',           color: 'bg-cyan-100 text-cyan-700 border-cyan-200',      screens: ['dashboard','indicadores'], unidadeId: 8 },
  mac:   { label: 'MAC · Média/Alta Complexidade',  sigla: 'MAC',  nivel: 'Unidade',           color: 'bg-indigo-100 text-indigo-700 border-indigo-200', screens: ['dashboard','indicadores'], unidadeId: 5 },
};
export const PROFILE_ORDER: Profile[] = ['cam','gg','sna','snb1','snb2','usf','caps','cecon','mac'];

// ─── Distritos e unidades ─────────────────────────────────────────────────────
export interface Distrito {
  id: string; nome: string; unidades: number; preenchimento: number; media: number; gestores: number;
}
export const DISTRITOS: Distrito[] = [
  { id: 'DS I',   nome: 'DS I — Recife/Boa Vista',     unidades: 18, preenchimento: 92, media: 84.2, gestores: 28 },
  { id: 'DS II',  nome: 'DS II — Benfica',              unidades: 14, preenchimento: 78, media: 72.1, gestores: 21 },
  { id: 'DS III', nome: 'DS III — Três Carneiros',      unidades: 20, preenchimento: 65, media: 61.8, gestores: 31 },
  { id: 'DS IV',  nome: 'DS IV — Torrões',              unidades: 16, preenchimento: 88, media: 81.5, gestores: 25 },
  { id: 'DS V',   nome: 'DS V — Vasco da Gama',         unidades: 22, preenchimento: 55, media: 57.3, gestores: 34 },
  { id: 'DS VI',  nome: 'DS VI — Imbiribeira',          unidades: 15, preenchimento: 80, media: 76.9, gestores: 23 },
  { id: 'DS VII', nome: 'DS VII — Boa Viagem',          unidades: 19, preenchimento: 95, media: 88.4, gestores: 29 },
  { id: 'DS VIII',nome: 'DS VIII — Recife/Santo Amaro', unidades: 17, preenchimento: 70, media: 67.3, gestores: 23 },
];
export const DS_COLORS: Record<string, string> = {
  'DS I':'#1e3a8a','DS II':'#7c3aed','DS III':'#be185d','DS IV':'#059669',
  'DS V':'#d97706','DS VI':'#0891b2','DS VII':'#65a30d','DS VIII':'#9f1239',
};

export function classificar(n: number): Classificacao {
  if (n >= 80) return 'Excelente';
  if (n >= 70) return 'Satisfatório';
  if (n >= 60) return 'Regular';
  return 'Insuficiente';
}
export const CLASS_COLOR: Record<Classificacao, string> = {
  Excelente: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Satisfatório: 'bg-blue-100 text-blue-700 border-blue-200',
  Regular: 'bg-amber-100 text-amber-700 border-amber-200',
  Insuficiente: 'bg-rose-100 text-rose-700 border-rose-200',
};

export interface Unidade { id: number; nome: string; tipo: string; responsavel: string; distrito: string; status: StatusEnvio; preenchimento: number; nota: number | null; }
export const UNIDADES: Unidade[] = [
  { id:1, nome:'USF Alto José do Pinho',      tipo:'USF',  responsavel:'Dra. Carla Mendonça',       distrito:'DS I',    status:'Aprovado',    preenchimento:100, nota:84.2 },
  { id:2, nome:'UBT Casa Amarela',             tipo:'UBT',  responsavel:'Dr. Fábio Lins',             distrito:'DS I',    status:'Em Análise',  preenchimento:90,  nota:72.1 },
  { id:3, nome:'CAPS II Mangueira',            tipo:'CAPS', responsavel:'Enf. Tatiana Ramos',         distrito:'DS II',   status:'Pendente',    preenchimento:55,  nota:null },
  { id:4, nome:'USF Dois Unidos',              tipo:'USF',  responsavel:'Dr. Marcos Ferraz',          distrito:'DS II',   status:'Pendente',    preenchimento:40,  nota:null },
  { id:5, nome:'PSM Torrões',                  tipo:'MAC',  responsavel:'Dra. Ana Cristina Luz',      distrito:'DS III',  status:'Bloqueado',   preenchimento:100, nota:54.1 },
  { id:6, nome:'USF Vasco da Gama',            tipo:'USF',  responsavel:'Enf. Rodrigo Peixoto',       distrito:'DS IV',   status:'Aprovado',    preenchimento:100, nota:91.0 },
  { id:7, nome:'USF Boa Viagem Sul',           tipo:'USF',  responsavel:'Dra. Lúcia Cavalcanti',      distrito:'DS VII',  status:'Em Análise',  preenchimento:88,  nota:82.5 },
  { id:8, nome:'CECON Imbiribeira',            tipo:'CECON',responsavel:'Dr. Paulo Sérgio Alves',     distrito:'DS VI',   status:'Pendente',    preenchimento:22,  nota:null },
  { id:9, nome:'USF Mustardinha',              tipo:'USF',  responsavel:'Enf. Fernanda Queiroz',      distrito:'DS VII',  status:'Aprovado',    preenchimento:100, nota:76.8 },
  { id:10,nome:'Hospital Agamenon Magalhães',  tipo:'MAC',  responsavel:'Dr. Hélio Novaes',           distrito:'DS VIII', status:'Em Análise',  preenchimento:75,  nota:68.3 },
  { id:11,nome:'CAPS III Boa Vista',           tipo:'CAPS', responsavel:'Psic. Marina Cavalcante',    distrito:'DS I',    status:'Aprovado',    preenchimento:100, nota:87.6 },
  { id:12,nome:'UCIS Santo Amaro',             tipo:'MAC',  responsavel:'Dra. Roberta Siqueira',      distrito:'DS VIII', status:'Pendente',    preenchimento:30,  nota:null },
];

// ─── RBAC ─────────────────────────────────────────────────────────────────────
export function unidadesVisiveis(profile: Profile, todas: Unidade[] = UNIDADES): Unidade[] {
  const p = PROFILES[profile];
  if (p.unidadeId !== undefined) return todas.filter(u => u.id === p.unidadeId);
  if (p.distrito !== undefined) return todas.filter(u => u.distrito === p.distrito);
  return todas;
}

export function distritosVisiveis(profile: Profile): Distrito[] {
  if (profile === 'cam') return DISTRITOS;
  const ids = new Set(unidadesVisiveis(profile).map(u => u.distrito));
  return DISTRITOS.filter(d => ids.has(d.id));
}

export const podeEditarUnidade = (profile: Profile, unidadeId: number) =>
  unidadesVisiveis(profile).some(u => u.id === unidadeId);

export const podeParametrizar = (profile: Profile) => profile === 'cam';

export const jurisdicao = (profile: Profile) => {
  const p = PROFILES[profile];
  if (p.unidadeId !== undefined) return UNIDADES.find(u => u.id === p.unidadeId)?.nome ?? 'Unidade';
  if (p.distrito !== undefined) return p.distrito;
  return 'Rede completa (DS I a DS VIII)';
};

// ─── Matriz de pesos e regras da portaria ────────────────────────────────────
export const MATRIZ_KEYS = ['usf','cecon','mac','gg','sna','snb1','snb2'] as const;
export type MatrizKey = typeof MATRIZ_KEYS[number];
export type Pesos = Record<MatrizKey, number[]>;

export const CARGO_LABELS: Record<MatrizKey, string> = {
  usf: 'USF/UBT/CAPS/UCIS', cecon: 'CECON', mac: 'MAC', gg: 'GG', sna: 'SnA', snb1: 'SnB1', snb2: 'SnB2',
};

export const pesosPadrao = (): Pesos => ({
  usf:   [20, 20, 20, 40,  0],
  cecon: [ 0, 30, 30, 40,  0],
  mac:   [20, 20, 20, 40,  0],
  gg:    [20, 20, 20, 20, 20],
  sna:   [20, 20, 20, 20, 20],
  snb1:  [20,  0, 20, 30, 30],
  snb2:  [ 0, 40, 30, 30,  0],
});

export const chaveMatriz = (p: Profile): MatrizKey => p === 'caps' ? 'usf' : p === 'cam' ? 'gg' : p;
export const somaPesos = (row: number[]) => row.reduce((s, v) => s + v, 0);
export const pesosValidos = (p: Pesos) => MATRIZ_KEYS.every(k => p[k].length === 5 && p[k].every(Number.isFinite) && somaPesos(p[k]) === 100);

export interface Regras { vref: number; corte: number; fatorMac: number; fatorDistrital: number; prazoHorusDias: number }
export interface Portaria { id: string; nome: string; pesos: Pesos; regras: Regras }

export const portariasIniciais = (): Portaria[] => [
  { id: 'cam-1.2', nome: 'Versão CAM 1.2 — Padrão',      pesos: pesosPadrao(), regras: { vref: 4800, corte: 60, fatorMac: 1.05, fatorDistrital: 1.08, prazoHorusDias: 2 } },
  { id: 'cam-2.0', nome: 'Versão CAM 2.0 — Excepcional', pesos: pesosPadrao(), regras: { vref: 4800, corte: 60, fatorMac: 1.05, fatorDistrital: 1.08, prazoHorusDias: 3 } },
];

export const regrasValidas = (r: Regras) =>
  r.vref > 0 && r.corte >= 0 && r.corte <= 100 && r.fatorMac > 0 && r.fatorDistrital > 0 && Number.isInteger(r.prazoHorusDias) && r.prazoHorusDias > 0;

// ─── Indicadores ──────────────────────────────────────────────────────────────
export interface SubInd { id: string; nome: string; descricao: string; meta: number; lgpd?: boolean }
export interface MacroInd { id: number; nome: string; descricao: string; ativo: boolean; subs: SubInd[] }
export type Campos = Record<string, { n: string; d: string }>;

const sub = (id: string, nome: string, descricao: string, meta: number, lgpd?: boolean): SubInd => ({ id, nome, descricao, meta, lgpd });

type Ind4Key = 'usf' | 'caps' | 'cecon' | 'mac';
const IND4: Record<Ind4Key, SubInd[]> = {
  usf: [
    sub('4.1.1','Pré-natal precoce (≥6, 1ª até 12ª sem.)','',90), sub('4.1.2','Rastreio Sífilis e HIV gestantes','',95),
    sub('4.1.3','Atend. odontológico a gestantes','',70), sub('4.1.4','Exame citopatológico colo do útero','',80),
    sub('4.1.5','Vacinação Penta + Pólio aos 12m','',95), sub('4.1.6','Controlo HAS (consulta + TA semestral)','',75),
    sub('4.1.7','Acompanham. DM (hemoglobina glicada)','',70), sub('4.1.8','Cadastro individual população adscrita','',90),
    sub('4.1.9','Visitas domiciliares por ACS','',85), sub('4.1.10','Consultas equipa multiprofissional','',80),
    sub('4.1.11','TB rastreados para HIV','',80),
  ],
  caps: [
    sub('4.C1','Turnos de acolhimento implantados','',90), sub('4.C2','Procedimentos / utilizador (rácio)','',75),
    sub('4.C3','Atividades coletivas realizadas','',80), sub('4.C4','Funcionamento Conselho Gestor','',100),
    sub('4.C5','Matriciamento equipas ESF','',70),
  ],
  cecon: [ sub('4.E1','Produção carteira de serviços','',85), sub('4.E2','Atividades de convivência realizadas','',80) ],
  mac: [
    sub('4.M1','Produção ambulatorial (carteira)','',85), sub('4.M2','Tempo médio espera acolhimento','Meta: ≤ 30 min',30),
    sub('4.M3','Tempo permanência hospitalar','Meta: ≤ 5 dias',5), sub('4.M4','Partos normais em CPN','',60),
  ],
};

export function tipoParaPerfil(tipo: string): Ind4Key {
  if (tipo === 'CAPS') return 'caps';
  if (tipo === 'CECON') return 'cecon';
  if (tipo === 'MAC') return 'mac';
  return 'usf'; // USF e UBT
}

export function buildIndicadores(ind4: Ind4Key, pesos: number[]): MacroInd[] {
  const at = (i: number) => (pesos[i] ?? 0) > 0;
  return [
    { id:1, nome:'Ind 1 — Logística Farmacêutica (Hórus)', descricao:'Proporção de receções com requisição encerrada no Hórus em até 2 dias úteis', ativo: at(0), subs: at(0) ? [sub('1.1','Requisições encerradas no Hórus em prazo','MMH e medicamentos',90)] : [] },
    { id:2, nome:'Ind 2 — Gestão do Trabalho (SEGTES)', descricao:'Subindicadores funcionais: mobilidade CNES, abonos, folha e vida funcional', ativo: at(1), subs: at(1) ? [
      sub('2.1','Mobilidade/CNES (transferências/permuta)','',95,true),
      sub('2.2','Abonos sem justificação legal','Meta: 0 ocorrências',0,true),
      sub('2.3','Tempestividade — folha de pagamento','Docs. enviados no prazo',100,true),
      sub('2.4','Homologação licenças médicas','',100,true),
    ] : [] },
    { id:3, nome:'Ind 3 — Satisfação do Utilizador (ASU)', descricao:'Índice de satisfação por tipologia e proporção de avaliações recebidas', ativo: at(2), subs: at(2) ? [
      sub('3.1','Índice de satisfação (tipologia)','',80),
      sub('3.2','Proporção de avaliações recebidas','',70),
    ] : [] },
    { id:4, nome:'Ind 4 — Desempenho Operacional da US', descricao:'Indicadores específicos por tipologia de unidade de saúde', ativo: at(3), subs: at(3) ? IND4[ind4] : [] },
    { id:5, nome:'Ind 5 — Vigilância em Saúde Distrital', descricao:'Exclusivo para cargos distritais GG, SnA e SnB1', ativo: at(4), subs: at(4) ? [
      sub('5.1','Investigação óbitos infantis/fetais','Em prazo legal — SINAN',100),
      sub('5.2','Imóveis visitados — arboviroses','6 ciclos anuais, base RG',80),
      sub('5.3','Licenças sanitárias alto risco','Emissão tempestiva',90),
    ] : [] },
  ];
}

export function indicadoresDaUnidade(u: Unidade, pesos: Pesos): MacroInd[] {
  const perfil = tipoParaPerfil(u.tipo);
  return buildIndicadores(perfil, pesos[chaveMatriz(perfil)]);
}

export function pctDe(c: { n: string; d: string } | undefined): number | null {
  if (!c) return null;
  const n = parseFloat(c.n), d = parseFloat(c.d);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0 || n < 0) return null;
  return (n / d) * 100;
}

export function progressoDe(macros: MacroInd[], campos: Campos) {
  const subs = macros.filter(m => m.ativo).flatMap(m => m.subs);
  const preenchidos = subs.filter(s => pctDe(campos[s.id]) !== null).length;
  return { total: subs.length, preenchidos, pct: subs.length ? Math.round((preenchidos / subs.length) * 100) : 0 };
}

// Sem digitação própria, vale o valor de referência do protótipo.
export function preenchimentoEfetivo(u: Unidade, campos: Campos | undefined, pesos: Pesos): number {
  if (!campos) return u.preenchimento;
  return progressoDe(indicadoresDaUnidade(u, pesos), campos).pct;
}

export const statusEfetivo = (u: Unidade, enviada: boolean): StatusEnvio => (enviada ? 'Em Análise' : u.status);
