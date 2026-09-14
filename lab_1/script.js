let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItems = document.getElementById("cart-items");
const totalPrice = document.getElementById("total-price");
const addButtons = document.querySelectorAll(".add-button");
const checkoutButton = document.getElementById("checkout-button");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close-modal");
const orderForm = document.getElementById("order-form");

addButtons.forEach(function (button) {
  
  button.addEventListener("click", function () {
    
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    const existingProduct = cart.find(function (item) {
      return item.id === id;
    });

    if (existingProduct) {existingProduct.quantity++;} 
    else {const product = {
      id: id,
      name: name,
      price: price,
      quantity: 1
    };
          
    cart.push(product);
  }

  saveCart();  
  showCart();
  });
});

function showCart() {
  cartItems.innerHTML = "";
  let total = 0;
  if (cart.length === 0) {
    
    cartItems.innerHTML = "<p>Корзина пуста</p>";
    totalPrice.textContent = 0;
    return;
    
  }

  cart.forEach(function (item) {
    
    const itemElement = document.createElement("div");
    itemElement.classList.add("cart-item");
    itemElement.innerHTML = `
    
      <div class="cart-item-name">${item.name}</div>
      <div>${item.price} ₽</div>
      <div class="cart-buttons">
      <button
      
        onclick="decreaseQuantity('${item.id}')">
        -
        
      </button>
        
      <span>${item.quantity}</span>

      <button
      
        onclick="increaseQuantity('${item.id}')">
        +
        
      </button>

      <button
      
        class="delete-button"
        onclick="deleteProduct('${item.id}')">
        Удалить
      </button>

    </div>

    `;

    cartItems.appendChild(itemElement);
    total = total + item.price * item.quantity;
  });
  
  totalPrice.textContent = total;

}

function increaseQuantity(id) {
  
  const product = cart.find(function (item) {
      
      return item.id === id;

  });

  if (product) {
      
    product.quantity++;

  }
  saveCart();
  showCart();
}

function decreaseQuantity(id) {

  const product =cart.find(function (item) {

    return item.id === id;

  });
  if (product) {
    
    product.quantity--;
    if (product.quantity <= 0) {

      deleteProduct(id);
      return;

    }
  }
  saveCart();
  showCart();
}

function deleteProduct(id) {

  cart =cart.filter(function (item) {
    
    return item.id !== id;

  });
  saveCart();
  showCart();
}

function saveCart() {
  
    localStorage.setItem("cart", JSON.stringify(cart));

}

checkoutButton.addEventListener("click",
    function () {
      
      modal.style.display = "flex";

    }
);

closeModal.addEventListener("click",
    function () {
      
      modal.style.display = "none";
      
    }
);

modal.addEventListener("click",
  function (event) {
      
    if (event.target === modal) {

      modal.style.display = "none";
    }
  }
);
orderForm.addEventListener("submit",
    function (event) {
      
      event.preventDefault();
      
      if (cart.length === 0) {

        alert("Корзина пуста!");

        return;
        
      }
      
      alert("Заказ создан!");
      cart = [];
      saveCart();
      showCart();
      orderForm.reset();
      modal.style.display = "none";
      
    }
);
showCart();
