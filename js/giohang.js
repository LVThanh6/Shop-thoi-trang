document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.querySelector('.total-price');
    const subtotalElement = document.querySelector('.summary-line span:last-child');

    if (!cartContainer || !totalPriceElement || !subtotalElement) return;

    // Hàm cập nhật tổng tiền
    function updateCartTotal() {
        let total = 0;
        const cartItems = document.querySelectorAll('.cart-item');

        cartItems.forEach(item => {
            const priceElement = item.querySelector('.price');
            const quantityInput = item.querySelector('input');

            // Chuyển đổi text "450.000đ" thành số 450000
            const price = parseInt(priceElement.innerText.replace(/\D/g, ''));
            const quantity = parseInt(quantityInput.value);

            total += price * quantity;
        });

        // Định dạng lại tiền tệ (VND)
        const formattedTotal = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(total);

        totalPriceElement.innerText = formattedTotal;
        subtotalElement.innerText = formattedTotal;
    }

    // Lắng nghe sự kiện click trong giỏ hàng
    cartContainer.addEventListener('click', (e) => {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;

        const input = cartItem.querySelector('input');

        // Xử lý nút Tăng (+)
        if (target.innerText === '+') {
            input.value = parseInt(input.value) + 1;
            updateCartTotal();
        }

        // Xử lý nút Giảm (-)
        if (target.innerText === '-') {
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
                updateCartTotal();
            }
        }

        // Xử lý nút Xóa
        if (target.classList.contains('remove-btn')) {
            if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                cartItem.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => {
                    cartItem.remove();
                    updateCartTotal();
                }, 300);
            }
        }
    });

    // Xử lý khi người dùng nhập số trực tiếp vào ô input
    cartContainer.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT') {
            if (e.target.value < 1) e.target.value = 1;
            updateCartTotal();
        }
    });

    // Chạy lần đầu để tính toán giá trị mặc định
    updateCartTotal();
});