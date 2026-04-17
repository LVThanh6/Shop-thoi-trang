/**
 * app.js - Trang chủ (index.html)
 */

let allHomeProducts = [];
let trendingProducts = [];
let newProducts = [];
let displayedNewCount = 4;

async function initIndex() {
    // 1. Nạp các phần phụ của trang theo trình tự
    await loadComponent('header-placeholder', 'html/header.html');
    await loadComponent('main-placeholder', 'html/trangchu.html');
    await loadComponent('footer-placeholder', 'html/footer.html');
    await loadComponent('cart-holder', 'html/cart-drawer.html');
    await loadComponent('product-detail-holder', 'html/product-detail.html');

    // Nạp danh sách sản phẩm động
    await loadDynamicProducts();

    // 2. Thiết lập sự kiện giỏ hàng sau khi drawer đã load xong
    setupCartEvents();
    if (window.initCart) window.initCart();

    // 3. Hiển thị thông tin user (nếu đã đăng nhập)
    checkAndDisplayUser();
    if (window.updateHeaderCounts) window.updateHeaderCounts();

    console.log("Trang chủ đã sẵn sàng!");
}

async function loadDynamicProducts() {
    const cats = ['shirts', 'pants', 'jackets', 'vests', 'perfumes', 'watches', 'caps', 'shoes', 'accessories'];
    try {
        const results = await Promise.all(cats.map(c => fetch(`data/${c}.json`).then(r => r.ok ? r.json() : [])));
        allHomeProducts = results.flat();
        
        // Shuffle the products to get random ones
        allHomeProducts = allHomeProducts.sort(() => 0.5 - Math.random());
        
        // 8 cho trending
        trendingProducts = allHomeProducts.slice(0, 8);
        renderHomeGrid(trendingProducts, 'trending-products');
        
        // 4 cho new products
        newProducts = allHomeProducts.slice(8, 12);
        renderHomeGrid(newProducts, 'new-products');
        
        setupHomeLoadMore();
    } catch (e) {
        console.error("Lỗi nạp danh sách sản phẩm trang chủ:", e);
    }
}

function renderHomeGrid(products, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    
    // Append instead of clear if we are loading more
    products.forEach(p => {
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Xử lý path ảnh cho đúng thư mục gốc (index.html)
        const imgSrc = p.img.replace('../', '');
        
        card.innerHTML = `
            <div class="product-img">
                <img src="${imgSrc}" alt="${p.name}" onerror="this.src='assets/img/no-img.jpg'; this.onerror=null;">
                <button class="quick-add-btn" title="Thêm nhanh vào giỏ">
                    <i class="fas fa-cart-plus"></i>
                </button>
            </div>
            <div class="product-info">
                <div class="product-name" title="${p.name}">${p.name}</div>
                <div class="product-price">${price}</div>
            </div>
        `;

        card.onclick = (e) => {
            if (e.target.closest('.quick-add-btn')) return;
            showHomeProductDetail({ ...p, img: imgSrc }, [...trendingProducts, ...newProducts]); 
        };

        const quickAddBtn = card.querySelector('.quick-add-btn');
        quickAddBtn.onclick = (e) => {
            e.stopPropagation();
            if (window.addToCart) window.addToCart({ ...p, img: imgSrc }, 1, "M");
        };

        grid.appendChild(card);
    });
}

function setupHomeLoadMore() {
    const btn = document.getElementById('load-more-btn-home');
    if(btn) {
        btn.onclick = () => {
            // Lấy thêm 4 sản phẩm ngẫu nhiên nữa
            const startIndex = 12 + (displayedNewCount - 4);
            if(startIndex >= allHomeProducts.length) {
                btn.style.display = 'none';
                return;
            }
            const moreProds = allHomeProducts.slice(startIndex, startIndex + 4);
            renderHomeGrid(moreProds, 'new-products');
            newProducts.push(...moreProds);
            displayedNewCount += 4;
            
            if(startIndex + 4 >= allHomeProducts.length) {
                btn.style.display = 'none';
            }
        };
    }
}

