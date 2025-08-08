import type { Survey } from '../types/index.js';

export declare class ApiProvider {
  subscribe(callback: (config: Survey | null) => void): void;
  getGameConfig(): Survey | null;
  isGameReady(): boolean;
}
