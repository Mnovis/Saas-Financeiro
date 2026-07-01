"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, CheckCircle, Clock } from "lucide-react";
import { formatarMoeda, formatarData, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FiltroMes } from "@/components/dashboard/filtro-mes";
import { FormTransacao } from "@/components/forms/form-transacao";
import type { DespesaInput, TransacaoInput } from "@/lib/validations";

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  pago: boolean;
  recorrente: boolean;
  observacao?: string;
  categoriaId: string;
  categoria: { id: string; nome: string; cor: string };
}

// Converte Despesa (data: string) para o formato esperado pelo formulário (data: Date)
function despesaParaFormulario(d: Despesa): DespesaInput & { id: string } {
  return {
    id: d.id,
    descricao: d.descricao,
    valor: Number(d.valor),
    data: new Date(d.data),
    categoriaId: d.categoriaId,
    observacao: d.observacao ?? "",
    recorrente: d.recorrente,
    pago: d.pago,
  };
}

export default function DespesasPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Despesa | null>(null);
  const [carregando, setCarregando] = useState(true);

  const buscarDespesas = useCallback(async () => {
    setCarregando(true);
    const res = await fetch(`/api/despesas?mes=${mes}&ano=${ano}`);
    const dados = await res.json();
    setDespesas(dados);
    setCarregando(false);
  }, [mes, ano]);

  useEffect(() => {
    buscarDespesas();
  }, [buscarDespesas]);

  async function salvar(dados: TransacaoInput | DespesaInput) {
    const url = editando ? `/api/despesas/${editando.id}` : "/api/despesas";
    const method = editando ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    setModalAberto(false);
    setEditando(null);
    buscarDespesas();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta despesa?")) return;
    await fetch(`/api/despesas/${id}`, { method: "DELETE" });
    buscarDespesas();
  }

  async function togglePago(d: Despesa) {
    await fetch(`/api/despesas/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pago: !d.pago }),
    });
    buscarDespesas();
  }

  function abrirEdicao(d: Despesa) {
    setEditando(d);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  const filtradas = despesas.filter((d) =>
    d.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    d.categoria.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const total = filtradas.reduce((acc, d) => acc + Number(d.valor), 0);
  const totalPago = filtradas.filter((d) => d.pago).reduce((acc, d) => acc + Number(d.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Despesas</h1>
          <p className="text-sm text-muted-foreground">
            {filtradas.length} registro(s) · Total:{" "}
            <span className="text-red-600 dark:text-red-400 font-semibold">{formatarMoeda(total)}</span>
            {" "}· Pago:{" "}
            <span className="text-green-600 dark:text-green-400 font-semibold">{formatarMoeda(totalPago)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FiltroMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a); }} />
          <Dialog open={modalAberto} onOpenChange={(v) => { if (!v) fecharModal(); else setModalAberto(true); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditando(null)}>
                <Plus className="h-4 w-4" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editando ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
              </DialogHeader>
              <FormTransacao
                tipo="DESPESA"
                inicial={editando ? despesaParaFormulario(editando) : undefined}
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
          placeholder="Buscar despesas..."
          className="pl-9"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {carregando ? (
            <p className="text-center py-12 text-sm text-muted-foreground">Carregando…</p>
          ) : filtradas.length === 0 ? (
            <p className="text-center py-12 text-sm text-muted-foreground">
              Nenhuma despesa encontrada para este período.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Categoria</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Data</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((d, i) => (
                    <tr
                      key={d.id}
                      className={cn(
                        "border-b last:border-0 hover:bg-muted/30 transition-colors",
                        i % 2 !== 0 && "bg-muted/10"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className={cn("font-medium", !d.pago && "text-muted-foreground")}>{d.descricao}</p>
                          {d.recorrente && <span className="text-xs text-primary">↻ Recorrente</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.categoria.cor }} />
                          {d.categoria.nome}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {formatarData(d.data)}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <button
                          onClick={() => togglePago(d)}
                          title={d.pago ? "Marcar como não pago" : "Marcar como pago"}
                          className="inline-flex items-center"
                        >
                          {d.pago ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400">
                        {formatarMoeda(Number(d.valor))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => abrirEdicao(d)} aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => excluir(d.id)}
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
