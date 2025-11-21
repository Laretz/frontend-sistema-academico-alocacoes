# 📋 Estrutura do Projeto Frontend - Sistema de Alocação Acadêmica

## 🏗️ Arquitetura Geral

Este projeto frontend foi desenvolvido com **Next.js 15** + **TypeScript** seguindo as melhores práticas de desenvolvimento moderno.

### 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: Shadcn/ui
- **Gerenciamento de Estado**: Zustand
- **Requisições HTTP**: Axios + React Query
- **Validação**: Zod + React Hook Form
- **Notificações**: Sonner

## 📁 Estrutura de Pastas

```
src/
├── app/                  # App Router do Next.js
│   ├── dashboard/        # Página principal do sistema
│   ├── disciplinas/      # Gestão de disciplinas
│   ├── login/            # Autenticação
│   ├── turmas/           # Gestão de turmas
│   ├── usuarios/         # Gestão de usuários
│   │    ├── novo/        # Criação de usuário
│   │    ├── [id]/editar/ # Edição de usuário
    └─── etc              # outras paginas do sistema
├── components/           # Componentes reutilizáveis
│   ├── forms/            # Formulários
│   ├── layout/           # Layouts da aplicação
│   └── ui/               # Componentes base (Shadcn/ui)
├── hooks/                # Custom hooks
├── lib/                  # Configurações e utilitários
├── services/             # Serviços de API
├── store/                # Gerenciamento de estado 
├── types/                # Definições de tipos TypeScript
└── utils/                # Funções utilitárias
```









a
a

a

a
a
a

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

1. **Login**: `/login` - Formulário com validação
2. **Middleware**: Proteção de rotas automática
3. **Store**: Gerenciamento de estado do usuário
4. **Interceptors**: Adição automática de tokens nas requisições

### Perfis de Usuário

- **ADMIN**: Acesso total ao sistema
- **PROFESSOR**: Visualização de grades e disciplinas
- **ALUNO**: Visualização limitada

## 🎨 Interface e UX

### Layout Principal

- **Sidebar responsiva** com navegação
- **Header** com perfil do usuário
- **Tema moderno** com Tailwind CSS
- **Componentes consistentes** com Shadcn/ui

### Funcionalidades Implementadas

- ✅ Sistema de login com validação
- ✅ Dashboard com estatísticas
- ✅ Gestão de usuários (CRUD completo)
- ✅ Listagem de disciplinas
- ✅ Listagem de turmas
- ✅ Formulários de criação/edição
- ✅ Controle de acesso por perfil

## 🔌 Integração com Backend

### Configuração da API

**Arquivo**: `src/lib/api.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
```

**Variáveis de Ambiente**: `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### Serviços Implementados

1. **Auth Service** (`src/services/auth.ts`)

   - Login/logout
   - Perfil do usuário
   - Refresh token

2. **User Service** (`src/services/users.ts`)

   - CRUD de usuários
   - Busca e paginação

3. **Entities Service** (`src/services/entities.ts`)
   - Disciplinas, Turmas, Salas
   - Alocações e horários

### Endpoints do Backend

```typescript
// Autenticação
POST /session           # Login
GET  /profile           # Perfil do usuário

// Usuários
GET    /users           # Listar usuários
POST   /users           # Criar usuário
GET    /users/:id       # Buscar usuário
PUT    /users/:id       # Atualizar usuário
DELETE /users/:id       # Excluir usuário

// Disciplinas
GET    /disciplinas     # Listar disciplinas
POST   /disciplinas     # Criar disciplina

// Turmas
GET    /turmas          # Listar turmas
POST   /turmas          # Criar turma

// Salas
GET    /salas           # Listar salas
POST   /salas           # Criar sala

// Alocações
GET    /alocacoes       # Listar alocações
POST   /alocacoes       # Criar alocação
GET    /grade-horarios  # Grade de horários
```

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

### 4. Acessar a Aplicação

- Frontend: http://localhost:3000
- Backend: http://localhost:3333

## 🔧 Conectando com o Backend

### Passos para Integração Completa

1. **Iniciar o Backend**

   ```bash
   cd ../backend
   npm run dev
   ```

2. **Verificar Endpoints**

   - Teste os endpoints no Postman/Insomnia
   - Verifique se o CORS está configurado

3. **Ativar Integração Real**
   Nos arquivos de serviço, descomente as linhas:

   ```typescript
   // TODO: Implementar quando o backend estiver conectado
   const response = await userService.getAll();
   setUsuarios(response.data);
   ```

4. **Testar Funcionalidades**
   - Login com usuário real
   - CRUD de usuários
   - Navegação entre páginas

## 📝 Próximos Passos

### Funcionalidades Pendentes

- [ ] Integração completa com backend
- [ ] Formulários de disciplinas e turmas
- [ ] Sistema de alocação de horários
- [ ] Grade horária interativa
- [ ] Relatórios e exportação
- [ ] Notificações em tempo real
- [ ] Testes automatizados

### Melhorias Sugeridas

- [ ] PWA (Progressive Web App)
- [ ] Tema dark/light
- [ ] Internacionalização (i18n)
- [ ] Cache otimizado
- [ ] Lazy loading de componentes

## 🐛 Resolução de Problemas

### Erros Comuns

1. **Erro de CORS**

   - Verificar configuração no backend
   - Adicionar origem do frontend nas configurações

2. **Token Expirado**

   - Implementar refresh token automático
   - Redirecionar para login quando necessário

3. **Tipos TypeScript**
   - Manter interfaces sincronizadas com backend
   - Usar Zod para validação em runtime

### Debug

```typescript
// Habilitar logs de requisições
api.interceptors.request.use((config) => {
  console.log("Request:", config);
  return config;
});
```

## 📚 Documentação Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)

---

**Desenvolvido com ❤️ para o TCC - Sistema de Alocação Acadêmica**
