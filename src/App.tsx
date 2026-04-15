import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { LLMCard } from "@/src/components/LLMCard";
import { LLMResponse } from "@/src/types";
import { Sparkles, Send, RotateCcw, LayoutGrid, Columns, Info, ExternalLink, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "column">("grid");

  const handleCompare = async () => {
    if (!prompt.trim()) return;

    setIsComparing(true);
    const initialResponses: LLMResponse[] = [
      {
        id: "gemini",
        provider: "Gemini",
        model: "gemini-3-flash-preview",
        text: "",
        loading: true,
        ratings: { correctness: 5, tone: 5, completeness: 5 },
      },
      {
        id: "openrouter",
        provider: "OpenRouter",
        model: "llama-3.3-70b-instruct",
        text: "",
        loading: true,
        ratings: { correctness: 5, tone: 5, completeness: 5 },
      },
      {
        id: "groq",
        provider: "Groq",
        model: "llama-3.3-70b-versatile",
        text: "",
        loading: true,
        ratings: { correctness: 5, tone: 5, completeness: 5 },
      },
    ];
    setResponses(initialResponses);

    // Run all requests in parallel
    await Promise.all([
      fetchGemini(prompt),
      fetchOpenRouter(prompt),
      fetchGroq(prompt),
    ]);
  };

  const fetchGemini = async (p: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: p,
      });
      updateResponse("gemini", { text: response.text || "No response", loading: false });
    } catch (error: any) {
      updateResponse("gemini", { error: error.message, loading: false });
    }
  };

  const fetchOpenRouter = async (p: string) => {
    try {
      const res = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateResponse("openrouter", { text: data.text, loading: false });
    } catch (error: any) {
      updateResponse("openrouter", { error: error.message, loading: false });
    }
  };

  const fetchGroq = async (p: string) => {
    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateResponse("groq", { text: data.text, loading: false });
    } catch (error: any) {
      updateResponse("groq", { error: error.message, loading: false });
    }
  };

  const updateResponse = (id: string, updates: Partial<LLMResponse>) => {
    setResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleRate = (id: string, category: keyof LLMResponse["ratings"], value: number) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ratings: { ...r.ratings, [category]: value } }
          : r
      )
    );
  };

  const reset = () => {
    setPrompt("");
    setResponses([]);
    setIsComparing(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-serif-italic text-2xl tracking-[2px] uppercase">
            AXON <span className="text-primary">|</span> LABORATORY
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-[12px] text-muted-foreground uppercase tracking-[1px]">
            Project: LLM_Evaluation_019
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 uppercase text-[10px] tracking-widest font-bold">
                  <Settings className="h-3 w-3" />
                  Setup
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif-italic text-2xl text-primary">Configuration Guide</DialogTitle>
                  <DialogDescription className="text-muted-foreground pt-2">
                    To enable OpenRouter and Groq models, you must configure your API keys in the AI Studio environment.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80">1. Open Secrets Panel</h4>
                    <p className="text-sm leading-relaxed">
                      Click the <span className="font-bold text-foreground">Settings</span> (gear icon) in the left sidebar of Google AI Studio, then select <span className="font-bold text-foreground">Secrets</span>.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80">2. Add Required Keys</h4>
                    <p className="text-sm leading-relaxed">
                      Add the following keys exactly as shown:
                    </p>
                    <ul className="space-y-2 font-mono text-xs bg-muted/30 p-3 border border-border">
                      <li className="flex justify-between">
                        <span>OPENROUTER_API_KEY</span>
                        <span className="text-primary/60">Required for OpenRouter</span>
                      </li>
                      <li className="flex justify-between">
                        <span>GROQ_API_KEY</span>
                        <span className="text-primary/60">Required for Groq</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80">3. Restart App</h4>
                    <p className="text-sm leading-relaxed">
                      After adding the keys, the application will automatically detect them. You may need to refresh the page.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={() => setViewMode(viewMode === "grid" ? "column" : "grid")}
              title="Toggle View"
            >
              {viewMode === "grid" ? <Columns className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reset} 
              className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground uppercase text-[10px] tracking-widest font-bold"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Input Section */}
        <section className="gold-gradient px-10 py-8">
          <div className="max-w-7xl mx-auto">
            {responses.some(r => r.error?.includes("API_KEY")) && (
              <Alert className="mb-6 bg-primary/5 border-primary/20 text-primary">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-xs uppercase tracking-widest font-bold">Configuration Required</AlertTitle>
                <AlertDescription className="text-sm opacity-90">
                  Some models are unavailable because their API keys are not configured in the Secrets panel.
                </AlertDescription>
              </Alert>
            )}
            <div className="bg-card border border-border p-6 rounded-sm flex items-start gap-6 shadow-2xl">
              <span className="font-serif-italic text-primary text-sm min-w-[100px] uppercase tracking-wider pt-3">
                User Prompt
              </span>
              <div className="flex-1 relative pt-2">
                <Textarea
                  placeholder="Enter your prompt here to compare models..."
                  className="min-h-[80px] bg-transparent border-none text-foreground focus-visible:ring-0 p-0 text-lg resize-none placeholder:text-muted-foreground/50"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isComparing && responses.some(r => r.loading)}
                />
              </div>
              <Button
                onClick={handleCompare}
                disabled={!prompt.trim() || (isComparing && responses.some(r => r.loading))}
                className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase text-[12px] tracking-[2px] font-bold px-8 h-12 rounded-none mt-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Benchmark
              </Button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="flex-1 flex flex-col min-h-0 bg-border">
          <AnimatePresence mode="wait">
            {!isComparing ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-background"
              >
                <div className="border border-primary/30 p-6 rounded-full mb-6">
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <h2 className="font-serif-italic text-3xl mb-3 tracking-tight">Awaiting Input</h2>
                <p className="text-muted-foreground max-w-md font-light tracking-wide">
                  Initiate a comparison sequence by entering a prompt above.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`grid gap-[1px] h-full ${
                  viewMode === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                }`}
              >
                {responses.map((response) => (
                  <motion.div
                    key={response.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-background h-full"
                  >
                    <LLMCard response={response} onRate={handleRate} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 px-10 bg-background flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground">
          © 2026 AXON LABORATORY <span className="mx-2">|</span> SECURE EVALUATION ENVIRONMENT
        </p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Gemini
          </span>
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> OpenRouter
          </span>
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Groq
          </span>
        </div>
      </footer>
    </div>
  );
}
