// js/cart-logic.js

// Hàm định dạng tiền VND (VD: 150.000 VND)
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hàm render: Duyệt mảng từ localStorage và tạo HTML hiển thị
function renderCart() {
    const container = document.getElementById('product-list-container');
    const totalElement = document.getElementById('final-total');

    if (!container) return;

    const cartItems = window.getCart ? window.getCart() : [];
    container.innerHTML = ''; // Xóa sạch danh sách cũ trước khi vẽ mới

    if (cartItems.length === 0) {
        container.innerHTML = "<p style='padding: 40px; text-align:center; font-size:18px; color:#666;'>Giỏ hàng của bạn đang trống.</p>";
        if (totalElement) totalElement.innerText = "0 VND";
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
                <img src="${item.img}" alt="${item.name}" onerror="this.src='../assets/img/no-img.jpg'">
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

    if (totalElement) totalElement.innerText = formatVND(total);
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

// Tự động chạy render khi trang đã tải xong
document.addEventListener('DOMContentLoaded', renderCart);