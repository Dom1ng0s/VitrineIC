import { buildApp } from "./app";
import { hostDeEscuta } from "./config";
import { bootstrapCurator } from "./curator";

const { app, db } = await buildApp();
try {
  if (await bootstrapCurator(db))
    app.log.info(
      "Conta inicial de curadoria criada. Remova as variáveis de bootstrap quando houver disco persistente.",
    );
  await app.listen({
    port: Number(process.env.PORT ?? 3001),
    host: hostDeEscuta(),
  });
} catch (error) {
  await app.close();
  throw error;
}
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
}
