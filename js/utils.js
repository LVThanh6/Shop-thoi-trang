/**
 * utils.js - Các hàm tiện ích dùng chung cho toàn bộ website
 */

// 1. Hàm nạp Component HTML vào một placeholder
async function loadComponent(id, path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Không tìm thấy file: ${path}`);
        const html = await response.text();
        
        const container = document.getElementById(id);
        if (!container) return false;

        container.innerHTML = html;

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
            userNameDisplay.innerText = "Hi, " + (formattedName || "User");
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

// Xuất các hàm ra global scope (window) để các script khác sử dụng
window.loadComponent = loadComponent;
window.removeAccents = removeAccents;
window.setupCartEvents = setupCartEvents;
window.checkAndDisplayUser = checkAndDisplayUser;

