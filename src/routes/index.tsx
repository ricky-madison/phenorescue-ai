import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Atom,
  Beaker,
  Download,
  FlaskConical,
  Microscope,
  Play,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MorphologyProfile } from "@/components/screen/MorphologyProfile";
import { StructureViewer } from "@/components/screen/StructureViewer";
import { RescueScatter } from "@/components/screen/RescueScatter";
import { CaseStudies } from "@/components/screen/CaseStudies";
import { DataProvenance } from "@/components/screen/DataProvenance";
import { TP53_VARIANTS } from "@/lib/screen-data";
import type { ScoredCompound, ScreenResult } from "@/lib/screen-engine";
import { runScreen } from "@/lib/screen.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PhenoRescue AI | p53 Rescue Screening" },
      {
        name: "description",
        content:
          "Screen TP53 mutations with a multi-scale AI pipeline: physics-based docking, generative chemistry and Cell Painting phenotypic rescue scoring in one dashboard.",
      },
      { property: "og:title", content: "PhenoRescue AI" },
      {
        property: "og:description",
        content:
          "Rank compounds for TP53 rescue by combining structural docking with predicted Cell Painting morphology.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const SOURCE_LABEL: Record<ScoredCompound["source"], string> = {
  reference: "Reference",
  genmol: "GenMol",
  molmim: "MolMIM",
};

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="panel-2 p-3">
      <div className="label-mono">{label}</div>
      <div className="mt-1 font-mono text-xl text-foreground">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function Dashboard() {
  const screenFn = useServerFn(runScreen);
  const [mutation, setMutation] = useState("R175H");
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(60);
  const [alpha, setAlpha] = useState(0.45);
  const [includeReference, setIncludeReference] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<"all" | ScoredCompound["source"]>("all");

  const screen = useMutation({
    mutationFn: (vars: { mutation: string }) =>
      screenFn({
        data: {
          mutation: vars.mutation,
          generateCount: count,
          alpha,
          beta: Number((1 - alpha).toFixed(2)),
          includeReference,
        },
      }) as Promise<ScreenResult>,
    onSuccess: (data) => setSelectedId(data.compounds[0]?.id ?? null),
  });

  // Kick off the default screen once on mount.
  useEffect(() => {
    screen.mutate({ mutation: "R175H" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = screen.data;
  const compounds = useMemo(() => {
    if (!result) return [];
    const list =
      sourceFilter === "all"
        ? result.compounds
        : result.compounds.filter((c) => c.source === sourceFilter);
    return list.filter(
      (c) =>
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.mechanism.toLowerCase().includes(query.toLowerCase()),
    );
  }, [result, sourceFilter, query]);

  const selected =
    result?.compounds.find((c) => c.id === selectedId) ?? compounds[0] ?? null;

  const download = (content: string, type: string, ext: string) => {
    if (!result) return;
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `p53-screen-${result.variant.id}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () =>
    download(JSON.stringify(result, null, 2), "application/json", "json");

  const exportCsv = () => {
    if (!result) return;
    const head = [
      "rank",
      "name",
      "source",
      "mechanism",
      "smiles",
      "binding_energy_kcal_mol",
      "diffdock_confidence",
      "p_rescue",
      "ceres_shift",
      "qed",
      "sa_score",
      "novelty",
      "rescue_score",
    ];
    const rows = result.compounds.map((c, i) =>
      [
        i + 1,
        c.name,
        c.source,
        c.mechanism,
        c.smiles,
        c.docking.bindingEnergy,
        c.docking.diffdockConfidence,
        c.phenotype.phenotypicScore,
        c.phenotype.ceresShift,
        c.props.qed,
        c.synthAccessibility,
        c.novelty,
        c.rescueScore,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    download([head.join(","), ...rows].join("\n"), "text/csv", "csv");
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Atom className="size-5 text-primary" />
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                PhenoRescue AI
              </h1>
              <p className="label-mono">structural × phenotypic × generative</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary">
              no auth · single dashboard
            </Badge>
            <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!result}>
              <Download className="size-4" /> CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={exportJson} disabled={!result}>
              <Download className="size-4" /> Export JSON
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-4 px-5 py-5 lg:grid-cols-[300px_1fr]">
        {/* ---------------------------- control column --------------------------- */}
        <aside className="space-y-4">
          <section className="panel p-4">
            <h2 className="label-mono">1 · TP53 variant</h2>
            <div className="mt-3 space-y-1.5">
              {TP53_VARIANTS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setMutation(v.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                    mutation === v.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-2 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-foreground">{v.id}</span>
                    <span className="text-[10px] text-muted-foreground">{v.class}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    CERES {v.ceresMedian} · {v.hotspotFrequency}% of tumours
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="panel space-y-4 p-4">
            <h2 className="label-mono">2 · pipeline parameters</h2>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Generated molecules</span>
                <span className="font-mono text-foreground">{count}</span>
              </div>
              <Slider
                className="mt-2"
                min={12}
                max={300}
                step={12}
                value={[count]}
                onValueChange={(v) => setCount(v[0] ?? 60)}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Score weighting α (structural)</span>
                <span className="font-mono text-foreground">
                  α {alpha.toFixed(2)} / β {(1 - alpha).toFixed(2)}
                </span>
              </div>
              <Slider
                className="mt-2"
                min={0}
                max={1}
                step={0.05}
                value={[alpha]}
                onValueChange={(v) => setAlpha(v[0] ?? 0.45)}
              />
            </div>
            <label className="flex items-center justify-between text-xs text-muted-foreground">
              Include known p53 reactivators
              <Switch checked={includeReference} onCheckedChange={setIncludeReference} />
            </label>
            <Button
              className="w-full"
              onClick={() => screen.mutate({ mutation })}
              disabled={screen.isPending}
            >
              {screen.isPending ? (
                <>
                  <Activity className="size-4 animate-pulse" /> Running agent…
                </>
              ) : (
                <>
                  <Play className="size-4" /> Run full screen
                </>
              )}
            </Button>
          </section>

          <section className="panel p-4">
            <h2 className="label-mono">agent workflow</h2>
            <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
              {[
                "Resolve variant annotation (NCI TP53 DB)",
                "Fold mutant DBD (ESMFold / AlphaFold)",
                "Generate scaffolds (GenMol · SAFE diffusion)",
                "Steer properties (MolMIM latent walk)",
                "Predict pose (DiffDock) + physics rescoring",
                "Phenotypic classifier (JUMP Cell Painting)",
                "Rank by Phenotypic Rescue Score",
              ].map((s, i) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-0.5 font-mono text-primary">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>

        {/* ----------------------------- results column -------------------------- */}
        <div className="space-y-4">
          {result ? (
            <>
              <section className="panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                      <Microscope className="size-4 text-primary" />
                      TP53 {result.variant.id} · {result.variant.aaChange}
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
                      {result.variant.domain} — {result.variant.notes}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{result.variant.functionalImpact}</Badge>
                    <Badge variant="outline">{result.stats.runtimeMs} ms</Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <Metric label="top rescue score" value={String(result.stats.topRescue)} hint="0–100 combined" />
                  <Metric label="median rescue" value={String(result.stats.medianRescue)} />
                  <Metric label="molecules docked" value={String(result.stats.docked)} hint={`${result.stats.generated} de-novo`} />
                  <Metric
                    label="phenotype pass"
                    value={String(result.stats.passedPhenotype)}
                    hint="p(rescue) ≥ 0.50"
                  />
                  <Metric label="pocket tractability" value={result.structure.tractability.toFixed(2)} />
                </div>
                <div className="mt-4">
                  <StructureViewer result={result} />
                </div>
              </section>

              <section className="panel">
                <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FlaskConical className="size-4 text-primary" /> Ranked compound shortlist
                  </h2>
                  <div className="ml-auto flex items-center gap-2">
                    <Input
                      placeholder="Filter compounds…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-8 w-44"
                    />
                    {(["all", "reference", "genmol", "molmim"] as const).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={sourceFilter === s ? "default" : "secondary"}
                        onClick={() => setSourceFilter(s)}
                      >
                        {s === "all" ? "All" : SOURCE_LABEL[s]}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="max-h-[420px] overflow-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-surface-2 text-left">
                      <tr className="label-mono">
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">compound</th>
                        <th className="px-4 py-2">source</th>
                        <th className="px-4 py-2 text-right">ΔG kcal/mol</th>
                        <th className="px-4 py-2 text-right">diffdock</th>
                        <th className="px-4 py-2 text-right">p(rescue)</th>
                        <th className="px-4 py-2 text-right">QED</th>
                        <th className="px-4 py-2 text-right">rescue score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compounds.slice(0, 80).map((c, i) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedId(c.id)}
                          className={`cursor-pointer border-t border-border/70 transition-colors hover:bg-surface-2 ${
                            selected?.id === c.id ? "bg-primary/10" : ""
                          }`}
                        >
                          <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{i + 1}</td>
                          <td className="max-w-[260px] px-4 py-2">
                            <div className="truncate text-foreground">{c.name}</div>
                            <div className="truncate text-[11px] text-muted-foreground">{c.mechanism}</div>
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={c.source === "reference" ? "secondary" : "outline"}
                              className={c.source === "reference" ? "" : "border-primary/40 text-primary"}
                            >
                              {SOURCE_LABEL[c.source]}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-xs">{c.docking.bindingEnergy}</td>
                          <td className="px-4 py-2 text-right font-mono text-xs">{c.docking.diffdockConfidence}</td>
                          <td className="px-4 py-2 text-right font-mono text-xs">{c.phenotype.phenotypicScore}</td>
                          <td className="px-4 py-2 text-right font-mono text-xs">{c.props.qed}</td>
                          <td className="px-4 py-2 text-right">
                            <span className="font-mono text-sm text-primary">{c.rescueScore}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid gap-4 xl:grid-cols-2">
                <section className="panel p-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="size-4 text-accent" /> Selected candidate
                  </h2>
                  {selected ? (
                    <Tabs defaultValue="pheno" className="mt-3">
                      <TabsList>
                        <TabsTrigger value="pheno">Phenotype</TabsTrigger>
                        <TabsTrigger value="struct">Structure</TabsTrigger>
                        <TabsTrigger value="chem">Chemistry</TabsTrigger>
                        <TabsTrigger value="trace">Agent trace</TabsTrigger>
                      </TabsList>
                      <TabsContent value="pheno" className="mt-3">
                        <div className="mb-3 grid grid-cols-3 gap-2">
                          <Metric label="p(rescue)" value={String(selected.phenotype.phenotypicScore)} />
                          <Metric label="Δ CERES" value={String(selected.phenotype.ceresShift)} />
                          <Metric label="viability" value={String(selected.phenotype.viabilityIndex)} />
                        </div>
                        <MorphologyProfile compound={selected} />
                      </TabsContent>
                      <TabsContent value="struct" className="mt-3 space-y-2 text-sm">
                        {[
                          ["Lennard-Jones", selected.docking.lennardJones],
                          ["Coulomb", selected.docking.coulomb],
                          ["H-bond", selected.docking.hBond],
                          ["Desolvation penalty", selected.docking.desolvation],
                          ["Total binding energy", selected.docking.bindingEnergy],
                          ["Pocket occupancy", selected.docking.pocketOccupancy],
                          ["DiffDock confidence", selected.docking.diffdockConfidence],
                        ].map(([k, v]) => (
                          <div key={String(k)} className="flex justify-between border-b border-border/60 pb-1">
                            <span className="text-muted-foreground">{k}</span>
                            <span className="font-mono text-foreground">{v}</span>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="chem" className="mt-3 space-y-2 text-sm">
                        <div className="panel-2 break-all p-3 font-mono text-xs text-primary">
                          {selected.smiles}
                        </div>
                        {[
                          ["MW", selected.props.mw],
                          ["cLogP", selected.props.logP],
                          ["TPSA", selected.props.tpsa],
                          ["HBD / HBA", `${selected.props.hbd} / ${selected.props.hba}`],
                          ["Rings", selected.props.rings],
                          ["QED", selected.props.qed],
                          ["Synthetic accessibility", selected.synthAccessibility],
                          ["Novelty (1 - max Tanimoto)", selected.novelty],
                        ].map(([k, v]) => (
                          <div key={String(k)} className="flex justify-between border-b border-border/60 pb-1">
                            <span className="text-muted-foreground">{k}</span>
                            <span className="font-mono text-foreground">{String(v)}</span>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="trace" className="mt-3">
                        <ol className="space-y-2 text-xs text-muted-foreground">
                          {selected.agentTrace.map((t, i) => (
                            <li key={t} className="panel-2 p-2">
                              <span className="font-mono text-primary">step {i + 1}</span> — {t}
                            </li>
                          ))}
                        </ol>
                      </TabsContent>
                    </Tabs>
                  ) : null}
                </section>

                <div className="space-y-4">
                  <section className="panel p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <TrendingUp className="size-4 text-primary" /> Structure × phenotype landscape
                    </h2>
                    <div className="mt-3">
                      <RescueScatter
                        compounds={result.compounds}
                        selectedId={selected?.id ?? null}
                        onSelect={setSelectedId}
                      />
                    </div>
                  </section>

                  <section className="panel p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Microscope className="size-4 text-signal" /> Case studies · known reactivator recovery
                    </h2>
                    <div className="mt-3">
                      <CaseStudies result={result} />
                    </div>
                  </section>

                  <section className="panel p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <TrendingUp className="size-4 text-signal" /> Benchmark (retrospective, known reactivators)
                    </h2>
                    <div className="mt-3 space-y-2">
                      {result.benchmark.map((b) => (
                        <div key={b.model}>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{b.model}</span>
                            <span className="font-mono text-foreground">
                              AUROC {b.auroc} · {b.enrichment}× EF
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-surface-2">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: `${(b.auroc - 0.4) * 160}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="panel p-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Beaker className="size-4 text-accent" /> Cell Painting feature importance
                    </h2>
                    <div className="mt-3 space-y-1.5">
                      {result.featureImportance.slice(0, 7).map((f) => (
                        <div key={f.label} className="flex items-center gap-2 text-xs">
                          <span className="w-48 truncate text-muted-foreground">{f.label}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-surface-2">
                            <div
                              className="h-1.5 rounded-full bg-accent"
                              style={{ width: `${f.importance * 400}%` }}
                            />
                          </div>
                          <span className="w-10 text-right font-mono">{f.importance}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="panel p-4">
                    <h2 className="label-mono">DepMap cohort used for training</h2>
                    <div className="mt-2 max-h-56 overflow-auto">
                      <table className="w-full text-xs">
                        <thead className="label-mono text-left">
                          <tr>
                            <th className="py-1">cell line</th>
                            <th className="py-1">tissue</th>
                            <th className="py-1">TP53</th>
                            <th className="py-1 text-right">CERES</th>
                            <th className="py-1 text-right">plates</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.cohort.map((c) => (
                            <tr key={c.cellLine} className="border-t border-border/60">
                              <td className="py-1 text-foreground">{c.cellLine}</td>
                              <td className="py-1 text-muted-foreground">{c.tissue}</td>
                              <td className="py-1 font-mono text-muted-foreground">
                                {c.tp53Mutation} ({c.tp53Status})
                              </td>
                              <td className="py-1 text-right font-mono">{c.ceres}</td>
                              <td className="py-1 text-right font-mono">{c.jumpPlates}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="panel p-4">
                    <h2 className="label-mono">data provenance</h2>
                    <div className="mt-3">
                      <DataProvenance />
                    </div>
                  </section>
                </div>
              </div>

              <p className="pb-6 text-xs text-muted-foreground">
                Scores come from reproducible in-app surrogate models of the described pipeline
                (physics docking terms, SAFE-fragment generation, and a Cell Painting → TP53
                dependency mapping). Swap each stage for live NVIDIA NIM endpoints (GenMol,
                MolMIM, DiffDock) and real JUMP-CP / DepMap tables to move from MVP to production.
              </p>
            </>
          ) : (
            <section className="panel grid h-64 place-items-center text-sm text-muted-foreground">
              {screen.isPending ? "Running multi-scale screen…" : "Select a variant and run the screen."}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
