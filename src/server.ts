import Koa from "koa";
import KoaRouter from "koa-router";
import Sqlite3 from "sqlite3";

const logger = require("pino")();

const port = Number(process.env["SERVER_PORT"] || 3000);
if (isNaN(port)) {
  throw new Error(`invalid SERVER_PORT: ${process.env["SERVER_PORT"]}`);
}

logger.info({ msg: "Starting app", port });
const dbPath = process.env["SERVER_DB"] || "local/candidates.sqlite";
logger.info(`Initializing database in ${dbPath}`);

const db = new (Sqlite3.verbose().Database)(dbPath);

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

const app = new Koa();

const router = new KoaRouter();

router.get("/status", async (ctx) => {
  ctx.status = 200;
  ctx.body = "OK";
});

const logRequest: Koa.Middleware = async (ctx, next) => {
  logger.info({ msg: "Request", request: ctx.request });
  await next();
};

const logResponse: Koa.Middleware = async (ctx, next) => {
  logger.info({ msg: "Response", response: ctx.response });
  await next();
};

app
  .use(logRequest)
  .use(router.routes())
  .use(router.allowedMethods())
  .use(logResponse)
  .listen(3000);
