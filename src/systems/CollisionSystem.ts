export const CollisionSystem = (entities: any) => {
  const fishes = Object.values(entities).filter((e: any) => e.type === 'fish');
  const foods = Object.keys(entities).filter((k: any) => entities[k].type === 'food');

  fishes.forEach((fish: any) => {
    foods.forEach((foodKey: any) => {
      const food = entities[foodKey];
      if (!food) return;

      const dx = fish.position.x - food.position.x;
      const dy = fish.position.y - food.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Collision threshold based on fish size
      if (dist < fish.size) {
        // Eat food
        fish.hunger = Math.min(100, fish.hunger + 40);
        fish.happiness = Math.min(100, fish.happiness + 20);
        
        // Remove food entity completely
        delete entities[foodKey];
      }
    });
  });

  // Gravity for foods
  foods.forEach((foodKey: any) => {
    const food = entities[foodKey];
    if (food) {
      food.position.y += 2; // slow fall
      if (food.position.y > 800) {
        delete entities[foodKey]; // Cleanup missed food
      }
    }
  });

  return entities;
}
