# 🌿 Folhagem & Cia — API de Gerenciamento de Plantas

API REST desenvolvida em Node.js e TypeScript para gerenciar o catálogo de plantas, controlar o estoque e registrar vendas da loja fictícia **Folhagem & Cia**.

O projeto foi desenvolvido como desafio técnico para praticar desenvolvimento backend, organização em camadas, integração com banco de dados e criação de endpoints REST.

## 🚀 Tecnologias utilizadas

- **Node.js** — ambiente de execução JavaScript.
- **TypeScript** — tipagem estática.
- **Express** — criação da API REST.
- **Prisma ORM** — comunicação com o banco de dados.
- **PostgreSQL** — banco de dados relacional.
- **Docker** — execução do ambiente de banco de dados.
- **Yarn** — gerenciamento de dependências.

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

## ⚙️ Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/emilly-alexsandra/desafio-dev-citi.git
```

### 2. Acesse a pasta do projeto

```bash
cd desafio-dev-citi
```

### 3. Instale as dependências

```bash
yarn
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto e configure a variável de conexão com o PostgreSQL conforme o ambiente local.

Exemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/folhagem_cia?schema=public"
```

Ajuste usuário, senha, porta e nome do banco de dados de acordo com a configuração do Docker Compose do projeto.

### 5. Inicie o banco de dados

Com o Docker Desktop aberto, execute:

```bash
docker compose up -d
```

### 6. Execute as migrations

```bash
yarn migration
```

### 7. Inicie a aplicação

Utilize o comando de desenvolvimento configurado no projeto:

```bash
yarn dev
```

A API estará disponível em:

```text
http://localhost:3001
```

## 🌱 Modelo de dados

O sistema utiliza o modelo **Planta**, que representa os produtos disponíveis na loja.

Entre os atributos utilizados estão:

- `id`: identificador da planta.
- `nome`: nome da planta.
- `precoEmCentavos`: preço da planta em centavos.
- `quantidadeEmEstoque`: quantidade disponível.
- `luminosidade`: condição de luminosidade necessária.
- `petFriendly`: indica se a planta é segura para ambientes com animais domésticos.

### Tipos de luminosidade

O campo `luminosidade` aceita os seguintes valores:

- `SOMBRA`
- `MEIA_SOMBRA`
- `SOL_PLENO`

## 📌 Endpoints

A API disponibiliza operações para cadastro, consulta, atualização, remoção e venda de plantas.

### 1. Cadastrar uma planta

**POST** `/plantas`

Cadastra uma nova planta no catálogo.

Exemplo de corpo da requisição:

```json
{
  "nome": "Jiboia",
  "precoEmCentavos": 3000,
  "quantidadeEmEstoque": 10,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": false
}
```

### 2. Listar plantas

**GET** `/plantas`

Retorna a lista de plantas cadastradas.

Também permite filtrar os resultados por luminosidade e compatibilidade com animais domésticos.

Exemplos:

```text
GET /plantas?luminosidade=MEIA_SOMBRA
```

```text
GET /plantas?petFriendly=false
```

### 3. Buscar planta por ID

**GET** `/plantas/:id`

Retorna os dados de uma planta específica.

Exemplo:

```text
GET /plantas/1
```

### 4. Atualizar uma planta

**PATCH** `/plantas/:id`

Atualiza os dados de uma planta cadastrada.

Exemplo de corpo da requisição:

```json
{
  "nome": "Jiboia Verde",
  "precoEmCentavos": 3500
}
```

### 5. Remover uma planta

**DELETE** `/plantas/:id`

Remove uma planta do catálogo.

Exemplo:

```text
DELETE /plantas/1
```

### 6. Registrar uma venda

**POST** `/plantas/:id/venda`

Registra a venda de uma determinada quantidade de vasos e atualiza o estoque automaticamente.

Exemplo:

```text
POST /plantas/1/venda
```

Corpo da requisição:

```json
{
  "quantidade": 5
}
```

A operação verifica se existe estoque suficiente antes de efetuar a venda. Caso a quantidade solicitada seja maior que a disponível, a API retorna erro e mantém o estoque inalterado.

### 7. Consultar o valor total do estoque

**GET** `/plantas/estoque/valor-total`

Retorna o valor total do estoque em centavos e a quantidade total de vasos disponíveis.

Exemplo de resposta:

```json
{
  "valorTotalEmCentavos": 15000,
  "totalDeVasos": 5
}
```

## ⚠️ Validações e tratamento de erros

A API realiza validações para manter a consistência dos dados, incluindo:

- Verificação dos campos obrigatórios no cadastro.
- Validação dos valores informados para luminosidade.
- Validação de preços e quantidades.
- Verificação da existência da planta nas operações que exigem um ID.
- Impedimento de vendas com quantidade inválida ou estoque insuficiente.
- Tratamento de erros nas operações com o banco de dados.

### Principais códigos HTTP utilizados

| Código | Significado |
|---|---|
| `200` | Requisição realizada com sucesso. |
| `201` | Recurso criado com sucesso. |
| `204` | Recurso removido com sucesso, sem conteúdo na resposta. |
| `400` | Dados inválidos ou estoque insuficiente. |
| `404` | Planta não encontrada. |
| `500` | Erro interno do servidor. |

## 🧪 Testando a API

As rotas podem ser testadas utilizando ferramentas como:

- [Thunder Client](https://www.thunderclient.com/)
- [Postman](https://www.postman.com/)

Com a aplicação em execução, utilize a URL base:

```text
http://localhost:3001
```

Envie as requisições HTTP de acordo com os endpoints apresentados nesta documentação.

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
│   ├── repositories/
│   │   ├── PlantaRepository.ts
│   │   └── UserRepository.ts
│   ├── database/
│   │   └── index.ts
│   ├── routes.ts
│   └── server.ts
├── .env
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## 🏗️ Organização da aplicação

O projeto segue uma arquitetura em camadas, separando as responsabilidades:

- **Routes:** define os endpoints e direciona as requisições.
- **Controllers:** recebe as requisições HTTP, processa as informações e retorna as respostas.
- **Repositories:** concentra a comunicação e as operações com o banco de dados.
- **Database:** centraliza a conexão com o banco de dados por meio do Prisma.

Essa organização facilita a manutenção, a reutilização de código e a evolução da aplicação.

---

Desenvolvido como parte do desafio técnico do **CITi — Centro Integrado de Tecnologia da Informação**.

**Autora:** Emilly Alexsandra  
**Repositório:** [desafio-dev-citi](https://github.com/emilly-alexsandra/desafio-dev-citi)