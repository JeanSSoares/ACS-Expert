const bcrypt = require('bcrypt');
const db = require('../config/db');

// ── GET /api/usuarios ──────────────────────────────────────────
// Query params: perfil, ativo, busca (nome ou matrícula), municipio_id
async function listar(req, res) {
  try {
    const { perfil, ativo, busca, municipio_id } = req.query;

    let sql = `
      SELECT
        u.id, u.nome, u.matricula, u.email, u.perfil,
        u.ativo, u.ultimo_acesso, u.created_at,
        m.id   AS microarea_id,
        m.nome AS microarea_nome,
        mu.id   AS municipio_id,
        mu.nome AS municipio_nome
      FROM usuarios u
      LEFT JOIN microareas m  ON u.microarea_id  = m.id
      LEFT JOIN municipios mu ON u.municipio_id  = mu.id
      WHERE 1=1
    `;
    const params = [];

    if (perfil) {
      sql += ' AND u.perfil = ?';
      params.push(perfil);
    }
    if (ativo !== undefined) {
      sql += ' AND u.ativo = ?';
      params.push(ativo === 'true' || ativo === '1' ? 1 : 0);
    }
    if (municipio_id) {
      sql += ' AND u.municipio_id = ?';
      params.push(municipio_id);
    }
    if (busca) {
      sql += ' AND (u.nome LIKE ? OR u.matricula LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`);
    }

    sql += ' ORDER BY u.nome ASC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar usuários.', error: err.message });
  }
}

// ── GET /api/usuarios/:id ──────────────────────────────────────
async function buscarPorId(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
        u.id, u.nome, u.matricula, u.email, u.perfil,
        u.ativo, u.ultimo_acesso, u.created_at, u.updated_at,
        m.id   AS microarea_id,
        m.nome AS microarea_nome,
        mu.id   AS municipio_id,
        mu.nome AS municipio_nome
       FROM usuarios u
       LEFT JOIN microareas m  ON u.microarea_id  = m.id
       LEFT JOIN municipios mu ON u.municipio_id  = mu.id
       WHERE u.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuário.', error: err.message });
  }
}

