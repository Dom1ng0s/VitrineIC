/**
 * Backup e restauração do PostgreSQL usando `pg_dump` e `pg_restore`.
 *
 * Uso:
 *   node scripts/pg-backup.mjs backup   # gera arquivo .dump e aplica retenção
 *   node scripts/pg-backup.mjs restore <arquivo.dump> [targetDatabaseUrl]
 *
 * Variáveis:
 *   DATABASE_URL           conexão PostgreSQL de origem (ou destino no restore)
 *   BACKUP_DIR             diretório de saída (padrão: ./var/backups)
 *   BACKUP_RETENTION_DAYS  dias de retenção (padrão: 14)
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";

const command = process.argv[2] ?? "backup";
const backupDir = resolve(process.env.BACKUP_DIR ?? "./var/backups");
const retentionDays = Math.max(1, Number(process.env.BACKUP_RETENTION_DAYS ?? 14));
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://vitrineic:vitrineic@localhost:5433/vitrineic";

if (command === "backup") {
  mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = join(backupDir, `vitrineic-${stamp}.dump`);
  execFileSync("pg_dump", ["--format=custom", "--no-owner", "--file", file, databaseUrl], { stdio: "inherit" });

  const cutoff = Date.now() - retentionDays * 86_400_000;
  let removed = 0;
  for (const name of readdirSync(backupDir)) {
    if (!name.endsWith(".dump")) continue;
    const full = join(backupDir, name);
    if (statSync(full).mtimeMs < cutoff) {
      unlinkSync(full);
      removed += 1;
    }
  }
  console.log(`Backup concluído: ${file}${removed ? ` (${removed} antigo(s) removido(s))` : ""}`);
} else if (command === "restore") {
  const file = process.argv[3];
  const targetUrl = process.argv[4] ?? databaseUrl;
  if (!file) {
    console.error("Informe o caminho do arquivo .dump para restaurar.");
    process.exit(1);
  }
  execFileSync("pg_restore", ["--clean", "--if-exists", "--no-owner", "--dbname", targetUrl, resolve(file)], {
    stdio: "inherit",
  });
  console.log(`Restauração concluída em ${targetUrl.replace(/:[^:@/]+@/, ":***@")}`);
} else {
  console.error("Uso: node scripts/pg-backup.mjs <backup|restore> [arquivo] [targetUrl]");
  process.exit(1);
}
