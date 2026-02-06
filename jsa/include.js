
function loadComponent(id, path) {
    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error("Không tìm thấy file: " + path);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error(error));
}

loadComponent('header-placeholder', 'html/header.html');
loadComponent('main-placeholder', 'html/trangchu.html');
loadComponent('footer-placeholder', 'html/footer.html');