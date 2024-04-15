<script>
  import { onMount } from "svelte";
  import Button from "../Button.svelte";
  import Joystick from "../scenario/Joystick.svelte";
  import MessageKeyboard from "../MessageKeyboard.svelte";
  import ModalBase from "./ModalBase.svelte";
  import KeyboardWriter from "../../../../lib/keyboardWriter.js";
  import api from "../../../../api.js";

  export let state;
  export let onCreate;

  const kbWriter = new KeyboardWriter({ text: "" });
  let keyboard = kbWriter.keyboard;
  let cursorPos = kbWriter.cursor;
  kbWriter.on("update", ({ state: kbState, cursor }) => {
    keyboard = kbState;
    cursorPos = cursor;
  });

  let buttonTypes = [];

  const addToMessage = () => {
    const keyboard = kbWriter.build((value) => !!value.text);
    onCreate(keyboard);
    state.isOpen = false;
    state.title = "";
  };

  onMount(async () => {
    const { list } = await api.aliases.list();
    buttonTypes = list.map((alias) => [alias.name, alias.action.value]);
  });
</script>

<ModalBase {state} width="620px">
  <div slot="content" class="modal__content">
    <MessageKeyboard {keyboard} cursor={cursorPos} />
    <Joystick controls={kbWriter} cursor={cursorPos} {buttonTypes} />
  </div>
  <div slot="actions" class="modal__actions">
    <Button onClick={addToMessage}>Сохранить</Button>
    <Button onClick={() => (state.isOpen = false)}>Закрыть</Button>
  </div>
</ModalBase>

<style>
  .modal__actions {
    margin-top: 10px;
  }
</style>
