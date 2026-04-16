require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mysql = require('mysql2/promise');

// ──────────────────────────────────────────────────────────────
// Município: Joinville / SC  (código IBGE 4209102)
// Microáreas = bairros oficiais do município (IPPUJ).
// Nome no formato "MA-## — Bairro" p/ facilitar busca/ordenação.
// ──────────────────────────────────────────────────────────────
const MUNICIPIO = {
  nome:        'Joinville',
  uf:          'SC',
  codigo_ibge: '4209102',
};

const BAIRROS_JOINVILLE = [
  'Adhemar Garcia',
  'América',
  'Anita Garibaldi',
  'Atiradores',
  'Aventureiro',
  'Boa Vista',
  'Boehmerwald',
  'Bom Retiro',
  'Bucarein',
  'Centro',
  'Comasa',
  'Costa e Silva',
  'Espinheiros',
  'Fátima',
  'Floresta',
  'Glória',
  'Guanabara',
  'Iririú',
  'Itaum',
  'Itinga',
  'Jardim Iririú',
  'Jardim Paraíso',
  'Jardim Sofia',
  'Jarivatuba',
  'João Costa',
  'Morro do Meio',
  'Nova Brasília',
  'Paranaguamirim',
  'Parque Guarani',
  'Petrópolis',
  'Pirabeiraba',
  'Profipo',
  'Rio Bonito',
  'Saguaçu',
  'Santa Catarina',
  'Santo Antônio',
  'São Marcos',
  'Ulysses Guimarães',
  'Vila Cubatão',
  'Vila Nova',
  'Zona Industrial Norte',
  'Zona Industrial Tupy',
];

function formatarNome(bairro, indice) {
  const prefixo = `MA-${String(indice + 1).padStart(2, '0')}`;
  return `${prefixo} — ${bairro}`;
}

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
    // ── 1. Garante o município de Joinville ─────────────────
    let municipioId;
    const [existe] = await connection.query(
      'SELECT id FROM municipios WHERE codigo_ibge = ? OR (nome = ? AND uf = ?) LIMIT 1',
      [MUNICIPIO.codigo_ibge, MUNICIPIO.nome, MUNICIPIO.uf]
    );

    if (existe.length > 0) {
      municipioId = existe[0].id;
      console.log(`→ Município "${MUNICIPIO.nome}/${MUNICIPIO.uf}" já existe (id=${municipioId}).`);
    } else {
      const [result] = await connection.query(
        'INSERT INTO municipios (nome, uf, codigo_ibge) VALUES (?, ?, ?)',
        [MUNICIPIO.nome, MUNICIPIO.uf, MUNICIPIO.codigo_ibge]
      );
      municipioId = result.insertId;
      console.log(`→ Município "${MUNICIPIO.nome}/${MUNICIPIO.uf}" criado (id=${municipioId}).`);
    }

    // ── 2. Carrega microáreas já existentes p/ não duplicar ─
    const [jaExistentes] = await connection.query(
      'SELECT nome FROM microareas WHERE municipio_id = ?',
      [municipioId]
    );
    const nomesExistentes = new Set(jaExistentes.map((r) => r.nome));

    // ── 3. Insere microáreas ────────────────────────────────
    const novas = BAIRROS_JOINVILLE
      .map((bairro, idx) => ({ nome: formatarNome(bairro, idx), bairro }))
      .filter((m) => !nomesExistentes.has(m.nome));

    if (novas.length === 0) {
      console.log('\n✓ Todas as microáreas de Joinville já estão cadastradas. Nada a fazer.');
      return;
    }

    const valores = novas.map((m) => [m.nome, municipioId]);
    await connection.query(
      'INSERT INTO microareas (nome, municipio_id) VALUES ?',
      [valores]
    );

    console.log(`\n✓ ${novas.length} microárea(s) inserida(s) em Joinville/SC.`);
    console.log('─────────────────────────────────────────────');
    novas.slice(0, 10).forEach((m) => console.log(`  • ${m.nome}`));
    if (novas.length > 10) console.log(`  • ... (+${novas.length - 10})`);
    console.log('─────────────────────────────────────────────');
    console.log(`Total no município: ${nomesExistentes.size + novas.length}`);
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error('Falha no seed:', err.message);
  process.exit(1);
});
