import { scenario } from "./scenario.js";

class SceneManager {
  #scenario = null;

  constructor(scenario = []) {
    this.#scenario = scenario;
  }

  #getSceneByName(name) {
    return this.#scenario.find((scene) => scene.name === name);
  }

  getSceneByIndex(index) {
    return this.#scenario[index] || null;
  }

  getStepByIndex({ scene, step }) {
    return this.#scenario[scene]?.steps[step] || null;
  }

  getSceneReminders(name) {
    const scene =
      typeof name === "string"
        ? this.#getSceneByName(name)
        : this.#scenario[name];
    return scene?.reminders || [];
  }

  getFirstStep() {
    return this.#scenario[0].steps[0];
  }

  getNextStep({ scene, step }) {
    const result = {
      position: { scene: 0, step: 0 },
      data: null,
    };

    const stepsLength = this.#scenario[scene]?.steps.length;
    if (step + 1 < stepsLength) {
      result.data = this.#scenario[scene].steps[step + 1];
      result.position = { scene: scene, step: step + 1 };
      return result;
    }
    const scenesLength = this.#scenario.length;
    if (scene + 1 < scenesLength) {
      result.data = this.#scenario[scene + 1].steps[0];
      result.position.scene = scene + 1;
      return result;
    }
    return result;
  }
}

const scenes = new SceneManager(scenario);

export default scenes;
