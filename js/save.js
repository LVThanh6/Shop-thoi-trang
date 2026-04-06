/**
 * save.js - Logic cho trang sản phẩm đã lưu (save.html)
 */

let savedProducts = [];

async function initSavePage() {
    // 1. Nạp các phần phụ của trang
    await loadComponent('header-placeholder', './header.html');
    await loadComponent('footer-placeholder', './footer.html');
    await loadComponent('cart-holder', './cart-drawer.html');
    await loadComponent('product-detail-holder', './product-detail.html');

    // 2. Thiết lập sự kiện chung
    if (window.setupCartEvents) window.setupCartEvents();
    if (window.checkAndDisplayUser) window.checkAndDisplayUser();
    if (window.initCart) window.initCart();
    if (window.updateHeaderCounts) window.updateHeaderCounts();

    // 3. Tải dữ liệu từ LocalStorage
    loadSavedData();

    // 4. Thiết lập sự kiện tìm kiếm và sắp xếp
    setupEvents();
}

function loadSavedData() {
    savedProducts = JSON.parse(localStorage.getItem('savedProducts')) || [];
    renderSavedList(savedProducts);
}

function renderSavedList(products) {
    const container = document.getElementById('saved-list-container');
    const emptyState = document.getElementById('emptySaved');
    if (!container) return;

    // Clear existing content except empty state
    const items = container.querySelectorAll('.saved-item');
    items.forEach(item => item.remove());

    if (products.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    } else {
        if (emptyState) emptyState.style.display = 'none';
    }

    products.forEach(p => {
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        const item = document.createElement('div');
        item.className = 'saved-item';
        item.innerHTML = `
            <div class="item-img">
                <img src="${p.img}" alt="${p.name}" onerror="this.src='../assets/img/no-img.jpg'; this.onerror=null;">
            </div>
            <div class="item-info">
                <h3>${p.name}</h3>
                <div class="item-price">${price}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn unheart" title="Bỏ yêu thích" onclick="removeFromSaved('${p.id}')">
                    <i class="fas fa-heart" style="color: #ff4757;"></i>
                </button>
                <button class="action-btn add-to-cart" title="Thêm vào giỏ" onclick="addToCartFromSaved('${p.id}')">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="action-btn view-detail" title="Xem chi tiết" onclick="viewDetails('${p.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

function addToCartFromSaved(id) {
    const product = savedProducts.find(p => p.id === id);
    if (!product) return;

    // Mặc định chọn size M cho quần áo hoặc Standard cho các sp khác
    // Người dùng có thể đổi trong giỏ hàng sau
    const size = "M"; 
    
    if (window.addToCart) {
        window.addToCart(product, 1, size);
        
        // Mở drawer giỏ hàng để người dùng thấy
        const cartOverlay = document.getElementById('cartOverlay');
        const cartSidebar = document.getElementById('cartSidebar');
        cartOverlay?.classList.add('open');
        cartSidebar?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function removeFromSaved(id) {
    if (confirm('Bạn muốn bỏ sản phẩm này khỏi danh sách yêu thích?')) {
        savedProducts = savedProducts.filter(p => p.id !== id);
        localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
        if (window.updateHeaderCounts) window.updateHeaderCounts();
        renderSavedList(savedProducts);
    }
}

function viewDetails(id) {
    const product = savedProducts.find(p => p.id === id);
    if (product && window.showProductDetail) {
        window.showProductDetail(product);
    }
}

function setupEvents() {
    const searchInput = document.getElementById('savedSearch');
    const sortSelect = document.getElementById('savedSort');

    if (searchInput) {
        searchInput.oninput = () => {
            const query = removeAccents(searchInput.value.toLowerCase());
            const filtered = savedProducts.filter(p => 
                removeAccents(p.name.toLowerCase()).includes(query)
            );
            renderSavedList(filtered);
        };
    }

    if (sortSelect) {
        sortSelect.onchange = () => {
            const val = sortSelect.value;
            let sorted = [...savedProducts];
            if (val === 'az') sorted.sort((a, b) => a.name.localeCompare(b.name));
            else if (val === 'za') sorted.sort((a, b) => b.name.localeCompare(a.name));
            else if (val === 'price-low') sorted.sort((a, b) => a.price - b.price);
            else if (val === 'price-high') sorted.sort((a, b) => b.price - a.price);
            renderSavedList(sorted);
        };
    }
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', initSavePage);
