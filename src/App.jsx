import { useState, useMemo } from "react";

const WEIGHT_SCORE = { alta: 3, média: 2, baixa: 1 };

const sections = [
  {
    id: "thinking", label: "Raciocínio & Abordagem", color: "#E8C547", icon: "◈", critical: true,
    items: [
      { id: "t1", text: "Clarifica requisitos antes de sair desenhando", weight: "alta" },
      { id: "t2", text: "Faz perguntas sobre escala, SLA e restrições de negócio", weight: "alta" },
      { id: "t3", text: "Separa MVP de evolução futura", weight: "média" },
      { id: "t4", text: "Verbaliza trade-offs sem precisar ser provocado", weight: "alta" },
      { id: "t5", text: "Consegue estimar ordem de grandeza (QPS, storage, latência)", weight: "média" },
      { id: "t6", text: "Não busca solução perfeita — busca solução adequada", weight: "alta" },
    ],
  },
  {
    id: "distributed", label: "Sistemas Distribuídos", color: "#5EB8FF", icon: "⬡", critical: true,
    items: [
      { id: "d1", text: "Entende CAP theorem e onde aplicá-lo na prática", weight: "alta" },
      { id: "d2", text: "Diferencia consistência eventual de forte com exemplos reais", weight: "alta" },
      { id: "d3", text: "Conhece padrões: Saga, Outbox, CQRS, Event Sourcing", weight: "alta" },
      { id: "d4", text: "Sabe quando NÃO usar event-driven (overhead de complexidade)", weight: "média" },
      { id: "d5", text: "Entende idempotência e como garantir end-to-end", weight: "alta" },
      { id: "d6", text: "Conhece estratégias de particionamento e seus trade-offs", weight: "média" },
      { id: "d7", text: "Aborda falhas parciais (circuit breaker, retry com backoff, bulkhead)", weight: "alta" },
    ],
  },
  {
    id: "data", label: "Dados & Persistência", color: "#A78BFA", icon: "▣", critical: false,
    items: [
      { id: "da1", text: "Escolhe o banco certo para o problema e justifica (não só cita o nome)", weight: "alta" },
      { id: "da2", text: "Pensa em estratégia de índices e impacto em escrita", weight: "média" },
      { id: "da3", text: "Aborda migração e versionamento de schema", weight: "média" },
      { id: "da4", text: "Entende quando usar cache e qual estratégia (aside, write-through, TTL)", weight: "alta" },
      { id: "da5", text: "Considera retenção, LGPD e deleção de dados sensíveis", weight: "média" },
    ],
  },
  {
    id: "reliability", label: "Confiabilidade & Operação", color: "#34D399", icon: "◎", critical: false,
    items: [
      { id: "r1", text: "Projeta para observabilidade desde o início (logs, métricas, traces)", weight: "alta" },
      { id: "r2", text: "Define SLIs/SLOs e sabe o que medir", weight: "média" },
      { id: "r3", text: "Aborda estratégia de deployment (blue-green, canary, feature flags)", weight: "média" },
      { id: "r4", text: "Pensa em degradação graciosa — o que acontece quando um serviço cai?", weight: "alta" },
      { id: "r5", text: "Discute backpressure e o que acontece sob carga extrema", weight: "média" },
    ],
  },
  {
    id: "security", label: "Segurança & Compliance", color: "#FB7185", icon: "◆", critical: true,
    items: [
      { id: "s1", text: "Aborda authn/authz sem ser provocado", weight: "alta" },
      { id: "s2", text: "Pensa em dados em trânsito e em repouso", weight: "média" },
      { id: "s3", text: "Menciona auditoria e rastreabilidade de ações críticas (fintech!)", weight: "alta" },
      { id: "s4", text: "Conhece riscos de double-spend, replay attacks, idempotency keys", weight: "alta" },
    ],
  },
  {
    id: "seniority", label: "Sinais de Sênior Real", color: "#FDBA74", icon: "★", critical: true,
    items: [
      { id: "se1", text: "Diz 'depende' e então EXPLICA de quê depende", weight: "alta" },
      { id: "se2", text: "Menciona aprendizados de falhas passadas (erros inclusos)", weight: "alta" },
      { id: "se3", text: "Questiona premissas da pergunta quando faz sentido", weight: "média" },
      { id: "se4", text: "Sabe quando simplicidade vence sofisticação", weight: "alta" },
      { id: "se5", text: "Pensa no custo de manutenção e no time que vai operar", weight: "alta" },
      { id: "se6", text: "Conecta decisões técnicas ao impacto de negócio", weight: "alta" },
      { id: "se7", text: "Sob push-back: defende com fundamento ou reconhece graciosamente — não cede por insegurança", weight: "alta" },
    ],
  },
  {
    id: "redflags", label: "Red Flags", color: "#F87171", icon: "⚑", critical: false, isRedFlags: true,
    items: [
      { id: "rf1", text: "🚩 Vai direto para microserviços sem questionar se é necessário", weight: "alta" },
      { id: "rf2", text: "🚩 Usa Kafka para tudo sem justificar a complexidade operacional", weight: "alta" },
      { id: "rf3", text: "🚩 Nunca menciona falhas ou limitações da própria proposta", weight: "alta" },
      { id: "rf4", text: "🚩 Não consegue estimar nada — evita números completamente", weight: "média" },
      { id: "rf5", text: "🚩 Solução é clone do sistema atual do emprego anterior", weight: "média" },
      { id: "rf6", text: "🚩 Cede imediatamente ao push-back sem argumentar", weight: "alta" },
      { id: "rf7", text: "🚩 Não demonstra curiosidade pelo contexto da empresa", weight: "baixa" },
    ],
  },
];

