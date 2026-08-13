/** Concatena classNames condicionalmente (sem depender de `clsx` como dependência extra). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
