/**
 * utils.js - Các hàm tiện ích dùng chung cho toàn bộ website
 */

// 1. Hàm nạp Component HTML vào một placeholder
async function loadComponent(id, path) {
    try {
        const container = document.getElementById(id);
        if (!container) return false;

        // Nếu là header hoặc footer, thêm một class loading để giữ chỗ (CSS sẽ xử lý chiều cao)
        if (id.includes('header')) container.classList.add('header-placeholder-loading');
        if (id.includes('footer')) container.classList.add('footer-placeholder-loading');

        const response = await fetch(path);
        if (!response.ok) throw new Error(`Không tìm thấy file: ${path}`);
        const html = await response.text();
        
        container.innerHTML = html;
        container.classList.remove('header-placeholder-loading', 'footer-placeholder-loading');

        // Sửa đường dẫn cho các tài nguyên trong component vừa nạp
        const isSubfolder = window.location.pathname.includes('/html/') || window.location.pathname.includes('/pages/');
        if (isSubfolder) {
            container.querySelectorAll('img[src], a[href], source[src]').forEach(el => {
                const attr = el.tagName === 'A' ? 'href' : 'src';
                const path = el.getAttribute(attr);
                // Chỉ sửa nếu là đường dẫn tương đối và không phải link tuyệt đối
                if (path && !path.startsWith('http') && !path.startsWith('/') && !path.startsWith('#') && !path.startsWith('javascript:')) {
                    // Nếu đường dẫn đã có ../ thì không cần thêm, hoặc nếu chưa có thì thêm
                    if (!path.startsWith('../')) {
                        el.setAttribute(attr, '../' + path);
                    }
                }
            });
        } else {
            // Nếu ở trang chủ, đảm bảo đường dẫn không có ../ dư thừa
            container.querySelectorAll('img[src], a[href], source[src]').forEach(el => {
                const attr = el.tagName === 'A' ? 'href' : 'src';
                let path = el.getAttribute(attr);
                if (path && path.startsWith('../')) {
                    while (path.startsWith('../')) {
                        path = path.substring(3);
                    }
                    el.setAttribute(attr, path);
                }
            });
        }

        // Thực thi các thẻ <script> có trong component mới nạp
        const scripts = container.querySelectorAll('script');
        for (const oldScript of scripts) {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            // Thêm vào body để chạy, sau đó xóa đi để giữ DOM sạch
            document.body.appendChild(newScript);
            oldScript.remove();
        }
        return true;
    } catch (error) {
        console.error("Lỗi nạp component:", error, "Path:", path);
        return false;
    }
}

// 2. Hàm bỏ dấu tiếng Việt để tìm kiếm chính xác
function removeAccents(str) {
    if (!str) return "";
    return str.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/Đ/g, "D")
              .toLowerCase();
}

// 3. Hàm thiết lập sự kiện Giỏ hàng chung
function setupCartEvents() {
    const elements = {
        overlay: document.getElementById('cartOverlay'),
        sidebar: document.getElementById('cartSidebar'),
        btn: document.getElementById('cartHeaderBtn'),
        close: document.getElementById('closeCartBtn')
    };

    if (elements.btn) {
        // Xóa listener cũ nếu có (để tránh lặp event khi load lại component)
        const newBtn = elements.btn.cloneNode(true);
        elements.btn.parentNode.replaceChild(newBtn, elements.btn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const overlay = document.getElementById('cartOverlay');
            const sidebar = document.getElementById('cartSidebar');
            overlay?.classList.add('open');
            sidebar?.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    const closeCart = () => {
        const overlay = document.getElementById('cartOverlay');
        const sidebar = document.getElementById('cartSidebar');
        overlay?.classList.remove('open');
        sidebar?.classList.remove('open');
        document.body.style.overflow = 'auto';
    };

    document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
}

// 4. Hàm kiểm tra và hiển thị thông tin người dùng
function checkAndDisplayUser() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    let currentUser = sessionStorage.getItem('currentUser');

    if (isLoggedIn === 'true' && currentUser) {
        const nameOnly = currentUser.replace(/\d/g, '');
        const formattedName = nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1);

        const userNameDisplay = document.getElementById('userNameDisplay');
        const accountLink = document.getElementById('accountLink');

        if (userNameDisplay) {
            userNameDisplay.innerText = formattedName || "User";
            const accountStatus = document.getElementById('accountStatus');
            if (accountStatus) {
                accountStatus.childNodes[0].textContent = "My Account";
            }

            if (accountLink) {
                accountLink.href = "#";
                accountLink.onclick = (e) => {
                    e.preventDefault();
                    if (confirm("Bạn có muốn đăng xuất không?")) {
                        sessionStorage.clear();
                        window.location.reload();
                    }
                };
            }
        }
    }
}

