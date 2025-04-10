// Lưu trữ dữ liệu
let products = [];
let categories = [];

// Hàm tải dữ liệu từ localStorage
function loadData() {
    // Tải danh mục
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
        displayCategories();
    }

    // Tải sản phẩm
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
        displayProducts();
    }
}

// Hiển thị danh mục
function displayCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.textContent = category.name;
        categoryItem.onclick = () => filterProductsByCategory(category.id);
        categoryList.appendChild(categoryItem);
    });
}

// Hiển thị sản phẩm
function displayProducts(filteredProducts = products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        const category = categories.find(cat => cat.id === product.categoryId);
        const categoryName = category ? category.name : 'Không xác định';

        productCard.innerHTML = `
            <img src="${product.image || 'images/default-product.jpg'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${categoryName}</p>
                <p class="product-price">${formatPrice(product.price)}</p>
                <button onclick="addToCart(${product.id})" class="add-to-cart-btn">Thêm vào giỏ</button>
            </div>
        `;

        productGrid.appendChild(productCard);
    });
}

// Lọc sản phẩm theo danh mục
function filterProductsByCategory(categoryId) {
    if (categoryId === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.categoryId === categoryId);
        displayProducts(filteredProducts);
    }
}

// Định dạng giá
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Thêm vào giỏ hàng
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = products.find(p => p.id === productId);

    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Đã thêm sản phẩm vào giỏ hàng!');
    }
}

// Tìm kiếm sản phẩm
function searchProducts(query) {
    const searchResults = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );
    displayProducts(searchResults);
}

// Xử lý sự kiện tìm kiếm
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Thêm sự kiện tìm kiếm
    const searchInput = document.querySelector('.nav-icons input[type="search"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });
    }
}); 