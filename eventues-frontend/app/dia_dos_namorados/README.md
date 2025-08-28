# Página Especial de Dia dos Namorados (World of Warcraft)

Esta é uma página especial com tema de World of Warcraft para surpreender sua namorada com uma experiência interativa e um voucher de presente.

## Estrutura

- `page.tsx` - Página principal
- `layout.tsx` - Layout personalizado (isolado da navegação do Eventues)
- `/components` - Componentes React específicos para esta experiência
- `/styles` - Arquivos CSS modulares para estilização

## Componentes

1. **StoryScroll** - Mostra sua história de relacionamento em estilo de pergaminho
2. **QuestLetter** - Carta de missão no estilo WoW com botão de aceitar
3. **TreasureChest** - Baú do tesouro com animação que revela o voucher
4. **WowPage** - Componente principal que orquestra toda a experiência

## Personalização

Para personalizar a experiência, você deve:

1. **Adicionar imagens necessárias** na pasta `/public/dia_dos_namorados/images/`:

   ```
   /public/dia_dos_namorados/images/
   ├── wow-background.jpg         # Fundo estilo WoW (floresta, castelo)
   ├── header-decoration.png      # Decoração para o título
   ├── parchment-bg.png           # Textura de pergaminho para a história
   ├── quest-parchment.png        # Textura da carta de missão
   ├── wax-seal.png               # Selo de cera para a carta
   ├── separator.png              # Separador decorativo
   ├── achievement-crown.png      # Coroa para conquista
   ├── treasure-chest.png         # Imagem do baú
   ├── chest-lid.png              # Tampa do baú (separada para animação)
   ├── ribbon-knot.png            # Nó do laço
   ├── ribbon-left.png            # Lado esquerdo do laço
   ├── ribbon-right.png           # Lado direito do laço
   └── legendary-item-bg.png      # Fundo para item lendário (voucher)
   ```

2. **Adicionar sons** (opcional) na pasta `/public/dia_dos_namorados/sounds/`:

   ```
   /public/dia_dos_namorados/sounds/
   ├── wow-tavern-music.mp3       # Música de fundo estilo taverna de WoW
   ├── quest-accept.mp3           # Som de aceitação de missão
   └── chest-open.mp3             # Som de abertura do baú
   ```

3. **Personalizar o conteúdo** no arquivo `StoryScroll.tsx` com sua própria história.

## Fontes de recursos

Recomendo usar estes sites para encontrar recursos:

- **Imagens**: Você pode encontrar texturas e gráficos de WoW em sites de fãs ou criar usando IA generativa
- **Sons**: Você pode extrair sons do jogo ou encontrar arquivos de áudio semelhantes em sites de efeitos sonoros

## Instalação

1. Certifique-se de que todas as imagens necessárias estão na pasta `/public/dia_dos_namorados/images/`
2. Certifique-se de que todos os sons necessários estão na pasta `/public/dia_dos_namorados/sounds/`
3. Personalize a história no arquivo `StoryScroll.tsx` com seus próprios textos
4. Personalize a mensagem da missão no arquivo `QuestLetter.tsx`

A página estará disponível em: `https://seu-site.com/dia_dos_namorados`
