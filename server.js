import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDataFromWebPage } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('.'));

app.post('/generate-sql-script', async (req, res) => {
    try {
        console.log("Iniciando generación de script SQL...");
        const result = await getDataFromWebPage();
        console.log("Resultado de getDataFromWebPage:", result);
        if (result.success) {
            res.setHeader('Content-Disposition', 'attachment; filename="versionesSql.sql"');
            res.setHeader('Content-Type', 'text/plain');
            res.send(result.script);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error("Error en /generate-sql-script:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
