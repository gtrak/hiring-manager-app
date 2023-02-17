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
    id integer primary key not null,
    first_name text,
    last_name text,
    email text,
    phone text,
    status text,
    note text,
    seed string
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

const sqliteCb = <T>(
  resolve: (value?: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
) => {
  return (nullOrError: null | Error, maybeRowOrRows: T | undefined) => {
    if (!nullOrError) {
      resolve(maybeRowOrRows);
    } else {
      reject(nullOrError);
    }
  };
};

export interface UserModel {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  note?: string;
  seed: string;
}

const candidateById = (
  db: Sqlite3.Database,
  id: number
): Promise<UserModel | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * from candidates where id = ?",
      [id],
      sqliteCb(resolve, reject)
    );
  });
};

router.post("/candidate", async (ctx) => {
  const db = ctx.db;
  const { id, first_name, last_name, email, phone, status, note, seed } =
    ctx.request.body;

  const insert = await new Promise<{ id: number }[] | undefined>(
    (resolve, reject) => {
      db.all(
        `INSERT INTO candidates (id, first_name, last_name, email, phone, status, note, seed)
     VALUES(?)
     ON CONFLICT (id)
     DO UPDATE SET
     first_name = excluded.first_name,
     last_name = excluded.last_name,
     email = excluded.email,
     phone = excluded.phone,
     status = excluded.status,
     note = excluded.note,
     seed = excluded.seed
     RETURNING id`,
        [id, first_name, last_name, email, phone, status, note, seed],
        sqliteCb(resolve, reject)
      );
    }
  );
  return candidateById(db, insert![0].id);
});

export const responseInfo = ({
  results,
  info,
}: {
  results: any;
  info: any;
}): UserModel => {
  const candidate = results[0];
  return {
    first_name: candidate.name.first_name,
    last_name: candidate.name.last_name,
    email: candidate.email,
    phone: candidate.phone,
    status: "New",
    seed: info.seed,
  };
};

router.get("/candidate/new", async (ctx) => {
  const randomUser = await (await fetch(`https:/randomuser.me/api`)).json();
  ctx.response.body = {
    candidate: responseInfo(randomUser),
    detail: randomUser.results[0],
  };
});

router.get("/candidate/:id", async (ctx) => {
  const db = ctx.db;

  const candidate: UserModel | undefined = await new Promise(
    (resolve, reject) => {
      db.get(
        `select * from candidates where id = ?`,
        [ctx.params.id],
        sqliteCb(resolve, reject)
      );
    }
  );
  ctx.response.body = {
    candidate,
    detail: await (
      await fetch(`https:/randomuser.me/api/?seed=${candidate!.seed}`)
    ).json(),
  };
});

router.get("/candidate", async (ctx) => {
  const db = ctx.db;
  ctx.response.body = {
    items: await new Promise<UserModel[] | undefined>((resolve, reject) => {
      db.all(`select * from candidates`, sqliteCb(resolve, reject));
    }),
  };
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
