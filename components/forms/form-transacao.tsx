"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { transacaoSchema, despesaSchema, type TransacaoInput, type DespesaInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

interface FormTransacaoProps {
  tipo: "RECEITA" | "DESPESA";
  inicial?: Partial<DespesaInput & { id: string }>;
  onSalvar: (dados: TransacaoInput | DespesaInput) => Promise<void>;
  onCancelar: () => void;
}

export function FormTransacao({ tipo, inicial, onSalvar, onCancelar }: FormTransacaoProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const schema = tipo === "DESPESA" ? despesaSchema : transacaoSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DespesaInput>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      descricao: inicial?.descricao ?? "",
      valor: inicial?.valor,
      data: inicial?.data ? new Date(inicial.data) : new Date(),
      categoriaId: inicial?.categoriaId ?? "",
      observacao: inicial?.observacao ?? "",
      recorrente: inicial?.recorrente ?? false,
      ...(tipo === "DESPESA" ? { pago: (inicial as DespesaInput)?.pago ?? true } : {}),
    },
  });

  useEffect(() => {
    fetch(`/api/categorias?tipo=${tipo}`)
      .then((r) => r.json())
      .then(setCategorias);
  }, [tipo]);

  return (
    <form onSubmit={handleSubmit(onSalvar)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Descrição</Label>
        <Input placeholder="Ex: Salário mensal" {...register("descricao")} />
        {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Valor (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            {...register("valor", { valueAsNumber: true })}
          />
          {errors.valor && <p className="text-xs text-destructive">{errors.valor.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Data</Label>
          <Input type="date" {...register("data", { valueAsDate: true })} />
          {errors.data && <p className="text-xs text-destructive">{errors.data.message as string}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Categoria</Label>
        <Controller
          control={control}
          name="categoriaId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: c.cor }}
                      />
                      {c.nome}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoriaId && (
          <p className="text-xs text-destructive">{errors.categoriaId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Observação (opcional)</Label>
        <Input placeholder="Detalhes adicionais..." {...register("observacao")} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="recorrente"
            render={({ field }) => (
              <Switch
                id="recorrente"
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="recorrente">Recorrente</Label>
        </div>

        {tipo === "DESPESA" && (
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="pago"
              render={({ field }) => (
                <Switch
                  id="pago"
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="pago">Pago</Label>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {inicial?.id ? "Salvar alterações" : "Adicionar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
