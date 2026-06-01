import { useState, useMemo, useCallback, useRef } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
    navy: "#18374B", navyMid: "#3B5464", steel: "#61859D", teal: "#8CCFCF",
    iceLight: "#D5E6EE", iceMid: "#B8CCD4", white: "#F6FCFF", surface: "#FFFFFF",
    border: "#D5E6EE", textPrimary: "#18374B", textSecond: "#3B5464",
    textMuted: "#61859D", textFaint: "#8CAABB",
    green: "#658385", fair: "#C4956A", critical: "#B07070", tealDark: "#4DA8A8",
};
const T = { display: "'Georgia',serif", body: "'Trebuchet MS','Segoe UI',sans-serif", mono: "'Courier New',monospace" };

// ─── Health systems (body systems only) ──────────────────────────────────────
const SYSTEMS = [
    {
        id: "bfvh", name: "Blood Flow & Vessel Health", short: "BFVH",
        processes: {
            "Blood Clotting Control": ["Alpha-2-antiplasmin", "Antithrombin-III", "Beta-2-glycoprotein 1", "Carboxypeptidase B2", "Heparin cofactor 2", "Histidine-rich glycoprotein", "Kininogen-1"],
            "Blood Vessel Lining Health": ["Asymmetric dimethylarginine", "Cadherin-5", "Kallistatin"],
            "Cell Membrane Lipids": ["Hydroxysphingomyelin C14:1", "Sphingomyelin C16:0", "Sphingomyelin C20:2"],
            "Circulation Support": ["Angiotensinogen", "Phosphatidylinositol-glycan-specific phospholipase D", "Plasma serine protease inhibitor", "Tetranectin"],
            "Fat & Cholesterol Transport": ["Apolipoprotein A-I", "Apolipoprotein A-II", "Apolipoprotein A-IV", "Apolipoprotein B-100", "Apolipoprotein C-I", "Apolipoprotein C-II", "Apolipoprotein C-III", "Apolipoprotein C-IV", "Apolipoprotein D", "Apolipoprotein E", "Apolipoprotein L1", "Apolipoprotein M", "Phospholipid transfer protein", "Zinc-alpha-2-glycoprotein"],
            "Kidney Filtration": ["Beta-2-microglobulin", "Creatinine", "Cystatin-C", "Uric acid"],
            "Oxygen Transport": ["Carbonic anhydrase 1", "Hemoglobin subunit alpha 1"],
            "Vitamin & Mineral Transport": ["Afamin", "Retinol-binding protein 4", "Serotransferrin", "Serum albumin", "Transthyretin", "Vitamin D-binding protein"],
        },
    },
    {
        id: "cdd", name: "Cell Defence & Detox", short: "CDD",
        processes: {
            "Blood Cleaning & Recycling": ["Glutathione peroxidase 3", "Haptoglobin", "Hemopexin", "Peroxiredoxin-2"],
            "Cell Protection & Detox": ["Beta-Ala-His dipeptidase", "Ceruloplasmin", "Cholinesterase", "Methionine-Sulfoxide", "Nitro-Tyrosine", "Serum paraoxonase/arylesterase 1"],
            "Dietary & Environmental Exposures": ["Cotinine", "Proline-Betaine"],
            "Enzyme Control": ["Alpha-1-antichymotrypsin", "Alpha-1-antitrypsin", "Carboxypeptidase N catalytic chain", "Carboxypeptidase N subunit 2", "Inter-alpha-trypsin inhibitor heavy chain H1", "Inter-alpha-trypsin inhibitor heavy chain H2", "Inter-alpha-trypsin inhibitor heavy chain H4", "Protein AMBP"],
        },
    },
    {
        id: "dgh", name: "Digestion & Gut Health", short: "DGH",
        processes: {
            "Digestive Enzymes": ["Biotinidase", "Xaa-Pro dipeptidase"],
            "Gut Bacteria Activity": ["Benzoic acid", "Hippuric acid", "Hydroxyphenylacetic acid", "Indole acetic acid", "Para-hydroxyhippuric acid", "Trigonelline", "Trimethylamine N-oxide"],
            "Gut Lining Health": ["Citrulline"],
            "Short-Chain Fatty Acid Production": ["Butyric acid", "Isobutyric acid", "Propionic acid"],
        },
    },
    {
        id: "em", name: "Energy & Metabolism", short: "EM",
        processes: {
            "Amino Acid Pool": ["Acetyl-Ornithine", "Alpha-amino-N-butyric acid", "alpha-Aminoadipic acid", "Arginine", "Asparagine", "Beta-alanine", "Carnosine", "cis-OH-Proline", "Glutamine", "Histidine", "Lysine", "Methylhistidine", "Ornithine", "Taurine", "trans-OH-Proline"],
            "Amino Acids Used for Energy": ["Creatine", "Isoleucine", "Leucine", "Methionine", "Phenylalanine", "Proline", "Serine", "Threonine", "Tyrosine", "Valine"],
            "Blood Sugar Control": ["Adipocyte plasma membrane-associated protein", "Alanine", "Aspartic acid", "Glucose", "Glutamic acid"],
            "Cell Growth and Renewal": ["Diacetylspermine", "Putrescine", "Spermidine", "Spermine"],
            "DNA & Gene Regulation": ["Betaine", "Choline", "Glycine", "Sarcosine"],
            "Fatty Acid Oxidation": ["beta-Hydroxybutyric acid", "Carnitine", "Hexadecanoylcarnitine", "Octadecadienylcarnitine", "Octadecanoylcarnitine"],
            "Methylation & B-Vitamin Status": ["Homocysteine", "Methylmalonic acid"],
            "Mitochondrial Energy": ["alpha-Ketoglutaric acid", "Citric acid", "Fumaric acid", "Lactic acid", "Pyruvic acid", "Succinic acid"],
            "Tryptophan Processing": ["Kynurenine", "Tryptophan"],
        },
    },
    {
        id: "hbf", name: "Hormone & Brain Function", short: "HBF",
        processes: {
            "Brain & Nerve Signals": ["5-Hydroxyindole-3-acetic acid", "DOPA", "Gamma-aminobutyric acid", "Histamine", "Homovanillic acid", "Phenylethylamine", "Serotonin", "Tyramine"],
            "Hormone Balance": ["Corticosteroid-binding globulin", "Insulin-like growth factor-binding protein 2", "Insulin-like growth factor-binding protein 3", "Insulin-like growth factor-binding protein complex acid labile subunit", "Pregnancy zone protein", "Sex hormone-binding globulin", "Thyroxine-binding globulin"],
        },
    },
    {
        id: "isi", name: "Immune System & Inflammation", short: "ISI",
        processes: {
            "Early Warning Response": ["Alpha-1B-glycoprotein", "Clusterin", "Lipopolysaccharide-binding protein", "Plasma protease C1 inhibitor"],
            "Germ Detection": ["Ficolin-2", "Ficolin-3", "Lysozyme C", "Mannan-binding lectin serine protease 2", "Mannose-binding protein C"],
            "Immune Activation": ["Complement C1q subcomponent subunit B", "Complement C1r subcomponent", "Complement C1r subcomponent-like protein", "Complement C1s subcomponent", "Complement C2", "Complement C3", "Complement C4-B", "Complement C5", "Complement component C6", "Complement component C7", "Complement component C8 alpha chain", "Complement component C8 beta chain", "Complement component C9", "Complement factor B", "Complement factor D", "Probable G-protein coupled receptor 116"],
            "Immune Cell Movement": ["Endothelial protein C receptor", "Plastin-2"],
            "Immune Cell Recruitment": ["Attractin", "CD44 antigen", "Galectin-3-binding protein", "Intercellular adhesion molecule 1", "L-selectin"],
            "Immune System Regulation": ["C4b-binding protein alpha chain", "CD5 antigen-like", "Complement factor H", "Complement factor I", "Ig mu chain C region", "IgGFc-binding protein", "Leucine-rich alpha-2-glycoprotein 1", "Protein S100-A9"],
            "Inflammation Response": ["Alpha-1-acid glycoprotein 1", "Alpha-2-macroglobulin", "C-reactive protein", "Serum amyloid A-1 protein", "Serum amyloid A-4 protein", "Serum amyloid P-component"],
        },
    },
    {
        id: "trh", name: "Tissue Repair & Healing", short: "TRH",
        processes: {
            "Clotting & Wound Healing": ["Coagulation factor IX", "Coagulation factor V", "Coagulation factor X", "Coagulation factor XI", "Coagulation factor XII", "Coagulation factor XIII A chain", "Coagulation factor XIII B chain", "Fibrinogen alpha chain", "Fibrinogen beta chain", "Fibrinogen gamma chain", "Plasminogen", "Protein Z-dependent protease inhibitor", "Prothrombin", "Thrombospondin-1", "Vitamin K-dependent protein S", "Vitamin K-dependent protein Z", "Vitronectin", "von Willebrand Factor"],
            "Tissue & Joint Health": ["Angiogenin", "Cartilage acidic protein 1", "Extracellular matrix protein 1", "Fibronectin", "Fibulin-1", "Gelsolin", "Lumican", "Proteoglycan 4", "Tenascin"],
            "Tissue Support Proteins": ["Alpha-2-HS-glycoprotein", "Fetuin-B", "Pigment epithelium-derived factor", "Vasorin"],
        },
    },
];

