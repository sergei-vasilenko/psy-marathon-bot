<script>
  import Button from "../Button.svelte";
  import Step from "./Step.svelte";
  import scWriter from "../../../../lib/scenarioWriter";
  export let scene = {};
  export let number;
</script>

<div class="scene">
  <div class="scene__number">{number}</div>
  <div class="scene__steps">
    <div class="scene__steps-title">Шаги:</div>
    {#each scene.steps as step, stepIdx (step.id)}
      <Step {step} number={stepIdx + 1} />
    {/each}
  </div>
  <div class="scene__actions">
    <Button theme="delete" onClick={() => scWriter.removeScene(scene.id)}>
      Удалить сцену
    </Button>
    <Button theme="add" onClick={() => scWriter.addStep(scene.id)}>
      Добавить шаг
    </Button>
  </div>
</div>

<style>
  .scene {
    display: grid;
    grid-template-columns: 50px 1fr 160px;
    border-bottom: 1px solid #202020;
  }

  .scene__number {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .scene__steps {
    padding: 12px 0;
  }

  .scene__steps-title {
    font-size: 18px;
    font-weight: 600;
  }

  .scene__actions {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 6px;
    padding: 6px;
  }
</style>
