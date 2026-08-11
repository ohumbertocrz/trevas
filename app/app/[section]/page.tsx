import { BookMarked, Files, FlaskConical, Library, UserRound } from "lucide-react";
import { notFound } from "next/navigation";

const sections = {
  laboratorio: { title: "Laboratório Trevas", description: "Exercícios de análise para aplicar a metodologia em casos concretos.", icon: FlaskConical },
  arquivo: { title: "Arquivo Trevas", description: "Casos, documentos e análises organizados para pesquisa.", icon: Files },
  biblioteca: { title: "Biblioteca Trevas", description: "Livros, artigos, filmes e referências relacionados à formação.", icon: Library },
  perfil: { title: "Meu perfil", description: "Dados pessoais, preferências e histórico de acesso.", icon: UserRound },
  anotacoes: { title: "Minhas anotações", description: "Notas privadas registradas durante seus estudos.", icon: BookMarked },
} as const;

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const content = sections[section as keyof typeof sections];
  if (!content) notFound();
  const Icon = content.icon;

  return <div className="page empty-page"><div><Icon size={42} /><h1>{content.title}</h1><p>{content.description}</p><span className="tag">Estrutura preparada para a próxima etapa</span></div></div>;
}
