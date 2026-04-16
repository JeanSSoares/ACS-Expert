const router  = require('express').Router();
const { auth } = require('../middlewares/auth');
const db       = require('../config/db');

// GET /api/microareas?municipio_id=1
router.get('/', auth, async (req, res) => {
  try {
    const { municipio_id } = req.query;
    let sql = 'SELECT id, nome, municipio_id FROM microareas';
    const params = [];
    if (municipio_id) {
      sql += ' WHERE municipio_id = ?';
      params.push(municipio_id);
    }
    sql += ' ORDER BY nome ASC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar microáreas.', error: err.message });
  }
});

module.exports = router;
