<script>
  export let loading = false;
  export let theme = "default";
  export let disabled = false;
  export let onClick = () => {};

  const getTheme = () => {
    let classStr = "";
    const themes = {
      delete: "button--delete",
      add: "button--add",
      default: "button--default",
    };
    classStr += ` ${themes[theme]}`;
    if (disabled) {
      classStr += " button--disabled";
    }
    return classStr;
  };
</script>

<button {disabled} class={"button" + getTheme()} on:click={onClick}>
  {#if loading}
    Идет загрузка...
  {:else}
    <slot />
  {/if}
</button>

<style>
  .button {
    all: initial;
    padding: 8px 10px;
    cursor: pointer;
    font-family: "Courier New", Courier, monospace;
    transition: all 300ms;
    border-radius: 3px;
    text-align: center;
    user-select: none;
  }

  .button:hover {
    transition: all 300ms;
    font-weight: 600;
    filter: invert(75%);
  }

  .button--delete {
    background-color: #d64f37;
  }

  .button--add {
    background-color: #82a15f;
    color: #ffffff;
  }

  .button--default {
    background-color: #325d6f;
    border: 1px solid #252525;
    color: #ffffff;
  }

  .button--disabled {
    pointer-events: none;
    cursor: default;
    background-color: #fdfdfd;
    color: #959595;
  }
</style>
