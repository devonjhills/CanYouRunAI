import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-[hsl(var(--background))] p-4 mt-8 border border-[hsl(var(--border))]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4 text-[hsl(var(--foreground))]">
            CanYouRunAI.com
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Your trusted source for checking AI model compatibility with your
            system.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-[hsl(var(--foreground))]">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/faq"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-[hsl(var(--foreground))]">
            Connect
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://github.com/devonjhills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="mailto:support@canyourunai.com"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                Email Support
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-[hsl(var(--border))] text-center text-sm text-[hsl(var(--muted-foreground))]">
        <p>
          © {new Date().getFullYear()} CanYouRunAI.com. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
