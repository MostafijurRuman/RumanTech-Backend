import { app } from "@/app";
import { env } from "@/app/config/env";
import { disconnectPrisma } from "@/app/utils/prisma";
import { logger } from "@/app/utils/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`RumanTech API listening on port ${env.PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully.`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason });
  void shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  void shutdown("uncaughtException");
});
