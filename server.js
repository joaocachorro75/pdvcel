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

// API Routes - ANTES dos arquivos estáticos
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

// Servir arquivos estáticos da pasta dist (build do Vite)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('Servindo arquivos de:', distPath);
} else {
  // Fallback: servir da raiz se não houver dist
  app.use(express.static(__dirname));
  console.log('Servindo arquivos de:', __dirname);
}

// SPA fallback - todas as rotas não-API vão para index.html
app.get('*', (req, res) => {
  const indexPath = fs.existsSync(distPath) 
    ? path.join(distPath, 'index.html')
    : path.join(__dirname, 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Dist path:', distPath);
  console.log('Dist exists:', fs.existsSync(distPath));
});
