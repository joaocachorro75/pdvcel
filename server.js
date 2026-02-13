
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(express.json({ limit: '50mb' }));

// 1. Servir arquivos estáticos primeiro
app.use(express.static(__dirname));

// Função para garantir que o BD JSON exista
const initDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      settings: {
        shopName: 'SMART PDV',
        shopLogo: 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png',
        adminPassword: 'admin',
        pixKey: 'seu-pix@email.com'
      },
      products: [],
      sales: []
    };
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    } catch (err) {
      console.error("Erro ao criar db.json:", err);
    }
  }
};

initDB();

// 2. Rotas da API
app.get('/api/db', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler banco' });
  }
});

app.post('/api/db', (req, res) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar' });
  }
});

// 3. Fallback para SPA (DEVE ser a última coisa)
// No Express 5, evitamos app.get('*') se houver erro de path-to-regexp.
// app.use sem path funciona como um catch-all seguro.
app.use((req, res, next) => {
  // Se for uma requisição de arquivo que não existe, ou rota de navegação, manda o index.html
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
