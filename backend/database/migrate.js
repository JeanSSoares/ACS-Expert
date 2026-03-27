require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log(`Conectado ao MySQL em ${process.env.DB_HOST}:${process.env.DB_PORT}`);

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // Remove comentários de linha e divide por ponto-e-vírgula
  const statements = sql
    .replace(/--.*$/gm, '')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let criadas = 0;
  let erros = 0;

  for (const statement of statements) {
    try {
      await connection.query(statement);
      const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      if (match) {
        console.log(`  ✓ Tabela "${match[1]}" verificada/criada`);
        criadas++;
      }
    } catch (err) {
      console.error(`  ✗ Erro: ${err.message}`);
      console.error(`    SQL: ${statement.substring(0, 80)}...`);
      erros++;
    }
  }

  await connection.end();

  console.log(`\nConcluído: ${criadas} tabelas processadas, ${erros} erro(s).`);
  if (erros > 0) process.exit(1);
}

migrate().catch(err => {
  console.error('Falha na migração:', err.message);
  process.exit(1);
});
