Atue como Especialista Sénior em UI/UX e Engenharia de Frontend. Construa um protótipo navegável de alta fidelidade (MVP) para a plataforma corporativa da Secretaria de Saúde do Recife (SESAU), destinada a gerir a Gratificação Variável por Desempenho (Lei Municipal nº 19.060/2023 e Portarias Conjuntas SESAU/SEPLAGTD).

### 1. Diretrizes Visuais & Design System
- **Estilo Visual:** Interface administrativa governamental sóbria, limpa e responsiva (Tailwind CSS com paleta institucional: azul marinho (#0f172a / #1e3a8a), ardósia (#f8fafc / #e2e8f0), detalhes semânticos em esmeralda (#10b981), âmbar (#f59e0b) e rosa/carmesim (#e11d48)).
- **Arquitetura Visual:** Barra de navegação lateral retrátil, cabeçalho institucional fixo com comutador dinâmico de perfis operacionais (RBAC) e área central modular com tabelas com paginação e grelhas analíticas.
- **Conformidade LGPD:** Mascaramento de dados e identificação visual de campos sensíveis (Art. 5º, II da LGPD - licenças e registos de saúde).

---

### 2. Perfis de Acesso & Tipologias Reais Mapeadas (Comutador no Topo)
O sistema deve adaptar os indicadores e a matriz de pesos de acordo com o perfil/cargo selecionado:
1. **Comissão de Avaliação de Metas (CAM / Administrador):** Visão sistémica global, parametrização de fórmulas e homologação.
2. **Cargos de Distrito Sanitário (DS I a DS VIII):**
   - `GG` (Gerente Geral Distrital) e `SnA` (Supervisor de Atenção à Saúde).
   - `SnB1` (Supervisor de Vigilância em Saúde).
   - `SnB2` (Supervisor de Gestão do Trabalho / Administrativo-Financeiro).
3. **Coordenadores de Unidade de Saúde (US - Rede SEAB e SERMAC):**
   - Tipologias: `USF` (Saúde da Família), `UBT` (Básica Tradicional), `UBT MISTA`, `CAPS` (II, III e 24h), `CECON/CECO` (Centro de Convivência), `UCIS` (Cuidados Integrados), `MAC` (Média e Alta Complexidade: 1 a 4), `SAE` (Atenção Especializada) e `NDI`.

---

### 3. Matriz Real de Indicadores e Ponderação Paramétrica (Base: Ficheiro SESAU)

O motor de avaliação apoia-se em 5 Macroindicadores, calculados por razão entre Numerador ($n$) e Denominador ($d$):

* **Indicador 1 - Logística Farmacêutica (Hórus):**
  - *Descrição:* Proporção de registos de receção com requisição encerrada no Hórus em até 2 dias úteis (ou 3 dias na versão CAM 2.0) de MMH e medicamentos.
* **Indicador 2 - Gestão do Trabalho (SEGTES):**
  - *Subindicadores:* 2.1 Mobilidade/CNES (transferências/permuta); 2.2 Abonos sem justificação legal; 2.3 Tempestividade no envio de documentos para folha de pagamento; 2.4 Controlo de vida funcional e homologação de licenças médicas.
* **Indicador 3 - Satisfação do Utilizador (ASU):**
  - *Subindicadores:* 3.1 Índice de satisfação aferido por tipologia de unidade; 3.2 Proporção de avaliações de satisfação recebidas frente à meta amostral.
* **Indicador 4 - Desempenho Operacional da Unidade de Saúde (US):**
  - *Atenção Primária / ESF (USF / UBT Mista):* 11 subindicadores oficiais: 4.1.1 Pré-natal precoce (6 consultas, 1ª até 12ª semana); 4.1.2 Rastreio de Sífilis e HIV em gestantes; 4.1.3 Atendimento odontológico a gestantes; 4.1.4 Exame citopatológico do colo do útero; 4.1.5 Vacinação infantil (Penta e Poliomielite aos 12 meses); 4.1.6 Controlo de Hipertensão (consulta + TA semestral); 4.1.7 Acompanhamento de Diabetes (hemoglobina glicada); 4.1.8 Cadastro individual da população adscrita; 4.1.9 Visitas domiciliares por Agente Comunitário de Saúde (ACS); 4.1.10 Consultas da equipa multiprofissional (médico, enfermeiro, dentista); 4.1.11 Casos de Tuberculose rastreados para HIV.
  - *Saúde Mental (CAPS):* Turnos de acolhimento implantados, rácio de procedimentos/utilizador, atividades coletivas, vínculo territorial, funcionamento do Conselho Gestor e matriciamento de equipas de ESF.
  - *Ambulatórios & Especialidades (UBT / UCIS / CECON / MAC):* Produção da carteira de serviços, tempos médios de espera por acolhimento/classificação de risco, tempo de permanência hospitalar e partos normais em Centro de Parto Normal (CPN).
* **Indicador 5 - Vigilância em Saúde Distrital (Apenas cargos distritais GG, SnA e SnB1):**
  - *Subindicadores:* 5.1 Investigação de óbitos infantis e fetais em prazo legal; 5.2 Cobertura de imóveis visitados para controlo vetorial de arboviroses (6 ciclos anuais na base RG); 5.3 Emissão tempestiva de licenças sanitárias de alto risco.

#### Matriz de Pesos Oficiais por Cargo (Total = 1.0 / 100%):
| Cargo / Tipologia | Ind 1 (Hórus) | Ind 2 (Gestão Trab.) | Ind 3 (ASU) | Ind 4 (Desempenho US) | Ind 5 (Vigilância) |
|---|:---:|:---:|:---:|:---:|:---:|
| **USF / UBT / CAPS / UCIS** | 20% | 20% | 20% | 40% | -- |
| **CECON** | -- | 30% | 30% | 40% | -- |
| **MAC (Média/Alta Complexidade)** | 20% | 20% | 20% | 40% | -- |
| **GG (Gerente Geral) e SnA (Atenção)** | 20% | 20% | 20% | 20% | 20% |
| **SnB1 (Vigilância em Saúde)** | 20% | -- | 20% | 30% | 30% |
| **SnB2 (Administrativo-Financeiro)**| -- | 40% | 30% | 30% | -- |

---

### 4. Especificação dos 4 Ecrãs Obrigatórios

#### Ecrã 1: Painel Geral de Desempenho & Monitorização Territorial
- **Barra Superior de Indicadores:** Total de gestores monitorizados (214), Distritos parametrizados (DS I a DS VIII), Índice médio de cumprimento global da rede e Alertas de consistência emitidos pelo modelo de ML.
- **Grelha Territorial (DS I a DS VIII):** Listagem com nome do Distrito Sanitário, total de unidades sob gestão, barra de progresso no preenchimento dos prazos, média consolidada do distrito e classificação de desempenho obtida:
  - *Faixas de Classificação:* Insuficiente (<60%), Regular (60-69%), Satisfatório (70-79%) ou Excelente (≥80%).
- **Temporizador de Corte:** Caixa de destaque indicando a contagem decrescente para a trava temporal automática do ciclo corrente.

#### Ecrã 2: Lançamento de Indicadores & Validação Inteligente (Shift-Left)
- **Formulário Dinâmico Orientado à Unidade:** Os campos adaptam-se à unidade selecionada (ex: se for `USF`, exibir os 11 indicadores de ESF; se for `CAPS`, exibir acolhimento e matriciamento).
- **Campos de Entrada Baseados em Numerador ($n$) e Denominador ($d$):** O utilizador introduz os valores primários (ex: doses aplicadas vs crianças elegíveis) e a percentagem é calculada em tempo real na interface.
- **Simulação do Revisor Silencioso (Machine Learning):**
  - Se for introduzido um valor discrepante do histórico da unidade ou estatisticamente anómalo (ex: Cobertura vacinal > 100%, óbitos infantis em valor negativo ou ausência total de requisições no Hórus), surge imediatamente um *card* de aviso vermelho/âmbar.
  - O sistema bloqueia o botão de submissão definitiva até que uma **Justificação Técnica Obrigatória** seja formalizada para a auditoria.
- **Campos Protegidos (LGPD):** Marcação explícita de privacidade em dados de frequência e licenças funcionais da equipa.

#### Ecrã 3: Motor de Regras & Parametrização CAM
- **Gestão de Versões Normativas:** Seletor de versão das diretrizes (`Versão CAM 1.2` vs `Versão CAM 2.0 - Excecional`).
- **Tabela de Ponderação Matricial:** Visualização e ajuste dinâmico dos pesos atribuídos aos 5 indicadores por cada uma das categorias de cargos (`USF`, `CECON`, `MAC`, `GG`, `SnB1`, `SnB2`).
- **Validador de Soma 100%:** Feedback visual instantâneo garantindo que os pesos parametrizados fecham exatamente no valor unitário ($1.0$).
- **Controlo de Prazos de Envio:** Definição da data-limite de submissão e bloqueio das permissões de escrita por distrito.

#### Ecrã 4: Extrato Individual de Avaliação & Auditoria Legal SEI
- **Cabeçalho Oficial Padronizado:** Brasão/Identificação da Prefeitura do Recife, Secretaria de Saúde (SESAU), Comissão CAM e referência ao Processo Administrativo SEI/Recife.
- **Ficha Funcional do Gestor:** Nome, Matrícula, Função de Confiança, Lotação territorial (ex: USF Boa Vista, DS I) e Ciclo Avaliativo.
- **Memória de Cálculo Transparente:** Tabela discriminando:
  - Macroindicador / Subindicador.
  - Numerador ($n$), Denominador ($d$) e Percentual Obtido.
  - Meta Normativa e Índice de Atingimento.
  - Peso aplicável ao cargo específico do servidor.
  - Pontuação final calculada, Nota Global Consolidada e Valor Estimado da Gratificação Variável em Reais (R$).
- **Trilha de Auditoria Imutável:** Registo cronológico com *timestamp*, utilizador responsável pela inserção dos dados brutos, escore de validação do modelo de IA e carimbo de homologação da CAM.
- **Ação Rápida:** Botão de impressão nativo configurado com estilos `@media print` para exportação direta em PDF para instrução de processos no SEI.

---

### 5. Requisitos de Entrega
- Entregue o protótipo funcional num único ficheiro navegável (utilizando HTML5, Tailwind CSS, Lucide Icons e Vue 3 ou React/Vanilla JS via CDN).
- Todas as interações (mudança de separadores, alteração de perfis, cálculo de percentagens a partir de $n/d$, validação de anomalias por IA e impressão) devem ser totalmente operacionais.