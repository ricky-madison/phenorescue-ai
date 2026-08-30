import type { ScoredCompound } from "@/lib/screen-engine";

/** Predicted Cell Painting morphology shift of a "rescued" cell. */
export function MorphologyProfile({ compound }: { compound: ScoredCompound }) {
  return (
    <div className="space-y-2">
      {compound.phenotype.morphology.map((m) => {
        const pct = Math.min(100, Math.abs(m.delta) * 33);
        const positive = m.delta >= 0;
        return (
          <div key={m.key} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-xs text-foreground">{m.label}</span>
                <span className="label-mono">{m.channel}</span>
              </div>
              <div className="relative mt-1 h-2 rounded-full bg-surface-2">
                <div className="absolute left-1/2 top-0 h-2 w-px bg-border" />
                <div
                  className={`absolute top-0 h-2 rounded-full ${positive ? "bg-primary" : "bg-accent"}`}
                  style={{
                    width: `${pct / 2}%`,
                    left: positive ? "50%" : `${50 - pct / 2}%`,
                  }}
                />
              </div>
            </div>
            <span className="w-14 text-right font-mono text-xs text-muted-foreground">
              {m.delta > 0 ? "+" : ""}
              {m.delta}σ
            </span>
          </div>
        );
      })}
      <p className="pt-1 text-xs text-muted-foreground">
        Z-scored shift toward the TP53-WT reference centroid (JUMP-CP consensus profile).
        Mahalanobis distance to WT centroid: {compound.phenotype.profileDistance}.
      </p>
    </div>
  );
}
