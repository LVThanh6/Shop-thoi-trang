/**
 * app.js - Trang chủ (index.html)
 */

async function initIndex() {
    // 1. Nạp các phần phụ của trang theo trình tự
    await loadComponent('header-placeholder', 'html/header.html');
    await loadComponent('main-placeholder', 'html/trangchu.html');
    await loadComponent('footer-placeholder', 'html/footer.html');
    await loadComponent('cart-holder', 'html/cart-drawer.html');

    // 2. Thiết lập sự kiện giỏ hàng sau khi drawer đã load xong
    setupCartEvents();
    if (window.initCart) window.initCart();

    // 3. Hiển thị thông tin user (nếu đã đăng nhập)

    checkAndDisplayUser();
    if (window.updateHeaderCounts) window.updateHeaderCounts();

    console.log("Trang chủ đã sẵn sàng!");
}

// Khởi chạy khi script đã tải
document.addEventListener('DOMContentLoaded', initIndex);

