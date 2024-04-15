<script>
  import Button from "../Button.svelte";
  import Step from "./Step.svelte";
  import SceneRemindersEditorModal from "../modals/SceneRemindersEditorModal.svelte";
  import EmptyState from "../EmptyState.svelte";
  import { filesToDelete } from "../../../store.js";
  export let scene = {};
  export let remindersList = [];
  export let number;
  export let writer;

  const state = { isOpen: false, title: "Выберите напоминание" };
  const onCreate = (id) => writer.addRemindersId(scene, id);
  const removeScene = () => {
    const deleteFiles = scene.steps.reduce((filenames, step) => {
      const files = step.message.map(part.filename);
      filenames = [...filenames, ...files];
      return filenames;
    }, []);
    filesToDelete.update((files) => [...files, ...deleteFiles]);
    writer.removeScene(scene.id);
  };
  $: currentReminders = remindersList.find(
    (elem) => elem.id === scene.reminders?.id
  ) || { title: "не выбрано" };
</script>

<div class="scene">
  <div class="scene__number">{number}</div>
  <div class="scene__content">
    <div class="scene__reminders">
      <span class="weight600">Напоминание:</span>
      {currentReminders.title}
    </div>
    <div class="scene__steps-title weight600">Шаги:</div>
    {#if scene.steps.length}
      {#each scene.steps as step, stepIdx (step.id)}
        <Step {step} {writer} number={stepIdx + 1} />
      {/each}
    {:else}
      <EmptyState />
    {/if}
  </div>
  <div class="scene__actions">
    <Button theme="delete" onClick={removeScene}>Удалить сцену</Button>
    <Button theme="add" onClick={() => (state.isOpen = true)}>
      Добавить напоминания
    </Button>
    <Button theme="add" onClick={() => writer.addStep(scene.id)}>
      Добавить шаг
    </Button>
  </div>
  <SceneRemindersEditorModal
    {state}
    {remindersList}
    {onCreate}
    currentRemindersId={currentReminders?.id}
  />
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

  .scene__content {
    padding: 12px 0;
  }

  .scene__steps-title {
    font-size: 18px;
  }

  .weight600 {
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
