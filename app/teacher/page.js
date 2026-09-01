"use client";
import { useState } from "react";
import Link from "next/link";

const TT = {
  fr: {
    dir: "ltr",
    back: "Retour",
    title: "Espace enseignant(e)",
    loginTitle: "Accès enseignant(e)",
    accessCode: "Code d'accès",
    loginBtn: "Entrer",
    wrong: "Code incorrect",
    tabCreateTest: "Nouveau test",
    tabStudents: "Comptes élèves",
    tabResults: "Résultats",
    // create test
    titleFr: "Titre (français)",
    titleAr: "Titre (arabe) — optionnel",
    duration: "Durée (minutes)",
    numQuestions: "Nombre de questions",
    pdfLabel: "Fichier PDF des questions",
    pdfChoose: "Choisir un fichier PDF",
    answersLabel: "Réponses correctes",
    question: "Question",
    createBtn: "Créer le test",
    creating: "Création en cours...",
    testCreated: "Test créé ! Code à partager avec les élèves :",
    // students
    studentsHelp: "Un élève par ligne, au format : Nom complet ; Code Massar ; Mot de passe",
    studentsPlaceholder: "Ahmed Benali ; G123456789 ; azert123\nSalma El Amrani ; G987654321 ; motdepasse1",
    createStudentsBtn: "Créer / mettre à jour les comptes",
    studentsCreated: (n) => `${n} compte(s) créé(s) ou mis à jour.`,
    // results
    resultsCodeLabel: "Code du test",
    loadBtn: "Afficher",
    noResults: "Aucun résultat pour l'instant.",
    showAnswers: "Afficher les réponses correctes aux élèves",
    hideAnswers: "Masquer les réponses correctes",
    grantRetryLabel: "Code Massar de l'élève",
    grantRetryBtn: "Accorder une nouvelle tentative",
    granted: "Tentative supplémentaire accordée.",
  },
  ar: {
    dir: "rtl",
    back: "رجوع",
    title: "فضاء الأستاذ(ة)",
    loginTitle: "دخول الأستاذ(ة)",
    accessCode: "كود الدخول",
    loginBtn: "دخول",
    wrong: "الكود غير صحيح",
    tabCreateTest: "اختبار جديد",
    tabStudents: "حسابات التلاميذ",
    tabResults: "النتائج",
    titleFr: "العنوان (بالفرنسية)",
    titleAr: "العنوان (بالعربية) — اختياري",
    duration: "المدة (بالدقائق)",
    numQuestions: "عدد الأسئلة",
    pdfLabel: "ملف الأسئلة PDF",
    pdfChoose: "اختر ملف PDF",
    answersLabel: "الأجوبة الصحيحة",
    question: "السؤال",
    createBtn: "إنشاء الاختبار",
    creating: "جارٍ الإنشاء...",
    testCreated: "تم إنشاء الاختبار! شارك هذا الكود مع التلاميذ:",
    studentsHelp: "تلميذ واحد لكل سطر، بالصيغة: الاسم الكامل ; رمز Massar ; كلمة السر",
    studentsPlaceholder: "أحمد بنعلي ; G123456789 ; azert123\nسلمى العمراني ; G987654321 ; motdepasse1",
    createStudentsBtn: "إنشاء / تحديث الحسابات",
    studentsCreated: (n) => `تم إنشاء أو تحديث ${n} حساب.`,
    resultsCodeLabel: "كود الاختبار",
    loadBtn: "عرض",
    noResults: "لا توجد نتائج بعد.",
    showAnswers: "إظهار الأجوبة الصحيحة للتلاميذ",
    hideAnswers: "إخفاء الأجوبة الصحيحة",
    grantRetryLabel: "رمز Massar الخاص بالتلميذ",
    grantRetryBtn: "منح محاولة إضافية",
    granted: "تم منح محاولة إضافية.",
  },
};

