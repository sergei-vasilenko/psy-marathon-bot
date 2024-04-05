<script>
  import Button from "../Button.svelte";
  import FormRow from "../FormRow.svelte";
  import ModalBase from "./ModalBase.svelte";
  import api from "../../../../api/index.js";
  export let state;
  export let onCreate;

  const acceptTypes = ["text", "image", "audio", "video"];
  const msgPart = { type: "text", data: "", filename: "", order: 0 };
  let error = "";

  const addFileHandler = (event) => {
    error = "";

    const file = event.target.files?.[0];
    if (file) {
      msgPart.data = file;
      msgPart.filename = file.name;
    }
  };

  const addToMessage = async () => {
    const type = msgPart.type;
    if (!msgPart.data) {
      error =
        type === "text"
          ? "Сообщение не может быть пустым, добавьте необходимый текст."
          : "Вы не прикрепили файл.";
      return;
    }

    if (type === "text") {
      onCreate(structuredClone(msgPart));
    } else {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("data", msgPart.data);
      // msgPart.data = formData.get("data");
      // try {
      //   await api.files.upload(formData);
      //   const filename = formData.get("data").name;
      //   msgPart.data = filename;
      onCreate(structuredClone(msgPart));
      // } catch (err) {
      //   console.error(err);
      // }
    }
    msgPart.type = "text";
    msgPart.data = "";
    msgPart.filename = "";
    msgPart.order += 1;
    state.isOpen = false;
    state.title = "";
  };
</script>

<ModalBase {state} width="620px">
  <div slot="content" class="message-editor">
    <div class="message-editor__type">
      <FormRow>
        <label slot="label" for="msg-type">Тип сообщения</label>
        <select
          slot="elem"
          id="msg-type"
          bind:value={msgPart.type}
          on:change={() => (error = "")}
        >
          {#each acceptTypes as type}
            <option value={type}>
              {type}
            </option>
          {/each}
        </select>
      </FormRow>
    </div>
    <div class="message-editor__value">
      {#if msgPart.type === "text"}
        <FormRow>
          <label slot="label" for="msg-text">Ваш текст</label>
          <textarea
            slot="elem"
            id="msg-text"
            bind:value={msgPart.data}
            placeholder="Текст сообщения"
          />
        </FormRow>
      {:else if msgPart.type === "image"}
        <FormRow>
          <label slot="label" for="msg-img">Ваше изображение</label>
          <input
            slot="elem"
            id="msg-img"
            on:change={addFileHandler}
            type="file"
            accept="image/png, image/jpeg"
          />
        </FormRow>
      {:else if msgPart.type === "audio"}
        <FormRow>
          <label slot="label" for="msg-audio">Ваше аудио</label>
          <input
            slot="elem"
            on:change={addFileHandler}
            type="file"
            accept=".mp3, .aac"
          />
        </FormRow>
      {:else if msgPart.type === "video"}
        <FormRow>
          <label slot="label" for="msg-video">Ваше видео</label>
          <input
            slot="elem"
            on:change={addFileHandler}
            type="file"
            accept=".mp4"
          />
        </FormRow>
      {/if}
      {#if error}<div class="error">{error}</div>{/if}
    </div>
    <div class="message-editor__order">
      <FormRow>
        <label slot="label" for="order">Порядковый номер</label>
        <input
          slot="elem"
          id="order"
          type="number"
          bind:value={msgPart.order}
        />
      </FormRow>
    </div>
  </div>
  <div slot="actions" class="message-editor__button">
    <Button onClick={addToMessage}>Сохранить</Button>
    <Button onClick={() => (state.isOpen = false)}>Закрыть</Button>
  </div>
</ModalBase>

<style>
  .message-editor__type select {
    width: 120px;
    font-size: 14px;
  }

  .error {
    color: #ff6347;
    font-size: 12px;
    text-align: right;
  }

  .message-editor__order input {
    width: 70px;
  }

  .message-editor__button {
    margin-top: 10px;
  }
</style>
