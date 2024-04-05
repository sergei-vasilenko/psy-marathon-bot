<script>
  const user = { login: "", password: "" };
  let error = { login: "", password: "" };
  $: hasError = error.login || error.password;

  const login = (e) => {
    e.preventDefault();
    try {
      api.login(user);
    } catch (err) {
      // error = err.message;
      error = err = {
        login: "User not found",
        password: "Password is wrong",
      };
    }
  };
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
  }

  .main-heading {
    width: 100%;
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
