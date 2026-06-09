import { AiService } from '../ai/ai.service';
export declare class MaterialsController {
    private aiService;
    constructor(aiService: AiService);
    detectMaterials(file: Express.Multer.File): Promise<{
        materials: string[];
    }>;
}
