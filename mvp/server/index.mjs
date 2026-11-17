import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirBanco, criarServidorApi, provisionarCAMInicial } from './app.mjs';

export function caminhoBancoConfigurado() {
  const configurado = process.env.DATABASE_PATH;
  if (process.env.NODE_ENV === 'production' && (!configurado || !isAbsolute(configurado))) {
    throw new Error('Em produção, defina DATABASE_PATH como caminho absoluto em um volume persistente.');
  }
  return resolve(configurado ?? 'data/gratificai.sqlite');
}

function validarOrigemDeProducao() {
  if (process.env.NODE_ENV !== 'production') return;
  const origem = process.env.APP_ORIGIN;
  if (!origem) throw new Error('Defina APP_ORIGIN com a origem HTTPS pública antes de executar em produção.');
  try {
    const parsed = new URL(origem);
    if (parsed.protocol !== 'https:' || parsed.origin !== origem.replace(/\/$/, '')) throw new Error();
  } catch {
    throw new Error('Em produção, configure APP_ORIGIN como uma origem HTTPS válida, sem caminho.');
  }
}

export function iniciarApi() {
  validarOrigemDeProducao();
  const arquivoBanco = caminhoBancoConfigurado();
  mkdirSync(dirname(arquivoBanco), { recursive: true });
  const db = abrirBanco(arquivoBanco);
  const server = criarServidorApi(db);
  const porta = Number(process.env.API_PORT ?? 3001);
  const host = process.env.API_HOST ?? '127.0.0.1';

  server.listen(porta, host, () => {
    console.log(`API GratificAI disponível em http://${host}:${porta}`);
    console.log(`Banco SQLite: ${arquivoBanco}`);
  });

  const encerrar = () => {
    server.close(() => {
      db.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
  return server;
}

export async function provisionarCAMDoAmbiente() {
  const arquivoBanco = caminhoBancoConfigurado();
  mkdirSync(dirname(arquivoBanco), { recursive: true });
  const db = abrirBanco(arquivoBanco);
  try {
    await provisionarCAMInicial(db, {
      email: process.env.BOOTSTRAP_CAM_EMAIL,
      senha: process.env.BOOTSTRAP_CAM_PASSWORD,
      nome: process.env.BOOTSTRAP_CAM_NAME,
    });
    console.log('Conta CAM inicial provisionada. Remova as variáveis de bootstrap após o primeiro uso.');
  } finally {
    db.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) iniciarApi();
