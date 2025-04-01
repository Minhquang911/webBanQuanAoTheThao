// Khởi tạo biến
let products = JSON.parse(localStorage.getItem('products')) || [
    { 
        id: 1, 
        name: 'Áo thể thao nam', 
        category: 'Áo thể thao',
        categoryId: 1,
        price: 250000,
        stock: 50,
        description: 'Áo thể thao nam chất liệu thun lạnh',
        image: 'https://via.placeholder.com/150',
        status: true 
    },
    { 
        id: 2, 
        name: 'Quần thể thao nữ', 
        category: 'Quần thể thao',
        categoryId: 2,
        price: 200000,
        stock: 30,
        description: 'Quần thể thao nữ co giãn tốt',
        image: 'https://via.placeholder.com/150',
        status: true 
    }
];
let filteredProducts = [...products];
let currentPage = 1;
const itemsPerPage = 10;

// Khởi tạo danh mục
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: 'Áo thể thao', description: 'Các loại áo thể thao', status: true },
    { id: 2, name: 'Quần thể thao', description: 'Các loại quần thể thao', status: true },
    { id: 3, name: 'Giày thể thao', description: 'Các loại giày thể thao', status: true }
];

let filteredCategories = [...categories];
let currentCategoryPage = 1;
const categoriesPerPage = 10;

// Khởi tạo dữ liệu mẫu cho danh mục
const initialCategories = [
    { id: 1, name: 'Áo thể thao' },
    { id: 2, name: 'Quần thể thao' },
    { id: 3, name: 'Giày thể thao' }
];

// Khởi tạo dữ liệu mẫu cho sản phẩm
const initialProducts = [
    {
        id: 1,
        name: 'Áo thể thao nam',
        categoryId: 1,
        price: 199000,
        stock: 100,
        description: 'Áo thể thao nam chất liệu cotton',
        status: 1,
        image: 'https://via.placeholder.com/150'
    },
    {
        id: 2,
        name: 'Quần thể thao nữ',
        categoryId: 2,
        price: 299000,
        stock: 50,
        description: 'Quần thể thao nữ co giãn',
        status: 1,
        image: 'https://via.placeholder.com/150'
    }
];

// Lưu dữ liệu mẫu vào localStorage nếu chưa có
if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify(initialCategories));
}

if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(initialProducts));
}

// Lấy dữ liệu từ localStorage
let categoriesData = JSON.parse(localStorage.getItem('categories')) || [];
let productsData = JSON.parse(localStorage.getItem('products')) || [];

// Biến để lưu trữ các bộ lọc hiện tại
let currentFilters = {
    category: '',
    status: '',
    search: ''
};

// Hiển thị danh sách sản phẩm khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra nếu đang ở trang categories.html
    if (window.location.pathname.includes('categories.html')) {
        displayCategories();
        document.getElementById('searchInput')?.addEventListener('input', handleCategorySearch);
    }
    // Kiểm tra nếu đang ở trang products.html
    else if (window.location.pathname.includes('products.html')) {
        displayProducts();
        loadCategories();
        document.getElementById('searchInput')?.addEventListener('input', handleSearch);
        document.getElementById('imageInput')?.addEventListener('change', previewImage);
    }
});

// Xử lý tìm kiếm
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    currentFilters.search = searchTerm;
    displayProducts();
}

// Xóa tìm kiếm
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        if (window.location.pathname.includes('categories.html')) {
            handleCategorySearch({ target: searchInput });
        } else if (window.location.pathname.includes('products.html')) {
            handleSearch({ target: searchInput });
        }
    }
}

// Hiển thị trạng thái loading
function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const list = document.getElementById('productList') || document.getElementById('categoryList');
    const pagination = document.getElementById('pagination');
    
    if (loadingState) loadingState.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    if (list) list.style.display = 'none';
    if (pagination) pagination.style.display = 'none';
}

// Hiển thị trạng thái trống
function showEmptyState() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const list = document.getElementById('productList') || document.getElementById('categoryList');
    const pagination = document.getElementById('pagination');
    
    if (loadingState) loadingState.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    if (list) list.style.display = 'none';
    if (pagination) pagination.style.display = 'none';
}

