import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY') || 'mock-key',
    });
  }

  async detectMaterials(imageBuffer: Buffer, mimeType: string): Promise<string[]> {
    const base64Image = imageBuffer.toString('base64');
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an advanced computer vision model specialized in DIY materials recognition. Analyze the image and extract all distinct, raw materials that could be used in a crafting, construction, or gardening project. Do not include transient background elements (e.g. floor, table) unless they are clearly usable raw materials. Return a JSON object containing a "materials" array of strings (lowercase). Example: {"materials": ["cardboard box", "plastic bottle", "glue"]}.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.materials || [];
    } catch (e) {
      console.error('Failed to parse materials from vision response', e);
      return [];
    }
  }

  async generateProjects(materials: string[], difficulty: string, category: string): Promise<any[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are "DIY Genius", an expert engineer, crafter, and maker. Suggest 3 highly creative DIY projects that primarily use the user\'s materials, though basic household items (glue, scissors, nails) can be assumed. Return a JSON object with a "projects" array. Each project should have: title, description, difficulty, timeEstimate, costEstimate, materialsNeeded, and category.',
          },
          {
            role: 'user',
            content: `Materials available: ${materials.join(', ')}. Requested Difficulty: ${difficulty}. Category Hint: ${category}.`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.projects || [];
    } catch (e) {
      console.error('Failed to generate projects', e);
      return [];
    }
  }

  async generateProjectSteps(projectTitle: string, materials: string[]): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are "DIY Genius", an expert engineer, crafter, and maker. Generate step-by-step instructions for the specified project. Return a JSON object with: "requiredTools" (string array), "safetyWarnings" (string array), and "steps" (array of objects, each with "stepNumber" integer, "instruction" string, and "safetyWarning" optional string). Ensure safety instructions are prominent.',
          },
          {
            role: 'user',
            content: `Project Title: ${projectTitle}. Available Materials: ${materials.join(', ')}.`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (e) {
      console.error('Failed to generate steps', e);
      return { requiredTools: [], safetyWarnings: [], steps: [] };
    }
  }

  async generateProjectImage(projectTitle: string, description: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: `A high quality, modern photo of a completed DIY project: ${projectTitle}. Description: ${description}. Sleek presentation, photorealistic, no text.`,
        n: 1,
        size: '1024x1024',
      });
      return response.data?.[0]?.url || '';
    } catch (e) {
      console.error('Failed to generate project image', e);
      return '';
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0]?.embedding || [];
    } catch (e) {
      console.error('Failed to generate embedding', e);
      return new Array(1536).fill(0); // fallback vector
    }
  }
}
