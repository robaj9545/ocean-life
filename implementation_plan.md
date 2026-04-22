# Implementação de Novas Espécies, Breeding e Sistema de Apelidos

Este plano detalha a implementação de novas espécies categorizadas por raridade, a reformulação da mecânica de cruzamento (Breeding) e o novo sistema de apelidos na loja.

## User Review Required

> [!IMPORTANT]  
> **Fluxo de Compra de Apelido:** O usuário pediu para adicionar o item "apelidar peixe" na loja por 1.000 moedas. O plano propõe que, ao clicar em comprar esse item, um modal se abra pedindo para selecionar um peixe do aquário e digitar o apelido. Apenas após a confirmação do apelido os 1.000 moedas serão descontados. Você concorda com esse fluxo ou prefere que seja um item "guardado no inventário" para uso posterior?

> [!WARNING]  
> **Espécies de Peixes:** Para suportar a mecânica de Breeding descrita, precisaremos adicionar novas espécies ao jogo e associá-las rigidamente a cada raridade. Atualmente, os modelos 3D são limitados ao Peixe-Palhaço e Cirurgião-Patela. Os novos peixes podem reutilizar o design 3D atual com cores e escalas diferentes geradas pelo DNA/espécie, como já ocorre com as mutações, até que novos modelos 3D sejam integrados.

## Proposed Changes

---
### Modelo e Armazenamento (Store)
Atualização do esquema principal de peixes para suportar os novos recursos.

#### [MODIFY] [useGameStore.ts](file:///c:/dev_pessoal/ocean-life/src/store/useGameStore.ts)
- Adicionar o campo opcional `nickname?: string` na interface `FishEntity`.
- Adicionar uma função no estado `renameFish: (id: string, newName: string) => void` para renomear os peixes e salvar na nuvem.

#### [MODIFY] [utils/fishUtils.ts (ou similar)](file:///c:/dev_pessoal/ocean-life/src/utils/breeding.ts)
- (Se necessário) Criar uma função utilitária `getFishDisplayName(fish: FishEntity)` que retorna o `nickname` caso exista, ou o nome traduzido da espécie.

---
### Lógica de Cruzamento (Breeding)
Refatoração da matemática de raridades seguindo a solicitação exata do usuário.

#### [MODIFY] [utils/breeding.ts](file:///c:/dev_pessoal/ocean-life/src/utils/breeding.ts)
- Atualizar a seleção da espécie e da raridade:
  - Se `Raridade A == Raridade B`: A raridade do filhote será um nível acima (`Raridade A + 1`), limitado até o nível máximo (Lendário).
  - Se `Raridade A != Raridade B`: A raridade será um nível abaixo da maior raridade entre os pais (`max(Raridade A, Raridade B) - 1`).
  - Associar rigorosamente uma espécie ou pool de espécies à nova raridade calculada (ex: se o cruzamento resulta em `Raro`, a espécie será definida como `peixe aranha` ou outra da mesma categoria).

---
### Configuração de Novas Espécies
Padronização do catálogo de espécies para a geração de peixes no mercado e no breeding.

#### [MODIFY] [entities/createFish.ts](file:///c:/dev_pessoal/ocean-life/src/entities/createFish.ts)
- Substituir o array `possibleSpecies` atual por um dicionário estruturado que relaciona espécias a raridades:
  - **Básico**: `clownfish` (Peixe-Palhaço), `bluetang` (Cirurgião-Patela)
  - **Raro**: `spiderfish` (Peixe Aranha), `lionfish` (Peixe-Leão)
  - **Épico**: `dragonfish` (Peixe-Dragão), `ghostshark` (Tubarão-Fantasma)
  - **Lendário**: `leviathan` (Leviatã)
- Garantir que a função retorne as cores e escalas adequadas baseadas nestas novas espécies.

---
### Loja (Shop) e Apelidos
Criação da aba "Decorações" e da funcionalidade de aplicar apelidos.

#### [MODIFY] [screens/ShopScreen.tsx](file:///c:/dev_pessoal/ocean-life/src/screens/ShopScreen.tsx)
- Adicionar uma nova aba `decorations` no menu lateral.
- Na aba `decorations`, adicionar o `ShopCard` "Apelidar Peixe" com custo de 1.000 moedas.
- Ao clicar no botão de compra do "Apelidar Peixe", invocar a abertura de um modal focado em renomeação.

#### [NEW] [components/screens/RenameFishModal.tsx](file:///c:/dev_pessoal/ocean-life/src/components/screens/RenameFishModal.tsx)
- Criar um componente de modal (overlay) contendo:
  - Uma grade ou carrossel com os peixes vivos do usuário.
  - Um campo de texto de input para definir o novo apelido (padrão será o nome da espécie).
  - Um botão de "Confirmar Apelido (1.000 🪙)".
- Quando confirmado, o fluxo descontará os 1.000 coins do saldo do usuário via `addCoins(-1000)` e invocará a função `renameFish(id, nome)`.

#### [MODIFY] UI de Visualização (Diversos Arquivos)
- Modificar os locais onde o nome do peixe é impresso para usar o novo padrão "Apelido ou Espécie".
  - `components/screens/BreedingComponents.tsx` (`FishCard` e `FishSlot`)
  - `components/fishes/Fish3D.tsx` (se o nome renderizar via HTML overlay, como em tags)
  - `components/screens/InventoryComponents.tsx` (se os peixes forem listados aqui)
  - `screens/AquariumScreen.tsx` (caso existam name tags nos peixes nadando).

## Verification Plan
### Manual Verification
1. Abrir a loja, verificar a nova aba de Decorações e tentar comprar o "Apelido" sem ter 1.000 moedas.
2. Adicionar saldo, tentar comprar o Apelido, escolher um peixe e checar se o apelido é salvo corretamente na Store e as moedas descontadas.
3. Checar a visualização do apelido na aba Breeding.
4. Testar a nova mecânica de Breeding:
    - Básico + Básico -> Esperado: Espécie Rara.
    - Raro + Raro -> Esperado: Espécie Épica.
    - Básico + Épico -> Esperado: Espécie Rara.
    - Básico + Raro -> Esperado: Espécie Básica.