const ALIASES = {
    "Asymmetric dimethylarginine": "ADMA",
    "Hydroxysphingomyelin C14:1": "SM (OH) C14:1",
    "Sphingomyelin C16:0": "SM C16:0",
    "Sphingomyelin C20:2": "SM C20:2",
};

// ─── Scoring (mirrors workbench defaults, no manual weight overrides) ─────────
const GP = 0.05, CUTOFF = 0.5, RED_W = 4.0;

function calcZone(v, lo, hi) {
    const rng = hi - lo, gL = lo + GP * rng, gH = hi - GP * rng;
    const yL = lo - GP * rng, yH = hi + GP * rng;
    if (v >= gL && v <= gH) return "green";
    if (v >= yL && v <= yH) return "yellow";
    return "red";
}

function scoreBM(v, lo, hi) {
    const rng = hi - lo;
    if (rng <= 0) return null;
    const gL = lo + GP * rng, gH = hi - GP * rng, greenRng = gH - gL;
    if (v >= gL && v <= gH) return 100;
    const dist = v > gH ? (v - gH) / greenRng : (gL - v) / greenRng;
    const t = Math.max(0, Math.min(1, dist / CUTOFF));
    return Math.max(0, Math.min(100, 100 * (1 - t)));
}

function wavg(pairs) {
    const tw = pairs.reduce((s, [, w]) => s + w, 0);
    return tw ? pairs.reduce((s, [v, w]) => s + v * w, 0) / tw : null;
}

