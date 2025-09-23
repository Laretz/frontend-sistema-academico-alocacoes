# 🎓 Sistema de Alocação Acadêmica - Frontend

## 📋 Visão Geral

Este é o frontend do Sistema de Alocação Acadêmica, uma aplicação web moderna desenvolvida para fornecer uma interface intuitiva e responsiva para o gerenciamento de horários, professores, disciplinas e salas em instituições de ensino. Construído com **Next.js 15** e **TypeScript**, seguindo as melhores práticas de desenvolvimento frontend moderno.

## 🏗️ Arquitetura

### 🎯 Arquitetura Modular

O projeto segue uma arquitetura modular bem estruturada, com separação clara de responsabilidades:

```
src/
├── app/                    # App Router do Next.js 15
│   ├── dashboard/         # Página principal com métricas
│   ├── disciplinas/       # Gestão de disciplinas
│   ├── login/            # Autenticação de usuários
│   ├── turmas/           # Gestão de turmas
│   ├── usuarios/         # Gestão de usuários
│   ├── cursos/           # Gestão de cursos
│   ├── salas/            # Gestão de salas
│   ├── alocacoes/        # Sistema de alocação
│   └── grade-horarios/   # Visualização de grades
├── components/            # Componentes reutilizáveis
│   ├── forms/            # Formulários especializados
│   ├── layout/           # Layouts da aplicação
│   └── ui/               # Componentes base (Shadcn/ui)
├── hooks/                # Custom hooks
├── lib/                  # Configurações e utilitários
├── services/             # Serviços de API
├── store/                # Gerenciamento de estado
├── types/                # Definições TypeScript
└── utils/                # Funções utilitárias
```

### 🔧 Padrões Arquiteturais

#### **Component-Based Architecture**
- Componentes reutilizáveis e modulares
- Separação clara entre UI e lógica de negócio
- Props tipadas com TypeScript

#### **State Management**
- **Zustand** para estado global da aplicação
- **React Query** para cache e sincronização de dados
- Estado local com React hooks quando apropriado

#### **Service Layer**
- Abstração completa das chamadas de API
- Interceptors para autenticação automática
- Tratamento centralizado de erros

## 🛠️ Stack Tecnológica

### 🚀 **Core Framework**
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática e desenvolvimento seguro

### 🎨 **UI/UX**
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes UI modernos e acessíveis
- **Lucide React** - Ícones consistentes e elegantes
- **Next Themes** - Sistema de temas dark/light

### 📊 **Estado e Dados**
- **Zustand** - Gerenciamento de estado simples e eficiente
- **TanStack React Query** - Cache e sincronização de dados
- **Axios** - Cliente HTTP para requisições

### 📝 **Formulários e Validação**
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas TypeScript-first
- **@hookform/resolvers** - Integração Zod + React Hook Form

### 🔔 **UX Enhancements**
- **Sonner** - Notificações toast elegantes
- **React Day Picker** - Seletor de datas intuitivo
- **Class Variance Authority** - Variantes de componentes

### 🧪 **Desenvolvimento**
- **ESLint** - Linting e padronização de código
- **Turbopack** - Bundler ultra-rápido do Next.js

## 🎯 Funcionalidades Principais

### ✅ **Implementadas**

#### 🔐 **Sistema de Autenticação**
- Login seguro com validação de formulário
- Autenticação JWT com refresh automático
- Controle de acesso baseado em roles (ADMIN, COORDENADOR, PROFESSOR)
- Middleware de proteção de rotas
- Logout automático em caso de token expirado

#### 📊 **Dashboard Inteligente**
- Métricas em tempo real do sistema
- Estatísticas de usuários, turmas e alocações
- Gráficos e indicadores visuais
- Acesso rápido às funcionalidades principais

#### 👥 **Gestão de Usuários**
- CRUD completo de usuários (restrito a admins)
- Formulários de criação e edição com validação
- Busca e filtros avançados
- Paginação automática
- Controle de perfis e permissões

#### 🎓 **Gestão Acadêmica**
- **Cursos**: Criação e gestão de cursos por turnos
- **Disciplinas**: Controle de carga horária e códigos
- **Turmas**: Gestão de períodos e capacidade
- **Salas**: Organização por prédios e tipos
- **Professor-Disciplina**: Vinculação de professores às disciplinas

#### 📅 **Sistema de Alocação**
- Interface intuitiva para alocação manual
- Visualização de conflitos em tempo real
- Alocação automática com algoritmo genético
- Grade horária interativa e responsiva
- Filtros por turma, professor ou sala

