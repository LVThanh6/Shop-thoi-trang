/**
 * shop.js - Logic cho trang bán hàng (banhang.html)
 */

let allProducts = []; // Toàn bộ dữ liệu sản phẩm của category
let filteredProducts = []; // Sản phẩm sau khi đã qua bộ lọc
let visibleCount = 8; // Số lượng sản phẩm đang hiển thị


// 1. Khởi tạo toàn trang
async function initShop() {
    // HTML components được nhúng thủ công trực tiếp vào banhang.html

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

    // Keep Bootstrap classes from HTML, just add product-grid for potential custom styles
    grid.classList.add('product-grid');
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
        card.className = 'col';
        const imgSrc = window.fixPath(p.img);
        card.innerHTML = `
            <div class="card h-100 border-0 shadow-sm product-card">
                <div class="position-relative overflow-hidden">
                    <img src="${imgSrc}" class="card-img-top" alt="${p.name}" onerror="this.src='../img/no-img.jpg'; this.onerror=null;" style="aspect-ratio: 1/1; object-fit: cover; transition: transform 0.4s ease;">
                    <button class="quick-add-btn btn btn-dark position-absolute bottom-0 end-0 m-3 shadow" title="Thêm nhanh vào giỏ" style="border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; z-index: 2;">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
                <div class="card-body p-3">
                    <h5 class="card-title product-name mb-1" title="${p.name}" style="font-size: 1rem; font-weight: 500; height: 3rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${p.name}</h5>
                    <p class="card-text product-price fw-bold mb-0" style="font-size: 1.1rem; color: #111;">${price}</p>
                </div>
            </div>
        `;

        card.onclick = (e) => {
            if (e.target.closest('.quick-add-btn')) return;
            showProductDetail(p);
        };

        const quickAddBtn = card.querySelector('.quick-add-btn');
        quickAddBtn.onclick = (e) => {
            e.stopPropagation();
            // Nếu là quần áo thì mặc định size M, ngược lại để trống size
            const defaultSize = window.productNeedsSize(p) ? "M" : "";
            if (window.addToCart) window.addToCart(p, 1, defaultSize);
        };

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
    const modalEl = document.getElementById('productDetailModal');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    // Populate Data
    const img = document.getElementById('modalProductImg');
    const name = document.getElementById('modalProductName');
    const price = document.getElementById('modalProductPrice');
    const desc = document.getElementById('modalProductDesc');
    const qtyInput = document.getElementById('modalProductQty');
    const totalPrice = document.getElementById('modalTotalPrice');
    const addToCartBtn = document.getElementById('modalAddToCart');
    const sizeSelector = document.getElementById('sizeSelector');
    const sizeRow = document.getElementById('sizeSelectorRow');

    img.src = window.fixPath(product.img);
    name.innerText = product.name;
    const breadcrumb = document.querySelector('.product-breadcrumb');
    if (breadcrumb) breadcrumb.innerText = product.name;

    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
    price.innerText = formattedPrice;
    desc.innerText = product.description || "Sản phẩm chất lượng cao, thiết kế hiện đại, phù hợp với nhiều phong cách thời trang nam.";
    qtyInput.value = 1;
    totalPrice.innerText = formattedPrice;

    // Reset size selector
    if (window.productNeedsSize(product)) {
        if (sizeRow) sizeRow.classList.remove('d-none');
        if (sizeSelector) {
            sizeSelector.value = "";
        }
        if (addToCartBtn) {
            addToCartBtn.disabled = true;
        }
    } else {
        if (sizeRow) sizeRow.classList.add('d-none');
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
        }
    }

    if (sizeSelector) {
        sizeSelector.onchange = () => {
            if (sizeSelector.value) {
                addToCartBtn.disabled = false;
            }
        };
    }

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

    // Show Modal
    modal.show();

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

    // Event: Add to Cart
    addToCartBtn.onclick = () => {
        const size = sizeSelector ? sizeSelector.value : "";
        const qty = parseInt(qtyInput.value);

        window.addToCart(product, qty, size);

        if (window.updateHeaderCounts) window.updateHeaderCounts();

        modal.hide();
        const cartOverlay = document.getElementById('cartOverlay');
        const cartSidebar = document.getElementById('cartSidebar');
        cartOverlay?.classList.add('open');
        cartSidebar?.classList.add('open');
    };

    // Event: Favorite Toggle
    const favBtn = document.getElementById('addToFavorite');
    const favIcon = favBtn.querySelector('i');

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

// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', initShop);


