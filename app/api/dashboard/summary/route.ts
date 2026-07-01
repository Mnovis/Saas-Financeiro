import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(req.url);
  const hoje = new Date();
  const mes = Number(searchParams.get("mes") ?? hoje.getMonth() + 1);
  const ano = Number(searchParams.get("ano") ?? hoje.getFullYear());

  const inicioMes = new Date(ano, mes - 1, 1);
  const fimMes = new Date(ano, mes, 0, 23, 59, 59);

  const [receitasMes, despesasMes] = await Promise.all([
    prisma.receita.findMany({
      where: { userId, data: { gte: inicioMes, lte: fimMes } },
      include: { categoria: true },
    }),
    prisma.despesa.findMany({
      where: { userId, data: { gte: inicioMes, lte: fimMes } },
      include: { categoria: true },
    }),
  ]);

  const totalReceitas = receitasMes.reduce((acc, r) => acc + Number(r.valor), 0);
  const totalDespesas = despesasMes.reduce((acc, d) => acc + Number(d.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  // Agrupamento por categoria (despesas) para gráfico de pizza
  const despesasPorCategoria = Object.values(
    despesasMes.reduce((acc, d) => {
      const key = d.categoria.id;
      if (!acc[key]) {
        acc[key] = { nome: d.categoria.nome, cor: d.categoria.cor, valor: 0 };
      }
      acc[key].valor += Number(d.valor);
      return acc;
    }, {} as Record<string, { nome: string; cor: string; valor: number }>)
  );

  const receitasPorCategoria = Object.values(
    receitasMes.reduce((acc, r) => {
      const key = r.categoria.id;
      if (!acc[key]) {
        acc[key] = { nome: r.categoria.nome, cor: r.categoria.cor, valor: 0 };
      }
      acc[key].valor += Number(r.valor);
      return acc;
    }, {} as Record<string, { nome: string; cor: string; valor: number }>)
  );

  // Evolução dos últimos 6 meses
  const evolucao = [];
  for (let i = 5; i >= 0; i--) {
    const data = new Date(ano, mes - 1 - i, 1);
    const inicio = new Date(data.getFullYear(), data.getMonth(), 1);
    const fim = new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59);

    const [rec, desp] = await Promise.all([
      prisma.receita.aggregate({
        where: { userId, data: { gte: inicio, lte: fim } },
        _sum: { valor: true },
      }),
      prisma.despesa.aggregate({
        where: { userId, data: { gte: inicio, lte: fim } },
        _sum: { valor: true },
      }),
    ]);

    evolucao.push({
      mes: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(data),
      receitas: Number(rec._sum.valor ?? 0),
      despesas: Number(desp._sum.valor ?? 0),
    });
  }

  const ultimasTransacoes = [
    ...receitasMes.map((r) => ({ ...r, tipo: "RECEITA" as const })),
    ...despesasMes.map((d) => ({ ...d, tipo: "DESPESA" as const })),
  ]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 8);

  return NextResponse.json({
    totalReceitas,
    totalDespesas,
    saldo,
    despesasPorCategoria,
    receitasPorCategoria,
    evolucao,
    ultimasTransacoes,
  });
}
