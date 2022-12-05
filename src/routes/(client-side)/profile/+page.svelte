<div class="min-h-screen hero bg-base-200">
	<div class="w-full max-w-4xl p-6 mx-auto shadow-2xl border rounded-xl bg-base-100">
	<div class="mt-2">
		<h1 class="text-2xl">Account Profile</h1>
	</div>
	<form>
		<div class="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
			<div class="form-control">
				<label for="fname" class="label">
					<span class="label-text">First Name</span>
				</label>
				<input type="text" placeholder="Juan" name="fname" class="input input-bordered" disabled/>
			</div>
			<div class="form-control">
				<label for="lname" class="label">
					<span class="label-text">Last Name</span>
				</label>
				<input type="text" placeholder="Dela Cruz" name="lname" class="input input-bordered" disabled/>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-6 mt-4">
			<div class="form-control">
				<label for="address" class="label">
					<span class="label-text">Address</span>
				</label>
				<input type="text" placeholder="Block 1 Lot 2 Hibiscus Street" name="address" class="input input-bordered" disabled/>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
			<div class="form-control">
				<label for="email" class="label">
					<span class="label-text">E-mail Address</span>
				</label>
				<input type="text" placeholder="juandelacruz@gmail.com" name="email" class="input input-bordered" required/>
			</div>
			<div class="form-control">
				<label for="contact" class="label">
					<span class="label-text">Contact No.</span>
				</label>
				<input type="tel" placeholder="09123456789" name="contact" class="input input-bordered" required/>
			</div>
		</div>
		<div class="flex justify-end mt-8">
			<button class="btn btn-primary mx-1">Save</button>
			<a class="btn btn-warning mx-1">Change Password</a>
		</div>
	</form>
	</div>
</div>
