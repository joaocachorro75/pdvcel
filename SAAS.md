# SmartPDV - SaaS de PDV Mobile

## 🎯 Posicionamento

**"O PDV que cabe no seu bolso"**

Sistema de ponto de venda 100% mobile, feito para:
- 🏪 **Mercadinhos e Mini-mercados**
- 👕 **Lojas de roupas e acessórios**
- 🛒 **Ambulantes e Feirantes**
- 💅 **Salões de beleza e Barbearias**
- 🍔 **Lanchonetes e Food Trucks**
- 📦 **Comércios em geral**

---

## 💰 Planos e Preços

| Plano | Preço | Ideal Para |
|-------|-------|------------|
| **Iniciante** | R$ 29/mês | Ambulantes, feirantes |
| **Profissional** | R$ 59/mês | Lojas pequenas, salões |
| **Empresarial** | R$ 99/mês | Mercados, lojas maiores |

### Detalhes dos Planos

#### 🌱 Iniciante - R$ 29/mês
- 1 usuário
- Até 100 produtos
- Histórico de 30 dias
- Relatórios básicos
- Suporte via chat

#### 🚀 Profissional - R$ 59/mês
- 3 usuários
- Até 500 produtos
- Histórico de 90 dias
- Relatórios avançados
- Exportação de dados
- Suporte prioritário

#### 💎 Empresarial - R$ 99/mês
- Usuários ilimitados
- Produtos ilimitados
- Histórico ilimitado
- API de integração
- Múltiplas lojas
- Suporte 24/7

---

## 🎨 Identidade Visual

### Nome do Produto
**SmartPDV** - Sistema Mobile de Vendas

### Slogan
"Seu negócio na palma da mão"

### Cores
- Primária: `#4f46e5` (Indigo)
- Secundária: `#10b981` (Emerald)
- Background: `#f8fafc` (Slate 50)
- Texto: `#1e293b` (Slate 800)

### Fonte
Inter (moderna, legível em mobile)

---

## 📱 Funcionalidades

### ✅ Já Implementadas
- [x] Catálogo de produtos com foto
- [x] Busca automática de imagens
- [x] Carrinho de compras
- [x] Múltiplas formas de pagamento (PIX, Dinheiro, Cartão)
- [x] QR Code PIX automático
- [x] Recibo via WhatsApp
- [x] Dados do comprador
- [x] Histórico de vendas com filtros
- [x] Estatísticas por período
- [x] 100% responsivo mobile/desktop

### 🔄 A Implementar (SaaS)
- [ ] Landing page profissional
- [ ] Sistema de autenticação (login/cadastro)
- [ ] Multi-tenant (cada cliente tem seus dados)
- [ ] Assinatura e pagamentos
- [ ] Dashboard do cliente
- [ ] Configurações da loja (nome, logo, PIX)
- [ ] Relatórios em PDF
- [ ] Backup automático na nuvem

---

## 🏗️ Arquitetura SaaS

### Banco de Dados
```
tenants (lojas)
├── id
├── name
├── slug (subdomínio)
├── plan
├── stripeCustomerId
├── createdAt

users (usuários)
├── id
├── tenantId
├── email
├── password
├── role
├── createdAt

products
├── id
├── tenantId
├── name
├── price
├── image
├── category
├── stock

sales
├── id
├── tenantId
├── items
├── total
├── paymentMethod
├── buyerName
├── buyerPhone
├── timestamp
```

### Estrutura de Arquivos
```
/pdvcel-saas
├── /app
│   ├── /(marketing)
│   │   ├── page.tsx (landing)
│   │   └── /precos
│   ├── /(app)
│   │   ├── /dashboard
│   │   ├── /vender
│   │   ├── /estoque
│   │   ├── /vendas
│   │   └── /configuracoes
│   └── /auth
│       ├── /login
│       └── /cadastro
├── /components
├── /lib
│   ├── db.ts
│   ├── auth.ts
│   └── stripe.ts
└── /api
    ├── /auth
    ├── /checkout
    └── /webhooks
```

---

## 📝 Próximos Passos

1. **Criar landing page** - Vender o produto
2. **Sistema de autenticação** - Login com email/senha
3. **Multi-tenant** - Separar dados por loja
4. **Integração Stripe/MercadoPago** - Assinaturas
5. **Deploy** - Colocar no ar

---

*Documento criado em: 2026-02-22*
*Versão: 1.0*
