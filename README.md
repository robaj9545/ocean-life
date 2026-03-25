# Ocean Life V2 - Real Project

Este é o projeto completo do jogo Ocean Life, desenvolvido com React Native e Expo.

## 🚀 Stack
- React Native + Expo
- React Native Game Engine
- Matter.js (física leve)
- Zustand (gerenciamento de estado)
- AsyncStorage (persistência local)
- Supabase (backend pronto para integração)

## 📁 Estrutura
- `/src/components`: Componentes visuais (Peixes, Comida, UI)
- `/src/entities`: Fábricas de entidades (Peixes, Bolhas)
- `/src/systems`: Lógica do jogo (Movimento, Fome, Crescimento, Colisão)
- `/src/screens`: Telas do app (Aquário, Loja)
- `/src/services`: Integração com APIs e Storage
- `/src/store`: Estado global (Zustand)
- `/src/utils`: Funções utilitárias (Genética, Tempo, Eventos)

## ⚙️ Instalação
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o projeto:
   ```bash
   npx expo start
   ```

## 🌟 Funcionalidades V2
- **Sistema de Missões**: Ganhe recompensas ao alimentar peixes.
- **Eventos Diários**: Bônus de moedas e crescimento.
- **Genética Avançada**: DNA real para cruzamento de peixes.
- **Supabase Ready**: Estrutura pronta para login e sincronização.
- **Multiplayer**: Base para visitar outros aquários.
- **Marketplace**: Sistema de venda de peixes.
- **Monetização**: Suporte para Ads e IAP.

## 🚀 Próximos Passos
- Configurar as chaves do Supabase em `src/services/supabase.ts`.
- Adicionar sprites reais na pasta `src/assets`.
- Implementar IA de comportamento (Boids).
