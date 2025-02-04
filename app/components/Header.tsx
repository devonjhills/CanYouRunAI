import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ModeToggle } from '@/components/ui/toggle';

export const Header = () => {
  return (
    <header className="neo-brutalist-box bg-[hsl(var(--background))] p-4 mb-8 border border-[hsl(var(--border))]">
      <nav className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors">
          <Image
            src="/logo.png"
            alt="CanYouRunAI Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="h-10 w-auto"
            style={{ objectFit: 'contain' }}
          /> 
        </Link>
        <div className="space-x-6">
          <Link href="/about" className="font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors">
            About
          </Link>
          <Link href="/blog" className="font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors">
            Blog
          </Link>
          <Link href="/contact" className="font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors">
            Contact
          </Link>
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
};