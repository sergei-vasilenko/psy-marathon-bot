import PouchDB from "pouchdb";
import ActionAccumulator from "../actionaccumulator/actionaccumulator.impl.js";
import { DATA_BASES } from "../constants.js";
import { checkFields, objectFromFields } from "../utils.js";

class DBAdapter {
  #instance = null;
  #actionAccumulator = null;

  constructor(id) {
    this.#instance = new PouchDB(`app_storage/${id}`);
    this.#actionAccumulator = new ActionAccumulator();
    this.#actionAccumulator.action((elemId, handler) => {
      console.log({ elemId });
      this.#instance
        .get(elemId)
        .then((elem) => {
          return this.#instance.put(handler(elem));
        })
        .catch((err) => {
          console.error(err);
        });
    });

    // this.#instance.on("conflict", function (conflict) {
    //   const latestDoc = conflict.docs.reduce((prev, current) => {
    //     return prev._rev > current._rev ? prev : current;
    //   });

    //   conflict.resolve(latestDoc);
    // });
  }

  has(id) {
    return !!this.#instance.get(id);
  }

  create(data) {
    return this.#instance.get(data._id).catch((err) => {
      if (err.status === 404) {
        this.#instance.put(data);
      } else {
        throw err;
      }
    });
  }

  update(id, action) {
    this.#actionAccumulator.add(id, action);
  }

  set(data) {
    return this.#instance
      .get(data._id)
      .then((elem) => {
        this.#instance.put({
          ...data,
          _rev: elem._rev,
        });
      })
      .catch((err) => {
        if (err.status === 404) {
          this.#instance.put(data);
        } else {
          throw err;
        }
      });
  }

  getStructElems(fields) {
    return this.#instance
      .allDocs({
        include_docs: true,
      })
      .then((result) =>
        result.rows.map((row) => objectFromFields(row.doc, fields))
      );
  }

  one(id) {
    if (id === undefined) return;
    return this.#instance.get(id.toString());
  }

  list() {
    return this.#instance
      .allDocs({ include_docs: true })
      .then((result) => result.rows.map((row) => row.doc));
  }

  delete(id) {
    const elem = this.one(id);
    if (elem) {
      const { _id, _rev } = elem;
      this.#instance.remove(_id, _rev);
    }
  }

  filter(selector) {
    return this.list().then((elems) =>
      elems.filter((elem) => checkFields(elem, selector))
    );
  }

  destroy() {
    this.#instance.destroy();
  }
}

class DataBase {
  #instances = new Map();

  constructor(Adapter, dbIds = []) {
    dbIds.forEach((id) => {
      this.#instances.set(id, new Adapter(id));
    });
  }

  connect(id) {
    return this.#instances.get(id);
  }
}

const dataBase = new DataBase(DBAdapter, Object.values(DATA_BASES));

export default dataBase;
