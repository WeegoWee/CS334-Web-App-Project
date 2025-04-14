import { getAllUsers, getAllItems } from "./database.js";

document.addEventListener("DOMContentLoaded", async () => {
	// Check if the user is logged in and has inventory access
	const currentUser = JSON.parse(localStorage.getItem("currentUser"));
	if (!currentUser) window.location.href = "../login.html";

	const users = await getAllUsers();
	const matchingUser = users.find(
		user =>
			user.email === currentUser.email &&
			user.password === currentUser.password
	);
	if (!matchingUser) window.location.href = "../login.html";
	if (!matchingUser.inventory) window.location.href = "../dashboard.html";

	// Fetch all items from the database
	const tbody = document.getElementById("inventory-table");
	const items = await getAllItems();

	// If there are no items, display a message
	if (!items.length) {
		tbody.innerHTML = `<tr><td colspan="7">No items found.</td></tr>`;
		return;
	}

	// Iterate through each item and add it to the table
	for (const item of items) {
		tbody.innerHTML += `
			<tr>
				<td>${item.series}</td>
				<td>${item.name}</td>
				<td>
					<input type="checkbox" disabled ${
						item.noCaffeine ? "checked" : ""
					} class="form-check-input" />
				</td>
				<td>
					<input type="checkbox" disabled ${
						item.isCold ? "checked" : ""
					} class="form-check-input" />
				</td>
				<td>${item.stock}</td>
				<td>$${item.price.toFixed(2)}</td>
				<td><a href="edit.html?id=${
					item.itemId
				}" class="btn btn-outline-primary btn-sm">Edit</a></td>
			</tr>
		`;
	}
});
