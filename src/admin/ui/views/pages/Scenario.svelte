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
  let isChanged = false;

  let loaded = 0;
  let currentFile = "";
  $: loadingSize = $filesToSend.reduce((sum, elem) => elem.size + sum, 0);
  $: loadedPercent = loadingSize > 0 ? (loaded / loadingSize) * 100 : 0;

  const scWriter = new ScenarioWriter();

  scWriter.subscribe(({ state, couse }) => {
    scenario = state;
    if (couse === "init") return;
    isChanged = true;
  });

  const save = async () => {
    await api.scenario.set(
      removeFields(scenario, (field) => field.startsWith("_"))
    );
    const deleteFiles = $filesToDelete.map((filename) =>
      api.files.delete(filename)
    );

    try {
      await Promise.all(deleteFiles);
    } catch (err) {
      console.error(err);
    }

    for (const { upload, size, filename } of $filesToSend) {
      try {
        currentFile = filename;
        await upload();
        loaded += size;
      } catch (err) {
        console.error(err);
      }
    }
    loadingSize = 0;
    loaded = 0;
    currentFile = "";
    isChanged = false;
  };

  const remove = async () => {
    await api.scenario.delete();
    const deleteFiles = scenario
      .reduce((result, scene) => {
        let sceneFiles = [];
        scene.steps.forEach((step) => {
          const files = step.message.map((part) => part.filename);
          sceneFiles = [...sceneFiles, ...files];
        });
        return [...result, ...sceneFiles];
      })
      .map((filename) => api.files.delete(filename));

    try {
      await Promise.all(deleteFiles);
      scWriter.removeScenario();
    } catch (err) {
      console.error(err);
    }
  };

  onMount(async () => {
    remindersList = await api.reminders.list({ preview: true });
    const loadedScenario = await api.scenario.get();
    scWriter.init(loadedScenario);
  });
</script>

<MainLayout h1="Сценарий">
  <div class="action-bar" class:action-bar--hidden={!isChanged}>
    <LoadingProgress
      total={loadingSize}
      fileInProcess={currentFile}
      {loaded}
      {loadedPercent}
    />
    <Button theme="add" onClick={save}>Сохранить</Button>
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
  {#if scenario.length}<Button theme="delete" onClick={remove}
      >Удалить сценарий</Button
    >{/if}
</MainLayout>

<style>
  .action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 260px;
    right: 0;
    height: 70px;
    z-index: 5;
    background-color: #fcfcfc;
    padding: 12px;
    transform: translateY(0);
    transition: all 500ms;
  }

  .action-bar--hidden {
    display: none;
    transform: translateY(100%);
    transition: all 500ms;
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
