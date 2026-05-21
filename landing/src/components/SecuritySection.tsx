import { ShieldCheck, Server, Key, Eye } from "lucide-react";

const securityPoints = [
  {
    icon: Key,
    title: "Wallet-Based Authentication",
    description: "No passwords. No email. No accounts. Your Aptos wallet IS your identity. Sign transactions, not forms.",
  },
  {
    icon: ShieldCheck,
    title: "NaCl Box Encryption",
    description: "Every message is encrypted with X25519-XSalsa20-Poly1305 before leaving your browser. Military-grade cryptography.",
  },
  {
    icon: Server,
    title: "No Central Server",
    description: "Message path: your wallet → Aptos chain → IPFS. The signaling server only handles call setup — never message content.",
  },
  {
    icon: Eye,
    title: "Zero Knowledge",
    description: "We can't read your messages. Nobody can. The encryption keys never leave your device. True privacy by design.",
  },
];

export function SecuritySection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">
            Security
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-hero-heading tracking-tight">
            Privacy is not a feature.
            <br />
            <span className="text-gradient-orange">It's the architecture.</span>
          </h2>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {securityPoints.map((point) => (
            <div
              key={point.title}
              className="liquid-glass rounded-2xl p-8 group hover:bg-white/[0.03] transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <point.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg mb-2">
                    {point.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
