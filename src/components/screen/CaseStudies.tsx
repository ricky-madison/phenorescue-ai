import type { ScreenResult } from "@/lib/screen-engine";

/**
 * Retrospective validation: where do known p53 reactivators land in the
 * full ranked library? A working screen should recover them near the top
 * and push the negative control (simvastatin) down.
 */
export function CaseStudies({ result }: { result: ScreenResult }) {
  const total = result.compounds.length;
  const refs = result.compounds
    .map((c, i) => ({ c, rank: i + 1 }))
    .filter((r) => r.c.source === "reference");

  if (!refs.length) {
    return (
      <p className="text-xs text-muted-foreground">
        Enable “Include known p53 reactivators” to run retrospective validation.
      </p>
    );
  }

  const topDecile = refs.filter((r) => r.rank <= Math.ceil(total * 0.1)).length;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {topDecile}/{refs.length} known reactivators recovered in the top decile of{" "}
        {total} ranked molecules for {result.variant.id}.
      </p>
      <div className="max-h-56 overflow-auto">
        <table className="w-full text-xs">
          <thead className="label-mono sticky top-0 bg-surface-2 text-left">
            <tr>
              <th className="px-2 py-1">compound</th>
              <th className="px-2 py-1 text-right">rank</th>
              <th className="px-2 py-1 text-right">percentile</th>
              <th className="px-2 py-1 text-right">rescue</th>
            </tr>
          </thead>
          <tbody>
            {refs.map(({ c, rank }) => {
              const pct = Math.round((1 - rank / total) * 100);
              return (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-2 py-1 text-foreground">{c.name}</td>
                  <td className="px-2 py-1 text-right font-mono">{rank}</td>
                  <td
                    className={`px-2 py-1 text-right font-mono ${
                      pct >= 90 ? "text-primary" : pct < 40 ? "text-destructive" : ""
                    }`}
                  >
                    {pct}
                  </td>
                  <td className="px-2 py-1 text-right font-mono">{c.rescueScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
