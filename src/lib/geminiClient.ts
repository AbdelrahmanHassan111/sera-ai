/**
 * Gemini AI Client - Using Official @google/generative-ai SDK
 * 
 * SECURITY NOTE: This client makes API calls directly from the browser.
 * The user's API key is used client-side and never sent to any third-party servers.
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import type { GeminiConfig, GeminiResponse, GeminiStreamOptions } from '@/types/domain';

class GeminiClient {
  private apiKey: string = '';
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private mockMode: boolean = false;
  private modelName: string = 'gemini-2.0-flash-exp';

  setApiKey(key: string, persist: boolean = false): void {
    this.apiKey = key;
    if (key) {
      this.genAI = new GoogleGenerativeAI(key);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
    }
    
    if (persist && key) {
      localStorage.setItem('sera:geminiKey:v1', key);
    } else if (!persist) {
      localStorage.removeItem('sera:geminiKey:v1');
    }
  }

  loadApiKey(): string | null {
    const stored = localStorage.getItem('sera:geminiKey:v1');
    if (stored) {
      this.setApiKey(stored, false);
      return stored;
    }
    return null;
  }

  clearApiKey(): void {
    this.apiKey = '';
    this.genAI = null;
    this.model = null;
    localStorage.removeItem('sera:geminiKey:v1');
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0 && this.model !== null;
  }

  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
  }

  /**
   * Generate content with Gemini using official SDK
   */
  async generate(
    prompt: string,
    options: {
      stream?: boolean;
      context?: any;
      temperature?: number;
      maxTokens?: number;
    } & GeminiStreamOptions = {}
  ): Promise<GeminiResponse> {
    // Use mock mode if no API key
    if (this.mockMode || !this.model || !this.apiKey) {
      console.log('🎭 Using mock mode');
      return this.mockGenerate(prompt, options);
    }

    try {
      const fullPrompt = this.buildPromptWithContext(prompt, options.context);
      
      console.log('🚀 Calling Gemini API');
      console.log('📝 Model:', this.modelName);
      console.log('💬 Prompt:', fullPrompt.substring(0, 100) + '...');

      // Generation config
      const generationConfig = {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
        topP: 0.95,
        topK: 40,
      };

      if (options.stream) {
        return await this.streamGenerate(fullPrompt, generationConfig, options);
      } else {
        return await this.nonStreamGenerate(fullPrompt, generationConfig);
      }
    } catch (error: any) {
      console.error('❌ Gemini API Error:', error);
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  /**
   * Non-streaming generation using official SDK
   */
  private async nonStreamGenerate(
    prompt: string,
    generationConfig: any
  ): Promise<GeminiResponse> {
    if (!this.model) {
      throw new Error('Model not initialized. Please set API key first.');
    }

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      console.log('✅ Response received:', text.substring(0, 100) + '...');

      return {
        text,
        finishReason: response.candidates?.[0]?.finishReason,
      };
    } catch (error: any) {
      console.error('❌ Non-stream error:', error);
      throw new Error(error.message || 'Failed to generate content');
    }
  }

  /**
   * Streaming generation using official SDK
   */
  private async streamGenerate(
    prompt: string,
    generationConfig: any,
    options: GeminiStreamOptions
  ): Promise<GeminiResponse> {
    if (!this.model) {
      throw new Error('Model not initialized. Please set API key first.');
    }

    try {
      console.log('📡 Starting stream...');

      const result = await this.model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      let fullText = '';
      let chunkCount = 0;

      // Process stream
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        chunkCount++;
        
        console.log(`📥 Chunk ${chunkCount}:`, chunkText);
        
        fullText += chunkText;
        
        if (options.onToken) {
          options.onToken(chunkText);
        }
      }

      console.log(`✅ Stream complete! Received ${chunkCount} chunks`);
      console.log('📄 Full text:', fullText);

      if (options.onComplete) {
        options.onComplete(fullText);
      }

      return {
        text: fullText,
      };
    } catch (error: any) {
      console.error('❌ Stream error:', error);
      if (options.onError) {
        options.onError(error);
      }
      throw new Error(error.message || 'Stream failed');
    }
  }

  /**
   * Build prompt with context
   */
  private buildPromptWithContext(prompt: string, context?: any): string {
    if (!context) return prompt;

    let contextStr = '';
    
    if (context.page) {
      contextStr += `Current page: ${context.page}\n`;
    }
    
    if (context.markers && context.markers.length > 0) {
      contextStr += `\nTop genetic markers:\n`;
      context.markers.slice(0, 5).forEach((m: any) => {
        contextStr += `- ${m.gene} (${m.rsid}): ${m.genotype}\n`;
      });
    }
    
    if (context.recommendations && context.recommendations.length > 0) {
      contextStr += `\nRecent recommendations:\n`;
      context.recommendations.slice(0, 3).forEach((r: any) => {
        contextStr += `- ${r.title}\n`;
      });
    }

    if (context.userProfile) {
      contextStr += `\nUser profile: ${JSON.stringify(context.userProfile)}\n`;
    }

    return contextStr ? `${contextStr}\n---\nUser question: ${prompt}` : prompt;
  }

  /**
   * Mock/offline mode for testing and demo purposes
   */
  mockGenerate(
    prompt: string,
    options: GeminiStreamOptions = {}
  ): Promise<GeminiResponse> {
    return new Promise((resolve) => {
      const responses: Record<string, string> = {
        default: "I'm operating in mock mode. To use real AI features, please add your Gemini API key in Settings. This is a simulated response for demonstration purposes.",
        recommendation: "Based on your genetic profile, I recommend consulting with a healthcare provider about these findings. Remember, genetic information is just one factor in your overall health picture.",
        explain: "This genetic marker indicates how your body metabolizes certain medications. The specific variant you carry may affect drug efficacy or side effects. Always consult with your doctor before making medication changes.",
        lifestyle: "Consider incorporating these evidence-based lifestyle modifications: 1) Regular cardiovascular exercise 3-5x per week, 2) Mediterranean diet pattern, 3) Stress management through mindfulness, 4) Quality sleep 7-9 hours nightly.",
      };

      let responseText = responses.default;
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('recommend')) {
        responseText = responses.recommendation;
      } else if (lowerPrompt.includes('explain') || lowerPrompt.includes('what')) {
        responseText = responses.explain;
      } else if (lowerPrompt.includes('lifestyle') || lowerPrompt.includes('plan')) {
        responseText = responses.lifestyle;
      }

      // Simulate streaming
      if (options.onToken) {
        const words = responseText.split(' ');
        let index = 0;
        const interval = setInterval(() => {
          if (index < words.length) {
            const token = (index === 0 ? '' : ' ') + words[index];
            options.onToken!(token);
            index++;
          } else {
            clearInterval(interval);
            if (options.onComplete) {
              options.onComplete(responseText);
            }
          }
        }, 50);
      }

      setTimeout(() => {
        resolve({ text: responseText });
      }, options.onToken ? responseText.split(' ').length * 50 + 100 : 500);
    });
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();

// Export helper functions
export const setGeminiKey = (key: string, persist: boolean = false) => {
  geminiClient.setApiKey(key, persist);
};

export const getGeminiClient = () => geminiClient;