// 5. Quản lý Giỏ hàng tập trung
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Thông báo cho các component khác cập nhật UI
    if (window.updateHeaderCounts) window.updateHeaderCounts();
    if (window.initCart) window.initCart();
}

function addToCart(product, quantity, size) {
    let cart = getCart();
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
    saveCart(cart);
    
    // Hiển thị thông báo
    showToast(`Đã thêm <b>${product.name}</b> (Size: ${size}) vào giỏ hàng!`, 'success');
}

function removeFromCart(id, size) {
    let cart = getCart();
    cart = cart.filter(item => !(item.id === id && item.size === size));
    saveCart(cart);
}

function updateCartQty(id, size, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id === id && i.size === size);
    if (item) {
        item.quantity += delta;
        if (item.quantity < 1) item.quantity = 1;
        saveCart(cart);
    }
}

function updateHeaderCounts() {
    const saved = JSON.parse(localStorage.getItem('savedProducts')) || [];
    const savedCount = document.getElementById('savedCountBubble');
    if (savedCount) {
        savedCount.innerText = saved.length;
        savedCount.style.display = saved.length > 0 ? 'flex' : 'none';
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cartCountBubble');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartCount.innerText = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

/**
 * Kiểm tra sản phẩm có thuộc loại cần chọn kích thước (Size) hay không
 * Các loại cần size: Áo (AO), Quần (PAN), Áo khoác (JAC), Vest (VES)
 */
function productNeedsSize(product) {
    if (!product || !product.id) return false;
    const pid = product.id.toUpperCase();
    return pid.startsWith('AO') || pid.startsWith('PAN') || pid.startsWith('JAC') || pid.startsWith('VES');
}

/**
 * Tự động sửa đường dẫn hình ảnh/tài nguyên dựa vào vị trí trang hiện tại
 * (Ở thư mục gốc hay ở trong thư mục /html/)
 */
function fixPath(path) {
    if (!path || typeof path !== 'string') return "";
    if (path.startsWith('http') || path.startsWith('blob:')) return path;

    const isSubfolder = window.location.pathname.includes('/html/') || window.location.pathname.includes('/pages/');
    
    // Chuẩn hóa: loại bỏ ../ ở đầu nếu có để xử lý từ gốc
    let cleanPath = path;
    while (cleanPath.startsWith('../')) {
        cleanPath = cleanPath.substring(3);
    }

    if (isSubfolder) {
        return "../" + cleanPath;
    }
    return cleanPath;
}

// Xuất các hàm ra global scope (window) để các script khác sử dụng
window.loadComponent = loadComponent;
window.removeAccents = removeAccents;
window.setupCartEvents = setupCartEvents;
window.checkAndDisplayUser = checkAndDisplayUser;
window.updateHeaderCounts = updateHeaderCounts;
window.productNeedsSize = productNeedsSize;
window.fixPath = fixPath;
// Xuất các hàm quản lý giỏ hàng mới
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQty = updateCartQty;

// 6. Hệ thống Thông báo (Toast)
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle');
    
    toast.innerHTML = `
        <i class="fas ${icon} toast-icon"></i>
        <div class="toast-content">${message}</div>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Show animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Hide and remove
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

window.showToast = showToast;

// 7. Tự động khởi tạo khi script được tải xong (Auto-init)
// Sử dụng setTimeout để đảm bảo các component đã được parse xong nếu script được đặt ở cuối body
setTimeout(() => {
    if (window.updateHeaderCounts) window.updateHeaderCounts();
    if (window.checkAndDisplayUser) window.checkAndDisplayUser();
}, 100);

