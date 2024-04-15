<script>
  import { Link, useLocation, navigate } from "svelte-routing";
  import { routes } from "../../router.js";
  import { ADMIN_PATH } from "../../../../constants.js";
  import { isAuth } from "../../store.js";

  const visibleRoutes = routes.filter((route) => !route.isHidden);
  let currentPath = "/";

  useLocation().subscribe(({ pathname }) => {
    currentPath = pathname.replace(ADMIN_PATH, "");
    if (currentPath !== "/auth" && !$isAuth) {
      console.log("REDIRECT");
      navigate(`${ADMIN_PATH}/auth`, { replace: true });
      console.log("AFTER REDIRECT");
      return;
    }
    const route = routes.find((elem) => elem.path === currentPath);
    document.title = route ? route.title : "Admin panel";
  });
</script>

<div class="navbar">
  <ul class="navbar__routes">
    {#each visibleRoutes as route (route.path)}
      <li class="navbar__routes-item" class:active={currentPath === route.path}>
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
