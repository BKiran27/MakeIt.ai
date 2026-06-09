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
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'mock-key') {
      return ['cardboard box', 'plastic bottle', 'glue', 'scissors', 'acrylic paint'];
    }

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
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'mock-key') {
      return [
        {
          id: 'mock-proj-1',
          title: 'Eco-Friendly Self-Watering Planter',
          description: 'A brilliant self-watering planter made by upcycling plastic bottles. Perfect for small indoor herbs and flowers.',
          difficulty: difficulty || 'EASY',
          timeEstimate: '30 mins',
          costEstimate: '$0',
          materialsNeeded: ['plastic bottle', 'glue'],
          category: category || 'Gardening',
        },
        {
          id: 'mock-proj-2',
          title: 'Geometric Desk Organizer',
          description: 'A stylish and modern desk organizer built entirely out of sturdy cardboard pieces. Perfect for storing pens, rulers, and craft tools.',
          difficulty: difficulty || 'EASY',
          timeEstimate: '1.5 hours',
          costEstimate: '$0 - $5',
          materialsNeeded: ['cardboard box', 'glue', 'scissors'],
          category: category || 'Crafts',
        },
        {
          id: 'mock-proj-3',
          title: 'Artistic Storage Caddy',
          description: 'An elegant carrying caddy constructed from thick cardboard, detailed with acrylic paint, and divided using bottle parts.',
          difficulty: difficulty || 'MEDIUM',
          timeEstimate: '2 hours',
          costEstimate: '$5 - $10',
          materialsNeeded: ['cardboard box', 'plastic bottle', 'acrylic paint'],
          category: category || 'Crafts',
        }
      ];
    }

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
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'mock-key') {
      return {
        requiredTools: ['scissors', 'ruler', 'hot glue gun'],
        safetyWarnings: ['Use scissors carefully to avoid cuts.', 'Adult supervision required when using the hot glue gun.'],
        steps: [
          {
            stepNumber: 1,
            instruction: `Collect your materials: ${materials.join(', ')}. Clean and dry all containers before starting.`,
            safetyWarning: 'Ensure containers are completely clean of any chemical residue.'
          },
          {
            stepNumber: 2,
            instruction: 'Carefully measure and cut the materials using your scissors and ruler to match the design blueprint.',
            safetyWarning: 'Cut slowly and always direct blades away from your fingers.'
          },
          {
            stepNumber: 3,
            instruction: 'Use the hot glue gun to assemble the cut pieces together, holding each joint for 10 seconds to ensure a secure bond.',
            safetyWarning: 'Do not touch the heated metal tip or the hot melted glue.'
          },
          {
            stepNumber: 4,
            instruction: 'Decorate the finished assembly with acrylic paint to give it a custom premium finish, then let it dry.',
          }
        ]
      };
    }

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
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'mock-key') {
      // Return a high-quality free Unsplash picture of crafts
      return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop';
    }

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
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'mock-key') {
      // Generate a mock vector embedding of size 1536
      return new Array(1536).fill(0).map(() => Math.random() - 0.5);
    }

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