function computeSystemScore(sys, markers) {
    const procScores = Object.entries(sys.processes).map(([, bms]) => {
        const valid = bms
            .map(name => {
                const key = ALIASES[name] ?? name;
                const m = markers[key] ?? markers[name];
                if (!m) return null;
                const zone = calcZone(m.value, m.refLow, m.refHigh);
                const score = scoreBM(m.value, m.refLow, m.refHigh);
                const effW = zone === "red" ? RED_W : 0;
                return score != null ? { score, effW } : null;
            })
            .filter(Boolean);
        if (!valid.length) return null;
        const redOnes = valid.filter(b => b.effW > 0);
        return redOnes.length === 0 ? 100 : wavg(redOnes.map(b => [b.score, b.effW]));
    }).filter(s => s != null);

    if (!procScores.length) return null;
    return procScores.reduce((a, b) => a + b, 0) / procScores.length;
}

// ─── Biological age formula ───────────────────────────────────────────────────
// Asymmetric: penalty for below-median is felt quickly (exponent < 1),
// benefit for above-median is earned slowly (exponent > 1).
const MAX_DELTA = 20;

function computeBioAge(overall, age, median) {
    if (overall == null || age == null || median == null) return null;
    let delta;
    if (overall >= median) {
        const x = (overall - median) / Math.max(100 - median, 0.001);
        delta = -MAX_DELTA * Math.pow(x, 1.5);
    } else {
        const x = (median - overall) / Math.max(median, 0.001);
        delta = MAX_DELTA * Math.pow(x, 0.75);
    }
    return { bioAge: age + delta, delta };
}

// ─── CSV parsing (same format as scoring workbench) ───────────────────────────
function parseCSV(text) {
    const lines = [];
    let cur = "";
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code === 13) { lines.push(cur); cur = ""; if (text.charCodeAt(i + 1) === 10) i++; }
        else if (code === 10) { lines.push(cur); cur = ""; }
        else cur += text[i];
    }
    if (cur.trim()) lines.push(cur);
    const nonEmpty = lines.filter(l => l.trim());
    function parseLine(line) {
        const vals = []; let field = "", inQ = false;
        for (const c of line) {
            if (c === '"') inQ = !inQ;
            else if (c === "," && !inQ) { vals.push(field.trim()); field = ""; }
            else field += c;
        }
        vals.push(field.trim());
        return vals;
    }
    const headers = parseLine(nonEmpty[0]).map(h => h.replace(/^"|"$/g, "").trim().toLowerCase());
    return nonEmpty.slice(1).map(line => {
        const vals = parseLine(line);
        return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? "").replace(/^"|"$/g, "").trim()]));
    });
}

