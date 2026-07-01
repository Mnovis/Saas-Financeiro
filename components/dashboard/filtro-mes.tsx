"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FiltroMesProps {
  mes: number;
  ano: number;
  onChange: (mes: number, ano: number) => void;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function FiltroMes({ mes, ano, onChange }: FiltroMesProps) {
  function anterior() {
    if (mes === 1) {
      onChange(12, ano - 1);
    } else {
      onChange(mes - 1, ano);
    }
  }

  function proximo() {
    const agora = new Date();
    if (ano > agora.getFullYear() || (ano === agora.getFullYear() && mes >= agora.getMonth() + 1)) {
      return;
    }
    if (mes === 12) {
      onChange(1, ano + 1);
    } else {
      onChange(mes + 1, ano);
    }
  }

  const hoje = new Date();
  const ehFuturo =
    ano > hoje.getFullYear() ||
    (ano === hoje.getFullYear() && mes >= hoje.getMonth() + 1);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={anterior} aria-label="Mês anterior">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="w-36 text-center text-sm font-medium">
        {MESES[mes - 1]} {ano}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={proximo}
        disabled={ehFuturo}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
