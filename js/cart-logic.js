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

// Tự động chạy render khi trang đã tải xong
document.addEventListener('DOMContentLoaded', renderCart);
