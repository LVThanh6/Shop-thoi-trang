document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.querySelector('.register-form');

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();


        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Địa chỉ email không đúng định dạng. Vui lòng kiểm tra lại!");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert("Mật khẩu phải tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số!");
            return;
        }


        if (password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!");
            return;
        }


        const listUser = JSON.parse(localStorage.getItem('listUser')) || [];


        const isExisted = listUser.some(user => user.email === email);
        if (isExisted) {
            alert("Email này đã được sử dụng. Vui lòng dùng email khác!");
            return;
        }


        listUser.push({
            email: email,
            password: password
        });


        localStorage.setItem('listUser', JSON.stringify(listUser));

        alert("Đăng ký tài khoản thành công! Bạn sẽ được chuyển đến trang đăng nhập.");


        window.location.href = "../html/dangNhap.html";
    });
});
