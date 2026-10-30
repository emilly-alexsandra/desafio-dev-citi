# 🌿 Folhagem & Cia — API de Gerenciamento de Plantas

API REST desenvolvida com **Node.js, TypeScript, Express, Prisma e PostgreSQL** para gerenciamento de plantas, controle de estoque e registro de vendas.

O projeto foi desenvolvido como parte do desafio técnico do CITi (Centro Integrado de Tecnologia da Informação) — UFPE.

## 📌 Funcionalidades

- Cadastro de plantas.
- Listagem de plantas.
- Busca de plantas por ID.
- Atualização parcial das informações de plantas.
- Exclusão de plantas.
- Filtragem por luminosidade e característica pet friendly.
- Registro de vendas com atualização automática do estoque.
- Validação da disponibilidade antes da venda.
- Cálculo do valor total do estoque.
- Proteção contra vendas simultâneas que ultrapassem o estoque disponível.

## 🛠️ Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Docker
- Yarn

## 📋 Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- [Node.js](https://nodejs.org/)
- [Yarn](https://classic.yarnpkg.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## ⚙️ Configuração e instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/emilly-alexsandra/desafio-dev-citi.git
cd desafio-dev-citi
```

### 2. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

Exemplo de configuração:

```env
PROJECT_NAME=treinamento-crud
SERVER_PORT=3001

DATABASE_TYPE=postgres
DATABASE_HOST=treinamento-crud-db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha
DATABASE_DB=treinamento-crud

DATABASE_URL=${DATABASE_TYPE}://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}
```

A variável `DATABASE_URL` é utilizada pelo Prisma para estabelecer a conexão com o PostgreSQL e é montada a partir das demais variáveis de ambiente.

**Importante:** o arquivo `.env` contém configurações locais e credenciais de acesso. Ele não deve ser enviado ao repositório.

### 3. Iniciar os containers

Com o Docker Desktop aberto, execute:

```bash
docker compose up -d --build
```

Esse comando constrói a imagem da aplicação e inicia os containers da API e do PostgreSQL.

### 4. Executar as migrations

No terminal do projeto, execute:

```bash
yarn migration
```

Esse comando cria e aplica as migrations do banco de dados em ambiente de desenvolvimento.

Após a inicialização, a API estará disponível em:

`http://localhost:3001`

## 🌱 Modelo de dados — Planta

| Campo | Tipo | Descrição |
|---|---|---|
| id | Int | Identificador único |
| nome | String | Nome da planta |
| especie | String | Espécie da planta |
| preco | Int | Preço em centavos |
| estoque | Int | Quantidade disponível |
| luminosidade | Luminosidade | Necessidade de luz |
| petFriendly | Boolean | Indica se é segura para animais |
| regaACadaDias | Int | Intervalo de rega em dias |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data da última atualização |

### Valores de luminosidade

O campo `luminosidade` aceita os seguintes valores:

- `SOMBRA`
- `MEIA_SOMBRA`
- `SOL_PLENO`

## 🔗 Endpoints

Base URL: `http://localhost:3001`

### 1. Cadastrar planta

**POST** `/plantas`

Exemplo de requisição:

```json
{
  "nome": "Costela-de-Adão",
  "especie": "Monstera deliciosa",
  "preco": 5000,
  "estoque": 10,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": false,
  "regaACadaDias": 7
}
```

Todos os campos são obrigatórios no cadastro.

### 2. Listar plantas

**GET** `/plantas`

Retorna a lista de plantas cadastradas.

Também permite filtrar por luminosidade e característica pet friendly.

Exemplos:

```http
GET /plantas?luminosidade=MEIA_SOMBRA
```

```http
GET /plantas?petFriendly=false
```

### 3. Buscar planta por ID

**GET** `/plantas/:id`

Exemplo:

```http
GET /plantas/1
```

### 4. Atualizar planta

**PATCH** `/plantas/:id`

Permite atualizar parcialmente os dados de uma planta.

Exemplo de requisição:

```json
{
  "preco": 6000,
  "estoque": 15
}
```

### 5. Excluir planta

**DELETE** `/plantas/:id`

Exemplo:

```http
DELETE /plantas/1
```

### 6. Registrar venda

**POST** `/plantas/:id/venda`

Exemplo de requisição:

```json
{
  "quantidade": 2
}
```

A venda verifica a disponibilidade em estoque e atualiza a quantidade automaticamente.

Em caso de venda realizada, a resposta informa a planta atualizada e a quantidade vendida.

Caso o estoque seja insuficiente, a API retorna HTTP 400.

### 7. Consultar valor total do estoque

**GET** `/plantas/estoque/valor-total`

Retorna o valor financeiro total do estoque e a quantidade total de vasos disponíveis.

Exemplo de resposta:

```json
{
  "valorTotalEmCentavos": 50000,
  "totalDeVasos": 10
}
```

O valor total é calculado pela soma do preço de cada planta multiplicado pela respectiva quantidade em estoque.

## ⚠️ Validações e tratamento de erros

A API realiza validações para garantir a integridade dos dados:

- Todos os campos são obrigatórios no cadastro.
- O preço deve ser maior que zero.
- O estoque não pode ser negativo.
- O intervalo de rega deve ser maior ou igual a um dia.
- A luminosidade deve corresponder a um dos valores definidos no enum.
- A quantidade de uma venda deve ser um número inteiro positivo.
- Não é permitido vender uma quantidade superior ao estoque disponível.
- IDs inexistentes são tratados pela API.

### Principais códigos HTTP

| Código | Significado |
|---|---|
| 200 | Operação realizada com sucesso |
| 201 | Recurso criado com sucesso |
| 400 | Dados inválidos ou estoque insuficiente |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

## 🔒 Controle de concorrência

O registro de vendas utiliza uma operação atômica de atualização do estoque com Prisma.

A atualização ocorre somente quando a quantidade disponível é suficiente para atender à venda.

Essa abordagem evita que requisições simultâneas vendam mais unidades do que existem em estoque.

### Teste de concorrência realizado

Considerando uma planta com estoque inicial de 5 unidades, foram disparadas simultaneamente duas requisições de venda de 4 unidades cada.

Resultado validado:

- Primeira venda: HTTP 200.
- Segunda venda: HTTP 400 — estoque insuficiente.
- Estoque final: 1 unidade.

## 📁 Estrutura do projeto

```text
desafio-dev-citi/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── controllers/
│   │   ├── PlantaController.ts
│   │   └── UserController.ts
│   │
│   ├── database/
│   │   └── index.ts
│   │
│   ├── repositories/
│   │   ├── PlantaRepository.ts
│   │   └── UserRepository.ts
│   │
│   ├── routes.ts
│   └── server.ts
│
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `yarn dev` | Inicia o ambiente de desenvolvimento |
| `yarn generate` | Gera o Prisma Client |
| `yarn migration` | Executa migrations em desenvolvimento |
| `yarn migration:deploy` | Aplica migrations existentes |
| `yarn studio` | Abre o Prisma Studio |
| `yarn typecheck` | Verifica os tipos do TypeScript |
| `yarn build` | Compila a aplicação |
| `yarn start` | Inicia a aplicação compilada |

No Windows PowerShell, os comandos Yarn podem ser executados com o prefixo `yarn.cmd`.

## 👩‍💻 Autoria

Desenvolvido por **Emilly Alexsandra** como parte do desafio técnico do CITi — UFPE.