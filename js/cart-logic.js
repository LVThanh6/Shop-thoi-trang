// Khai báo mảng động chứa 2 sản phẩm mặc định
let cartItems = [
    {
        id: 1,
        name: 'Fresh Strawberries',
        price: 150000,
        qty: 5,
        img: '../assets/img/item-cart-04'
    },
    {
        id: 2,
        name: 'Lightweight Jacket',
        price: 550000,
        qty: 1,
        img: '../assets/img/item-cart-04'
    }
];
// Hàm định dạng tiền VND (VD: 150.000 VND)
function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + " VND";
}

// Hàm render: Duyệt mảng cartItems và tạo HTML hiển thị
function renderCart() {
    const container = document.getElementById('product-list-container');
    const totalElement = document.getElementById('final-total');

    if (!container) return;

    container.innerHTML = ''; // Xóa sạch danh sách cũ trước khi vẽ mới

    if (cartItems.length === 0) {
        container.innerHTML = "<p style='padding: 20px; text-align:center;'>Giỏ hàng đang trống</p>";
        totalElement.innerText = "0 VND";
        return;
    }

    let total = 0;

    cartItems.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;

        // Tạo cấu trúc HTML cho từng sản phẩm
        container.innerHTML += `
        <div class="product-item">
            <div class="col-product">
                <img src="${item.img}" alt="${item.name}" onerror="this.src='https://placehold.co/75x75?text=No+Image'">
                <span>${item.name}</span>
            </div>
            <div class="col-price">${formatVND(item.price)}</div>
            <div class="col-qty">
                <div class="qty-box">
                    <button onclick="changeQty(${item.id}, -1)">-</button>
                    <input value="${item.qty}" readonly>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <div class="col-subtotal">${formatVND(subtotal)}</div>
            <span class="btn-remove" onclick="removeItem(${item.id})">×</span>
        </div>
        `;
    });

    totalElement.innerText = formatVND(total);
}

// Hàm thay đổi số lượng (+ hoặc -)
function changeQty(id, delta) {
    const item = cartItems.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty < 1) item.qty = 1; // Không cho giảm xuống 0
        renderCart(); // Vẽ lại giao diện sau khi thay đổi
    }
}

// Hàm xóa sản phẩm khỏi mảng
function removeItem(id) {
    if (confirm("Xóa sản phẩm này khỏi giỏ hàng?")) {
        cartItems = cartItems.filter(item => item.id !== id);
        renderCart();
    }
}

// Tự động chạy render khi trang đã tải xong
document.addEventListener('DOMContentLoaded', renderCart);