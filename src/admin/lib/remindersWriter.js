class RemindersWriter {
  #id = 0;
  #groups = [];
  #onUpdate = () => {};

  #getGroup(id) {
    return this.#groups.find((group) => group._id === id);
  }

  update(callback) {
    this.#onUpdate = () => callback(this.#groups);
  }

  createGroup(name) {
    this.#groups.push({
      _id: this.#id++,
      reminders: [],
      name,
    });
    this.#onUpdate();
  }

  createReminder(groupId, data) {
    const group = this.#getGroup(groupId);
    group.reminders.push({
      _id: this.#id++,
      _parent: group,
      delay: 0,
      message: "",
      buttons: [],
      ...data,
    });
    this.#onUpdate();
  }

  updateElem(element, callback) {
    callback(element);
    this.#onUpdate();
  }

  removeReminder(reminder) {
    const indexToDelete = reminder.parent.findIndex(
      (siblings) => reminder._id === siblings._id
    );
    reminder.parent.splice(indexToDelete, 1);
    this.#onUpdate();
  }
}

export default new RemindersWriter();
