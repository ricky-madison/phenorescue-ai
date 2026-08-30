import { useMemo } from "react";

import type { ScreenResult } from "@/lib/screen-engine";

/** Lightweight pLDDT ribbon rendering of the mutant DNA-binding domain. */
export function StructureViewer({ result }: { result: ScreenResult }) {
  const { residues } = result.structure;

  const path = useMemo(() => {
    const w = 520;
    const h = 150;
    return residues
      .map((r, i) => {
        const x = (i / (residues.length - 1)) * w;
        const y =
          h / 2 +
          Math.sin(i * 0.42) * 34 * (0.4 + r.plddt * 0.8) +
          Math.cos(i * 0.13) * 16;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [residues]);

  return (
    <div className="relative overflow-hidden rounded-md border border-border grid-bg">
      <svg viewBox="0 0 520 150" className="h-44 w-full" role="img" aria-label="Predicted mutant p53 DNA-binding domain ribbon coloured by pLDDT">
        <path d={path} fill="none" stroke="var(--grid)" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
        {residues.map((r, i) => {
          const x = (i / (residues.length - 1)) * 520;
          const y =
            75 + Math.sin(i * 0.42) * 34 * (0.4 + r.plddt * 0.8) + Math.cos(i * 0.13) * 16;
          const color =
            r.plddt > 0.8
              ? "var(--color-primary)"
              : r.plddt > 0.6
                ? "var(--color-signal)"
                : r.plddt > 0.45
                  ? "var(--color-accent)"
                  : "var(--color-destructive)";
          return (
            <circle
              key={r.position}
              cx={x}
              cy={y}
              r={r.mutated ? 6 : 2.6}
              fill={r.mutated ? "var(--color-destructive)" : color}
              opacity={r.mutated ? 1 : 0.9}
            />
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-surface-2/60 px-3 py-2 text-xs text-muted-foreground">
        <span className="label-mono">{result.structure.source}</span>
        <span>mean pLDDT {result.structure.plddt}</span>
        <span>ΔTm {result.structure.deltaTm} °C</span>
        <span>pocket {result.structure.pocketVolume} Å³</span>
        <span className="text-destructive">● mutated site {result.variant.id}</span>
      </div>
    </div>
  );
}
