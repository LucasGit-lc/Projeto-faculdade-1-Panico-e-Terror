const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
try {
  require('dotenv').config();
} catch (error) {
  console.log('Arquivo .env não encontrado, usando variáveis de ambiente do sistema');
}

const app = express();
app.use(cors({
  origin: [
    'https://lucasgit-lc.github.io',
    'https://lucasgit-lc.github.io/Projeto-faculdade-1-Panico-e-Terror',
    'https://miraculous-enchantment-production.up.railway.app',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5501',
    'http://127.0.0.1:5501',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Habilitar preflight para todas as rotas
app.options('*', cors());

app.use(express.json());

// Servir arquivos estáticos
app.use(express.static('.'));

// Rota de health-check para verificação no Railway
app.get(['/','/health'], (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rota temporária para migrar tabela usuarios (adicionar colunas reset_token)
app.get('/migrate-usuarios', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ erro: 'Banco de dados não configurado' });
    }

    // Verificar se as colunas já existem
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND column_name IN ('reset_token', 'reset_token_expiry')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);
    let addedColumns = [];
    
    // Adicionar colunas se não existirem
    if (!existingColumns.includes('reset_token')) {
      try {
        await pool.query('ALTER TABLE usuarios ADD COLUMN reset_token VARCHAR(100)');
        addedColumns.push('reset_token');
      } catch (err) {
        if (!err.message.includes('already exists')) {
          throw err;
        }
      }
    }
    
    if (!existingColumns.includes('reset_token_expiry')) {
      try {
        await pool.query('ALTER TABLE usuarios ADD COLUMN reset_token_expiry TIMESTAMP');
        addedColumns.push('reset_token_expiry');
      } catch (err) {
        if (!err.message.includes('already exists')) {
          throw err;
        }
      }
    }

    // Verificar novamente após adicionar
    const finalCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND column_name IN ('reset_token', 'reset_token_expiry')
    `);

    res.json({ 
      success: true, 
      message: 'Migração executada com sucesso!',
      existingColumns: existingColumns,
      addedColumns: addedColumns,
      finalColumns: finalCheck.rows.map(row => row.column_name)
    });
  } catch (err) {
    console.error('Erro na migração:', err);
    res.status(500).json({ erro: 'Erro ao executar migração', detalhes: err.message });
  }
});

// Configuração de conexão com o banco: SSL apenas em produção/ambiente que exige
const enableSSL = (process.env.ENABLE_DB_SSL === 'true') || (process.env.NODE_ENV === 'production');
const databaseUrl = process.env.DATABASE_URL;
let pool = null;
if (databaseUrl && typeof databaseUrl === 'string' && databaseUrl.trim() !== '') {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: enableSSL ? { rejectUnauthorized: false } : false,
  });
} else {
  console.warn('DATABASE_URL não definido. Banco de dados desativado para este ambiente.');
}

app.use(bodyParser.urlencoded({ extended: true }));

// Função para criar tabelas
async function criarTabelas() {
  try {
    // Criar tabela usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        reset_token VARCHAR(100),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
        descricao: 'Tênis esportivo verde com detalhes em castanho e branco, design moderno e tecnologia de amortecimento avançada',
        imagem_url: 'https://lojasdufins.com.br/cdn/shop/files/10_1_1_800x.webp?v=1745261891'
      },
      {
            id: 2,
            nome: 'Camiseta Performance',
            categoria: 'Camisetas',
            preco: 89.90,
            descricao: 'Camiseta esportiva de compressão preta com detalhes vermelhos e tecnologia dry-fit',
            imagem_url: 'https://www.dominusfitness.com.br/cdn/shop/files/camisa_de_compress_o_masclina.webp?v=1757830123'
        },
      {
        nome: 'Shorts Training Pro',
        categoria: 'Shorts',
        preco: 119.90,
        descricao: 'Shorts esportivo preto com listras vermelhas laterais e bolso para celular',
        imagem_url: 'https://static.netshoes.com.br/produtos/bermuda-adidas-3s-masculina/02/2FW-5549-002/2FW-5549-002_zoom1.jpg?ts=1695423672'
      },
      {
        nome: 'Jaqueta Windbreaker',
        categoria: 'Jaquetas',
        preco: 199.90,
        descricao: 'Jaqueta esportiva corta-vento vermelha com capuz e detalhes reflexivos',
        imagem_url: 'https://http2.mlstatic.com/D_NQ_NP_356611-MLB20597628199_022016-O.webp'
      },
      {
        nome: 'Tênis Sport Elite',
        categoria: 'Tênis',
        preco: 349.90,
        descricao: 'Tênis esportivo de alta performance com design moderno e tecnologia avançada de amortecimento',
        imagem_url: 'https://olimpofit.com.br/cdn/shop/files/S927a584fe12544c9aa9b647a9df3c16bX_1024x1024@2x.webp?v=1719777153'
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
if (pool) {
  criarTabelas().then(() => {
    inserirProdutosIniciais();
  });
} else {
  console.warn('Banco desativado; pulando criação de tabelas e inserção de produtos iniciais.');
}

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
    if (!pool) {
      return res.status(503).send('Banco de dados não configurado. Defina a variável DATABASE_URL.');
    }
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
      [nome, email, senhaCriptografada]
    );
    res.send(`
      <script>
        alert('✅ Cadastro realizado com sucesso!\\n\\nVocê será redirecionado para o login em 3 segundos...');
        setTimeout(function() {
          window.location.href = '/login.html';
        }, 3000);
      </script>
      <h1 style="color: green; text-align: center; font-family: Arial;">✅ Cadastro realizado com sucesso!</h1>
      <p style="text-align: center; font-family: Arial;">Redirecionando para o login...</p>
    `);
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
    if (!pool) {
      return res.status(503).send('Banco de dados não configurado. Defina a variável DATABASE_URL.');
    }
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    if (resultado.rows.length === 0) {
      return res.status(401).send('Email ou senha incorretos!');
    }
    
    const usuario = resultado.rows[0];
    
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaCorreta) {
      return res.status(401).send('Email ou senha incorretos!');
    }
    
    // Retornar dados básicos do usuário para persistência de sessão no frontend
    res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao fazer login');
  }
});

// Endpoints para produtos
app.get('/produtos', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ erro: 'Banco de dados não configurado. Defina a variável DATABASE_URL.' });
    }
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

// Função para detectar provedor de email e configurar SMTP
function criarTransporter() {
  const emailUser = process.env.EMAIL_USER;
  
  if (emailUser.includes('@gmail.com')) {
    // Configuração para Gmail
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5,
      debug: true,
      logger: true
    });
  } else if (emailUser.includes('@outlook.com') || emailUser.includes('@hotmail.com')) {
    // Configuração para Outlook/Hotmail
    return nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      debug: true,
      logger: true
    });
  } else {
    // Configuração genérica
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      debug: true,
      logger: true
    });
  }
}

// Configuração do transporter do Nodemailer
const transporter = criarTransporter();

// Função para enviar email com fallback
async function enviarEmailComFallback(email, resetLink) {
  try {
    // Tentar enviar email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Redefinição de Senha - Pânico e Terror',
      html: `
        <h2>Redefinição de Senha</h2>
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
        <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p>${resetLink}</p>
        <p>Este link expira em 1 hora.</p>
      `
    });
    
    return { success: true, method: 'email' };
  } catch (error) {
    console.log('Erro ao enviar email:', error.message);
    // Se falhar, retornar o link para mostrar na tela
    return { 
      success: true, 
      method: 'link', 
      resetLink: resetLink,
      message: 'Email temporariamente indisponível. Use o link abaixo:' 
    };
  }
}

// Rota para recuperação de senha
app.post('/recuperar-senha', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ erro: 'Email inválido!' });
  }
  
  try {
    if (!pool) {
      return res.status(503).json({ erro: 'Banco de dados não configurado. Defina a variável DATABASE_URL.' });
    }
    
    // Verificar se o email existe
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    if (resultado.rows.length === 0) {
      // Por segurança, não informamos que o email não existe
      return res.status(200).json({ mensagem: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' });
    }
    
    // Gerar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    
    // Definir expiração do token (1 hora)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    
    // Salvar o token no banco de dados
    await pool.query(
      'UPDATE usuarios SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [token, expiry, email]
    );
    
    // Construir o link de redefinição (dinâmico: usa APP_BASE_URL se existir; caso contrário, host atual)
    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const resetLink = `${baseUrl}/redefinir-senha.html?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Usar a função híbrida para enviar email ou retornar link
    const resultadoEmail = await enviarEmailComFallback(email, resetLink);
    
    // Para testar, sempre exibir o link no console
    console.log('Link de redefinição (para teste):', resetLink);
    
    if (resultadoEmail.method === 'email') {
      // Email enviado com sucesso
      res.status(200).json({ 
        mensagem: 'Instruções de recuperação enviadas para seu email.',
        success: true
      });
    } else {
      // Email falhou, retornar link diretamente
      res.status(200).json({ 
        mensagem: resultadoEmail.message,
        resetLink: resultadoEmail.resetLink,
        success: true,
        showLink: true
      });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao processar solicitação de recuperação de senha' });
  }
});

// Rota para redefinir senha
app.post('/redefinir-senha', async (req, res) => {
  try {
    const { email, token, novaSenha } = req.body;
    
    if (!email || !token || !novaSenha) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }
    
    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres' });
    }
    
    if (!pool) {
      return res.status(503).json({ erro: 'Banco de dados não configurado' });
    }
    
    // Verificar se o token é válido e não expirou
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND reset_token = $2 AND reset_token_expiry > NOW()', 
      [email, token]
    );
    
    if (resultado.rows.length === 0) {
      return res.status(400).json({ erro: 'Link inválido ou expirado' });
    }
    
    // Atualizar a senha
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    await pool.query(
      'UPDATE usuarios SET senha = $1 WHERE email = $2',
      [senhaCriptografada, email]
    );
    
    // Limpar o token após a redefinição
    await pool.query(
      'UPDATE usuarios SET reset_token = NULL, reset_token_expiry = NULL WHERE email = $1', 
      [email]
    );
    
    res.json({ mensagem: 'Senha redefinida com sucesso' });
    
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).json({ erro: 'Erro ao redefinir senha' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`);
});