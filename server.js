
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Inicializa o banco de dados se não existir
if (!fs.existsSync(DB_PATH)) {
  const initialData = {
    settings: {
      shopName: 'Meu Mercadinho PDV',
      shopLogo: 'https://picsum.photos/seed/shop/200/200',
      adminPassword: 'admin',
      pixKey: 'seu-pix@email.com'
    },
    products: [],
    sales: []
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

// Endpoint para ler todo o banco
app.get('/api/db', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler banco de dados' });
  }
});

// Endpoint para salvar dados (Upsert total para simplicidade)
app.post('/api/db', (req, res) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
  }
});

// Rota coringa para o React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SmartPDV rodando na porta ${PORT}`);
});
