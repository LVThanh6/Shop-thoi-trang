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

    setupNavbarCategoryClicks();
    setupLoadMoreEvents();

    
    // Đảm bảo các sự kiện chung hoạt động
    if (window.setupCartEvents) window.setupCartEvents();
    if (window.checkAndDisplayUser) window.checkAndDisplayUser();
    if (window.initCart) window.initCart();

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

// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', initShop);


