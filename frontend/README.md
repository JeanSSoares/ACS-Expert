# ACS-Expert — Frontend

> Interface web do sistema de apoio aos Agentes Comunitários de Saúde (ACS) do SUS.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Rodando localmente](#2-rodando-localmente)
3. [Conectando ao backend](#3-conectando-ao-backend)
4. [Estrutura de pastas](#4-estrutura-de-pastas)
5. [Arquitetura e decisões técnicas](#5-arquitetura-e-decisões-técnicas)
6. [Design System](#6-design-system)
7. [Rotas disponíveis](#7-rotas-disponíveis)
8. [Fluxo de autenticação](#8-fluxo-de-autenticação)
9. [Como adicionar uma nova tela](#9-como-adicionar-uma-nova-tela)
10. [Modo offline](#10-modo-offline)

---

## 1. Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Node.js    | **20** (obrigatório — Vite 6 não roda no Node 16/18) |
| npm        | 8+ |

### Instalando o Node 20 com Homebrew (macOS)

```bash
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
node -v   # deve exibir v20.x.x
```

---

## 2. Rodando localmente

```bash
# 1. Entre na pasta do frontend
cd ACS-Expert/frontend

# 2. Instale as dependências (só precisa fazer uma vez)
npm install

# 3. Suba o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** no navegador.

> O servidor recarrega automaticamente ao salvar qualquer arquivo (`hot reload`).

### Outros comandos úteis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia o servidor local |
| `npm run build` | Gera o build de produção na pasta `dist/` |
| `npm run preview` | Serve o build de produção localmente para testes |

---

## 3. Conectando ao backend

O frontend se comunica com o backend via `/api`. Durante o desenvolvimento, o Vite já redireciona automaticamente as chamadas para `http://localhost:3000` — **não é preciso configurar nada**.

```
Navegador  →  http://localhost:5173/api/pacientes
                 ↓ (Vite proxy)
Backend    →  http://localhost:3000/api/pacientes
```

Essa configuração fica em [vite.config.ts](vite.config.ts):

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

Se o backend rodar em outra porta, basta alterar o `target` acima.

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz de `frontend/` para sobrescrever configurações sem commitar:

```env
VITE_API_URL=http://localhost:3000   # URL do backend (opcional, padrão via proxy)
```

---

## 4. Estrutura de pastas

```
frontend/
├── src/
│   ├── app/                   ← Casca da aplicação
│   │   ├── App.tsx            ← Raiz React (só injeta o RouterProvider)
│   │   ├── routes.tsx         ← Todas as rotas declaradas aqui
│   │   ├── pages/             ← Uma pasta por tela (Login, Dashboard, etc.)
│   │   └── components/        ← Componentes compartilhados entre páginas
│   │       ├── Sidebar.tsx    ← Menu lateral (desktop)
│   │       ├── BottomNav.tsx  ← Barra inferior (mobile)
│   │       ├── ResponsiveLayout.tsx  ← Wrapper que decide Sidebar vs BottomNav
│   │       └── ui/            ← Componentes base (Button, Input, Card…)
│   │
│   ├── features/              ← Lógica de negócio por domínio
│   │   ├── auth/
│   │   ├── pacientes/
│   │   ├── triagem/
│   │   ├── visitas/
│   │   ├── encaminhamentos/
│   │   ├── agenda/
│   │   ├── alertas/
│   │   └── dashboard/
│   │
│   ├── store/                 ← Estado global (Zustand)
│   │   ├── authStore.ts       ← Usuário logado, token JWT
│   │   ├── pacientesStore.ts  ← Lista de pacientes paginada
│   │   └── triagemStore.ts    ← Dados do wizard de triagem
│   │
│   ├── services/              ← Comunicação com a API
│   │   ├── api.ts             ← Instância do Axios com interceptores JWT
│   │   └── offlineQueue.ts    ← Fila IndexedDB para uso offline
│   │
│   ├── hooks/                 ← Custom hooks reutilizáveis
│   │   ├── useAuth.ts         ← login(), logout() com redirecionamento
│   │   └── useOnline.ts       ← Detecta conexão e sincroniza fila offline
│   │
│   ├── types/
│   │   └── index.ts           ← Todos os tipos TypeScript do domínio
│   │
│   └── styles/
│       ├── index.css          ← Importa tudo na ordem certa
│       ├── tailwind.css       ← Configuração do Tailwind v4
│       ├── theme.css          ← Tokens de cor, raio, tipografia
│       └── fonts.css          ← Import da fonte Inter
│
├── prototype/                 ← Protótipo original do Figma Make (não alterar)
├── public/                    ← Arquivos estáticos (favicon, etc.)
├── index.html                 ← HTML raiz
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Arquitetura e decisões técnicas

### Stack principal

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| Framework UI | **React 18** | Ecossistema maduro, equipe familiarizada |
| Build tool | **Vite 6** | Extremamente rápido, HMR instantâneo |
| Linguagem | **TypeScript** (`strict: false`) | Tipos do domínio sem overhead alto. `strict: false` facilita a migração progressiva do protótipo |
| Roteamento | **React Router v7** | API moderna com `createBrowserRouter` |
| Estado global | **Zustand** | Leve, sem boilerplate, fácil de entender |
| Requisições HTTP | **Axios** | Interceptores para JWT + refresh token automático |
| Estilo | **Tailwind CSS v4** | Utilitários diretos, sem CSS customizado por componente |
| Componentes base | **Radix UI** (padrão Shadcn) | Acessíveis, sem estilo forçado |
| Ícones | **Lucide React** | Consistente com o protótipo |
| Gráficos | **Recharts** | Simples e responsivo |
| Mapas | **Leaflet + react-leaflet** | Open source, funciona offline com tiles cacheados |
| Offline | **IndexedDB via `idb`** | Fila de sync para uso sem conexão |

### Como o estado global funciona

O estado fica em `src/store/`. Cada store é um hook independente:

```ts
// Lendo o usuário logado em qualquer componente:
import { useAuthStore } from '@/store'

const usuario = useAuthStore((s) => s.usuario)
```

O `authStore` usa `persist` do Zustand para salvar token e usuário no `localStorage` automaticamente — o usuário não perde a sessão ao fechar a aba.

### Como as requisições funcionam

Toda chamada à API passa pela instância em `src/services/api.ts`:

```ts
import api from '@/services/api'

// Exemplo de uso em qualquer página ou hook
const { data } = await api.get('/pacientes')
```

O que acontece automaticamente:
1. O token JWT é inserido no header `Authorization: Bearer ...`
2. Se a resposta for `401`, o sistema tenta renovar o token com o `refreshToken`
3. Se o refresh também falhar, o usuário é deslogado e redirecionado para o login

---

## 6. Design System

As cores são definidas como variáveis CSS em `src/styles/theme.css` e ficam disponíveis como classes Tailwind:

| Classe Tailwind | Cor | Uso |
|----------------|-----|-----|
| `bg-acs-primary` / `text-acs-primary` | `#0066CC` | Ações principais, botões |
| `bg-acs-success` | `#10B981` | Risco baixo, confirmações |
| `bg-acs-warning` | `#F59E0B` | Risco moderado, avisos |
| `bg-acs-danger` | `#EF4444` | Risco alto, erros, urgências |
| `bg-acs-bg` | `#F6F9FF` | Fundo geral das páginas |
| `border-acs-border` | `#DBEAFE` | Bordas de cards e inputs |

**Classes utilitárias prontas:**

```html
<!-- Card padrão -->
<div class="card-acs p-4"> ... </div>

<!-- Indicadores de risco -->
<div class="risk-high">   Alto risco   </div>
<div class="risk-medium"> Risco moderado </div>
<div class="risk-low">    Baixo risco  </div>
```

**Responsividade:** O layout é mobile-first. Em telas menores que `lg` (1024px) aparece a `BottomNav`; acima disso aparece a `Sidebar`.

---

## 7. Rotas disponíveis

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | `Login` | Tela de login |
| `/dashboard` | `Dashboard` | Painel com resumo e alertas |
| `/pacientes` | `Pacientes` | Lista de pacientes da microárea |
| `/paciente/:id` | `PerfilPaciente` | Histórico e dados do paciente |
| `/novo-paciente` | `NovoPaciente` | Cadastro de novo paciente |
| `/triagem/:pacienteId/passo1` | `TriagemPasso1` | Wizard de triagem — passo 1 |
| `/triagem/:pacienteId/passo2` | `TriagemPasso2` | Wizard de triagem — passo 2 |
| `/triagem/:pacienteId/resultado` | `TriagemResultado` | Resultado da triagem |
| `/agenda` | `Agenda` | Agenda de visitas do dia |
| `/encaminhamentos` | `Encaminhamentos` | Lista de encaminhamentos |
| `/alertas` | `Alertas` | Alertas e notificações |
| `/usuarios` | `Usuarios` | Gestão de usuários (coordenador/gestor) |
| `/novo-usuario` | `NovoUsuario` | Criação de novo usuário |
| `/perfil` | `Perfil` | Perfil e configurações do ACS |

Todas as rotas são declaradas em [src/app/routes.tsx](src/app/routes.tsx).

---

## 8. Fluxo de autenticação

```
Login → POST /api/auth/login
          ↓
     Recebe { token, refreshToken, usuario }
          ↓
     Salva no authStore (persiste no localStorage)
          ↓
     Navega para /dashboard

Toda requisição → Authorization: Bearer <token>

Token expirado (401) → POST /api/auth/refresh { refreshToken }
                           ↓ token novo → repete a requisição original
                           ↓ falha → logout() → navega para /
```

Para usar nos componentes:

```ts
import { useAuth } from '@/hooks'

const { usuario, login, logout } = useAuth()
```

---

## 9. Como adicionar uma nova tela

**Passo 1 — Crie o componente em `src/app/pages/`:**

```tsx
// src/app/pages/MinhaNovaTeIa.tsx
export function MinhaNovaTeIa() {
  return (
    <div className="h-full flex flex-col overflow-y-auto pb-6">
      {/* Header */}
      <div className="bg-white border-b border-acs-border px-6 py-4">
        <h2 className="font-bold text-acs-text">Minha Tela</h2>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 px-6 py-4">
        ...
      </div>
    </div>
  )
}
```

**Passo 2 — Registre a rota em `src/app/routes.tsx`:**

```ts
import { MinhaNovaTela } from './pages/MinhaNovaTela'

// dentro do array de rotas:
{
  path: '/minha-tela',
  element: (
    <ResponsiveLayout>
      <MinhaNovaTela />
    </ResponsiveLayout>
  )
}
```

**Passo 3 (opcional) — Adicione ao menu lateral em `Sidebar.tsx`:**

```ts
{ id: 'minha-tela', label: 'Minha Tela', icon: SomeIcon, path: '/minha-tela' }
```

---

## 10. Modo offline

O app é preparado para funcionar sem conexão. O fluxo é:

1. Usuário faz uma ação (registrar visita, triagem, etc.) **sem internet**
2. A requisição é **salva na fila** do IndexedDB via `enqueue()` em `src/services/offlineQueue.ts`
3. Quando a conexão retorna, o hook `useOnline` detecta e chama `flushQueue()` automaticamente
4. As requisições pendentes são enviadas ao backend em ordem

Para enfileirar uma requisição offline:

```ts
import { enqueue } from '@/services/offlineQueue'

await enqueue({
  method: 'POST',
  url: '/visitas',
  body: dadosDaVisita,
  offlineUuid: crypto.randomUUID(),
})
```

---

## Dúvidas?

Consulte o [SAP.md](../documents/SAP.md) para a arquitetura completa do sistema (banco de dados, API, fases de desenvolvimento).