// ── POST /api/usuarios ─────────────────────────────────────────
async function criar(req, res) {
  try {
    const { nome, matricula, email, senha, perfil, microarea_id, municipio_id, ativo = true } = req.body;

    // Validações obrigatórias
    if (!nome || !matricula || !senha || !perfil || !municipio_id) {
      return res.status(400).json({
        message: 'Campos obrigatórios: nome, matricula, senha, perfil, municipio_id.',
      });
    }

    const perfisValidos = ['acs', 'coordenador', 'gestor'];
    if (!perfisValidos.includes(perfil)) {
      return res.status(400).json({ message: `Perfil inválido. Use: ${perfisValidos.join(', ')}.` });
    }

    if (perfil === 'acs' && !microarea_id) {
      return res.status(400).json({ message: 'microarea_id é obrigatório para o perfil ACS.' });
    }

    if (senha.length < 8) {
      return res.status(400).json({ message: 'A senha deve ter no mínimo 8 caracteres.' });
    }

    // Verifica duplicata de matrícula
    const [existeMatricula] = await db.query(
      'SELECT id FROM usuarios WHERE matricula = ?',
      [matricula]
    );
    if (existeMatricula.length > 0) {
      return res.status(409).json({ message: 'Matrícula já cadastrada.' });
    }

    // Verifica duplicata de e-mail (se fornecido)
    if (email) {
      const [existeEmail] = await db.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );
      if (existeEmail.length > 0) {
        return res.status(409).json({ message: 'E-mail já cadastrado.' });
      }
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const [result] = await db.query(
      `INSERT INTO usuarios
        (nome, matricula, email, senha_hash, perfil, microarea_id, municipio_id, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, matricula, email || null, senhaHash, perfil, microarea_id || null, municipio_id, ativo ? 1 : 0]
    );

    const [novoUsuario] = await db.query(
      'SELECT id, nome, matricula, email, perfil, microarea_id, municipio_id, ativo, created_at FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(novoUsuario[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar usuário.', error: err.message });
  }
}

// ── PUT /api/usuarios/:id ──────────────────────────────────────
async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, perfil, microarea_id, municipio_id, ativo } = req.body;

    const [existe] = await db.query('SELECT id, perfil FROM usuarios WHERE id = ?', [id]);
    if (existe.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const perfisValidos = ['acs', 'coordenador', 'gestor'];
    if (perfil && !perfisValidos.includes(perfil)) {
      return res.status(400).json({ message: `Perfil inválido. Use: ${perfisValidos.join(', ')}.` });
    }

    const perfilFinal = perfil || existe[0].perfil;
    if (perfilFinal === 'acs' && microarea_id === null) {
      return res.status(400).json({ message: 'microarea_id é obrigatório para o perfil ACS.' });
    }

    // Verifica duplicata de e-mail (se alterado)
    if (email) {
      const [existeEmail] = await db.query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existeEmail.length > 0) {
        return res.status(409).json({ message: 'E-mail já está em uso.' });
      }
    }

    const campos = [];
    const valores = [];

    if (nome !== undefined)        { campos.push('nome = ?');        valores.push(nome); }
    if (email !== undefined)       { campos.push('email = ?');       valores.push(email || null); }
    if (perfil !== undefined)      { campos.push('perfil = ?');      valores.push(perfil); }
    if (microarea_id !== undefined){ campos.push('microarea_id = ?');valores.push(microarea_id || null); }
    if (municipio_id !== undefined){ campos.push('municipio_id = ?');valores.push(municipio_id); }
    if (ativo !== undefined)       { campos.push('ativo = ?');       valores.push(ativo ? 1 : 0); }

    if (campos.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
    }

    valores.push(id);
    await db.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);

    const [atualizado] = await db.query(
      'SELECT id, nome, matricula, email, perfil, microarea_id, municipio_id, ativo, updated_at FROM usuarios WHERE id = ?',
      [id]
    );

    res.json(atualizado[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar usuário.', error: err.message });
  }
}

// ── PATCH /api/usuarios/:id/senha ─────────────────────────────
async function alterarSenha(req, res) {
  try {
    const { id } = req.params;
    const { senha_atual, nova_senha } = req.body;

    // Só o próprio usuário ou um gestor pode trocar a senha
    const ehProprioUsuario = req.usuario.id === parseInt(id);
    const ehGestor = req.usuario.perfil === 'gestor';

    if (!ehProprioUsuario && !ehGestor) {
      return res.status(403).json({ message: 'Sem permissão para alterar esta senha.' });
    }

    if (!nova_senha || nova_senha.length < 8) {
      return res.status(400).json({ message: 'A nova senha deve ter no mínimo 8 caracteres.' });
    }

    const [rows] = await db.query('SELECT senha_hash FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Valida senha atual (exceto para gestor que está alterando a senha de outro)
    if (ehProprioUsuario) {
      if (!senha_atual) {
        return res.status(400).json({ message: 'Informe a senha atual.' });
      }
      const valida = await bcrypt.compare(senha_atual, rows[0].senha_hash);
      if (!valida) {
        return res.status(401).json({ message: 'Senha atual incorreta.' });
      }
    }

    const novoHash = await bcrypt.hash(nova_senha, 12);
    await db.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [novoHash, id]);

    res.json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao alterar senha.', error: err.message });
  }
}

// ── DELETE /api/usuarios/:id ───────────────────────────────────
// Soft delete: desativa o usuário em vez de remover
async function desativar(req, res) {
  try {
    const [existe] = await db.query('SELECT id FROM usuarios WHERE id = ?', [req.params.id]);
    if (existe.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    await db.query('UPDATE usuarios SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuário desativado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao desativar usuário.', error: err.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, alterarSenha, desativar };
