<script>
    export let value;
    export let isDisabled = false
  </script>
  
  <div class="form-control">
    <label for="lastname" class="label">
      <span class="label-text">Last Name</span>
    </label>
    <input
      type="text"
      placeholder="Dela Cruz"
      name="lname"
      class="input input-bordered"
      bind:value={value}
      disabled={isDisabled}
    required
    />
  </div>
  