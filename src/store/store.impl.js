import { DATA_BASES } from "../constants.js";
import dataBase from "../database/db.impl.js";
import { getChatId, match } from "../utils.js";

class AppStore {
  #db = null;
  #localState = new Map();

  constructor(db) {
    this.#db = db;
  }

  #prepareMsgForUserModel(msg) {
    const { first_name, last_name, username } = msg.from;
    const userData = {
      _id: getChatId(msg).toString(),
      first_name,
      last_name,
      username,
    };
    return this.#getUserModel(userData);
  }

  #getUserModel(data) {
    return {
      ...data,
      scene: 0,
      step: 0,
      is_active: true,
      is_completed: false,
      course_beginnings: 0,
      date_of_joining: Date(),
      last_activity_time: Date.now(),
      scene_message: [],
      scene_duration: [],
    };
  }

  restore() {
    this.#db
      .getStructElems(["_id", "scene", "step", "is_active"])
      .then((users) => {
        users.forEach(({ _id, scene, step, is_active }) =>
          this.#localState.set(_id.toString(), {
            scene,
            step,
            is_active,
          })
        );
      });
  }

  createUser(data) {
    const userData = this.#prepareMsgForUserModel(data);
    this.#localState.set(userData._id, {
      is_active: true,
      scene: 0,
      step: 0,
    });

    this.#db.create(userData);
  }

  getUserByIdFromLocal(id) {
    return this.#localState.get(id.toString());
  }

  getUserProgressById(id) {
    const { scene, step } = this.getUserByIdFromLocal(id);
    return { scene, step };
  }

  async getUserChatIdsList() {
    const users = await this.#db.getStructElems(["_id"]);
    return users.map((user) => parseInt(user._id));
  }

  async getUsersList() {
    const fields = ["_id", "first_name", "last_name", "username"];
    return await this.#db.getStructElems(fields);
  }

  async setUserProgressById(id, { scene, step }) {
    const _user = this.getUserByIdFromLocal(id);
    _user.scene = scene;
    _user.step = step;
    await this.#db.update(id, (user) => {
      user.scene = scene;
      user.step = step;
      return user;
    });
  }

  async setLastActivityTime(id) {
    await this.#db.update(id, (user) => {
      user.last_activity_time = Date.now();
      return user;
    });
  }

  async markUserAsCompleted(id) {
    await this.#db.update(id, (user) => {
      user.is_completed = true;
      return user;
    });
  }

  async markUserAsStartingOver(id) {
    await this.#db.update(id, (user) => {
      user.course_beginnings += 1;
      return user;
    });
  }

  async saveSceneMessage(id, message) {
    await this.#db.update(id, (user) => {
      user.scene_message.push({
        datestamp: Date.now(),
        scene: user.scene,
        text: message,
      });
      return user;
    });
  }

  async saveSceneDuration(id) {
    await this.#db.update(id, (user) => {
      const duration = user.scene_duration.at(-1);
      if (duration) {
        duration.until = Date.now();
      }

      user.scene_duration.push({
        scene: user.scene,
        since: Date.now(),
        until: Date.now(),
      });
      return user;
    });
  }

  getUserDetails(id) {
    if (id === undefined) return;
    return this.#db.one(id);
  }

  async getUsersCount(type) {
    const selector = match(
      {},
      ["active", { is_active: true }],
      ["completed", { is_completed: true }]
    )(type);
    const users = await this.#db.filter(selector);
    return users.length;
  }
}

const appStore = new AppStore(dataBase.connect(DATA_BASES.USERS));

export default appStore;
