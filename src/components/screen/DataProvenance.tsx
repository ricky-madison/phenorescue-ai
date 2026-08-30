const SOURCES = [
  {
    name: "NCI / IARC TP53 database",
    use: "variant annotation, domain, functional impact",
    href: "https://tp53.cancer.gov/",
  },
  {
    name: "DepMap CRISPR gene effect (CERES)",
    use: "TP53 dependency per cell line",
    href: "https://depmap.org/portal/download/all/",
  },
  {
    name: "JUMP Cell Painting Gallery",
    use: "morphological profiles → rescue classifier",
    href: "https://registry.opendata.aws/cellpainting-gallery/",
  },
  {
    name: "NVIDIA BioNeMo NIMs (GenMol · MolMIM · DiffDock)",
    use: "generation, property steering, pose prediction",
    href: "https://build.nvidia.com/",
  },
];

/** Provenance of every layer in the pipeline. */
export function DataProvenance() {
  return (
    <ul className="space-y-2 text-xs">
      {SOURCES.map((s) => (
        <li key={s.name} className="panel-2 p-2">
          <a
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline-offset-2 hover:underline"
          >
            {s.name}
          </a>
          <div className="text-muted-foreground">{s.use}</div>
        </li>
      ))}
    </ul>
  );
}
