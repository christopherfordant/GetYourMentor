"use client";

import { FormEvent, useState } from "react";

type SearchResult = {
  citation: { documentId: string; title: string; section: string; priority: number };
  excerpt: string;
  score: number;
  chunkId: string;
};

export function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState("Saisissez une question documentaire.");
  const [loading, setLoading] = useState(false);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim().length < 2) {
      setStatus("Votre question doit contenir au moins 2 caractères.");
      return;
    }

    setLoading(true);
    setStatus("Recherche dans le corpus gouverné…");
    try {
      const response = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query.trim())}`, { cache: "no-store" });
      const payload = await response.json() as { error?: string; results?: SearchResult[] };
      if (!response.ok) throw new Error(payload.error ?? "Recherche indisponible");
      setResults(payload.results ?? []);
      setStatus(payload.results?.length ? `${payload.results.length} source(s) trouvée(s).` : "Aucune source pertinente.");
    } catch (error) {
      setResults([]);
      setStatus(error instanceof Error ? error.message : "Recherche indisponible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gym-knowledge" style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px", color: "var(--gym-ink)" }}>
      <p style={{ color: "var(--gym-muted)", letterSpacing: ".12em", textTransform: "uppercase", fontSize: 12 }}>Administration · connaissance</p>
      <h1 style={{ fontSize: 42, margin: "12px 0" }}>Corpus GetYourMentor</h1>
      <p style={{ maxWidth: 680, color: "var(--gym-muted)" }}>Recherche lexicale en lecture seule. Chaque résultat conserve sa source et sa priorité documentaire.</p>
      <form onSubmit={search} style={{ display: "flex", gap: 12, margin: "32px 0 16px" }}>
        <label htmlFor="knowledge-query" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Question documentaire</label>
        <input id="knowledge-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex. Quelle est la priorité du parcours de réservation ?" style={{ flex: 1, border: "1px solid var(--gym-line)", background: "var(--gym-surface)", color: "inherit", borderRadius: 12, padding: "15px 16px", fontSize: 16 }} />
        <button type="submit" disabled={loading} style={{ border: 0, borderRadius: 12, padding: "0 22px", background: "var(--gym-action)", color: "var(--gym-ink)", fontWeight: 700 }}>{loading ? "Recherche…" : "Rechercher"}</button>
      </form>
      <p aria-live="polite" style={{ color: "var(--gym-muted)", minHeight: 24 }}>{status}</p>
      <section aria-label="Sources trouvées" style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {results.map((result) => (
          <article key={result.chunkId} style={{ border: "1px solid var(--gym-line)", borderRadius: 16, background: "var(--gym-surface)", padding: 20 }}>
            <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>{result.citation.title}</h2>
              <span style={{ color: "var(--gym-muted)", fontSize: 13 }}>Priorité {result.citation.priority}</span>
            </header>
            <p style={{ color: "var(--gym-action)", fontSize: 13 }}>{result.citation.section}</p>
            <p style={{ color: "var(--gym-muted)", lineHeight: 1.65 }}>{result.excerpt}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
