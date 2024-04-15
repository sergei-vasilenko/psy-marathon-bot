<script>
  import ModalBase from "./ModalBase.svelte";
  import Button from "../Button.svelte";
  export let state;
  export let onCreate;
  export let remindersList = [];
  export let currentRemindersId;

  let selected = currentRemindersId || null;

  const select = () => {
    const curentGroupId =
      remindersList.find((reminders) => reminders.id === selected) || null;
    onCreate(curentGroupId);
    state.isOpen = false;
    selected = null;
  };
</script>

<ModalBase {state} width="620px">
  <div slot="content">
    <div class="radio__block">
      {#each remindersList as reminders (reminders.id)}
        <label
          ><input type="radio" bind:group={selected} value={reminders.id} />
          {reminders.title}</label
        >
      {/each}
      <label
        ><input type="radio" bind:group={selected} value={null} />
        без напоминаний</label
      >
    </div>
  </div>
  <div slot="actions" class="modal__actions">
    <Button onClick={select}>Сохранить</Button>
    <Button
      theme="delete"
      onClick={() => {
        selected = null;
        state.isOpen = false;
      }}>Закрыть</Button
    >
  </div>
</ModalBase>

<style>
  .modal__actions {
    margin-top: 10px;
  }
</style>
