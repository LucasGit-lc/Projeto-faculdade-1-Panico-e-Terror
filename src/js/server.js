const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
// Configuração de CORS
app.use(cors({
  origin: ['https://lucasgit-lc.github.io', 'https://projeto-faculdade-1-panico-e-terror-production.up.railway.app', 'http://localhost'], // Permitimos o domínio do GitHub, produção e localhost
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
}); // Fim do cadastro

// Nova rota de login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.status(400).send('Email e senha são obrigatórios!');
    }
    
    if (!email.includes('@')) {
        return res.status(400).send('Email inválido!');
    }
    
    try {
        // Verificar se o usuário existe
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1', 
            [email]
        );
        
        const usuario = result.rows[0];
        
        if (!usuario) {
            return res.status(400).send('Credenciais inválidas!');
        }
        
        // Comparar senha criptografada
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            return res.status(400).send('Credenciais inválidas!');
        }
        
        // Login bem sucedido - retornar dados do usuário
        res.json({
            sucesso: true,
            usuario: {
                nome: usuario.nome,
                email: usuario.email
            }
        });
        
    } catch (err) {
        console.error('Erro durante login:', err);
        res.status(500).send('Erro no servidor');
    }
});
// Middlewares para parsing de corpos de requisições
app.use(bodyParser.urlencoded({ extended: true })); // Formulários tradicionais
app.use(bodyParser.json()); // Requisições JSON (AJAX/Fetch)

// Rota de cadastro existente

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