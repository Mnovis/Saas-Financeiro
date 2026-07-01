import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@financeiro.app" },
    update: {},
    create: {
      name: "Usuário Demo",
      email: "demo@financeiro.app",
      password: senhaHash,
    },
  });

  const categoriasReceita = [
    { nome: "Salário", cor: "#22c55e", icone: "Briefcase" },
    { nome: "Freelance", cor: "#06b6d4", icone: "Laptop" },
    { nome: "Investimentos", cor: "#a855f7", icone: "TrendingUp" },
    { nome: "Outros", cor: "#64748b", icone: "Plus" },
  ];

  const categoriasDespesa = [
    { nome: "Moradia", cor: "#ef4444", icone: "Home" },
    { nome: "Alimentação", cor: "#f97316", icone: "UtensilsCrossed" },
    { nome: "Transporte", cor: "#eab308", icone: "Car" },
    { nome: "Saúde", cor: "#ec4899", icone: "HeartPulse" },
    { nome: "Lazer", cor: "#8b5cf6", icone: "Gamepad2" },
    { nome: "Educação", cor: "#3b82f6", icone: "GraduationCap" },
    { nome: "Outros", cor: "#64748b", icone: "MoreHorizontal" },
  ];

  for (const c of categoriasReceita) {
    await prisma.categoria.upsert({
      where: { userId_nome_tipo: { userId: user.id, nome: c.nome, tipo: "RECEITA" } },
      update: {},
      create: { ...c, tipo: "RECEITA", userId: user.id },
    });
  }

  for (const c of categoriasDespesa) {
    await prisma.categoria.upsert({
      where: { userId_nome_tipo: { userId: user.id, nome: c.nome, tipo: "DESPESA" } },
      update: {},
      create: { ...c, tipo: "DESPESA", userId: user.id },
    });
  }

  console.log("Seed concluído. Login demo: demo@financeiro.app / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
