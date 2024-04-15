<script>
  export let total = 0;
  export let loaded = 0;
  export let loadedPercent = 0;
  export let fileInProcess = "";
</script>

<div class="progress">
  <div>{fileInProcess}</div>
  <progress id="files" max="100" value={loadedPercent}>
    {loadedPercent}%
  </progress>
  <span>{`${loaded.toFixed(2)}mb from ${total.toFixed(2)}mb`}</span>
</div>

<style>
  span {
    margin-left: 20px;
  }
</style>
