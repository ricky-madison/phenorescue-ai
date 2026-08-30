// Curated reference data for the multi-scale TP53 phenotypic screen.
// Sources mirrored from public datasets (NCI TP53 DB, DepMap, JUMP Cell Painting).

export type Tp53Class = "DNA-contact" | "Structural" | "Nonsense" | "Wild-type";

export interface Tp53Variant {
  id: string; // e.g. R175H
  aaChange: string;
  domain: string;
  class: Tp53Class;
  functionalImpact: "non-functional" | "partially functional" | "functional";
  hotspotFrequency: number; // % of TP53-mutant tumours (NCI TP53 DB, approx.)
  ceresMedian: number; // median DepMap TP53 CERES score in matching cell lines
  notes: string;
}

export const TP53_VARIANTS: Tp53Variant[] = [
  {
    id: "R175H",
    aaChange: "p.Arg175His",
    domain: "DNA-binding core (L2 loop)",
    class: "Structural",
    functionalImpact: "non-functional",
    hotspotFrequency: 5.6,
    ceresMedian: 0.31,
    notes: "Zinc-region destabilising hotspot; classic APR-246 / stabiliser target.",
  },
  {
    id: "R248Q",
    aaChange: "p.Arg248Gln",
    domain: "DNA-binding core (L3 loop)",
    class: "DNA-contact",
    functionalImpact: "non-functional",
    hotspotFrequency: 6.1,
    ceresMedian: 0.24,
    notes: "Minor-groove DNA contact loss with retained global fold.",
  },
  {
    id: "R273H",
    aaChange: "p.Arg273His",
    domain: "DNA-binding core (S10 strand)",
    class: "DNA-contact",
    functionalImpact: "non-functional",
    hotspotFrequency: 5.9,
    ceresMedian: 0.19,
    notes: "Direct DNA-contact mutant; pocket largely intact, druggable cleft nearby.",
  },
  {
    id: "R282W",
    aaChange: "p.Arg282Trp",
    domain: "DNA-binding core (H2 helix)",
    class: "Structural",
    functionalImpact: "non-functional",
    hotspotFrequency: 3.2,
    ceresMedian: 0.36,
    notes: "Helix-destabilising; strong thermal rescue window.",
  },
  {
    id: "Y220C",
    aaChange: "p.Tyr220Cys",
    domain: "DNA-binding core (beta-sandwich)",
    class: "Structural",
    functionalImpact: "non-functional",
    hotspotFrequency: 1.8,
    ceresMedian: 0.42,
    notes: "Creates a unique surface crevice — canonical structure-based rescue pocket.",
  },
  {
    id: "G245S",
    aaChange: "p.Gly245Ser",
    domain: "DNA-binding core (L3 loop)",
    class: "Structural",
    functionalImpact: "non-functional",
    hotspotFrequency: 2.9,
    ceresMedian: 0.28,
    notes: "Loop-L3 distortion with partial zinc coordination loss.",
  },
  {
    id: "R249S",
    aaChange: "p.Arg249Ser",
    domain: "DNA-binding core (L3 loop)",
    class: "Structural",
    functionalImpact: "non-functional",
    hotspotFrequency: 2.4,
    ceresMedian: 0.22,
    notes: "Aflatoxin-associated hotspot; hepatocellular enrichment.",
  },
  {
    id: "R213*",
    aaChange: "p.Arg213Ter",
    domain: "DNA-binding core (truncating)",
    class: "Nonsense",
    functionalImpact: "non-functional",
    hotspotFrequency: 1.5,
    ceresMedian: -0.02,
    notes: "Null allele — no protein to stabilise; expect low structural tractability.",
  },
  {
    id: "WT",
    aaChange: "p.= (reference)",
    domain: "Full-length TP53",
    class: "Wild-type",
    functionalImpact: "functional",
    hotspotFrequency: 0,
    ceresMedian: -0.41,
    notes: "Reference control: MDM2-axis compounds dominate rescue ranking.",
  },
];

export interface RefCompound {
  name: string;
  smiles: string;
  mechanism: string;
  known: boolean;
  /** Bias term encoding literature-reported p53 reactivation potency. */
  literaturePrior: number;
  /** Variant classes this chemotype is reported to favour. */
  favors: Tp53Class[];
}

