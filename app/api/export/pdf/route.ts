import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Esta rota retorna os dados consolidados do período para que o componente
// client-side monte o PDF com jsPDF (evita depender de libs de renderização
// de PDF no servidor, que exigem binários extras).
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

  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);

  const [receitas, despesas, user] = await Promise.all([
    prisma.receita.findMany({
      where: { userId, data: { gte: inicio, lte: fim } },
      include: { categoria: true },
      orderBy: { data: "asc" },
    }),
    prisma.despesa.findMany({
      where: { userId, data: { gte: inicio, lte: fim } },
      include: { categoria: true },
      orderBy: { data: "asc" },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  return NextResponse.json({
    usuario: user?.name ?? user?.email,
    periodo: { mes, ano },
    receitas: receitas.map((r) => ({
      descricao: r.descricao,
      categoria: r.categoria.nome,
      data: r.data,
      valor: Number(r.valor),
    })),
    despesas: despesas.map((d) => ({
      descricao: d.descricao,
      categoria: d.categoria.nome,
      data: d.data,
      valor: Number(d.valor),
    })),
  });
}
