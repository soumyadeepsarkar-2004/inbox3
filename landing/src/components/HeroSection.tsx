import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-background relative overflow-hidden">
      <Navbar />
      <div className="mt-[3px] w-full h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

      <div className="relative z-10 flex flex-col items-center pt-20 px-4">
        <h1
          className="max-w-[calc(100vw-2rem)] text-[clamp(4.5rem,18vw,230px)] font-normal leading-[1.02] tracking-[-0.024em] bg-clip-text text-transparent select-none"
          style={{
            fontFamily: "'General Sans', 'Geist Sans', sans-serif",
            backgroundImage:
              "linear-gradient(223deg, #E8E8E9 0%, #3A7BBF 104.15%)",
          }}
        >
          Inbox3
        </h1>

        <p className="text-hero-sub text-center text-lg leading-8 max-w-[calc(100vw-2rem)] sm:max-w-md mt-4 opacity-80">
          Secure messaging that lives on Aptos
          <br />
          with IPFS storage and wallet identity
        </p>

        <div className="mt-8 mb-[66px]">
          <a
            href="/app"
          >
            <Button
              variant="heroSecondary"
              className="h-auto px-[29px] py-[24px]"
            >
              Open Inbox
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
