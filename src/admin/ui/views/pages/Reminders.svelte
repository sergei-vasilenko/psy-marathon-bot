<script>
  import MainLayout from "../layouts/MainLayout.svelte";
  import Button from "../components/Button.svelte";
  import remindersWriter from "../../../lib/remindersWriter.js";
  import RemindersGroup from "../components/reminders/RemindersGroup.svelte";
  import FormRow from "../components/FormRow.svelte";

  let reminderGroups = [];

  remindersWriter.update((updData) => {
    reminderGroups = updData;
  });

  let newGroupName = "";
  const takenNames = new Set();
  let error = "";

  const nameCheck = () => {
    if (takenNames.has(newGroupName)) {
      error = "Такое имя уже занято, выберете другое имя";
      return;
    }
    error = "";
  };

  const addGroup = () => {
    if (!newGroupName) return;
    remindersWriter.createGroup(newGroupName);
    takenNames.add(newGroupName);
    newGroupName = "";
  };
</script>

<MainLayout h1="Напоминания">
  <section class="reminders">
    <div class="group__actions">
      <FormRow>
        <span slot="label">Задайте имя</span>
        <div slot="elem">
          <input
            type="text"
            class={!!error ? "input error" : "input"}
            bind:value={newGroupName}
            on:input={nameCheck}
          />
          {#if error}<div class="error">{error}</div>{/if}
        </div>
      </FormRow>
      <Button disabled={!!error} onClick={addGroup}>
        Создать новую группу
      </Button>
    </div>
    <div class="group__list">
      {#each reminderGroups as group (group.id)}
        <RemindersGroup {group} />
      {/each}
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
</style>
