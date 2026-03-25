export const MovementSystem = (entities: any, { time }: any) => {
  const dt = time.delta || 16;
  
  Object.values(entities).forEach((entity: any) => {
    if (entity.type === 'fish') {
      // Wandering behavior
      if (!entity.target) {
        entity.target = {
          x: Math.max(20, Math.random() * 350),
          y: Math.max(50, Math.random() * 600)
        }
      }

      const dx = entity.target.x - entity.position.x;
      const dy = entity.target.y - entity.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        entity.target = null; // Reached target
      } else {
        const vx = (dx / dist) * entity.speed * (dt / 16);
        const vy = (dy / dist) * entity.speed * (dt / 16);
        
        entity.position.x += vx;
        entity.position.y += vy;
        
        // Flip direction based on horizontal movement
        if (vx > 0) entity.direction = -1;
        if (vx < 0) entity.direction = 1;
      }
    }
  });

  return entities;
}
