import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LLMResponse } from "@/src/types";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface LLMCardProps {
  response: LLMResponse;
  onRate: (id: string, category: keyof LLMResponse["ratings"], value: number) => void;
}

export function LLMCard({ response, onRate }: LLMCardProps) {
  return (
    <div className="flex flex-col h-full p-8 bg-background">
      <div className="mb-6">
        <div className="font-serif-italic text-xl mb-1">{response.provider}</div>
        <div className="text-[11px] uppercase tracking-[1px] text-muted-foreground">
          {response.model}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 mb-8 relative">
          {response.loading ? (
            <div className="flex flex-col gap-3">
              <div className="h-4 w-full bg-muted/20 animate-pulse rounded-none" />
              <div className="h-4 w-3/4 bg-muted/20 animate-pulse rounded-none" />
              <div className="h-4 w-5/6 bg-muted/20 animate-pulse rounded-none" />
            </div>
          ) : response.error ? (
            <div className="flex flex-col gap-4 bg-destructive/5 p-6 border border-destructive/20">
              <p className="text-sm text-destructive font-mono leading-relaxed break-words whitespace-pre-wrap">
                {response.error}
              </p>
              {response.error.includes("API_KEY") && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Resolution Required
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Please add your API key to the Secrets panel in AI Studio settings to enable this model.
                  </p>
                </div>
              )}
              {(response.error.includes("429") || response.error.toLowerCase().includes("quota")) && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Billing Issue
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your API account has exceeded its quota or requires a funded billing account. Please check your provider's dashboard.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[14px] leading-[1.6] text-[#d0d0d0] whitespace-pre-wrap font-sans">
              {response.text}
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </ScrollArea>

        {!response.loading && !response.error && response.text && (
          <div className="border-t border-border pt-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.5px] text-muted-foreground">
                Correctness
              </span>
              <div className="flex items-center gap-4 flex-1 max-w-[120px] ml-4">
                <Slider
                  value={[response.ratings.correctness]}
                  min={0}
                  max={10}
                  step={1}
                  className="[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:bg-primary [&_[data-slot=slider-thumb]]:border-primary"
                  onValueChange={(v: number | number[]) => onRate(response.id, "correctness", Array.isArray(v) ? v[0] : v)}
                />
                <span className="text-[12px] text-primary font-serif-italic min-w-[20px]">
                  {response.ratings.correctness}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.5px] text-muted-foreground">
                Tone
              </span>
              <div className="flex items-center gap-4 flex-1 max-w-[120px] ml-4">
                <Slider
                  value={[response.ratings.tone]}
                  min={0}
                  max={10}
                  step={1}
                  className="[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:bg-primary [&_[data-slot=slider-thumb]]:border-primary"
                  onValueChange={(v: number | number[]) => onRate(response.id, "tone", Array.isArray(v) ? v[0] : v)}
                />
                <span className="text-[12px] text-primary font-serif-italic min-w-[20px]">
                  {response.ratings.tone}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.5px] text-muted-foreground">
                Completeness
              </span>
              <div className="flex items-center gap-4 flex-1 max-w-[120px] ml-4">
                <Slider
                  value={[response.ratings.completeness]}
                  min={0}
                  max={10}
                  step={1}
                  className="[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:bg-primary [&_[data-slot=slider-thumb]]:border-primary"
                  onValueChange={(v: number | number[]) => onRate(response.id, "completeness", Array.isArray(v) ? v[0] : v)}
                />
                <span className="text-[12px] text-primary font-serif-italic min-w-[20px]">
                  {response.ratings.completeness}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-block px-3 py-1 border border-primary text-primary text-[10px] uppercase rounded-full tracking-widest">
                Evaluated
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
