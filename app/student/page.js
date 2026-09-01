"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const S = {
  fr: {
    dir: "ltr",
    back: "Retour",
    title: "Espace élève",
    loginTitle: "Accès au test diagnostique",
    fullName: "Nom complet",
    codeMassar: "Code Massar",
    password: "Mot de passe",
    testCode: "Code du test (donné par l'enseignant)",
    continueBtn: "Continuer",
    searching: "Vérification...",
    introNote: "Le chronomètre démarre dès que vous appuyez sur « Commencer le test ». Les questions se trouvent dans le PDF ; répondez (A/B/C/D) dans la feuille de réponses à côté. Le temps ne peut pas être arrêté, et les questions laissées vides comptent comme fausses.",
    startBtn: "Commencer le test",
    answerSheet: "Feuille de réponses",
    question: "Question",
    submitBtn: "Soumettre les réponses",
    submittedTitle: "Réponses soumises",
    thanks: (n) => `Merci ${n}, votre résultat a bien été enregistré.`,
    homeBtn: "Retour à l'accueil",
    answered: (a, t) => `${a}/${t} répondues`,
  },
  ar: {
    dir: "rtl",
    back: "رجوع",
    title: "فضاء التلميذ(ة)",
    loginTitle: "الدخول إلى التقويم التشخيصي",
    fullName: "الاسم الكامل",
    codeMassar: "رمز مسار Massar",
    password: "كلمة السر",
    testCode: "كود الاختبار (من الأستاذ)",
    continueBtn: "متابعة",
    searching: "جارٍ التحقق...",
    introNote: "سيبدأ المؤقت فور الضغط على «ابدأ الاختبار». الأسئلة في ملف PDF، وتضع إجاباتك (A/B/C/D) في استمارة منفصلة بجانبه. لا يمكن إيقاف المؤقت، والأسئلة الفارغة تُحتسب خاطئة.",
    startBtn: "ابدأ الاختبار",
    answerSheet: "استمارة الإجابة",
    question: "السؤال",
    submitBtn: "تسليم الإجابات",
    submittedTitle: "تم تسليم إجاباتك",
    thanks: (n) => `شكرًا ${n}، تم تسجيل نتيجتك بنجاح.`,
    homeBtn: "العودة للصفحة الرئيسية",
    answered: (a, t) => `${a}/${t} مجاب عنها`,
  },
};

function fmtTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function StudentPage() {
  const [lang, setLang] = useState("fr");
  const t = S[lang];

  const [phase, setPhase] = useState("login"); // login | intro | exam | result
  const [fullName, setFullName] = useState("");
  const [codeMassar, setCodeMassar] = useState("");
  const [password, setPassword] = useState("");
  const [testCode, setTestCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [session, setSession] = useState(null); // {studentId, studentName, test}
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const doLogin = async () => {
    setErr("");
    if (!fullName.trim() || !codeMassar.trim() || !password || !testCode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, codeMassar, password, testCode }),
      });
      const data = await res.json();
      setLoading(false);
      if (!data.ok) { setErr(data.error); return; }
      setSession(data);
      setPhase("intro");
    } catch (e) {
      setLoading(false);
      setErr("خطأ في الاتصال");
    }
  };

  const startExam = () => {
    setSecondsLeft(session.test.duration_minutes * 60);
    setPhase("exam");
  };

  const submitExam = useCallback(async () => {
    if (!session) return;
    clearInterval(timerRef.current);
    const res = await fetch("/api/submit-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId: session.test.id, studentId: session.studentId, answers }),
    });
    const data = await res.json();
    if (data.ok) {
      setResult({ score: data.score, total: data.total });
      setPhase("result");
    } else {
      setErr(data.error);
    }
  }, [session, answers]);

  useEffect(() => {
    if (phase !== "exam") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timerRef.current); submitExam(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, submitExam]);

  const setAns = (q, val) => setAnswers((a) => ({ ...a, [q]: val }));
  const answeredCount = Object.keys(answers).length;
  const title = lang === "ar" ? (session?.test?.title_ar || session?.test?.title_fr) : session?.test?.title_fr;

  return (
    <div dir={t.dir} data-lang={lang} style={{ minHeight: "100vh" }}>
      {phase !== "exam" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--line)" }}>
          <Link href="/" style={{ fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>← {t.back}</Link>
          <div className="display" style={{ fontWeight: 700 }}>{t.title}</div>
          <div style={{ display: "inline-flex", border: "1.5px solid var(--line)", borderRadius: 999, overflow: "hidden", fontSize: 12, fontWeight: 700 }}>
            <button onClick={() => setLang("fr")} style={{ padding: "4px 10px", border: "none", cursor: "pointer", background: lang === "fr" ? "var(--ink)" : "white", color: lang === "fr" ? "var(--paper)" : "var(--ink)" }}>FR</button>
            <button onClick={() => setLang("ar")} style={{ padding: "4px 10px", border: "none", cursor: "pointer", background: lang === "ar" ? "var(--ink)" : "white", color: lang === "ar" ? "var(--paper)" : "var(--ink)" }}>AR</button>
          </div>
        </div>
      )}

      {phase === "login" && (
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <h3 className="display" style={{ fontSize: 24, marginBottom: 24 }}>{t.loginTitle}</h3>
          <div style={{ display: "grid", gap: 12, marginBottom: 16, textAlign: "start" }}>
            <label style={{ fontSize: 13, fontWeight: 700 }}>{t.fullName}</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <label style={{ fontSize: 13, fontWeight: 700 }}>{t.codeMassar}</label>
            <input type="text" value={codeMassar} onChange={(e) => setCodeMassar(e.target.value)} />
            <label style={{ fontSize: 13, fontWeight: 700 }}>{t.password}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <label style={{ fontSize: 13, fontWeight: 700 }}>{t.testCode}</label>
            <input type="text" value={testCode} onChange={(e) => setTestCode(e.target.value.toUpperCase())} />
          </div>
          {err && <div style={{ color: "var(--danger)", fontSize: 14, marginBottom: 12 }}>{err}</div>}
          <button onClick={doLogin} disabled={loading} className="btn-primary" style={{ width: "100%" }}>
            {loading ? t.searching : t.continueBtn}
          </button>
        </div>
      )}

      {phase === "intro" && session && (
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <h3 className="display" style={{ fontSize: 24, marginBottom: 8 }}>{title}</h3>
          <p style={{ color: "var(--ink-2)", marginBottom: 24 }}>
            {session.test.num_questions} · {session.test.duration_minutes} min
          </p>
          <div className="card" style={{ textAlign: "start", marginBottom: 24, lineHeight: 1.7, fontSize: 14 }}>{t.introNote}</div>
          <button onClick={startExam} className="btn-amber" style={{ width: "100%" }}>{t.startBtn}</button>
        </div>
      )}

      {phase === "exam" && session && (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid var(--line)", background: secondsLeft <= 60 ? "#F7E3DC" : "var(--paper-2)" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
            <div className={`display ${secondsLeft <= 60 ? "timer-pulse" : ""}`} style={{ fontSize: 18, color: secondsLeft <= 60 ? "var(--danger)" : "var(--ink)" }}>
              {fmtTime(secondsLeft)}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{t.answered(answeredCount, session.test.num_questions)}</div>
          </div>
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <div style={{ flex: 1, background: "#e9e9e9" }}>
              <iframe title="pdf" src={session.test.pdf_url} style={{ width: "100%", height: "100%", border: 0 }} />
            </div>
            <div style={{ width: 320, overflowY: "auto", padding: 16, background: "white", borderInlineStart: "1px solid var(--line)" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{t.answerSheet}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {Array.from({ length: session.test.num_questions }).map((_, i) => {
                  const q = i + 1;
                  return (
                    <div key={q} className="card" style={{ background: "var(--paper-2)", padding: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{t.question} {q}</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {["A", "B", "C", "D"].map((opt) => (
                          <button key={opt} onClick={() => setAns(q, opt)} className={`choice-btn ${answers[q] === opt ? "selected" : ""}`} style={{ flex: 1, fontSize: 12, padding: 6 }}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={submitExam} className="btn-primary" style={{ width: "100%", marginTop: 16 }}>{t.submitBtn}</button>
            </div>
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <h3 className="display" style={{ fontSize: 24, marginBottom: 8 }}>{t.submittedTitle}</h3>
          <div className="display" style={{ fontSize: 48, margin: "24px 0" }}>{result.score}/{result.total}</div>
          <p style={{ color: "var(--ink-2)", marginBottom: 24 }}>{t.thanks(session?.studentName || "")}</p>
          <Link href="/"><button className="btn-primary" style={{ width: "100%" }}>{t.homeBtn}</button></Link>
        </div>
      )}
    </div>
  );
}
