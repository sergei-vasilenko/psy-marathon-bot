<script>
  import ReminderEditorModal from "../modals/ReminderEditorModal.svelte";
  import Button from "../Button.svelte";
  import MessageKeyboard from "../MessageKeyboard.svelte";
  import FormRow from "../FormRow.svelte";

  export let reminder;
  export let remindersWriter;
  const state = { isOpen: false, title: "Редактор сообщение" };
</script>

<div class="reminder">
  <div class="reminder__display">
    <FormRow>
      <span slot="label" class="display__elem-label">Задержка:</span>
      <span slot="elem" class="display__elem-value"
        >{`${reminder.delay} ${reminder.unit.label}`}</span
      >
    </FormRow>
    <FormRow>
      <span slot="label" class="display__elem-label">Сообщение:</span>
      <span slot="elem" class="display__elem-value">{reminder.message}</span>
    </FormRow>
    <MessageKeyboard keyboard={reminder.keyboard} />
  </div>
  <div class="reminder__actions">
    <Button onClick={() => (state.isOpen = true)}>
      Редактировать сообщение
    </Button>
    <Button
      theme="delete"
      onClick={() => remindersWriter.removeReminder(reminder)}
    >
      Удалить сообщение
    </Button>
  </div>
  <ReminderEditorModal
    {state}
    {reminder}
    onCreate={(newValue) =>
      remindersWriter.removeReminder(reminder, (oldValue) => ({
        ...oldValue,
        ...newValue,
      }))}
  />
</div>

<style>
  .reminder {
    border-bottom: 1px solid #202020;
  }

  .reminder__display {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    row-gap: 20px;
  }

  .reminder__actions {
    margin-top: 20px;
    margin-bottom: 20px;
  }
</style>
