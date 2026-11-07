import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const RAYS = 21;
const CENTER = 100;
const INNER = 50;
const OUTER = 94;
const HALF_WIDTH = (Math.PI / RAYS) * 0.42;

function point(radius: number, angle: number): string {
  const x = CENTER + radius * Math.cos(angle);
  const y = CENTER + radius * Math.sin(angle);
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

function rayPoints(index: number): string {
  const angle = (index / RAYS) * 2 * Math.PI - Math.PI / 2;
  return [
    point(INNER, angle - HALF_WIDTH),
    point(OUTER, angle),
    point(INNER, angle + HALF_WIDTH),
  ].join(" ");
}

type SunMarkProps = {
  className?: string;
  lit?: boolean;
};

export function SunMark({ className, lit = false }: SunMarkProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className, lit && "lit")} aria-hidden="true">
      {Array.from({ length: RAYS }, (_, i) => (
        <polygon
          key={i}
          className="ray"
          style={{ "--i": i } as CSSProperties}
          points={rayPoints(i)}
        />
      ))}
      <circle cx="100" cy="100" r="42" fill="#ffc933" />
    </svg>
  );
}
