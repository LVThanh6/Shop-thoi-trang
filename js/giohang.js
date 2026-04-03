<<<<<<< HEAD
// js/giohang.js
function initCart() {
    const cartContainer = document.querySelector('.cart-items-list');
    const totalPriceElement = document.getElementById('cartTotalPrice');

    if (!cartContainer || !totalPriceElement) return;

    // Hàm cập nhật tổng tiền
    function updateCartTotal() {
        let total = 0;
        const cartItems = cartContainer.querySelectorAll('.cart-item-mini');

        cartItems.forEach(item => {
            const priceElement = item.querySelector('.item-price');
            const quantityInput = item.querySelector('input');

            if (priceElement && quantityInput) {
                const price = parseInt(priceElement.innerText.replace(/\D/g, ''));
                const quantity = parseInt(quantityInput.value);
                total += price * quantity;
            }
        });

        const formattedTotal = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(total);

        totalPriceElement.innerText = formattedTotal;

        // Cập nhật trạng thái trống/đầy
        const emptyState = document.getElementById('cartEmptyState');
        const footer = document.getElementById('cartSidebarFooter');
        if (cartItems.length === 0) {
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
        const cartItem = target.closest('.cart-item-mini');
        if (!cartItem) return;

        const input = cartItem.querySelector('input');

        if (target.classList.contains('plus')) {
            input.value = parseInt(input.value) + 1;
            updateCartTotal();
        } else if (target.classList.contains('minus')) {
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
                updateCartTotal();
            }
        } else if (target.classList.contains('remove-item-btn')) {
            if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                cartItem.remove();
                updateCartTotal();
            }
        }
    };

    cartContainer.onchange = (e) => {
        if (e.target.tagName === 'INPUT') {
            if (e.target.value < 1) e.target.value = 1;
            updateCartTotal();
        }
    };

    updateCartTotal();
}

window.initCart = initCart;
=======
// js/giohang.js
function initCart() {
    const cartContainer = document.querySelector('.cart-items-list');
    const totalPriceElement = document.getElementById('cartTotalPrice');

    if (!cartContainer || !totalPriceElement) return;

    // Hàm cập nhật tổng tiền
    function updateCartTotal() {
        let total = 0;
        const cartItems = cartContainer.querySelectorAll('.cart-item-mini');

        cartItems.forEach(item => {
            const priceElement = item.querySelector('.item-price');
            const quantityInput = item.querySelector('input');

            if (priceElement && quantityInput) {
                const price = parseInt(priceElement.innerText.replace(/\D/g, ''));
                const quantity = parseInt(quantityInput.value);
                total += price * quantity;
            }
        });

        const formattedTotal = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(total);

        totalPriceElement.innerText = formattedTotal;
        
        // Cập nhật trạng thái trống/đầy
        const emptyState = document.getElementById('cartEmptyState');
        const footer = document.getElementById('cartSidebarFooter');
        if (cartItems.length === 0) {
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
        const cartItem = target.closest('.cart-item-mini');
        if (!cartItem) return;

        const input = cartItem.querySelector('input');

        if (target.classList.contains('plus')) {
            input.value = parseInt(input.value) + 1;
            updateCartTotal();
        } else if (target.classList.contains('minus')) {
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
                updateCartTotal();
            }
        } else if (target.classList.contains('remove-item-btn')) {
            if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                cartItem.remove();
                updateCartTotal();
            }
        }
    };

    cartContainer.onchange = (e) => {
        if (e.target.tagName === 'INPUT') {
            if (e.target.value < 1) e.target.value = 1;
            updateCartTotal();
        }
    };

    updateCartTotal();
}

window.initCart = initCart;
>>>>>>> 6e17adff5f6fc22e2dbe6112f9a8582b4feaa686
