// Đợi cho nội dung DOM được tải xong mới thực thi
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggle-password-btn');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    const toggleText = document.getElementById('toggle-text');
    let isPasswordVisible = false;

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();

            isPasswordVisible = !isPasswordVisible;

            if (isPasswordVisible) {
                // Show password
                passwordInput.type = 'text';
                eyeIcon.src = '../assets/img/dangnhapimg/eye-open.svg';
                toggleText.textContent = 'Hiện';
                toggleBtn.classList.add('active');
            } else {
                // Hide password
                passwordInput.type = 'password';
                eyeIcon.src = '../assets/img/dangnhapimg/eye-closed.svg';
                toggleText.textContent = 'Ẩn';
                toggleBtn.classList.remove('active');
            }
        });
    }
});