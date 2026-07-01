"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { formatarMoeda, formatarData } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FiltroMes } from "@/components/dashboard/filtro-mes";
import { FormTransacao } from "@/components/forms/form-transacao";
import type { TransacaoInput } from "@/lib/validations";

interface Receita {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  recorrente: boolean;
  observacao?: string;
  categoriaId: string;
  categoria: { id: string; nome: string; cor: string };
}

export default function ReceitasPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Receita | null>(null);
  const [carregando, setCarregando] = useState(true);

  const buscarReceitas = useCallback(async () => {
    setCarregando(true);
    const res = await fetch(`/api/receitas?mes=${mes}&ano=${ano}`);
    const dados = await res.json();
    setReceitas(dados);
    setCarregando(false);
  }, [mes, ano]);

  useEffect(() => {
    buscarReceitas();
  }, [buscarReceitas]);

  async function salvar(dados: TransacaoInput) {
    const url = editando ? `/api/receitas/${editando.id}` : "/api/receitas";
    const method = editando ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    setModalAberto(false);
    setEditando(null);
    buscarReceitas();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta receita?")) return;
    await fetch(`/api/receitas/${id}`, { method: "DELETE" });
    buscarReceitas();
  }

  function abrirEdicao(r: Receita) {
    setEditando(r);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  const filtradas = receitas.filter((r) =>
    r.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    r.categoria.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const total = filtradas.reduce((acc, r) => acc + Number(r.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Receitas</h1>
          <p className="text-sm text-muted-foreground">
            {filtradas.length} registro(s) · Total: <span className="text-green-600 dark:text-green-400 font-semibold">{formatarMoeda(total)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FiltroMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a); }} />
          <Dialog open={modalAberto} onOpenChange={(v) => { if (!v) fecharModal(); else setModalAberto(true); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditando(null)}>
                <Plus className="h-4 w-4" />
                Nova Receita
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editando ? "Editar Receita" : "Nova Receita"}</DialogTitle>
              </DialogHeader>
              <FormTransacao
                tipo="RECEITA"
                inicial={editando ?? undefined}
                onSalvar={salvar}
                onCancelar={fecharModal}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar receitas..."
          className="pl-9"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Receitas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {carregando ? (
            <p className="text-center py-12 text-sm text-muted-foreground">Carregando…</p>
          ) : filtradas.length === 0 ? (
            <p className="text-center py-12 text-sm text-muted-foreground">
              Nenhuma receita encontrada para este período.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Categoria</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Data</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{r.descricao}</p>
                          {r.recorrente && (
                            <span className="text-xs text-primary">↻ Recorrente</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: r.categoria.cor }}
                          />
                          {r.categoria.nome}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {formatarData(r.data)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                        {formatarMoeda(Number(r.valor))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirEdicao(r)}
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => excluir(r.id)}
                            className="text-destructive hover:text-destructive"
                            aria-label="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
