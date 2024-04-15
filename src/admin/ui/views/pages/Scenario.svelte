<script>
  import { onMount } from "svelte";
  import MainLayout from "../layouts/MainLayout.svelte";
  import Button from "../components/Button.svelte";
  import EmptyState from "../components/EmptyState.svelte";
  import Scene from "../components/scenario/Scene.svelte";
  import LoadingProgress from "../components/LoadingProgress.svelte";
  import ScenarioWriter from "../../../lib/scenarioWriter";
  import api from "../../../api.js";
  import { removeFields } from "../../../assets/helps.js";
  import { filesToSend, filesToDelete } from "../../store.js";

  let scenario = [];
  let remindersList = [];

  let loaded = 0;
  let currentFile = "";
  $: loadingSize = $filesToSend.reduce((sum, elem) => {
    console.log({ elem });
    return elem.size + sum;
  }, 0);
  $: loadedPercent = loadingSize > 0 ? (loaded / loadingSize) * 100 : 0;
  $: console.log({ loadingSize });
  const scWriter = new ScenarioWriter();

  scWriter.subscribe((state) => {
    scenario = state;
  });

  const save = async () => {
    await api.scenario.set(
      removeFields(scenario, (field) => field.startsWith("_"))
    );
    const deleteFiles = $filesToDelete.map(
      (filename) => async () => await api.files.delete(filename)
    );
    await Promise.all(deleteFiles);

    for (const { upload, size, filename } of $filesToSend) {
      try {
        currentFile = filename;
        await upload();
        loaded += size;
      } catch (err) {
        console.error(err);
      } finally {
        loadingSize = 0;
        loaded = 0;
        currentFile = "";
      }
    }
  };

  const remove = async () => {
    await api.scenario.delete();
  };

  onMount(async () => {
    remindersList = await api.reminders.list({ preview: true });
    const loadedScenario = await api.scenario.get();
    scWriter.init(loadedScenario);
  });
</script>

<MainLayout h1="Сценарий">
  <div class="progress-bar" class:progress-bar--hidden={loadingSize === 0}>
    <LoadingProgress
      total={loadingSize}
      fileInProcess={currentFile}
      {loaded}
      {loadedPercent}
    />
  </div>
  <div class="scenario">
    <div class="header">
      <div class="header-title">Сцены</div>
      <div class="header-columns">
        <div class="header-column center">#</div>
        <div class="header-column">Описание</div>
        <div class="header-column"></div>
      </div>
    </div>
    {#if scenario.length > 0}
      {#each scenario as scene, sceneIdx (scene.id)}
        <Scene
          {scene}
          {remindersList}
          number={sceneIdx + 1}
          writer={scWriter}
        />
      {/each}
    {:else}
      <EmptyState />
    {/if}
  </div>
  <Button onClick={() => scWriter.addScene()}>Добавить сцену</Button>
  <Button theme="add" onClick={save}>Сохранить</Button>
  {#if scenario.length}<Button theme="delete" onClick={remove}
      >Удалить сценарий</Button
    >{/if}
</MainLayout>

<style>
  .progress-bar {
    display: flex;
    align-items: center;
    position: fixed;
    top: 0;
    height: 70px;
    width: 100%;
    z-index: 5;
    background-color: #fcfcfc;
    padding: 12px;
  }

  .progress-bar--hidden {
    display: none;
  }

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
