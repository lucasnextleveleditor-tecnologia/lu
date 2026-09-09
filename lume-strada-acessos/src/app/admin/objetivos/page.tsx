import { buscarDadosObjetivos } from "@/app/admin/objetivos/data";
import { ObjetivosView } from "@/components/admin/objetivos/ObjetivosView";

export const dynamic = "force-dynamic";

export default async function ObjetivosPage() {
  const dados = await buscarDadosObjetivos();

  return <ObjetivosView dados={dados} />;
}
