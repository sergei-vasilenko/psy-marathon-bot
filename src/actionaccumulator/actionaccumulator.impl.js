import { compose } from "../utils.js";

class ActionAccumulator {
  #actions = null;
  #timers = null;
  #onAction;
  #timeout;

  constructor(timeout = 2000) {
    this.#actions = new Map();
    this.#timers = new Map();
    this.#onAction = async () => {};
    this.#timeout = timeout;
  }

  #process(id) {
    this.#timers.set(
      id,
      setTimeout(() => {
        this.#timers.delete(id);
        const actionsStorage = this.#actions.get(id);
        const actions = [];
        while (actionsStorage.length > 0) {
          const action = actionsStorage.shift();
          actions.push(action);
        }
        if (this.#actions.get(id).length === 0) {
          this.#actions.delete(id);
        }
        const handler = compose(...actions);
        this.#onAction(id.toString(), handler);
      }, this.#timeout)
    );
  }

  action(callback) {
    this.#onAction = callback;
  }

  add(id, action) {
    if (!this.#actions.has(id)) {
      !this.#actions.set(id, []);
    }
    this.#actions.get(id).push(action);
    if (!this.#timers.has(id)) {
      return this.#process(id, action);
    }
  }
}

export default ActionAccumulator;
