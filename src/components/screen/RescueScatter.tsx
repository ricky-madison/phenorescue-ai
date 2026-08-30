import type { ScoredCompound } from "@/lib/screen-engine";

/**
 * Structure-vs-phenotype scatter: binding energy (x) against predicted
 * probability of phenotypic rescue (y). This is "Figure 2" of the screen —
 * it shows compounds that only physics likes vs. compounds with both
 * structural and phenotypic evidence.
 */
export function RescueScatter({
  compounds,
  selectedId,
  onSelect,
}: {
  compounds: ScoredCompound[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const points = compounds.slice(0, 400);
  const energies = points.map((c) => c.docking.bindingEnergy);
  const minE = Math.min(...energies, -14);
  const maxE = Math.max(...energies, 0);
  const W = 520;
  const H = 260;
  const pad = { l: 42, r: 12, t: 12, b: 30 };

  const x = (e: number) =>
    pad.l + ((e - minE) / (maxE - minE || 1)) * (W - pad.l - pad.r);
  const y = (p: number) => pad.t + (1 - p) * (H - pad.t - pad.b);

  const color = (c: ScoredCompound) =>
    c.source === "reference"
      ? "var(--color-signal)"
      : c.source === "molmim"
        ? "var(--color-accent)"
        : "var(--color-primary)";

  return (
    <div className="rounded-md border border-border grid-bg">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Scatter plot of docking binding energy versus predicted phenotypic rescue probability"
      >
        {/* quadrant guide: p(rescue) 0.5 */}
        <line
          x1={pad.l}
          x2={W - pad.r}
          y1={y(0.5)}
          y2={y(0.5)}
          stroke="var(--grid)"
          strokeDasharray="4 4"
        />
        <line
          x1={x(-8)}
          x2={x(-8)}
          y1={pad.t}
          y2={H - pad.b}
          stroke="var(--grid)"
          strokeDasharray="4 4"
        />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text
            key={t}
            x={pad.l - 6}
            y={y(t) + 3}
            textAnchor="end"
            className="fill-[var(--color-muted-foreground)]"
            fontSize="8"
          >
            {t.toFixed(2)}
          </text>
        ))}
        {[minE, (minE + maxE) / 2, maxE].map((e) => (
          <text
            key={e}
            x={x(e)}
            y={H - pad.b + 14}
            textAnchor="middle"
            className="fill-[var(--color-muted-foreground)]"
            fontSize="8"
          >
            {e.toFixed(1)}
          </text>
        ))}
        <text
          x={(W + pad.l) / 2}
          y={H - 4}
          textAnchor="middle"
          className="fill-[var(--color-muted-foreground)]"
          fontSize="8"
        >
          docking ΔG (kcal/mol) →
        </text>

        {points.map((c) => {
          const isSel = c.id === selectedId;
          return (
            <circle
              key={c.id}
              cx={x(c.docking.bindingEnergy)}
              cy={y(c.phenotype.phenotypicScore)}
              r={isSel ? 6 : c.source === "reference" ? 4.5 : 3}
              fill={color(c)}
              opacity={isSel ? 1 : 0.62}
              stroke={isSel ? "var(--color-foreground)" : "none"}
              strokeWidth={isSel ? 1.5 : 0}
              className="cursor-pointer"
              onClick={() => onSelect(c.id)}
            >
              <title>
                {c.name} · ΔG {c.docking.bindingEnergy} · p(rescue){" "}
                {c.phenotype.phenotypicScore}
              </title>
            </circle>
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-surface-2/60 px-3 py-2 text-xs text-muted-foreground">
        <span className="label-mono">p(rescue) ↑</span>
        <span className="text-signal">● reference</span>
        <span className="text-primary">● GenMol</span>
        <span className="text-accent">● MolMIM</span>
        <span>upper-left quadrant = dual structural + phenotypic evidence</span>
      </div>
    </div>
  );
}
