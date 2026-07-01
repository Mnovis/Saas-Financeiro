import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoriaSchema } from "@/lib/validations";

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const categoria = await prisma.categoria.findFirst({
    where: { id: params.id, userId },
  });
  if (!categoria) {
    return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = categoriaSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const atualizada = await prisma.categoria.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(atualizada);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const categoria = await prisma.categoria.findFirst({
    where: { id: params.id, userId },
  });
  if (!categoria) {
    return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
  }

  try {
    await prisma.categoria.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não é possível excluir: existem transações vinculadas a essa categoria." },
      { status: 409 }
    );
  }
}
