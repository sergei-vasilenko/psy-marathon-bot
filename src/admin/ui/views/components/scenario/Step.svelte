<script>
  import MessagePart from "./MessagePart.svelte";
  import MessageKeyboard from "../MessageKeyboard.svelte";
  import StepMessageEditorModal from "../modals/StepMessageEditorModal.svelte";
  import StepButtonsEditorModal from "../modals/StepButtonsEditorModal.svelte";
  import StepTriggerEditorModal from "../modals/StepTriggerEditorModal.svelte";
  import EmptyState from "../EmptyState.svelte";
  import Button from "../Button.svelte";
  import { filesToSend, filesToDelete } from "../../../store.js";

  export let step = {};
  export let number;
  export let writer;

  const modals = {
    message: { isOpen: false, title: "" },
    keyboard: { isOpen: false, title: "" },
    trigger: { isOpen: false, title: "" },
  };

  let isHoveredRemoveStep = false;

  const update = ({ id, order, data }) =>
    writer.updPart(step, id, (part) => {
      if (order !== undefined) {
        part.order = order;
      }
      if (data) {
        part.data = data;
      }
      return part;
    });

  const removePart = async (part) => {
    try {
      filesToDelete.update((files) => [...files, part.filename]);
      writer.removePart(part);
      filesToSend.update((files) =>
        files.filter((file) => file.id !== part.id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const removeStep = async () => {
    try {
      const deleteFiles = step.message.map((part) => part.filename);
      filesToDelete.update((files) => [...files, ...deleteFiles]);
      writer.removeStep(step);
    } catch (err) {
      console.error(err);
    }
  };

  const addMessage = ({ part, upload }) => {
    writer.addPartToMsg(step, part);
    if (upload) {
      filesToSend.update((files) => [
        ...files,
        { id: part.id, size: part.size, filename: part.filename, upload },
      ]);
    }
  };
</script>

<div class="step" class:step--hover={isHoveredRemoveStep}>
  <div class="step__number">{number}</div>
  <div class="step-message">
    <div class="step-message__title weight600">Сообщение:</div>
    {#if step.message.length > 0}
      {#each step.message as part, partIdx (part.id)}
        <MessagePart
          {part}
          number={partIdx + 1}
          onUpdate={update}
          onRemove={removePart}
        />
      {/each}
    {:else}
      <EmptyState />
    {/if}
    <MessageKeyboard keyboard={step.keyboard} />
    <div class="step__trigger">
      <span class="weight600">Триггер перехода:</span>
      {step.transitionTrigger ? step.transitionTrigger.label : "не добавлен"}
    </div>
    <div class="step__actions">
      <Button
        theme="add"
        onClick={() => {
          modals.message.isOpen = true;
          modals.message.title = "Редактор сообщения";
        }}
      >
        Добавить сообщение
      </Button>
      <Button
        theme="add"
        onClick={() => {
          modals.keyboard.isOpen = true;
          modals.keyboard.title = "Редактор клавиатуры";
        }}
      >
        {step.keyboard.length
          ? "Редактировать клавиатуру"
          : "Добавить клавиатуру"}
      </Button>
      <Button
        theme="add"
        onClick={() => {
          modals.trigger.isOpen = true;
          modals.trigger.title = "Редактор триггера";
        }}
      >
        {step.transitionTrigger ? "Редактировать триггер" : "Добавить триггер"}
      </Button>
      <Button
        theme="delete"
        onClick={removeStep}
        on:hovered={({ detail }) => {
          isHoveredRemoveStep = detail.state;
        }}>Удалить шаг</Button
      >
    </div>
  </div>
</div>
<StepMessageEditorModal state={modals.message} onCreate={addMessage} />
<StepButtonsEditorModal
  state={modals.keyboard}
  onCreate={(keyboard) => writer.addKeyboardToMsg(step, keyboard)}
/>
<StepTriggerEditorModal
  state={modals.trigger}
  onCreate={(value) => writer.addTransitionTriggerToMsg(step, value)}
/>

<style>
  .step {
    display: grid;
    grid-template-columns: 50px 1fr;
    grid-auto-rows: auto;
    border-left: 1px dashed #4d4d4d;
    margin-top: 10px;
    transition: all 300ms;
  }

  .step--hover {
    background-color: #ffc9c0;
    transition: all 300ms;
  }

  .step:not(:last-child) {
    border-bottom: 1px solid #4d4d4d;
  }

  .step__number {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-message__title {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .weight600 {
    font-weight: 600;
  }

  .step__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 10px;
    margin-top: 20px;
    margin-bottom: 20px;
  }
</style>
