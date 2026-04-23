// js/login.js
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const pass = document.getElementById('password').value;

            // 1. Lấy danh sách tài khoản từ localStorage
            const listUser = JSON.parse(localStorage.getItem('listUser')) || [];

            // 2. Tìm xem email này có trong hệ thống chưa
            const userExists = listUser.find(u => u.email === email);

            if (!userExists) {
                // Trường hợp 1: Email chưa được đăng ký
                alert("Tài khoản này chưa tồn tại. Vui lòng đăng ký!");
                return; // Dừng xử lý
            }

            // 3. Nếu email tồn tại, kiểm tra mật khẩu
            if (userExists.password === pass) {
                // Đăng nhập thành công
                sessionStorage.setItem('isLoggedIn', 'true');

                // Lấy phần tên trước dấu @
                const displayName = email.split('@')[0];
                sessionStorage.setItem('currentUser', displayName);

                alert("Đăng nhập thành công!");
                window.location.href = "../index.html";
            } else {
                // Trường hợp 2: Có email nhưng sai mật khẩu
                alert("Mật khẩu không chính xác. Vui lòng thử lại!");
            }
        });
    }
});
