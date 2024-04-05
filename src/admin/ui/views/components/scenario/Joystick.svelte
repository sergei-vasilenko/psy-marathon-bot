<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->

<script>
  import Button from "../Button.svelte";
  import Select from "../Select.svelte";

  export let controls;
  export let cursor;
  export let buttonTypes;

  const activeArrows = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  const keydownHandle = (event) => {
    if (!event.key.startsWith("Arrow")) return;
    const key = event.key.replace("Arrow", "").toLowerCase();
    activeArrows[key] = true;
    setTimeout(() => (activeArrows[key] = false), 300);
    controls[key]();
  };

  let currentText = "";

  $: if (cursor) {
    currentText = controls.show((value) => value?.text) || "";
  }
</script>

<div class="editor" tabindex="0" on:keydown={keydownHandle}>
  <div class="joystick__cross">
    <div
      class="arrow"
      class:active={activeArrows.up}
      on:click={() => controls.up()}
    >
      <span class="label">up</span>
    </div>
    <div
      class="arrow"
      class:active={activeArrows.right}
      on:click={() => controls.right()}
    >
      <span class="label">right</span>
    </div>
    <div
      class="arrow"
      class:active={activeArrows.left}
      on:click={() => controls.left()}
    >
      <span class="label">left</span>
    </div>
    <div
      class="arrow"
      class:active={activeArrows.down}
      on:click={() => controls.down()}
    >
      <span class="label">down</span>
    </div>
  </div>
  <div class="joystick__actions">
    <div class="actions__block">
      <div class="actions__button-section">
        <Button onClick={() => controls.addButton({ text: "" }, true)}>
          &#10566;
        </Button>
        <div class="display">
          <Select
            options={buttonTypes}
            view={([title]) => title}
            on:update={({ detail: [text] }) => {
              controls.updateButton(() => ({ text }));
            }}
          />
        </div>
        <Button onClick={() => controls.addButton({ text: "" })}>
          &#10565;
        </Button>
      </div>
      <div class="actions__button-section actions__button-section--column">
        <Button theme="delete" onClick={() => controls.deleteButton()}>
          Удалить кнопку
        </Button>
      </div>
    </div>
    <div class="actions__block">
      <Button onClick={() => controls.addLine()}>Добавить ряд</Button>
      <Button theme="delete" onClick={() => controls.deleteLine()}
        >Удалить ряд</Button
      >
    </div>
  </div>
</div>

<style>
  .editor {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 80px;
  }

  .joystick__cross {
    display: flex;
    flex-wrap: wrap;
    position: relative;
    width: 100px;
    height: 100px;
    transform: rotate(45deg) translateX(30px);
    border: 2px solid #262626;
    cursor: pointer;
  }

  .joystick__cross::before,
  .joystick__cross::after {
    content: "";
    position: absolute;
    background-color: black;
  }

  .joystick__cross::before {
    top: 0;
    left: 50%;
    width: 1px;
    height: 100%;
    transform: translateX(-50%);
  }

  .joystick__cross::after {
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    transform: translateY(-50%);
  }

  .arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50%;
    height: 50%;
    transition: 300ms background ease-in;
    user-select: none;
  }

  .active,
  .arrow:hover {
    transition: 300ms background ease-in;
    background-color: #d6ff9c;
  }

  .label {
    font-size: 12px;
    transform: rotate(-45deg);
  }

  .joystick__actions {
    min-width: 300px;
  }

  .actions__block {
    display: flex;
    flex-direction: column;
    row-gap: 6px;
  }

  .actions__block:not(:first-child) {
    margin-top: 20px;
  }

  .actions__button-section {
    display: flex;
    column-gap: 4px;
  }

  .actions__button-section--column {
    flex-direction: column;
  }
</style>
