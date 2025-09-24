const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors({
  origin: [
    'https://lucasgit-lc.github.io',
    'https://lucasgit-lc.github.io/Projeto-faculdade-1-Panico-e-Terror',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(bodyParser.urlencoded({ extended: true }));

// Função para criar tabelas
async function criarTabelas() {
  try {
    // Criar tabela produtos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        descricao TEXT,
        imagem_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela carrinho
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carrinho (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        produto_id INTEGER REFERENCES produtos(id) ON DELETE CASCADE,
        quantidade INTEGER NOT NULL DEFAULT 1,
        data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, produto_id)
      )
    `);

    console.log('Tabelas criadas com sucesso!');
  } catch (err) {
    console.error('Erro ao criar tabelas:', err);
  }
}

// Inserir produtos iniciais
async function inserirProdutosIniciais() {
  try {
    const produtosExistentes = await pool.query('SELECT COUNT(*) FROM produtos');
    if (produtosExistentes.rows[0].count > 0) {
      return; // Produtos já existem
    }

    const produtos = [
      {
        nome: 'Tênis Run Pro Max',
        categoria: 'Tênis',
        preco: 299.90,
        descricao: 'Tênis de corrida de alto desempenho com solado vermelho e detalhes em preto',
        imagem_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d24f59c9-440f-408d-824e-5d944f23930f.png'
      },
      {
        nome: 'Camiseta Performance',
        categoria: 'Camisetas',
        preco: 89.90,
        descricao: 'Camiseta esportiva de compressão preta com detalhes vermelhos e tecnologia dry-fit',
        imagem_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c659cb72-5e97-4266-8ba8-ce3decd4bb6d.png'
      },
      {
        nome: 'Shorts Training Pro',
        categoria: 'Shorts',
        preco: 119.90,
        descricao: 'Shorts esportivo preto com listras vermelhas laterais e bolso para celular',
        imagem_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e08bd690-309b-4d21-ba63-d20697047285.png'
      },
      {
        nome: 'Jaqueta Windbreaker',
        categoria: 'Jaquetas',
        preco: 199.90,
        descricao: 'Jaqueta esportiva corta-vento vermelha com capuz e detalhes reflexivos',
        imagem_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/57030cb7-181c-4f32-8925-df8fa6886bd1.png'
      }
    ];

    for (const produto of produtos) {
      await pool.query(
        'INSERT INTO produtos (nome, categoria, preco, descricao, imagem_url) VALUES ($1, $2, $3, $4, $5)',
        [produto.nome, produto.categoria, produto.preco, produto.descricao, produto.imagem_url]
      );
    }

    console.log('Produtos iniciais inseridos com sucesso!');
  } catch (err) {
    console.error('Erro ao inserir produtos iniciais:', err);
  }
}

// Inicializar banco de dados
criarTabelas().then(() => {
  inserirProdutosIniciais();
});

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
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro Realizado</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    .sucesso {
      color: #28a745;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .contador {
      font-size: 18px;
      color: #666;
      margin-bottom: 20px;
    }
    .loading {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="sucesso">✅ Cadastro realizado com sucesso!</div>
    <div class="contador">Redirecionando para o login em <span id="tempo">3</span> segundos...</div>
    <div class="loading"></div>
  </div>
  
  <script>
    let tempo = 3;
    const contadorElement = document.getElementById('tempo');
    
    const interval = setInterval(() => {
      tempo--;
      contadorElement.textContent = tempo;
      
      if (tempo <= 0) {
        clearInterval(interval);
        window.location.href = '/login.html';
      }
    }, 1000);
  </script>
</body>
</html>`);
  } catch (err) {
    if (err.code === '23505') { 
      res.status(400).send('Email já cadastrado!');
    } else {
      res.status(500).send('Erro ao cadastrar');
    }
  }
});

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
    
    res.status(200).send('Login realizado com sucesso!');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao fazer login');
  }
});

// Endpoints para produtos
app.get('/produtos', async (req, res) => {
  try {
    const { categoria, busca } = req.query;
    let query = 'SELECT * FROM produtos';
    let params = [];
    let whereConditions = [];

    if (categoria) {
      whereConditions.push('categoria = $' + (params.length + 1));
      params.push(categoria);
    }

    if (busca) {
      whereConditions.push('(nome ILIKE $' + (params.length + 1) + ' OR descricao ILIKE $' + (params.length + 1) + ')');
      params.push('%' + busca + '%');
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const resultado = await pool.query(query, params);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar produtos');
  }
});

app.get('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).send('Produto não encontrado');
    }
    
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar produto');
  }
});

// Endpoints para carrinho
app.post('/carrinho', async (req, res) => {
  try {
    const { usuario_id, produto_id, quantidade = 1 } = req.body;
    
    if (!usuario_id || !produto_id) {
      return res.status(400).send('Usuario ID e Produto ID são obrigatórios');
    }

    // Verificar se o produto existe
    const produto = await pool.query('SELECT * FROM produtos WHERE id = $1', [produto_id]);
    if (produto.rows.length === 0) {
      return res.status(404).send('Produto não encontrado');
    }

    // Verificar se o item já está no carrinho
    const itemExistente = await pool.query(
      'SELECT * FROM carrinho WHERE usuario_id = $1 AND produto_id = $2',
      [usuario_id, produto_id]
    );

    if (itemExistente.rows.length > 0) {
      // Atualizar quantidade
      await pool.query(
        'UPDATE carrinho SET quantidade = quantidade + $1 WHERE usuario_id = $2 AND produto_id = $3',
        [quantidade, usuario_id, produto_id]
      );
    } else {
      // Adicionar novo item
      await pool.query(
        'INSERT INTO carrinho (usuario_id, produto_id, quantidade) VALUES ($1, $2, $3)',
        [usuario_id, produto_id, quantidade]
      );
    }

    res.send('Produto adicionado ao carrinho com sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar produto ao carrinho');
  }
});

app.get('/carrinho/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    const resultado = await pool.query(`
      SELECT c.id, c.quantidade, c.data_adicao, 
             p.id as produto_id, p.nome, p.categoria, p.preco, p.imagem_url,
             (c.quantidade * p.preco) as subtotal
      FROM carrinho c
      JOIN produtos p ON c.produto_id = p.id
      WHERE c.usuario_id = $1
      ORDER BY c.data_adicao DESC
    `, [usuario_id]);
    
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar carrinho');
  }
});

app.put('/carrinho/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade } = req.body;
    
    if (!quantidade || quantidade < 1) {
      return res.status(400).send('Quantidade deve ser maior que 0');
    }
    
    await pool.query(
      'UPDATE carrinho SET quantidade = $1 WHERE id = $2',
      [quantidade, id]
    );
    
    res.send('Quantidade atualizada com sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar carrinho');
  }
});

app.delete('/carrinho/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM carrinho WHERE id = $1', [id]);
    
    res.send('Item removido do carrinho com sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover item do carrinho');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`);
});