const LEVELS = [
  {
    id: "nao_rec", label: "Não Recomendado", sublabel: "Lacunas críticas ou muitos red flags",
    color: "#EF4444", bg: "#EF444410", border: "#EF444430",
    description: "Não atingiu maturidade mínima esperada para sênior. Pode ser considerado para Pleno com acompanhamento próximo.",
    min: 0, max: 34, icon: "✕",
  },
  {
    id: "pleno", label: "Pleno", sublabel: "Base sólida, ainda em formação",
    color: "#F59E0B", bg: "#F59E0B10", border: "#F59E0B30",
    description: "Domina fundamentos e pensa de forma estruturada, mas depende de orientação em cenários de alta ambiguidade ou escala. Potencial real para sênior em 1–2 anos.",
    min: 35, max: 54, icon: "◐",
  },
  {
    id: "senior_inicial", label: "Sênior Inicial", sublabel: "Sólido, mas com pontos cegos",
    color: "#5EB8FF", bg: "#5EB8FF10", border: "#5EB8FF30",
    description: "Pensa de forma sistêmica e cobre os principais riscos. Tem pontos cegos em operação ou segurança. Contribui de forma autônoma rapidamente com pouco onboarding.",
    min: 55, max: 74, icon: "◕",
  },
  {
    id: "senior_consolidado", label: "Sênior Consolidado", sublabel: "Autônomo e multiplicador",
    color: "#34D399", bg: "#34D39910", border: "#34D39930",
    description: "Cobre as dimensões críticas com profundidade, pensa em trade-offs espontaneamente, tem vivência de falhas reais e conecta decisões técnicas ao negócio. Referência técnica para o time.",
    min: 75, max: 100, icon: "●",
  },
];

const weightColors = { alta: "#EF4444", média: "#F59E0B", baixa: "#6B7280" };

function computeScore(checked) {
  const regularSections = sections.filter((s) => !s.isRedFlags);
  const redFlagSection = sections.find((s) => s.isRedFlags);

  let maxScore = 0;
  let rawScore = 0;
  for (const s of regularSections) {
    for (const item of s.items) {
      const w = WEIGHT_SCORE[item.weight];
      maxScore += w;
      if (checked[item.id]) rawScore += w;
    }
  }

  const criticalSections = regularSections.filter((s) => s.critical);
  const criticalCoverage = criticalSections.map((s) => {
    const total = s.items.reduce((a, i) => a + WEIGHT_SCORE[i.weight], 0);
    const got = s.items.filter((i) => checked[i.id]).reduce((a, i) => a + WEIGHT_SCORE[i.weight], 0);
    return { id: s.id, label: s.label, color: s.color, pct: total > 0 ? got / total : 0 };
  });

  let redFlagPenaltyPts = 0;
  let redFlagCount = 0;
  for (const item of redFlagSection.items) {
    if (checked[item.id]) {
      redFlagPenaltyPts += WEIGHT_SCORE[item.weight] * 2;
      redFlagCount++;
    }
  }

  const adjustedScore = Math.max(0, rawScore - redFlagPenaltyPts);
  const pct = Math.round((adjustedScore / maxScore) * 100);
  const criticalFail = criticalCoverage.filter((c) => c.pct < 0.4);

  let level;
  if (redFlagCount >= 3 || (criticalFail.length >= 2 && pct < 55)) {
    level = LEVELS[0];
  } else {
    level = LEVELS.find((l) => pct >= l.min && pct <= l.max) || LEVELS[0];
    if (criticalFail.length >= 2 && level.id === "senior_consolidado") level = LEVELS[2];
    if (criticalFail.length >= 2 && level.id === "senior_inicial") level = LEVELS[1];
  }

  return { pct, rawScore, maxScore, adjustedScore, redFlagCount, redFlagPenaltyPts, criticalCoverage, criticalFail, level };
}

