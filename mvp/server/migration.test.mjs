import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import { abrirBanco } from './app.mjs';

let pastaTemporaria;
let db;

afterEach(() => {
  db?.close();
  db = null;
  if (pastaTemporaria) rmSync(pastaTemporaria, { recursive: true, force: true });
  pastaTemporaria = undefined;
});

describe('Migração e limpeza da base do protótipo', () => {
  it('remove lançamentos de demonstração do esquema antigo e inicializa catálogos vazios', () => {
    pastaTemporaria = mkdtempSync(join(tmpdir(), 'gratificai-migration-'));
    const caminho = join(pastaTemporaria, 'legacy.sqlite');
    const legado = new DatabaseSync(caminho);
    legado.exec(`
      CREATE TABLE lancamentos (unidade_id INTEGER PRIMARY KEY, campos TEXT);
      CREATE TABLE portarias (id TEXT PRIMARY KEY, payload TEXT);
      CREATE TABLE configuracao (chave TEXT PRIMARY KEY, valor TEXT);
      CREATE TABLE historico (id INTEGER PRIMARY KEY, valor REAL);
      CREATE TABLE auditoria (id INTEGER PRIMARY KEY, detalhes TEXT);
      INSERT INTO lancamentos VALUES (123, '{"indicador":"ficticio"}');
      INSERT INTO historico VALUES (1, 99.9);
    `);
    legado.close();

    db = abrirBanco(caminho);
    expect(db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total).toBe(0);
    expect(db.prepare('SELECT COUNT(*) AS total FROM unidades').get().total).toBe(0);
    expect(db.prepare('SELECT COUNT(*) AS total FROM lancamentos').get().total).toBe(0);
    expect(db.prepare('SELECT COUNT(*) AS total FROM historico').get().total).toBe(0);
    expect(db.prepare('SELECT COUNT(*) AS total FROM distritos').get().total).toBe(8);
    expect(db.prepare('SELECT COUNT(*) AS total FROM portarias').get().total).toBe(2);
  });
});
