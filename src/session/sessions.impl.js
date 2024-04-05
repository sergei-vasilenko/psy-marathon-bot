import PouchDB from "pouchdb";
import { DATA_BASES } from "../constants.js";

class Sessions {
  #db = null;
  #state = new Set();
  #cookieKey = "";
  #lifetime = 0;

  constructor(db, { cookieKey = "auth-id", lifetime = "1m" }) {
    this.#db = db;
    this.#cookieKey = cookieKey;

    const odds = {
      min: 60,
      h: 3600,
      d: 43200,
      m: 1296000,
    };
    const [, value, unit] = lifetime.match(/^(\d+)(\D+)/);
    this.#lifetime = parseInt(value) * (odds[unit] || 0);
  }

  restore() {
    this.#db
      .allDocs({
        include_docs: true,
      })
      .then((result) => result.rows.map((row) => row.doc))
      .then((sessions) => {
        const currentTime = new Date().getTime();
        sessions.forEach((session) => {
          if (session._ttl * 1000 < currentTime) {
            this.#db.remove(session._id, session._rev);
          } else {
            this.#state.add(session._id);
          }
        });
      });
  }

  extractAuthId(req) {
    return req.cookies?.[this.#cookieKey];
  }

  start(req, res) {
    const id = Date.now().toString();
    res.setHeader("Set-Cookie", [
      `${this.#cookieKey}=${id}; HttpOnly; Max-Age=${
        this.#lifetime
      }; Path=/admin`,
    ]);
    res.setHeader("Authorization", "yes");
    this.#state.add(id);
    this.#db.put({ _id: id, _ttl: this.#lifetime });
  }

  end(req, res) {
    const id = this.extractAuthId(req);
    if (id) {
      const session = this.#db.get(id);
      this.#db.remove(id, session._rev);
      res.setHeader("Set-Cookie", [`${this.#cookieKey}=; Max-Age=0; Path=`]);
      this.#state.delete(id);
    }
    res.setHeader("Authorization", "no");
  }

  isAuth(req) {
    const id = this.extractAuthId(req);
    return this.#state.has(id);
  }

  prepareRes(req, res) {
    const id = this.extractAuthId(req);
    res.setHeader("Authorization", id || this.#state.has(id) ? "yes" : "no");
  }

  decorator(fn) {
    return new Proxy(fn, {
      apply(_fn, context, args) {
        if (!this.isAuth(args[0])) return;

        this.prepareRes(...args);
        return Reflect.apply(...arguments);
      },
    });
  }
}

const sessionsDB = new PouchDB(DATA_BASES.SESSIONS);

const sessions = new Sessions(sessionsDB, { lifetime: "1h" });

export default sessions;
