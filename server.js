import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.sqlite');

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

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
      items TEXT
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

  return db;
}

const dbPromise = setupDatabase();

// Rotas da API
app.get('/api/db', async (req, res) => {
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
          'INSERT INTO sales (id, total, paymentMethod, timestamp, items) VALUES (?, ?, ?, ?, ?)',
          [s.id, s.total, s.paymentMethod, s.timestamp, JSON.stringify(s.items)]
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

// Fallback para SPA (Express 5 compatível)
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor SQL rodando na porta ${PORT}`);
});