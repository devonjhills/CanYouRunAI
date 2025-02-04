import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ui/toggle";

export const Header = () => {
  return (
    <header className="neo-brutalist-box bg-background p-4 mb-8">
      <nav className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="neo-hover text-foreground">
          <Image
            src="/logo.png"
            alt="CanYouRunAI Logo"
            width={50}
            height={50}
            priority
          />
        </Link>
        <div className="space-x-6">
          <Link href="/about" className="neo-hover font-bold text-foreground">
            About
          </Link>
          <Link href="/blog" className="neo-hover font-bold text-foreground">
            Blog
          </Link>
          <Link href="/contact" className="neo-hover font-bold text-foreground">
            Contact
          </Link>
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
};
