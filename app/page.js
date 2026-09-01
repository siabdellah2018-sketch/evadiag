"use client";
import { useState } from "react";
import Link from "next/link";
import { T } from "../lib/i18n";

export default function Home() {
  const [lang, setLang] = useState("fr");
  const t = T[lang];

  return (
    <div dir={t.dir} data-lang={lang} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <div style={{ position: "absolute", top: 24, insetInlineEnd: 24 }}>
        <div style={{ display: "inline-flex", border: "1.5px solid var(--line)", borderRadius: 999, overflow: "hidden", fontSize: 13, fontWeight: 700 }}>
          <button onClick={() => setLang("fr")} style={{ padding: "6px 12px", border: "none", cursor: "pointer", background: lang === "fr" ? "var(--ink)" : "white", color: lang === "fr" ? "var(--paper)" : "var(--ink)" }}>FR</button>
          <button onClick={() => setLang("ar")} style={{ padding: "6px 12px", border: "none", cursor: "pointer", background: lang === "ar" ? "var(--ink)" : "white", color: lang === "ar" ? "var(--paper)" : "var(--ink)" }}>AR</button>
        </div>
      </div>

      <div style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
        <div style={{ color: "var(--amber-dark)", fontWeight: 700, marginBottom: 12 }}>{t.badge}</div>
        <h1 className="display" style={{ fontSize: 36, marginBottom: 8 }}>{t.roleTitle}</h1>
        <p style={{ color: "var(--ink-2)", marginBottom: 40 }}>{t.roleSubtitle}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Link href="/teacher" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card" style={{ padding: 32, textAlign: "start", borderColor: "var(--ink)", cursor: "pointer" }}>
              <div className="display" style={{ fontSize: 20, marginBottom: 4 }}>{t.teacherRole}</div>
              <div style={{ fontSize: 14, color: "var(--ink-2)" }}>{t.teacherDesc}</div>
            </div>
          </Link>
          <Link href="/student" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card" style={{ padding: 32, textAlign: "start", borderColor: "var(--amber-dark)", cursor: "pointer" }}>
              <div className="display" style={{ fontSize: 20, marginBottom: 4 }}>{t.studentRole}</div>
              <div style={{ fontSize: 14, color: "var(--ink-2)" }}>{t.studentDesc}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
