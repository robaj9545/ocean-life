export const GrowthSystem = (entities: any, { time }: any) => {
  const dt = time.delta || 16;
  const growthRate = 0.5 / 10000; // Slow growth

  Object.values(entities).forEach((e: any) => {
    if (e.type === 'fish') {
      e.age += dt;
      // Grow only if fed and not max size
      if (e.hunger > 50 && e.size < 60) {
        e.size += growthRate * dt;
      }
    }
  });

  return entities;
}
