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

export default function Home() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto bg-background text-foreground">
      <Card className="p-6 md:p-8 mb-12 space-y-6 bg-card text-card-foreground">
        <h1 className="text-4xl md:text-5xl font-black">
          Can I Run this LLM locally?
        </h1>
        <p className="text-lg md:text-2xl text-muted-foreground">
          CanYouRunAI analyzes your computer in just seconds, and it&apos;s
          FREE.
          <br />
          See for yourself—it takes less than a minute. Find out now if your
          computer can run any popular LLM model.
        </p>

        <div className="space-y-4">
          <Select>
            <SelectTrigger className="w-full p-4 text-lg border-input rounded-[--radius]">
              <SelectValue placeholder="Select an LLM from our list" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border rounded-[--radius]">
              <SelectItem value="llama3">Llama 3 8B</SelectItem>
              <SelectItem value="mistral7b">Mistral 7B</SelectItem>
              <SelectItem value="phi3">Phi-3</SelectItem>
            </SelectContent>
          </Select>

          <Button
            asChild
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-6 rounded-[--radius] text-lg">
            <a href="/CanYouRunAI.exe" download>
              Can you run it?
            </a>
          </Button>
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
