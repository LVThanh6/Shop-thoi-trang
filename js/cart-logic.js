// js/cart-logic.js

// Hàm định dạng tiền VND (VD: 150.000 VND)
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Trạng thái mã giảm giá
let currentDiscountPercent = 0;
let currentCouponCode = "";

// Hàm render: Duyệt mảng từ localStorage và tạo HTML hiển thị
function renderCart() {
    const container = document.getElementById('product-list-container');
    const subtotalElement = document.getElementById('sub-total');
    const discountElement = document.getElementById('discount-amount');
    const finalTotalElement = document.getElementById('final-total');

    if (!container) return;

    const cartItems = window.getCart ? window.getCart() : [];
    container.innerHTML = ''; // Xóa sạch danh sách cũ trước khi vẽ mới

    if (cartItems.length === 0) {
        container.innerHTML = "<p style='padding: 40px; text-align:center; font-size:18px; color:#666;'>Giỏ hàng của bạn đang trống.</p>";
        if (subtotalElement) subtotalElement.innerText = "0 VND";
        if (discountElement) discountElement.innerText = "0 VND";
        if (finalTotalElement) finalTotalElement.innerText = "0 VND";
        return;
    }

    let total = 0;

    cartItems.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        // Tạo cấu trúc HTML cho từng sản phẩm
        container.innerHTML += `
        <div class="product-item">
            <div class="col-product">
                <img src="${window.fixPath(item.img)}" alt="${item.name}" onerror="this.src='../img/no-img.jpg'">
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                    <div style="font-size: 13px; color: #888;">Size: ${item.size}</div>
                </div>
            </div>
            <div class="col-price">${formatVND(item.price)}</div>
            <div class="col-qty">
                <div class="qty-box">
                    <button onclick="changeQty('${item.id}', '${item.size}', -1)">-</button>
                    <input value="${item.quantity}" readonly>
                    <button onclick="changeQty('${item.id}', '${item.size}', 1)">+</button>
                </div>
            </div>
            <div class="col-subtotal">${formatVND(subtotal)}</div>
            <span class="btn-remove" onclick="removeCartItem('${item.id}', '${item.size}')">×</span>
        </div>
        `;
    });

    // Tính toán giảm giá và tổng cộng
    const discountValue = total * (currentDiscountPercent / 100);
    const finalTotal = total - discountValue;

    if (subtotalElement) subtotalElement.innerText = formatVND(total);
    if (discountElement) {
        discountElement.innerText = formatVND(discountValue);
        if (currentDiscountPercent > 0) {
            discountElement.innerHTML += ` <span style="font-size: 12px; color: #27ae60;">(-${currentDiscountPercent}%)</span>`;
        }
    }
    if (finalTotalElement) finalTotalElement.innerText = formatVND(finalTotal);

    // Cập nhật lại số lượng trên Header nếu có
    if (window.updateHeaderCounts) window.updateHeaderCounts();
}

// Hàm thay đổi số lượng (+ hoặc -)
function changeQty(id, size, delta) {
    if (window.updateCartQty) {
        window.updateCartQty(id, size, delta);
        renderCart(); // Vẽ lại giao diện sau khi thay đổi
    }
}

// Hàm xóa sản phẩm khỏi mảng
function removeCartItem(id, size) {
    if (confirm("Xóa sản phẩm này khỏi giỏ hàng?")) {
        if (window.removeFromCart) {
            window.removeFromCart(id, size);
            renderCart();
        }
    }
}

// Gán hàm vào window để có thể gọi từ HTML (inline onclick)
window.changeQty = changeQty;
window.removeCartItem = removeCartItem;
window.initCart = renderCart; // Đồng bộ với saveCart call

// Hàm áp dụng mã giảm giá
function applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (!input) return;

    const code = input.value.trim();
    if (!code) {
        if (window.showToast) window.showToast("Vui lòng nhập mã giảm giá", "warning");
        return;
    }

    if (code === "1111") {
        currentDiscountPercent = 10;
        currentCouponCode = "1111";
        if (window.showToast) window.showToast("Đã áp dụng mã 1111: Giảm 10%", "success");
    } else if (code === "2222") {
        currentDiscountPercent = 20;
        currentCouponCode = "2222";
        if (window.showToast) window.showToast("Đã áp dụng mã 2222: Giảm 20%", "success");
    } else {
        currentDiscountPercent = 0;
        currentCouponCode = "";
        if (window.showToast) window.showToast("Mã giảm giá không hợp lệ", "error");
    }

    renderCart();
}

