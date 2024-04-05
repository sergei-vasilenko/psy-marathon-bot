<script>
  import MainLayout from "../layouts/MainLayout.svelte";
  import User from "../components/User.svelte";
  import api from "../../../api/index.js";

  let users = [];
  (async () => {
    users = await api.users.list();
  })();

  const remove = async (id) => {
    const isConfirm = confirm(
      "Вы уверены что хотите удалить пользователя? Это действие невозможно будет отменить."
    );
    if (!isConfirm) return;
    try {
      await api.users.delete(id);
      users = users.filter((user) => user._id !== id);
    } catch (err) {
      console.error(err);
    }
  };
</script>

<MainLayout h1="Участники марафона">
  <section>
    {#if users?.length}
      <div class="user-list">
        {#each users as user (user._id)}
          <User data={user} {remove} />
        {/each}
      </div>
    {/if}
  </section>
</MainLayout>
