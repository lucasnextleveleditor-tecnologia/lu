import { EsqueletoDeCabecalho, EsqueletoDeTiles, EsqueletoDeLista } from "@/components/ui/Esqueleto";

/** O portal do cliente tem o mesmo problema do painel: clique sem resposta. */
export default function Loading() {
  return (
    <div className="space-y-6">
      <EsqueletoDeCabecalho />
      <EsqueletoDeTiles quantos={3} />
      <EsqueletoDeLista linhas={5} />
    </div>
  );
}
