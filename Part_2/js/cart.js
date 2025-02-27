/* Griffin Graham
 Wait until the entire document has loaded before executing the script
 MDN Docs: https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event */
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupPayment();
});

function loadCart() {
    // Grabs the cart item if it's available, if not creates an empty array.
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    //Selecting the table body to use for displaying the items in the cart.
    const cartTableBody = document.querySelector("#cart-table tbody");
    cartTableBody.innerHTML = ""; // Clear existing rows

    // Initializing the subtotal.
    let subtotal = 0;

    // Iterates through all of the items in the cart, and then compares to the products.json (to be replaced by database interaction) and multiplies quantity by price, and then creates a new table row to be displayed.
    cart.forEach(item => {
        fetch(`../data/products.json`)
            .then(response => response.json())
            .then(products => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const row = document.createElement("tr");
                    const totalPrice = (product.price * item.quantity).toFixed(2);
                    subtotal += parseFloat(totalPrice);

                    //Creates the HTML needed in order to display the item.
                    row.innerHTML = `
                        <td>${product.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${product.price.toFixed(2)}</td>
                        <td>$${totalPrice}</td>
                    `;
                    cartTableBody.appendChild(row);

                    // Updates the total after all items are added
                    updateSummary(subtotal);
                }
            });
    });
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
    paymentForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Simulating a successful payment, and removing the attribute when clicked.
        document.getElementById("payment-success-message").classList.remove("hidden");

        // Clears the cart after successful payment
        localStorage.removeItem("cart");

        // Reload the page after 3 seconds to simulate order completion, and goes back to the shop page.
        setTimeout(() => {
            window.location.href = "../Shop/shop.html";
        }, 3000);
    });
}
