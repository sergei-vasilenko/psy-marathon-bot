<script>
  import Button from "../Button.svelte";
  import EmptyState from "../EmptyState.svelte";
  import ReminderEditorModal from "../modals/ReminderEditorModal.svelte";
  import ReminderElement from "./ReminderElement.svelte";

  export let group;
  export let remove;
  export let remindersWriter;

  const state = { isOpen: false, title: "Создать сообщение" };
  const onCreate = (data) => {
    remindersWriter.createReminder(group.id, data);
  };
</script>

{#if group}
  <div class="group">
    <div class="group__reminder-list">
      {#if group.reminders.length}
        {#each group.reminders as reminder (reminder.id)}
          <ReminderElement {reminder} {remindersWriter} />
        {/each}
      {:else}
        <EmptyState />
      {/if}
    </div>
    <div class="group__actions">
      <Button theme="add" onClick={() => (state.isOpen = true)}
        >Добавить сообщение</Button
      >
      <Button theme="delete" onClick={() => remove(group.id)}
        >Удалить группу</Button
      >
    </div>
    <ReminderEditorModal {state} {onCreate} />
  </div>
{/if}

<style>
  .group {
    display: grid;
    grid-template-columns: 1fr 200px;
    column-gap: 10px;
    margin-bottom: 20px;
  }

  .group__reminder-list {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    row-gap: 20px;
  }

  .group__actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: 10px;
  }
</style>
