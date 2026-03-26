const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// conexão com MySQL (XAMPP)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'acsexpert'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar:', err);
  } else {
    console.log('Conectado ao MySQL');
  }
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

      const token = jwt.sign({ id: user.id }, 'segredo');

      res.json({ token });
    }
  );
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
