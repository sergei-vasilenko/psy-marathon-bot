<script>
  import NavBar from "../components/NavBar.svelte";
  export let h1 = "";
  export let hasUnsavedChanges;
</script>

<main class="main">
  <NavBar />
  <div class="content">
    {#if typeof hasUnsavedChanges === "boolean"}
      <div class="led">
        <div
          class="led__light"
          class:led__light--warning={hasUnsavedChanges}
        ></div>
        <div class="led__text">
          {hasUnsavedChanges
            ? "есть несохраненные данные"
            : "все данные сохранены"}
        </div>
      </div>
    {/if}
    <h1 class="main__heading">{h1}</h1>
    <slot />
  </div>
</main>

<style>
  .main {
    display: grid;
    grid-template-columns: 260px 1fr;
    max-width: 100vw;
    max-height: 100svh;
    height: 100%;
  }

  .content {
    position: relative;
    padding: 20px;
  }

  .led {
    display: flex;
    align-items: center;
    column-gap: 10px;
    cursor: default;
  }

  .led__light {
    height: 7px;
    width: 7px;
    border-radius: 50%;
    background-color: #8dba5a;
  }

  .led__light--warning {
    background-color: #ff6347;
  }

  .led__text {
    font-size: 12px;
  }
</style>
