import { formatarMoeda, formatarData, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: "RECEITA" | "DESPESA";
  categoria: { nome: string; cor: string };
}

export function UltimasTransacoes({ transacoes }: { transacoes: Transacao[] }) {
  return (
    <Card className="col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Últimas transações</CardTitle>
      </CardHeader>
      <CardContent>
        {transacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma transação no período
          </p>
        ) : (
          <ul className="space-y-3">
            {transacoes.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    t.tipo === "RECEITA"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  {t.tipo === "RECEITA" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.categoria.nome} · {formatarData(t.data)}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold shrink-0",
                    t.tipo === "RECEITA"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {t.tipo === "DESPESA" ? "-" : "+"}
                  {formatarMoeda(t.valor)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