// Format giá tiền
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Hiển thị danh sách sản phẩm
function displayProducts() {
    const productList = document.getElementById('productList');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const pagination = document.getElementById('pagination');

    // Hiển thị trạng thái loading
    loadingState.style.display = 'block';
    productList.innerHTML = '';
    emptyState.style.display = 'none';
    pagination.innerHTML = '';

    // Lọc sản phẩm theo các bộ lọc hiện tại
    const filteredProducts = filterProducts();

    // Ẩn trạng thái loading
    loadingState.style.display = 'none';

    if (filteredProducts.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    // Tính toán phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Hiển thị sản phẩm
    paginatedProducts.forEach(product => {
        const category = categories.find(cat => cat.id === product.categoryId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                <img src="${product.image}" alt="${product.name}" class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">
            </td>
            <td>
                <div class="fw-medium">${highlightSearch(product.name)}</div>
                ${product.description ? 
                    `<small class="text-muted">${highlightSearch(product.description)}</small>` : ''}
            </td>
            <td>${category ? highlightSearch(category.name) : 'N/A'}</td>
            <td>${formatPrice(product.price)}</td>
            <td>
                <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">
                    ${product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})" title="Sửa">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-danger btn-sm ms-1" onclick="deleteProduct(${product.id})" title="Xóa">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        productList.appendChild(row);
    });

    // Cập nhật phân trang
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (totalPages > 1) {
        pagination.style.display = 'block';
        const paginationHtml = generatePaginationHtml(currentPage, totalPages);
        pagination.querySelector('ul').innerHTML = paginationHtml;
    } else {
        pagination.style.display = 'none';
    }
}

// Tạo HTML cho phân trang
function generatePaginationHtml(currentPage, totalPages) {
    let html = '';
    
    // Nút Previous
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage('prev')" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `;
    
    // Các nút số trang
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" onclick="changePage(${i})">${i}</button>
            </li>
        `;
    }
    
    // Nút Next
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage('next')" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `;
    
    return html;
}

// Đổi trang
function changePage(direction) {
    if (window.location.pathname.includes('categories.html')) {
        const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
        if (direction === 'prev' && currentCategoryPage > 1) {
            currentCategoryPage--;
        } else if (direction === 'next' && currentCategoryPage < totalPages) {
            currentCategoryPage++;
        }
        displayCategories();
    } else if (window.location.pathname.includes('products.html')) {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (direction === 'prev' && currentPage > 1) {
            currentPage--;
        } else if (direction === 'next' && currentPage < totalPages) {
            currentPage++;
        }
        displayProducts();
    }
}

// Highlight từ khóa tìm kiếm
function highlightSearch(text) {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput || !searchInput.value.trim()) return text;
    
    const searchTerm = searchInput.value.toLowerCase();
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Load danh mục vào select
function loadCategories() {
    const select = document.getElementById('productCategory');
    if (!select) return;

    select.innerHTML = '<option value="">Chọn danh mục</option>';
    categories.forEach(category => {
        if (category.status) {
            select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        }
    });
}

// Xem trước ảnh
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('productImage');
            img.src = e.target.result;
            img.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

// Hiển thị form thêm mới
function addProduct() {
    document.getElementById('formTitle').textContent = 'Thêm sản phẩm';
    document.getElementById('addEditForm').reset();
    document.getElementById('productId').value = '';
    const img = document.getElementById('productImage');
    img.src = 'https://via.placeholder.com/150';
    img.style.display = 'block';
    document.getElementById('statusActive').checked = true;
    document.querySelector('.table-responsive').parentElement.style.display = 'none';
    document.getElementById('productForm').style.display = 'block';
    loadCategories();
    resetValidation();
}

// Hiển thị form chỉnh sửa
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('formTitle').textContent = 'Sửa sản phẩm';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.categoryId;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productDescription').value = product.description || '';
        const img = document.getElementById('productImage');
        img.src = product.image;
        img.style.display = 'block';
        if (product.status) {
            document.getElementById('statusActive').checked = true;
        } else {
            document.getElementById('statusInactive').checked = true;
        }
        document.querySelector('.table-responsive').parentElement.style.display = 'none';
        document.getElementById('productForm').style.display = 'block';
        loadCategories();
        resetValidation();
    }
}

