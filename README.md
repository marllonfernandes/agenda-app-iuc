# Agenda App

Uma aplicação de agenda multi-tenant e serverless, projetada para ser executada no Google Cloud Platform (GCP).

## 🚀 Tecnologias

- **Backend:** Node.js, Express, Firebase Admin SDK
- **Frontend:** Vue.js 3, Vite, PrimeVue, Tailwind CSS
- **Banco de Dados:** Google Cloud Firestore
- **Infraestrutura:** Google Cloud Run, Google Cloud Storage

## 🛠️ Pré-requisitos

Antes de começar, você precisará ter instalado:
- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [npm](https://www.npmjs.com/)
- [Google Cloud SDK](https://cloud.google.com/sdk)

## 📦 Instalação

Antes de rodar a aplicação localmente, certifique-se de que o seu `gcloud` está configurado para a conta e projeto corretos (onde o banco de dados está hospedado):

```bash
gcloud config set account seu-email@exemplo.com
gcloud config set project lab-resources
```

Em seguida, instale as dependências para o backend e o frontend:

```bash
# Instalando dependências do Backend
cd backend && npm install

# Voltando para a raiz e instalando dependências do Frontend
cd ../frontend && npm install
```

## 🔐 Credenciais de Admin

Para o primeiro acesso ao sistema (Global Admin), utilize as seguintes credenciais padrão:

- **E-mail:** `admin@exemplo.com`
- **Senha:** `admin123`

> [!IMPORTANT]
> O usuário admin é criado automaticamente na primeira execução do backend.

## 💻 Desenvolvimento Local

Você pode rodar o backend e o frontend separadamente para desenvolvimento.

### Backend

Para iniciar o servidor backend em modo de desenvolvimento (porta 8080):

```bash
cd backend
npm run dev
```

### Frontend

Para iniciar o servidor de desenvolvimento do frontend (porta 3000):

```bash
cd frontend
npm run dev
```

**Nota:** O frontend está configurado para se comunicar com o backend na porta 8080.

## 📖 Documentação da API (Swagger)

A API possui documentação interativa via Swagger. Para acessá-la:

1. Inicie o backend localmente.
2. Acesse no navegador: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

Lá você encontrará a lista de endpoints, parâmetros e poderá realizar testes diretamente na interface.

## 🏗️ Estrutura do Projeto

- `/backend`: Servidor Express e integração com Firestore.
- `/frontend`: Aplicação Vue.js com Vite e PrimeVue.
- `/docs`: Documentação adicional.

## 🚢 Deployment no GCP

Siga os passos abaixo para configurar e implantar a aplicação diretamente usando a CLI do Google Cloud.

### 1. Configuração Inicial do Projeto

Ative as APIs necessárias e crie o bucket para ativos (assets):

```bash
# Ativar APIs do Cloud Run e Firestore
gcloud services enable run.googleapis.com firestore.googleapis.com

# Criar bucket no Google Cloud Storage (substitua [BUCKET_NAME])
gsutil mb gs://[BUCKET_NAME]
```

### 2. Preparação dos Arquivos (Build)

O backend serve o frontend como arquivos estáticos. É necessário gerar o build do frontend e movê-lo para a pasta `public` do backend:

```bash
# Gerar build do frontend
cd frontend
npm run build

# Limpar e preparar a pasta pública do backend
cd ../backend
rm -rf public
mkdir -p public

# Copiar arquivos do build para o backend
cp -r ../frontend/dist/* public/
```

### 3. Deploy no Cloud Run

Execute o deploy do serviço a partir do diretório do backend:

```bash
# Configurar o projeto ativo (substitua [PROJECT_ID])
gcloud config set project [PROJECT_ID]

# Realizar o deploy (substitua [SERVICE_NAME] e [REGION])
gcloud run deploy [SERVICE_NAME] \
    --source . \
    --region [REGION] \
    --allow-unauthenticated \
    --set-env-vars GOOGLE_CLOUD_PROJECT=[PROJECT_ID]
```
