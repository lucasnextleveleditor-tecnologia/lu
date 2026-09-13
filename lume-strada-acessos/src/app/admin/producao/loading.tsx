import { EsqueletoDeCabecalho, EsqueletoDeQuadro } from "@/components/ui/Esqueleto";

/** Produção é um quadro de colunas — o esqueleto genérico (lista) faria a tela pular. */
export default function Loading() {
  return (
    <div className="space-y-6">
      <EsqueletoDeCabecalho />
      <EsqueletoDeQuadro />
    </div>
  );
}
