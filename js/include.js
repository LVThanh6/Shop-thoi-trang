// Viết hàm dùng chung để tái sử dụng
function loadComponent(id, path) {
    const element = document.getElementById(id);
    if (!element) return; // Nếu không thấy ID trên trang thì không chạy nữa

    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error("Lỗi tải file: " + path);
            return response.text();
        })
        .then(data => {
            element.innerHTML = data;
        })
        .catch(error => console.error(error));
}

// Bọc trong DOMContentLoaded để đảm bảo an toàn trên Server/Vercel
document.addEventListener("DOMContentLoaded", () => {
    loadComponent('header-placeholder', '../html/header.html');
    loadComponent('main-placeholder', '../html/trangchu.html');
    loadComponent('footer-placeholder', '../html/footer.html');
});