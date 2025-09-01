const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).send('Preencha todos os campos!');
  }
  if (!email.includes('@')) {
    return res.status(400).send('Email inválido!');
  }
  if (senha.length < 6) {
    return res.status(400).send('Senha muito curta!');
  }
  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
      [nome, email, senhaCriptografada]
    );
    res.send('Cadastro realizado com sucesso!');
  } catch (err) {
    if (err.code === '23505') { 
      res.status(400).send('Email já cadastrado!');
    } else {
      res.status(500).send('Erro ao cadastrar');
    }
  }
});

// Adicionando a rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).send('Preencha todos os campos!');
  }
  
  try {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    if (resultado.rows.length === 0) {
      return res.status(401).send('Email ou senha incorretos!');
    }
    
    const usuario = resultado.rows[0];
    
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaCorreta) {
      return res.status(401).send('Email ou senha incorretos!');
    }
    
    // Se chegou até aqui, o login foi bem-sucedido
    res.status(200).send('Login realizado com sucesso!');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao fazer login');
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});