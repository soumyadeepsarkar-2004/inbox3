import { Wallet, Send, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Connect Your Wallet",
    description:
      "Use Petra or Martian wallet to sign in. No passwords, no email, no accounts to create. Your wallet is your identity.",
    color: "#FF6B35",
  },
  {
    number: "02",
    icon: Send,
    title: "Start Messaging",
    description:
      "Send encrypted messages to any wallet address. Messages are stored on IPFS and their CIDs are recorded immutably on Aptos.",
    color: "#00D4FF",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Stay Private",
    description:
      "Every message is encrypted with NaCl Box before leaving your browser. Only the intended recipient can decrypt it. Zero-knowledge guaranteed.",
    color: "#4CAF50",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-hero-heading tracking-tight">
            Three steps to
            <br />
            <span className="text-gradient-orange">sovereign messaging</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="flex flex-col items-center text-center">
                {/* Step number + icon */}
                <div className="relative mb-8">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center liquid-glass transition-transform duration-300 group-hover:scale-110"
                  >
                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                  </div>
                  <span
                    className="absolute -top-3 -right-3 text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `${step.color}20`,
                      color: step.color,
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="text-foreground font-semibold text-xl mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
