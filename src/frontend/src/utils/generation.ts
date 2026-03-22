import type { AsteroidData, Rarity, ResourceType } from "../types/game";

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

function assignAsteroidResources(
  seed: number,
): Partial<Record<ResourceType, number>> {
  const r = seededRandom(seed);
  const resources: Partial<Record<ResourceType, number>> = {};

  // Always some common
  const commonRes: ResourceType[] = ["iron", "silicon", "carbon"];
  resources[commonRes[Math.floor(seededRandom(seed * 1.1) * 3)]] =
    Math.floor(seededRandom(seed * 1.2) * 15) + 5;

  if (r > 0.5) {
    const uncommon: ResourceType[] = ["titanium", "platinum", "rareEarth"];
    resources[uncommon[Math.floor(seededRandom(seed * 2.1) * 3)]] =
      Math.floor(seededRandom(seed * 2.2) * 8) + 2;
  }

  if (r > 0.85) {
    const rare: ResourceType[] = [
      "exoticMatter",
      "darkMatter",
      "quantumCrystals",
    ];
    resources[rare[Math.floor(seededRandom(seed * 3.1) * 3)]] =
      Math.floor(seededRandom(seed * 3.2) * 3) + 1;
  }

  return resources;
}

export function generateAsteroidField(
  count: number,
  radius: number,
): AsteroidData[] {
  const asteroids: AsteroidData[] = [];
  for (let i = 0; i < count; i++) {
    const theta = seededRandom(i * 7.3) * Math.PI * 2;
    const phi = Math.acos(2 * seededRandom(i * 3.7) - 1);
    const r = (seededRandom(i * 5.1) * 0.7 + 0.3) * radius;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = (seededRandom(i * 2.9) - 0.5) * radius * 0.3;
    const z = r * Math.sin(phi) * Math.sin(theta);

    const scale = seededRandom(i * 11.3) * 2.5 + 0.5;
    const health = Math.floor(scale * 30);

    asteroids.push({
      id: `asteroid-${i}`,
      position: [x, y, z],
      scale,
      resources: assignAsteroidResources(i * 17.7),
      depleted: false,
      health,
      maxHealth: health,
      rotation: [
        seededRandom(i * 4.1) * Math.PI * 2,
        seededRandom(i * 6.3) * Math.PI * 2,
        seededRandom(i * 8.7) * Math.PI * 2,
      ],
    });
  }
  return asteroids;
}

export type { Rarity };