export const REFERENCE_LIBRARY: RefCompound[] = [
  {
    name: "Nutlin-3a",
    smiles:
      "COc1ccc(cc1OC(C)C)C1=NC(c2ccc(Cl)cc2)C(c2ccc(Cl)cc2)N1C(=O)N1CCNCC1",
    mechanism: "MDM2–p53 interface inhibitor",
    known: true,
    literaturePrior: 0.62,
    favors: ["Wild-type"],
  },
  {
    name: "APR-246 (eprenetapopt)",
    smiles: "OCC1(CO)CC(=O)N(C)C1=O",
    mechanism: "Prodrug of MQ; cysteine-adduct mutant p53 refolding",
    known: true,
    literaturePrior: 0.78,
    favors: ["Structural", "DNA-contact"],
  },
  {
    name: "PK7088",
    smiles: "Cc1cc(C)n(-c2ccc(C#N)cc2)n1",
    mechanism: "Y220C crevice binder, thermal stabiliser",
    known: true,
    literaturePrior: 0.71,
    favors: ["Structural"],
  },
  {
    name: "PhiKan083",
    smiles: "CC(C)(C)c1ccc2[nH]c(CN3CCCC3)cc2c1",
    mechanism: "Y220C carbazole stabiliser",
    known: true,
    literaturePrior: 0.66,
    favors: ["Structural"],
  },
  {
    name: "ZMC1",
    smiles: "Cc1ccc(cc1)C(=NNC(=S)N)c1cccnc1",
    mechanism: "Zinc metallochaperone, restores Zn2+ to R175H",
    known: true,
    literaturePrior: 0.74,
    favors: ["Structural"],
  },
  {
    name: "COTI-2",
    smiles: "Cc1cccnc1C(=NNc1nccs1)c1ccncc1",
    mechanism: "Thiosemicarbazone, mutant p53 conformational rescue",
    known: true,
    literaturePrior: 0.69,
    favors: ["Structural", "DNA-contact"],
  },
  {
    name: "RITA",
    smiles: "OCc1ccc(cc1)-c1ccc(s1)-c1ccc(CO)s1",
    mechanism: "p53–MDM2 dissociation via p53 N-terminus binding",
    known: true,
    literaturePrior: 0.55,
    favors: ["Wild-type", "DNA-contact"],
  },
  {
    name: "Idasanutlin (RG7388)",
    smiles: "COc1ccc(cc1C(=O)O)N1C(=O)C(C)(C)C1c1ccc(Cl)cc1F",
    mechanism: "Second-generation MDM2 antagonist",
    known: true,
    literaturePrior: 0.6,
    favors: ["Wild-type"],
  },
  {
    name: "CP-31398",
    smiles: "CCCN(CCC)CCCNc1ccc2ccccc2n1",
    mechanism: "DNA-binding-domain stabiliser, styrylquinazoline",
    known: true,
    literaturePrior: 0.52,
    favors: ["DNA-contact", "Structural"],
  },
  {
    name: "Arsenic trioxide",
    smiles: "O=[As]O[As]=O",
    mechanism: "Cys binding at the p53 structural pocket",
    known: true,
    literaturePrior: 0.48,
    favors: ["Structural"],
  },
  {
    name: "Chetomin",
    smiles: "CN1C(=O)C2(SSC3(N2C)C(=O)N(C)C3=O)Cc1ccccc1",
    mechanism: "HSP40-mediated mutant p53 refolding",
    known: true,
    literaturePrior: 0.44,
    favors: ["Structural"],
  },
  {
    name: "Statin control (simvastatin)",
    smiles: "CCC(C)(C)C(=O)OC1CC(C)C=C2C=CC(C)C(CCC3CC(O)CC(=O)O3)C12",
    mechanism: "Mevalonate pathway — negative control chemotype",
    known: true,
    literaturePrior: 0.14,
    favors: [],
  },
];

/** JUMP Cell Painting feature channels used for the morphological readout. */
export const CELL_PAINTING_CHANNELS = [
  { key: "DNA", label: "DNA (Hoechst)", family: "Nuclear" },
  { key: "RNA", label: "RNA (SYTO 14)", family: "Nucleolar" },
  { key: "AGP", label: "Actin / Golgi / Plasma", family: "Cytoskeletal" },
  { key: "ER", label: "ER (concanavalin A)", family: "Secretory" },
  { key: "Mito", label: "Mitochondria (MitoTracker)", family: "Metabolic" },
] as const;

