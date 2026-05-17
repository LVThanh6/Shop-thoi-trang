// js/login.js
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const pass = document.getElementById('password').value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Địa chỉ email không đúng định dạng. Vui lòng kiểm tra lại!");
                return;
            }

            const listUser = JSON.parse(localStorage.getItem('listUser')) || [];

            const userExists = listUser.find(u => u.email === email);

            if (!userExists) {
                alert("Tài khoản này chưa tồn tại. Vui lòng đăng ký!");
                return;
            }

            if (userExists.password === pass) {
                sessionStorage.setItem('isLoggedIn', 'true');
                const displayName = email.split('@')[0];
                sessionStorage.setItem('currentUser', displayName);
                alert("Đăng nhập thành công!");
                window.location.href = "../index.html";
            } else {
                alert("Mật khẩu không chính xác. Vui lòng thử lại!");
            }
        });
    }
});