function buildClients(rows) {
    if (!rows.length) return {};
    const keys = Object.keys(rows[0]);
    function col(row, ...names) {
        for (const name of names) {
            const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");
            const k = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, "") === norm);
            if (k !== undefined) return (row[k] ?? "").trim();
        }
        return "";
    }
    const pts = {};
    for (const row of rows) {
        if (col(row, "is_reported").toLowerCase() !== "true") continue;
        const myId = col(row, "my_id", "myid");
        const barcode = col(row, "barcode");
        const testId = col(row, "test_id", "testid");
        const pid = (barcode || testId || myId).trim();
        if (!pid) continue;
        const label = myId && pid !== myId ? `${myId} — ${pid}` : pid;
        if (!pts[pid]) pts[pid] = { id: pid, label, markers: {} };
        const name = col(row, "measure_name", "measurename");
        const concRaw = col(row, "lab_concentration", "labconcentration");
        if (!name || !concRaw) continue;
        if (/blq|<|>|^nr$|^nd$/i.test(concRaw)) continue;
        const conc = parseFloat(concRaw);
        const lo = parseFloat(col(row, "lower_reference_range", "lowerreferencerange"));
        const hi = parseFloat(col(row, "upper_reference_range", "upperreferencerange"));
        if (!isNaN(conc) && !isNaN(lo) && !isNaN(hi))
            pts[pid].markers[name] = { value: conc, refLow: lo, refHigh: hi };
    }
    return pts;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function scoreColour(s) {
    if (s == null) return C.textFaint;
    const f = Math.floor(s);
    if (f >= 91) return C.tealDark;
    if (f >= 70) return C.fair;
    return C.critical;
}

