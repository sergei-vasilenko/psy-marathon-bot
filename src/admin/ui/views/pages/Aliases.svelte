<!-- svelte-ignore a11y-click-events-have-key-events -->
<script>
  import { onMount } from "svelte";
  import MainLayout from "../layouts/MainLayout.svelte";
  import Button from "../components/Button.svelte";
  import Select from "../components/Select.svelte";
  import FormRow from "../components/FormRow.svelte";
  import api from "../../../api.js";
  import { arraysDeepEqual } from "../../../assets/helps.js";

  let loadedAliases = [];
  let id = 0;

  const actions = [
    { title: "Следующий шаг", value: "continue" },
    { title: "Нужна помощь", value: "need_help" },
    { title: "Начать заново", value: "start_over" },
    { title: "Никаких действий", value: "in_process" },
  ];

  let aliases = [];
  let currentAlias = "";
  let currentAction;
  let error = "";

  const add = () => {
    if (!currentAlias) {
      error = "Укажите псевдоним для команды";
      return;
    }
    aliases = [
      ...aliases,
      {
        id: id++,
        name: currentAlias,
        action: currentAction,
      },
    ];
    currentAlias = "";
  };

  const loadAliases = async () => {
    const result = await api.aliases.list();
    const { next_id, list } = result;
    id = next_id;
    loadedAliases = list;
    aliases = list;
  };

  const remove = (id) => {
    const index = aliases.findIndex((alias) => alias.id === id);
    if (index < 0) return;
    const clonedAliases = structuredClone(aliases);
    clonedAliases.splice(index, 1);
    aliases = clonedAliases;
  };

  const save = async () => {
    try {
      await api.aliases.create({ next_id: id, list: aliases });
      await loadAliases();
    } catch (err) {
      console.error(err);
    }
  };

  $: hasUnsavedChanges = !arraysDeepEqual(
    loadedAliases,
    aliases,
    (a, b) => a.id === b.id
  );

  onMount(async () => {
    await loadAliases();
  });
</script>

<MainLayout h1="Псевдонимы для действий" {hasUnsavedChanges}>
  <section class="aliases">
    <div class="alias__list">
      {#each aliases as alias, idx (alias.id)}
        <div class="alias" class:alias--odd={idx % 2 !== 0}>
          <div class="alias__item">{alias.name}</div>
          <div class="alias__item">{alias.action.title}</div>
          <div class="alias__item">
            <Button theme="delete" onClick={() => remove(alias.id)}
              >Delete</Button
            >
          </div>
        </div>
      {/each}
    </div>
    <div class="alias__controls">
      <FormRow>
        <span slot="label" for="alias" class="label">Псевдоним</span>
        <div slot="elem">
          <input
            type="text"
            id="alias"
            placeholder="Ваш текст"
            bind:value={currentAlias}
            on:focus={() => (error = "")}
          />
          {#if error}<div class="error">{error}</div>{/if}
        </div>
      </FormRow>
      <FormRow>
        <span slot="label" class="label">Действие</span>
        <Select
          slot="elem"
          options={actions}
          view="title"
          bind:selected={currentAction}
        />
      </FormRow>
    </div>
    <div class="alias__actions">
      <Button onClick={add}>Добавить псевдоним</Button>
      <Button theme={"add"} onClick={save}>Сохранить</Button>
    </div>
  </section>
</MainLayout>

<style>
  .alias {
    display: grid;
    grid-template-columns: 1fr 1fr 100px;
    grid-auto-rows: 40px;
  }

  .alias--odd {
    background-color: #f0f8ff;
  }

  .alias__item {
    display: flex;
    align-self: center;
    padding: 6px;
    border-radius: 4px;
  }

  .error {
    color: #ff6347;
  }

  .alias__actions {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    align-items: flex-start;
    row-gap: 10px;
  }

  .alias__controls {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    row-gap: 6px;
  }

  .label {
    font-weight: 600;
  }
</style>
