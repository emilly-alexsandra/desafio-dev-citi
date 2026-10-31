# 🌿 Folhagem & Cia — API de Gerenciamento de Plantas

API REST desenvolvida em **Node.js, TypeScript, Express, Prisma e PostgreSQL** para gerenciar plantas, controlar o estoque e registrar vendas. Substitui a planilha da loja, evitando situações como vender uma planta que já não existe no estoque.

Projeto desenvolvido como parte do desafio técnico do CITi — Centro Integrado de Tecnologia da Informação.

## 🚀 Funcionalidades

- CRUD completo de plantas.
- Listagem com filtros opcionais por luminosidade e compatibilidade com pets, sozinhos ou combinados.
- Validação dos dados enviados (cadastro, edição, filtros e venda).
- Registro de vendas com atualização automática do estoque.
- Proteção contra estoque negativo e vendas simultâneas.
- Cálculo do valor total do estoque e da quantidade total de vasos.

## 🛠️ Tecnologias

Node.js 20+, TypeScript, Express, Prisma ORM, PostgreSQL, Docker e Docker Compose, Yarn.

## 📋 Pré-requisitos

- Git
- Node.js 20 ou superior
- Yarn
- Docker Desktop (aberto e pronto antes de subir os containers)
- Um cliente HTTP (Insomnia, Postman ou Thunder Client)

## ⚙️ Como rodar do zero

**1. Clone o repositório**

```bash
git clone https://github.com/emilly-alexsandra/desafio-dev-citi.git
cd desafio-dev-citi
```

**2. Crie o `.env` a partir do exemplo**

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Os valores do `.env.example` já funcionam para rodar com Docker. O `.env` não é enviado ao repositório.

**3. Instale as dependências**

```bash
yarn
```

**4. Suba os containers (API e PostgreSQL)**

```bash
docker compose up -d --build
```

**5. Aplique as migrations já versionadas**

```bash
yarn migration:deploy
```

Esse comando aplica as migrations existentes no banco de dados, sem criar uma nova. A migration da entidade `Planta` já está versionada em `prisma/migrations`.

**6. Acesse a API**

```text
http://localhost:3001
```

Para acompanhar os logs dos containers:

```bash
docker compose logs -f server
```

Para visualizar e gerenciar os dados do banco com o Prisma Studio:

```bash
yarn studio
```

## 🌱 Modelo de dados — Planta

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int (autoincrement) | Identificador, gerado pelo banco |
| `nome` | String | Nome popular (ex.: "Costela-de-adão") |
| `especie` | String | Nome científico (ex.: "Monstera deliciosa") |
| `preco` | Int | Preço em **centavos** (`8990` = R$ 89,90) |
| `estoque` | Int | Vasos disponíveis |
| `luminosidade` | Enum `Luminosidade` | Necessidade de luz |
| `petFriendly` | Boolean | Segura para cães e gatos? |
| `regaACadaDias` | Int | Intervalo de rega, em dias |
| `createdAt` | DateTime | Preenchido automaticamente |
| `updatedAt` | DateTime | Atualizado automaticamente |

Valores aceitos para `luminosidade`: `SOMBRA`, `MEIA_SOMBRA` e `SOL_PLENO`.

O preço é guardado em centavos (inteiro) para evitar erros de arredondamento de decimais.

## 📡 Rotas

Base URL: `http://localhost:3001`

Em todos os erros, a API responde com o status HTTP adequado e uma mensagem em JSON.

### 1. Cadastrar planta — `POST /plantas`

Todos os campos são obrigatórios.

Requisição:

```json
{
  "nome": "Jiboia",
  "especie": "Epipremnum aureum",
  "preco": 3000,
  "estoque": 10,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": false,
  "regaACadaDias": 7
}
```

Resposta `201 Created`:

```json
{
  "id": 1,
  "nome": "Jiboia",
  "especie": "Epipremnum aureum",
  "preco": 3000,
  "estoque": 10,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": false,
  "regaACadaDias": 7,
  "createdAt": "2026-10-30T12:00:00.000Z",
  "updatedAt": "2026-10-30T12:00:00.000Z"
}
```

Erros:

- `400`: campo ausente, corpo vazio ou com valor inválido (ex.: `preco` igual a 0, `estoque` negativo, `preco` como texto, `luminosidade` fora do enum).
- `500`: erro interno inesperado.

### 2. Listar plantas — `GET /plantas`

