
# Spotifake

Um clone full-stack do Spotify, construído com React no frontend e Django (com Django REST Framework) no backend.

## Visão Geral

Este projeto é uma aplicação web completa que simula algumas das funcionalidades básicas do Spotify. Ele é dividido em duas partes principais:

  - **Frontend**: Uma aplicação de página única (SPA) construída com React, responsável por toda a interface do usuário.
  - **Backend**: Uma API RESTful construída com Django, responsável pela lógica de negócio, gerenciamento de usuários, músicas, playlists e banco de dados.

## Pré-requisitos

Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas:

  - [Git](https://git-scm.com/)
  - [Python](https://www.python.org/downloads/) (versão 3.8 ou superior)
  - [Node.js](https://nodejs.org/en/) (que inclui o `npm`)

## Passo a Passo da Configuração (Setup)

Siga estes passos para configurar o ambiente de desenvolvimento pela primeira vez.

### 1\. Clonar o Repositório

Primeiro, clone o projeto do GitHub para a sua máquina local:

```bash
git clone https://github.com/seu-usuario/spotifake.git
cd spotifake
```

### 2\. Configurando o Backend (Django)

O backend precisa de um ambiente Python e algumas dependências para funcionar.

1.  **Navegue até a pasta do backend:**

    ```bash
    cd src/backend/spotifake
    ```

2.  **Crie e ative um Ambiente Virtual (venv):**
    Isso cria um ambiente isolado para as dependências do Python, o que é uma boa prática.

    ```bash
    # Crie o ambiente (só precisa fazer uma vez)
    python3 -m venv venv

    # Ative o ambiente (faça isso sempre que for trabalhar no backend)
    # No Linux/macOS:
    source venv/bin/activate
    # No Windows:
    # venv\Scripts\activate
    ```

    Você saberá que funcionou se vir `(venv)` no início do seu prompt de comando.

3.  **Instale as dependências do Python:**
    Com o ambiente ativado, instale todos os pacotes necessários, incluindo os que causaram erros anteriormente.

    ```bash
    pip install django djangorestframework django-cors-headers Pillow
    ```

4.  **Execute as Migrações do Banco de Dados:**
    Este comando cria todas as tabelas necessárias no banco de dados.

    ```bash
    python3 manage.py migrate
    ```

### 3\. Configurando o Frontend (React)

Agora, em um novo terminal, configure a parte do React.

1.  **Navegue até a pasta do frontend:**

    ```bash
    # A partir da raiz do projeto 'spotifake'
    cd src/frontend
    ```

2.  **Instale as dependências do Node.js:**
    Este comando lerá o `package.json` e instalará todas as bibliotecas necessárias, como React, React Hook Form, etc.

    ```bash
    npm install
    ```

## Como Rodar a Aplicação

Depois que o setup inicial estiver completo, siga estes passos sempre que quiser rodar a aplicação. Você precisará de **dois terminais abertos** simultaneamente.

#### **Terminal 1: Rodar o Backend**

1.  Navegue até a pasta do backend: `cd src/backend/spotifake`
2.  Ative o ambiente virtual: `source venv/bin/activate`
3.  Inicie o servidor Django:
    ```bash
    python3 manage.py runserver
    ```
    O backend estará rodando em `http://localhost:8000`. Deixe este terminal aberto.

#### **Terminal 2: Rodar o Frontend**

1.  Navegue até a pasta do frontend: `cd src/frontend`
2.  Inicie a aplicação React:
    ```bash
    npm start
    ```
    O frontend estará rodando em `http://localhost:3000` e abrirá automaticamente no seu navegador.

## Solução de Problemas Comuns (Troubleshooting)

Se você encontrar erros durante a instalação ou execução, tente o seguinte:

#### **Erro no Frontend: `Failed to compile`, `Module not found` ou `Failed to load plugin 'jsx-a11y'`**

Isso geralmente indica que a pasta `node_modules` está corrompida ou incompleta. A solução é fazer uma reinstalação limpa:

1.  Pare o servidor (`Ctrl + C`).
2.  Na pasta `src/frontend`, apague as dependências antigas:
    ```bash
    rm -rf node_modules package-lock.json
    ```
3.  Limpe o cache do npm (ajuda a evitar usar pacotes corrompidos):
    ```bash
    npm cache clean --force
    ```
4.  Instale tudo novamente:
    ```bash
    npm install
    ```
5.  Tente rodar o projeto de novo: `npm start`.

#### **Erro no Backend: `Cannot use ImageField because Pillow is not installed`**

Isso significa que a biblioteca de manipulação de imagens do Python está faltando.

1.  Certifique-se de que seu ambiente virtual (`venv`) está ativado.
2.  Instale o Pillow:
    ```bash
    pip install Pillow
    ```
3.  Tente executar o comando do Django novamente.
