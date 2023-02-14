import Koa from "koa";
import KoaRouter from "koa-router";

const logger = require("pino")();

const port = Number(process.env["SERVER_PORT"] || 3000);

if (isNaN(port)) {
  throw new Error(`invalid SERVER_PORT: ${process.env["SERVER_PORT"]}`);
}

logger.info({ msg: "Starting app", port });

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
