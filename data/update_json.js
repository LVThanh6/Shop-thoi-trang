const fs = require('fs');
const path = require('path');

// Ðu?ng d?n d?n thu m?c data c?a b?n
const dataDir = 'c:\\HeThongWeb\\Shop th?i trang nam\\Shop-thoi-trang\\data';

const mappings = {
    'perfumes.json': 'Nu?c Hoa',
    'pants.json': 'Qu?n',
    'shoes.json': 'Giày',
    'caps.json': 'Mu Nam',
    'accessories.json': 'Ph? Ki?n Nam',
    'vests.json': 'Vest',
    'watches.json': 'Ð?ng H?'
};

Object.entries(mappings).forEach(([jsonFile, folderName]) => {
    const jsonPath = path.join(dataDir, jsonFile);
    const folderPath = path.join(dataDir, folderName);

    // Ki?m tra file JSON có t?n t?i không
    if (!fs.existsSync(jsonPath)) return;

    // Ð?c n?i dung file JSON
    let jsonContent;
    try {
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        jsonContent = JSON.parse(rawData);
    } catch (e) {
        console.error(`L?i khi d?c file ${jsonFile}:`, e.message);
        return;
    }

    if (!Array.isArray(jsonContent) || jsonContent.length === 0) return;

    const referencedImages = new Set();
    let maxIdNum = 0;
    let idPrefix = 'XXX';
    const templateTags = jsonContent[0].tags;

    // Quét d? li?u hi?n t?i d? tìm ID l?n nh?t và các ?nh dã dùng
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

    // Quét thu m?c ?nh
    let added = 0;
    if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];

        files.forEach(file => {
            if (imageExtensions.includes(path.extname(file).toLowerCase())) {
                if (!referencedImages.has(file)) {
                    maxIdNum++;
                    // T?o ID m?i (ví d?: G011)
                    const newId = `${idPrefix}${String(maxIdNum).padStart(3, '0')}`;

                    const newItem = {
                        id: newId,
                        name: `S?n ph?m ${folderName} ${maxIdNum}`,
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

    // N?u có thêm m?i thì luu l?i file
    if (added > 0) {
        fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 4), 'utf8');
        console.log(`? Ðã c?p nh?t ${jsonFile}: Thêm ${added} s?n ph?m m?i.`);
    }
});
