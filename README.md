# Gerenciador de Projetos

Aplicação Nuxt 4 para cadastrar, editar, favoritar, buscar e ordenar projetos. O browser fala apenas com o BFF Nitro do próprio projeto. Os dados ficam no Neon Postgres e as capas no Vercel Blob.

A coleção é **pública e compartilhada**: qualquer visitante pode criar, editar, favoritar e remover projetos. Isso atende ao desafio, mas não é adequado para dados reais sem autenticação.

## Requisitos

- Node.js 24 (`>=24.11.0 <25`)
- npm
- Conta gratuita na [Vercel](https://vercel.com) (Hobby)
- Banco [Neon Postgres](https://neon.com) no plano Free
- Store [Vercel Blob](https://vercel.com/docs/vercel-blob) no plano Hobby

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
npm run preview
npm run db:generate
npm run db:migrate
```

Use `npm run build` (`nuxt build`). Não use `nuxt generate`: o BFF precisa de runtime server-side.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
```

Ambas são **somente servidor**. Não as exponha em `runtimeConfig.public` nem com prefixo `NUXT_PUBLIC_`.

## Persistência

1. Crie um projeto Neon (plano Free) e copie a connection string.
2. Crie um Blob store na Vercel e copie o token de leitura/escrita.
3. Aplique a migration **uma vez**, fora do cold start das Functions:

```bash
npm run db:migrate
```

O banco começa vazio. Não há seed automático. Para desenvolvimento, crie projetos pela interface.

## Desenvolvimento

Com Node 24 e o `.env` preenchido:

```bash
npm install
npm run db:migrate
npm run dev
```

A aplicação sobe em `http://localhost:3000`.

## Deploy na Vercel

O Hobby é suficiente para este desafio. Não é necessário `vercel.json` nem `nitro.preset`.

1. Publique o repositório e importe o projeto na Vercel.
2. Confirme o Framework Preset **Nuxt.js**.
3. Defina Node.js **24.x**.
4. Build Command: `npm run build`.
5. Conecte Neon (plano Free) e Vercel Blob.
6. Cadastre `DATABASE_URL` e `BLOB_READ_WRITE_TOKEN` em Production, Preview e Development.
7. Rode `npm run db:migrate` contra o banco de produção **antes** do primeiro deploy útil.
8. Prefira um banco de preview isolado para não apagar dados de produção nos testes.

Limites relevantes do free tier:

- Vercel Hobby: Nuxt empacota as rotas Nitro em poucas Functions.
- Neon Free: 0,5 GB de storage e 100 CU-hours/mês. O banco pode hibernar após inatividade.
- Vercel Blob Hobby: 1 GB de storage. Capas JPG/PNG de até 4 MB.

Se o free tier estourar, o serviço pode pausar até o próximo ciclo. O Hobby não vende overage.

## Qualidade

Uma funcionalidade só está pronta quando a UI corresponde às referências, o fluxo persiste de verdade, o BFF valida no servidor e `lint`, `typecheck`, `test` e `build` passam.

## Assets

O logo atual é um SVG local até os arquivos originais serem fornecidos. Coloque-os em `public/assets/` e atualize `AppLogo` quando estiverem disponíveis.
