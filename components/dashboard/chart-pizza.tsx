"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from "@/lib/utils";

interface Fatia {
  nome: string;
  cor: string;
  valor: number;
}

interface ChartPizzaProps {
  dados: Fatia[];
  titulo: string;
}

export function ChartPizza({ dados, titulo }: ChartPizzaProps) {
  if (!dados.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{titulo}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Nenhum dado no período
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
            >
              {dados.map((fatia, i) => (
                <Cell key={i} fill={fatia.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatarMoeda(v)} />
            <Legend
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
