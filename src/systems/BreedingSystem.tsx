import React from 'react'
import Fish from '../components/Fish'

export const BreedingSystem = (entities: any, { time }: any) => {
  const dt = time.delta || 16;

  Object.keys(entities).forEach((key: any) => {
    const e = entities[key];
    if (e.type === 'egg') {
      e.incubationTime -= dt;

      // Hatch!
      if (e.incubationTime <= 0) {
        const newFishId = e.fishData.id;
        // Transform the egg into the new fish
        entities[newFishId] = {
          ...e.fishData,
          position: { x: e.position.x, y: e.position.y },
          renderer: <Fish />
        };
        // Remove egg
        delete entities[key];
      }
    }
  });

  return entities;
}
