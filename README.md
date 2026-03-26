# ACS-Expert

> Sistema de apoio aos Agentes Comunitários de Saúde (ACS) do SUS.
> Triagem domiciliar baseada em evidências, gestão de visitas e encaminhamentos.

---

## Estrutura do repositório

```
ACS-Expert/
├── backend/        ← API Node.js + Express + MySQL
├── frontend/       ← Interface React + Vite + Tailwind CSS
├── legacy/         ← Protótipo original em HTML/CSS/JS (referência)
└── package.json    ← Scripts para rodar os dois juntos
```

---

## Início rápido

### Pré-requisitos

| Ferramenta | Versão |
|------------|--------|
| Node.js    | **20+** |
| npm        | 8+ |
| MySQL      | 8+ (ou XAMPP) |

### 1. Instale as dependências

```bash
# Na raiz do projeto — instala backend e frontend de uma vez
npm run install:all
```

Ou separadamente:

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure o banco de dados

```bash
# Crie o banco no MySQL
mysql -u root -p -e "CREATE DATABASE acsexpert;"
```

Depois importe o schema (consulte `legacy/` ou o SAP para o DDL completo).

### 3. Configure as variáveis de ambiente do backend

```bash
cp backend/.env.example backend/.env
# Edite backend/.env com seus dados de acesso ao MySQL
```

### 4. Rode o projeto

```bash
# Sobe backend (porta 3000) + frontend (porta 5173) juntos
npm run dev
```

Ou separadamente em terminais diferentes:

```bash
npm run backend    # API em http://localhost:3000
npm run frontend   # Interface em http://localhost:5173
```

O frontend já está configurado para redirecionar chamadas `/api/*` para o backend automaticamente — não é necessário nenhuma configuração adicional.

---

## Backend

Localizado em `backend/`. Stack atual:

- **Express 5** — servidor HTTP
- **mysql2** — conexão com MySQL
- **bcrypt** — hash de senhas
- **jsonwebtoken** — autenticação JWT
- **cors** — liberação de origens cruzadas

Endpoints disponíveis:

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/register` | Cria novo usuário |
| `POST` | `/login` | Autenticação, retorna JWT |

Para mais detalhes, consulte [backend/server.js](backend/server.js).

---

## Frontend

Localizado em `frontend/`. Stack:

- **React 18** + **TypeScript**
- **Vite 6** — build e dev server
- **Tailwind CSS v4** — estilização
- **Zustand** — estado global
- **Axios** — chamadas HTTP com interceptores JWT automáticos

Documentação completa em [frontend/README.md](frontend/README.md).

---

## Legacy

A pasta `legacy/` contém o protótipo original em HTML/CSS/JavaScript puro.
Serve apenas como **referência histórica** — o desenvolvimento segue no `frontend/`.

---

## Documentação técnica

O documento de arquitetura completo (SAP) com modelagem do banco de dados, endpoints da API e plano de desenvolvimento está disponível no repositório do projeto original.
