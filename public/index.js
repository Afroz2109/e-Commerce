document.addEventListener('DOMContentLoaded', () => {
    // Image slider functionality (only if present on the page)
    let next = document.querySelector('.NextImage img');
    let before = document.querySelector('.PreviousImage img');
    let images = document.querySelectorAll('.displayscreenOne, .displayscreenTwo, .displayscreenThree, .displayscreenFour, .displayscreenFive');

    if (next && before && images.length) {
        let currentIndex = 0;

        function updateImage() {
            images.forEach((img, index) => {
                img.style.display = (index === currentIndex) ? 'block' : 'none';
            });
        }

        next.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateImage();
        });

        before.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateImage();
        });

        updateImage();
    }

    // Cart functionality
    let cart = [];

    // Load cart from local storage
    function loadCart() {
        const savedCart = JSON.parse(localStorage.getItem('cart'));
        if (savedCart) {
            cart = savedCart;
            updateCartDisplay();
        }
    }

    // Save cart to local storage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Update cart display
    function updateCartDisplay() {
        const cartItemsList = document.getElementById('cartItems');
        if (!cartItemsList) return; // Exit if cartItemsList is not present on the page

        cartItemsList.innerHTML = '';

        cart.forEach(item => {
            const li = document.createElement('li');
            
            const imgElement = document.createElement('img');
            imgElement.src = item.image;
            imgElement.style.width = '100px';
            imgElement.style.padding = '0.3rem';
            li.appendChild(imgElement);

            const textElement = document.createTextNode(`${item.name} - ${item.price} x ${item.quantity}`);
            li.appendChild(textElement);

            // Add quantity increment/decrement buttons
            const increaseButton = document.createElement('button');
            increaseButton.textContent = '+';
            increaseButton.className = 'increase';
            increaseButton.addEventListener('click', () => {
                item.quantity++;
                updateCartDisplay();
                saveCart();
            });

            const decreaseButton = document.createElement('button');
            decreaseButton.textContent = '-';
            decreaseButton.className = 'decrease';
            decreaseButton.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart = cart.filter(cartItem => cartItem.name !== item.name || cartItem.price !== item.price);
                }
                updateCartDisplay();
                saveCart();
            });

            li.appendChild(increaseButton);
            li.appendChild(decreaseButton);

            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'Deletebutton';
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener('click', () => {
                cart = cart.filter(cartItem => cartItem.name !== item.name || cartItem.price !== item.price);
                updateCartDisplay();
                saveCart();
            });

            li.appendChild(deleteButton);
            cartItemsList.appendChild(li);
        });

        // Calculate and display the total price
        const total = cart.reduce((sum, item) => sum + parseFloat(item.price.replace('₹', '')) * item.quantity, 0);
        const totalLi = document.createElement('li');
        totalLi.textContent = `Total: ₹${total.toFixed(2)}`;
        totalLi.style.marginLeft = '65%';
        cartItemsList.appendChild(totalLi);

        // Add the purchase button (outside the forEach loop, after the total)
        const purchaseButton = document.createElement('button');
        purchaseButton.textContent = "Purchase";
        purchaseButton.className = 'PurchaseButton';
        cartItemsList.appendChild(purchaseButton);

        // Attach event listener to purchase button
        purchaseButton.addEventListener('click', handlePurchase);
    }

    // Handle the purchase process
    function handlePurchase() {
        // Calculate the total price
        const total = cart.reduce((sum, item) => sum + parseFloat(item.price.replace('₹', '')) * item.quantity, 0);

        // Create the order object
        const order = {
            items: cart.map(item => ({
                image: item.image,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: total
        };

        // Retrieve any existing orders from local storage
        const orders = JSON.parse(localStorage.getItem('orders')) || [];

        // Add the new order
        orders.push(order);

        // Save the updated orders list to local storage
        localStorage.setItem('orders', JSON.stringify(orders));

        // Update cart display without clearing it
        // Uncomment the following lines if you want to clear the cart and update the display
        // cart = [];
        // updateCartDisplay();
        // saveCart();
    }

    // Apply event listeners to all Add to Cart buttons
    function applyAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.AddtoCartbutton');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productElement = button.closest('.product');
                const imgElement = productElement.querySelector('img').src;
                const productName = productElement.querySelector('.productName').innerText;
                const productPrice = productElement.querySelector('.productPrice').innerText;

                const existingProduct = cart.find(item => item.name === productName && item.price === productPrice);

                if (existingProduct) {
                    existingProduct.quantity++;
                } else {
                    const product = { image: imgElement, name: productName, price: productPrice, quantity: 1 };
                    cart.push(product);
                }

                updateCartDisplay();
                saveCart();
            });
        });
    }

    // Load cart and apply event listeners
    loadCart();
    applyAddToCartButtons();

    // Handle displaying of cart items when the cart button is clicked
    const cartPart = document.querySelector('.cartPart');
    const cartItemsList = document.getElementById('cartItems');

    if (cartPart && cartItemsList) {
        cartPart.addEventListener('click', () => {
            cartItemsList.style.display = 'block';
        });
    }

    function Logout() {
        const logoutButton = document.querySelector('.All-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                // console.log('Logout button clicked');
                window.location.href = 'https://e-commerce-f523.onrender.com/signin';
            });
        }
    }
    Logout();
    function sellerSignin() {
        const sellerSigninButton = document.querySelector('.All-buttonTwo');
        console.log(sellerSigninButton); // Check if the button is selected correctly
        if (sellerSigninButton) {
            sellerSigninButton.addEventListener('click', () => {
                console.log('Button clicked'); // Check if the click event is firing
                window.location.href = 'https://e-commerce-f523.onrender.com/sellerSignin';
            });
        }
    }
    
    sellerSignin();
    

});


