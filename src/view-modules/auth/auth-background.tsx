
"use client";

/**
 * AuthBackground - Responsibility: Renders the decorative background effect for the authentication pages.
 */
export function AuthBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none opacity-[0.04] animate-in fade-in duration-1000">
      <span className="absolute top-[10%] left-[10%] text-[15rem]">🐢</span>
      <span className="absolute bottom-[10%] right-[10%] text-[12rem]">🐢</span>
      <span className="absolute top-[40%] left-[25%] text-9xl -rotate-12">🐢</span>
      <span className="absolute bottom-[20%] left-[45%] text-8xl rotate-45">🐢</span>
    </div>
  );
}
