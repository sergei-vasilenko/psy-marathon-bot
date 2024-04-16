<script>
  import ModalBase from "./ModalBase.svelte";
  import Button from "../Button.svelte";
  export let state;
  export let onCreate;

  let usersText = "";
  let selected = null;
  const triggers = [
    {
      id: 0,
      label: "Пользователь отправил любое сообщение",
      handler: (value) => !!value,
    },
    {
      id: 1,
      label: "Сообщение пользователя содержит текст",
      handler: (value) => {
        return value.includes(usersText);
      },
    },
    {
      id: 2,
      label: "Сообщение пользователя не содержит текст",
      handler: (value) => !!value,
    },
  ];

  const select = () => {
    let data = null;
    const trigger = triggers.find((elem) => elem.id === selected);
    if (trigger) {
      data = trigger;
    }
    onCreate(data);
    state.isOpen = false;
    state.title = "";
  };
</script>

<ModalBase {state} width="620px">
  <div slot="content">
    <div class="radio__block">
      {#each triggers as trigger (trigger.id)}
        <label
          ><input type="radio" bind:group={selected} value={trigger.id} />
          {trigger.label}</label
        >
      {/each}
    </div>
    {#if [1, 2].includes(selected)}<div class="input__block">
        <input bind:value={usersText} type="text" />
      </div>{/if}
  </div>
  <div slot="actions" class="modal__actions">
    <Button onClick={select}>Сохранить</Button>
    <Button
      theme="delete"
      onClick={() => {
        selected = null;
        state.isOpen = false;
        state.title = "";
      }}>Закрыть</Button
    >
  </div>
</ModalBase>

<style>
  .modal__actions {
    margin-top: 10px;
  }
</style>
