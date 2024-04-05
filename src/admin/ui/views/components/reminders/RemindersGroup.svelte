<script>
  import Button from "../Button.svelte";
  import ReminderEditorModal from "../modals/ReminderEditorModal.svelte";
  import ReminderElement from "./ReminderElement.svelte";
  import remindersWriter from "../../../../lib/remindersWriter";

  export let group;

  const state = { isOpen: false, title: "Создать сообщение" };
  const onCreate = (data) => {
    remindersWriter.createReminder(group._id, data);
  };
</script>

<div class="group">
  <div class="group__title">
    <span class="group__title--bold">Имя группы:</span>
    {group.name}
  </div>
  <div class="group__reminder-list">
    {#each group.reminders as reminder (reminder._id)}
      <ReminderElement {reminder} />
    {/each}
  </div>
  <div class="group__actions">
    <Button onClick={() => (state.isOpen = true)}>Создать сообщение</Button>
  </div>
  <ReminderEditorModal {state} {onCreate} />
</div>

<style>
  .group {
    margin-bottom: 20px;
  }

  .group__title {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .group__title--bold {
    font-weight: 600;
  }
</style>
