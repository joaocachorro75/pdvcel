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

  // Tabela de Tenants (Lojas/Assinantes)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      whatsapp TEXT UNIQUE NOT NULL,
      shop_name TEXT,
      shop_logo TEXT,
      password TEXT,
      pix_key TEXT,
      plan TEXT DEFAULT 'iniciante',
      status TEXT DEFAULT 'trial',
      trial_ends_at INTEGER,
      created_at INTEGER
    )
  `);

  // Tabela de Produtos (por tenant)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT,
      price REAL,
      image TEXT,
      category TEXT,
      stock INTEGER,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
  `);

  // Tabela de Vendas (por tenant)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      total REAL,
      paymentMethod TEXT,
      timestamp INTEGER,
      items TEXT,
      buyerName TEXT,
      buyerPhone TEXT,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
  `);

  // Tabela antiga de settings (para migração)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      shopName TEXT,
      shopLogo TEXT,
      adminPassword TEXT,
      pixKey TEXT,
      migrated INTEGER DEFAULT 0
    )
  `);

  // Migração: adicionar coluna tenant_id se não existir
  try {
    const productsInfo = await db.all("PRAGMA table_info(products)");
    const hasTenantId = productsInfo.some(col => col.name === 'tenant_id');
    
    if (!hasTenantId) {
      console.log('🔄 Migrando tabela products para multi-tenant...');
      await db.exec(`ALTER TABLE products ADD COLUMN tenant_id TEXT`);
    }

    const salesInfo = await db.all("PRAGMA table_info(sales)");
    const salesHasTenantId = salesInfo.some(col => col.name === 'tenant_id');
    
    if (!salesHasTenantId) {
      console.log('🔄 Migrando tabela sales para multi-tenant...');
      await db.exec(`ALTER TABLE sales ADD COLUMN tenant_id TEXT`);
    }
  } catch (err) {
    console.log('Aviso: migração de colunas:', err.message);
  }

  // Criar SuperAdmin padrão se não existir
  const superAdmin = await db.get("SELECT * FROM tenants WHERE id = 'superadmin'");
  if (!superAdmin) {
    await db.run(
      `INSERT INTO tenants (id, whatsapp, shop_name, shop_logo, password, plan, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['superadmin', '00000000000', 'To-Ligado.com', 'https://to-ligado.com/logo.png', 'toligado123', 'superadmin', 'active', Date.now()]
    );
    console.log('✅ SuperAdmin criado: senha = toligado123');
  }

  // Migrar dados antigos se existirem
  const oldSettings = await db.get("SELECT * FROM settings WHERE id = 1");
  if (oldSettings && !oldSettings.migrated) {
    const tenantId = 'tenant_' + Date.now();
    await db.run(
      `INSERT OR IGNORE INTO tenants (id, whatsapp, shop_name, shop_logo, password, pix_key, plan, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, '99999999999', oldSettings.shopName || 'Minha Loja', oldSettings.shopLogo, oldSettings.adminPassword || 'admin', oldSettings.pixKey, 'iniciante', 'active', Date.now()]
    );
    // Migrar produtos e vendas
    await db.run(`UPDATE products SET tenant_id = ? WHERE tenant_id IS NULL`, [tenantId]);
    await db.run(`UPDATE sales SET tenant_id = ? WHERE tenant_id IS NULL`, [tenantId]);
    await db.run(`UPDATE settings SET migrated = 1 WHERE id = 1`);
    console.log('✅ Dados antigos migrados para tenant:', tenantId);
  }

  console.log('Banco de dados inicializado com sucesso!');
  return db;
}

const dbPromise = setupDatabase();

// ==================== AUTENTICAÇÃO ====================

