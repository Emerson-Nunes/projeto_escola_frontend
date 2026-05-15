# Sistema Escolar — Frontend

Interface web para gestão escolar, construída com Vite + React + TypeScript + TailwindCSS.

## Requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
cd frontend
npm install
```

## Configuração

Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

Edite `.env` e defina a URL da API:

```
VITE_API_URL=http://localhost:3000/api
```

## Execução em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`

## Build para produção

```bash
npm run build
```

Os arquivos gerados ficam em `dist/`.

## Estrutura de pastas

```
src/
├── types/           # Interfaces TypeScript
├── services/        # Chamadas à API (axios)
├── stores/          # Estado global (Zustand)
├── hooks/           # Custom hooks (TanStack Query)
├── utils/           # Funções utilitárias
├── contexts/        # React Contexts (Tema)
├── lib/             # Configurações (QueryClient, Axios)
├── components/
│   ├── ui/          # Componentes base reutilizáveis
│   ├── layout/      # Sidebar, Navbar
│   ├── tables/      # Tabelas reutilizáveis
│   └── charts/      # Gráficos (Recharts)
├── layouts/         # AppLayout, AuthLayout
├── routes/          # Configuração de rotas
└── pages/           # Páginas por módulo
    ├── auth/
    ├── dashboard/
    ├── students/
    ├── teachers/
    ├── guardians/
    ├── classrooms/
    ├── subjects/
    ├── grades/
    ├── attendance/
    └── reports/
```

## Funcionalidades

- **Autenticação** com JWT, roles (ADMIN, PROFESSOR, ALUNO, RESPONSAVEL)
- **Dashboard** diferenciado por role com gráficos Recharts
- **CRUD completo** de Alunos, Professores, Responsáveis, Turmas, Disciplinas
- **Lançamento de notas** em lote por turma/disciplina/bimestre
- **Boletim escolar** com médias e status coloridos
- **Chamada diária** com justificativa de faltas
- **Relatórios** exportáveis em PDF e XLSX
- **Tema claro/escuro** persistido no localStorage
- **Responsivo** com sidebar colapsável em mobile

## Tecnologias

| Pacote | Uso |
|--------|-----|
| Vite + React 18 + TypeScript | Base |
| TailwindCSS | Estilos |
| React Router DOM v6 | Roteamento |
| TanStack Query v5 | Server state |
| Zustand | Client state |
| Axios | HTTP client |
| React Hook Form + Zod | Formulários |
| Radix UI | Componentes acessíveis |
| Recharts | Gráficos |
| Lucide React | Ícones |
| class-variance-authority | Variantes de componentes |
