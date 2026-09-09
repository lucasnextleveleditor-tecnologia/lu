"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconBox, IconRotateCcw, IconTrash } from "@/components/ui/icons";
import { BotaoDeAcao, BotaoExcluir } from "@/components/ui/AcoesEmLinha";
import { arquivarOrdemDoDia, excluirOrdemDoDia } from "@/app/admin/producao/ordem-do-dia/actions";

/**
 * Arquivar e excluir uma folha, à vista na própria linha.
 *
 * Era um menu de três pontinhos, e não funcionava: a lista tem
 * `overflow-hidden` por causa dos cantos arredondados, então o menu abria e
 * era cortado — a pessoa clicava e nada acontecia. Agora os dois botões
 * ficam visíveis, e o de excluir pergunta ali mesmo antes de apagar: uma
 * ordem de externa é o registro de como um dia de trabalho foi combinado, e
 * a diferença entre "sai da lista" e "some para sempre" precisa estar clara
 * antes do clique.
 */
export function AcoesDaOrdem({ ordemId, arquivado }: { ordemId: string; arquivado: boolean }) {
  const router = useRouter();
  const { dict } = useLocale();
  const t = dict.ordemDoDia;
  const [pendente, start] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <BotaoDeAcao
        icone={arquivado ? <IconRotateCcw className="h-3.5 w-3.5" /> : <IconBox className="h-3.5 w-3.5" />}
        rotulo={arquivado ? t.desarquivar : t.arquivar}
        desativado={pendente}
        aoClicar={() =>
          start(async () => {
            await arquivarOrdemDoDia(ordemId, !arquivado);
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
            await excluirOrdemDoDia(ordemId);
            router.refresh();
          })
        }
      />
    </div>
  );
}
