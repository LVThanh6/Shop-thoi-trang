const fs = require('fs');
const path = require('path');

// Đường dẫn đến thư mục data của bạn
const dataDir = 'c:\\HeThongWeb\\Shop thời trang nam\\Shop-thoi-trang\\data';

const mappings = {
    'perfumes.json': 'Nước Hoa',
    'pants.json': 'Quần',
    'shoes.json': 'Giày',
    'caps.json': 'Mũ Nam',
    'accessories.json': 'Phụ Kiện Nam',
    'vests.json': 'Vest',
    'watches.json': 'Đồng Hồ'
};

Object.entries(mappings).forEach(([jsonFile, folderName]) => {
    const jsonPath = path.join(dataDir, jsonFile);
    const folderPath = path.join(dataDir, folderName);

    // Kiểm tra file JSON có tồn tại không
    if (!fs.existsSync(jsonPath)) return;

    // Đọc nội dung file JSON
    let jsonContent;
    try {
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        jsonContent = JSON.parse(rawData);
    } catch (e) {
        console.error(`Lỗi khi đọc file ${jsonFile}:`, e.message);
        return;
    }

    if (!Array.isArray(jsonContent) || jsonContent.length === 0) return;

    const referencedImages = new Set();
    let maxIdNum = 0;
    let idPrefix = 'XXX';
    const templateTags = jsonContent[0].tags;

    // Quét dữ liệu hiện tại để tìm ID lớn nhất và các ảnh đã dùng
    jsonContent.forEach(item => {
        if (item.img) {
            referencedImages.add(path.basename(item.img));
        }

        const match = String(item.id).match(/^([A-Za-z]+)(\d+)$/);
        if (match) {
            idPrefix = match[1];
            const num = parseInt(match[2], 10);
            if (num > maxIdNum) maxIdNum = num;
        }
    });

    // Quét thư mục ảnh
    let added = 0;
    if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];

        files.forEach(file => {
            if (imageExtensions.includes(path.extname(file).toLowerCase())) {
                if (!referencedImages.has(file)) {
                    maxIdNum++;
                    // Tạo ID mới (ví dụ: G011)
                    const newId = `${idPrefix}${String(maxIdNum).padStart(3, '0')}`;

                    const newItem = {
                        id: newId,
                        name: `Sản phẩm ${folderName} ${maxIdNum}`,
                        price: 500000,
                        img: `../data/${folderName}/${file}`,
                        tags: templateTags
                    };

                    jsonContent.push(newItem);
                    added++;
                }
            }
        });
    }

    // Nếu có thêm mới thì lưu lại file
    if (added > 0) {
        fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 4), 'utf8');
        console.log(`✅ Đã cập nhật ${jsonFile}: Thêm ${added} sản phẩm mới.`);
    }
});