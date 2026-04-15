export type LLMResponse = {
  id: string;
  model: string;
  provider: "Gemini" | "OpenRouter" | "Groq";
  text: string;
  loading: boolean;
  error?: string;
  ratings: {
    correctness: number;
    tone: number;
    completeness: number;
  };
};

export type ComparisonSession = {
  prompt: string;
  responses: LLMResponse[];
};
