class Scheduler {
  #dataset = [];
  #subscribers = [];
  #interval = null;
  #times = {
    seconds: 1000,
    minutes: 60000,
    hours: 3600000,
    days: 86400000,
  };
  #unit = "minutes";

  constructor(unit = "minutes") {
    if (Object.keys(this.#times).includes(unit)) {
      this.#unit = unit;
    }
    this.setInterval();
  }

  async sync() {
    this.#checkPlans();
  }

  get hasEvents() {
    return this.#dataset.length > 0;
  }

  get isNextEventComing() {
    return Date.now() >= this.#dataset.at(-1)?._responseTime;
  }

  #calcResponseTime(now, delay) {
    return delay * this.#times[this.#unit] + now;
  }

  #checkPlans() {
    while (this.hasEvents) {
      if (this.isNextEventComing) {
        const event = this.#dataset.pop();
        this.#subscribers.forEach((callback) => callback(event));
      } else {
        return true;
      }
    }
  }

  on(callback) {
    this.#subscribers.push(callback);
    return this;
  }

  setInterval(value = 1, unit) {
    if (this.#interval) {
      clearInterval(this.#interval);
    }
    this.#interval = setInterval(() => {
      this.#checkPlans(this);
    }, value * this.#times[unit || this.#unit]);
    return this;
  }

  stop() {
    clearInterval(this.#interval);
    return true;
  }

  clean() {
    this.#dataset = [];
  }

  plans(id, reminders = [], options = { deletePrevious: true }) {
    if (!Array.isArray(reminders)) {
      console.warn(
        `The "reminders" argument is not an array. Actual type: ${typeof reminders}`
      );
      return this;
    }
    const now = Date.now();
    if (options.deletePrevious) {
      this.#dataset = this.#dataset.filter((reminder) => reminder.id !== id);
    }
    reminders.forEach((reminder) => {
      const _responseTime = this.#calcResponseTime(now, reminder.delay);
      this.#dataset.push({ id, reminder, _responseTime });
    });
    this.#dataset.sort((a, b) => b._responseTime - a._responseTime);
    return this;
  }
}

const scheduler = new Scheduler("hours");

export default scheduler;
