
"use client";

/**
 * AuthBackground - Responsibility: Renders the decorative background effect for the authentication pages.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none opacity-[0.04] duration-1000 animate-in fade-in">
      <span className="absolute left-[10%] top-[10%] text-[15rem]">🐢</span>
      <span className="absolute bottom-[10%] right-[10%] text-[12rem]">🐢</span>
      <span className="absolute left-1/4 top-[40%] -rotate-12 text-9xl">🐢</span>
      <span className="absolute bottom-[20%] left-[45%] rotate-45 text-8xl">🐢</span>
    </div>
  );
}
