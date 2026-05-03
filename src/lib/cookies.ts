export function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  
  document.cookie = cookieString;
  
  const cookieSet = getCookie(name) === value;
  
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
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  
  const cookieRemoved = getCookie(name) === null;
  
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
