<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<script>
  import { onMount } from "svelte";
  import MainLayout from "../layouts/MainLayout.svelte";
  import Button from "../components/Button.svelte";
  import RemindersWriter from "../../../lib/remindersWriter.js";
  import RemindersGroup from "../components/reminders/RemindersGroup.svelte";
  import FormRow from "../components/FormRow.svelte";
  import { arraysDeepEqual, removeFields } from "../../../assets/helps.js";
  import api from "../../../api.js";

  const remindersWriter = new RemindersWriter();

  let loadedReminders = [];
  let reminderGroups = [];

  remindersWriter.update((updData) => {
    reminderGroups = updData;
  });

  let newGroupName = "";
  let takenNames = new Set();
  let error = "";
  let activeGroupId = null;
  let input = null;

  const nameCheck = () => {
    if (takenNames.has(newGroupName)) {
      error = "Такое имя уже занято, выберете другое имя";
      return;
    }
    error = "";
  };

  const addGroup = (event) => {
    if (!newGroupName) {
      input.focus();
      return;
    }
    if (event.type !== "click" && event.key !== "Enter") return;
    const newGroup = remindersWriter.createGroup(newGroupName);
    takenNames.add(newGroupName);
    activeGroupId = newGroup.id;
    newGroupName = "";
    input.blur();
  };

  const removeGroup = (id) => {
    const { name } = remindersWriter.removeGroup(id);
    takenNames.delete(name);
    if (id === activeGroupId) {
      activeGroupId = reminderGroups[0] ? reminderGroups[0].id : null;
    }
  };

  const save = async () => {
    try {
      const groups = removeFields(reminderGroups, (field) =>
        field.startsWith("_")
      );
      await api.reminders.create(groups);
      loadedReminders = await api.reminders.list();
      takenNames = new Set(loadedReminders.map((item) => item.id));
    } catch (err) {
      console.error(err);
    }
  };

  const setActiveGroupId = (id) => {
    activeGroupId = id;
  };

  $: hasUnsavedChanges = !arraysDeepEqual(
    loadedReminders,
    reminderGroups,
    (a, b) => a.id === b.id
  );

  $: activeGroup = reminderGroups.find((group) => group.id === activeGroupId);

  onMount(async () => {
    const reminderList = await api.reminders.list();
    remindersWriter.init(reminderList);
    loadedReminders = reminderList;
    takenNames = new Set(reminderList.map((item) => item.id));
    if (reminderGroups.length) {
      activeGroupId = reminderGroups[0].id;
    }
  });
</script>

<MainLayout h1="Напоминания" {hasUnsavedChanges}>
  <section class="reminders">
    <div class="group__actions">
      <FormRow>
        <div slot="label">
          <Button disabled={!!error} onClick={addGroup}>Новая группа</Button>
        </div>
        <div slot="elem">
          <input
            type="text"
            class={!!error ? "input error" : "input"}
            bind:this={input}
            bind:value={newGroupName}
            on:input={nameCheck}
            on:keydown={addGroup}
          />
          {#if error}<div class="error">{error}</div>{/if}
        </div>
      </FormRow>
    </div>
    <div class="group__list">
      <dir class="tab-list">
        {#each reminderGroups as group (group.id)}
          <div
            class="tab-list__item"
            class:tab-list__item--active={group.id === activeGroup?.id}
            on:click={() => setActiveGroupId(group.id)}
          >
            {group.name}
          </div>
        {/each}
      </dir>
      <RemindersGroup
        group={activeGroup}
        remove={removeGroup}
        {remindersWriter}
      />
    </div>
    <div class="reminders__actions">
      <Button theme="add" onClick={save}>Сохранить изменения</Button>
    </div>
  </section>
</MainLayout>

<style>
  input.error {
    border: 1px solid #ff6347;
  }

  div.error {
    color: #ff6347;
  }

  .group__actions {
    display: flex;
    flex-direction: column;
    width: 350px;
    row-gap: 20px;
    margin-bottom: 40px;
  }

  .tab-list {
    display: flex;
    padding: 0;
  }

  .tab-list__item {
    border-top: 1px solid #252525;
    border-left: 1px solid #252525;
    border-right: 1px solid #252525;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    background-color: #627581;
    color: #ffffff;
    cursor: pointer;
    padding: 6px 10px;
  }

  .tab-list__item--active {
    background-color: #ffffff;
    color: #252525;
    font-weight: 600;
  }
</style>
