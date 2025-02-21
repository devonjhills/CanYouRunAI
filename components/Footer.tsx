export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="main-container section-padding">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} CanYouRunAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="focus-ring hover:text-primary">
              Privacy
            </a>
            <a href="/terms" className="focus-ring hover:text-primary">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
