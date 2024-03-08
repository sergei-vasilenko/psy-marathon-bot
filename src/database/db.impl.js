import fs from "fs";
import path from "path";
import userSchema from "./models/user.js";

class DB {
  #state = new Map();
  #keyAsId = null;
  #directory = null;
  #model = null;

  constructor(settings) {
    const { keyAsId = "id", directory = "./db/", model = {} } = settings || {};
    this.#keyAsId = keyAsId;
    this.#directory = directory;
    this.#model = model;
  }

  #loadUnitsName() {
    fs.readdir(this.#directory, { withFileTypes: true }, (err, files) => {
      if (err?.code === "ENOENT") {
        fs.mkdir(this.#directory, { recursive: true }, (err) => {
          if (err) {
            console.error(
              `Не удалось создать каталог "${this.#directory}":`,
              err
            );
            return;
          }
        });
      } else if (err) {
        console.error("Ошибка при чтении каталога:", err);
        return;
      }

      return files?.filter((file) => path.extname(file) === ".json");
    });
  }

  #patternMatch(criteria, unit) {
    if (Object.keys(criteria).length === 0) return true;

    const [key, value] = Object.entries(criteria).at(0);
    return unit[key] === value;
  }

  #compareObjects(first, second) {
    const keysFromFirst = Object.keys(first).sort();
    const keysFromSecond = Object.keys(second).sort();

    if (keysFromFirst.length !== keysFromSecond.length) return false;

    for (let i = 0; i < keysFromFirst.length; i++) {
      if (keysFromFirst[i] !== keysFromSecond[i]) {
        return false;
      }
    }

    return true;
  }

  #saveToFile(unit) {
    const filePath = `${this.#directory}${unit[this.#keyAsId]}.json`;
    fs.writeFile(filePath, unit, "utf8", (err) => {
      if (err) {
        const errMsg = `Не удалось записать обновленные данные в файл ${
          unit[this.#keyAsId]
        }`;
        console.error(errMsg, err);
        return;
      }
      console.log(`Сохранено! ${unit[this.#keyAsId]}`);
    });
  }

  #readUnit(name) {
    const filePath = this.#directory + name;
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        const errMsg = `Не удалось прочитать файл ${name}:`;
        console.error(errMsg, err);
        return {};
      }

      try {
        return JSON.parse(data);
      } catch (parseErr) {
        const errMsg = "Ошибка получения данных:";
        console.error(errMsg, parseErr);
        return {};
      }
    });
  }

  #hasProp(target, key) {
    return Object.prototype.hasOwnProperty.call(target, key);
  }

  #type(value) {
    if (value === null) {
      return "null";
    }
    const baseType = typeof value;
    if (!["object", "function"].includes(baseType)) {
      return baseType;
    }

    const tag = value[Symbol.toStringTag];
    if (typeof tag === "string") {
      return tag;
    }

    if (
      baseType === "function" &&
      Function.prototype.toString.call(value).startsWith("class")
    ) {
      return "class";
    }

    const className = value.constructor.name;
    if (typeof className === "string" && className !== "") {
      return className;
    }

    return baseType;
  }

  #checkType(target, type, isInit = false) {
    if (Array.isArray(type)) {
      if (!Array.isArray(target)) {
        console.error(
          `For the value "${JSON.stringify(
            target
          )}" the type is expected to be "Array", but actually the type is "${this.#type(
            target
          )}"`
        );
        return false;
      }

      for (let i = 0; i < type.length; i++) {
        if (isInit && target.length === 0) {
          return true;
        }
        if (!this.#checkType(target.at(i), type.at(i), isInit)) {
          return false;
        }
      }

      return true;
    }

    if (type !== null && typeof type === "object") {
      if (target !== null && typeof target !== "object") {
        console.error(
          `For the value "${JSON.stringify(
            target
          )}" the type is expected to be "Object", but actually the type is "${this.#type(
            target
          )}"`
        );
        return false;
      } else if (!this.#compareObjects(target, type)) {
        console.error(
          `Object "${JSON.stringify(target)}" does not match the described type`
        );
        return false;
      }

      for (const [key, expectedType] of Object.entries(type)) {
        if (isInit && Object.keys(target).length === 0) {
          return true;
        }
        if (!this.#checkType(target[key], expectedType, isInit)) {
          return false;
        }
      }
      return true;
    }

    return type(target) === type;
  }

  #createUnit(data) {
    const dataCopy = data.slice();
    Object.entries(this.#model).forEach(([key, options]) => {
      if (!this.#hasProp(dataCopy, key)) {
        if (this.#hasProp(options, "default")) {
          dataCopy[key] = options.default;
        }
        if (options.require) {
          throw new Error(`Property "${key}" is required`);
        }
        if (options.type) {
          this.#checkType(dataCopy[key], options.type, true);
        }
      }
    });
    return dataCopy;
  }

  #executor(changedFields, handler) {
    Object.entries(changedFields).forEach(([key, value]) => {
      if (this.#checkType(value, this.#model[key])) {
        handler(value, key);
      }
    });
  }

  #performAction(target, action, fields) {
    switch (action) {
      case "$set":
        this.#executor(fields, (value, key) => {
          target[key] = value;
        });
        break;
      case "$push":
        this.#executor(fields, (value) => {
          target.push(value);
        });
        break;
      case "$inc":
        this.#executor(fields, (value, key) => {
          target[key] += value;
        });
        break;
      case "$dec":
        this.#executor(fields, (value, key) => {
          target[key] -= value;
        });
        break;
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        const unitsName = this.#loadUnitsName() || [];
        unitsName.forEach((name) => {
          const unit = this.#readUnit(name);
          this.add(unit, true);
        });
        resolve("Success!");
      } catch (err) {
        reject(err);
      }
    });
  }

  updateOne(id, actions) {
    const target = this.get(id);
    const validData = {};
    for (const [action, fields] of Object.entries(actions)) {
      this.#performAction(target, action, fields);
    }
    const updObject = { ...target, ...validData };
    return this.add(updObject);
  }

  update(criteria, data) {
    this.getAll(criteria).forEach((item) => {
      this.updateOne(item[this.#keyAsId], data);
    });
    return true;
  }

  add(unit, isRestore = false) {
    let isSuccess = true;
    const id = unit[this.#keyAsId];
    const validUnit = this.#createUnit(unit);

    if (!isRestore) {
      isSuccess = this.#saveToFile(validUnit);
    }

    this.#state.set(id, validUnit);
    return isSuccess;
  }

  get(id) {
    return this.#state.get(id);
  }

  getAll(criteria, viewModel) {
    let result = [];
    if (criteria) {
      this.#state.forEach((value) => {
        if (this.#patternMatch(criteria, value)) {
          result.push(value);
        }
      });
    } else {
      result = [...this.#state.values()];
    }

    if (viewModel) {
      result = result.map((unit) => {
        return viewModel.reduce((newForm, key) => {
          newForm[key] = unit[key];
          return newForm;
        }, {});
      });
    }

    return Promise.resolve(result);
  }

  getFirst(criteria) {
    for (const value of this.#state.values()) {
      if (!criteria) return value;
      if (this.#patternMatch(criteria, value)) {
        return value;
      }
    }
    return null;
  }

  has(id) {
    return this.#state.has(id);
  }

  size() {
    this.#state.size;
  }

  count(criteria) {
    let counter = 0;
    this.#state.forEach((value) => {
      if (this.#patternMatch(criteria, value)) {
        counter++;
      }
    });

    return counter;
  }
}

export default new DB({ model: userSchema });
