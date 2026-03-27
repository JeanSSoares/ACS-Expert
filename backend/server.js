require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT || 3306,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    process.exit(1);
  }
  console.log(`Conectado ao MySQL em ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

// REGISTRO
app.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  const hash = await bcrypt.hash(senha, 10);

  db.query(
    'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, hash],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Usuário criado!' });
    }
  );
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0) return res.status(401).send('Usuário não encontrado');

      const user = result[0];

      const valid = await bcrypt.compare(senha, user.senha);

      if (!valid) return res.status(401).send('Senha inválida');

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

      res.json({ token });
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
