class KeyboardWriter {
  #state = [[]];
  #cursor = { y: 0, x: 0 };
  #events = {
    update: () => {},
    build: () => {},
  };
  #maxLineLength;
  #defaultButton;

  constructor(defaultButton, maxLineLength = 3) {
    this.#maxLineLength = maxLineLength;
    if (defaultButton) {
      this.#state[0].push(defaultButton);
      this.#defaultButton = defaultButton;
    }
  }

  #emit(eventname) {
    if (!this.#events[eventname]) {
      console.warn(
        `Событие "${eventname}" не существует, проверьте правильность написания.`
      );
      return;
    }
    this.#events[eventname]();
  }

  build(validate = (value) => value) {
    const keyboard = this.#state.reduce((result, line) => {
      const filteredLine = line.filter(validate);
      if (filteredLine.length) {
        result.push(filteredLine);
      }
      return result;
    }, []);
    this.#state = [[this.#defaultButton]];
    this.#cursor = { x: 0, y: 0 };
    return keyboard;
  }

  on(eventname, callback) {
    if (!this.#events[eventname]) {
      console.warn(
        `Событие "${eventname}" не существует, проверьте правильность написания.`
      );
      return;
    }
    this.#events[eventname] = () => {
      callback({ state: this.#state, cursor: this.#cursor });
    };
  }

  left() {
    if (this.#cursor.x !== 0) {
      this.#cursor.x--;
      this.#emit("update");
    }
  }

  right() {
    if (this.#cursor.x < this.#state[this.#cursor.y].length - 1) {
      this.#cursor.x++;
      this.#emit("update");
    }
  }

  up() {
    if (this.#cursor.y !== 0) {
      const isLastButton =
        this.#cursor.x === this.#state[this.#cursor.y].length - 1;
      this.#cursor.y--;
      if (this.#state[this.#cursor.y].length === 0) {
        this.#cursor.x = 0;
      } else if (
        isLastButton ||
        this.#cursor.x === this.#state[this.#cursor.y].length - 1
      ) {
        this.#cursor.x = this.#state[this.#cursor.y].length - 1;
      }
      this.#emit("update");
    }
  }

  down() {
    if (this.#cursor.y < this.#state.length - 1) {
      const isLastButton =
        this.#cursor.x === this.#state[this.#cursor.y].length - 1;
      this.#cursor.y++;
      if (this.#state[this.#cursor.y].length === 0) {
        this.#cursor.x = 0;
      } else if (
        isLastButton ||
        this.#cursor.x >= this.#state[this.#cursor.y].length - 1
      ) {
        this.#cursor.x = this.#state[this.#cursor.y].length - 1;
      }
      this.#emit("update");
    }
  }

  addLine() {
    const newLine = this.#defaultButton ? [this.#defaultButton] : [];
    this.#state.push(newLine);
    this.#cursor.y = this.#state.length - 1;
    this.#cursor.x = 0;
    this.#emit("update");
  }

  addButton(data, isPrevPos = false) {
    if (this.#state[this.#cursor.y].length >= this.#maxLineLength) return;
    const newPos = isPrevPos ? this.#cursor.x : this.#cursor.x + 1;
    this.#state[this.#cursor.y].splice(newPos, 0, data);
    this.#cursor.x = newPos;
    this.#emit("update");
  }

  updateButton(callback) {
    const { x, y } = this.#cursor;
    const data = this.#state[y]?.[x];
    if (!data) return;
    this.#state[y].splice(x, 1, callback(data));
    this.#emit("update");
  }

  show(callback) {
    const { x, y } = this.#cursor;
    return callback ? callback(this.#state[y]?.[x]) : this.#state[y]?.[x];
  }

  deleteButton() {
    const { x, y } = this.#cursor;
    this.#state[y]?.splice(x, 1);
    if (!this.#state[y].length) {
      this.#state.splice(y, 1);
      this.#cursor.x = 0;
      this.#cursor.y = y - 1;
    } else if (this.#state[y].length - 1 < x) {
      this.#cursor.x = this.#state[y].length - 1;
    }
    this.#emit("update");
  }

  deleteLine() {
    const { y } = this.#cursor;
    this.#state.splice(y, 1);
    this.#cursor.x = 0;
    this.#cursor.y = y > 0 ? y - 1 : 0;
    this.#emit("update");
  }

  reset() {
    this.#state = [[]];
    this.#cursor = { y: 0, x: 0 };
  }

  get keyboard() {
    return this.#state;
  }

  get cursor() {
    return this.#cursor;
  }
}

export default KeyboardWriter;
