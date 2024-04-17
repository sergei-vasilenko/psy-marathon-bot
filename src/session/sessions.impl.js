import { DATA_BASES } from "../constants.js";
import dataBase from "../database/db.impl.js";

class Sessions {
  #db = null;
  #state = new Set();
  #cookieKey = "";
  #lifetime = 0;

  constructor(db, { cookieKey = "_auth-id", lifetime = "1m" }) {
    this.#db = db;
    this.#cookieKey = cookieKey;

    const odds = {
      min: 60000,
      h: 3600000,
      d: 43200000,
      m: 1296000000,
    };
    const [, value, unit] = lifetime.match(/^(\d+)(\D+)/);
    this.#lifetime = parseInt(value) * (odds[unit] || 0);
  }

  async restore() {
    await this.#db
      .list()
      .then((sessions) => {
        const currentTime = new Date().getTime();
        sessions.forEach((session) => {
          if (session.ttl * 1000 < currentTime) {
            this.#db.delete(session._id);
          } else {
            this.#state.add(session._id);
          }
        });
      })
      .catch((err) => console.error(err));
  }

  extractAuthId(req) {
    return req.cookies[this.#cookieKey];
  }

  async start(req, res) {
    const id = Date.now().toString();
    res.cookie(this.#cookieKey, id, { httpOnly: true, maxAge: this.#lifetime });
    this.#state.add(id);
    await this.#db.create({ _id: id, ttl: this.#lifetime + Date.now() });
  }

  async end(req, res) {
    const id = this.extractAuthId(req);
    if (id) {
      await this.#db.remove(id);
      res.clearCookie(this.#cookieKey);
      this.#state.delete(id);
    }
  }

  isAuth(req) {
    const id = this.extractAuthId(req);
    return this.#state.has(id);
  }
}

const sessionsDB = dataBase.connect(DATA_BASES.SESSIONS);

const sessions = new Sessions(sessionsDB, { lifetime: "1m" });

export default sessions;
