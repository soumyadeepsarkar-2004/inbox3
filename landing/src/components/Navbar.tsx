import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoSrc from "@/assets/logo.png";

const navItems = [
  { label: "Features", hasDropdown: true },
  { label: "Security", hasDropdown: false },
  { label: "Protocol", hasDropdown: false },
  { label: "Learning", hasDropdown: true },
];

export function Navbar() {
  return (
    <nav className="w-full py-5 px-5 sm:px-8 flex flex-row items-center justify-between gap-4">
      <a
        href="https://inbox3-aptos.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Inbox3"
        className="shrink-0 flex items-center gap-3"
      >
        <span className="h-8 w-8 overflow-hidden shrink-0">
          <img src={logoSrc} alt="" className="h-8 max-w-none" />
        </span>
        <span className="text-base font-semibold text-foreground/90">
          Inbox3
        </span>
      </a>

      <div className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.label}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-base text-foreground/90 transition-colors hover:bg-white/5 hover:text-foreground"
          >
            {item.label}
            {item.hasDropdown && (
              <ChevronDown className="h-4 w-4 opacity-70" />
            )}
          </button>
        ))}
      </div>

      <div className="shrink-0">
        <a href="https://inbox3-aptos.vercel.app" target="_blank" rel="noopener noreferrer">
          <Button
            variant="heroSecondary"
            size="sm"
            className="h-auto rounded-full px-3 py-2 text-sm sm:px-4 sm:text-base"
          >
            <span className="hidden sm:inline">Launch App</span>
            <span className="sm:hidden">Open</span>
          </Button>
        </a>
      </div>
    </nav>
  );
}
