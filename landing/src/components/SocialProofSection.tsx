import { useEffect, useRef } from "react";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4";

const logos = ["Aptos", "IPFS", "Pinata", "Petra", "Martian", "WebRTC"];
const marqueeLogos = [...logos, ...logos];

function LogoItem({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="liquid-glass w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold text-foreground">
        {name[0]}
      </div>
      <span className="text-base font-semibold text-foreground whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export function SocialProofSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let resetTimer: number | undefined;

    const fadeLoop = () => {
      const { currentTime, duration } = video;

      if (Number.isFinite(duration) && duration > 0) {
        const fadeDuration = 0.5;
        const fadeOutStart = Math.max(duration - fadeDuration, 0);

        if (currentTime < fadeDuration) {
          video.style.opacity = String(Math.min(currentTime / fadeDuration, 1));
        } else if (currentTime > fadeOutStart) {
          const remaining = Math.max(duration - currentTime, 0);
          video.style.opacity = String(Math.min(remaining / fadeDuration, 1));
        } else {
          video.style.opacity = "1";
        }
      }

      rafRef.current = requestAnimationFrame(fadeLoop);
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      resetTimer = window.setTimeout(() => {
        video.currentTime = 0;
        void video.play().catch(() => undefined);
      }, 100);
    };

    video.addEventListener("ended", handleEnded);
    rafRef.current = requestAnimationFrame(fadeLoop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0 }}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative z-10 flex flex-col items-center pt-16 pb-24 px-4 gap-20">
        <div className="h-40" />

        <div className="max-w-5xl w-full flex flex-col sm:flex-row sm:items-center gap-10 sm:gap-12">
          <div className="text-foreground/50 text-sm whitespace-nowrap shrink-0">
            Relied on by builders
            <br />
            across Web3
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex gap-16 animate-marquee w-max">
              {marqueeLogos.map((name, index) => (
                <LogoItem key={`${name}-${index}`} name={name} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
