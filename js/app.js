/**
 * app.js - Trang chủ (index.html)
 */

let allHomeProducts = [];
let trendingProducts = [];
let newProducts = [];
let displayedNewCount = 4;

async function initIndex() {
    // HTML components được nhúng thủ công trực tiếp vào index.html

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
        card.className = 'col';
        
        // Sửa đường dẫn linh hoạt
        const imgSrc = window.fixPath(p.img);
        
        card.innerHTML = `
            <div class="card h-100 border-0 shadow-sm product-card">
                <div class="position-relative overflow-hidden">
                    <img src="${imgSrc}" class="card-img-top" alt="${p.name}" onerror="this.src='img/no-img.jpg'; this.onerror=null;" style="aspect-ratio: 1/1; object-fit: cover; transition: transform 0.4s ease;">
                    <button class="quick-add-btn btn btn-dark position-absolute bottom-0 end-0 m-3 shadow" title="Thêm nhanh vào giỏ" style="border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; z-index: 2;">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
                <div class="card-body p-3">
                    <h5 class="card-title product-name mb-1" title="${p.name}" style="font-size: 1rem; font-weight: 500; height: 3rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${p.name}</h5>
                    <p class="card-text product-price fw-bold mb-0" style="font-size: 1.1rem; color: #111;">${price}</p>
                </div>
            </div>
        `;

        card.onclick = (e) => {
            if (e.target.closest('.quick-add-btn')) return;
            showHomeProductDetail({ ...p, img: imgSrc }, [...trendingProducts, ...newProducts]); 
        };

        const quickAddBtn = card.querySelector('.quick-add-btn');
        quickAddBtn.onclick = (e) => {
            e.stopPropagation();
            // Nếu là quần áo thì mặc định size M, ngược lại để trống size
            const defaultSize = window.productNeedsSize(p) ? "M" : "";
            if (window.addToCart) window.addToCart({ ...p, img: imgSrc }, 1, defaultSize);
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


// Modal Chi tiết sản phẩm
function showHomeProductDetail(product, productListContext) {
    const modalEl = document.getElementById('productDetailModal');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    // Populate Data
    const img = document.getElementById('modalProductImg');
    const name = document.getElementById('modalProductName');
    const price = document.getElementById('modalProductPrice');
    const desc = document.getElementById('modalProductDesc');
    const qtyInput = document.getElementById('modalProductQty');
    const totalPrice = document.getElementById('modalTotalPrice');
    const addToCartBtn = document.getElementById('modalAddToCart');
    const sizeSelector = document.getElementById('sizeSelector');
    const sizeRow = document.getElementById('sizeSelectorRow');

    img.src = window.fixPath(product.img);
    name.innerText = product.name;
    const breadcrumb = document.querySelector('.product-breadcrumb');
    if(breadcrumb) breadcrumb.innerText = product.name;
    
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
    price.innerText = formattedPrice;
    desc.innerText = product.description || "Sản phẩm chất lượng cao, thiết kế hiện đại, phù hợp với nhiều phong cách thời trang nam.";
    qtyInput.value = 1;
    totalPrice.innerText = formattedPrice;

    // Reset size selector
    if (window.productNeedsSize(product)) {
        if(sizeRow) sizeRow.classList.remove('d-none');
        if(sizeSelector) {
            sizeSelector.value = "";
        }
        if(addToCartBtn) {
            addToCartBtn.disabled = true;
        }
    } else {
        if(sizeRow) sizeRow.classList.add('d-none');
        if(addToCartBtn) {
            addToCartBtn.disabled = false;
        }
    }

    if(sizeSelector) {
        sizeSelector.onchange = () => {
            if(sizeSelector.value) {
                addToCartBtn.disabled = false;
            }
        };
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
            if(prevP) showHomeProductDetail(prevP, productListContext); 
        };
    }

    if (nextBtn) {
        nextBtn.style.display = currentIndex < productListContext.length - 1 ? 'block' : 'none';
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            let nextP = productListContext[currentIndex + 1];
            if(nextP) showHomeProductDetail(nextP, productListContext);
        };
    }

    // Show Modal
    modal.show();

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

    // Event: Add to Cart
    if(addToCartBtn) {
        addToCartBtn.onclick = () => {
            const size = sizeSelector ? sizeSelector.value : "";
            const qty = parseInt(qtyInput.value);
            
            window.addToCart(product, qty, size);
            
            if (window.updateHeaderCounts) window.updateHeaderCounts();
            
            modal.hide();
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

// Khởi chạy khi script đã tải
document.addEventListener('DOMContentLoaded', initIndex);
