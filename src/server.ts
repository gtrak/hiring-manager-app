import Koa from "koa";
import KoaRouter from "koa-router";
import { koaBody } from "koa-body";

import Sqlite3 from "sqlite3";
const logger = require("pino")();

const port = Number(process.env["SERVER_PORT"] || 3000);
if (isNaN(port)) {
  throw new Error(`invalid SERVER_PORT: ${process.env["SERVER_PORT"]}`);
}

logger.info({ msg: "Starting app", port });
const dbPath = process.env["SERVER_DB"] || "local/candidates.sqlite";
logger.info(`Initializing database in ${dbPath}`);

const openDb = () => {
  return new (Sqlite3.verbose().Database)(dbPath);
};

(() => {
  const db = openDb();

  /* This is just a low-tech migration script example, I would use a real library in production */
  const migrations = `
CREATE TABLE IF NOT EXISTS candidates (
    id uuid primary key not null,
    first_name text,
    last_name text,
    email text,
    note text
)
`;
  logger.info({ msg: "Running migrations" });
  db.all(migrations);
  logger.info({ msg: "Running migrations finished" });

  db.close();
})();

const app = new Koa();

interface WithDb extends Koa.Context {
  db: Sqlite3.Database;
}

const router = new KoaRouter<Koa.DefaultState, WithDb>();

router.post("/candidate", async (ctx) => {
  const db = ctx.db;
  const { first_name, last_name, email, note } = ctx.request.body;
  db;
});

const logRequest: Koa.Middleware = async (ctx, next) => {
  logger.info({ msg: "Request", request: ctx.request });
  return await next();
};

const db: Koa.Middleware = async (ctx, next) => {
  const db = openDb();
  ctx.db = db;
  try {
    return await next();
  } finally {
    db.close();
    ctx.db = undefined;
  }
};

const logResponse: Koa.Middleware = async (ctx, next) => {
  logger.info({ msg: "Response", response: ctx.response });
  return await next();
};

app
  .use(logRequest)
  .use(koaBody())
  .use(db)
  .use(router.routes())
  .use(router.allowedMethods())
  .use(logResponse)
  .listen(3000);
