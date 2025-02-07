import { Card } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions about Running AI Models Locally",
  description:
    "Find answers to common questions about running LLMs locally, hardware requirements, and system compatibility for AI models.",
  openGraph: {
    title: "AI Model Compatibility FAQ | CanYouRunAI.com",
    description:
      "Get answers about running AI models locally and system requirements",
  },
};

export default function FAQ() {
  return (
    <div className="min-h-screen py-16 px-6">
      <Card className="max-w-4xl mx-auto p-8 prose prose-sm md:prose-base lg:prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary">
        <h1>Frequently Asked Questions</h1>

        <h2>General Questions</h2>

        <h3>What is CanYouRunAI.com?</h3>
        <p>
          CanYouRunAI.com is a free tool that helps you determine if your
          computer has the necessary hardware requirements to run Large Language
          Models (LLMs) locally. We analyze your system specifications and
          compare them against the requirements of various AI models.
        </p>

        <h3>How does the system check work?</h3>
        <p>
          When you click &quot;Can You Run This AI?&quot;, our tool downloads a
          small executable that scans your system specifications, including:
        </p>
        <ul>
          <li>CPU model and specifications</li>
          <li>RAM (system memory) capacity</li>
          <li>GPU (graphics card) model</li>
          <li>VRAM (video memory) capacity</li>
          <li>Available storage space</li>
        </ul>
        <p>
          This information is then compared against the requirements of your
          selected AI model to determine compatibility.
        </p>

        <h2>Model Requirements</h2>

        <h3>What models can I check against?</h3>
        <p>We offer compatibility checking for popular LLMs including:</p>
        <ul>
          <li>Llama 2 (7B, 13B, and 70B variants)</li>
          <li>Mixtral 8x7B</li>
          <li>Phi-4</li>
          <li>Gemma 2</li>
          <li>And many more!</li>
        </ul>

        <h3>What are the typical hardware requirements?</h3>
        <p>
          Hardware requirements vary significantly between models. As a general
          guide:
        </p>
        <ul>
          <li>Entry-level models (7B parameters): 16GB RAM, 6GB VRAM</li>
          <li>Mid-range models (13B parameters): 32GB RAM, 8GB VRAM</li>
          <li>High-end models (70B parameters): 64GB RAM, 16GB+ VRAM</li>
        </ul>

        <h2>Advanced Analysis</h2>

        <h3>What is the Advanced Model Analysis feature?</h3>
        <p>
          Our Advanced Analysis feature allows you to check any model from
          Hugging Face against your system specifications. It provides detailed
          information about:
        </p>
        <ul>
          <li>Memory requirements for different quantization levels</li>
          <li>Estimated performance metrics</li>
          <li>Compatibility with your hardware</li>
          <li>Potential optimization strategies</li>
        </ul>

        <h3>What is quantization?</h3>
        <p>
          Quantization is a technique that reduces the precision of the
          model&apos;s weights to decrease memory usage and improve inference
          speed, often with minimal impact on performance. Our advanced analysis
          shows various quantization options (4-bit, 8-bit, etc.) and their
          memory requirements.
        </p>

        <h2>Technical Support</h2>

        <h3>Is my data safe?</h3>
        <p>
          Yes. We only collect system specifications necessary for the analysis.
          This information is not stored permanently and is only used to provide
          you with accurate compatibility results. You can review our Privacy
          Policy for more details.
        </p>

        <h3>The system check isn&apos;t working. What should I do?</h3>
        <p>Common troubleshooting steps:</p>
        <ul>
          <li>
            Ensure your antivirus isn&apos;t blocking the system check
            executable
          </li>
          <li>Try running the check with administrator privileges</li>
          <li>Clear your browser cache and cookies</li>
          <li>Try a different browser</li>
        </ul>

        <h3>How accurate are the results?</h3>
        <p>
          Our system requirements are based on real-world testing and
          manufacturer recommendations. However, actual performance may vary
          based on factors like:
        </p>
        <ul>
          <li>Other running applications</li>
          <li>System optimization</li>
          <li>Specific model configurations</li>
          <li>Quantization settings</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          Still have questions? We&apos;re here to help! Contact us at{" "}
          <a href="mailto:support@canyourunai.com">support@canyourunai.com</a>
        </p>
      </Card>
    </div>
  );
}
