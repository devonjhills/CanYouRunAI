"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ui/toggle";

export const Header = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <nav className="max-w-6xl mx-auto flex items-center px-6 py-4">
        {/* Logo - takes up 1/4 of space */}
        <div className="w-1/4">
          <Link href="/" className="flex items-center gap-2 neo-hover text-foreground">
            <Image
              src="/logo.png"
              alt="CanYouRunAI Logo"
              width={50}
              height={50}
              priority
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="font-bold text-lg hidden sm:inline">CanYouRunAI</span>
          </Link>
        </div>

        {/* Navigation - centered, takes up 1/2 of space */}
        <div className="flex-1 flex justify-center gap-8">
          <button 
            onClick={() => scrollToSection("system-requirements")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
          >
            System Check
          </button>
          
          <button 
            onClick={() => scrollToSection("advanced-analysis")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
          >
            Advanced Analysis
          </button>
          
          <button 
            onClick={() => scrollToSection("model-requirements")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
          >
            Model Requirements
          </button>
        </div>

        {/* Theme toggle - takes up 1/4 of space */}
        <div className="w-1/4 flex justify-end">
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
};
