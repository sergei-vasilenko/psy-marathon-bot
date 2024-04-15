import EventEmitter from "../eventemitter/eventemitter.impl.js";
import sceneManager from "../scenes/scenemanager.impl.js";
import appStore from "../store/store.impl.js";

class BotMediator {
  #dbStore = null;
  #sceneManager = null;
  #ee = null;

  constructor(EventEmitter, { dbStore, sceneManager }) {
    this.#ee = new EventEmitter(
      ["next_scene", "next_step", "undefined_behavior"],
      "mediator"
    );
    this.#dbStore = dbStore;
    this.#sceneManager = sceneManager;
  }

  #getEventName(prevValue, currentValue) {
    switch (true) {
      case prevValue.scene < currentValue.scene:
        return "next_scene";
      case prevValue.step < currentValue.step:
        return "next_step";
      default:
        return "undefined_behavior";
    }
  }

  async init(scenario) {
    this.#sceneManager.init(scenario);
    await this.#dbStore.restore();
  }

  async start(msg) {
    await this.#dbStore.createUser(msg);
    return this.#sceneManager.getFirstStep();
  }

  isCorrectToNextStep(chatId, data) {
    const currentProgress = this.#dbStore.getUserProgressById(chatId);
    const scene = this.#sceneManager.getStepByIndex(currentProgress);
    return scene.transitionCondition && data && scene.transitionCondition(data);
  }

  async nextStep(chatId) {
    const currentProgress = this.#dbStore.getUserProgressById(chatId);
    const { position, data } = this.#sceneManager.getNextStep(currentProgress);
    const scene = this.#sceneManager.getSceneByIndex(position.scene);
    this.#ee.emit(this.#getEventName(currentProgress, position), {
      scene,
      chat_id: chatId,
    });
    await this.#dbStore.setUserProgressById(chatId, position);
    return data;
  }

  async getUserDetails(id) {
    return await this.#dbStore.getUserDetails(id);
  }

  async getUsersCount(type) {
    return await this.#dbStore.getUsersCount(type);
  }

  async getUsersList() {
    return await this.#dbStore.getUsersList();
  }

  async getUserChatIdsList() {
    return await this.#dbStore.getUserChatIdsList();
  }

  async setLastActivityTime(chatId) {
    await this.#dbStore.setLastActivityTime(chatId);
  }

  async markUserAsStartingOver(chatId) {
    await this.#dbStore.markUserAsStartingOver(chatId);
  }

  async markUserAsCompleted(chatId) {
    await this.#dbStore.markUserAsCompleted(chatId);
  }

  saveSceneDuration(chatId) {
    this.#dbStore.saveSceneDuration(chatId);
  }

  async saveSceneMessage(chatId, message) {
    await this.#dbStore.saveSceneMessage(chatId, message);
  }

  getReminders(chatId) {
    const { scene } = this.#dbStore.getUserProgressById(chatId);
    return this.#sceneManager.getSceneReminders(scene);
  }

  on(eventname, callback) {
    this.#ee.subscribe(eventname, callback);
  }
}

const appState = new BotMediator(EventEmitter, {
  sceneManager,
  dbStore: appStore,
});

export default appState;