// Login - Cliente ou SuperAdmin
app.post('/api/auth/login', async (req, res) => {
  const { whatsapp, password } = req.body;
  const db = await dbPromise;

  try {
    // Tentar SuperAdmin primeiro
    if (whatsapp === 'superadmin' || whatsapp === '00000000000') {
      const admin = await db.get("SELECT * FROM tenants WHERE id = 'superadmin'");
      if (admin && admin.password === password) {
        return res.json({
          success: true,
          tenant: {
            id: admin.id,
            whatsapp: admin.whatsapp,
            shop_name: admin.shop_name,
            shop_logo: admin.shop_logo,
            plan: admin.plan,
            isSuperAdmin: true
          }
        });
      }
    }

    // Login normal por WhatsApp
    const tenant = await db.get('SELECT * FROM tenants WHERE whatsapp = ?', [whatsapp]);
    if (!tenant) {
      return res.status(401).json({ error: 'WhatsApp não cadastrado' });
    }
    if (tenant.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    if (tenant.status === 'blocked') {
      return res.status(403).json({ error: 'Conta bloqueada. Entre em contato com o suporte.' });
    }

    res.json({
      success: true,
      tenant: {
        id: tenant.id,
        whatsapp: tenant.whatsapp,
        shop_name: tenant.shop_name,
        shop_logo: tenant.shop_logo,
        pix_key: tenant.pix_key,
        plan: tenant.plan,
        status: tenant.status,
        isSuperAdmin: false
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Cadastro - Apenas WhatsApp
app.post('/api/auth/signup', async (req, res) => {
  const { whatsapp, shop_name, password } = req.body;
  const db = await dbPromise;

  if (!whatsapp || !password) {
    return res.status(400).json({ error: 'WhatsApp e senha são obrigatórios' });
  }

  try {
    // Verificar se já existe
    const existing = await db.get('SELECT * FROM tenants WHERE whatsapp = ?', [whatsapp]);
    if (existing) {
      return res.status(400).json({ error: 'Este WhatsApp já está cadastrado' });
    }

    const tenantId = 'tenant_' + Date.now();
    const trialEnds = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias de trial

    await db.run(
      `INSERT INTO tenants (id, whatsapp, shop_name, shop_logo, password, pix_key, plan, status, trial_ends_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, whatsapp, shop_name || 'Minha Loja', 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png', password, '', 'iniciante', 'trial', trialEnds, Date.now()]
    );

    res.json({
      success: true,
      tenant: {
        id: tenantId,
        whatsapp,
        shop_name: shop_name || 'Minha Loja',
        shop_logo: 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png',
        plan: 'iniciante',
        status: 'trial'
      }
    });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// ==================== DADOS DO TENANT ====================

// Buscar dados do tenant
app.get('/api/tenant/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const db = await dbPromise;

  try {
    const tenant = await db.get('SELECT id, whatsapp, shop_name, shop_logo, pix_key, plan, status FROM tenants WHERE id = ?', [tenantId]);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }

    const products = await db.all('SELECT * FROM products WHERE tenant_id = ?', [tenantId]);
    const sales = await db.all('SELECT * FROM sales WHERE tenant_id = ?', [tenantId]);

    res.json({
      settings: tenant,
      products,
      sales: sales.map(s => ({ ...s, items: JSON.parse(s.items) }))
    });
  } catch (err) {
    console.error('Erro ao buscar tenant:', err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// Salvar dados do tenant
app.post('/api/tenant/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const { settings, products, sales } = req.body;
  const db = await dbPromise;

  try {
    await db.run('BEGIN TRANSACTION');

    if (settings) {
      await db.run(
        'UPDATE tenants SET shop_name = ?, shop_logo = ?, pix_key = ? WHERE id = ?',
        [settings.shop_name, settings.shop_logo, settings.pix_key, tenantId]
      );
    }

    if (products) {
      await db.run('DELETE FROM products WHERE tenant_id = ?', [tenantId]);
      for (const p of products) {
        await db.run(
          'INSERT INTO products (id, tenant_id, name, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [p.id, tenantId, p.name, p.price, p.image, p.category, p.stock]
        );
      }
    }

    if (sales) {
      await db.run('DELETE FROM sales WHERE tenant_id = ?', [tenantId]);
      for (const s of sales) {
        await db.run(
          'INSERT INTO sales (id, tenant_id, total, paymentMethod, timestamp, items, buyerName, buyerPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [s.id, tenantId, s.total, s.paymentMethod, s.timestamp, JSON.stringify(s.items), s.buyerName || null, s.buyerPhone || null]
        );
      }
    }

    await db.run('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.run('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar' });
  }
});

// ==================== SUPERADMIN ====================

// Listar todos os tenants
app.get('/api/admin/tenants', async (req, res) => {
  const db = await dbPromise;

  try {
    const tenants = await db.all('SELECT id, whatsapp, shop_name, shop_logo, plan, status, created_at FROM tenants WHERE id != "superadmin" ORDER BY created_at DESC');
    res.json({ tenants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar tenants' });
  }
});

// Atualizar tenant (SuperAdmin)
app.put('/api/admin/tenant/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const { shop_name, shop_logo, plan, status, pix_key, password } = req.body;
  const db = await dbPromise;

  try {
    const updates = [];
    const values = [];

    if (shop_name) { updates.push('shop_name = ?'); values.push(shop_name); }
    if (shop_logo) { updates.push('shop_logo = ?'); values.push(shop_logo); }
    if (plan) { updates.push('plan = ?'); values.push(plan); }
    if (status) { updates.push('status = ?'); values.push(status); }
    if (pix_key !== undefined) { updates.push('pix_key = ?'); values.push(pix_key); }
    if (password) { updates.push('password = ?'); values.push(password); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nada para atualizar' });
    }

    values.push(tenantId);
    await db.run(`UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tenant' });
  }
});

// Deletar tenant
app.delete('/api/admin/tenant/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const db = await dbPromise;

  try {
    await db.run('DELETE FROM products WHERE tenant_id = ?', [tenantId]);
    await db.run('DELETE FROM sales WHERE tenant_id = ?', [tenantId]);
    await db.run('DELETE FROM tenants WHERE id = ?', [tenantId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar tenant' });
  }
});

// Estatísticas gerais (SuperAdmin)
app.get('/api/admin/stats', async (req, res) => {
  const db = await dbPromise;

  try {
    const totalTenants = await db.get("SELECT COUNT(*) as count FROM tenants WHERE id != 'superadmin'");
    const activeTenants = await db.get("SELECT COUNT(*) as count FROM tenants WHERE status = 'active' AND id != 'superadmin'");
    const trialTenants = await db.get("SELECT COUNT(*) as count FROM tenants WHERE status = 'trial' AND id != 'superadmin'");
    const parceiroTenants = await db.get("SELECT COUNT(*) as count FROM tenants WHERE plan = 'parceiro' AND id != 'superadmin'");
    const totalSales = await db.get("SELECT COUNT(*) as count, SUM(total) as revenue FROM sales");
    const planCounts = await db.all("SELECT plan, COUNT(*) as count FROM tenants WHERE id != 'superadmin' GROUP BY plan");

    // Calcular MRR previsto (faturamento mensal recorrente)
    const planPrices = { iniciante: 29, profissional: 59, empresarial: 99, parceiro: 0 };
    let mrr = 0;
    planCounts.forEach(p => {
      if (planPrices[p.plan] !== undefined) {
        mrr += planPrices[p.plan] * p.count;
      }
    });

    res.json({
      totalTenants: totalTenants.count,
      activeTenants: activeTenants.count,
      trialTenants: trialTenants.count,
      parceiroTenants: parceiroTenants.count,
      totalSales: totalSales.count || 0,
      totalRevenue: totalSales.revenue || 0,
      mrr,
      planCounts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
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