window.applyCoupon = applyCoupon;

// Hàm xử lý đặt hàng / thanh toán sử dụng biểu thức chính quy (Regex)
function handleCheckout() {
    const cartItems = window.getCart ? window.getCart() : [];
    if (cartItems.length === 0) {
        if (window.showToast) window.showToast("Giỏ hàng của bạn đang trống!", "warning");
        else alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    const countryInput = document.querySelector('input[placeholder="Select a country..."]');
    const stateInput = document.querySelector('input[placeholder="State / country"]');
    const zipInput = document.querySelector('input[placeholder="Postcode / Zip"]');

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const country = countryInput ? countryInput.value.trim() : "";
    const state = stateInput ? stateInput.value.trim() : "";
    const zip = zipInput ? zipInput.value.trim() : "";

    // 1. Biểu thức chính quy cho tên người nhận (chỉ chứa chữ cái tiếng Việt và khoảng trắng, dài 2 - 50 kí tự)
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯưăâêôơư\s]{2,50}$/;
    if (!name) {
        if (window.showToast) window.showToast("Vui lòng nhập tên người nhận!", "warning");
        else alert("Vui lòng nhập tên người nhận!");
        return;
    }
    if (!nameRegex.test(name)) {
        if (window.showToast) window.showToast("Tên người nhận không hợp lệ (không chứa số hoặc ký tự đặc biệt, dài từ 2-50 ký tự)!", "warning");
        else alert("Tên người nhận không hợp lệ!");
        return;
    }

    // 2. Biểu thức chính quy cho số điện thoại (10 chữ số, bắt đầu bằng các đầu số Việt Nam: 03, 05, 07, 08, 09)
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phone) {
        if (window.showToast) window.showToast("Vui lòng nhập số điện thoại liên hệ!", "warning");
        else alert("Vui lòng nhập số điện thoại liên hệ!");
        return;
    }
    if (!phoneRegex.test(phone)) {
        if (window.showToast) window.showToast("Số điện thoại không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08, 09)!", "warning");
        else alert("Số điện thoại không hợp lệ!");
        return;
    }

    // 3. Kiểm tra địa chỉ cơ bản
    if (!country || !state) {
        if (window.showToast) window.showToast("Vui lòng nhập đầy đủ thông tin Quốc gia và Tỉnh / Thành phố!", "warning");
        else alert("Vui lòng nhập đầy đủ thông tin địa chỉ!");
        return;
    }

    // 4. Biểu thức chính quy cho mã bưu điện (Zipcode) nếu có nhập (phải gồm 5 hoặc 6 chữ số)
    const zipRegex = /^\d{5,6}$/;
    if (zip && !zipRegex.test(zip)) {
        if (window.showToast) window.showToast("Mã bưu điện (Postcode / Zip) không hợp lệ (phải chứa từ 5 đến 6 chữ số)!", "warning");
        else alert("Mã bưu điện không hợp lệ!");
        return;
    }

    // Tiến hành hoàn tất đặt hàng
    if (window.showToast) window.showToast("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại M&N.", "success");
    else alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại M&N.");

    // Xóa giỏ hàng sau khi đặt thành công
    localStorage.removeItem('cart');
    
    // Reset các ô nhập liệu
    if (nameInput) nameInput.value = "";
    if (phoneInput) phoneInput.value = "";
    if (countryInput) countryInput.value = "";
    if (stateInput) stateInput.value = "";
    if (zipInput) zipInput.value = "";

    // Tải lại giao diện giỏ hàng
    renderCart();
}

window.handleCheckout = handleCheckout;

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    
    // Đăng ký sự kiện click cho nút Tiến hành thanh toán
    const checkoutBtn = document.querySelector('.btn-primary-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});