Filtros opcionais, sozinhos ou combinados:

```text
GET /plantas?luminosidade=MEIA_SOMBRA
GET /plantas?petFriendly=false
GET /plantas?luminosidade=MEIA_SOMBRA&petFriendly=false
```

Resposta `200 OK`:

```json
[
  {
    "id": 1,
    "nome": "Jiboia",
    "especie": "Epipremnum aureum",
    "preco": 3000,
    "estoque": 10,
    "luminosidade": "MEIA_SOMBRA",
    "petFriendly": false,
    "regaACadaDias": 7,
    "createdAt": "2026-10-30T12:00:00.000Z",
    "updatedAt": "2026-10-30T12:00:00.000Z"
  }
]
```

Um filtro válido sem resultados retorna `200` com `[]` (nunca `404`).

Erros:

- `400`: filtro com valor inválido (ex.: `?luminosidade=LUA` ou `?petFriendly=talvez`).
- `500`: erro interno inesperado.

### 3. Buscar planta por ID — `GET /plantas/:id`

Resposta `200 OK`: o objeto da planta, no mesmo formato do cadastro.

Erros:

- `400`: id inválido (ex.: `/plantas/abc`).
- `404`: não existe planta com esse id.
- `500`: erro interno inesperado.

### 4. Atualizar planta — `PATCH /plantas/:id`

Altera somente os campos enviados. Os campos enviados passam pelas mesmas regras do cadastro. Campos que não fazem parte da planta são ignorados.

Requisição:

```json
{
  "preco": 3500,
  "estoque": 15
}
```

Resposta `200 OK`: a planta atualizada, com os demais campos inalterados.

```json
{
  "id": 1,
  "nome": "Jiboia",
  "especie": "Epipremnum aureum",
  "preco": 3500,
  "estoque": 15,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": false,
  "regaACadaDias": 7,
  "createdAt": "2026-10-30T12:00:00.000Z",
  "updatedAt": "2026-10-30T12:30:00.000Z"
}
```

Erros:

- `400`: id inválido, corpo vazio ou sem nenhum campo válido, ou valor inválido.
- `404`: não existe planta com esse id.
- `500`: erro interno inesperado.

### 5. Excluir planta — `DELETE /plantas/:id`

Resposta `204 No Content`, sem corpo.

Erros:

- `400`: id inválido.
- `404`: não existe planta com esse id (inclusive ao excluir a mesma planta duas vezes).
- `500`: erro interno inesperado.

### 6. Registrar venda — `POST /plantas/:id/venda`

Requisição:

```json
{
  "quantidade": 2
}
```

Resposta `200 OK`: a planta atualizada, já com o estoque após a venda (exemplo com estoque inicial de 10):

```json
{
  "id": 1,
  "nome": "Jiboia",
  "especie": "Epipremnum aureum",
  "preco": 3000,
  "estoque": 8,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": false,
  "regaACadaDias": 7,
  "createdAt": "2026-10-30T12:00:00.000Z",
  "updatedAt": "2026-10-30T12:45:00.000Z"
}
```

Erros:

- `400`: id inválido, corpo vazio, `quantidade` que não seja inteiro maior que zero (ex.: `0`, `-1`, `1.5`, `"2"`) ou estoque insuficiente. Nesse último caso, nada é alterado.
- `404`: não existe planta com esse id.
- `500`: erro interno inesperado.

Exemplo de resposta `400 Bad Request` quando o estoque é insuficiente:

```json
{
  "message": "Estoque insuficiente.",
  "estoqueDisponivel": 1
}
```

O campo `estoqueDisponivel` informa quantas unidades ainda estão disponíveis no momento da tentativa de venda.

### 7. Valor total do estoque — `GET /plantas/estoque/valor-total`

Soma `preco × estoque` de todas as plantas e o total de vasos.

Resposta `200 OK`:

```json
{
  "valorTotalEmCentavos": 24000,
  "totalDeVasos": 8
}
```

Com a loja vazia, a resposta é `200` com os valores zerados:

```json
{
  "valorTotalEmCentavos": 0,
  "totalDeVasos": 0
}
```

Erros:

- `500`: erro interno inesperado.

## ⚠️ Validações

