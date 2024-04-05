import Home from "./views/pages/Home.svelte";
import Aliases from "./views/pages/Aliases.svelte";
import Auth from "./views/pages/Auth.svelte";
import Reminders from "./views/pages/Reminders.svelte";
import Scenario from "./views/pages/Scenario.svelte";
import Users from "./views/pages/Users.svelte";
import Details from "./views/pages/Details.svelte";

export const routes = [
  { path: "/", component: Home, title: "Главная" },
  { path: "/aliases", component: Aliases, title: "Кнопки" },
  { path: "/reminders", component: Reminders, title: "Напоминания" },
  { path: "/scenario", component: Scenario, title: "Сценарий" },
  { path: "/users", component: Users, title: "Список пользователей" },
  {
    path: "/users/:id",
    component: Details,
    title: "О пользователе",
    isHidden: true,
  },
  { path: "/auth", component: Auth, title: "Авторизация", isHidden: true },
];
