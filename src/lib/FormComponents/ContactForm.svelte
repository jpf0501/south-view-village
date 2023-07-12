<script>
    export let value;
    export let isDisabled = false
  </script>

<div class="form-control">
    <label for="lastname" class="label">
        <span class="label-text">Contact no:</span>
    </label>
    <input
        type="tel"
        onkeypress="return event.charCode >= 48 && event.charCode <= 57"
        minlength="11"
        maxlength="11"
        placeholder="09123456789"
        pattern={String.raw`^(09)\d{9}$`}
        name="contact"
        class="input input-bordered"
        bind:value={value}
        disabled={isDisabled}
     required
    />
</div>