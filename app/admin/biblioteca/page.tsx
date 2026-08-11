import { BookOpen, CirclePlus, ExternalLink, FileText } from "lucide-react";
import { MATERIAL_TYPES, MATERIAL_VISIBILITIES } from "@/domain/library/entities";
import { libraryRepository } from "@/infrastructure/repositories/firebase-library-repository";
import { createMaterial, updateMaterial } from "./actions";

export const dynamic = "force-dynamic";

const typeLabel = { link: "Link", pdf: "PDF", document: "Documento", image: "Imagem", file: "Arquivo" } as const;

export default async function LibraryAdminPage() {
  const materials = await libraryRepository.listMaterials();
  return (
    <div className="admin-page content-admin-page">
      <header className="page-heading"><div><span className="kicker">Conteúdo</span><h1>Biblioteca</h1><p>Materiais de referência que podem ser associados a várias aulas.</p></div><details className="create-popover"><summary className="primary-button"><CirclePlus size={17} />Novo material</summary><form className="panel cms-form compact-form" action={createMaterial}><label>Título<input name="title" required minLength={3} maxLength={160} autoFocus /></label><label>Tipo<select name="type" defaultValue="link">{MATERIAL_TYPES.map((value) => <option key={value} value={value}>{typeLabel[value]}</option>)}</select></label><label>URL<input name="sourceUrl" type="url" required maxLength={2000} /></label><label>Descrição<textarea name="description" rows={3} maxLength={2000} /></label><label>Visibilidade<select name="visibility" defaultValue="draft">{MATERIAL_VISIBILITIES.map((value) => <option key={value} value={value}>{value === "published" ? "Publicado" : "Rascunho"}</option>)}</select></label><button className="primary-button" type="submit">Salvar material</button></form></details></header>
      <section className="material-admin-list">
        {materials.length === 0 && <div className="panel empty-result">Nenhum material cadastrado.</div>}
        {materials.map((material) => <details className="panel material-admin-row" key={material.id}><summary><span className="content-symbol"><FileText size={19} /></span><span className="material-admin-title"><strong>{material.title}</strong><small>{typeLabel[material.type]} · {material.visibility === "published" ? "Publicado" : "Rascunho"}</small></span><ExternalLink size={16} className="row-arrow" /></summary><form className="cms-form form-grid" action={updateMaterial}><input type="hidden" name="materialId" value={material.id} /><label>Título<input name="title" defaultValue={material.title} required /></label><label>Tipo<select name="type" defaultValue={material.type}>{MATERIAL_TYPES.map((value) => <option key={value} value={value}>{typeLabel[value]}</option>)}</select></label><label className="full-field">URL<input name="sourceUrl" type="url" defaultValue={material.sourceUrl} required /></label><label className="full-field">Descrição<textarea name="description" defaultValue={material.description} rows={3} /></label><label>Visibilidade<select name="visibility" defaultValue={material.visibility}><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label><div className="form-actions"><button className="ghost-button" type="submit">Salvar</button></div></form></details>)}
      </section>
    </div>
  );
}
