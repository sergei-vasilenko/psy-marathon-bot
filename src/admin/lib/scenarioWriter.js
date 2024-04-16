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

  init(scenario) {
    this.#state = scenario.map((scene) => {
      scene.steps.map((step) => {
        step._parent = scene;
        step.message.map((part) => {
          part._parent = step;
          return part;
        });
        return step;
      });
      return scene;
    });
    this.#onUpdate(true);
  }

  addScene() {
    this.#state.push({
      id: this.#id++,
      steps: [],
      is_last: false,
      reminders: null,
    });
    this.#onUpdate();
  }

  addRemindersId(scene, remindersId) {
    scene.reminders = remindersId;
    this.#onUpdate();
  }

  subscribe(callback) {
    this.#onUpdate = (isInit) =>
      callback({ state: this.#state, couse: isInit ? "init" : "update" });
  }

  removeScene(id) {
    const sceneIndex = this.#getSceneIndexById(id);
    this.#state.splice(sceneIndex, 1);
    this.#onUpdate();
  }

  addStep(sceneId) {
    const scene = this.#getSceneById(sceneId);
    scene.steps.push({
      _parent: scene,
      id: this.#id++,
      message: [],
      keyboard: [],
      transitionTrigger: null,
    });
    this.#onUpdate();
  }

  removeStep(step) {
    const stepIndex = step._parent.steps.findIndex(
      (item) => step.id === item.id
    );
    step._parent.steps.splice(stepIndex, 1);
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

  addTransitionTriggerToMsg(step, value) {
    step.transitionTrigger = value;
    this.#onUpdate();
  }

  addPartToMsg(step, part) {
    part.id = this.#id++;
    part._parent = step;
    step.message.push(part);
    step.message.sort((a, b) => a.order - b.order);
    this.#onUpdate();
  }

  updPart(step, partId, callback) {
    const part = step.message.find((elem) => elem.id === partId);
    callback(part);
    step.message.sort((a, b) => a.order - b.order);
    this.#onUpdate();
  }

  removePart(part) {
    const partIndex = part._parent.message.findIndex(
      (elem) => elem.id === part.id
    );
    part._parent.message.splice(partIndex, 1);
    this.#onUpdate();
  }

  removeScenario() {
    this.#state = [];
    this.#onUpdate();
  }
}

export default ScenarioWriter;
