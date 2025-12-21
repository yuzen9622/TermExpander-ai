import { GithubIcon } from "lucide-react";

import { Button } from "@/shared/shadcn/components/ui/button";

export default function TermExpanderFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-4 border-t pt-3 text-center text-xs text-muted-foreground">
      <div className="flex flex-col items-center gap-1.5">
        <p className="leading-snug">如果你覺得好用，歡迎到 GitHub 給個 Star</p>

        <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
          <a
            href="https://github.com/yuzen9622/TermExpander-ai"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="前往 GitHub：TermExpander-AI"
            className="inline-flex items-center gap-1"
          >
            <GithubIcon size={16} />
            TermExpander-AI
          </a>
        </Button>

        <p className="leading-snug">由 Yuzen 製作</p>
        <p className="leading-snug">
          Powered by React, Tailwind CSS, and shadcn/ui.
        </p>
        <p className="leading-snug">Copyright © {year} Yuzen</p>
      </div>
    </footer>
  );
}
