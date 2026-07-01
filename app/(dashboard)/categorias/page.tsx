"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoriaSchema, type CategoriaInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";

interface Categoria {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  tipo: "RECEITA" | "DESPESA";
}

const COR_DEFAULTS = [
  "#22c55e", "#ef4444", "#3b82f6", "#f97316",
  "#a855f7", "#eab308", "#ec4899", "#06b6d4",
  "#64748b", "#8b5cf6",
];

function FormCategoria({
  inicial,
  onSalvar,
  onCancelar,
}: {
  inicial?: Categoria;
  onSalvar: (dados: CategoriaInput) => Promise<void>;
  onCancelar: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaInput>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      cor: inicial?.cor ?? "#6366f1",
      icone: inicial?.icone ?? "Tag",
      tipo: inicial?.tipo ?? "DESPESA",
    },
  });

  const corAtual = watch("cor");

  return (
    <form onSubmit={handleSubmit(onSalvar)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nome</Label>
        <Input placeholder="Ex: Alimentação" {...register("nome")} />
        {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Tipo</Label>
        <Controller
          control={control}
          name="tipo"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEITA">Receita</SelectItem>
                <SelectItem value="DESPESA">Despesa</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {COR_DEFAULTS.map((cor) => (
            <button
              key={cor}
              type="button"
              onClick={() => setValue("cor", cor)}
              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: cor,
                borderColor: corAtual === cor ? "white" : "transparent",
                outline: corAtual === cor ? `2px solid ${cor}` : "none",
              }}
              aria-label={`Cor ${cor}`}
            />
          ))}
        </div>
        <Input type="color" {...register("cor")} className="h-9 w-20 cursor-pointer p-1" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {inicial ? "Salvar" : "Criar categoria"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [erro, setErro] = useState("");

  const buscar = useCallback(async () => {
    const res = await fetch("/api/categorias");
    setCategorias(await res.json());
  }, []);

  useEffect(() => { buscar(); }, [buscar]);

  async function salvar(dados: CategoriaInput) {
    const url = editando ? `/api/categorias/${editando.id}` : "/api/categorias";
    const method = editando ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error);
    }
    setModalAberto(false);
    setEditando(null);
    buscar();
  }

  async function excluir(id: string) {
    setErro("");
    if (!confirm("Excluir categoria?")) return;
    const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      setErro(json.error);
      return;
    }
    buscar();
  }

  const receitas = categorias.filter((c) => c.tipo === "RECEITA");
  const despesas = categorias.filter((c) => c.tipo === "DESPESA");

  function renderLista(lista: Categoria[], titulo: string) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          {lista.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma categoria</p>
          ) : (
            <ul className="space-y-2">
              {lista.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-8 rounded-lg shrink-0"
                      style={{ backgroundColor: c.cor + "30", outlineColor: c.cor, outlineWidth: 2, outlineStyle: "solid" }}
                    >
                      <span
                        className="flex h-full w-full items-center justify-center rounded-lg text-[10px] font-bold"
                        style={{ color: c.cor }}
                      >
                        {c.nome.slice(0, 2).toUpperCase()}
                      </span>
                    </span>
                    <span className="text-sm font-medium">{c.nome}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditando(c); setModalAberto(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => excluir(c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-sm text-muted-foreground">{categorias.length} categorias cadastradas</p>
        </div>
        <Dialog open={modalAberto} onOpenChange={(v) => { if (!v) { setModalAberto(false); setEditando(null); } else setModalAberto(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditando(null)}>
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editando ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            </DialogHeader>
            <FormCategoria
              inicial={editando ?? undefined}
              onSalvar={salvar}
              onCancelar={() => { setModalAberto(false); setEditando(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {erro && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderLista(receitas, "Categorias de Receita")}
        {renderLista(despesas, "Categorias de Despesa")}
      </div>
    </div>
  );
}
