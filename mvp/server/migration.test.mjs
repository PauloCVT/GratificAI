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

  it('migra lançamentos enviados do esquema anterior para Em Análise', () => {
    pastaTemporaria = mkdtempSync(join(tmpdir(), 'gratificai-migration-'));
    const caminho = join(pastaTemporaria, 'legacy-submissions.sqlite');
    const legado = new DatabaseSync(caminho);
    legado.exec(`
      CREATE TABLE usuarios (
        id TEXT PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL, perfil TEXT NOT NULL, distrito_id TEXT,
        unidade_id INTEGER, ativo INTEGER NOT NULL DEFAULT 1, criado_em TEXT NOT NULL
      );
      INSERT INTO usuarios (id, nome, email, senha_hash, perfil, criado_em)
        VALUES ('cam-1', 'CAM', 'cam@example.test', 'hash', 'cam', '2024-01-01');
      CREATE TABLE lancamentos (
        unidade_id INTEGER PRIMARY KEY, campos TEXT NOT NULL, justificativas TEXT NOT NULL,
        enviado INTEGER NOT NULL DEFAULT 0, atualizado_em TEXT NOT NULL
      );
      INSERT INTO lancamentos VALUES (42, '{}', '{}', 1, '2024-01-02');
      CREATE TABLE historico (
        id INTEGER PRIMARY KEY, unidade_id INTEGER NOT NULL, sub_id TEXT NOT NULL,
        valor REAL NOT NULL, submetido_em TEXT NOT NULL
      );
      INSERT INTO historico VALUES (1, 42, '4.1.1', 80, '2024-01-02');
    `);
    legado.close();

    db = abrirBanco(caminho);
    const lancamento = db.prepare('SELECT status, parecer_cam FROM lancamentos WHERE unidade_id = 42').get();
    expect(lancamento).toEqual({ status: 'em_analise', parecer_cam: null });
    expect(db.prepare('SELECT aprovado FROM historico WHERE id = 1').get().aprovado).toBe(0);
  });
});
