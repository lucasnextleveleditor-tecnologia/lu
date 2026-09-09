"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconDownload, IconBox, IconRotateCcw, IconTrash } from "@/components/ui/icons";
import { BotaoDeAcao, BotaoExcluir } from "@/components/ui/AcoesEmLinha";
import { arquivarMapa, excluirMapa } from "@/app/admin/mapas/actions";

/**
 * Baixar, arquivar e excluir um mapa, à vista na própria linha.
 *
 * Era um menu de três pontinhos, e o menu era cortado pelo `overflow-hidden`
 * da lista — clicava-se e nada aparecia. Agora as três ações ficam visíveis,
 * e a de excluir pergunta ali mesmo: um mapa é trabalho de pensamento de
 * várias pessoas, e a diferença entre "sai da minha lista" e "some para
 * sempre" precisa estar clara ANTES do clique, não depois.
 */
export function AcoesDoMapa({ mapaId, arquivado }: { mapaId: string; arquivado: boolean }) {
  const router = useRouter();
  const { dict } = useLocale();
  const t = dict.mapaMental;
  const [pendente, start] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <BotaoDeAcao
        icone={<IconDownload className="h-3.5 w-3.5" />}
        rotulo={t.baixarPdf}
        // Rota de API, não Server Action: o navegador precisa receber o
        // arquivo e disparar o download sozinho.
        aoClicar={() => window.open(`/api/mapas/${mapaId}/pdf`, "_blank")}
      />
      <BotaoDeAcao
        icone={arquivado ? <IconRotateCcw className="h-3.5 w-3.5" /> : <IconBox className="h-3.5 w-3.5" />}
        rotulo={arquivado ? t.desarquivar : t.arquivar}
        desativado={pendente}
        aoClicar={() =>
          start(async () => {
            await arquivarMapa(mapaId, !arquivado);
            router.refresh();
          })
        }
      />
      <BotaoExcluir
        icone={<IconTrash className="h-3.5 w-3.5" />}
        rotulo={t.excluir}
        pergunta={dict.common.confirmarExclusao}
        rotuloConfirmar={dict.common.confirmar}
        rotuloCancelar={dict.common.cancelar}
        desativado={pendente}
        aoConfirmar={() =>
          start(async () => {
            await excluirMapa(mapaId);
            router.refresh();
          })
        }
      />
    </div>
  );
}
