/**
 * shop.js - Logic cho trang bán hàng (banhang.html)
 */

let allProducts = []; // Toàn bộ dữ liệu sản phẩm của category
let filteredProducts = []; // Sản phẩm sau khi đã qua bộ lọc
let visibleCount = 8; // Số lượng sản phẩm đang hiển thị


// 1. Khởi tạo toàn trang
async function initShop() {
    // Nạp các phần phụ (Dùng đường dẫn tương đối từ file HTML gọi nó)
    await loadComponent('header-placeholder', './header.html');
    await loadComponent('banner-placeholder', './banner.html');
    await loadComponent('filter-placeholder', './filter.html');
    await loadComponent('footer-placeholder', './footer.html');
    await loadComponent('cart-holder', './cart-drawer.html');
    await loadComponent('product-detail-holder', './product-detail.html');

    setupNavbarCategoryClicks();
    setupLoadMoreEvents();

    
    // Đảm bảo các sự kiện chung hoạt động
    if (window.setupCartEvents) window.setupCartEvents();
    if (window.checkAndDisplayUser) window.checkAndDisplayUser();
    if (window.initCart) window.initCart();
    if (window.updateHeaderCounts) window.updateHeaderCounts();

    const params = new URLSearchParams(window.location.search);

    const search = params.get('search');
    const category = params.get('category');

    if (search) {
        await handleGlobalSearch(search);
        updateActiveLink(null);
    } else {
        const cat = category || 'shoes';
        await loadProductsByFile(`../data/${cat}.json`);
        updateActiveLink(cat);
    }
}

// 2. Chuyển đổi category trong navbar (Không load lại trang)
function setupNavbarCategoryClicks() {
    const navbar = document.getElementById('main-navbar');
    if (!navbar) return;

    navbar.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-category]');
        if (link) {
            e.preventDefault();
            const cat = link.getAttribute('data-category');
            window.history.pushState({ cat }, '', `?category=${cat}`);
            loadProductsByFile(`../data/${cat}.json`);
            updateActiveLink(cat);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    window.onpopstate = () => initShop(); // Xử lý nút back/forward
}

function updateActiveLink(category) {
    document.querySelectorAll('#main-navbar a[data-category]').forEach(a => {
        a.classList.toggle('active', a.getAttribute('data-category') === category);
    });
}

// 3. Tải và hiển thị sản phẩm
async function loadProductsByFile(path) {
    try {
        const res = await fetch(path);
        allProducts = res.ok ? await res.json() : [];
        renderAll();
    } catch (e) {
        console.error("Lỗi nạp sản phẩm:", e);
    }
}

function renderAll() {
    buildFilters(allProducts);
    // Thay vì renderGrid trực tiếp, ta gọi applyFilters để đồng bộ ngay từ đầu
    window.applyFilters();
}

