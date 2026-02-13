
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

// Middleware para servir arquivos estáticos
app.use(express.static(__dirname));

// Função para garantir que o BD JSON exista com dados iniciais
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
      console.log("Banco de dados db.json criado com sucesso.");
    } catch (err) {
      console.error("Erro ao criar db.json:", err);
    }
  }
};

initDB();

// API: Retorna todo o conteúdo do banco
app.get('/api/db', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler banco de dados', details: err.message });
  }
});

// API: Sobrescreve o banco com novos dados (Sincronização Full)
app.post('/api/db', (req, res) => {
  try {
    const data = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(DB_PATH, data);
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao salvar db.json:", err);
    res.status(500).json({ error: 'Erro ao salvar dados', details: err.message });
  }
});

// Rota de fallback para SPA (Single Page Application)
// No Express 5 (path-to-regexp v8), parâmetros curinga devem ser nomeados.
// Usamos /:path* para capturar qualquer rota e redirecionar para o index.html.
app.get('/:path*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartPDV Online na porta ${PORT}`);
});
