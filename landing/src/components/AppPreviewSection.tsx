import chatsMockup from "@/assets/chats-mockup.png";

export function AppPreviewSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">
            Preview
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-hero-heading tracking-tight">
            A familiar interface,
            <br />
            <span className="text-gradient-orange">unfamiliar power</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto">
            All the messaging features you love — reactions, threading, voice messages, GIFs — built on a fully decentralized stack.
          </p>
        </div>

        {/* App Screenshot */}
        <div className="relative mx-auto max-w-5xl">
          {/* Glow behind the image */}
          <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-[60px] scale-95" />

          {/* Image container */}
          <div className="relative liquid-glass rounded-2xl p-2 md:p-3 glow-orange">
            <img
              src={chatsMockup}
              alt="Inbox3 — Decentralized messaging app showing wallet connect, chat list, and secure conversations"
              className="w-full rounded-xl shadow-2xl"
            />
          </div>

          {/* Floating badges */}
          <div className="absolute -top-4 -left-4 md:-top-6 md:-left-8 liquid-glass rounded-xl px-4 py-2 animate-float">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-foreground/80">E2E Encrypted</span>
            </div>
          </div>

          <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-8 liquid-glass rounded-xl px-4 py-2 animate-float" style={{ animationDelay: "2s" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-medium text-foreground/80">On-Chain Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
