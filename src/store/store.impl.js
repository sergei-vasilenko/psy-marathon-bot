import mongoose from "mongoose";
import User from "./models/user.js";
import { getConfigKey, getChatId, match } from "../utils.js";

mongoose
  .connect(getConfigKey("DB_URL"))
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB Error:", err));

class AppStore {
  #db = null;
  #localState = new Map();

  constructor(db) {
    this.#db = db;
  }

  #prepareMsgForUserModel(msg) {
    const { first_name, last_name, username } = msg.from;
    return {
      first_name,
      last_name,
      username,
      chat_id: getChatId(msg),
      date_of_joining: Date(),
    };
  }

  async restore() {
    const requiredFields = ["chat_id", "scene", "step", "is_active"];
    await this.#db
      .find({}, requiredFields.join(" "))
      .lean()
      .exec()
      .then((users) => {
        users.forEach(({ chat_id, scene, step, is_active }) =>
          this.#localState.set(chat_id, {
            scene,
            step,
            is_active,
          })
        );
        return true;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  }

  async initUser(data) {
    const userData = this.#prepareMsgForUserModel(data);
    this.#localState.set(userData.chat_id, {
      is_active: true,
      scene: 0,
      step: 0,
    });
    try {
      const hasUser = await User.findOne({ chat_id: userData.chat_id });
      if (!hasUser) {
        await new this.#db(userData).save();
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async updateUser(id, action) {
    try {
      await this.#db.updateOne({ chat_id: id }, action);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  getUserById(id) {
    return this.#localState.get(id);
  }

  getUserProgressById(id) {
    const { scene, step } = this.getUserById(id);
    return { scene, step };
  }

  async getUserTemplateList(select) {
    return await this.#db.find({}, select).lean().exec();
  }

  async getUserChatIdsList() {
    return await this.getUserTemplateList("chat_id");
  }

  async getUsersList() {
    const select = "chat_id first_name last_name username";
    return await this.getUserTemplateList(select);
  }

  async setUserProgressById(id, { scene, step }) {
    const user = this.getUserById(id);
    user.scene = scene;
    user.step = step;
    return await this.updateUser(id, { $set: { scene, step } });
  }

  async setLastActivityTime(id) {
    return await this.updateUser(id, {
      $set: { last_activity_time: Date.now() },
    });
  }

  async markUserAsCompleted(id) {
    return await this.updateUser(id, { $set: { is_completed: true } });
  }

  async markUserAsStartingOver(id) {
    return await this.updateUser(id, { $inc: { course_beginnings: 1 } });
  }

  async saveSceneMessage(id, message) {
    try {
      const user = await this.#db.findOne({ chat_id: id });
      user.scene_message.push({
        datestamp: Date.now(),
        scene: user.scene,
        text: message,
      });
      user.save();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async saveSceneDuration(id) {
    try {
      const user = await this.#db.findOne({ chat_id: id });

      const duration = user.scene_duration.pop();
      if (duration) {
        duration.until = Date.now();
        user.scene_duration.push(duration);
      }

      user.scene_duration.push({
        scene: user.scene,
        since: Date.now(),
        until: Date.now(),
      });
      user.save();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async getUserDetails(id) {
    return await this.#db.find({ chat_id: id }).lean().exec();
  }

  async getUsersCount(type) {
    const filter = match(
      type,
      {},
      ["active", { is_active: true }],
      ["completed", { is_completed: true }]
    );
    const res = await this.#db.countDocuments(filter);
    console.log({ res, filter });
    return res;
  }
}

const appStore = new AppStore(User);

export default appStore;
