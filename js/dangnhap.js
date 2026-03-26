// Đợi cho nội dung DOM được tải xong mới thực thi
document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');
    const toggleIcon = togglePassword.querySelector('img');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            // Kiểm tra kiểu hiện tại của input
            const isPassword = passwordInput.getAttribute('type') === 'password';

            // Thay đổi qua lại giữa 'text' và 'password'
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

            // Thay đổi icon (Nếu bạn có file icon ẩn mật khẩu)
            // Giả sử bạn có file: see.svg (hiện) và hide.svg (ẩn)
            /*
            if (isPassword) {
                toggleIcon.src = '../assets/img/dangnhapimg/hide.svg'; 
            } else {
                toggleIcon.src = '../assets/img/dangnhapimg/see.svg';
            }
            */
        });
    }
});