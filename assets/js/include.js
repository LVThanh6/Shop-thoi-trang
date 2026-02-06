document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header-placeholder", "/api/html?file=header");
    loadComponent("main-placeholder", "/api/html?file=trangchu");
    loadComponent("footer-placeholder", "/api/html?file=footer");
});

function loadComponent(id, path) {
    fetch(path)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${path}`);
            }
            return res.text();
        })
        .then(html => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = html;
            } else {
                console.error(`Không tìm thấy element #${id}`);
            }
        })
        .catch(err => console.error("Load component lỗi:", err.message));
}
