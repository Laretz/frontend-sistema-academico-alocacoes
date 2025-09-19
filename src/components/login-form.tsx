import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                <p className="text-muted-foreground text-balance">
                  Faça login em sua conta do Sistema de Alocação
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <a href="/registro" className="underline underline-offset-4">
                  Criar conta
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-primary-foreground/80">
                <GraduationCap className="h-24 w-24 mx-auto mb-4 opacity-60" />
                <h2 className="text-3xl font-bold mb-2">Escola Agrícola de Jundiaí</h2>
                <p className="text-lg opacity-80">Universidade Federal do Rio Grande do Norte</p>
                <p className="text-sm mt-4 opacity-60">Sistema de Alocação Acadêmica</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}