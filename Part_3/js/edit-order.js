/*
Griffin Graham
This is the JS and as it currently stands it will allow us to pull all of the data related to individual orders based on orderId, doesn't have functionality to edit or update anything.
*/
import { openDB, getAllUsers, getAllItems } from "./database.js";
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
	if (!matchingUser.orders) window.location.href = "../dashboard.html";

	const params = new URLSearchParams(window.location.search);
	const orderId = parseInt(params.get("orderId"));
	if (!orderId) return;

	//Fetches the order for what was provided.
	const order = await new Promise((resolve, reject) => {
		const tx = db.transaction("Orders", "readonly");
		const store = tx.objectStore("Orders");
		const req = store.get(orderId);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});

	//Fetches related items and status for the order.
	const [items, allOrderedItems, status] = await Promise.all([
		getAllItems(),
		new Promise((resolve, reject) => {
			const tx = db.transaction("OrderedItems", "readonly");
			const store = tx.objectStore("OrderedItems");
			const req = store.getAll();
			req.onsuccess = () =>
				resolve(req.result.filter(i => i.orderId === orderId));
			req.onerror = () => reject(req.error);
		}),
		new Promise((resolve, reject) => {
			const tx = db.transaction("Status", "readonly");
			const store = tx.objectStore("Status");
			const req = store.get(orderId);
			req.onsuccess = () => resolve(req.result?.statusHistory || []);
			req.onerror = () => reject(req.error);
		}),
	]);

	//Header information as provided by the customer.
	document.getElementById("order-header").innerHTML = `
        ${
			order.customerName
		}'s order <small class="text-body-tertiary">at ${new Date(
		order.dateTime
	).toLocaleString()}</small>
    `;

	//Body details including order and relevant information.
	document.getElementById("order-details").innerHTML = `
        <li><strong>Order ID:</strong> ${order.orderId}</li>
        <li><strong>Delivery Address:</strong> ${order.address}</li>
        <li><strong>Phone Number:</strong> ${order.phone}</li>
        <li><strong>Status:</strong> <b class="text-success">${
			status.at(-1)?.name || "Unknown"
		}</b></li>
    `;

	//Creates a graphical representation of the items and any comments that were provided and adds into html.
	const itemList = document.getElementById("item-list");
	allOrderedItems.forEach(orderedItem => {
		const product = items.find(p => p.itemId === orderedItem.itemId);
		const li = document.createElement("li");
		li.className = "card";
		li.innerHTML = `
        <div class="row g-0">
            <div class="item-img-container">
            <img src="../../img/${
				product.imageURL
			}" class="img-fluid rounded-start" />
            </div>
            <div class="col-md-8">
            <div class="card-body">
                <h5 class="card-title">${
					product.name
				} <small class="text-body-secondary">x${
			orderedItem.amount
		}</small></h5>
                <p class="card-text"><strong>Observations:</strong> ${
					orderedItem.comment || "None"
				}</p>
            </div>
            </div>
        </div>
        `;
		itemList.appendChild(li);
	});

	let currentStatus = status.at(-1).name || "Placed";

	async function updateOrderStatus(orderId, newStatus) {
		const db = await openDB();
		const tx = db.transaction("Status", "readwrite");
		const store = tx.objectStore("Status");
		const existingStatus = await new Promise((resolve, reject) => {
			const requested = store.get(orderId);
			requested.onsuccess = () => resolve(requested.result);
			requested.onerror = () => reject(requested.error);
		});

		if (existingStatus) {
			existingStatus.statusHistory.push({
				name: newStatus,
				date: new Date().toISOString(),
			});
			store.put(existingStatus);
		} else {
			store.add({ name: newStatus, date: new Date().toISOString() });
		}

		await tx.complete;
	}

	document
		.getElementById("set-status-button")
		.addEventListener("click", async () => {
			const newStatus = document.getElementById("status-select").value;
			await updateOrderStatus(orderId, newStatus);
			alert(`Order has been updated to ${newStatus}`);
			location.reload();
		});

	document
		.getElementById("next-status-button")
		.addEventListener("click", async () => {
			const statusMap = {
				"Placed": "In Progress",
				"In Progress": "Ready for Delivery",
				"Ready for Delivery": "Completed",
			};

			const nextStatus = statusMap[currentStatus];
			if (!nextStatus) {
				alert(
					"Order has already been completed, cancelled, or has an unknown status."
				);
				return;
			}

			await updateOrderStatus(orderId, nextStatus);
			alert(`Order has been updated to ${nextStatus}`);
			location.reload();
		});

	document
		.getElementById("cancel-order-button")
		.addEventListener("click", async () => {
			if (!confirm("Are you sure you want to cancel this order?")) {
				return;
			}

			await updateOrderStatus(orderId, "Cancelled");
			alert("Order has been cancelled");
			location.reload();
		});
});
