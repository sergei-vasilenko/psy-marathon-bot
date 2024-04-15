<script>
  import { onMount } from "svelte";
  import ModalBase from "./ModalBase.svelte";
  import Button from "../Button.svelte";
  import FormRow from "../FormRow.svelte";
  import Select from "../Select.svelte";
  import Joystick from "../scenario/Joystick.svelte";
  import MessageKeyboard from "../MessageKeyboard.svelte";
  import KeyboardWriter from "../../../../lib/keyboardWriter.js";
  import api from "../../../../api.js";

  export let state;
  export let onCreate;
  export let reminder = {};

  const unitList = [
    { label: "сек", value: "seconds" },
    { label: "мин", value: "minutes" },
    { label: "ч", value: "hours" },
    { label: "д", value: "days" },
  ];

  const kbWriter = new KeyboardWriter({ text: "" });

  let cursorPos = kbWriter.cursor;

  const initValue = {
    delay: 0,
    unit: unitList[2],
    message: "",
    keyboard: [],
  };

  let editedValue = {
    ...structuredClone(initValue),
    ...structuredClone(reminder),
  };

  kbWriter.on("update", ({ state: kbState, cursor }) => {
    editedValue.keyboard = kbState;
    cursorPos = cursor;
  });

  let buttonTypes = [[]];

  $: if (!state.isOpen) {
    editedValue = structuredClone(initValue);
  }

  onMount(async () => {
    const { list } = await api.aliases.list();
    buttonTypes = list.map((alias) => [alias.name, alias.action.value]);
  });
</script>

<ModalBase {state} width="620px">
  <div slot="content" class="modal__body">
    <FormRow>
      <span slot="label" class="modal__label" for="delay">Задержка</span>
      <div slot="elem" class="modal__option modal__option--time">
        <input
          id="delay"
          type="number"
          bind:value={editedValue.delay}
          class="input--delay"
        />
        <Select
          options={unitList}
          view="label"
          selected={editedValue.unit}
          width="60"
        />
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
    <MessageKeyboard keyboard={editedValue.keyboard} cursor={cursorPos} />
    <Joystick controls={kbWriter} cursor={cursorPos} {buttonTypes} />
  </div>
  <div slot="actions" class="modal__actions">
    <Button
      onClick={() => {
        editedValue.keyboard = kbWriter.build((value) => !!value.text);
        onCreate(structuredClone(editedValue));
        state.isOpen = false;
      }}>Сохранить</Button
    >
    <Button
      theme="delete"
      onClick={() => {
        state.isOpen = false;
      }}
    >
      Закрыть
    </Button>
  </div>
</ModalBase>

<style>
  .modal__body {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    row-gap: 20px;
  }

  .modal__actions {
    margin-top: 10px;
  }

  .modal__option--time {
    display: flex;
  }

  .input--delay {
    width: 100px;
  }
</style>