function ScoreBar({ score, width = 60 }) {
    const col = scoreColour(score);
    return (
        <div style={{ width, height: 4, background: C.iceLight, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${score ?? 0}%`, background: col, borderRadius: 2, transition: "width 0.4s" }} />
        </div>
    );
}

function DeltaBadge({ delta }) {
    if (delta == null) return null;
    const older = delta > 0;
    const col = older ? C.critical : C.tealDark;
    const sign = older ? "+" : "";
    return (
        <span style={{
            display: "inline-block", padding: "2px 8px", borderRadius: 10,
            background: older ? "#FDF0EE" : "#EAF7F7",
            color: col, fontFamily: T.mono, fontWeight: 700, fontSize: 12,
            border: `1px solid ${older ? "#F0D0CC" : "#C0E8E8"}`,
        }}>
            {sign}{delta.toFixed(1)} yrs
        </span>
    );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFile }) {
    const [drag, setDrag] = useState(false);
    const inputRef = useRef();

    function handleDrop(e) {
        e.preventDefault(); setDrag(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
    }

    return (
        <div
            onClick={() => inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            style={{
                border: `2px dashed ${drag ? C.teal : C.iceMid}`,
                borderRadius: 12, padding: "48px 32px", textAlign: "center",
                cursor: "pointer", background: drag ? "#EAF7F7" : C.surface,
                transition: "all 0.2s", maxWidth: 480, margin: "0 auto",
            }}
        >
            <div style={{ fontSize: 32, marginBottom: 12 }}>⬆</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>
                Upload client CSV
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                Same format as the scoring workbench.<br />
                Columns: <code style={{ fontFamily: T.mono, fontSize: 11 }}>is_reported, my_id, barcode, measure_name, lab_concentration, lower_reference_range, upper_reference_range</code>
            </div>
            <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }}
                onChange={e => { const f = e.target.files[0]; if (f) onFile(f); }} />
        </div>
    );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
    const [clients, setClients] = useState(null);
    const [ages, setAges] = useState({});
    const [fileName, setFileName] = useState(null);

    const handleFile = useCallback((file) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = e => {
            const rows = parseCSV(e.target.result);
            setClients(buildClients(rows));
            setAges({});
        };
        reader.readAsText(file);
    }, []);

    // Compute system scores for all clients
    const scoredClients = useMemo(() => {
        if (!clients) return [];
        return Object.values(clients).map(client => {
            const syss = SYSTEMS.map(sys => ({
                id: sys.id,
                short: sys.short,
                name: sys.name,
                score: computeSystemScore(sys, client.markers),
            }));
            const validSyss = syss.map(s => s.score).filter(s => s != null);
            const overall = validSyss.length
                ? validSyss.reduce((a, b) => a + b, 0) / validSyss.length
                : null;
            return { ...client, syss, overall, coverage: validSyss.length };
        });
    }, [clients]);

    // Population median of overall scores
    const populationMedian = useMemo(() => {
        const scores = scoredClients.map(c => c.overall).filter(s => s != null);
        if (!scores.length) return null;
        const sorted = [...scores].sort((a, b) => a - b);
        const n = sorted.length;
        return n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    }, [scoredClients]);

    const n = scoredClients.length;
    const nWithAge = Object.keys(ages).filter(id => ages[id] != null && ages[id] !== "").length;

    return (
        <div style={{ minHeight: "100vh", background: "#EEF4F7" }}>
            {/* Header */}
            <div style={{ background: C.navy, padding: "18px 32px", display: "flex", alignItems: "baseline", gap: 16 }}>
                <div style={{ fontFamily: T.display, fontSize: 20, color: C.teal, letterSpacing: "0.02em" }}>
                    Biological Age Explorer
                </div>
                <div style={{ fontSize: 12, color: C.steel }}>R&D · Molecular You</div>
                {fileName && (
                    <div style={{ marginLeft: "auto", fontSize: 11, color: C.steel, fontFamily: T.mono }}>
                        {fileName}
                    </div>
                )}
            </div>

            <div style={{ padding: "32px 32px 64px" }}>
                {!clients ? (
                    <div style={{ paddingTop: 64 }}>
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <div style={{ fontFamily: T.display, fontSize: 22, color: C.navy, marginBottom: 8 }}>
                                Load client data to begin
                            </div>
                            <div style={{ fontSize: 13, color: C.textMuted, maxWidth: 420, margin: "0 auto" }}>
                                Scores are computed from the 7 body health systems using default scoring parameters.
                                Biological age is derived from each client's overall score relative to the population median.
                            </div>
                        </div>
                        <UploadZone onFile={handleFile} />
                        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: C.textFaint }}>
                            All data stays in your browser — nothing is uploaded to a server.
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Stats bar */}
                        <div style={{
                            display: "flex", gap: 24, marginBottom: 24,
                            background: C.surface, borderRadius: 10, padding: "16px 24px",
                            border: `1px solid ${C.border}`, flexWrap: "wrap", alignItems: "center",
                        }}>
                            <Stat label="Clients" value={n} />
                            <Divider />
                            <Stat label="Population median score" value={populationMedian != null ? populationMedian.toFixed(1) : "—"} />
                            <Divider />
                            <Stat label="Ages entered" value={`${nWithAge} / ${n}`} />
                            {n < 5 && (
                                <>
                                    <Divider />
                                    <div style={{ fontSize: 11, color: C.fair, fontStyle: "italic" }}>
                                        ⚠ Median may not be representative with fewer than 5 clients
                                    </div>
                                </>
                            )}
                            <div style={{ marginLeft: "auto" }}>
                                <button
                                    onClick={() => { setClients(null); setAges({}); setFileName(null); }}
                                    style={{
                                        fontSize: 11, padding: "5px 12px", borderRadius: 6,
                                        border: `1px solid ${C.border}`, background: C.surface,
                                        color: C.textMuted, cursor: "pointer",
                                    }}
                                >
                                    Load new file
                                </button>
                            </div>
                        </div>

                        {/* Formula note */}
                        <div style={{
                            background: "#F0F7FB", border: `1px solid ${C.iceLight}`,
                            borderRadius: 8, padding: "10px 16px", marginBottom: 20,
                            fontSize: 11, color: C.textMuted, lineHeight: 1.7,
                        }}>
                            <strong style={{ color: C.textSecond }}>Formula:</strong>{" "}
                            biological age = chronological age + δ, where δ is derived from how far the client's overall score deviates from the population median.
                            Penalty (below median): δ = +20 · x<sup>0.75</sup> — felt quickly.
                            Benefit (above median): δ = −20 · x<sup>1.5</sup> — earned slowly.
                            x is the normalised distance from the median (0 → 1).
                        </div>

                        {/* Table */}
                        <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                                <thead>
                                    <tr style={{ background: "#F2F8FB" }}>
                                        <Th style={{ textAlign: "left", width: 200 }}>Client</Th>
                                        <Th style={{ width: 80 }}>Age</Th>
                                        <Th style={{ width: 110 }}>Overall score</Th>
                                        <Th style={{ width: 100 }}>Biological age</Th>
                                        <Th style={{ width: 90 }}>Delta</Th>
                                        {SYSTEMS.map(s => (
                                            <Th key={s.id} style={{ width: 64 }} title={s.name}>{s.short}</Th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {scoredClients.map((client, ri) => {
                                        const age = ages[client.id] !== undefined && ages[client.id] !== "" ? Number(ages[client.id]) : null;
                                        const result = computeBioAge(client.overall, age, populationMedian);
                                        const rowBg = ri % 2 === 0 ? C.surface : "#F7FAFC";
                                        return (
                                            <tr key={client.id} style={{ background: rowBg, borderTop: `1px solid ${C.border}` }}>
                                                {/* Client */}
                                                <td style={{ padding: "10px 16px" }}>
                                                    <div style={{ fontFamily: T.mono, fontSize: 11, color: C.textSecond, fontWeight: 600 }}>
                                                        {client.label}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2 }}>
                                                        {client.coverage}/7 systems
                                                    </div>
                                                </td>

                                                {/* Age input */}
                                                <td style={{ padding: "10px 8px", textAlign: "center" }}>
                                                    <input
                                                        type="number"
                                                        min="1" max="120"
                                                        placeholder="—"
                                                        value={ages[client.id] ?? ""}
                                                        onChange={e => setAges(prev => ({ ...prev, [client.id]: e.target.value }))}
                                                        style={{
                                                            width: 56, padding: "4px 6px", textAlign: "center",
                                                            border: `1px solid ${C.border}`, borderRadius: 6,
                                                            fontFamily: T.mono, fontSize: 13, color: C.textPrimary,
                                                            background: C.surface, outline: "none",
                                                        }}
                                                    />
                                                </td>

                                                {/* Overall score */}
                                                <td style={{ padding: "10px 8px", textAlign: "center" }}>
                                                    {client.overall != null ? (
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                                            <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 14, color: scoreColour(client.overall) }}>
                                                                {client.overall.toFixed(1)}
                                                            </span>
                                                            <ScoreBar score={client.overall} width={72} />
                                                        </div>
                                                    ) : <span style={{ color: C.textFaint, fontSize: 12 }}>—</span>}
                                                </td>

                                                {/* Biological age */}
                                                <td style={{ padding: "10px 8px", textAlign: "center" }}>
                                                    {result ? (
                                                        <span style={{
                                                            fontFamily: T.display, fontWeight: 700,
                                                            fontSize: 16, color: result.delta > 0 ? C.critical : C.tealDark,
                                                        }}>
                                                            {result.bioAge.toFixed(1)}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: C.textFaint, fontSize: 12 }}>
                                                            {age == null ? "enter age" : "—"}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Delta */}
                                                <td style={{ padding: "10px 8px", textAlign: "center" }}>
                                                    <DeltaBadge delta={result?.delta} />
                                                </td>

                                                {/* System scores */}
                                                {client.syss.map(sys => (
                                                    <td key={sys.id} style={{ padding: "10px 4px", textAlign: "center" }}>
                                                        {sys.score != null ? (
                                                            <span style={{
                                                                fontFamily: T.mono, fontSize: 11, fontWeight: 600,
                                                                color: scoreColour(sys.score),
                                                            }}>
                                                                {Math.floor(sys.score)}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: C.textFaint, fontSize: 11 }}>—</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* System key */}
                        <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {SYSTEMS.map(s => (
                                <div key={s.id} style={{ fontSize: 10, color: C.textFaint }}>
                                    <strong style={{ color: C.textMuted }}>{s.short}</strong> — {s.name}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div>
            <div style={{ fontSize: 10, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
            <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, color: C.textPrimary }}>{value}</div>
        </div>
    );
}

function Divider() {
    return <div style={{ width: 1, height: 32, background: C.border }} />;
}

function Th({ children, style, title }) {
    return (
        <th title={title} style={{
            padding: "10px 8px", fontSize: 10, fontWeight: 700, color: C.textMuted,
            textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center",
            borderBottom: `1px solid ${C.border}`, ...style,
        }}>
            {children}
        </th>
    );
}
