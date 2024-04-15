class RemindersWriter {
  #groups = [];
  #onUpdate = () => {};

  #getGroup(id) {
    return this.#groups.find((group) => group.id === id);
  }

  init(groups) {
    this.#groups = [...groups, ...this.#groups].sort((a, b) => a.id - b.id);
    this.#onUpdate();
  }

  update(callback) {
    this.#onUpdate = () => callback(this.#groups);
    this.#onUpdate();
  }

  createGroup(name) {
    const lastGroup = this.#groups.at(-1);
    const id = lastGroup ? lastGroup.id + 1 : 0;
    this.#groups.push({
      id,
      name,
      reminders: [],
    });
    this.#onUpdate();
    return this.#groups.at(-1);
  }

  removeGroup(id) {
    const indexToDelete = this.#groups.findIndex((group) => group.id === id);
    const removedElement = this.#groups[indexToDelete];
    this.#groups.splice(indexToDelete, 1);
    this.#onUpdate();
    return removedElement;
  }

  createReminder(groupId, data) {
    const allRemindersIds = this.#groups
      .reduce((result, group) => {
        const reminderIds = group.reminders.map((elem) => elem.id);
        return [...result, ...reminderIds];
      }, [])
      .sort((a, b) => a - b);

    const id = allRemindersIds.length ? allRemindersIds.at(-1) + 1 : 0;

    const group = this.#getGroup(groupId);
    group.reminders.push({
      _parent: group,
      id,
      delay: 0,
      message: "",
      keyboard: [],
      ...data,
    });
    this.#onUpdate();
  }

  updateReminder(reminder, callback) {
    callback(reminder);
    this.#onUpdate();
  }

  removeReminder(reminder) {
    const indexToDelete = reminder._parent.reminders.findIndex(
      (siblings) => reminder.id === siblings.id
    );
    reminder._parent.reminders.splice(indexToDelete, 1);
    this.#onUpdate();
  }
}

export default RemindersWriter;
