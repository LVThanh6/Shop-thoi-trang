// js/anmk.js - Chức năng ẩn/hiện mật khẩu cho trang đăng nhập

document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggle-password-btn');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    const toggleText = document.getElementById('toggle-text');

    if (toggleBtn && passwordInput && eyeIcon && toggleText) {
        toggleBtn.addEventListener('click', function () {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            eyeIcon.src = isPassword ? '../img/dangnhapimg/eye-open.svg' : '../img/dangnhapimg/eye-closed.svg';
            toggleText.textContent = isPassword ? 'Hiện' : 'Ẩn';
        });
    }
});
