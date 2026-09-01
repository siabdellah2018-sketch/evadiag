import { jsPDF } from "jspdf";

// يولّد ورقة إجابة PDF واحدة لتلميذ (اسمه، رمز Massar، المستوى، القسم، إجاباته)
export function studentAnswerPdf(doc, r, test, startY = 15) {
  let y = startY;
  doc.setFontSize(14);
  doc.text(test.title_fr || "", 15, y); y += 8;
  doc.setFontSize(11);
  doc.text(`Nom: ${r.fullName || ""}`, 15, y); y += 6;
  doc.text(`Code Massar: ${r.codeMassar || ""}`, 15, y); y += 6;
  doc.text(`Niveau: ${r.level || "-"}    Section: ${r.section || "-"}`, 15, y); y += 6;
  doc.text(`Score: ${r.score}/${r.total}`, 15, y); y += 10;
  doc.setFontSize(10);
  const answers = r.answers || {};
  for (let i = 1; i <= test.num_questions; i++) {
    doc.text(`Q${i}: ${answers[i] || "-"}`, 15, y);
    y += 6;
    if (y > 280) { doc.addPage(); y = 15; }
  }
  return y;
}

export function exportSingleStudentPdf(r, test) {
  const doc = new jsPDF();
  studentAnswerPdf(doc, r, test);
  doc.save(`${r.codeMassar || r.fullName}-${test.code}.pdf`);
}

export function exportBulkPdf(rows, test, sectionLabel) {
  const doc = new jsPDF();
  rows.forEach((r, idx) => {
    if (idx > 0) doc.addPage();
    studentAnswerPdf(doc, r, test);
  });
  doc.save(`${test.code}-${sectionLabel || "tous"}.pdf`);
}
