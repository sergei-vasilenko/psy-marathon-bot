<script>
  import MainLayout from "../layouts/MainLayout.svelte";
  import Button from "../components/Button.svelte";
  import EmptyState from "../components/EmptyState.svelte";
  import Scene from "../components/scenario/Scene.svelte";
  import scWriter from "../../../lib/scenarioWriter";

  let scenes = [];

  scWriter.subscribe((state) => {
    scenes = state;
  });
</script>

<MainLayout h1="Сценарий">
  <div class="scenario">
    <div class="header">
      <div class="header-title">Сцены</div>
      <div class="header-columns">
        <div class="header-column center">#</div>
        <div class="header-column">Описание</div>
        <div class="header-column"></div>
      </div>
    </div>
    {#if scenes.length > 0}
      {#each scenes as scene, sceneIdx (scene.id)}
        <Scene {scene} number={sceneIdx + 1} />
      {/each}
    {:else}
      <EmptyState />
    {/if}
  </div>
  <Button theme="add" onClick={() => scWriter.addScene()}>Добавить сцену</Button
  >
</MainLayout>

<style>
  .scenario {
    font-size: 16px;
    font-family: "Courier New", Courier, monospace;
  }

  .header-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .header-columns {
    display: grid;
    grid-template-columns: 50px 1fr 160px;
  }

  .header-column {
    border-bottom: 1px solid #202020;
    padding: 0 6px;
  }

  .header-column:not(:first-child) {
    border-left: 1px solid #202020;
  }

  .center {
    text-align: center;
  }
</style>
