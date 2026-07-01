"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiltroMes } from "@/components/dashboard/filtro-mes";
import { formatarMoeda } from "@/lib/utils";

export default function GraficosPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [dados, setDados] = useState<{
    evolucao: { mes: string; receitas: number; despesas: number }[];
    despesasPorCategoria: { nome: string; cor: string; valor: number }[];
    receitasPorCategoria: { nome: string; cor: string; valor: number }[];
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
  } | null>(null);

  const buscar = useCallback(async () => {
    const res = await fetch(`/api/dashboard/summary?mes=${mes}&ano=${ano}`);
    setDados(await res.json());
  }, [mes, ano]);

  useEffect(() => { buscar(); }, [buscar]);

  const saldoEvolucao = dados?.evolucao.map((p) => ({
    ...p,
    saldo: p.receitas - p.despesas,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gráficos</h1>
          <p className="text-sm text-muted-foreground">Análise visual das suas finanças</p>
        </div>
        <FiltroMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a); }} />
      </div>

      {!dados ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Carregando…</div>
      ) : (
        <>
          {/* Área — evolução do saldo */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do saldo (últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={saldoEvolucao}>
                  <defs>
                    <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatarMoeda(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#22c55e" fill="url(#gradReceitas)" />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" fill="url(#gradDespesas)" />
                  <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#6366f1" fill="url(#gradSaldo)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Barras comparativas */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativo Receitas × Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dados.evolucao}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatarMoeda(v)} />
                  <Legend />
                  <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pizzas por categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { titulo: "Despesas por categoria", itens: dados.despesasPorCategoria },
              { titulo: "Receitas por categoria", itens: dados.receitasPorCategoria },
            ].map(({ titulo, itens }) => (
              <Card key={titulo}>
                <CardHeader>
                  <CardTitle className="text-base">{titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  {itens.length === 0 ? (
                    <p className="text-sm text-center py-10 text-muted-foreground">Sem dados</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={itens} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={90} innerRadius={45}>
                          {itens.map((item, i) => (
                            <Cell key={i} fill={item.cor} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatarMoeda(v)} />
                        <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
