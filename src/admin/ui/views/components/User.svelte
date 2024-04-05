<script>
  import { Link } from "svelte-routing";
  import { localTime, fullname } from "../../../assets/helps.js";

  export let data = {};
  export let remove = () => {};
</script>

{#if Object.keys(data).length > 0}
  <div class="user">
    <div class="user__info-wrapper">
      <div class="user__info" class:non-active={!data.is_active}>
        <span class="label">Name:</span>
        {fullname(data)}
      </div>
      <div class="user__info">
        <span class="label">Current step:</span>
        {data.scene}
      </div>

      <div class="user__info">
        <span class="label">Last activity:</span>
        {localTime(data.last_activity_time)}
      </div>
      <Link to={`users/${data._id}`}>Details</Link>
    </div>
    <div class="user_actions">
      <button class="button--delete" on:click={() => remove(data._id)}
        >Delete</button
      >
    </div>
  </div>
{/if}

<style>
  .user {
    display: flex;
    text-align: left;
    padding: 20px 0;
    border-bottom: 1px solid #ccc;
  }

  .user__info-wrapper {
    flex-grow: 1;
  }

  .label {
    font-weight: 600;
  }

  .non-active {
    color: #d64f37;
  }

  .button--delete {
    all: initial;
    background-color: #d64f37;
    font-weight: 600;
    border-radius: 6px;
    padding: 6px 8px;
    cursor: pointer;
  }
</style>
