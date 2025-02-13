import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-background p-4 mt-8 border border-border">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4 text-foreground">
            CanYouRunAI.com
          </h3>
          <p className="text-sm text-muted-foreground">
            Your trusted source for checking AI model compatibility with your
            system.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-foreground">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/faq"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-foreground">Connect</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://github.com/devonjhills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="mailto:support@canyourunai.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Email Support
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} CanYouRunAI.com. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
