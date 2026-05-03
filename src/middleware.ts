import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


//   Middleware de autenticação do front.
//   - Bloqueia rotas protegidas quando não há token (cookie).
//   - Valida o token chamando o backend antes de liberar o acesso.
//   - Redireciona /login quando necessário e evita acesso às rotas de auth com token ativo.

const protectedRoutes = [
  "/dashboard",
  "/usuarios",
  "/disciplinas",
  "/turmas",
  "/salas",
  "/reservas",
  "/alocacoes",
  "/grade-horarios",
  "/profile",
  "/notificacoes",
];

const authRoutes = ["/login", "/register"];

async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    const isValidToken = await verifyToken(token);
    if (!isValidToken) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/" && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [

    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
