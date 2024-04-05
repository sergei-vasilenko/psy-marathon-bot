<script>
  import MainLayout from "../layouts/MainLayout.svelte";
  import api from "../../../api/index.js";
  import {
    localTime,
    fullname,
    getDurationTime,
  } from "../../../assets/helps.js";

  export let id;

  let user = {};
  (async () => {
    user = await api.users.info(id);
  })();
</script>

<MainLayout h1="О пользователе">
  <section class="user">
    {#if Object.keys(user).length > 0}
      <div class="user__title">
        <div class="user__title-name" class:non-active={!user.is_active}>
          <span class="label">Name:</span>
          {fullname(user)}
        </div>
        {#if user.username}<div class="user__title-login">
            <span class="label">Login:</span>
            <a target="_blank" href={`https://t.me/${user.username}`}
              >{user.username}</a
            >
          </div>{/if}
        <div class="user__title-elem">
          <span class="label">Joining:</span>
          {user.date_of_joining}
        </div>
        <div class="user__title-step">
          <span class="label">Current step:</span>
          {user.scene}
        </div>

        <div class="user__title-elem">
          <span class="label">Last activity:</span>
          {localTime(user.last_activity_time)}
        </div>
        <div class="user__title-elem">
          <span class="label">Is the marathon over:</span>
          {user.is_completed ? "Yes" : "No"}
        </div>
        <div class="user__title-elem">
          <span class="label">Time for steps:</span>
          <ul>
            {#each user.scene_duration as duration, i}
              <li>Step {duration.scene}: {getDurationTime(duration)}</li>
            {/each}
          </ul>
        </div>
        <div class="user__title-elem">
          <span class="label">Messages:</span>
          <ul>
            {#each user.scene_message as message, i}
              <li>
                <div><span class="label">Step:</span> {message.scene}</div>
                <div>
                  <span class="label">Time:</span>
                  {localTime(message.datestamp)}
                </div>
                <div>{message.text}</div>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {:else}
      <div>Loading...</div>
    {/if}
  </section>
</MainLayout>

<style>
  .user {
    text-align: left;
    padding: 20px 0;
    border-bottom: 1px solid #ccc;
  }

  .label {
    font-weight: 600;
  }

  .non-active {
    color: #d64f37;
  }
</style>