#### 📱 **Interface Responsiva**
- Design adaptativo para desktop, tablet e mobile
- Sidebar colapsível em dispositivos móveis
- Componentes otimizados para touch
- Performance otimizada em todas as telas

### 🚧 **Em Desenvolvimento**
- PWA (Progressive Web App) para uso offline
- Exportação de grades em PDF
- Notificações push em tempo real
- Modo de visualização para estudantes

## 🎨 Design System

### 🌈 **Temas**
- **Light Mode**: Interface clara e profissional
- **Dark Mode**: Redução de fadiga visual
- Alternância instantânea entre temas
- Persistência da preferência do usuário

### 🧩 **Componentes UI**
Baseado no **Shadcn/ui** com customizações:

```typescript
// Componentes principais
├── Button           # Botões com variantes
├── Input            # Campos de entrada
├── Select           # Seletores dropdown
├── Dialog           # Modais e diálogos
├── Table            # Tabelas responsivas
├── Card             # Cards informativos
├── Badge            # Indicadores de status
├── Avatar           # Avatares de usuário
├── DropdownMenu     # Menus contextuais
└── ThemeToggle      # Alternador de tema
```

### 🎯 **Padrões de UX**
- **Feedback Visual**: Loading states e animações suaves
- **Validação em Tempo Real**: Feedback imediato em formulários
- **Navegação Intuitiva**: Breadcrumbs e indicadores de localização
- **Acessibilidade**: Suporte a leitores de tela e navegação por teclado

## 🔌 Integração com Backend

### 🌐 **Configuração da API**

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

// Interceptors automáticos
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 📡 **Serviços Implementados**

#### 🔐 **Auth Service**
```typescript
// services/auth.ts
- login(email, password)          # Autenticação
- logout()                        # Logout seguro
- getProfile()                    # Perfil do usuário
- refreshToken()                  # Renovação automática
```

#### 👥 **User Service**
```typescript
// services/users.ts
- getAll(page, search)            # Listar usuários
- getById(id)                     # Buscar usuário
- create(userData)                # Criar usuário
- update(id, userData)            # Atualizar usuário
- delete(id)                      # Excluir usuário
```

#### 🎓 **Entities Service**
```typescript
// services/entities.ts
- getCursos()                     # Listar cursos
- getDisciplinas()                # Listar disciplinas
- getTurmas()                     # Listar turmas
- getSalas()                      # Listar salas
- getAlocacoes()                  # Listar alocações
- getGradeHorarios()              # Grade de horários
```

### 🔄 **Estado e Cache**

```typescript
// React Query para cache inteligente
const { data, isLoading, error } = useQuery({
  queryKey: ['usuarios', page, search],
  queryFn: () => userService.getAll(page, search),
  staleTime: 5 * 60 * 1000, // 5 minutos
});

// Zustand para estado global
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

## 🚀 Como Executar

### 📋 **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Backend rodando em http://localhost:3333

### 📦 **1. Instalação**
```bash
# Clonar o repositório
git clone <repository-url>
cd front-end

# Instalar dependências
npm install
```

### ⚙️ **2. Configuração**
Crie o arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 🚀 **3. Execução**
```bash
# Desenvolvimento (com Turbopack)
npm run dev

# Build para produção
npm run build

# Executar produção
npm start

