import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private configService;
    private openai;
    constructor(configService: ConfigService);
    detectMaterials(imageBuffer: Buffer, mimeType: string): Promise<string[]>;
    generateProjects(materials: string[], difficulty: string, category: string): Promise<any[]>;
    generateProjectSteps(projectTitle: string, materials: string[]): Promise<any>;
    generateProjectImage(projectTitle: string, description: string): Promise<string>;
    generateEmbedding(text: string): Promise<number[]>;
}
