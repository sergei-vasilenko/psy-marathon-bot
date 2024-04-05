<div class="row">
  <div class="row__label">
    <slot name="label" />
  </div>
  <div class="row__elem">
    <slot name="elem" />
  </div>
</div>

<style>
  .row {
    display: grid;
    grid-template-columns: 250px 1fr;
  }

  .row__label {
    display: flex;
    align-items: center;
  }
</style>
