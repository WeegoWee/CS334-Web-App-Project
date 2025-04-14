import { openDB, getAllUsers } from "./database.js";

document.addEventListener("DOMContentLoaded", async () => {
	const db = await openDB();

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

	const params = new URLSearchParams(window.location.search);
	const itemId = parseInt(params.get("id"));
	if (!itemId) return;

	// Fetches the item for what was provided.
	const item = await new Promise((resolve, reject) => {
		const tx = db.transaction("Items", "readonly");
		const store = tx.objectStore("Items");
		const req = store.get(itemId);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});

	if (!item || item?.isDiscontinued) {
		window.location.href = "index.html";
		return;
	}

	document.getElementById("item-name").value = item.name;
	document.getElementById("item-price").value = item.price;
	document.getElementById("item-id").textContent = item.itemId;
	document.getElementById("item-series").value = item.series;
	document.getElementById("item-no-caffeine").checked = item.isNoCaffeine;
	document.getElementById("item-cold").checked = item.isCold;
	document.getElementById("item-stock").value = item.stock;
	document.getElementById("item-image").src = `../../img/${item.imageURL}`;

	async function updateItem() {
		const updatedItem = {
			itemId: item.itemId,
			name: document.getElementById("item-name").value,
			price: parseFloat(document.getElementById("item-price").value),
			series: document.getElementById("item-series").value,
			isNoCaffeine: document.getElementById("item-no-caffeine").checked,
			isCold: document.getElementById("item-cold").checked,
			stock: parseInt(document.getElementById("item-stock").value),
			imageURL: item.imageURL,
		};

		const tx = db.transaction("Items", "readwrite");
		const store = tx.objectStore("Items");
		store.put(updatedItem);
		await tx.complete;

		window.location.href = "index.html";
	}

	document
		.getElementById("update-item")
		.addEventListener("click", updateItem);
	document
		.getElementById("discontinue-item")
		.addEventListener("click", async () => {
			if (!confirm("Are you sure you want to discontinue this item?")) {
				return;
			}

			const updatedItem = {
				...item,
				isDiscontinued: true,
			};

			const tx = db.transaction("Items", "readwrite");
			const store = tx.objectStore("Items");
			store.put(updatedItem);
			await tx.complete;

			window.location.href = "index.html";
		});
});
