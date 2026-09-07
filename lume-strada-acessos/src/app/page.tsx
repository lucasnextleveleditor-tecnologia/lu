import { redirect } from "next/navigation";

// O middleware já resolve "/" para /login, /admin ou /dashboard antes de
// chegar aqui — este componente é só uma rede de segurança (ex: se o
// `matcher` do middleware algum dia for alterado e deixar de cobrir "/").
export default function RootPage() {
  redirect("/login");
}
