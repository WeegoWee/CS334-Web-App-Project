import { openDB, addItem, getAllUsers } from "./database.js";

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

	function isFilled(value) {
		return value?.trim().length > 0;
	}

	document
		.getElementById("create-item")
		.addEventListener("click", async event => {
			event.preventDefault();

			const itemName = document.getElementById("item-name").value;
			const itemPrice = document.getElementById("item-price").value;
			const itemSeries = document.getElementById("item-series").value;
			const itemNoCaffeine =
				document.getElementById("item-no-caffeine").value;
			const itemCold = document.getElementById("item-cold").value;
			const itemStock = document.getElementById("item-stock").value;

			try {
				if (
					!isFilled(itemName) ||
					!isFilled(itemPrice) ||
					!isFilled(itemSeries) ||
					!isFilled(itemStock)
				) {
					alert("Please fill out all fields.");
					return;
				}

				if (itemPrice <= 0) {
					alert("Price must be greater than 0.");
					return;
				}
				if (itemStock < 0) {
					alert("Stock cannot be negative.");
					return;
				}

				const item = {
					name: itemName,
					price: parseFloat(itemPrice),
					series: itemSeries,
					isNoCaffeine: itemNoCaffeine,
					isCold: itemCold,
					stock: parseInt(itemStock),
					imageURL: "product1.jpg",
				};

				await addItem(item);
				window.location.href = "index.html";
			} catch (error) {
				console.error("Error adding item:", error);
				alert("An error occurred while adding the item.");
			}
		});
});
