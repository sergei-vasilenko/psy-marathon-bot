<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<script>
  import { createEventDispatcher } from "svelte";
  export let options = [];
  export let view;
  export let width = 250;
  export let selected = options[0];

  const dispatch = createEventDispatcher();

  let isOpen = false;
  const viewer = (value) => {
    if (typeof view === "string") return value[view];
    if (typeof view === "function") return view(value);
    return value;
  };
  const setOption = (option) => {
    selected = option;
    isOpen = false;
    dispatch("update", option);
  };
</script>

<div class="select" style={`width: ${width}px`}>
  <div class="select__display-container" on:click={() => (isOpen = !isOpen)}>
    <div class="select__display">
      {viewer(selected)}
    </div>
  </div>

  <div class="select__options" class:select__options--close={!isOpen}>
    {#each options as option}
      <div
        class="select__options-item"
        key={option.id}
        on:click={() => setOption(option)}
      >
        {viewer(option)}
      </div>
    {/each}
  </div>
</div>

<style>
  .select {
    position: relative;
    user-select: none;
  }

  .select__display-container {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #252525;
    height: 40px;
    cursor: pointer;
  }

  .select__display {
    padding: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .select__options {
    width: 100%;
    position: absolute;
    top: 40px;
    background-color: #f0f8ff;
    box-shadow: 4px 4px 8px 0px #cad0d4;
    z-index: 9;
  }

  .select__options--close {
    display: none;
  }

  .select__options-item {
    padding: 12px;
    cursor: pointer;
  }
</style>
