<script>
  import { Link } from "svelte-routing";
  import { routes } from "../../router.js";
  import { useLocation } from "svelte-routing";
  import { ADMIN_PATH } from "../../../../constants.js";

  const visibleRoutes = routes.filter((route) => !route.isHidden);
  let currentRoute = "/";

  useLocation().subscribe(({ pathname }) => {
    currentRoute = pathname.replace(ADMIN_PATH, "");
  });
</script>

<div class="navbar">
  <ul class="navbar__routes">
    {#each visibleRoutes as route (route.path)}
      <li
        class="navbar__routes-item"
        class:active={currentRoute === route.path}
      >
        <Link to={route.path.slice(1)}>{route.title}</Link>
      </li>
    {/each}
  </ul>
</div>

<style>
  .navbar {
    padding: 20px;
    height: 100%;
    background-color: #252525;
  }

  .navbar__routes {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .navbar__routes-item {
    padding: 4px 8px;
    & a {
      color: #f0f8ff;
      font-weight: 600;
    }
  }

  .active {
    & a {
      color: #ffbb00;
    }
  }
</style>