// ============================================
// Modal Chi tiết sản phẩm (Clone từ shop.js)
// ============================================
function showHomeProductDetail(product, productListContext) {
    const overlay = document.getElementById('productDetailOverlay');
    if (!overlay) return;

    // Populate Data
    const img = document.getElementById('modalProductImg');
    const name = document.getElementById('modalProductName');
    const price = document.getElementById('modalProductPrice');
    const desc = document.getElementById('modalProductDesc');
    const qtyInput = document.getElementById('modalProductQty');
    const totalPrice = document.getElementById('modalTotalPrice');
    const addToCartBtn = document.getElementById('modalAddToCart');

    img.src = product.img;
    name.innerText = product.name;
    const breadcrumb = document.querySelector('.product-breadcrumb');
    if(breadcrumb) breadcrumb.innerText = product.name;
    
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
    price.innerText = formattedPrice;
    desc.innerText = product.description || "Sản phẩm chất lượng cao, thiết kế hiện đại, phù hợp với nhiều phong cách thời trang nam.";
    qtyInput.value = 1;
    totalPrice.innerText = formattedPrice;

    // Reset size selector
    const sizeSelected = document.querySelector('.select-selected');
    if(sizeSelected) {
        sizeSelected.innerText = "Chọn kích thước";
        sizeSelected.classList.remove('selected');
    }
    if(addToCartBtn) {
        addToCartBtn.classList.remove('active');
        addToCartBtn.disabled = true;
    }

    // Navigation Logic
    const currentIndex = productListContext.findIndex(p => p.id === product.id);
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');

    if (prevBtn) {
        prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            let prevP = productListContext[currentIndex - 1];
            if(prevP) showHomeProductDetail({ ...prevP, img: prevP.img.replace('../', '') }, productListContext);
        };
    }

    if (nextBtn) {
        nextBtn.style.display = currentIndex < productListContext.length - 1 ? 'block' : 'none';
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            let nextP = productListContext[currentIndex + 1];
            if(nextP) showHomeProductDetail({ ...nextP, img: nextP.img.replace('../', '') }, productListContext);
        };
    }

    // Show Overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Event: Close
    const closeBtn = document.getElementById('closeProductDetail');
    const hideModal = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    };
    if(closeBtn) closeBtn.onclick = hideModal;
    overlay.onclick = (e) => { if (e.target === overlay) hideModal(); };

    // Event: Quantity
    const updateTotal = () => {
        const qty = parseInt(qtyInput.value);
        const total = product.price * qty;
        totalPrice.innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
    };

    const minusBtn = document.querySelector('.qty-btn.minus');
    if(minusBtn) minusBtn.onclick = () => {
        if (qtyInput.value > 1) {
            qtyInput.value--;
            updateTotal();
        }
    };
    
    const plusBtn = document.querySelector('.qty-btn.plus');
    if(plusBtn) plusBtn.onclick = () => {
        qtyInput.value++;
        updateTotal();
    };
    
    if(qtyInput) qtyInput.onchange = () => {
        if (qtyInput.value < 1) qtyInput.value = 1;
        updateTotal();
    };

    // Event: Size Selector
    setupHomeCustomSelect(product);

    // Event: Add to Cart
    if(addToCartBtn) {
        addToCartBtn.onclick = () => {
            const size = sizeSelected.innerText;
            const qty = parseInt(qtyInput.value);
            
            window.addToCart(product, qty, size);
            
            if (window.updateHeaderCounts) window.updateHeaderCounts();
            
            hideModal();
            const cartOverlay = document.getElementById('cartOverlay');
            const cartSidebar = document.getElementById('cartSidebar');
            cartOverlay?.classList.add('open');
            cartSidebar?.classList.add('open');
        };
    }

    // Event: Favorite Toggle
    const favBtn = document.getElementById('addToFavorite');
    if(favBtn) {
        const favIcon = favBtn.querySelector('i');
        
        let saved = JSON.parse(localStorage.getItem('savedProducts')) || [];
        if (saved.some(s => s.id === product.id)) {
            favIcon.classList.replace('far', 'fas');
            favIcon.classList.add('active');
        } else {
            favIcon.classList.replace('fas', 'far');
            favIcon.classList.remove('active');
        }

        favBtn.onclick = () => {
            const isFav = favIcon.classList.toggle('fas');
            favIcon.classList.toggle('far', !isFav);
            favIcon.classList.toggle('active', isFav);

            let savedList = JSON.parse(localStorage.getItem('savedProducts')) || [];
            if (isFav) {
                if (!savedList.find(s => s.id === product.id)) {
                    savedList.push(product);
                }
            } else {
                savedList = savedList.filter(s => s.id !== product.id);
            }
            localStorage.setItem('savedProducts', JSON.stringify(savedList));
            if (window.updateHeaderCounts) window.updateHeaderCounts();
        };
    }

    // Event: Zoom
    const zoomBtn = document.querySelector('.zoom-btn');
    if(zoomBtn) {
        zoomBtn.onclick = () => {
            const currentScale = img.style.transform || "scale(1)";
            if (currentScale === "scale(1)" || currentScale === "") {
                img.style.transform = "scale(1.5)";
                img.style.cursor = "zoom-out";
            } else {
                img.style.transform = "scale(1)";
                img.style.cursor = "zoom-in";
            }
        };
    }
}

function setupHomeCustomSelect(product) {
    const selElmnt = document.getElementById('sizeSelector');
    if(!selElmnt) return;
    const selected = selElmnt.querySelector('.select-selected');
    const items = selElmnt.querySelector('.select-items');
    const addToCartBtn = document.getElementById('modalAddToCart');

    // Toggle dropdown
    selected.onclick = (e) => {
        e.stopPropagation();
        closeAllHomeSelect(selected);
        items.classList.toggle('select-hide');
        selected.classList.toggle('select-arrow-active');
    };

    // Handle item click
    const optionDivs = items.querySelectorAll('div');
    optionDivs.forEach(div => {
        div.onclick = function() {
            selected.innerText = this.innerText;
            selected.classList.add('selected');
            if(addToCartBtn) {
                addToCartBtn.classList.add('active');
                addToCartBtn.disabled = false;
            }
            
            optionDivs.forEach(d => d.classList.remove('same-as-selected'));
            this.classList.add('same-as-selected');
            
            items.classList.add('select-hide');
            selected.classList.remove('select-arrow-active');
        };
    });
}

function closeAllHomeSelect(elmnt) {
    const items = document.querySelectorAll('.select-items');
    const selected = document.querySelectorAll('.select-selected');
    for (let i = 0; i < selected.length; i++) {
        if (elmnt == selected[i]) continue;
        selected[i].classList.remove('select-arrow-active');
    }
    for (let i = 0; i < items.length; i++) {
        items[i].classList.add('select-hide');
    }
}

document.addEventListener('click', () => closeAllHomeSelect());

// Khởi chạy khi script đã tải
document.addEventListener('DOMContentLoaded', initIndex);
