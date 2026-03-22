import { create } from "zustand";
import { WEAPONS, type WeaponId } from "../config/weapons";
import { useProjectilesStore } from "./useProjectilesStore";
import { useShipStore } from "./useShipStore";
import { useTargetingStore } from "./useTargetingStore";

type WeaponStatus = "READY" | "COOLDOWN" | "RELOADING";

interface Weapon {
  id: WeaponId;
  name: string;
  status: WeaponStatus;
  cooldownProgress: number;
  ammo?: number;
  maxAmmo?: number;
  reloadProgress?: number;
}

interface WeaponsState {
  weapons: Weapon[];
  selectedWeaponId: WeaponId;

  selectWeapon: (id: WeaponId) => void;
  fire: () => void;
  tick: (deltaMs: number) => void;
}

const initializeWeapons = (): Weapon[] => {
  return Object.values(WEAPONS).map((w) => ({
    id: w.id as WeaponId,
    name: w.name,
    status: "READY" as WeaponStatus,
    cooldownProgress: 0,
    ammo: "maxAmmo" in w ? w.maxAmmo : undefined,
    maxAmmo: "maxAmmo" in w ? w.maxAmmo : undefined,
    reloadProgress: 0,
  }));
};

export const useWeaponsStore = create<WeaponsState>((set, get) => ({
  weapons: initializeWeapons(),
  selectedWeaponId: "pulse",

  selectWeapon: (id) => {
    set({ selectedWeaponId: id });
  },

  fire: () => {
    const { selectedWeaponId, weapons } = get();
    const weapon = weapons.find((w) => w.id === selectedWeaponId);
    const weaponConfig = WEAPONS[selectedWeaponId];

    if (!weapon) return;

    if (weapon.status !== "READY") {
      console.log(`${weapon.name} not ready (${weapon.status})`);
      return;
    }

    if ("requiresLock" in weaponConfig && weaponConfig.requiresLock) {
      const { isLocked } = useTargetingStore.getState();
      if (!isLocked) {
        console.log(`${weapon.name} requires target lock`);
        return;
      }
    }

    if (weapon.maxAmmo && (weapon.ammo ?? 0) <= 0) {
      console.log(`${weapon.name} out of ammo`);
      return;
    }

    console.log(`\uD83D\uDD2B Firing ${weapon.name}!`);

    // Get real camera position from ship store
    const { theta, phi } = useShipStore.getState();
    const camRadius = 3;
    const cameraPos: [number, number, number] = [
      camRadius * Math.cos(phi) * Math.cos(theta),
      camRadius * Math.sin(phi),
      camRadius * Math.cos(phi) * Math.sin(theta),
    ];

    // Determine target position
    const { targetPosition } = useTargetingStore.getState();
    let targetPos: [number, number, number] = [0, 0, 0];
    if (targetPosition) {
      const latRad = (targetPosition.lat * Math.PI) / 180;
      const lngRad = (targetPosition.lng * Math.PI) / 180;
      const r = 1.5;
      targetPos = [
        r * Math.cos(latRad) * Math.cos(lngRad),
        r * Math.sin(latRad),
        r * Math.cos(latRad) * Math.sin(lngRad),
      ];
    }

    useProjectilesStore
      .getState()
      .spawnProjectile(selectedWeaponId, cameraPos, targetPos);

    set((state) => ({
      weapons: state.weapons.map((w) => {
        if (w.id !== selectedWeaponId) return w;

        if (w.maxAmmo) {
          const newAmmo = (w.ammo ?? 0) - 1;
          if (newAmmo <= 0) {
            return {
              ...w,
              ammo: 0,
              status: "RELOADING" as WeaponStatus,
              reloadProgress: 0,
            };
          }
          return {
            ...w,
            ammo: newAmmo,
            status: "COOLDOWN" as WeaponStatus,
            cooldownProgress: 1,
          };
        }

        return {
          ...w,
          status: "COOLDOWN" as WeaponStatus,
          cooldownProgress: 1,
        };
      }),
    }));
  },

  tick: (deltaMs) => {
    set((state) => ({
      weapons: state.weapons.map((w) => {
        const config = WEAPONS[w.id];

        if (
          w.status === "RELOADING" &&
          "reloadTime" in config &&
          config.reloadTime
        ) {
          const newProgress =
            (w.reloadProgress ?? 0) + deltaMs / config.reloadTime;
          if (newProgress >= 1) {
            return {
              ...w,
              status: "READY" as WeaponStatus,
              ammo: w.maxAmmo,
              reloadProgress: 0,
              cooldownProgress: 0,
            };
          }
          return { ...w, reloadProgress: newProgress };
        }

        if (w.status === "COOLDOWN") {
          const newProgress = w.cooldownProgress - deltaMs / config.cooldown;
          if (newProgress <= 0) {
            return {
              ...w,
              status: "READY" as WeaponStatus,
              cooldownProgress: 0,
            };
          }
          return { ...w, cooldownProgress: newProgress };
        }

        return w;
      }),
    }));
  },
}));
