import type { Survey } from '../types/index.js';

export declare class ApiProvider {
    subscribe(callback: (config: any) => void): void;
    getGameConfig(): any;
    isGameReady(): boolean;
    createAppData(surveyData: {
        surveyId: string;
        answers: any;
        timestamp: string;
        sessionId: string;
    }): Promise<any>;
    getAppData(options?: {
        exerciseId?: string;
        appInstanceId?: string;
        surveyId?: string;
    }): Promise<any>;
}
