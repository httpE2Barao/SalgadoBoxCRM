# 🍽️ Salgado Box

Sistema de automação de restaurantes completo para gerenciamento de pedidos, cardápio e estoque.

## 🚀 Início Rápido

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

Acesse http://localhost:3000

### Produção
```bash
npm run build
npm start
```

## 🔐 Acesso

- **URL:** http://localhost:3000

## 📋 Funcionalidades

- 📊 Dashboard com métricas em tempo real
- 🍽️ Gerenciamento completo de cardápio
- 📦 Controle de estoque inteligente
- 🛒 Sistema de pedidos integrado
- 👥 Gestão de clientes
- 🎫 Cupons de desconto
- 📱 Cardápio público para clientes

## 🛠️ Tecnologia

- **Frontend:** Next.js 15, React 19, TypeScript
- **Estilos:** Tailwind CSS, shadcn/ui
- **Banco de Dados:** SQLite com Prisma ORM
- **Autenticação:** Sistema próprio com localStorage
- **Estado:** Zustand, React Query

## 📁 Estrutura do Projeto

```
src/
├── app/                 # Páginas Next.js (App Router)
├── components/          # Componentes React
│   └── ui/             # Componentes shadcn/ui
├── hooks/              # Hooks personalizados
├── lib/                # Utilitários e configurações
└── store/              # Gerenciamento de estado
```

## 🚀 Scripts Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Servidor de produção
npm start

# Verificar código
npm run lint

# Banco de dados
npm run db:push
npm run db:generate
npm run db:migrate
```

## 📝 Desenvolvimento

O projeto está configurado para desenvolvimento com:

- **Hot Reload:** Alterações refletem instantaneamente
- **TypeScript:** Tipagem segura em todo o projeto
- **ESLint:** Código limpo e consistente
- **Prisma:** Migrações e seed automáticos

---

**Desenvolvido com ❤️ para restaurantes**
