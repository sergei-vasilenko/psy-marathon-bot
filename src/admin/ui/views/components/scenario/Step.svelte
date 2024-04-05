<script>
  import MessagePart from "./MessagePart.svelte";
  import MessageKeyboard from "../MessageKeyboard.svelte";
  import StepMessageEditorModal from "../modals/StepMessageEditorModal.svelte";
  import StepButtonsEditorModal from "../modals/StepButtonsEditorModal.svelte";
  import StepTriggerEditorModal from "../modals/StepTriggerEditorModal.svelte";
  import EmptyState from "../EmptyState.svelte";
  import scWriter from "../../../../lib/scenarioWriter";
  import Button from "../Button.svelte";

  export let step = {};
  export let number;

  const modals = {
    message: { isOpen: false, title: "" },
    keyboard: { isOpen: false, title: "" },
    trigger: { isOpen: false, title: "" },
  };

  const update = ({ id, order, data }) =>
    scWriter.updPart(step, id, (part) => {
      if (order !== undefined) {
        part.order = order;
      }
      if (data) {
        part.data = data;
      }
      return part;
    });

  const remove = (part) => {
    scWriter.removePart(part);
  };
</script>

<div class="step">
  <div class="step__number">{number}</div>
  <div class="step-message">
    <div class="step-message__title">Сообщение:</div>
    {#if step.message.length > 0}
      {#each step.message as part, partIdx (part.id)}
        <MessagePart
          {part}
          number={partIdx + 1}
          onUpdate={update}
          onRemove={remove}
        />
      {/each}
    {:else}
      <EmptyState />
    {/if}
    <MessageKeyboard keyboard={step.keyboard} />
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
  </div>
</div>
<StepMessageEditorModal
  state={modals.message}
  onCreate={(msgPart) => scWriter.addPartToMsg(step, msgPart)}
/>
<StepButtonsEditorModal
  state={modals.keyboard}
  onCreate={(keyboard) => scWriter.addKeyboardToMsg(step, keyboard)}
/>
<StepTriggerEditorModal
  state={modals.trigger}
  onCreate={(value) => scWriter.addTramsitionTriggerToMsg(step, value)}
/>

<style>
  .step {
    display: grid;
    grid-template-columns: 50px 1fr;
    border-left: 1px dashed #4d4d4d;
    margin-top: 10px;
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
    font-weight: 600;
  }
</style>
