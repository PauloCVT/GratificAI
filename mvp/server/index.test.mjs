import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { caminhoBancoConfigurado } from './index.mjs';

let nodeEnvOriginal;
let databasePathOriginal;

beforeEach(() => {
  nodeEnvOriginal = process.env.NODE_ENV;
  databasePathOriginal = process.env.DATABASE_PATH;
  delete process.env.NODE_ENV;
  delete process.env.DATABASE_PATH;
});

afterEach(() => {
  if (nodeEnvOriginal === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = nodeEnvOriginal;
  if (databasePathOriginal === undefined) delete process.env.DATABASE_PATH;
  else process.env.DATABASE_PATH = databasePathOriginal;
});

describe('Configuração do banco para execução', () => {
  it('mantém o caminho padrão no desenvolvimento', () => {
    expect(caminhoBancoConfigurado()).toBe(resolve('data/gratificai.sqlite'));
  });

  it('exige um caminho absoluto de volume persistente em produção', () => {
    process.env.NODE_ENV = 'production';
    expect(() => caminhoBancoConfigurado()).toThrow('DATABASE_PATH como caminho absoluto em um volume persistente');

    process.env.DATABASE_PATH = 'data/gratificai.sqlite';
    expect(() => caminhoBancoConfigurado()).toThrow('DATABASE_PATH como caminho absoluto em um volume persistente');

    process.env.DATABASE_PATH = resolve('persistent-data/gratificai.sqlite');
    expect(caminhoBancoConfigurado()).toBe(resolve('persistent-data/gratificai.sqlite'));
  });
});
