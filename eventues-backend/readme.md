# Eventues Backend

Sistema de gerenciamento de eventos esportivos construído com Python, AWS Chalice e Firebase.

## Arquitetura

O backend segue uma arquitetura limpa (Clean Architecture) com as seguintes camadas:

### 1. API Layer (`/chalicelib/src/api/`)
- `event_api.py`: Gerenciamento de eventos e ingressos
- `payment_api.py`: Integração com Asaas para pagamentos
- `public_api.py`: Endpoints públicos
- `user_api.py`: Autenticação e gerenciamento de usuários

### 2. Use Cases (`/chalicelib/src/usecases/`)
- Implementa a lógica de negócio
- Coordena interações entre repositories
- Valida regras de negócio

### 3. Repositories (`/chalicelib/src/repositories/`)
- Abstrai acesso ao Firebase
- Gerencia persistência de dados
- Implementa queries e mutations

### 4. Models (`/chalicelib/src/models/`)
- Define as entidades do sistema
- Implementa validações de dados
- Gerencia serialização/deserialização

### 5. Utils (`/chalicelib/src/utils/`)
- `firebase.py`: Configuração e helpers do Firebase
- `formatters.py`: Funções de formatação
- `utils.py`: Utilitários gerais

## Principais Funcionalidades

1. Gestão de Eventos
   - Criação e edição de eventos
   - Upload de arquivos
   - Gerenciamento de ingressos
   - Formulários personalizáveis

2. Pagamentos (Asaas)
   - Cartão de crédito (checkout transparente)
   - PIX
   - Boleto
   - Webhooks para atualização de status

3. Autenticação
   - Firebase Authentication
   - Verificação de tokens
   - Gestão de permissões

## Configuração do Ambiente

1. Crie um ambiente virtual:
```bash
python -m venv venv
.\venv\Scripts\activate.ps1
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Configure as credenciais:
   - Copie `config.example.json` para `.chalice/config.json`
   - Adicione suas credenciais do Firebase
   - Configure as variáveis de ambiente necessárias

4. Rode localmente:
```bash
chalice local
```

## Variáveis de Ambiente

- `FIREBASE_CREDENTIALS_JSON`: Credenciais do Firebase (Service Account)
- `ASAAS_API_KEY`: Chave de API do Asaas
- `ASAAS_API_URL`: URL da API do Asaas (sandbox/produção)

## Integração com Firebase

O sistema utiliza os seguintes serviços do Firebase:
- Authentication: Autenticação de usuários
- Firestore: Banco de dados
- Storage: Armazenamento de arquivos

## Endpoints Principais

### Eventos
- `POST /events`: Criar evento
- `GET /events`: Listar eventos
- `GET /events/{event_id}`: Detalhes do evento
- `PUT /events/{event_id}`: Atualizar evento
- `POST /events/{event_id}/tickets`: Criar ingresso
- `GET /events/{event_id}/tickets`: Listar ingressos

### Pagamentos
- `POST /payments/customer`: Criar cliente
- `POST /payments/card/tokenize`: Tokenizar cartão
- `POST /payments/session`: Criar sessão de pagamento
- `GET /payments/{payment_id}/pix`: Obter QR Code PIX
- `POST /payments/webhook`: Webhook do Asaas

### Usuários
- `POST /users`: Criar usuário
- `GET /users/me`: Perfil do usuário
- `PUT /users/me`: Atualizar perfil

## Segurança

- Credenciais sensíveis não devem ser commitadas
- `.chalice/` está no `.gitignore`
- Tokens JWT são validados em todas as requisições autenticadas
- CORS configurado para origens permitidas

## Deploy

O deploy é feito via AWS Chalice:
```bash
chalice deploy --stage dev
```

## Boas Práticas

1. Mantenha a estrutura de camadas
2. Use tipos estáticos (type hints)
3. Documente novas funcionalidades
4. Siga o padrão de commits
5. Não exponha credenciais