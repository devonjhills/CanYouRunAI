"use client";

import { SystemRequirements } from "./components/SystemRequirements";
import { SystemChecker } from "./components/SystemChecker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { llmModels } from "@/app/data/llm-models";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LLMModel } from "@/app/data/llm-models";

export default function Home() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [selectedModel, setSelectedModel] = useState<LLMModel | undefined>();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  useEffect(() => {
    if (sessionId) {
      // Fetch system info when session ID is present
      fetch(`/api/system-check?session=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSystemInfo(data.systemInfo);
          }
        })
        .catch(console.error);
    }
  }, [sessionId]);

  const handleModelSelect = (modelId: string) => {
    const model = llmModels.find(m => m.id === modelId);
    setSelectedModel(model);
  };

  const WINDOWS_EXE_URL =
    "https://github.com/devonjhills/CanYouRunAI/releases/download/v1.0.0/CanYouRunAI.exe";
    
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <Card className="neo-card max-w-4xl mx-auto mb-12 p-8 md:p-12">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              Can I Run this LLM <span className="text-primary">locally?</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Analyze your computer in seconds. <span className="font-bold text-foreground">100% Free.</span>
            </p>
            
            {/* Action Steps */}
            <div className="mt-12 space-y-8">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    1
                  </span>
                  <h2 className="text-xl font-bold">Select your LLM</h2>
                </div>
                <Select onValueChange={handleModelSelect}>
                  <SelectTrigger className="neo-input w-full p-4 text-lg">
                    <SelectValue placeholder="Choose a model from our list" />
                  </SelectTrigger>
                  <SelectContent className="neo-brutalist-shadow bg-popover border-2 border-foreground">
                    {llmModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    2
                  </span>
                  <h2 className="text-xl font-bold">Check your system</h2>
                </div>
                <Button asChild className="neo-button w-full text-lg py-6">
                  <a href={WINDOWS_EXE_URL} download>
                    Download System Checker
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Results Section */}
      <section className="bg-muted/30 py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* System Info */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center mb-8">
              System Requirements Check
            </h2>
            <SystemChecker 
              systemInfo={systemInfo} 
              selectedModel={selectedModel}
            />
          </div>

          {/* Model Requirements */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center mb-8">
              All LLM Requirements
            </h2>
            <SystemRequirements />
          </div>
        </div>
      </section>
    </div>
  );
}
