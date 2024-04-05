<script>
  import ModalBase from "./ModalBase.svelte";
  import Button from "../Button.svelte";
  import FormRow from "../FormRow.svelte";
  import Select from "../Select.svelte";
  export let state;
  export let onCreate;
  export let reminder = {};

  const unitsCoef = {
    seconds: 1000,
    minutes: 60000,
    hours: 3600000,
    days: 86400000,
  };

  const unitList = [
    { label: "секунды", value: "seconds" },
    { label: "минуты", value: "minutes" },
    { label: "часы", value: "hours" },
    { label: "дни", value: "days" },
  ];

  let editedValue = {
    delay: 0,
    unit: "hours",
    message: "",
    buttons: [],
    ...reminder,
  };

  let currentDelay = 0;
  let currentUnit =
    unitList.find((unit) => unit.value === editedValue.unit) || unitList[0];

  $: {
    editedValue.unit = currentUnit.value;
    editedValue.delay = currentDelay * unitsCoef[currentUnit.value];
  }
</script>

<ModalBase {state} width="620px">
  <div slot="content">
    <FormRow>
      <span slot="label" class="modal__label" for="delay">Задержка</span>
      <div slot="elem">
        <input id="delay" type="number" bind:value={currentDelay} />
        <Select options={unitList} view="label" selected={currentUnit} />
      </div>
    </FormRow>
    <FormRow>
      <span slot="label" class="modal__label">Сообщение</span>
      <textarea
        slot="elem"
        id="msg-text"
        bind:value={editedValue.message}
        placeholder="Текст сообщения"
      />
    </FormRow>
  </div>
  <div slot="actions" class="modal__actions">
    <Button onClick={() => onCreate(editedValue)}>Сохранить</Button>
    <Button theme="delete" onClick={() => (state.isOpen = false)}>
      Закрыть
    </Button>
  </div>
</ModalBase>

<style>
  .modal__actions {
    margin-top: 10px;
  }
</style>
