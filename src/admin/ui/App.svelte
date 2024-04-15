<script>
  import { Router, Route } from "svelte-routing";
  import { routes } from "./router.js";
  import { isAuth } from "./store.js";
  import api from "../api.js";

  (async () => {
    try {
      const { is_auth } = await api.auth.status();
      isAuth.set(is_auth);
    } catch (err) {
      console.error(err);
    }
  })();
</script>

<Router basepath="/admin">
  {#each routes as route (route.path)}
    <Route path={route.path} component={route.component} let:params />
  {/each}
</Router>
