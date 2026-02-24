import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  ShoppingCart, 
  QrCode, 
  TrendingUp, 
  Users, 
  Check, 
  Zap,
  Shield,
  HeadphonesIcon,
  ChevronRight,
  Play,
  Star
} from 'lucide-react';

const Landing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "100% Mobile",
      description: "Funciona em qualquer celular, sem precisar instalar app"
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Catálogo Digital",
      description: "Cadastre produtos com foto, preço e estoque"
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "PIX Automático",
      description: "QR Code gerado na hora para pagamento"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Relatórios",
      description: "Acompanhe vendas por dia, semana e mês"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "WhatsApp do Cliente",
      description: "Envie comprovante direto pelo WhatsApp"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Seguro",
      description: "Seus dados salvos na nuvem com backup automático"
    }
  ];

  const plans = [
    {
      name: "Iniciante",
      price: 29,
      features: [
        "1 usuário",
        "Até 100 produtos",
        "Histórico de 30 dias",
        "Relatórios básicos",
        "Suporte via chat"
      ],
      highlight: false
    },
    {
      name: "Profissional",
      price: 59,
      features: [
        "3 usuários",
        "Até 500 produtos",
        "Histórico de 90 dias",
        "Relatórios avançados",
        "Exportação de dados",
        "Suporte prioritário"
      ],
      highlight: true
    },
    {
      name: "Empresarial",
      price: 99,
      features: [
        "Usuários ilimitados",
        "Produtos ilimitados",
        "Histórico ilimitado",
        "API de integração",
        "Múltiplas lojas",
        "Suporte 24/7"
      ],
      highlight: false
    }
    // NOTA: Plano "parceiro" existe mas NÃO aparece no site
    // É gratuito, só o SuperAdmin pode cadastrar
  ];

  const testimonials = [
    {
      name: "Maria da Silva",
      business: "Mercadinho do Bairro",
      text: "Agora consigo controlar tudo pelo celular! Antes eu perdia vendas, hoje sei exatamente quanto faturei.",
      rating: 5
    },
    {
      name: "João Santos",
      business: "Açougue Popular",
      text: "O PIX automático é sensacional! Meus clientes amam a praticidade.",
      rating: 5
    },
    {
      name: "Ana Oliveira",
      business: "Loja de Roupas",
      text: "Uso todo dia na minha loja. Simples, rápido e não precisa de computador!",
      rating: 5
    }
  ];

  return (
    <div className="landing-scroll bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl text-slate-800">PdvCel</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#precos" className="text-sm font-medium text-slate-600 hover:text-indigo-600 hidden sm:block">Preços</a>
            <a href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Entrar</a>
            <a href="/cadastro" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
              Começar Grátis
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap className="w-4 h-4" /> Novo: Busca automática de imagens!
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
              O PDV que cabe<br />
              <span className="text-indigo-600">no seu bolso</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Sistema de vendas 100% mobile para mercadinhos, lojas, ambulantes e salões. 
              Venda mais com praticidade!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/cadastro" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
                Começar Agora <ChevronRight className="w-5 h-5" />
              </a>
              <a href="#como-funciona" className="bg-white text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-slate-200 hover:border-indigo-300 transition-colors flex items-center justify-center gap-2">
                <Play className="w-5 h-5" /> Ver como funciona
              </a>
            </div>

            <p className="text-sm text-slate-400 mt-4">✓ Teste grátis por 2 dias ✓ Sem cartão de crédito</p>
          </div>

          {/* App Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
            <div className="bg-slate-900 rounded-[3rem] p-3 max-w-sm mx-auto shadow-2xl">
              <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                <div className="bg-indigo-600 h-32 flex items-center justify-center">
                  <div className="text-white text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold">Catálogo de Produtos</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-3 bg-slate-200 rounded w-24 mb-2" />
                        <div className="h-3 bg-indigo-200 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-slate-600 text-lg">
              Simples, rápido e feito para quem trabalha com movimento
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 text-center mb-16">
            Quem usa, recomenda
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-bold text-slate-800">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-slate-600 text-lg">
              Comece grátis e escale conforme seu negócio cresce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`bg-white p-8 rounded-3xl border-2 transition-all ${
                  plan.highlight 
                    ? 'border-indigo-600 shadow-xl scale-105' 
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                {plan.highlight && (
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                )}
                <h3 className="font-bold text-xl text-slate-800 mt-4 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">R$ {plan.price}</span>
                  <span className="text-slate-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate-600">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a 
                  href="/cadastro" 
                  className={`block text-center py-4 rounded-xl font-bold transition-colors ${
                    plan.highlight 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Começar Agora
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Pronto para vender mais?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Comece seu teste grátis de 7 dias agora mesmo
          </p>
          <a href="/cadastro" className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-xl">
            Começar Grátis →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">PdvCel</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white">Termos</a>
              <a href="#" className="hover:text-white">Privacidade</a>
              <a href="https://to-ligado.com" target="_blank" className="hover:text-white">To-Ligado.com</a>
            </div>
          </div>
          <p className="text-center text-sm mt-8 text-slate-500">
            © 2026 PdvCel - Um produto To-Ligado.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
