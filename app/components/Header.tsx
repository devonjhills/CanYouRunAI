"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ui/toggle";

export const Header = () => {
  return (
    <header className="glass border-b border-border top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80 text-foreground"
        >
          <Image
            src="/logo.png"
            alt="CanYouRunAI Logo"
            width={50}
            height={50}
            priority
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <span className="font-bold text-lg hidden sm:inline">
            can you run ai?
          </span>
        </Link>

        {/* Right-aligned navigation and theme toggle */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
          >
            Home
          </Link>
          <Link
            href="/glossary"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
          >
            Glossary
          </Link>
          <a
            href="mailto:support@canyourunai.com"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
          >
            Contact
          </a>
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
};