// Xóa sản phẩm
function deleteProduct(id) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        try {
            // Xóa khỏi mảng products
            products = products.filter(p => p.id !== id);
            
            // Cập nhật mảng filteredProducts
            filteredProducts = filteredProducts.filter(p => p.id !== id);
            
            // Lưu vào localStorage
            localStorage.setItem('products', JSON.stringify(products));
            
            // Kiểm tra và điều chỉnh trang hiện tại nếu cần
            const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
            if (currentPage > totalPages) {
                currentPage = Math.max(1, totalPages);
            }
            
            // Hiển thị lại danh sách
            displayProducts();
            
            // Hiển thị thông báo thành công
            showAlert('Xóa sản phẩm thành công!', 'success');
        } catch (error) {
            showAlert('Có lỗi xảy ra khi xóa sản phẩm!', 'danger');
        }
    }
}

// Reset validation state
function resetValidation() {
    const form = document.getElementById('addEditForm');
    form.classList.remove('was-validated');
    const inputs = form.querySelectorAll('.form-control, .form-select');
    const alert = document.getElementById('formAlert');
    
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
    });
    
    alert.style.display = 'none';
    alert.className = 'alert';
}

// Hiển thị thông báo
function showAlert(message, type = 'success') {
    const alert = document.getElementById('formAlert');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

// Quay lại danh sách
function showProductList() {
    document.querySelector('.table-responsive').parentElement.style.display = 'block';
    document.getElementById('productForm').style.display = 'none';
    displayProducts();
}

// Validate form
function validateForm() {
    const form = document.getElementById('addEditForm');
    const nameInput = document.getElementById('productName');
    const categoryInput = document.getElementById('productCategory');
    const priceInput = document.getElementById('productPrice');
    const stockInput = document.getElementById('productStock');
    
    // Reset validation
    form.classList.add('was-validated');
    
    // Validate name
    if (!nameInput.value.trim()) {
        return false;
    }
    
    // Validate category
    if (!categoryInput.value) {
        return false;
    }
    
    // Validate price
    if (!priceInput.value || priceInput.value < 0) {
        return false;
    }
    
    // Validate stock
    if (!stockInput.value || stockInput.value < 0) {
        return false;
    }
    
    return true;
}

// Lưu sản phẩm
function saveProduct(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    const productId = document.getElementById('productId').value;
    const productName = document.getElementById('productName').value.trim();
    const categoryId = parseInt(document.getElementById('productCategory').value);
    const category = categories.find(c => c.id === categoryId);
    const price = parseInt(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const description = document.getElementById('productDescription').value.trim();
    const status = document.querySelector('input[name="productStatus"]:checked').value === "1";
    const image = document.getElementById('productImage').src;

    try {
        if (productId) {
            // Cập nhật sản phẩm
            const index = products.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    name: productName,
                    categoryId: categoryId,
                    category: category.name,
                    price: price,
                    stock: stock,
                    description: description,
                    status: status,
                    image: image
                };
                showAlert('Cập nhật sản phẩm thành công!', 'success');
            }
        } else {
            // Kiểm tra tên sản phẩm đã tồn tại
            if (products.some(p => p.name.toLowerCase() === productName.toLowerCase())) {
                showAlert('Tên sản phẩm đã tồn tại!', 'danger');
                document.getElementById('productName').classList.add('is-invalid');
                return;
            }

            // Thêm sản phẩm mới
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({
                id: newId,
                name: productName,
                categoryId: categoryId,
                category: category.name,
                price: price,
                stock: stock,
                description: description,
                status: status,
                image: image
            });
            showAlert('Thêm sản phẩm thành công!', 'success');
        }

        // Lưu vào localStorage
        localStorage.setItem('products', JSON.stringify(products));

        // Cập nhật danh sách đã lọc
        filteredProducts = [...products];
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value.trim()) {
            handleSearch({ target: searchInput });
        }

        // Hiển thị lại danh sách sau 500ms
        setTimeout(() => {
            showProductList();
        }, 500);
    } catch (error) {
        showAlert('Có lỗi xảy ra, vui lòng thử lại!', 'danger');
    }
}

