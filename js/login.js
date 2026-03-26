// js/login.js
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Chặn load lại trang

        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;

        // 1. Lấy danh sách tài khoản từ localStorage
        const listUser = JSON.parse(localStorage.getItem('listUser')) || [];

        // 2. Tìm tài khoản trùng khớp
        const user = listUser.find(u => u.email === email && u.password === pass);

        if (user) {
            // Lưu trạng thái đăng nhập
            sessionStorage.setItem('isLoggedIn', 'true');
            // Lấy phần tên trước dấu @ để hiển thị (ví dụ: "admin" từ admin@gmail.com)
            const displayName = email.split('@')[0];
            sessionStorage.setItem('currentUser', displayName);

            alert("Đăng nhập thành công!");
            window.location.href = "../index.html"; // Quay về trang chủ
        } else {
            alert("Email hoặc mật khẩu không chính xác!");
        }
    });
});