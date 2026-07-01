import { type LucideIcon } from "lucide-react";
import { cn, formatarMoeda } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  titulo: string;
  valor: number;
  icone: LucideIcon;
  variante?: "default" | "receita" | "despesa" | "saldo-positivo" | "saldo-negativo";
  descricao?: string;
}

const variantes = {
  default: "bg-primary/10 text-primary",
  receita: "bg-green-500/10 text-green-600 dark:text-green-400",
  despesa: "bg-red-500/10 text-red-600 dark:text-red-400",
  "saldo-positivo": "bg-green-500/10 text-green-600 dark:text-green-400",
  "saldo-negativo": "bg-red-500/10 text-red-600 dark:text-red-400",
};

const valorCores = {
  default: "text-foreground",
  receita: "text-green-600 dark:text-green-400",
  despesa: "text-red-600 dark:text-red-400",
  "saldo-positivo": "text-green-600 dark:text-green-400",
  "saldo-negativo": "text-red-600 dark:text-red-400",
};

export function StatCard({
  titulo,
  valor,
  icone: Icon,
  variante = "default",
  descricao,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn("rounded-xl p-3 shrink-0", variantes[variante])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{titulo}</p>
          <p className={cn("text-2xl font-bold tracking-tight", valorCores[variante])}>
            {formatarMoeda(valor)}
          </p>
          {descricao && (
            <p className="text-xs text-muted-foreground mt-0.5">{descricao}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
