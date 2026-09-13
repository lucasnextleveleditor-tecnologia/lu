import { EsqueletoDeCabecalho, EsqueletoDeTiles, EsqueletoDeLista } from "@/components/ui/Esqueleto";

export default function Loading() {
  return (
    <div className="space-y-6">
      <EsqueletoDeCabecalho />
      <EsqueletoDeTiles />
      <EsqueletoDeLista />
    </div>
  );
}
