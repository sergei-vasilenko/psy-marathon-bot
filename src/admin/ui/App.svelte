<script>
  import { Router, Route } from "svelte-routing";
  import { routes } from "./router.js";
</script>

<Router basepath="/admin">
  {#each routes as route (route.path)}
    <Route path={route.path} component={route.component} let:params />
  {/each}
</Router>
