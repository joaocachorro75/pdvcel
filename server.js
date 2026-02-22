import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Use persistent data directory if available
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_PATH = path.join(DATA_DIR, 'database.sqlite');

console.log('Data directory:', DATA_DIR);
console.log('Database path:', DB_PATH);

app.use(express.json({ limit: '50mb' }));

// Inicialização do Banco de Dados SQL
async function setupDatabase() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Tabela de Configurações
  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      shopName TEXT,
      shopLogo TEXT,
      adminPassword TEXT,
      pixKey TEXT
    )
  `);

  // Tabela de Produtos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      price REAL,
      image TEXT,
      category TEXT,
      stock INTEGER
    )
  `);

  // Tabela de Vendas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      total REAL,
      paymentMethod TEXT,
      timestamp INTEGER,
      items TEXT,
      buyerName TEXT,
      buyerPhone TEXT
    )
  `);

  // Inserir configurações padrão se não existirem
  const settings = await db.get('SELECT * FROM settings WHERE id = 1');
  if (!settings) {
    await db.run(
      'INSERT INTO settings (id, shopName, shopLogo, adminPassword, pixKey) VALUES (?, ?, ?, ?, ?)',
      [1, 'SMART PDV', 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png', 'admin', 'seu-pix@email.com']
    );
  }

  console.log('Banco de dados inicializado com sucesso!');
  return db;
}

const dbPromise = setupDatabase();

// Rotas da API
app.get('/api/db', async (req, res) => {
  try {
    const db = await dbPromise;
    const settings = await db.get('SELECT * FROM settings WHERE id = 1');
    const products = await db.all('SELECT * FROM products');
    const sales = await db.all('SELECT * FROM sales');
    
    // Converter a string de itens de volta para objeto
    const parsedSales = sales.map(s => ({
      ...s,
      items: JSON.parse(s.items)
    }));

    res.json({ settings, products, sales: parsedSales });
  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

app.post('/api/db', async (req, res) => {
  const db = await dbPromise;
  const { settings, products, sales } = req.body;

  try {
    // Inicia uma transação para garantir que tudo ou nada seja salvo
    await db.run('BEGIN TRANSACTION');

    if (settings) {
      await db.run(
        'UPDATE settings SET shopName = ?, shopLogo = ?, adminPassword = ?, pixKey = ? WHERE id = 1',
        [settings.shopName, settings.shopLogo, settings.adminPassword, settings.pixKey]
      );
    }

    if (products) {
      await db.run('DELETE FROM products');
      for (const p of products) {
        await db.run(
          'INSERT INTO products (id, name, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [p.id, p.name, p.price, p.image, p.category, p.stock]
        );
      }
    }

    if (sales) {
      await db.run('DELETE FROM sales');
      for (const s of sales) {
        await db.run(
          'INSERT INTO sales (id, total, paymentMethod, timestamp, items, buyerName, buyerPhone) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s.id, s.total, s.paymentMethod, s.timestamp, JSON.stringify(s.items), s.buyerName || null, s.buyerPhone || null]
        );
      }
    }

    await db.run('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.run('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar no banco SQL' });
  }
});

// Image Search API - busca imagens do produto pelo nome (SerpApi)
app.get('/api/search-image', async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Parâmetro q (query) é obrigatório' });
  }

  const SERPAPI_KEY = 'bdd1941fc76b3f2c424f3ca5d4076bf994e56d2397f37ab0b9b65d1f62449dc3';
  
  try {
    // SerpApi - Google Images (temos chave disponível)
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_images',
        q: `${q} produto`,
        api_key: SERPAPI_KEY,
        ijn: 0,
        num: 8
      },
      timeout: 10000
    });

    const images = response.data.images_results?.slice(0, 8).map(img => ({
      thumbnail: img.thumbnail || img.original_thumbnail,
      original: img.original || img.link,
      title: img.title || q
    })) || [];

    res.json({ images });
  } catch (error) {
    console.error('Erro ao buscar imagens:', error.message);
    
    // Fallback: picsum com seed
    const images = Array.from({ length: 6 }, (_, i) => ({
      thumbnail: `https://picsum.photos/seed/${encodeURIComponent(q)}${i}/200/200`,
      original: `https://picsum.photos/seed/${encodeURIComponent(q)}${i}/400/400`,
      title: `${q} - opção ${i + 1}`
    }));
    
    res.json({ images });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Servir arquivos estáticos da pasta dist (build do Vite)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('Servindo arquivos de:', distPath);
} else {
  app.use(express.static(__dirname));
  console.log('Servindo arquivos de:', __dirname);
}

// SPA fallback - usar middleware ao invés de rota com wildcard (Express 5)
app.use((req, res, next) => {
  // Ignora rotas de API
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const indexPath = fs.existsSync(distPath) 
    ? path.join(distPath, 'index.html')
    : path.join(__dirname, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Arquivo não encontrado');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`Servidor PDV rodando na porta ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
  console.log(`Dist path: ${distPath}`);
  console.log(`Dist exists: ${fs.existsSync(distPath)}`);
  console.log(`=================================`);
});
