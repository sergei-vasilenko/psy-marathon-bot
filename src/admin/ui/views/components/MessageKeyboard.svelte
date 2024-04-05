<script>
  export let keyboard = [];
  export let cursor = null;
</script>

<div class="keyboard-wrapper">
  {#if keyboard.length > 0}
    <div class="keyboard">
      {#each keyboard as line, lineIdx}
        <div class="keyboard__line">
          {#each line as button, btnIdx}
            <div
              class="line__button"
              class:selected={cursor &&
                cursor.y === lineIdx &&
                cursor.x === btnIdx}
            >
              {button.text}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  @keyframes blink {
    0% {
      background-color: #b4eaf3;
    }
    50% {
      background-color: transparent;
    }
    100% {
      background-color: #b4eaf3;
    }
  }

  .keyboard-wrapper {
    position: relative;
  }

  .keyboard {
    border: 1px solid #c8c8c8;
    padding: 10px;
  }

  .keyboard__line {
    display: flex;
    column-gap: 10px;
    margin-bottom: 6px;
    height: 40px;
  }

  .line__button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-grow: 1;
    min-width: 80px;
    border: 1px solid #252525;
  }

  .selected {
    animation: blink 2s infinite;
  }
</style>
