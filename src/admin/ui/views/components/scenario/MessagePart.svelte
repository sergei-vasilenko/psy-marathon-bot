<script>
  import Button from "../Button.svelte";
  export let part = {};
  export let number;
  export let onUpdate;
  export let onRemove;
</script>

<div class="part" class:part--odd={number % 2 !== 0}>
  <div class="part__type">{part.type}</div>
  <div class="text">{part.type === "text" ? part.data : part.filename}</div>
  <input
    type="number"
    class="part__order"
    value={part.order}
    on:input={(e) => onUpdate({ id: part.id, order: e.target.value })}
  />
  <Button theme="delete" onClick={() => onRemove(part)}>Delete</Button>
</div>

<style>
  .part {
    display: grid;
    grid-template-columns: 60px 1fr 50px 100px;
    column-gap: 10px;
    min-height: 45px;
    align-items: center;
  }

  .part--odd {
    background-color: #fbfdff;
  }

  .part__type {
    color: #418a58;
    padding-left: 6px;
  }
</style>
