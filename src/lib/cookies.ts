// Utilitários para manipulação de cookies

export function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  
  console.log("🍪 Definindo cookie:", cookieString);
  document.cookie = cookieString;
  
  // Verificar se o cookie foi definido
  const cookieSet = getCookie(name) === value;
  console.log("🍪 Cookie definido com sucesso:", cookieSet);
  
  return cookieSet;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
}

export function deleteCookie(name: string) {
  console.log("🗑️ Removendo cookie:", name);
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  
  // Verificar se o cookie foi removido
  const cookieRemoved = getCookie(name) === null;
  console.log("🗑️ Cookie removido com sucesso:", cookieRemoved);
  
  return cookieRemoved;
}

export function getAllCookies(): Record<string, string> {
  const cookies: Record<string, string> = {};
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    const eq = c.indexOf('=');
    if (eq > 0) {
      const name = c.substring(0, eq);
      const value = c.substring(eq + 1, c.length);
      cookies[name] = value;
    }
  }
  
  return cookies;
}