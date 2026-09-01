"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { exportSingleStudentPdf, exportBulkPdf } from "../../lib/exportPdf";

const TT = {
  fr: {
    dir: "ltr", back: "Retour", title: "Espace enseignant(e)",
    loginTitle: "Accès enseignant(e)", accessCode: "Code d'accès (compte principal)",
    orLoginAs: "— ou connectez-vous avec un compte enseignant —",
    teacherName: "Nom", teacherPassword: "Mot de passe", loginBtn: "Entrer", wrong: "Identifiants incorrects",
    tabCreateTest: "Nouveau test", tabStudents: "Élèves", tabResults: "Résultats", tabHistory: "Historique", tabTeachers: "Enseignants", tabLevels: "Niveaux & sections",
    titleFr: "Titre (français)", titleAr: "Titre (arabe) — optionnel", duration: "Durée (minutes)", numQuestions: "Nombre de questions",
    pdfLabel: "Fichier PDF des questions", answersLabel: "Réponses correctes", question: "Question",
    createBtn: "Créer le test", creating: "Création...", testCreated: "Test créé ! Code à partager :",
    studentsHelp: "Un élève par ligne : Nom complet ; Code Massar ; Mot de passe ; Niveau ; Section",
    studentsPlaceholder: "Ahmed Benali ; G123456789 ; azert123 ; 1ère Bac SE ; 1APIC",
    createStudentsBtn: "Créer / mettre à jour", studentsCreated: (n) => `${n} compte(s) créé(s)/mis à jour.`,
    importExcel: "Importer depuis Excel", exportExcelStudents: "Exporter la liste (Excel)",
    resultsCodeLabel: "Code du test", loadBtn: "Afficher", noResults: "Aucun résultat pour l'instant.",
    showAnswers: "Afficher les réponses correctes aux élèves", hideAnswers: "Masquer les réponses correctes",
    grantRetryLabel: "Code Massar de l'élève", grantRetryBtn: "Accorder une nouvelle tentative", granted: "Tentative accordée.",
    filterSection: "Filtrer par section", allSections: "Toutes les sections",
    exportExcelResults: "Exporter résultats (Excel)", exportPdfAll: "Exporter réponses (PDF, groupe)",
    exportPdfOne: "PDF", questionAnalysis: "Analyse par question", wrongOf: (p) => `${p}% d'erreurs`,
    distribution: "Répartition des notes", weak: "Faible (<50%)", average: "Moyen (50-69%)", good: "Bon (≥70%)",
    historyTitle: "Historique des tests", createdOn: "Créé le", submissions: "réponses", viewResults: "Voir les résultats",
    teachersTitle: "Comptes enseignants (visible pour le compte principal)", addTeacher: "Ajouter un(e) enseignant(e)",
    newTeacherName: "Nom du/de la nouvel(le) enseignant(e)", newTeacherPassword: "Mot de passe", addBtn: "Ajouter", teacherAdded: "Compte ajouté.",
    selectLevel: "Niveau", levelsTitle: "Niveaux et sections", addLevel: "Ajouter un niveau", newLevelName: "Nom du niveau",
    addSection: "Ajouter une section", newSectionName: "Nom de la section", editBtn: "Modifier", saveBtn: "Enregistrer", deleteBtn: "Supprimer",
    confirmDelete: "Confirmer la suppression ?", currentStudents: "Liste des élèves", deleteStudentConfirm: "Supprimer cet élève ?",
    deleteTeacherConfirm: "Supprimer ce compte enseignant ?", noStudents: "Aucun élève pour l'instant.", noTeachers: "Aucun autre compte pour l'instant.",
    loggedAs: (n) => `Connecté en tant que : ${n}`,
  },
  ar: {
    dir: "rtl", back: "رجوع", title: "فضاء الأستاذ(ة)",
    loginTitle: "دخول الأستاذ(ة)", accessCode: "كود الدخول (الحساب الرئيسي)",
    orLoginAs: "— أو الدخول بحساب أستاذ —",
    teacherName: "الاسم", teacherPassword: "كلمة السر", loginBtn: "دخول", wrong: "بيانات الدخول غير صحيحة",
    tabCreateTest: "اختبار جديد", tabStudents: "التلاميذ", tabResults: "النتائج", tabHistory: "السجل", tabTeachers: "الأساتذة", tabLevels: "المستويات والأقسام",
    titleFr: "العنوان (بالفرنسية)", titleAr: "العنوان (بالعربية) — اختياري", duration: "المدة (بالدقائق)", numQuestions: "عدد الأسئلة",
    pdfLabel: "ملف الأسئلة PDF", answersLabel: "الأجوبة الصحيحة", question: "السؤال",
    createBtn: "إنشاء الاختبار", creating: "جارٍ الإنشاء...", testCreated: "تم إنشاء الاختبار! الكود:",
    studentsHelp: "تلميذ لكل سطر: الاسم الكامل ; رمز Massar ; كلمة السر ; المستوى ; القسم",
    studentsPlaceholder: "أحمد بنعلي ; G123456789 ; azert123 ; 1ère Bac SE ; 1APIC",
    createStudentsBtn: "إنشاء / تحديث", studentsCreated: (n) => `تم إنشاء/تحديث ${n} حساب.`,
    importExcel: "استيراد من Excel", exportExcelStudents: "تصدير اللائحة (Excel)",
    resultsCodeLabel: "كود الاختبار", loadBtn: "عرض", noResults: "لا توجد نتائج بعد.",
    showAnswers: "إظهار الأجوبة الصحيحة للتلاميذ", hideAnswers: "إخفاء الأجوبة الصحيحة",
    grantRetryLabel: "رمز Massar الخاص بالتلميذ", grantRetryBtn: "منح محاولة إضافية", granted: "تم منح محاولة إضافية.",
    filterSection: "تصفية حسب القسم", allSections: "كل الأقسام",
    exportExcelResults: "تصدير النتائج (Excel)", exportPdfAll: "تصدير الإجابات (PDF جماعي)",
    exportPdfOne: "PDF", questionAnalysis: "تحليل حسب السؤال", wrongOf: (p) => `${p}% نسبة الخطأ`,
    distribution: "توزيع النقط", weak: "ضعيف (<50%)", average: "متوسط (50-69%)", good: "جيد (≥70%)",
    historyTitle: "سجل الاختبارات", createdOn: "أُنشئ في", submissions: "مشاركة", viewResults: "عرض النتائج",
    teachersTitle: "حسابات الأساتذة (يظهر فقط للحساب الرئيسي)", addTeacher: "إضافة أستاذ(ة)",
    newTeacherName: "اسم الأستاذ(ة) الجديد", newTeacherPassword: "كلمة السر", addBtn: "إضافة", teacherAdded: "تم إضافة الحساب.",
    selectLevel: "المستوى", levelsTitle: "المستويات والأقسام", addLevel: "إضافة مستوى", newLevelName: "اسم المستوى",
    addSection: "إضافة قسم", newSectionName: "اسم القسم", editBtn: "تعديل", saveBtn: "حفظ", deleteBtn: "حذف",
    confirmDelete: "هل تريد تأكيد الحذف؟", currentStudents: "لائحة التلاميذ", deleteStudentConfirm: "هل تريد حذف هذا التلميذ؟",
    deleteTeacherConfirm: "هل تريد حذف حساب هذا الأستاذ؟", noStudents: "لا يوجد تلاميذ بعد.", noTeachers: "لا توجد حسابات أخرى بعد.",
    loggedAs: (n) => `متصل باسم: ${n}`,
  },
};

