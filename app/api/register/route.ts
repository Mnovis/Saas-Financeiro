import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existente = await prisma.user.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hash },
    });

    // Categorias padrão para o novo usuário (multi-tenant: isoladas por userId)
    const categoriasReceita = ["Salário", "Freelance", "Investimentos", "Outros"];
    const categoriasDespesa = [
      "Moradia",
      "Alimentação",
      "Transporte",
      "Saúde",
      "Lazer",
      "Educação",
      "Outros",
    ];

    await prisma.categoria.createMany({
      data: [
        ...categoriasReceita.map((nome) => ({
          nome,
          tipo: "RECEITA" as const,
          userId: user.id,
        })),
        ...categoriasDespesa.map((nome) => ({
          nome,
          tipo: "DESPESA" as const,
          userId: user.id,
        })),
      ],
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao registrar usuário." }, { status: 500 });
  }
}
