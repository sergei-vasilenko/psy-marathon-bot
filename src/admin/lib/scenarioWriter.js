class ScenarioWriter {
  #state = [];
  #onUpdate = () => {};
  #id = 0;

  #getSceneIndexById(id) {
    return this.#state.findIndex((scene) => scene.id === id);
  }

  #getSceneById(id) {
    return this.#state.find((scene) => scene.id === id);
  }

  #getStepIndexById(scene, stepId) {
    return scene.steps.findIndex((step) => step.id === stepId);
  }

  addScene(reminders) {
    this.#state.push({
      id: this.#id++,
      steps: [],
      is_last: false,
      reminders,
    });
    this.#onUpdate();
  }

  subscribe(callback) {
    this.#onUpdate = () => callback(this.#state);
  }

  removeScene(id) {
    const sceneIndex = this.#getSceneIndexById(id);
    this.#state.splice(sceneIndex, 1);
    this.#onUpdate();
  }

  addStep(sceneId) {
    const scene = this.#getSceneById(sceneId);
    scene.steps.push({
      id: this.#id++,
      parent: scene,
      message: [],
      keyboard: [],
      transitionTrigger: null,
    });
    this.#onUpdate();
  }

  removeStep(sceneId, stepId) {
    const scene = this.#getSceneById(sceneId);
    const stepIndex = this.#getStepIndexById(scene, stepId);
    scene.steps.splice(stepIndex, 1);
    this.#onUpdate();
  }

  addPartToMsg(step, part) {
    part.id = this.#id++;
    part.parent = step;
    step.message.push(part);
    step.message.sort((a, b) => a.order - b.order);
    this.#onUpdate();
  }

  removePartToMsg(step) {
    step.message = [];
    this.#onUpdate();
  }

  addKeyboardToMsg(step, keyboard) {
    step.keyboard = keyboard;
    this.#onUpdate();
  }

  removeKeyboardToMsg(step) {
    step.keyboard = [];
    this.#onUpdate();
  }

  addTramsitionTriggerToMsg(step, value) {
    step.transitionTrigger = value;
    this.#onUpdate();
  }

  updPart(step, partId, callback) {
    const part = step.message.find((elem) => elem.id === partId);
    callback(part);
    step.message.sort((a, b) => a.order - b.order);
    this.#onUpdate();
  }

  removePart(part) {
    const partIndex = part.parent.message.findIndex(
      (elem) => elem.id === part.id
    );
    part.parent.message.splice(partIndex, 1);
    this.#onUpdate();
  }
}

export default new ScenarioWriter();
