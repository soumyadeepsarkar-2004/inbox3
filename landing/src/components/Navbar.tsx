import { ChevronDown, Lock, Users, FileText, Zap, BookOpen, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoSrc from "@/assets/logo.png";

const features = [
  { icon: Lock, title: "E2E Encryption", desc: "Private locally" },
  { icon: Users, title: "Group Chats", desc: "Unlimited size" },
  { icon: FileText, title: "File Sharing", desc: "IPFS backed" },
  { icon: Zap, title: "Real-time", desc: "Instant sync" },
];

const learning = [
  { icon: BookOpen, title: "Guides", href: "https://github.com/tumansutradhar/inbox-3/tree/main/docs" },
  { icon: Shield, title: "Security", href: "/#security" },
  { icon: Globe, title: "Protocol", href: "/#protocol" },
];

export function Navbar() {
  return (
    <nav className="w-full py-5 px-5 sm:px-8 flex flex-row items-center justify-between gap-4">
      <a
        href="/"
        aria-label="Inbox3"
        className="shrink-0 flex items-center gap-3 transition-opacity hover:opacity-80"
      >
        <span className="h-8 w-8 overflow-hidden shrink-0">
          <img src={logoSrc} alt="" className="h-8 max-w-none" />
        </span>
        <span className="text-base font-semibold text-foreground/90">
          Inbox3
        </span>
      </a>

      <div className="hidden md:flex items-center gap-1">
        {/* Features Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-base text-foreground/90 transition-colors hover:bg-white/5 hover:text-foreground outline-none">
            Features
            <ChevronDown className="h-4 w-4 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Product Features</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {features.map((f) => (
              <DropdownMenuItem key={f.title} className="gap-3">
                <f.icon className="h-4 w-4 text-blue-400" />
                <div className="flex flex-col">
                  <span>{f.title}</span>
                  <span className="text-[10px] text-white/40">{f.desc}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <a href="#security" className="px-3 py-2 text-base text-foreground/90 hover:text-foreground hover:bg-white/5 rounded-full transition-colors">
          Security
        </a>

        <a href="#protocol" className="px-3 py-2 text-base text-foreground/90 hover:text-foreground hover:bg-white/5 rounded-full transition-colors">
          Protocol
        </a>

        {/* Learning Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-base text-foreground/90 transition-colors hover:bg-white/5 hover:text-foreground outline-none">
            Learning
            <ChevronDown className="h-4 w-4 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Resources</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {learning.map((l) => (
              <a href={l.href} key={l.title}>
                <DropdownMenuItem className="gap-3">
                  <l.icon className="h-4 w-4 text-orange-400" />
                  <span>{l.title}</span>
                </DropdownMenuItem>
              </a>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="shrink-0">
        <a href="/app">
          <Button
            variant="heroSecondary"
            size="sm"
            className="h-auto rounded-full px-3 py-2 text-sm sm:px-4 sm:text-base border border-white/10"
          >
            Launch App
          </Button>
        </a>
      </div>
    </nav>
  );
}



