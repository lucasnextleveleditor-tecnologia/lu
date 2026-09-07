/** Gera uma URL absoluta do link público do portal a partir do token — mesmo padrão de `urlPublicaOrcamento`/`urlPublicaContrato`. */
export function urlPublicaPortal(token: string, origem?: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || origem || "";
  return `${base.replace(/\/$/, "")}/portal/${token}`;
}