export default function TeacherPage() {
  const [lang, setLang] = useState("fr");
  const t = TT[lang];

  const [authed, setAuthed] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [teacherLabel, setTeacherLabel] = useState("");
  const [masterInput, setMasterInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("create");

  // create test
  const [titleFr, setTitleFr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [duration, setDuration] = useState(20);
  const [numQuestions, setNumQuestions] = useState(10);
  const [answers, setAnswers] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState("");
  const [createErr, setCreateErr] = useState("");

  // students
  const [studentsText, setStudentsText] = useState("");
  const [studentsMsg, setStudentsMsg] = useState("");
  const [studentsBusy, setStudentsBusy] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  // results
  const [resultsCode, setResultsCode] = useState("");
  const [resultsData, setResultsData] = useState(null);
  const [retryCodeMassar, setRetryCodeMassar] = useState("");
  const [retryMsg, setRetryMsg] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  // history
  const [history, setHistory] = useState(null);

  // teachers
  const [newTName, setNewTName] = useState("");
  const [newTPass, setNewTPass] = useState("");
  const [teacherMsg, setTeacherMsg] = useState("");
  const [teachersList, setTeachersList] = useState(null);

  // levels & sections
  const [levels, setLevels] = useState([]);
  const [newLevelName, setNewLevelName] = useState("");
  const [editingLevelId, setEditingLevelId] = useState(null);
  const [editLevelName, setEditLevelName] = useState("");
  const [newSectionNameByLevel, setNewSectionNameByLevel] = useState({});
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionName, setEditSectionName] = useState("");

  // students list (for delete)
  const [studentsList, setStudentsList] = useState(null);

  useEffect(() => {
    if (authed) loadLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const loginMaster = async () => {
    setErr("");
    const res = await fetch("/api/teacher-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: masterInput }) });
    const data = await res.json();
    if (data.ok) { setAuthed(true); setAuthCode(data.authCode); setIsMaster(true); setTeacherLabel(data.name); }
    else setErr(t.wrong);
  };

  const loginTeacher = async () => {
    setErr("");
    const res = await fetch("/api/teacher-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nameInput, password: passInput }) });
    const data = await res.json();
    if (data.ok) { setAuthed(true); setAuthCode(data.authCode); setIsMaster(false); setTeacherLabel(data.name); }
    else setErr(t.wrong);
  };

  const setAns = (q, val) => setAnswers((a) => ({ ...a, [q]: val }));

  const createTest = async () => {
    setCreateErr(""); setCreating(true);
    const fd = new FormData();
    fd.append("teacherCode", authCode);
    fd.append("titleFr", titleFr); fd.append("titleAr", titleAr);
    fd.append("levelId", selectedLevelId);
    fd.append("duration", duration); fd.append("numQuestions", numQuestions);
    fd.append("answerKey", JSON.stringify(answers)); fd.append("pdfFile", pdfFile);
    const res = await fetch("/api/create-test", { method: "POST", body: fd });
    const data = await res.json();
    setCreating(false);
    if (data.ok) setCreatedCode(data.code); else setCreateErr(data.error);
  };

  const createStudents = async () => {
    setStudentsBusy(true); setStudentsMsg("");
    const rows = studentsText.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [fullName, codeMassar, password, level, section] = l.split(";").map((x) => x && x.trim());
      return { fullName, codeMassar, password, level, section };
    });
    const res = await fetch("/api/create-students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, students: rows }) });
    const data = await res.json();
    setStudentsBusy(false);
    setStudentsMsg(data.ok ? t.studentsCreated(data.created) : data.error);
  };

  const importExcel = async () => {
    if (!excelFile) return;
    setStudentsBusy(true); setStudentsMsg("");
    const fd = new FormData();
    fd.append("teacherCode", authCode); fd.append("file", excelFile);
    const res = await fetch("/api/import-students-excel", { method: "POST", body: fd });
    const data = await res.json();
    setStudentsBusy(false);
    setStudentsMsg(data.ok ? t.studentsCreated(data.created) : data.error);
  };

  const exportStudentsExcel = async () => {
    const res = await fetch("/api/list-students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode }) });
    const data = await res.json();
    if (!data.ok) return;
    const ws = XLSX.utils.json_to_sheet(data.students.map((s) => ({
      "الاسم الكامل": s.full_name, "رمز Massar": s.code_massar, "المستوى": s.level || "", "القسم": s.section || "",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلاب");
    XLSX.writeFile(wb, "liste-eleves.xlsx");
  };

  const loadResults = async () => {
    const res = await fetch("/api/test-results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, testCode: resultsCode.trim().toUpperCase() }) });
    const data = await res.json();
    setResultsData(data.ok ? data : { error: data.error });
    setSectionFilter("");
  };

  const toggleAnswers = async () => {
    const show = !resultsData.test.show_correct_answers;
    await fetch("/api/toggle-answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, testCode: resultsCode.trim().toUpperCase(), show }) });
    loadResults();
  };

  const grantRetry = async () => {
    setRetryMsg("");
    const res = await fetch("/api/grant-retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, testCode: resultsCode.trim().toUpperCase(), codeMassar: retryCodeMassar }) });
    const data = await res.json();
    setRetryMsg(data.ok ? t.granted : data.error);
  };

  const filteredResults = resultsData?.results?.filter((r) => !sectionFilter || r.section === sectionFilter) || [];
  const sections = [...new Set((resultsData?.results || []).map((r) => r.section).filter(Boolean))];

  const exportResultsExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredResults.map((r) => ({
      "الاسم الكامل": r.fullName, "رمز Massar": r.codeMassar, "المستوى": r.level || "", "القسم": r.section || "",
      "النقطة": `${r.score}/${r.total}`, "التاريخ": new Date(r.submittedAt).toLocaleString(),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "النتائج");
    XLSX.writeFile(wb, `resultats-${resultsCode}.xlsx`);
  };

  const loadHistory = async () => {
    const res = await fetch("/api/list-tests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode }) });
    const data = await res.json();
    setHistory(data.ok ? data.tests : []);
  };

  const addTeacher = async () => {
    setTeacherMsg("");
    const res = await fetch("/api/create-teacher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterCode: authCode, name: newTName, password: newTPass }) });
    const data = await res.json();
    setTeacherMsg(data.ok ? t.teacherAdded : data.error);
    if (data.ok) { setNewTName(""); setNewTPass(""); loadTeachers(); }
  };

  const loadTeachers = async () => {
    const res = await fetch("/api/list-teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterCode: authCode }) });
    const data = await res.json();
    setTeachersList(data.ok ? data.teachers : []);
  };

  const deleteTeacher = async (id) => {
    if (!confirm(t.deleteTeacherConfirm)) return;
    await fetch("/api/delete-teacher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterCode: authCode, id }) });
    loadTeachers();
  };

  const loadLevels = async () => {
    const res = await fetch("/api/list-levels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode }) });
    const data = await res.json();
    if (data.ok) setLevels(data.levels);
  };

  const addLevel = async () => {
    if (!newLevelName.trim()) return;
    await fetch("/api/manage-levels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, action: "create", name: newLevelName }) });
    setNewLevelName(""); loadLevels();
  };
  const saveLevel = async (id) => {
    await fetch("/api/manage-levels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, action: "update", id, name: editLevelName }) });
    setEditingLevelId(null); loadLevels();
  };
  const deleteLevel = async (id) => {
    if (!confirm(t.confirmDelete)) return;
    await fetch("/api/manage-levels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, action: "delete", id }) });
    loadLevels();
  };

  const addSection = async (levelId) => {
    const name = newSectionNameByLevel[levelId];
    if (!name?.trim()) return;
    await fetch("/api/manage-sections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, action: "create", levelId, name }) });
    setNewSectionNameByLevel((p) => ({ ...p, [levelId]: "" })); loadLevels();
  };
  const saveSection = async (id) => {
    await fetch("/api/manage-sections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, action: "update", id, name: editSectionName }) });
    setEditingSectionId(null); loadLevels();
  };
  const deleteSection = async (id) => {
    if (!confirm(t.confirmDelete)) return;
    await fetch("/api/manage-sections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, action: "delete", id }) });
    loadLevels();
  };

  const loadStudentsList = async () => {
    const res = await fetch("/api/list-students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode }) });
    const data = await res.json();
    setStudentsList(data.ok ? data.students : []);
  };

  const deleteStudent = async (codeMassar) => {
    if (!confirm(t.deleteStudentConfirm)) return;
    await fetch("/api/delete-student", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherCode: authCode, codeMassar }) });
    loadStudentsList();
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
        <div style={{ maxWidth: 380, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
          <h3 className="display" style={{ fontSize: 22, marginBottom: 20 }}>{t.loginTitle}</h3>
          <input type="password" value={masterInput} onChange={(e) => setMasterInput(e.target.value)} placeholder={t.accessCode} style={{ marginBottom: 10 }} />
          <button onClick={loginMaster} className="btn-primary" style={{ width: "100%", marginBottom: 24 }}>{t.loginBtn}</button>
          <p style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 12 }}>{t.orLoginAs}</p>
          <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder={t.teacherName} style={{ marginBottom: 10 }} />
          <input type="password" value={passInput} onChange={(e) => setPassInput(e.target.value)} placeholder={t.teacherPassword} style={{ marginBottom: 10 }} />
          <button onClick={loginTeacher} className="btn-amber" style={{ width: "100%" }}>{t.loginBtn}</button>
          {err && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{err}</div>}
        </div>
      )}

      {authed && (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px" }}>
          <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 12 }}>{t.loggedAs(teacherLabel)}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {["create", "students", "results", "history", "levels", ...(isMaster ? ["teachers"] : [])].map((tab_) => (
              <button key={tab_} onClick={() => { setTab(tab_); if (tab_ === "history") loadHistory(); if (tab_ === "students") loadStudentsList(); if (tab_ === "teachers") loadTeachers(); if (tab_ === "levels") loadLevels(); }}
                style={tab === tab_ ? { padding: "8px 16px", fontSize: 13, background: "var(--ink)", color: "var(--paper)", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 } : { padding: "8px 16px", fontSize: 13, background: "white", border: "1px solid var(--line)", borderRadius: 6, cursor: "pointer" }}>
                {tab_ === "create" ? t.tabCreateTest : tab_ === "students" ? t.tabStudents : tab_ === "results" ? t.tabResults : tab_ === "history" ? t.tabHistory : tab_ === "levels" ? t.tabLevels : t.tabTeachers}
              </button>
            ))}
          </div>

          {tab === "create" && !createdCode && (
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>{t.titleFr}</label>
              <input type="text" value={titleFr} onChange={(e) => setTitleFr(e.target.value)} />
              <label style={{ fontSize: 13, fontWeight: 700 }}>{t.titleAr}</label>
              <input type="text" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
              <label style={{ fontSize: 13, fontWeight: 700 }}>{t.selectLevel}</label>
              <select value={selectedLevelId} onChange={(e) => setSelectedLevelId(e.target.value)} style={{ padding: 12, border: "2px solid var(--line)", borderRadius: 6, background: "white" }}>
                <option value="">—</option>
                {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 13, fontWeight: 700 }}>{t.duration}</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 700 }}>{t.numQuestions}</label><input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} /></div>
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
              <button onClick={createTest} disabled={creating || !titleFr || !selectedLevelId || !pdfFile} className="btn-primary">{creating ? t.creating : t.createBtn}</button>
            </div>
          )}
          {tab === "create" && createdCode && (
            <div style={{ textAlign: "center", padding: 32 }}>
              <p style={{ marginBottom: 12 }}>{t.testCreated}</p>
              <div className="display" style={{ fontSize: 32, background: "var(--ink)", color: "var(--amber)", display: "inline-block", padding: "12px 32px", borderRadius: 8 }}>{createdCode}</div>
              <div style={{ marginTop: 16 }}><button onClick={() => setCreatedCode("")} className="btn-amber">{lang === "ar" ? "إنشاء اختبار آخر" : "Créer un autre test"}</button></div>
            </div>
          )}

          {tab === "students" && (
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gap: 12 }}>
                <p style={{ fontSize: 13, color: "var(--ink-2)" }}>{t.studentsHelp}</p>
                <textarea value={studentsText} onChange={(e) => setStudentsText(e.target.value)} placeholder={t.studentsPlaceholder} rows={8} style={{ padding: 12, border: "2px solid var(--line)", borderRadius: 6, fontFamily: "monospace", fontSize: 13 }} />
                <button onClick={createStudents} disabled={studentsBusy || !studentsText.trim()} className="btn-primary">{t.createStudentsBtn}</button>
              </div>
              <div className="card" style={{ display: "grid", gap: 10 }}>
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setExcelFile(e.target.files[0])} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={importExcel} disabled={studentsBusy || !excelFile} className="btn-amber" style={{ flex: 1 }}>{t.importExcel}</button>
                  <button onClick={exportStudentsExcel} className="btn-primary" style={{ flex: 1 }}>{t.exportExcelStudents}</button>
                </div>
              </div>
              {studentsMsg && <div style={{ fontSize: 13 }}>{studentsMsg}</div>}

              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{t.currentStudents}</div>
                {(studentsList || []).length === 0 && <p style={{ fontSize: 13, color: "var(--ink-2)" }}>{t.noStudents}</p>}
                {(studentsList || []).map((s) => (
                  <div key={s.code_massar} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.full_name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{s.code_massar} · {s.level || "-"} · {s.section || "-"}</div>
                    </div>
                    <button onClick={() => deleteStudent(s.code_massar)} style={{ fontSize: 12, padding: "6px 10px", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: 6, background: "white", cursor: "pointer" }}>{t.deleteBtn}</button>
                  </div>
                ))}
              </div>
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

                  {sections.length > 0 && (
                    <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} style={{ padding: 10, border: "2px solid var(--line)", borderRadius: 6 }}>
                      <option value="">{t.allSections}</option>
                      {sections.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={exportResultsExcel} className="btn-primary" style={{ fontSize: 13 }}>{t.exportExcelResults}</button>
                    <button onClick={() => exportBulkPdf(filteredResults, resultsData.test, sectionFilter)} className="btn-amber" style={{ fontSize: 13 }}>{t.exportPdfAll}</button>
                  </div>

                  <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.questionAnalysis}</div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {resultsData.questionStats.map((qs) => (
                        <div key={qs.question} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 70, fontSize: 12 }}>{t.question} {qs.question}</div>
                          <div style={{ flex: 1, background: "var(--paper-2)", borderRadius: 4, height: 14, overflow: "hidden" }}>
                            <div style={{ width: `${qs.wrongPercent}%`, background: qs.wrongPercent >= 50 ? "var(--danger)" : "var(--amber)", height: "100%" }} />
                          </div>
                          <div style={{ width: 90, fontSize: 12, textAlign: "end" }}>{t.wrongOf(qs.wrongPercent)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.distribution}</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {[
                        { label: t.weak, val: resultsData.distribution.weak, color: "var(--danger)" },
                        { label: t.average, val: resultsData.distribution.average, color: "var(--amber)" },
                        { label: t.good, val: resultsData.distribution.good, color: "var(--success)" },
                      ].map((d) => {
                        const total = resultsData.distribution.totalStudents || 1;
                        const pct = Math.round((d.val / total) * 100);
                        return (
                          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 110, fontSize: 12 }}>{d.label}</div>
                            <div style={{ flex: 1, background: "var(--paper-2)", borderRadius: 4, height: 14, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, background: d.color, height: "100%" }} />
                            </div>
                            <div style={{ width: 50, fontSize: 12, textAlign: "end" }}>{d.val}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    {filteredResults.length === 0 && <p style={{ fontSize: 13, color: "var(--ink-2)" }}>{t.noResults}</p>}
                    {filteredResults.map((r, i) => (
                      <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{r.fullName}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{r.codeMassar} · {r.level || "-"} · {r.section || "-"}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="display" style={{ fontSize: 18 }}>{r.score}/{r.total}</div>
                          <button onClick={() => exportSingleStudentPdf(r, resultsData.test)} style={{ fontSize: 12, padding: "6px 10px", border: "1px solid var(--line)", borderRadius: 6, background: "white", cursor: "pointer" }}>{t.exportPdfOne}</button>
                        </div>
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

          {tab === "history" && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 700 }}>{t.historyTitle}</div>
              {(history || []).map((h) => (
                <div key={h.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{lang === "ar" ? (h.title_ar || h.title_fr) : h.title_fr}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{h.code} · {t.createdOn} {new Date(h.created_at).toLocaleDateString()} · {h.submissions} {t.submissions}</div>
                  </div>
                  <button onClick={() => { setResultsCode(h.code); setTab("results"); setTimeout(loadResults, 0); }} className="btn-primary" style={{ fontSize: 12, padding: "8px 12px" }}>{t.viewResults}</button>
                </div>
              ))}
              {history && history.length === 0 && <p style={{ fontSize: 13, color: "var(--ink-2)" }}>—</p>}
            </div>
          )}

          {tab === "teachers" && isMaster && (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>{t.teachersTitle}</div>
              <div className="card" style={{ display: "grid", gap: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>{t.newTeacherName}</label>
                <input type="text" value={newTName} onChange={(e) => setNewTName(e.target.value)} />
                <label style={{ fontSize: 13, fontWeight: 700 }}>{t.newTeacherPassword}</label>
                <input type="password" value={newTPass} onChange={(e) => setNewTPass(e.target.value)} />
                <button onClick={addTeacher} className="btn-primary">{t.addBtn}</button>
                {teacherMsg && <div style={{ fontSize: 13 }}>{teacherMsg}</div>}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {(teachersList || []).length === 0 && <p style={{ fontSize: 13, color: "var(--ink-2)" }}>{t.noTeachers}</p>}
                {(teachersList || []).map((tch) => (
                  <div key={tch.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700 }}>{tch.name}</div>
                    <button onClick={() => deleteTeacher(tch.id)} style={{ fontSize: 12, padding: "6px 10px", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: 6, background: "white", cursor: "pointer" }}>{t.deleteBtn}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "levels" && (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ fontWeight: 700 }}>{t.levelsTitle}</div>
              <div className="card" style={{ display: "flex", gap: 8 }}>
                <input type="text" value={newLevelName} onChange={(e) => setNewLevelName(e.target.value)} placeholder={t.newLevelName} />
                <button onClick={addLevel} className="btn-primary" style={{ whiteSpace: "nowrap" }}>{t.addLevel}</button>
              </div>

              {levels.map((l) => (
                <div key={l.id} className="card" style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {editingLevelId === l.id ? (
                      <div style={{ display: "flex", gap: 8, flex: 1 }}>
                        <input type="text" value={editLevelName} onChange={(e) => setEditLevelName(e.target.value)} style={{ flex: 1 }} />
                        <button onClick={() => saveLevel(l.id)} className="btn-primary" style={{ fontSize: 12, padding: "8px 12px" }}>{t.saveBtn}</button>
                      </div>
                    ) : (
                      <div className="display" style={{ fontSize: 16 }}>{l.name}</div>
                    )}
                    {editingLevelId !== l.id && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { setEditingLevelId(l.id); setEditLevelName(l.name); }} style={{ fontSize: 12, padding: "6px 10px", border: "1px solid var(--line)", borderRadius: 6, background: "white", cursor: "pointer" }}>{t.editBtn}</button>
                        <button onClick={() => deleteLevel(l.id)} style={{ fontSize: 12, padding: "6px 10px", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: 6, background: "white", cursor: "pointer" }}>{t.deleteBtn}</button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: 6, paddingInlineStart: 16 }}>
                    {l.sections.map((s) => (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper-2)", borderRadius: 6, padding: 8 }}>
                        {editingSectionId === s.id ? (
                          <div style={{ display: "flex", gap: 8, flex: 1 }}>
                            <input type="text" value={editSectionName} onChange={(e) => setEditSectionName(e.target.value)} style={{ flex: 1, padding: 6 }} />
                            <button onClick={() => saveSection(s.id)} className="btn-primary" style={{ fontSize: 11, padding: "6px 10px" }}>{t.saveBtn}</button>
                          </div>
                        ) : (
                          <div style={{ fontSize: 13 }}>{s.name}</div>
                        )}
                        {editingSectionId !== s.id && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => { setEditingSectionId(s.id); setEditSectionName(s.name); }} style={{ fontSize: 11, padding: "5px 8px", border: "1px solid var(--line)", borderRadius: 5, background: "white", cursor: "pointer" }}>{t.editBtn}</button>
                            <button onClick={() => deleteSection(s.id)} style={{ fontSize: 11, padding: "5px 8px", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: 5, background: "white", cursor: "pointer" }}>{t.deleteBtn}</button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={newSectionNameByLevel[l.id] || ""} onChange={(e) => setNewSectionNameByLevel((p) => ({ ...p, [l.id]: e.target.value }))} placeholder={t.newSectionName} style={{ flex: 1, padding: 8, fontSize: 13 }} />
                      <button onClick={() => addSection(l.id)} className="btn-amber" style={{ fontSize: 12, padding: "8px 12px" }}>{t.addSection}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
