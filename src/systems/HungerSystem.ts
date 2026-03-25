export const HungerSystem = (entities: any, { time }: any) => {
  const dt = time.delta || 16;
  // Decrease hunger very slowly (e.g. 1 point every 2 seconds)
  const hungerDropRate = 1 / 2000;

  Object.values(entities).forEach((e: any) => {
    if (e.type === 'fish') {
      e.hunger = Math.max(0, e.hunger - hungerDropRate * dt);
      
      // If starving, lose happiness
      if (e.hunger < 30) {
        e.happiness = Math.max(0, e.happiness - (hungerDropRate * dt * 2));
      }
    }
  });

  return entities;
}
