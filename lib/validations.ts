import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(40),
  cor: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Cor inválida"),
  icone: z.string().min(1),
  tipo: z.enum(["RECEITA", "DESPESA"]),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;

export const transacaoSchema = z.object({
  descricao: z.string().min(2, "Descrição deve ter ao menos 2 caracteres").max(120),
  valor: z.coerce.number().positive("Valor deve ser maior que zero"),
  data: z.coerce.date(),
  categoriaId: z.string().min(1, "Selecione uma categoria"),
  observacao: z.string().max(500).optional().or(z.literal("")),
  recorrente: z.boolean().optional().default(false),
});

export type TransacaoInput = z.infer<typeof transacaoSchema>;

export const despesaSchema = transacaoSchema.extend({
  pago: z.boolean().optional().default(true),
});

export type DespesaInput = z.infer<typeof despesaSchema>;
