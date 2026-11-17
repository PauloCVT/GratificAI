# GratificAI

MVP para monitoramento e lançamento dos indicadores de desempenho da SESAU Recife. A aplicação em `mvp/` contém interface React, API Node.js e banco relacional SQLite. A base começa sem unidades, contas de teste, nomes de pessoas ou resultados demonstrativos.

## Requisitos

- Node.js 22.18 ou superior (Node 24 recomendado pelo módulo SQLite nativo).
- npm.

## Provisionar o primeiro acesso

Não há credenciais padrão, registro público nem seletor de perfil. A primeira conta precisa ser criada explicitamente como CAM. No PowerShell:

```powershell
cd mvp
npm install
$env:BOOTSTRAP_CAM_EMAIL = "seu.email@instituicao.gov.br"
$env:BOOTSTRAP_CAM_PASSWORD = "UmaSenhaForte2026!"
$env:BOOTSTRAP_CAM_NAME = "Administrador CAM"
npm run db:bootstrap
Remove-Item Env:BOOTSTRAP_CAM_EMAIL
Remove-Item Env:BOOTSTRAP_CAM_PASSWORD
Remove-Item Env:BOOTSTRAP_CAM_NAME
npm run dev
```

A senha deve conter pelo menos 12 caracteres, maiúsculas, minúsculas e números. Guarde-a num gestor de segredos, não no repositório, histórico do terminal partilhado ou ficheiro `.env` versionado. A senha de bootstrap é temporária: o primeiro acesso obriga a alterá-la antes de carregar qualquer dado. A conta CAM inicial pode criar unidades e contas com perfil CAM, GG, SnA, SnB1, SnB2, USF/UBT, CAPS, CECON/CECO ou MAC. Cada conta fica vinculada a um distrito ou unidade conforme o perfil, e a senha inicial também é trocada no primeiro acesso.

O Vite serve a interface em `http://localhost:5173` e encaminha `/api` para o backend em `http://127.0.0.1:3001`. Os dados ficam em `mvp/data/gratificai.sqlite`, ignorada pelo Git. `DATABASE_PATH`, `API_PORT` e `API_HOST` permitem configurar a execução. O backend fica limitado a loopback por padrão.

Para hospedagem pública, não use `npm run dev`. Gere a interface com `npm run build`, configure `NODE_ENV=production`, `APP_ORIGIN` como a origem HTTPS pública e `DATABASE_PATH` como caminho absoluto em volume persistente. O servidor recusa iniciar em produção sem essas configurações de origem/caminho. Use `npm start` para iniciar a API; sirva `dist/` no mesmo domínio por um proxy TLS confiável, encaminhe `/api` à API e mantenha a porta da API privada. A hospedagem deve oferecer uma única instância para o SQLite e aplicar a política institucional de backup, retenção e criptografia. Não publique até configurar e testar esses controles no provedor escolhido.

## Banco e limpeza dos dados anteriores

SQLite mantém tabelas relacionais para distritos, unidades, usuários, sessões, portarias, lançamentos, histórico estatístico e auditoria, com chaves estrangeiras, índices e restrições. A primeira migração substitui o esquema antigo do protótipo e remove lançamentos, usuários simulados e estatísticas de demonstração. Somente os códigos oficiais dos oito distritos e as duas portarias normativas padrão são inicializados; novas unidades e usuários devem ser cadastrados pela CAM.

O arquivo `.sqlite` existente é persistente e pode conter dados reais. Faça uma cópia antes de atualizar uma instalação que já tenha usuários ou dados que devam ser preservados. A migração legada desta versão limpa o esquema anterior de demonstração; não a use como migração de produção sem backup e revisão.

## Autenticação e segurança

Consulte [SEGURANCA.md](./SEGURANCA.md) para o inventário e classificação preliminares, matriz de riscos, fluxo RBAC, evidências, limitações e checklist de implantação. A validação institucional e o aceite dos riscos residuais continuam pendentes.

- Senhas armazenadas com scrypt e salt exclusivo; requisitos mínimos de complexidade e troca de senha autenticada.
- Sessões opacas no servidor, expiradas após oito horas; cookie `HttpOnly`, `SameSite=Strict`, `Secure` em produção.
- Tokens CSRF para operações mutáveis, verificação de origem configurada e limitação de tentativas de login.
- Perfil e escopo vêm exclusivamente da sessão validada no servidor; cabeçalhos e seletores do navegador não concedem permissões.
- Perfis distritais acessam somente unidades do seu distrito; perfis de unidade acessam somente a unidade associada; somente CAM parametriza e administra contas/unidades.
- Cabeçalhos de segurança, limites para requisições e validação de payloads; trilha de auditoria append-only pela aplicação, com usuário e timestamp.

Para produção, configure TLS num proxy reverso confiável, defina `APP_ORIGIN` para a origem HTTPS pública e `NODE_ENV=production`; o cookie passa a exigir HTTPS. Proteja o arquivo do banco e suas cópias com permissões do sistema operativo, backups cifrados e controles operacionais. SQLite é adequado ao MVP em instância única; para vários servidores ou alta concorrência, use um banco gerenciado e um mecanismo compartilhado de sessões/rate limit. Integre SSO institucional antes de uso oficial e valide retenção, acesso e auditoria com a equipe de segurança e LGPD.

## Fluxo de submissão e revisão da CAM

Somente a conta vinculada à unidade preenche e submete seus indicadores. Após o envio, o lançamento passa para **Em Análise** e fica bloqueado para edição enquanto aguarda a CAM. No painel geral, a CAM pode revisar os indicadores e justificativas, então **aprovar** ou **devolver para ajustes** com parecer obrigatório de 20 a 1000 caracteres. Lançamentos devolvidos podem ser corrigidos e reenviados; o parecer permanece visível na tela de lançamento até a nova submissão. Após aprovado, o lançamento fica somente para leitura. Os status e o parecer são persistidos no SQLite e retornados no estado da API, inclusive após reiniciar o serviço. Apenas dados aprovados entram no histórico usado pelo Isolation Forest; tentativas devolvidas não contaminam o treinamento.

## Validação inteligente

A validação combina regras determinísticas com um Isolation Forest não supervisionado. Em cada análise, ajusta 100 árvores com até 32 amostras das últimas 50 submissões da mesma unidade e subindicador; só pontua anomalias com pelo menos 12 observações históricas. O índice de anomalia a partir de 0,65 gera um alerta para revisão, não uma probabilidade nem confirmação de erro. Valores matematicamente inválidos continuam bloqueados pelas regras; alertas podem ser justificados. O modelo não altera números e não garante a veracidade dos dados.

## Comandos

```powershell
cd mvp
npm test
npm run build
```

Rotas principais: `GET /api/auth/setup`, `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout`, `POST /api/auth/password`, `GET /api/state`, operações de lançamento em `/api/unidades`, incluindo `POST /api/unidades/:id/review` (exclusiva da CAM), cadastro CAM em `/api/usuarios`, e parametrização em `/api/portarias`.
