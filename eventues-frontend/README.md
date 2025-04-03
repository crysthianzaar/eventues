# Eventues Frontend

Interface web moderna para o sistema de gerenciamento de eventos esportivos Eventues, construída com Next.js 14, React e TypeScript.

## Arquitetura

O frontend segue uma arquitetura baseada em App Router do Next.js 14 com as seguintes estruturas:

### 1. Páginas (`/app`)
- `/`: Homepage com listagem de eventos
- `/criar_evento`: Criação de eventos
- `/meus_eventos`: Gerenciamento de eventos
- `/e/[slug]`: Detalhes do evento público
- `/i/[ticket_id]`: Detalhes do ingresso
- `/login`: Autenticação
- `/minha_conta`: Perfil do usuário
- `/seja_organizador`: Página para organizadores

### 2. Componentes (`/app/components`)
- `Navbar.tsx`: Navegação principal
- `Events.tsx`: Lista de eventos
- `FormCard.tsx`: Cartão de formulário
- `FormEditor.tsx`: Editor de formulários
- `Hero.tsx`: Seção principal
- `Footer.tsx`: Rodapé
- `ProtectedRoute.tsx`: Proteção de rotas

### 3. APIs (`/app/apis`)
- `api.ts`: Cliente HTTP para backend
- Endpoints para eventos, pagamentos e usuários
- Tipagem forte com TypeScript

### 4. Hooks (`/app/hooks`)
- `useAuth.ts`: Autenticação Firebase
- `useAuthCallback.ts`: Callback de autenticação

### 5. Utils (`/app/utils`)
- `formatters.ts`: Formatação de dados
- `localStorage.ts`: Gerenciamento de storage
- `date.ts`: Manipulação de datas

## Principais Funcionalidades

1. Gestão de Eventos
   - Criação e edição
   - Upload de imagens
   - Formulários personalizáveis
   - Gestão de ingressos

2. Área do Usuário
   - Autenticação Firebase
   - Perfil personalizado
   - Histórico de eventos
   - Dashboard do organizador

3. Checkout
   - Integração Asaas
   - Múltiplas formas de pagamento
   - Confirmação em tempo real
   - Geração de ingressos

## Exemplos de Componentes

### 1. FormCard - Formulário Dinâmico
```tsx
import { FormCard } from '@/components/FormCard';

// Campos customizados do formulário
const customFields = [
  {
    id: 'team',
    label: 'Equipe',
    type: 'text',
    required: true
  },
  {
    id: 'shirtSize',
    label: 'Tamanho da Camiseta',
    type: 'select',
    options: ['P', 'M', 'G', 'GG'],
    required: true
  }
];

// Componente de inscrição
export default function RegistrationPage() {
  const handleSubmit = async (data: FormData) => {
    try {
      await api.submitRegistration(data);
      // Sucesso
    } catch (error) {
      // Tratamento de erro
    }
  };

  return (
    <FormCard
      eventId="123"
      onSubmit={handleSubmit}
      customFields={customFields}
    />
  );
}
```

### 2. Events - Lista de Eventos
```tsx
import { Events } from '@/components/Events';

// Página principal
export default function HomePage() {
  return (
    <main>
      <h1>Eventos Disponíveis</h1>
      <Events />
    </main>
  );
}
```

### 3. ProtectedRoute - Rota Protegida
```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Página que requer autenticação
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### 4. Hooks Personalizados

#### useAuth
```tsx
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { 
    signInWithGoogle, 
    signInWithEmail,
    authError,
    signingIn 
  } = useAuth();

  return (
    <div>
      <button 
        onClick={signInWithGoogle}
        disabled={signingIn}
      >
        {signingIn ? 'Entrando...' : 'Entrar com Google'}
      </button>
      {authError && <p>{authError}</p>}
    </div>
  );
}
```

### 5. API Client
```tsx
import { api } from '@/apis/api';

// Exemplo de uso do cliente HTTP tipado
async function fetchEventDetails(slug: string) {
  try {
    const event = await api.getEventBySlug(slug);
    return event;
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    throw error;
  }
}
```

### 6. Gerenciamento de Estado
```tsx
// Exemplo com React Query
import { useQuery, useMutation } from '@tanstack/react-query';

function EventsManager() {
  // Buscar eventos
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: api.getAllEvents
  });

  // Mutação para criar evento
  const { mutate: createEvent } = useMutation({
    mutationFn: api.createEvent,
    onSuccess: () => {
      // Invalidar cache e atualizar lista
    }
  });

  if (isLoading) return <LoadingOverlay />;

  return (
    <div>
      {events?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

### 7. Formulários com Validação
```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  date: z.date().min(new Date(), 'Data deve ser futura'),
  price: z.number().min(0, 'Preço inválido')
});

function EventForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(eventSchema)
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* ... outros campos ... */}
    </form>
  );
}
```

## Configuração do Ambiente

1. Instale as dependências:
```bash
npm install
# ou
yarn install
```

2. Configure as variáveis de ambiente:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_BACKEND_API_URL=
```

3. Rode localmente:
```bash
npm run dev
# ou
yarn dev
```

## Integração com Firebase

O sistema utiliza os seguintes serviços do Firebase:
- Authentication: Login social e email/senha
- Storage: Upload de imagens
- Analytics: Análise de uso

## Rotas da API

### Eventos
- `GET /api/events`: Lista eventos
- `GET /api/events/[slug]`: Detalhes do evento
- `POST /api/events`: Cria evento
- `PUT /api/events/[id]`: Atualiza evento

### Pagamentos
- `POST /api/create_payment_session`: Inicia checkout
- `GET /api/orders/[id]`: Status do pedido
- `POST /api/webhooks/asaas`: Webhook Asaas

### Usuários
- `GET /api/me`: Perfil do usuário
- `PUT /api/me`: Atualiza perfil

## UI/UX

1. Design System
   - Cores institucionais
   - Tipografia consistente
   - Componentes reutilizáveis
   - Responsividade

2. Performance
   - Server Components
   - Image Optimization
   - Dynamic Imports
   - Route Prefetching

3. SEO
   - Meta tags dinâmicas
   - OpenGraph
   - JSON-LD
   - Sitemap.xml

## Deploy

Deploy automático via Vercel:
```bash
vercel
```

## Boas Práticas

1. Código
   - TypeScript strict mode
   - ESLint + Prettier
   - Conventional Commits
   - Testes unitários

2. Performance
   - Lazy loading
   - Caching
   - Bundle optimization
   - API rate limiting

3. Segurança
   - HTTPS
   - CSP headers
   - Input sanitization
   - Token validation
