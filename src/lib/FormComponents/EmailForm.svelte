<script>
    export let value;
    export let isDisabled = false
  </script>
  
  <div class="form-control">
    <label for="firstname" class="label">
        <span class="label-text">Email</span>
    </label>
    <input
        type="text"
        placeholder="juandelacruz@gmail.com"
        name="fname"
        class="input input-bordered"
        bind:value={value}
        disabled={isDisabled}
    required
    />
</div>