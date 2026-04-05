// js/giohang.js
function initCart() {
    const cartContainer = document.querySelector('.cart-items-list');
    const totalPriceElement = document.getElementById('cartTotalPrice');

    if (!cartContainer || !totalPriceElement) return;

    function renderMiniCart() {
        const cart = window.getCart ? window.getCart() : [];
        cartContainer.innerHTML = '';
        
        let total = 0;
        
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item-mini';
            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.name}" onerror="this.src='../assets/img/no-img.jpg'">
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-size">Size: ${item.size}</span>
                    <span class="item-price">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</span>
                    <div class="qty-control">
                        <button class="qty-btn minus" data-id="${item.id}" data-size="${item.size}">-</button>
                        <input type="text" value="${item.quantity}" readonly>
                        <button class="qty-btn plus" data-id="${item.id}" data-size="${item.size}">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" data-id="${item.id}" data-size="${item.size}">&times;</button>
            `;
            cartContainer.appendChild(itemEl);
        });

        totalPriceElement.innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);

        // Cập nhật trạng thái trống/đầy
        const emptyState = document.getElementById('cartEmptyState');
        const footer = document.getElementById('cartSidebarFooter');
        if (cart.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (cartContainer) cartContainer.style.display = 'none';
            if (footer) footer.style.display = 'none';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            if (cartContainer) cartContainer.style.display = 'block';
            if (footer) footer.style.display = 'block';
        }
    }

    // Lắng nghe sự kiện click
    cartContainer.onclick = (e) => {
        const target = e.target;
        const id = target.getAttribute('data-id');
        const size = target.getAttribute('data-size');
        
        if (!id) return;

        if (target.classList.contains('plus')) {
            window.updateCartQty(id, size, 1);
        } else if (target.classList.contains('minus')) {
            window.updateCartQty(id, size, -1);
        } else if (target.classList.contains('remove-item-btn')) {
            if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                window.removeFromCart(id, size);
            }
        }
    };

    renderMiniCart();
}

window.initCart = initCart;
