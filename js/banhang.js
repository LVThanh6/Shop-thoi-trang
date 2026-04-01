// Thay thế đoạn script cũ bằng đoạn này
async function loadHtml(id, path, inner = true) {
    try {
        const res = await fetch(path);
        const text = await res.text();

        const targetElement = document.getElementById(id);
        if (!targetElement) return;

        // 1. Chèn HTML vào DOM
        targetElement.innerHTML = text;

        // 2. Tìm tất cả các thẻ <script> vừa được chèn vào
        const scripts = targetElement.querySelectorAll('script');

        // 3. Tạo thẻ <script> mới và chép nội dung sang để ép trình duyệt thực thi
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');

            // Nếu là script link ra ngoài (src)
            if (oldScript.src) {
                newScript.src = oldScript.src;
            }
            // Nếu là script viết trực tiếp bên trong (inline)
            else {
                newScript.textContent = oldScript.textContent;
            }

            // Thêm vào body để chạy, sau đó xóa đi cho nhẹ DOM
            document.body.appendChild(newScript);
            oldScript.remove(); // Xóa thẻ script "chết" cũ đi
        });

    } catch (e) {
        console.error('Không tải được', path, e);
    }
}

// --- GLOBAL STATE ---
let allProducts = [];

// --- KHỞI TẠO ---
async function init() {
    // Đợi nạp xong cấu trúc layout cơ bản
    await loadHtml('header-placeholder', './header.html');
    await loadHtml('filter-placeholder', './filter.html');
    await loadHtml('footer-placeholder', './footer.html');

    // Mặc định tải Giày khi vào trang
    await loadProducts('../data/shoes.json');
}

// --- NẠP VÀ HIỂN THỊ SẢN PHẨM ---
async function loadProducts(categoryPath) {
    const container = document.getElementById('product-placeholder');
    if (!container) return;

    try {
        const res = await fetch(categoryPath);
        allProducts = await res.json();

        // 1. Xây dựng bộ lọc tự động dựa trên Tags
        buildDynamicFilters(allProducts);

        // 2. Hiển thị tất cả sản phẩm ra màn hình
        renderProducts(allProducts);
    } catch (e) {
        console.error('Lỗi khi tải sản phẩm:', e);
        container.innerHTML = '<p>Không thể tải danh sách sản phẩm lúc này.</p>';
    }
}

// --- HÀM VẼ GIAO DIỆN SẢN PHẨM ---
function renderProducts(products) {
    const container = document.getElementById('product-placeholder');
    if (!container) return;

    container.innerHTML = '';
    container.className = 'product-grid';

    if (products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Kiểm tra ảnh, nếu không có thì để trống
        const imgHtml = product.img 
            ? `<img src="${product.img}" alt="${product.name}" onerror="this.parentElement.innerHTML='<span class=\\"no-img\\">No Image</span>'">`
            : '<span class="no-img">No Image</span>';

        // Định dạng tiền tệ VND
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(product.price);

        card.innerHTML = `
            <div class="product-img">
                ${imgHtml}
            </div>
            <div class="product-info">
                <div class="product-name" title="${product.name}">${product.name}</div>
                <div class="product-price">${formattedPrice}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// --- HÀM XÂY DỰNG BỘ LỌC ĐỘNG TỪ JSON ---
function buildDynamicFilters(products) {
    const container = document.getElementById('dynamic-filters-container');
    if (!container) return;

    // 1. Quét tất cả sản phẩm để trích xuất và đếm Tags
    const tagMap = {};
    products.forEach(p => {
        if (!p.tags) return;
        for (const [category, values] of Object.entries(p.tags)) {
            if (!tagMap[category]) tagMap[category] = {};
            values.forEach(val => {
                if (!tagMap[category][val]) tagMap[category][val] = 0;
                tagMap[category][val]++; // Tăng bộ đếm
            });
        }
    });

    // 2. Tạo mã HTML cho bộ lọc
    let html = '';
    for (const [category, valuesCountMap] of Object.entries(tagMap)) {
        let optionsHtml = '';
        for (const [val, count] of Object.entries(valuesCountMap)) {
            optionsHtml += `
                <label class="filter-option">
                    <input type="checkbox" data-category="${category}" value="${val}" onchange="window.applyFilters()"> 
                    ${val} <span>${count}</span>
                </label>
            `;
        }

        html += `
            <div class="filter-section">
                <h3>${category}</h3>
                <div class="section-body">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // Kích hoạt sự kiện thu gọn/mở rộng nếu có hàm exporter từ filter.html
    if (window.setupFilterCollapses) {
        window.setupFilterCollapses();
    }
}

// --- HÀM LỌC SẢN PHẨM KHỚP TIÊU CHÍ (Global Hook) ---
window.applyFilters = function() {
    // 1. Lấy khoảng giá hiện tại từ thanh trượt
    const minInput = document.getElementById('priceMin');
    const maxInput = document.getElementById('priceMax');
    let minPrice = minInput ? parseInt(minInput.value) : 0;
    let maxPrice = maxInput ? parseInt(maxInput.value) : Number.MAX_SAFE_INTEGER;

    // 2. Lấy danh sách Checkbox đang được tích
    const checkboxes = document.querySelectorAll('#dynamic-filters-container input[type="checkbox"]:checked');
    const selectedFilters = {}; // Phân nhóm các giá trị được chọn theo category
    
    checkboxes.forEach(cb => {
        const cat = cb.getAttribute('data-category');
        const val = cb.value;
        if (!selectedFilters[cat]) selectedFilters[cat] = [];
        selectedFilters[cat].push(val);
    });

    // 3. Tiến hành lọc mảng allProducts
    const filteredProducts = allProducts.filter(p => {
        // Lọc Giá
        if (p.price < minPrice || p.price > maxPrice) return false;

        // Lọc Tags
        // Logic: Với mỗi nhóm tiêu chí (Vd: Loại giày, Chất liệu), 
        // sản phẩm phải thỏa mãn ÍT NHẤT MỘT giá trị đang được chọn của nhóm đó (HOẶC logic).
        for (const [cat, selectedValues] of Object.entries(selectedFilters)) {
            // Nếu sản phẩm không có tag nào thuộc Category này -> Loại
            if (!p.tags || !p.tags[cat]) return false;

            // Kiểm tra xem sản phẩm có đặc tính nào trùng với 1 trong các đặc tính đang bị chọn không
            const hasMatch = selectedValues.some(selectedVal => p.tags[cat].includes(selectedVal));
            if (!hasMatch) return false; // Không khớp -> Loại
        }

        return true; // Thoả mãn mọi điều kiện
    });

    // 4. Cập nhật lại giao diện lưới sản phẩm
    renderProducts(filteredProducts);
};

// --- HÀM RESET BỘ LỌC TAY ---
window.resetFilters = function() {
    // Tắt hết checkbox
    document.querySelectorAll('.filter-drawer input[type=checkbox]').forEach(c => c.checked = false);
    
    // Đặt lại thanh giá (nếu có Element)
    const rangeMin = document.getElementById('priceRangeMin');
    const rangeMax = document.getElementById('priceRangeMax');
    if (rangeMin && rangeMax) {
        rangeMin.value = 0;
        rangeMax.value = 5000000; // Hoặc lấy max thực tế
        // Ép thanh range giả kích hoạt slider update
        rangeMin.dispatchEvent(new Event('input'));
        rangeMax.dispatchEvent(new Event('input'));
        rangeMin.dispatchEvent(new Event('change'));
    }

    // Áp dụng lại lưới gốc
    window.applyFilters();
};

// --- KÍCH HOẠT QUÁ TRÌNH ---
init();