export const MORPHOLOGY_FEATURES = [
  { key: "nuclear_area", label: "Nuclear area", channel: "DNA" },
  { key: "nuclear_eccentricity", label: "Nuclear eccentricity", channel: "DNA" },
  { key: "dna_texture_entropy", label: "DNA texture entropy", channel: "DNA" },
  { key: "nucleolar_rna_intensity", label: "Nucleolar RNA intensity", channel: "RNA" },
  { key: "actin_radial_dist", label: "Actin radial distribution", channel: "AGP" },
  { key: "cell_roundness", label: "Cell roundness", channel: "AGP" },
  { key: "er_granularity", label: "ER granularity", channel: "ER" },
  { key: "mito_fragmentation", label: "Mitochondrial fragmentation", channel: "Mito" },
  { key: "mito_membrane_potential", label: "Mito membrane potential", channel: "Mito" },
  { key: "p21_proxy_texture", label: "p21-proxy chromatin texture", channel: "DNA" },
] as const;

export interface CellLineRow {
  cellLine: string;
  tissue: string;
  tp53Mutation: string;
  tp53Status: "WT" | "LOF" | "GOF" | "null";
  ceres: number;
  jumpPlates: number;
}

export const CELL_LINE_TABLE: CellLineRow[] = [
  { cellLine: "MDA-MB-468", tissue: "Breast", tp53Mutation: "R273H", tp53Status: "GOF", ceres: 0.18, jumpPlates: 6 },
  { cellLine: "SK-BR-3", tissue: "Breast", tp53Mutation: "R175H", tp53Status: "GOF", ceres: 0.29, jumpPlates: 4 },
  { cellLine: "HT-29", tissue: "Colorectal", tp53Mutation: "R273H", tp53Status: "GOF", ceres: 0.21, jumpPlates: 8 },
  { cellLine: "SW480", tissue: "Colorectal", tp53Mutation: "R273H/P309S", tp53Status: "GOF", ceres: 0.16, jumpPlates: 5 },
  { cellLine: "NUGC-3", tissue: "Gastric", tp53Mutation: "Y220C", tp53Status: "LOF", ceres: 0.4, jumpPlates: 3 },
  { cellLine: "HUH-7", tissue: "Liver", tp53Mutation: "Y220C", tp53Status: "LOF", ceres: 0.38, jumpPlates: 4 },
  { cellLine: "PLC/PRF/5", tissue: "Liver", tp53Mutation: "R249S", tp53Status: "LOF", ceres: 0.23, jumpPlates: 3 },
  { cellLine: "OVCAR-3", tissue: "Ovary", tp53Mutation: "R248Q", tp53Status: "GOF", ceres: 0.26, jumpPlates: 7 },
  { cellLine: "MIA PaCa-2", tissue: "Pancreas", tp53Mutation: "R248W", tp53Status: "GOF", ceres: 0.25, jumpPlates: 6 },
  { cellLine: "NCI-H1299", tissue: "Lung", tp53Mutation: "TP53-null", tp53Status: "null", ceres: -0.03, jumpPlates: 9 },
  { cellLine: "A549", tissue: "Lung", tp53Mutation: "WT", tp53Status: "WT", ceres: -0.44, jumpPlates: 11 },
  { cellLine: "MCF7", tissue: "Breast", tp53Mutation: "WT", tp53Status: "WT", ceres: -0.39, jumpPlates: 12 },
  { cellLine: "HCT116", tissue: "Colorectal", tp53Mutation: "WT", tp53Status: "WT", ceres: -0.47, jumpPlates: 10 },
  { cellLine: "U-2 OS", tissue: "Bone", tp53Mutation: "WT", tp53Status: "WT", ceres: -0.36, jumpPlates: 8 },
];

/** SAFE-style fragment vocabulary used for de-novo generation. */
export const FRAGMENTS = {
  cores: [
    "c1ccc2[nH]ccc2c1",
    "c1ccc2c(c1)nc(N)s2",
    "c1cnc2[nH]cnc2c1",
    "O=C1NC(=O)c2ccccc21",
    "c1ccc(-c2nccs2)cc1",
    "C1CC2(CCN1)OCCO2",
    "c1ccc2oc(=O)ccc2c1",
    "c1ccc(-n2cnnc2)cc1",
  ],
  linkers: ["CC(=O)N", "CNC(=O)", "COC", "CSC", "C=C", "CC(F)(F)", "CN(C)C", "CC#C"],
  caps: [
    "N1CCOCC1",
    "N1CCNCC1",
    "C(=O)O",
    "S(=O)(=O)N",
    "c1ccncc1",
    "C(F)(F)F",
    "OC",
    "N",
    "C1CC1",
    "c1ccc(F)cc1",
  ],
} as const;
