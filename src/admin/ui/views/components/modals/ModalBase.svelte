<script>
  export let state;
  export let width;

  $: {
    if (state.isOpen) {
      document.body.style["overflow-y"] = "hidden";
    } else {
      document.body.style["overflow-y"] = "auto";
    }
  }
</script>

{#if state.isOpen}
  <div class="modal">
    <div class="modal-content" style={`width: ${width}`}>
      <h2>{state.title}</h2>
      <slot name="content" />
      <slot name="actions" />
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
</style>
