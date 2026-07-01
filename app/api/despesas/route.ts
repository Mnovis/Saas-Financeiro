import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { despesaSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes");
  const ano = searchParams.get("ano");
  const categoriaId = searchParams.get("categoriaId");

  const where: Record<string, unknown> = { userId };

  if (mes && ano) {
    const inicio = new Date(Number(ano), Number(mes) - 1, 1);
    const fim = new Date(Number(ano), Number(mes), 0, 23, 59, 59);
    where.data = { gte: inicio, lte: fim };
  } else if (ano) {
    where.data = { gte: new Date(Number(ano), 0, 1), lte: new Date(Number(ano), 11, 31, 23, 59, 59) };
  }

  if (categoriaId) where.categoriaId = categoriaId;

  const despesas = await prisma.despesa.findMany({
    where,
    include: { categoria: true },
    orderBy: { data: "desc" },
  });

  return NextResponse.json(despesas);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const body = await req.json();
  const parsed = despesaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const categoria = await prisma.categoria.findFirst({
    where: { id: parsed.data.categoriaId, userId, tipo: "DESPESA" },
  });
  if (!categoria) {
    return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  }

  const despesa = await prisma.despesa.create({
    data: { ...parsed.data, observacao: parsed.data.observacao || null, userId },
    include: { categoria: true },
  });

  return NextResponse.json(despesa, { status: 201 });
}
