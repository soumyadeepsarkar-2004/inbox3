import {
  Shield,
  Lock,
  Zap,
  Globe,
  MessageSquare,
  Video,
  FileText,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "Messages encrypted with TweetNaCl Box (X25519-XSalsa20-Poly1305). Only you and the recipient can read them.",
    color: "#FF6B35",
  },
  {
    icon: Shield,
    title: "Blockchain Storage",
    description:
      "All message CIDs recorded on Aptos — immutable, censorship-resistant, and fully transparent.",
    color: "#00D4FF",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built on Aptos with sub-second finality. Real-time message delivery with configurable auto-refresh.",
    color: "#4CAF50",
  },
  {
    icon: Globe,
    title: "IPFS Storage",
    description:
      "Message bodies stored on IPFS via Pinata. Content-addressed by CID for decentralized persistence.",
    color: "#65C2CB",
  },
  {
    icon: MessageSquare,
    title: "Rich Messaging",
    description:
      "Reactions, threading, GIFs, stickers, voice messages, file attachments, and markdown support.",
    color: "#ECA63E",
  },
  {
    icon: Video,
    title: "Voice & Video Calls",
    description:
      "Peer-to-peer WebRTC calls routed through a minimal signaling relay. No media ever touches a server.",
    color: "#FF5F5F",
  },
  {
    icon: FileText,
    title: "IPFS File Uploads",
    description:
      "Share images, documents, and files up to 10MB. Everything stored permanently on IPFS.",
    color: "#5F8AFA",
  },
  {
    icon: Users,
    title: "Group Chats",
    description:
      "Create and join unlimited group conversations. All on-chain, all encrypted, all decentralized.",
    color: "#A855F7",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">
            Features
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-hero-heading tracking-tight">
            Everything you need for
            <br />
            <span className="text-gradient-orange">decentralized messaging</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto">
            A fully-featured messaging app where your wallet is your identity and no central server ever sees your messages.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="liquid-glass rounded-2xl p-6 group hover:bg-white/[0.03] transition-all duration-300 cursor-default"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `${feature.color}15`,
                  color: feature.color,
                }}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-foreground font-semibold text-base mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
