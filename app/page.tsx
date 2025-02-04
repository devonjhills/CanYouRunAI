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

export default function Home() {
  const WINDOWS_EXE_URL =
    "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v1.0.0/system-checker.exe";
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto bg-background text-foreground">
      <Card className="neo-card mb-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black">
            Can I Run this LLM locally?
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground max-w-4xl">
            CanYouRunAI analyzes your computer in just seconds, and it&apos;s{" "}
            <b>FREE.</b>
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Find out instantly if your computer meets the requirements to run
            any popular Large Language Model locally. No more guessing about
            RAM, VRAM, or CPU requirements.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg md:text-xl font-bold text-foreground">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                1
              </span>
              Select your LLM
            </div>
            <Select>
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

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg md:text-xl font-bold text-foreground">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                2
              </span>
              Check your system
            </div>
            <Button asChild className="neo-button w-full text-lg">
              <a href={WINDOWS_EXE_URL} download>
                Can you run it?
              </a>
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            Your System
          </h2>
          <SystemChecker />
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            Model Requirements
          </h2>
          <SystemRequirements />
        </div>
      </div>
    </div>
  );
}
