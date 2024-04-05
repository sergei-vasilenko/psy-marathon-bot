<script>
  import ReminderEditorModal from "../modals/ReminderEditorModal.svelte";
  import Button from "../Button.svelte";
  import remindersWriter from "../../../../lib/remindersWriter.js";
  import MessageKeyboard from "../MessageKeyboard.svelte";

  export let reminder;
  const state = { isOpen: false, title: "Редактор напоминания" };
  const onCreate = (data) => {};
</script>

<div class="reminder">
  <div class="reminder__display">
    <div class="display__elem">{reminder.delay}</div>
    <div class="display__elem">{reminder.message}</div>
    <MessageKeyboard keyboard={reminder.keyboard} />
    <div class="display__elem">
      <Button
        theme="delete"
        onClick={() => remindersWriter.removeReminder(reminder)}
      >
        Delete
      </Button>
    </div>
  </div>
  <div class="reminder__actions">
    <Button onClick="{() => (state.isOpen = true)}}">
      Добавить напоминание
    </Button>
  </div>
  <ReminderEditorModal {state} {onCreate} {reminder} />
</div>

<style>
  .display__elem {
    min-height: 40px;
  }
</style>
