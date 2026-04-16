require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// ──────────────────────────────────────────────────────────────
// Defaults — sobrescreva via variáveis de ambiente se quiser
// ──────────────────────────────────────────────────────────────
const MUNICIPIO_NOME  = process.env.SEED_MUNICIPIO_NOME   || 'Município Padrão';
const MUNICIPIO_UF    = process.env.SEED_MUNICIPIO_UF     || 'SP';
const MUNICIPIO_IBGE  = process.env.SEED_MUNICIPIO_IBGE   || null;

const ADMIN_NOME      = process.env.SEED_ADMIN_NOME       || 'Administrador';
const ADMIN_MATRICULA = process.env.SEED_ADMIN_MATRICULA  || 'admin';
const ADMIN_EMAIL     = process.env.SEED_ADMIN_EMAIL      || 'admin@acs-expert.local';
const ADMIN_SENHA     = process.env.SEED_ADMIN_SENHA      || 'admin12345';

async function seed() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log(`Conectado ao MySQL em ${process.env.DB_HOST}:${process.env.DB_PORT}\n`);

  try {
    // ── 1. Garante município ────────────────────────────────
    let municipioId;
    const [munExistente] = await connection.query(
      'SELECT id FROM municipios ORDER BY id LIMIT 1'
    );

    if (munExistente.length > 0) {
      municipioId = munExistente[0].id;
      console.log(`→ Usando município existente (id=${municipioId}).`);
    } else {
      const [result] = await connection.query(
        'INSERT INTO municipios (nome, uf, codigo_ibge) VALUES (?, ?, ?)',
        [MUNICIPIO_NOME, MUNICIPIO_UF, MUNICIPIO_IBGE]
      );
      municipioId = result.insertId;
      console.log(`→ Município "${MUNICIPIO_NOME}/${MUNICIPIO_UF}" criado (id=${municipioId}).`);
    }

    // ── 2. Verifica se já existe usuário admin ──────────────
    const [jaExiste] = await connection.query(
      'SELECT id, nome, perfil FROM usuarios WHERE matricula = ? OR perfil = ? LIMIT 1',
      [ADMIN_MATRICULA, 'gestor']
    );

    if (jaExiste.length > 0) {
      const u = jaExiste[0];
      console.log(`\n⚠  Já existe um usuário gestor (id=${u.id}, nome="${u.nome}").`);
      console.log('   Se quiser criar outro, altere SEED_ADMIN_MATRICULA no .env ou apague o usuário existente.');
      return;
    }

    // ── 3. Cria o gestor ────────────────────────────────────
    const senhaHash = await bcrypt.hash(ADMIN_SENHA, 12);

    const [result] = await connection.query(
      `INSERT INTO usuarios
         (nome, matricula, email, senha_hash, perfil, municipio_id, ativo)
       VALUES (?, ?, ?, ?, 'gestor', ?, 1)`,
      [ADMIN_NOME, ADMIN_MATRICULA, ADMIN_EMAIL, senhaHash, municipioId]
    );

    console.log(`\n✓ Administrador criado com sucesso (id=${result.insertId}).`);
    console.log('─────────────────────────────────────────────');
    console.log(`  Matrícula : ${ADMIN_MATRICULA}`);
    console.log(`  Senha     : ${ADMIN_SENHA}`);
    console.log(`  Perfil    : gestor`);
    console.log(`  Município : id=${municipioId}`);
    console.log('─────────────────────────────────────────────');
    console.log('  ⚠  Troque a senha após o primeiro login!');
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error('Falha no seed:', err.message);
  process.exit(1);
});