export default function TeacherPage() {
  const [lang, setLang] = useState("fr");
  const t = TT[lang];

  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("create");

  // create test state
  const [titleFr, setTitleFr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [duration, setDuration] = useState(20);
  const [numQuestions, setNumQuestions] = useState(10);
  const [answers, setAnswers] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState("");
  const [createErr, setCreateErr] = useState("");

  // students state
  const [studentsText, setStudentsText] = useState("");
  const [studentsMsg, setStudentsMsg] = useState("");
  const [studentsBusy, setStudentsBusy] = useState(false);

  // results state
  const [resultsCode, setResultsCode] = useState("");
  const [resultsData, setResultsData] = useState(null);
  const [retryCodeMassar, setRetryCodeMassar] = useState("");
  const [retryMsg, setRetryMsg] = useState("");

  const login = async () => {
    setErr("");
    const res = await fetch("/api/teacher-login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.ok) setAuthed(true); else setErr(t.wrong);
  };

  const setAns = (q, val) => setAnswers((a) => ({ ...a, [q]: val }));

  const createTest = async () => {
    setCreateErr(""); setCreating(true);
    const fd = new FormData();
    fd.append("teacherCode", code);
    fd.append("titleFr", titleFr);
    fd.append("titleAr", titleAr);
    fd.append("duration", duration);
    fd.append("numQuestions", numQuestions);
    fd.append("answerKey", JSON.stringify(answers));
    fd.append("pdfFile", pdfFile);
    const res = await fetch("/api/create-test", { method: "POST", body: fd });
    const data = await res.json();
    setCreating(false);
    if (data.ok) { setCreatedCode(data.code); } else { setCreateErr(data.error); }
  };

  const createStudents = async () => {
    setStudentsBusy(true); setStudentsMsg("");
    const rows = studentsText.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [fullName, codeMassar, password] = l.split(";").map((x) => x && x.trim());
      return { fullName, codeMassar, password };
    });
    const res = await fetch("/api/create-students", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherCode: code, students: rows }),
    });
    const data = await res.json();
    setStudentsBusy(false);
    setStudentsMsg(data.ok ? t.studentsCreated(data.created) : data.error);
  };

  const loadResults = async () => {
    const res = await fetch("/api/test-results", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherCode: code, testCode: resultsCode.trim().toUpperCase() }),
    });
    const data = await res.json();
    if (data.ok) setResultsData(data); else setResultsData({ error: data.error });
  };

  const toggleAnswers = async () => {
    const show = !resultsData.test.show_correct_answers;
    await fetch("/api/toggle-answers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherCode: code, testCode: resultsCode.trim().toUpperCase(), show }),
    });
    loadResults();
  };

  const grantRetry = async () => {
    setRetryMsg("");
    const res = await fetch("/api/grant-retry", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherCode: code, testCode: resultsCode.trim().toUpperCase(), codeMassar: retryCodeMassar }),
    });
    const data = await res.json();
    setRetryMsg(data.ok ? t.granted : data.error);
  };

  const LangSwitch = () => (
    <div style={{ display: "inline-flex", border: "1.5px solid var(--line)", borderRadius: 999, overflow: "hidden", fontSize: 12, fontWeight: 700 }}>
      <button onClick={() => setLang("fr")} style={{ padding: "4px 10px", border: "none", cursor: "pointer", background: lang === "fr" ? "var(--ink)" : "white", color: lang === "fr" ? "var(--paper)" : "var(--ink)" }}>FR</button>
      <button onClick={() => setLang("ar")} style={{ padding: "4px 10px", border: "none", cursor: "pointer", background: lang === "ar" ? "var(--ink)" : "white", color: lang === "ar" ? "var(--paper)" : "var(--ink)" }}>AR</button>
    </div>
  );

  return (
    <div dir={t.dir} data-lang={lang} style={{ minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/" style={{ fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>← {t.back}</Link>
        <div className="display" style={{ fontWeight: 700 }}>{t.title}</div>
        <LangSwitch />
      </div>

      {!authed && (
        <div style={{ maxWidth: 380, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <h3 className="display" style={{ fontSize: 22, marginBottom: 20 }}>{t.loginTitle}</h3>
          <input type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t.accessCode} style={{ marginBottom: 12 }} />
          {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
          <button onClick={login} className="btn-primary" style={{ width: "100%" }}>{t.loginBtn}</button>
        </div>
      )}

      {authed && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["create", "students", "results"].map((tab_) => (
              <button key={tab_} onClick={() => setTab(tab_)}
                className={tab === tab_ ? "btn-primary" : ""}
                style={tab === tab_ ? { padding: "8px 16px", fontSize: 13 } : { padding: "8px 16px", fontSize: 13, background: "white", border: "1px solid var(--line)", borderRadius: 6, cursor: "pointer" }}>
                {tab_ === "create" ? t.tabCreateTest : tab_ === "students" ? t.tabStudents : t.tabResults}
              </button>
            ))}
          </div>

          {tab === "create" && !createdCode && (
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>{t.titleFr}</label>
              <input type="text" value={titleFr} onChange={(e) => setTitleFr(e.target.value)} />
              <label style={{ fontSize: 13, fontWeight: 700 }}>{t.titleAr}</label>
              <input type="text" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700 }}>{t.duration}</label>
                  <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700 }}>{t.numQuestions}</label>
                  <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} />
                </div>
              </div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>{t.pdfLabel}</label>
              <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
              <label style={{ fontSize: 13, fontWeight: 700 }}>{t.answersLabel}</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {Array.from({ length: numQuestions }).map((_, i) => {
                  const q = i + 1;
                  return (
                    <div key={q} className="card" style={{ background: "var(--paper-2)", padding: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{t.question} {q}</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {["A", "B", "C", "D"].map((opt) => (
                          <button key={opt} onClick={() => setAns(q, opt)} className={`choice-btn ${answers[q] === opt ? "selected" : ""}`} style={{ flex: 1, fontSize: 11, padding: 4 }}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {createErr && <div style={{ color: "var(--danger)", fontSize: 13 }}>{createErr}</div>}
              <button onClick={createTest} disabled={creating || !titleFr || !pdfFile} className="btn-primary">
                {creating ? t.creating : t.createBtn}
              </button>
            </div>
          )}

          {tab === "create" && createdCode && (
            <div style={{ textAlign: "center", padding: 32 }}>
              <p style={{ marginBottom: 12 }}>{t.testCreated}</p>
              <div className="display" style={{ fontSize: 32, background: "var(--ink)", color: "var(--amber)", display: "inline-block", padding: "12px 32px", borderRadius: 8 }}>{createdCode}</div>
            </div>
          )}

          {tab === "students" && (
            <div style={{ display: "grid", gap: 12 }}>
              <p style={{ fontSize: 13, color: "var(--ink-2)" }}>{t.studentsHelp}</p>
              <textarea value={studentsText} onChange={(e) => setStudentsText(e.target.value)} placeholder={t.studentsPlaceholder}
                rows={10} style={{ padding: 12, border: "2px solid var(--line)", borderRadius: 6, fontFamily: "monospace", fontSize: 13 }} />
              <button onClick={createStudents} disabled={studentsBusy || !studentsText.trim()} className="btn-primary">{t.createStudentsBtn}</button>
              {studentsMsg && <div style={{ fontSize: 13 }}>{studentsMsg}</div>}
            </div>
          )}

          {tab === "results" && (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={resultsCode} onChange={(e) => setResultsCode(e.target.value.toUpperCase())} placeholder={t.resultsCodeLabel} />
                <button onClick={loadResults} className="btn-primary" style={{ whiteSpace: "nowrap" }}>{t.loadBtn}</button>
              </div>

              {resultsData?.error && <div style={{ color: "var(--danger)", fontSize: 13 }}>{resultsData.error}</div>}

              {resultsData?.test && (
                <>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <input type="checkbox" checked={resultsData.test.show_correct_answers} onChange={toggleAnswers} style={{ width: "auto" }} />
                    {resultsData.test.show_correct_answers ? t.hideAnswers : t.showAnswers}
                  </label>

                  <div style={{ display: "grid", gap: 8 }}>
                    {resultsData.results.length === 0 && <p style={{ fontSize: 13, color: "var(--ink-2)" }}>{t.noResults}</p>}
                    {resultsData.results.map((r, i) => (
                      <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{r.fullName}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{r.codeMassar}</div>
                        </div>
                        <div className="display" style={{ fontSize: 18 }}>{r.score}/{r.total}</div>
                      </div>
                    ))}
                  </div>

                  <div className="card" style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>{t.grantRetryLabel}</label>
                    <input type="text" value={retryCodeMassar} onChange={(e) => setRetryCodeMassar(e.target.value)} />
                    <button onClick={grantRetry} className="btn-amber">{t.grantRetryBtn}</button>
                    {retryMsg && <div style={{ fontSize: 13 }}>{retryMsg}</div>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
