// js/auth.js
function checkAndDisplayUser() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    let currentUser = sessionStorage.getItem('currentUser');

    if (isLoggedIn === 'true' && currentUser) {
        // Lọc bỏ chữ số như bạn yêu cầu
        const nameOnly = currentUser.replace(/\d/g, '');
        const formattedName = nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1);

        const userNameDisplay = document.getElementById('userNameDisplay');
        const accountLink = document.getElementById('accountLink');

        if (userNameDisplay) {
            userNameDisplay.innerText = "Hi, " + (formattedName || "User");

            // Xử lý nút Logout
            if (accountLink) {
                accountLink.href = "#";
                accountLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (confirm("Bạn có muốn đăng xuất không?")) {
                        sessionStorage.clear();
                        window.location.reload();
                    }
                });
            }
        } else {
            // Nếu chưa tìm thấy ID (do header chưa load xong), thử lại sau 100ms
            setTimeout(checkAndDisplayUser, 100);
        }
    }
}

// Hàm toggle mật khẩu cho trang đăng nhập
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    const toggleText = document.getElementById('toggle-text');

    if (passwordInput && eyeIcon && toggleText) {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        eyeIcon.src = isPassword ? '../assets/img/dangnhapimg/eye-open.svg' : '../assets/img/dangnhapimg/eye-closed.svg';
        toggleText.textContent = isPassword ? 'Hiện' : 'Ẩn';
    }
}

// Thêm event listener cho nút toggle khi DOM load xong
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggle-password-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePasswordVisibility);
    }
    checkAndDisplayUser();
});