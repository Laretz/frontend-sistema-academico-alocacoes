import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que requerem autenticação
const protectedRoutes = [
  "/dashboard",
  "/usuarios",
  "/disciplinas",
  "/turmas",
  "/salas",
  "/alocacoes",
  "/grade-horarios",
  "/profile",
];

// Rotas que só podem ser acessadas sem autenticação
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  


  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Verificar se é uma rota de autenticação
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Se é uma rota protegida e não tem token, redirecionar para login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se é uma rota de autenticação e tem token, redirecionar para dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se está na raiz e tem token, redirecionar para dashboard
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se está na raiz e não tem token, redirecionar para login
  if (pathname === "/" && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
