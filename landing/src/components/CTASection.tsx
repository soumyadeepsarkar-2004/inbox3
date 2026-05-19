import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-2 text-sm text-foreground/80 mb-8">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Live on Aptos Testnet</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-hero-heading tracking-tight mb-6">
          Ready to own your
          <br />
          <span className="text-gradient-orange">conversations?</span>
        </h2>

        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
          Join the decentralized messaging revolution. Connect your wallet, create your inbox, and start messaging on the blockchain.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="https://inbox3-aptos.vercel.app" target="_blank" rel="noopener noreferrer">
            <Button variant="hero" className="px-10 py-7 text-lg gap-2 group">
              Launch Inbox3
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
          <a href="https://github.com/tumansutradhar/inbox-3" target="_blank" rel="noopener noreferrer">
            <Button variant="heroSecondary" className="px-10 py-7 text-lg">
              Star on GitHub
            </Button>
          </a>
        </div>

        {/* Tech stack badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
          {["React 19", "TypeScript", "Aptos SDK", "IPFS", "TweetNaCl", "WebRTC"].map(
            (tech) => (
              <span
                key={tech}
                className="text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full border border-border/50"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
