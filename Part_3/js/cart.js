/* Griffin Graham
 Wait until the entire document has loaded before executing the script
 MDN Docs: https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event */
import {openDB, getAllItems, addOrder} from './database.js';
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupPayment();
});

async function loadCart() {

    const db = await openDB();
    const items = await getAllItems();

    // Grabs the cart item if it's available, if not creates an empty array.
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    //Selecting the table body to use for displaying the items in the cart.
    const cartTableBody = document.querySelector("#cart-table tbody");
    cartTableBody.innerHTML = ""; // Clear existing rows

    // Initializing the subtotal.
    let subtotal = 0;

    // Iterates through all of the items in the cart, and then compares to the products.json (to be replaced by database interaction) and multiplies quantity by price, and then creates a new table row to be displayed.
    cart.forEach(item => {
        const product = items.find(p => p.itemId === item.id);
        if (product) {
            const totalPrice = (product.price * item.quantity).toFixed(2);
            subtotal += parseFloat(totalPrice);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${item.quantity}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>$${totalPrice}</td>
                <td>${item.comment || "-"}</td>
                <td>
                    <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}" title="Remove from cart">
                    <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            cartTableBody.appendChild(row);
        }
    });

    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", () => {
            const itemId = parseInt(button.getAttribute("data-id"));
            if (confirm("Are you sure you want to remove this item from the cart?")) {
                removeFromCart(itemId);
                loadCart(); // Reload the cart view
            }
        });
    });

    updateSummary(subtotal);
}

function removeFromCart(itemId) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = cart.filter(item => item.id !== itemId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
}

// Uses the items from above in order to find all of the costs associated with the total cost.
function updateSummary(subtotal) {
    const taxRate = 0.10;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("tax").textContent = tax.toFixed(2);
    document.getElementById("total").textContent = total.toFixed(2);
}

//Creates the form information for the payment, just basic check that it's submitted, no validation at this time.
function setupPayment() {
    const paymentForm = document.getElementById("payment-form");
    paymentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("customer-name").value.trim();
        const address = document.getElementById("customer-address").value.trim();
        const phone = document.getElementById("customer-phone").value.trim();
        const card = document.getElementById("card-number").value.trim();
        const expiration = document.getElementById("expiry-date").value.trim();
        const cvv = document.getElementById("cvv").value.trim();

        if (!/^[0-9]{16}$/.test(card.replace(/\s/g, '')) ||
            !/^[0-9]{2}\/[0-9]{2}$/.test(expiration) ||
            !/^[0-9]{3}$/.test(cvv)) {
                alert("Please enter valid card information.");
                return;
            }


        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (!cart.length) {
            alert("Your cart is empty, please add items from the shop and attempt payment again!");
            return;
        }

        const items = await getAllItems();

        const orderedItems = cart.map(entry => ({
            itemId: entry.id,
            amount: entry.quantity,
            comment: entry.comment || ""
        }));

        const order = {
            customerName: name,
            dateTime: new Date().toISOString(),
            address: address,
            phone: phone
        };

        const statusHistory = [{
            name: "Placed",
            date: new Date().toISOString()
        }];

        const newOrder = await addOrder(order, orderedItems, statusHistory);
        
        // Simulating a successful payment, and removing the attribute when clicked.
        //document.getElementById("payment-success-message").classList.remove("hidden");

        // Clears the cart after successful payment
        localStorage.removeItem("cart");

        alert(`You have successfully placed your order, your order ID is: ${newOrder}`);

        // Reload the page after 3 seconds to simulate order completion, and goes back to the shop page.
        setTimeout(() => {
            window.location.href = "../shop/index.html";
        }, 3000);
    });
}
