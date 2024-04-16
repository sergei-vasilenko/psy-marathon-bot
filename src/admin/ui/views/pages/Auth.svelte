<script>
  import { navigate } from "svelte-routing";
  import { isAuth } from "../../store.js";
  import api from "../../../api.js";
  import { ADMIN_PATH } from "../../../../constants.js";
  const user = { login: "", password: "" };
  let error = { login: "", password: "" };
  $: hasError = error.login || error.password;

  const login = async (e) => {
    e.preventDefault();
    try {
      await api.auth.login(user);
      isAuth.set(true);
      navigate(`${ADMIN_PATH}/`, { replace: true });
    } catch (err) {
      console.log("ERR", err.message);
      isAuth.set(false);
      if (err.message.login) {
        error.login = err.message.login;
      }
      if (err.message.password) {
        error.password = err.message.password;
      }
    }
  };

  $: if ($isAuth) navigate(`${ADMIN_PATH}/`, { replace: true });
</script>

<section>
  <h1 class="main-heading">Авторизация</h1>
  <form class="auth-form">
    <div class="auth-form__input">
      <label for="login">Login</label>
      <input
        id="login"
        type="text"
        bind:value={user.login}
        on:input={() => (error.login = "")}
      />
      {#if error.login}<span class="auth-form__error">{error.login}</span>{/if}
    </div>
    <div class="auth-form__input">
      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        bind:value={user.password}
        on:input={() => (error.password = "")}
      />
      {#if error.password}<span class="auth-form__error">{error.password}</span
        >{/if}
    </div>

    <button
      class="auth-form__button"
      class:disabled={hasError}
      on:click={login}
      disabled={hasError}>Войти</button
    >
  </form>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
    background: linear-gradient(#000000, #518a97);
    height: 100%;
    width: 100%;
  }

  label {
    font-weight: 600;
    color: #ffffff;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    row-gap: 12px;
  }

  .auth-form__input {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .auth-form__error {
    color: #ff6347;
  }

  .auth-form__button {
    display: flex;
    background-color: #6dff97;
    color: #191919;
    font-weight: 700;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    justify-content: center;
    width: 100%;
    cursor: pointer;
  }
  button.disabled {
    background-color: aliceblue;
    cursor: default;
  }
</style>
