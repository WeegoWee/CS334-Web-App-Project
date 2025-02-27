/* Griffin Graham
 Wait until the entire document has loaded before executing the script
 MDN Docs: https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event 
 This can be updated to run SQL queries once a DB is configured to pull all the information, using static information in JSON for now. */
document.addEventListener('DOMContentLoaded', () => {

    // Fetch product data from the example products JSON file
    fetch('../data/products.json')
        .then(response => response.json()) // To convert the data to readable JSON.
        .then(products => {

            //Sets the container where the products will be displayed as the "products" element.
            const productGrid = document.getElementById('products');
            
            // Iterate through all the items in JSON.
            products.forEach(product => {

                // Creates a new div element for each product card.
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // Creates the requisite HTML for the product card with the name, price, image, as well as buttons for quantities.
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p>$${product.price.toFixed(2)}</p>
                    <div class="quantity-selector">
                        <button class="decrease">-</button>
                        <input type="number" value="1" min="1">
                        <button class="increase">+</button>
                    </div>
                    <button class="add-to-cart">Add to Cart</button>
                `;
                
                // Adds the card for each item into the grid.
                productGrid.appendChild(productCard);

                // Creates the buttons for adding or removing items, as well as adding to cart.
                const decreaseButton = productCard.querySelector('.decrease');
                const increaseButton = productCard.querySelector('.increase');
                const quantityInput = productCard.querySelector('input');
                const addToCartButton = productCard.querySelector('.add-to-cart');

                //Event listeners for the different buttons.
                decreaseButton.addEventListener('click', () => {
                    if (quantityInput.value > 1) {
                        quantityInput.value--;
                    }
                });

                increaseButton.addEventListener('click', () => {
                    quantityInput.value++;
                });

                addToCartButton.addEventListener('click', () => {
                    const quantity = parseInt(quantityInput.value);
                    addToCart(product.id, quantity);
                });
            });
        });
});

function addToCart(productId, quantity) {
    // Queries localStorage to determine if there's already a cart , and if not it creates one.
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if the product is already in the cart
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        // Updates the quantity if the product exists
        existingProduct.quantity += quantity;
    } else {
        // Adds the new product to the cart
        cart.push({ id: productId, quantity: quantity });
    }

    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    //Displays a confirmation message if there's no errors in the above.
    alert('Product added to cart!');
}