function renderGrid(products) {
    const grid = document.getElementById('product-placeholder');
    const loadMoreContainer = document.getElementById('load-more-container');
    if (!grid) return;

    grid.className = 'product-grid';
    if (!products.length) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Không tìm thấy sản phẩm phù hợp.</p>';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        return;
    }

    // Chỉ lấy số lượng sản phẩm cần hiển thị
    const productsToShow = products.slice(0, visibleCount);

    grid.innerHTML = '';
    productsToShow.forEach(p => {
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img">
                <img src="${p.img}" alt="${p.name}" onerror="this.src='../assets/img/no-img.jpg'; this.onerror=null;">
            </div>
            <div class="product-info">
                <div class="product-name" title="${p.name}">${p.name}</div>
                <div class="product-price">${price}</div>
            </div>
        `;
        card.onclick = () => showProductDetail(p);
        grid.appendChild(card);
    });

    // Ẩn/Hiện nút Xem thêm
    if (loadMoreContainer) {
        if (visibleCount < products.length) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }
}

function setupLoadMoreEvents() {
    const btn = document.getElementById('load-more-btn');
    if (btn) {
        btn.onclick = () => {
            visibleCount += 8;
            renderGrid(filteredProducts);
        };
    }
}

// 4. Tìm kiếm toàn cục
async function handleGlobalSearch(keyword) {
    const cats = ['shirts', 'pants', 'jackets', 'vests', 'perfumes', 'watches', 'caps', 'shoes', 'accessories'];
    const keywordNorm = removeAccents(keyword);
    const grid = document.getElementById('product-placeholder');
    
    if (grid) grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Đang tìm kiếm...</p>';
    
    try {
        const results = await Promise.all(cats.map(c => fetch(`../data/${c}.json`).then(r => r.ok ? r.json() : [])));
        const combined = results.flat();
        
        allProducts = combined.filter(p => {
            const nameMatch = removeAccents(p.name).includes(keywordNorm);
            const tagMatch = p.tags ? Object.values(p.tags).flat().some(t => removeAccents(t).includes(keywordNorm)) : false;
            return nameMatch || tagMatch;
        });

        renderAll();
        const title = document.querySelector('.product-area h2');
        if (title) title.innerText = `Tìm kiếm cho: "${keyword}" (${allProducts.length})`;
    } catch (e) {
        console.error("Lỗi tìm kiếm:", e);
    }
}

// 5. Bộ lọc sidebar (Filter)
function buildFilters(products) {
    const container = document.getElementById('dynamic-filters-container');
    if (!container) return;

    const tagMap = {};
    products.forEach(p => {
        if (!p.tags) return;
        Object.entries(p.tags).forEach(([cat, vals]) => {
            if (!tagMap[cat]) tagMap[cat] = {};
            vals.forEach(v => tagMap[cat][v] = (tagMap[cat][v] || 0) + 1);
        });
    });

    container.innerHTML = Object.entries(tagMap).map(([cat, vals]) => `
        <div class="filter-section">
            <h3>${cat}</h3>
            <div class="section-body">
                ${Object.entries(vals).map(([v, count]) => `
                    <label class="filter-option">
                        <input type="checkbox" data-category="${cat}" value="${v}" onchange="window.applyFilters()"> 
                        ${v} <span>${count}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');

    if (window.setupFilterCollapses) window.setupFilterCollapses();
}

window.applyFilters = () => {
    const min = parseInt(document.getElementById('priceMin')?.value || 0);
    const max = parseInt(document.getElementById('priceMax')?.value || 999999999);
    
    const checkboxes = document.querySelectorAll('#dynamic-filters-container input:checked');
    const selected = {};
    checkboxes.forEach(cb => {
        const cat = cb.getAttribute('data-category');
        if (!selected[cat]) selected[cat] = [];
        selected[cat].push(cb.value);
    });

    visibleCount = 8; // Reset số lượng hiển thị khi lọc mới
    filteredProducts = allProducts.filter(p => {
        if (p.price < min || p.price > max) return false;
        for (const [cat, vals] of Object.entries(selected)) {
            if (!p.tags?.[cat] || !vals.some(v => p.tags[cat].includes(v))) return false;
        }
        return true;
    });

    renderGrid(filteredProducts);
};

window.resetFilters = () => {
    document.querySelectorAll('.filter-drawer input[type=checkbox]').forEach(c => c.checked = false);
    const rMin = document.getElementById('priceRangeMin'), rMax = document.getElementById('priceRangeMax');
    if (rMin && rMax) {
        rMin.value = 0; rMax.value = 10000000;
        rMin.dispatchEvent(new Event('input')); rMax.dispatchEvent(new Event('input'));
        rMin.dispatchEvent(new Event('change')); rMax.dispatchEvent(new Event('change'));
    }
    // Sau khi reset UI trượt giá, applyFilters sẽ tự được gọi qua event 'change' 
    // hoặc ta gọi trực tiếp để chắc chắn
    window.applyFilters();
};

// 6. Product Detail Modal Logic
function showProductDetail(product) {
    const overlay = document.getElementById('productDetailOverlay');
    if (!overlay) return;

    // Populate Data
    const img = document.getElementById('modalProductImg');
    const name = document.getElementById('modalProductName');
    const price = document.getElementById('modalProductPrice');
    const desc = document.getElementById('modalProductDesc');
    const qtyInput = document.getElementById('modalProductQty');
    const totalPrice = document.getElementById('modalTotalPrice');
    const addToCartBtn = document.getElementById('modalAddToCart');

    img.src = product.img;
    name.innerText = product.name;
    document.querySelector('.product-breadcrumb').innerText = product.name; // Simple breadcrumb
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
    price.innerText = formattedPrice;
    desc.innerText = product.description || "Sản phẩm chất lượng cao, thiết kế hiện đại, phù hợp với nhiều phong cách thời trang nam.";
    qtyInput.value = 1;
    totalPrice.innerText = formattedPrice;

    // Reset size selector
    const sizeSelected = document.querySelector('.select-selected');
    sizeSelected.innerText = "Chọn kích thước";
    sizeSelected.classList.remove('selected');
    addToCartBtn.classList.remove('active');
    addToCartBtn.disabled = true;

    // Navigation Logic
    const currentIndex = filteredProducts.findIndex(p => p.id === product.id);
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');

    if (prevBtn) {
        prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            showProductDetail(filteredProducts[currentIndex - 1]);
        };
    }

    if (nextBtn) {
        nextBtn.style.display = currentIndex < filteredProducts.length - 1 ? 'block' : 'none';
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            showProductDetail(filteredProducts[currentIndex + 1]);
        };
    }

    // Show Overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Event: Close
    const closeBtn = document.getElementById('closeProductDetail');
    const hideModal = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    };
    closeBtn.onclick = hideModal;
    overlay.onclick = (e) => { if (e.target === overlay) hideModal(); };

    // Event: Quantity
    const updateTotal = () => {
        const qty = parseInt(qtyInput.value);
        const total = product.price * qty;
        totalPrice.innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
    };

    document.querySelector('.qty-btn.minus').onclick = () => {
        if (qtyInput.value > 1) {
            qtyInput.value--;
            updateTotal();
        }
    };
    document.querySelector('.qty-btn.plus').onclick = () => {
        qtyInput.value++;
        updateTotal();
    };
    qtyInput.onchange = () => {
        if (qtyInput.value < 1) qtyInput.value = 1;
        updateTotal();
    };

    // Event: Size Selector
    setupCustomSelect(product);

    // Event: Add to Cart
    addToCartBtn.onclick = () => {
        const size = sizeSelected.innerText;
        const qty = parseInt(qtyInput.value);
        
        // Logic thêm vào giỏ hàng (Giả định có hàm toàn cục hoặc xử lý LocalStorage)
        addToCart(product, qty, size);
        
        if (window.updateHeaderCounts) window.updateHeaderCounts();
        
        hideModal();
        // Mở drawer giỏ hàng để người dùng thấy
        const cartOverlay = document.getElementById('cartOverlay');
        const cartSidebar = document.getElementById('cartSidebar');
        cartOverlay?.classList.add('open');
        cartSidebar?.classList.add('open');
    };

    // Event: Favorite Toggle
    const favBtn = document.getElementById('addToFavorite');
    const favIcon = favBtn.querySelector('i');
    
    // Reset/Check if already saved
    let saved = JSON.parse(localStorage.getItem('savedProducts')) || [];
    if (saved.some(s => s.id === product.id)) {
        favIcon.classList.replace('far', 'fas');
        favIcon.classList.add('active');
    } else {
        favIcon.classList.replace('fas', 'far');
        favIcon.classList.remove('active');
    }

    favBtn.onclick = () => {
        const icon = favBtn.querySelector('i');
        const isFav = icon.classList.toggle('fas');
        icon.classList.toggle('far', !isFav);
        icon.classList.toggle('active', isFav);

        let savedList = JSON.parse(localStorage.getItem('savedProducts')) || [];
        if (isFav) {
            if (!savedList.find(s => s.id === product.id)) {
                savedList.push(product);
            }
        } else {
            savedList = savedList.filter(s => s.id !== product.id);
        }
        localStorage.setItem('savedProducts', JSON.stringify(savedList));
        if (window.updateHeaderCounts) window.updateHeaderCounts();
    };

    // Event: Zoom
    const zoomBtn = document.querySelector('.zoom-btn');
    zoomBtn.onclick = () => {
        const currentScale = img.style.transform || "scale(1)";
        if (currentScale === "scale(1)" || currentScale === "") {
            img.style.transform = "scale(1.5)";
            img.style.cursor = "zoom-out";
        } else {
            img.style.transform = "scale(1)";
            img.style.cursor = "zoom-in";
        }
    };
}

function setupCustomSelect(product) {
    const selElmnt = document.getElementById('sizeSelector');
    const selected = selElmnt.querySelector('.select-selected');
    const items = selElmnt.querySelector('.select-items');
    const addToCartBtn = document.getElementById('modalAddToCart');

    // Toggle dropdown
    selected.onclick = (e) => {
        e.stopPropagation();
        closeAllSelect(selected);
        items.classList.toggle('select-hide');
        selected.classList.toggle('select-arrow-active');
    };

    // Handle item click
    const optionDivs = items.querySelectorAll('div');
    optionDivs.forEach(div => {
        div.onclick = function() {
            selected.innerText = this.innerText;
            selected.classList.add('selected');
            addToCartBtn.classList.add('active');
            addToCartBtn.disabled = false;
            
            optionDivs.forEach(d => d.classList.remove('same-as-selected'));
            this.classList.add('same-as-selected');
            
            items.classList.add('select-hide');
            selected.classList.remove('select-arrow-active');
        };
    });
}

function closeAllSelect(elmnt) {
    const items = document.querySelectorAll('.select-items');
    const selected = document.querySelectorAll('.select-selected');
    for (let i = 0; i < selected.length; i++) {
        if (elmnt == selected[i]) continue;
        selected[i].classList.remove('select-arrow-active');
    }
    for (let i = 0; i < items.length; i++) {
        items[i].classList.add('select-hide');
    }
}

document.addEventListener('click', () => closeAllSelect());

// Helper: addToCart
function addToCart(product, quantity, size) {
    console.log(`Added to cart: ${product.name} - Qty: ${quantity} - Size: ${size}`);
    
    // Lưu vào LocalStorage hoặc SessionStorage để giỏ hàng đồng bộ
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            quantity: quantity,
            size: size
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật giao diện giỏ hàng nếu có hàm initCart
    if (window.initCart) window.initCart();
    if (window.updateHeaderCounts) window.updateHeaderCounts();
}

// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', initShop);


