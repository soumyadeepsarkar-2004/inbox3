import logoSrc from "@/assets/logo.png";

const footerLinks = {
  Product: ["Features", "Security", "Roadmap", "Changelog"],
  Resources: ["Documentation", "GitHub", "Troubleshooting", "API Reference"],
  Community: ["Discord", "Twitter", "Telegram", "Contributing"],
  Legal: ["MIT License", "Privacy", "Terms"],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 pt-16 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <img src={logoSrc} alt="Inbox3" className="h-8 mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Decentralized messaging on Aptos. Open source, end-to-end encrypted, and censorship-resistant.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-foreground font-semibold text-sm mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Inbox3. Open source under MIT License.
          </p>
          <p className="text-muted-foreground text-sm">
            Built with ❤️ for the decentralized future
          </p>
        </div>
      </div>
    </footer>
  );
}
