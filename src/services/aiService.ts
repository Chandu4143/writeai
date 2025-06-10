interface AIResponse {
  content: string;
  suggestions?: string[];
  error?: string;
}

interface AIRequest {
  prompt: string;
  context?: string;
  type: 'continue' | 'improve' | 'summarize' | 'brainstorm' | 'outline' | 'character' | 'dialogue';
  currentContent?: string;
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    // In a real app, this would come from environment variables or user settings
    this.apiKey = localStorage.getItem('openai_api_key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  async generateContent(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      return {
        content: '',
        error: 'Please set your OpenAI API key in settings to use AI features.'
      };
    }

    try {
      const systemPrompts = {
        continue: "You are a creative writing assistant. Continue the story naturally, maintaining the same tone, style, and narrative voice. Keep the continuation engaging and coherent with what came before.",
        improve: "You are an expert editor. Improve the given text by enhancing clarity, flow, grammar, and style while maintaining the author's voice and intent.",
        summarize: "You are a skilled summarizer. Create a concise summary that captures the key points and main ideas of the given text.",
        brainstorm: "You are a creative brainstorming partner. Generate creative ideas, plot points, character developments, or story directions based on the given context.",
        outline: "You are a story structure expert. Create a detailed outline that organizes the content logically and helps develop the narrative structure.",
        character: "You are a character development specialist. Create detailed, believable characters with depth, motivations, and unique traits.",
        dialogue: "You are a dialogue expert. Write natural, engaging dialogue that reveals character and advances the story."
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompts[request.type]
            },
            {
              role: 'user',
              content: `${request.context ? `Context: ${request.context}\n\n` : ''}${request.prompt}${request.currentContent ? `\n\nCurrent content: ${request.currentContent}` : ''}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        suggestions: this.generateSuggestions(request.type)
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'An error occurred while generating content.'
      };
    }
  }

  private generateSuggestions(type: string): string[] {
    const suggestions = {
      continue: [
        "Add more dialogue to reveal character",
        "Introduce a plot twist",
        "Describe the setting in more detail",
        "Show character emotions through actions"
      ],
      improve: [
        "Vary sentence structure",
        "Use more specific vocabulary",
        "Add sensory details",
        "Strengthen transitions between ideas"
      ],
      brainstorm: [
        "Explore character backstories",
        "Consider alternative plot directions",
        "Add conflict or tension",
        "Develop subplots"
      ]
    };

    return suggestions[type as keyof typeof suggestions] || [];
  }

  // Simulate AI response for demo purposes when no API key is set
  async simulateAIResponse(request: AIRequest): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const demoResponses = {
      continue: "The mysterious figure stepped out of the shadows, their face obscured by the dim streetlight. Sarah's heart raced as she recognized the familiar silhouette—it was someone she thought she'd never see again. The singing grew louder, more insistent, as if responding to this unexpected reunion.\n\n\"I've been looking for you,\" the figure said, their voice barely audible above the ethereal melody that seemed to emanate from the very air around them.",
      improve: "Here's an improved version of your text with enhanced flow and clarity:\n\n[Your original text would be rewritten here with better structure, more vivid descriptions, and improved pacing. The AI would maintain your voice while making the prose more engaging and polished.]",
      brainstorm: "Here are some creative directions for your story:\n\n• The singing could be a form of communication from another dimension\n• Sarah might discover she has a unique ability to understand the phenomenon\n• The empty city could be a test or simulation\n• Other survivors might have different reactions to the singing\n• The phenomenon could be connected to Sarah's past or family history",
      summarize: "Summary: Sarah discovers her city has been mysteriously emptied of all life except humans. A strange, beautiful singing fills the air, and she encounters other survivors while trying to understand what has happened. The phenomenon appears to be centered around the harbor area and affects all living creatures except people.",
      outline: "Story Outline:\n\nAct I - Discovery\n• Sarah notices the empty city\n• Introduction of the singing phenomenon\n• Meeting other survivors\n\nAct II - Investigation\n• Exploring the source of the phenomenon\n• Character development and relationships\n• Uncovering clues about the cause\n\nAct III - Resolution\n• Confronting the source\n• Character growth and change\n• New world order established",
      character: "Character Development:\n\n**Sarah Chen** - Protagonist\n• Analytical mind helps her notice patterns others miss\n• Humming habit connects her to the phenomenon\n• Internal conflict between logic and intuition\n• Character arc: Learning to trust her instincts\n\n**Supporting Characters:**\n• The Scientist - Provides logical explanations\n• The Artist - Sees beauty in the chaos\n• The Child - Represents hope and innocence",
      dialogue: "\"Do you hear it too?\" Sarah asked, her voice barely above a whisper.\n\nMarcus nodded slowly, his medical training warring with what his senses told him. \"It's impossible, but yes. It's like... like the city itself is singing.\"\n\n\"Not the city,\" Elena interjected, her artist's eye catching something the others missed. \"Look at the light. It's moving with the music. Whatever's doing this, it's alive.\""
    };

    return {
      content: demoResponses[request.type as keyof typeof demoResponses] || "AI response would appear here based on your request.",
      suggestions: this.generateSuggestions(request.type)
    };
  }
}

export const aiService = new AIService();
export type { AIRequest, AIResponse };