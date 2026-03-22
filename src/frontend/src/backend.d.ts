import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GameSave {
    credits: bigint;
    fuel: bigint;
    hull: bigint;
    inventory: string;
    components: string;
    position: string;
}
export interface ScoreEntry {
    playerId: Principal;
    score: bigint;
}
export interface PlayerProfile {
    username: string;
    totalPlayTime: bigint;
    achievements: Array<string>;
}
export interface backendInterface {
    getGameState(player: Principal): Promise<GameSave>;
    getPlayerProfile(player: Principal): Promise<PlayerProfile>;
    getTopScores(): Promise<Array<ScoreEntry>>;
    registerPlayer(username: string): Promise<void>;
    saveGameState(hull: bigint, fuel: bigint, inventory: string, credits: bigint, position: string, components: string): Promise<void>;
    updateHighScore(score: bigint): Promise<void>;
}