| Campo ou operação | Regra |
|---|---|
| `nome`, `especie` | Texto não vazio |
| `preco` | Inteiro maior que zero |
| `estoque` | Inteiro maior ou igual a zero (zero é válido) |
| `luminosidade` | Um dos valores do enum |
| `petFriendly` | Booleano (`false` é válido) |
| `regaACadaDias` | Inteiro maior ou igual a 1 |
| `quantidade` da venda | Inteiro maior que zero |
| `:id` da rota | Inteiro maior que zero |

No cadastro, todos os campos são obrigatórios. Na edição, nenhum é, mas os enviados seguem as mesmas regras. Os tipos são conferidos explicitamente: `"preco": "8990"` (texto) é recusado.

Requisições sem corpo nos endpoints de cadastro, edição e venda são tratadas como dados inválidos, retornando `400 Bad Request`.

### Códigos HTTP

| Código | Quando |
|---|---|
| `200` | Sucesso em consulta, edição, venda e valor total |
| `201` | Planta cadastrada |
| `204` | Planta excluída |
| `400` | Dados inválidos, id inválido, filtro inválido ou estoque insuficiente |
| `404` | Id válido, mas planta inexistente |
| `500` | Erro interno inesperado |

## 🔒 Decisões técnicas

### Vendas simultâneas

Se duas pessoas comprarem o último vaso ao mesmo tempo, apenas uma venda pode ser concluída. Para garantir isso, a venda usa uma **atualização condicional dentro de uma transação do Prisma** (`updateMany`): o decremento só acontece se, no momento da atualização, o estoque ainda for maior ou igual à quantidade pedida. Assim, a verificação e a alteração acontecem juntas no banco, sem janela para duas requisições lerem o mesmo estoque.

Teste realizado: planta com 5 unidades e duas vendas de 4 unidades disparadas ao mesmo tempo. Resultado: uma retornou `200`, a outra `400` (estoque insuficiente), e o estoque final ficou em 1 unidade.

### Organização em camadas

- `routes.ts`: liga cada URL ao controller.
- Controllers: leem a requisição, validam, aplicam as regras e escolhem o status.
- Repositories: única camada que conversa com o Prisma.

### IDs

Um id mal formado (`abc`) retorna `400`. Um id válido que não existe retorna `404`.

## 🧪 Testes realizados

Testes manuais com cliente HTTP, cobrindo:

- Cadastro válido, inclusive com `estoque: 0` e `petFriendly: false`.
- Cadastro com campo ausente, `preco: 0`, `estoque: -1`, `preco` como texto e `luminosidade` inválida.
- Busca por id existente, inexistente e inválido.
- Edição só do preço, com valor inválido e com id inexistente.
- Filtros por luminosidade, por `petFriendly`, pelos dois e filtro inválido.
- Venda com estoque suficiente, com estoque insuficiente (estoque inalterado) e com `quantidade: 0`.
- Valor total do estoque, conferido manualmente.
- Exclusão, nova busca e nova exclusão da mesma planta.
- Duas vendas simultâneas (descrito acima).

A verificação de tipos também foi executada:

```bash
yarn typecheck
```

## 📁 Estrutura do projeto

```text
desafio-dev-citi/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   ├── PlantaController.ts
│   │   └── UserController.ts
│   ├── database/
│   │   └── index.ts
│   ├── repositories/
│   │   ├── PlantaRepository.ts
│   │   └── UserRepository.ts
│   ├── routes.ts
│   └── server.ts
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

(Arquivos de configuração menores, como `.dockerignore` e `.swcrc`, foram omitidos.)

## 🧰 Scripts

| Comando | Descrição |
|---|---|
| `yarn migration` | Cria e aplica migrations em desenvolvimento |
| `yarn migration:deploy` | Aplica migrations existentes |
| `yarn generate` | Gera o Prisma Client |
| `yarn studio` | Abre o Prisma Studio |
| `yarn typecheck` | Verifica os tipos do TypeScript |
| `yarn build` | Compila a aplicação |
| `yarn start` | Inicia a aplicação compilada |

No Windows PowerShell, os comandos Yarn também podem ser executados com `yarn.cmd`.

## 🎯 Bônus

**Nenhum bônus foi implementado.** Priorizei concluir e testar todos os requisitos obrigatórios. Ficaram de fora:

- Busca por nome sem diferenciar maiúsculas e minúsculas (`?nome=`).
- Ordenação (`?ordem=preco` ou `?ordem=nome`).
- Rota `GET /plantas/esgotadas`.
- Script de seed com plantas de exemplo.

## 👩‍💻 Autoria

Desenvolvido por **Emilly Alexsandra**.