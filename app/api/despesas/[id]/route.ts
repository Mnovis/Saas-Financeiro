import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { despesaSchema } from "@/lib/validations";

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const despesa = await prisma.despesa.findFirst({ where: { id: params.id, userId } });
  if (!despesa) {
    return NextResponse.json({ error: "Despesa não encontrada." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = despesaSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const atualizada = await prisma.despesa.update({
    where: { id: params.id },
    data: parsed.data,
    include: { categoria: true },
  });

  return NextResponse.json(atualizada);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const despesa = await prisma.despesa.findFirst({ where: { id: params.id, userId } });
  if (!despesa) {
    return NextResponse.json({ error: "Despesa não encontrada." }, { status: 404 });
  }

  await prisma.despesa.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
