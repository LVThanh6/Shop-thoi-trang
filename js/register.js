document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.querySelector('.register-form');

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Ngăn form gửi đi (vì mình làm demo bằng LocalStorage)

        // 1. Lấy dữ liệu từ các ID bạn đã đặt
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 2. Kiểm tra mật khẩu nhập lại có khớp không
        if (password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!");
            return;
        }

        // 3. Lấy danh sách tài khoản hiện có từ LocalStorage
        const listUser = JSON.parse(localStorage.getItem('listUser')) || [];

        // 4. Kiểm tra xem email này đã có ai đăng ký chưa
        const isExisted = listUser.some(user => user.email === email);
        if (isExisted) {
            alert("Email này đã được sử dụng. Vui lòng dùng email khác!");
            return;
        }

        // 5. Thêm tài khoản mới vào danh sách
        listUser.push({
            email: email,
            password: password
        });

        // 6. Lưu lại vào LocalStorage
        localStorage.setItem('listUser', JSON.stringify(listUser));

        alert("Đăng ký tài khoản thành công! Bạn sẽ được chuyển đến trang đăng nhập.");

        // 7. Chuyển hướng sang trang đăng nhập
        window.location.href = "../html/dangNhap.html";
    });
});