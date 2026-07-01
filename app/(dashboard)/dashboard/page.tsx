"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Wallet, Download,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartEvolucao } from "@/components/dashboard/chart-evolucao";
import { ChartPizza } from "@/components/dashboard/chart-pizza";
import { UltimasTransacoes } from "@/components/dashboard/ultimas-transacoes";
import { FiltroMes } from "@/components/dashboard/filtro-mes";
import { Button } from "@/components/ui/button";
import { gerarPDF } from "@/lib/pdf";

interface Resumo {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  despesasPorCategoria: { nome: string; cor: string; valor: number }[];
  receitasPorCategoria: { nome: string; cor: string; valor: number }[];
  evolucao: { mes: string; receitas: number; despesas: number }[];
  ultimasTransacoes: {
    id: string;
    descricao: string;
    valor: number;
    data: string;
    tipo: "RECEITA" | "DESPESA";
    categoria: { nome: string; cor: string };
  }[];
}

export default function DashboardPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [exportando, setExportando] = useState(false);

  const buscarResumo = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch(`/api/dashboard/summary?mes=${mes}&ano=${ano}`);
      const dados = await res.json();
      setResumo(dados);
    } finally {
      setCarregando(false);
    }
  }, [mes, ano]);

  useEffect(() => {
    buscarResumo();
  }, [buscarResumo]);

  async function handleExportarPDF() {
    setExportando(true);
    try {
      const res = await fetch(`/api/export/pdf?mes=${mes}&ano=${ano}`);
      const dados = await res.json();
      gerarPDF(dados);
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FiltroMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a); }} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarPDF}
            disabled={exportando || carregando}
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Cards de totais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          titulo="Total de Receitas"
          valor={resumo?.totalReceitas ?? 0}
          icone={TrendingUp}
          variante="receita"
          descricao="Entradas no mês"
        />
        <StatCard
          titulo="Total de Despesas"
          valor={resumo?.totalDespesas ?? 0}
          icone={TrendingDown}
          variante="despesa"
          descricao="Saídas no mês"
        />
        <StatCard
          titulo="Saldo do Mês"
          valor={resumo?.saldo ?? 0}
          icone={Wallet}
          variante={
            !resumo || resumo.saldo >= 0 ? "saldo-positivo" : "saldo-negativo"
          }
          descricao="Receitas − Despesas"
        />
      </div>

      {/* Gráficos */}
      {!carregando && resumo && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartEvolucao dados={resumo.evolucao} />
            <UltimasTransacoes transacoes={resumo.ultimasTransacoes} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChartPizza
              dados={resumo.despesasPorCategoria}
              titulo="Despesas por categoria"
            />
            <ChartPizza
              dados={resumo.receitasPorCategoria}
              titulo="Receitas por categoria"
            />
          </div>
        </>
      )}

      {carregando && (
        <div className="flex justify-center py-16 text-muted-foreground text-sm">
          Carregando dados…
        </div>
      )}
    </div>
  );
}