// Xử lý tìm kiếm danh mục
function handleCategorySearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredCategories = [...categories];
    } else {
        filteredCategories = categories.filter(category => 
            category.name.toLowerCase().includes(searchTerm) || 
            (category.description && category.description.toLowerCase().includes(searchTerm))
        );
    }
    
    currentCategoryPage = 1;
    displayCategories();
}

// Hiển thị danh sách danh mục
function displayCategories() {
    const tbody = document.getElementById('categoryList');
    const pagination = document.getElementById('pagination');
    
    if (!tbody) return;
    
    if (filteredCategories.length === 0) {
        showEmptyState();
        return;
    }

    // Tính toán phân trang
    const startIndex = (currentCategoryPage - 1) * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

    // Hiển thị danh sách
    tbody.innerHTML = '';
    tbody.style.display = 'table-row-group';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('loadingState').style.display = 'none';

    // Tạo HTML string để tối ưu hiệu suất
    let html = '';
    paginatedCategories.forEach(category => {
        html += `
            <tr>
                <td>${category.id}</td>
                <td>
                    <div class="fw-medium">${highlightSearch(category.name)}</div>
                    ${category.description ? 
                        `<small class="text-muted">${highlightSearch(category.description)}</small>` : ''}
                </td>
                <td>
                    <span class="badge ${category.status ? 'bg-success' : 'bg-danger'}">
                        ${category.status ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-warning btn-sm" onclick="editCategory(${category.id})" title="Sửa">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm ms-1" onclick="deleteCategory(${category.id})" title="Xóa">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;

    // Cập nhật phân trang
    if (totalPages > 1) {
        pagination.style.display = 'block';
        const paginationHtml = generatePaginationHtml(currentCategoryPage, totalPages);
        pagination.querySelector('ul').innerHTML = paginationHtml;
    } else {
        pagination.style.display = 'none';
    }
}

// Hiển thị form thêm mới danh mục
function addCategory() {
    document.getElementById('formTitle').textContent = 'Thêm danh mục';
    document.getElementById('addEditForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('statusActive').checked = true;
    document.querySelector('.table-responsive').parentElement.style.display = 'none';
    document.getElementById('categoryForm').style.display = 'block';
    resetValidation();
}

// Hiển thị form chỉnh sửa danh mục
function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        document.getElementById('formTitle').textContent = 'Sửa danh mục';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        if (category.status) {
            document.getElementById('statusActive').checked = true;
        } else {
            document.getElementById('statusInactive').checked = true;
        }
        document.querySelector('.table-responsive').parentElement.style.display = 'none';
        document.getElementById('categoryForm').style.display = 'block';
        resetValidation();
    }
}

// Xóa danh mục
function deleteCategory(id) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
        try {
            // Kiểm tra xem danh mục có đang được sử dụng không
            const isUsed = products.some(p => p.categoryId === id);
            if (isUsed) {
                showAlert('Không thể xóa danh mục này vì đang có sản phẩm sử dụng!', 'danger');
                return;
            }

            // Xóa khỏi mảng categories
            categories = categories.filter(c => c.id !== id);
            
            // Cập nhật mảng filteredCategories
            filteredCategories = filteredCategories.filter(c => c.id !== id);
            
            // Lưu vào localStorage
            localStorage.setItem('categories', JSON.stringify(categories));
            
            // Kiểm tra và điều chỉnh trang hiện tại nếu cần
            const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
            if (currentCategoryPage > totalPages) {
                currentCategoryPage = Math.max(1, totalPages);
            }
            
            // Hiển thị lại danh sách
            displayCategories();
            
            // Hiển thị thông báo thành công
            showAlert('Xóa danh mục thành công!', 'success');
        } catch (error) {
            showAlert('Có lỗi xảy ra khi xóa danh mục!', 'danger');
        }
    }
}

// Quay lại danh sách danh mục
function showCategoryList() {
    document.querySelector('.table-responsive').parentElement.style.display = 'block';
    document.getElementById('categoryForm').style.display = 'none';
    displayCategories();
}

// Validate form danh mục
function validateCategoryForm() {
    const form = document.getElementById('addEditForm');
    const nameInput = document.getElementById('categoryName');
    const descriptionInput = document.getElementById('categoryDescription');
    
    // Reset validation
    form.classList.add('was-validated');
    
    // Validate name (2-100 ký tự)
    if (!nameInput.value.trim() || nameInput.value.length < 2 || nameInput.value.length > 100) {
        return false;
    }
    
    // Validate description (tối đa 500 ký tự)
    if (descriptionInput.value.length > 500) {
        return false;
    }
    
    return true;
}

// Lưu danh mục
function saveCategory(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateCategoryForm()) {
        return;
    }
    
    const categoryId = document.getElementById('categoryId').value;
    const categoryName = document.getElementById('categoryName').value.trim();
    const description = document.getElementById('categoryDescription').value.trim();
    const status = document.querySelector('input[name="categoryStatus"]:checked').value === "1";

    try {
        if (categoryId) {
            // Cập nhật danh mục
            const index = categories.findIndex(c => c.id === parseInt(categoryId));
            if (index !== -1) {
                // Kiểm tra tên danh mục đã tồn tại (trừ chính nó)
                if (categories.some(c => c.id !== parseInt(categoryId) && c.name.toLowerCase() === categoryName.toLowerCase())) {
                    showAlert('Tên danh mục đã tồn tại!', 'danger');
                    document.getElementById('categoryName').classList.add('is-invalid');
                    return;
                }

                categories[index] = {
                    ...categories[index],
                    name: categoryName,
                    description: description,
                    status: status
                };
                showAlert('Cập nhật danh mục thành công!', 'success');
            }
        } else {
            // Kiểm tra tên danh mục đã tồn tại
            if (categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
                showAlert('Tên danh mục đã tồn tại!', 'danger');
                document.getElementById('categoryName').classList.add('is-invalid');
                return;
            }

            // Thêm danh mục mới
            const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
            categories.push({
                id: newId,
                name: categoryName,
                description: description,
                status: status
            });
            showAlert('Thêm danh mục thành công!', 'success');
        }

        // Lưu vào localStorage
        localStorage.setItem('categories', JSON.stringify(categories));

        // Cập nhật danh sách đã lọc
        filteredCategories = [...categories];
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value.trim()) {
            handleCategorySearch({ target: searchInput });
        }

        // Hiển thị lại danh sách sau 500ms
        setTimeout(() => {
            showCategoryList();
        }, 500);
    } catch (error) {
        showAlert('Có lỗi xảy ra, vui lòng thử lại!', 'danger');
    }
}

// Cập nhật hàm filterProducts
function filterProducts() {
    return products.filter(product => {
        // Lọc theo danh mục
        const matchCategory = !currentFilters.category || 
            product.categoryId.toString() === currentFilters.category;
        
        // Lọc theo trạng thái (stock)
        const matchStatus = !currentFilters.status || 
            (currentFilters.status === '1' && product.stock > 0) || 
            (currentFilters.status === '0' && product.stock === 0);
        
        // Lọc theo từ khóa tìm kiếm
        const searchTerm = currentFilters.search.toLowerCase();
        const matchSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));
        
        return matchCategory && matchStatus && matchSearch;
    });
}

// Cập nhật danh sách danh mục trong bộ lọc
function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
    categoriesData.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
    });
}

// Xóa bộ lọc
function clearFilters() {
    currentFilters = {
        category: '',
        status: '',
        search: ''
    };
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('searchInput').value = '';
    currentPage = 1; // Reset về trang 1 khi xóa bộ lọc
    displayProducts();
}

// Cập nhật event listeners
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // Thêm event listeners cho bộ lọc
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function(e) {
            currentFilters.category = e.target.value;
            currentPage = 1; // Reset về trang 1 khi thay đổi bộ lọc
            displayProducts();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', function(e) {
            currentFilters.status = e.target.value;
            currentPage = 1; // Reset về trang 1 khi thay đổi bộ lọc
            displayProducts();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Cập nhật danh sách danh mục trong bộ lọc
    updateCategoryFilter();
});

// Cập nhật hàm searchProducts
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    currentFilters.search = searchInput.value;
    displayProducts();
}

// Cập nhật hàm clearSearch
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    currentFilters.search = '';
    displayProducts();
} 