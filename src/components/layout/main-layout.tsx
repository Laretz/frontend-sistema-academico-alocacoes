"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  MapPin,
  Calendar,
  CalendarDays,
  LogOut,
  User,
  Menu,
  X,
  School,
  Building,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { NotificationBell } from "@/components/ui/notification-bell";

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Usuários", href: "/usuarios", icon: Users, adminOnly: true },
  { name: "Cursos", href: "/cursos", icon: School, adminOnly: true },
  { name: "Prédios", href: "/predios", icon: Building, adminOnly: true },
  { name: "Disciplinas", href: "/disciplinas", icon: BookOpen },
  {
    name: "Disciplinas por Prof.",
    href: "/professor-disciplina",
    icon: UserCheck,
    adminOnly: true,
  },
  { name: "Turmas", href: "/turmas", icon: GraduationCap },
  { name: "Salas", href: "/salas", icon: MapPin },
  { name: "Alocações", href: "/alocacoes", icon: Calendar, adminOnly: true },
  {
    name: "Feedbacks",
    href: "/admin/feedbacks",
    icon: MessageSquare,
    adminOnly: true,
  },
  { name: "Grade de Horários", href: "/grade-horarios", icon: CalendarDays },
];

export function MainLayout({ children }: MainLayoutProps) {
  // Ativar refresh automático de token
  useTokenRefresh();
  const { user, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPerfilColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-destructive/10 text-destructive";
      case "PROFESSOR":
        return "bg-primary/10 text-primary";
      case "COORDENADOR":
        return "bg-secondary/50 text-secondary-foreground";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  const filteredNavigation = navigation.filter((item) => {
    if (item.adminOnly && user?.role !== "ADMIN" && user?.role !== "COORDENADOR") {
      return false;
    }
    if ("hiddenForRoles" in item) {
      const hidden = (item as { hiddenForRoles?: string[] }).hiddenForRoles;
      if (hidden && user?.role && hidden.includes(user.role)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-card border-r border-border">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-foreground">
                Sistema Acadêmico
              </h1>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0 transition-colors
                        ${
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-accent-foreground"
                        }
                      `}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card border-r border-border">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-xl font-bold text-foreground">
                  Sistema Acadêmico
                </h1>
              </div>
              <nav className="mt-8 flex-1 space-y-1 px-2">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                        ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0 transition-colors
                          ${
                            isActive
                              ? "text-primary-foreground"
                              : "text-muted-foreground group-hover:text-accent-foreground"
                          }
                        `}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background shadow-sm border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-12 w-12 rounded-full p-0 flex items-center justify-center"
                      >
                        <UserAvatar name={user?.nome || "Usuário"} size={55} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.nome}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/perfil" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Badge className={getPerfilColor(user.role)}>
                    {user.role}
                  </Badge>
                </>
              )}
              <FeedbackWidget />
            </div>
            <div className="flex items-center space-x-4 ml-auto">
              <NotificationBell />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Conteúdo da página */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
