
function loadComponent(id, path) {
    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error("Không tìm thấy file: " + path);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error(error));
}

loadComponent('header-placeholder', 'html/header.html');
loadComponent('main-placeholder', 'html/trangchu.html');
loadComponent('footer-placeholder', 'html/footer.html');
loadComponent('cart-holder', 'html/cart-drawer.html');
// Hàm khởi tạo các sự kiện cho Giỏ hàng sau khi đã load xong HTML
function setupCartEvents() {
    // Đợi một chút để đảm bảo HTML đã được chèn vào DOM
    setTimeout(() => {
        const cartOverlay = document.getElementById('cartOverlay');
        const cartSidebar = document.getElementById('cartSidebar');
        const cartHeaderBtn = document.getElementById('cartHeaderBtn');
        const closeCartBtn = document.getElementById('closeCartBtn');

        if (cartHeaderBtn) {
            cartHeaderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                cartOverlay.classList.add('open');
                cartSidebar.classList.add('open');
                document.body.style.overflow = 'hidden'; // Chặn cuộn trang
            });
        }

        const closeCart = () => {
            cartOverlay.classList.remove('open');
            cartSidebar.classList.remove('open');
            document.body.style.overflow = 'auto'; // Cho phép cuộn lại
        };

        if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
        if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    }, 500); // Đợi 500ms để đảm bảo component đã load xong
}

// Chạy hàm thiết lập sự kiện
setupCartEvents();