# Linting
npm run lint
```

### 🌐 **4. Acesso**
- **Frontend**: http://localhost:3000
- **Login padrão**: admin@admin.com / 123456

## 📱 Páginas e Funcionalidades

### 🏠 **Dashboard** (`/dashboard`)
- Visão geral do sistema
- Métricas de usuários, turmas e alocações
- Acesso rápido às funcionalidades
- Gráficos e estatísticas

### 👥 **Usuários** (`/usuarios`)
- Listagem com busca e paginação
- Criação de novos usuários
- Edição de perfis e permissões
- Exclusão com confirmação

### 🎓 **Gestão Acadêmica**
- **Cursos** (`/cursos`): CRUD de cursos
- **Disciplinas** (`/disciplinas`): Gestão de disciplinas
- **Turmas** (`/turmas`): Controle de turmas
- **Salas** (`/salas`): Gestão de salas por prédio

### 📅 **Sistema de Alocação**
- **Alocações** (`/alocacoes`): Interface de alocação
- **Grade de Horários** (`/grade-horarios`): Visualização interativa
- **Grade Mensal** (`/grade-mensal`): Visão mensal detalhada

### 🔗 **Professor-Disciplina** (`/professor-disciplina`)
- Vinculação de professores às disciplinas
- Gestão de relacionamentos acadêmicos

## 🎯 Pontos Fortes

### 🏗️ **Arquitetura Moderna**
- **Next.js 15** com App Router para performance máxima
- **TypeScript** para desenvolvimento type-safe
- **Component-based** architecture para reutilização
- **Service layer** para abstração de APIs

### 🎨 **Design Excepcional**
- **Shadcn/ui** para componentes consistentes
- **Tailwind CSS** para estilização eficiente
- **Responsive design** para todos os dispositivos
- **Dark/Light mode** para melhor experiência

### ⚡ **Performance Otimizada**
- **Turbopack** para builds ultra-rápidos
- **React Query** para cache inteligente
- **Code splitting** automático
- **Lazy loading** de componentes

### 🔒 **Segurança Robusta**
- **JWT authentication** com refresh automático
- **Role-based access control**
- **Middleware de proteção** de rotas
- **Validação client-side** com Zod

### 🧪 **Qualidade Assegurada**
- **TypeScript** para type safety
- **ESLint** para padronização
- **React Hook Form** para formulários performáticos
- **Error boundaries** para tratamento de erros

### 📱 **UX Excepcional**
- **Interface intuitiva** e moderna
- **Feedback visual** em todas as ações
- **Loading states** e animações suaves
- **Notificações toast** elegantes

## 🚀 Próximos Passos

### 📱 **Progressive Web App (PWA)**
- [ ] Service Workers para cache offline
- [ ] Manifest para instalação no dispositivo
- [ ] Sincronização em background
- [ ] Notificações push

### 🎯 **Funcionalidades Avançadas**
- [ ] Exportação de grades em PDF
- [ ] Importação de dados via CSV/Excel
- [ ] Sistema de notificações em tempo real
- [ ] Chat integrado para comunicação
- [ ] Calendário interativo com drag & drop

### 📊 **Analytics e Relatórios**
- [ ] Dashboard executivo com métricas avançadas
- [ ] Relatórios personalizáveis
- [ ] Gráficos interativos com Chart.js
- [ ] Exportação de relatórios
- [ ] Análise de uso do sistema

### 🌐 **Internacionalização**
- [ ] Suporte a múltiplos idiomas (i18n)
- [ ] Formatação de datas e números por região
- [ ] Textos dinâmicos baseados no locale
- [ ] RTL support para idiomas árabes

### 🧪 **Testes e Qualidade**
- [ ] Testes unitários com Jest
- [ ] Testes de integração com Testing Library
- [ ] Testes E2E com Playwright
- [ ] Visual regression testing
- [ ] Performance testing

### ⚡ **Performance e Otimização**
- [ ] Server-side rendering (SSR) otimizado
- [ ] Static generation para páginas públicas
- [ ] Image optimization automática
- [ ] Bundle analysis e otimização
- [ ] CDN integration

### 🔐 **Segurança Avançada**
- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication
- [ ] Session management avançado
- [ ] Audit logs de ações do usuário
- [ ] Content Security Policy (CSP)

### 🎨 **UI/UX Enhancements**
- [ ] Animações micro-interativas
- [ ] Skeleton loading states
- [ ] Infinite scrolling para listas grandes
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements (WCAG 2.1)

### 🔌 **Integrações**
- [ ] Integração com Google Calendar
- [ ] Sincronização com sistemas acadêmicos
- [ ] API para aplicativos móveis
- [ ] Webhooks para notificações externas
- [ ] Single Sign-On (SSO) integration

## 🎯 Conclusão

Este frontend representa uma implementação moderna e robusta de uma interface para sistema de alocação acadêmica, demonstrando:

- **Excelência Técnica**: Uso das tecnologias mais modernas do ecossistema React
- **Design Centrado no Usuário**: Interface intuitiva e responsiva
- **Performance Otimizada**: Carregamento rápido e experiência fluida
- **Escalabilidade**: Arquitetura preparada para crescimento
- **Manutenibilidade**: Código limpo e bem estruturado
- **Acessibilidade**: Inclusivo para todos os usuários

A aplicação oferece uma experiência completa e profissional para gestão acadêmica, combinando funcionalidade robusta com design moderno e performance excepcional.

---

**Desenvolvido com ❤️ para o TCC - Sistema de Alocação Acadêmica**