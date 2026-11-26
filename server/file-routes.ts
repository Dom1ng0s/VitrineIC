import { basename, extname } from "node:path";
import { LIMITE_DA_CAPA } from "@/lib/projeto";
import type { FastifyInstance } from "fastify";
import type { Database } from "./db/pool";
import type { Config } from "./config";
import { accountFor, requireAccount, requireVerifiedAccount } from "./security";
import { ensure, ensureUuid } from "./errors";
import { snapshot } from "./db/snapshot";
import { demandas, estudantes } from "./db/repositories";
import {
  demandBriefing,
  portfolioFiles,
  removeDemandBriefing,
  requesterCanViewPortfolio,
  saveDemandBriefing,
} from "./db/attachments";

export function fileRoutes(app: FastifyInstance, db: Database, config: Config) {
  app.post<{ Params: { id: string } }>("/api/demands/:id/briefing", async (request, reply) => {
    const account = await requireVerifiedAccount(db, request, config, "requester");
    const demand = await demandas.porId(db.sql, request.params.id);
    ensure(demand, 404, "Demanda não encontrada.");
    ensure(
      demand.company === account.profileId && ["nova", "em_analise"].includes(demand.status),
      403,
      "O briefing não pode ser alterado.",
    );
    const file = await request.file();
    ensure(file, 400, "Selecione um PDF.");
    const name = basename(file.filename.replaceAll("\\", "/")).slice(0, 200);
    ensure(extname(name).toLowerCase() === ".pdf", 400, "Envie um PDF.");
    const content = await file.toBuffer();
    ensure(!file.file.truncated && content.length <= 20 * 1024 * 1024, 413, "O limite é 20 MB.");
    ensure(content.subarray(0, 5).toString() === "%PDF-", 400, "O conteúdo não é um PDF.");
    await saveDemandBriefing(db.sql, demand.id, name, content);
    reply.code(201);
    return snapshot(db.sql, config, account);
  });

  app.get<{ Params: { id: string } }>("/api/demands/:id/briefing", async (request, reply) => {
    const account = await requireAccount(db, request);
    const demand = await demandas.porId(db.sql, request.params.id);
    ensure(demand, 404, "Demanda não encontrada.");
    ensure(
      account.role === "curator" ||
        (account.role === "requester" && account.profileId === demand.company) ||
        (account.role === "student" && ["aprovada", "contato_liberado"].includes(demand.status)),
      403,
      "Briefing privado.",
    );
    const file = await demandBriefing(db.sql, demand.id);
    ensure(file, 404, "Briefing não encontrado.");
    return reply
      .header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`)
      .type("application/pdf")
      .send(file.content);
  });

  app.delete<{ Params: { id: string } }>("/api/demands/:id/briefing", async (request) => {
    const account = await requireAccount(db, request, "requester");
    const demand = await demandas.porId(db.sql, request.params.id);
    ensure(demand, 404, "Demanda não encontrada.");
    ensure(
      demand.company === account.profileId && ["nova", "em_analise"].includes(demand.status),
      403,
      "O briefing não pode ser removido.",
    );
    ensure((await removeDemandBriefing(db.sql, demand.id)) > 0, 404, "Briefing não encontrado.");
    return snapshot(db.sql, config, account);
  });

  /**
   * Capa do projeto. O envio é do próprio estudante; a leitura é pública,
   * porque o catálogo e a página do projeto são vistos sem login — mas só de
   * projeto de perfil visível na vitrine, a mesma regra do snapshot.
   */
  app.post<{ Params: { id: string } }>("/api/projects/:id/cover", async (request, reply) => {
    const account = await requireVerifiedAccount(db, request, config, "student");
    const dono = await db.sql.row("SELECT 1 FROM projeto_estudante WHERE id = $1 AND estudante_id = $2", [
      request.params.id,
      account.profileId,
    ]);
    ensure(dono, 404, "Projeto não encontrado.");

    const file = await request.file();
    ensure(file, 400, "Selecione uma imagem.");
    const content = await file.toBuffer();
    ensure(!file.file.truncated && content.length <= LIMITE_DA_CAPA, 413, "O limite da capa é 5 MB.");
    const mime = mimeDaImagem(content);
    ensure(mime, 400, "Envie uma imagem PNG, JPEG ou WebP.");

    await db.sql.run(
      `INSERT INTO projeto_capa (projeto_id, mime, conteudo, tamanho_bytes, enviada_em)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (projeto_id) DO UPDATE SET
         mime = excluded.mime, conteudo = excluded.conteudo,
         tamanho_bytes = excluded.tamanho_bytes, enviada_em = excluded.enviada_em`,
      [request.params.id, mime, content, content.length],
    );
    reply.code(201);
    return snapshot(db.sql, config, account);
  });

  app.get<{ Params: { id: string } }>("/api/projects/:id/cover", async (request, reply) => {
    const capa = await db.sql.row<{ mime: string; conteudo: Buffer; estudante_id: string; visivel: boolean }>(
      `SELECT c.mime, c.conteudo, p.estudante_id,
              (EXISTS (SELECT 1 FROM estudante_competencia ec WHERE ec.estudante_id = e.id)
               ${config.requireVerifiedEmail ? "AND co.email_confirmado_em IS NOT NULL" : ""}) AS visivel
       FROM projeto_capa c
       JOIN projeto_estudante p ON p.id = c.projeto_id
       JOIN estudante e         ON e.id = p.estudante_id
       JOIN conta co            ON co.id = e.conta_id
       WHERE c.projeto_id = $1`,
      [request.params.id],
    );
    ensure(capa, 404, "Capa não encontrada.");
    if (!capa.visivel) {
      const account = await accountFor(db, request);
      ensure(
        account?.role === "curator" || (account?.role === "student" && account.profileId === capa.estudante_id),
        404,
        "Capa não encontrada.",
      );
    }
    return reply.header("Cache-Control", "public, max-age=31536000, immutable").type(capa.mime).send(capa.conteudo);
  });

  app.delete<{ Params: { id: string } }>("/api/projects/:id/cover", async (request) => {
    const account = await requireAccount(db, request, "student");
    const removidas = await db.sql.run(
      `DELETE FROM projeto_capa WHERE projeto_id IN
         (SELECT id FROM projeto_estudante WHERE id = $1 AND estudante_id = $2)`,
      [request.params.id, account.profileId],
    );
    ensure(removidas > 0, 404, "Capa não encontrada.");
    return snapshot(db.sql, config, account);
  });

  app.get<{ Params: { id: string } }>("/api/students/:id/portfolio", async (request) => {
    const account = await requireAccount(db, request);
    ensure(await estudantes.porId(db.sql, request.params.id), 404, "Estudante não encontrado.");
    ensure(
      (account.role === "student" && account.profileId === request.params.id) ||
        account.role === "curator" ||
        (account.role === "requester" &&
          (await requesterCanViewPortfolio(db.sql, account.profileId, request.params.id))),
      403,
      "Portfólio privado.",
    );
    return portfolioFiles(db.sql, request.params.id);
  });
  app.post<{ Params: { category: string } }>("/api/attachments/:category", async (request, reply) => {
    const account = await requireVerifiedAccount(db, request, config, "student");
    const { category } = request.params;
    ensure(["tech", "language", "portfolio"].includes(category), 400, "Categoria inválida.");
    const file = await request.file();
    ensure(file, 400, "Selecione um arquivo.");
    const name = basename(file.filename.replaceAll("\\", "/"))
      // eslint-disable-next-line no-control-regex -- tirar caractere de controle do nome é o objetivo
      .replace(/[\x00-\x1f\x7f]/g, "")
      .slice(0, 200);
    const extension = extname(name).toLowerCase();
    ensure(
      (category === "portfolio" ? [".pdf", ".zip", ".docx"] : [".pdf"]).includes(extension),
      400,
      "Formato de arquivo não permitido.",
    );
    const content = await file.toBuffer();
    ensure(!file.file.truncated, 413, "O limite por arquivo é 20 MB.");
    const pdf = content.subarray(0, 5).toString() === "%PDF-";
    const zip = content[0] === 0x50 && content[1] === 0x4b && content[2] === 0x03 && content[3] === 0x04;
    ensure(extension === ".pdf" ? pdf : zip, 400, "O conteúdo não corresponde ao formato do arquivo.");

    await db.transaction(async (tx) => {
      // Usa anexo_estudante_estudante; antes somava o tamanho dos BLOBs varrendo a tabela.
      const uso = (await tx.row<{ total: string; bytes: string }>(
        `SELECT count(*) AS total, COALESCE(sum(tamanho_bytes), 0) AS bytes
         FROM anexo_estudante WHERE estudante_id = $1`,
        [account.profileId],
      ))!;
      ensure(
        Number(uso.total) < 20 && Number(uso.bytes) + content.length <= 100 * 1024 * 1024,
        409,
        "Limite de 20 arquivos ou 100 MB por perfil.",
      );
      await tx.run(
        `INSERT INTO anexo_estudante (estudante_id, nome, categoria, mime, conteudo, tamanho_bytes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [account.profileId, name, category, "application/octet-stream", content, content.length],
      );
    });
    reply.code(201);
    return snapshot(db.sql, config, account);
  });

  app.get<{ Params: { id: string } }>("/api/attachments/:id", async (request, reply) => {
    ensureUuid(request.params.id, "Arquivo");
    const account = await requireAccount(db, request);
    const arquivo = await db.sql.row<{ estudante_id: string; nome: string; categoria: string; conteudo: Buffer }>(
      "SELECT estudante_id, nome, categoria, conteudo FROM anexo_estudante WHERE id = $1",
      [request.params.id],
    );
    ensure(arquivo, 404, "Arquivo não encontrado.");
    ensure(
      account.role === "curator" ||
        (account.role === "student" && arquivo.estudante_id === account.profileId) ||
        (account.role === "requester" &&
          arquivo.categoria === "portfolio" &&
          (await requesterCanViewPortfolio(db.sql, account.profileId, arquivo.estudante_id))),
      403,
      "Arquivo privado.",
    );
    return reply
      .header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(arquivo.nome)}`)
      .type("application/octet-stream")
      .send(Buffer.from(arquivo.conteudo));
  });

  app.delete<{ Params: { id: string } }>("/api/attachments/:id", async (request) => {
    ensureUuid(request.params.id, "Arquivo");
    const account = await requireAccount(db, request, "student");
    const removidos = await db.sql.run("DELETE FROM anexo_estudante WHERE id = $1 AND estudante_id = $2", [
      request.params.id,
      account.profileId,
    ]);
    ensure(removidos > 0, 404, "Arquivo não encontrado.");
    return snapshot(db.sql, config, account);
  });
}

/** Reconhece a imagem pelos bytes iniciais; o nome e o content-type do envio não valem como prova. */
function mimeDaImagem(bytes: Buffer): string | null {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}
