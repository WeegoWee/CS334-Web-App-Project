/*
Griffin Graham
Created this to pull the orders, items, and status information for all orders, as well as create the html in order to display it in the html document.
*/
import {openDB} from './database.js';
document.addEventListener("DOMContentLoaded", async () => {
    const db = await openDB();

    const tbody = document.getElementById("orders-table");

    //Grabs all orders from the DB.
    const orders = await new Promise((resolve, reject) => {
        const tx = db.transaction("Orders", "readonly");
        const store = tx.objectStore("Orders");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    //Gets all entries in the OrderedItems table.
    const orderedItems = await new Promise((resolve, reject) => {
        const tx = db.transaction("OrderedItems", "readonly");
        const store = tx.objectStore("OrderedItems");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    //Grabs all Statuses in the database.
    const orderStatus = await new Promise((resolve, reject) => {
        const tx = db.transaction("Status","readonly");
        const store = tx.objectStore("Status");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    //If there's no orders, it will output data that no orders were found.
    if (!orders.length) {
        tbody.innerHTML = `<tr><td colspan="6">No orders found.</td></tr>`;
        return;
    }

    //Iterates through and adds html in for each order.
    for (const order of orders) {
        const itemCount = orderedItems.filter(item => item.orderId === order.orderId).length;
        const status = orderStatus.find(s => s.orderId === order.orderId);
        const currentStatus = status?.statusHistory?.at(-1)?.name || "Unknown";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${new Date(order.dateTime).toLocaleString()}</td>
            <td>${order.customerName}</td>
            <td>${itemCount}</td>
            <td>${order.address}</td>
            <td><b class="text-success">${currentStatus}</b></td>
            <td><a href="edit.html?orderId=${order.orderId}" class="btn btn-outline-primary btn-sm">More info</a></td>
        `;
        tbody.appendChild(tr);
    }
});
