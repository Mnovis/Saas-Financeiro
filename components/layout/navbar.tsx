"use client";

import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  onAbrirSidebar: () => void;
}

export function Navbar({ onAbrirSidebar }: NavbarProps) {
  const { data: session } = useSession();
  const nome = session?.user?.name ?? session?.user?.email ?? "Usuário";
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur px-4 lg:px-6">
      {/* Botão hamburger mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onAbrirSidebar}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <span className="hidden lg:block text-sm text-muted-foreground font-medium">
        Bem-vindo, <span className="text-foreground">{nome}</span>
      </span>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {iniciais || <User className="h-4 w-4" />}
          </div>
          <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
            {nome}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
