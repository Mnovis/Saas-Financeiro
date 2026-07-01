import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoriaSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  const categorias = await prisma.categoria.findMany({
    where: {
      userId: (session.user as { id: string }).id,
      ...(tipo ? { tipo: tipo as "RECEITA" | "DESPESA" } : {}),
    },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(categorias);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = categoriaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  try {
    const categoria = await prisma.categoria.create({
      data: { ...parsed.data, userId: (session.user as { id: string }).id },
    });
    return NextResponse.json(categoria, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Já existe uma categoria com esse nome para esse tipo." },
      { status: 409 }
    );
  }
}
