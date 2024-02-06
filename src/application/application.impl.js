class Application {
  #messages = [];
  #errors = [];
  #roleModel = [];

  constructor(roleModel) {
    this.#roleModel = roleModel;
  }

  log(data) {
    this.#messages.push(Object.assign(data, { time: new Date() }));
  }

  logErr(data) {
    this.#errors.push(Object.assign(data, { time: new Date() }));
  }

  getMessages() {
    return this.#messages;
  }

  getErrors() {
    return this.#errors;
  }

  hasAccess(id, role) {
    const group = this.#roleModel.find((elem) => elem.role === role);
    return group?.members === "any" || group?.members.has(id);
  }
}

export default Application;