function getHiringRecommendation(score) {
  if (score.level.id === "mid_plus") return "No hire";
  if (score.level.id === "senior_potencial") return "Leaning no hire";
  if (score.level.id === "senior_inicial") {
    return score.redFlagCount > 0 || score.criticalFail.length > 0 ? "Leaning hire" : "Hire";
  }
  return score.redFlagCount > 0 ? "Hire" : "Strong hire";
}

export default function InterviewChecklist() {
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState({});
  const [noteOpen, setNoteOpen] = useState({});
  const [candidate, setCandidate] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [copyStatus, setCopyStatus] = useState("idle");

  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const score = useMemo(() => computeScore(checked), [checked]);
  const hiringRecommendation = useMemo(() => getHiringRecommendation(score), [score]);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalItems = sections.flatMap((s) => s.items).length;
  const extractedSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => checked[item.id]),
    }))
    .filter((section) => section.items.length > 0);

  const extractContent = () => {
    const redFlagSection = sections.find((section) => section.isRedFlags);
    const selectedRedFlags = redFlagSection ? redFlagSection.items.filter((item) => checked[item.id]) : [];
    const criticalCoverageLines = score.criticalCoverage.map((section) => {
      const pct = Math.round(section.pct * 100);
      return `- ${section.label}: ${pct}%`;
    });
    const sectionLines = extractedSections.flatMap((section) => [
      `### ${section.label}`,
      ...section.items.flatMap((item) => {
        const note = notes[item.id]?.trim();
        return note
          ? [`- ${item.text}`, `  - Observacao: ${note}`]
          : [`- ${item.text}`];
      }),
      "",
    ]);
    const redFlagLines = selectedRedFlags.length > 0
      ? selectedRedFlags.flatMap((item) => {
          const note = notes[item.id]?.trim();
          return note
            ? [`- ${item.text}`, `  - Observacao: ${note}`]
            : [`- ${item.text}`];
        })
      : ["- Nenhuma red flag marcada"];

    return [
      "# Scorecard de Entrevista",
      "",
      "## Candidato",
      `- Nome: ${candidate.trim() || "Nao informado"}`,
      "",
      "## Resultado Geral",
      `- Score ajustado: ${score.pct}%`,
      `- Nivel: ${score.level.label}`,
      `- Itens avaliados: ${checkedCount}/${totalItems}`,
      `- Penalidade por red flags: ${score.redFlagPenaltyPts > 0 ? `${score.redFlagPenaltyPts} pts` : "0 pts"}`,
      "",
      "## Cobertura Critica",
      ...criticalCoverageLines,
      "",
      "## Pontos Levantados",
      ...(sectionLines.length > 0 ? sectionLines : ["Nenhum item marcado.", ""]),
      "## Red Flags",
      ...redFlagLines,
      "",
      "## Recomendacao Final",
      `- ${hiringRecommendation}`,
    ].join("\n").trim();
  };

  const handleExtract = async () => {
    try {
      await navigator.clipboard.writeText(extractContent());
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }

    window.setTimeout(() => setCopyStatus("idle"), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0C0C0F", fontFamily: "'IBM Plex Mono','Courier New',monospace", color: "#E2E8F0", padding: "2rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;600;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#111;}::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
        .item-row:hover{background:rgba(255,255,255,0.03);}
        .check-box{width:20px;height:20px;border-radius:4px;border:1.5px solid #444;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
        .check-box.checked{border-color:#34D399;background:#34D399;}
        .check-box.red.checked{border-color:#F87171;background:#F87171;}
        .section-card{transition:border-color .2s;}.section-card:hover{border-color:rgba(255,255,255,.12)!important;}
        .note-btn{cursor:pointer;opacity:.4;transition:opacity .15s;font-size:11px;background:none;border:none;color:#E2E8F0;padding:0;}.note-btn:hover{opacity:1;}
        textarea{resize:vertical;}
        input:focus{border-color:#333!important;}
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#3A3A4A", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              · Entrevista Técnica · Etapa de Arquitetura · Senior
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(1.5rem,4vw,2.1rem)", fontWeight: 700, color: "#F8FAFC", margin: 0, letterSpacing: "-0.02em" }}>
              Checklist de Avaliação
            </h1>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.45rem", marginLeft: "auto" }}>
            <button
              type="button"
              onClick={handleExtract}
              style={{
                background: checkedCount > 0 ? "#F8FAFC" : "#151821",
                color: checkedCount > 0 ? "#0C0C0F" : "#667085",
                border: "1px solid #2A2A38",
                borderRadius: 8,
                padding: "0.65rem 0.9rem",
                fontSize: 12,
                fontFamily: "inherit",
                cursor: "pointer",
                minWidth: 120,
              }}
            >
              Extrair
            </button>
            <span style={{ fontSize: 11, color: copyStatus === "error" ? "#F87171" : "#667085", minHeight: 16 }}>
              {copyStatus === "success" ? "Conteudo copiado para o clipboard." : copyStatus === "error" ? "Nao foi possivel copiar." : "Copia os itens marcados e suas anotacoes."}
            </span>
          </div>
        </div>

        <input
          value={candidate} onChange={(e) => setCandidate(e.target.value)}
          placeholder="Nome do candidato(a)..."
          style={{ width: "100%", background: "#111318", border: "1px solid #1E1E27", borderRadius: 8, padding: "0.65rem 1rem", color: "#E2E8F0", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: "1.5rem" }}
        />

        {/* VERDICT */}
        <div style={{ background: score.level.bg, border: `1px solid ${score.level.border}`, borderLeft: `4px solid ${score.level.color}`, borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.25rem", alignItems: "center" }}>
            {/* Score ring */}
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${score.level.color}40`, background: score.level.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, color: score.level.color }}>{score.level.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: score.level.color }}>{score.pct}%</span>
              </div>
            </div>

            {/* Label + desc */}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 700, color: score.level.color }}>{score.level.label}</span>
                <span style={{ fontSize: 11, color: "#666", fontStyle: "italic" }}>{score.level.sublabel}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: "#94A3B8", lineHeight: 1.6 }}>{score.level.description}</p>
              {score.redFlagCount > 0 && (
                <div style={{ marginTop: "0.45rem", fontSize: 11.5, color: "#F87171" }}>
                  ⚑ {score.redFlagCount} red flag{score.redFlagCount > 1 ? "s" : ""} detectado{score.redFlagCount > 1 ? "s" : ""} · −{score.redFlagPenaltyPts} pts no score
                </div>
              )}
            </div>

            {/* Level ladder */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", alignItems: "flex-end" }}>
              {[...LEVELS].reverse().map((l) => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", opacity: l.id === score.level.id ? 1 : 0.25, transition: "opacity .3s" }}>
                  <span style={{ fontSize: 10, color: l.color, whiteSpace: "nowrap" }}>{l.label}</span>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.id === score.level.id ? l.color : "transparent", border: `1.5px solid ${l.color}` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical coverage bars */}
        <div style={{ background: "#0F1014", border: "1px solid #1E1E27", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 10, color: "#3A3A4A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Cobertura · Seções Críticas</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: "0.75rem" }}>
            {score.criticalCoverage.map((c) => {
              const pct = Math.round(c.pct * 100);
              const fail = pct < 40;
              return (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: 11, color: fail ? "#EF4444" : "#94A3B8" }}>{c.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: fail ? "#EF4444" : c.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 3, background: "#1E1E27", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: fail ? "#EF4444" : c.color, borderRadius: 2, transition: "width .4s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nav pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "1.25rem" }}>
          {sections.map((s) => {
            const c = s.items.filter((i) => checked[i.id]).length;
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(active ? null : s.id)} style={{
                background: active ? s.color + "18" : "#111318", border: `1px solid ${active ? s.color + "60" : "#1E1E27"}`,
                borderRadius: 6, padding: "0.3rem 0.75rem", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.4rem",
                color: active ? s.color : "#666", fontSize: 12, fontFamily: "inherit",
              }}>
                <span>{s.icon}</span>
                <span style={{ fontSize: 10, color: active ? s.color + "aa" : "#444" }}>{c}/{s.items.length}</span>
              </button>
            );
          })}
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {sections.filter((s) => !activeSection || s.id === activeSection).map((section) => {
            const c = section.items.filter((i) => checked[i.id]).length;
            const pct = Math.round((c / section.items.length) * 100);
            const isRed = !!section.isRedFlags;
            return (
              <div key={section.id} className="section-card" style={{ background: "#0F1014", border: "1px solid #1E1E27", borderLeft: `3px solid ${section.color}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #181820", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {section.critical && <span style={{ fontSize: 9, color: section.color, border: `1px solid ${section.color}40`, padding: "1px 5px", borderRadius: 3, letterSpacing: "0.1em" }}>CRÍTICO</span>}
                    <span style={{ color: section.color, fontSize: 15 }}>{section.icon}</span>
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13.5, color: "#F1F5F9" }}>{section.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 60, height: 3, background: "#1E1E27", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: section.color, borderRadius: 2, transition: "width .3s" }} />
                    </div>
                    <span style={{ fontSize: 10, color: "#333" }}>{c}/{section.items.length}</span>
                  </div>
                </div>
                <div style={{ padding: "0.35rem 0" }}>
                  {section.items.map((item) => (
                    <div key={item.id}>
                      <div className="item-row" style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", padding: "0.5rem 1.25rem", cursor: "pointer", opacity: checked[item.id] ? 0.45 : 1 }} onClick={() => toggle(item.id)}>
                        <div className={`check-box ${checked[item.id] ? "checked" : ""} ${isRed ? "red" : ""}`} style={{ marginTop: 2 }}>
                          {checked[item.id] && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0C0C0F" strokeWidth="2" strokeLinecap="round" /></svg>}
                        </div>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                          <span style={{ fontSize: 13, lineHeight: 1.5, color: "#CBD5E1", textDecoration: checked[item.id] ? "line-through" : "none" }}>{item.text}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                            <span style={{ fontSize: 10, padding: "0.1rem 0.4rem", borderRadius: 4, background: weightColors[item.weight] + "18", color: weightColors[item.weight], border: `1px solid ${weightColors[item.weight]}30` }}>{item.weight}</span>
                            <button className="note-btn" onClick={(e) => { e.stopPropagation(); setNoteOpen((p) => ({ ...p, [item.id]: !p[item.id] })); }}>✎</button>
                          </div>
                        </div>
                      </div>
                      {noteOpen[item.id] && (
                        <div style={{ padding: "0 1.25rem 0.5rem 3.3rem" }}>
                          <textarea value={notes[item.id] || ""} rows={2}
                            onChange={(e) => setNotes((p) => ({ ...p, [item.id]: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Anotação sobre este ponto..."
                            style={{ width: "100%", background: "#13131A", border: "1px solid #2A2A38", borderRadius: 6, padding: "0.45rem 0.7rem", color: "#94A3B8", fontSize: 12, fontFamily: "inherit", outline: "none" }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom stats */}
        <div style={{ marginTop: "1.25rem", padding: "1rem 1.5rem", background: "#0F1014", border: "1px solid #1E1E27", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", textAlign: "center" }}>
          {[
            { label: "Score ajustado", value: `${score.pct}%`, color: score.level.color },
            { label: "Itens avaliados", value: `${checkedCount}/${totalItems}`, color: "#F8FAFC" },
            { label: "Penalidade flags", value: score.redFlagPenaltyPts > 0 ? `−${score.redFlagPenaltyPts}pts` : "—", color: score.redFlagCount > 0 ? "#F87171" : "#2A2A38" },
            { label: "Críticos ok", value: `${score.criticalCoverage.filter(c => c.pct >= 0.5).length}/${score.criticalCoverage.length}`, color: "#34D399" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "0.75rem", textAlign: "center", fontSize: 10, color: "#1E1E27" }}>· entrevista sênior · etapa de arquitetura</div>
      </div>
    </div>
  );
}
