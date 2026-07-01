import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatarMoeda } from "./utils";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface DadosPDF {
  usuario: string;
  periodo: { mes: number; ano: number };
  receitas: { descricao: string; categoria: string; data: string; valor: number }[];
  despesas: { descricao: string; categoria: string; data: string; valor: number }[];
}

export function gerarPDF(dados: DadosPDF) {
  const doc = new jsPDF();
  const { periodo, receitas, despesas, usuario } = dados;
  const periodo_str = `${MESES[periodo.mes - 1]} ${periodo.ano}`;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241);
  doc.text("💰 Relatório Financeiro", 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Período: ${periodo_str}`, 14, 27);
  doc.text(`Usuário: ${usuario}`, 14, 33);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 39);

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 43, 196, 43);

  // Resumo
  const totalReceitas = receitas.reduce((a, r) => a + r.valor, 0);
  const totalDespesas = despesas.reduce((a, d) => a + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text("Resumo", 14, 52);

  autoTable(doc, {
    startY: 56,
    head: [["Item", "Valor"]],
    body: [
      ["Total de Receitas", formatarMoeda(totalReceitas)],
      ["Total de Despesas", formatarMoeda(totalDespesas)],
      ["Saldo", formatarMoeda(saldo)],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [99, 102, 241] },
    columnStyles: { 1: { halign: "right" } },
    theme: "striped",
  });

  // Receitas
  const yReceitas = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text("Receitas", 14, yReceitas);

  autoTable(doc, {
    startY: yReceitas + 4,
    head: [["Descrição", "Categoria", "Data", "Valor"]],
    body: receitas.map((r) => [
      r.descricao,
      r.categoria,
      new Date(r.data).toLocaleDateString("pt-BR"),
      formatarMoeda(r.valor),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 197, 94] },
    columnStyles: { 3: { halign: "right" } },
    theme: "striped",
  });

  // Despesas
  const yDespesas = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text("Despesas", 14, yDespesas);

  autoTable(doc, {
    startY: yDespesas + 4,
    head: [["Descrição", "Categoria", "Data", "Valor"]],
    body: despesas.map((d) => [
      d.descricao,
      d.categoria,
      new Date(d.data).toLocaleDateString("pt-BR"),
      formatarMoeda(d.valor),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [239, 68, 68] },
    columnStyles: { 3: { halign: "right" } },
    theme: "striped",
  });

  doc.save(`financeiro-${periodo.ano}-${String(periodo.mes).padStart(2, "0")}.pdf`);
}
