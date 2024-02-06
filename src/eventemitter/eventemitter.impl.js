class EventEmitter {
  #events = null;
  #hosting = null;

  constructor(events = [], hosting) {
    const eventsStore = events.reduce((store, eventname) => {
      store.push([eventname, []]);
      return store;
    }, []);
    this.#events = new Map(eventsStore);
    this.#hosting = hosting;
  }

  subscribe(eventname, callback) {
    if (!this.#events.has(eventname)) {
      console.warn(
        `No event with the name "${eventname}" have been registered. Hosting: ${
          this.#hosting
        }`
      );
      return false;
    }
    this.#events.get(eventname).push(callback);
    return true;
  }

  emit(eventname, ...args) {
    if (!this.#events.has(eventname)) {
      console.warn(
        `No event with the name "${eventname}" have been registered. Hosting: ${
          this.#hosting
        }`
      );
      return false;
    }
    this.#events.get(eventname).forEach((callback) => callback(...args));
    return true;
  }
}

export default EventEmitter;
