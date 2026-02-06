import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const { file } = req.query;

    if (!file) {
        return res.status(400).json({ error: 'File parameter required' });
    }

    const filePath = path.join(process.cwd(), 'html', `${file}.html`);

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(content);
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
}
