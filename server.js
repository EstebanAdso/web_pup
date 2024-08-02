import express from 'express';                                                                  //importamos express para crear un servidor web
import { getDataFromWebPage } from './index.js';                                                //importamos la funcion de index.js

const app = express();
const port = process.env.PORT || 3000;


app.use(express.static('.'));                                                                   // Middleware de Express para servir archivos estáticos desde el directorio actual ('.')

app.post('/generate-sql-script', async (req, res) => {                                          // Define una ruta POST en '/generate-sql-script' que manejará solicitudes para generar un script SQL 
    try {
        console.log("Iniciando generación de script SQL...");
        const result = await getDataFromWebPage();                                              // Llama a la función 'getDataFromWebPage' y espera a que se resuelva
        console.log("Resultado de getDataFromWebPage:", result);
        if (result.success) {                                                                          
            res.setHeader('Content-Disposition', 'attachment; filename="versionesSql.sql"');    // Configura los encabezados de la respuesta para que el archivo se descargue como 'versionesSql.sql'
            res.setHeader('Content-Type', 'text/plain');
            res.send(result.script);                                                            // Envía el script SQL como respuesta
        } else {                                                                                // Si la llamada no fue exitosa, responde con un estado 500 (error interno del servidor) y el resultado en formato JSON
            res.status(500).json(result);                                                       
        }
    } catch (error) {
        console.error("Error en /generate-sql-script:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {                                                                        // Inicia el servidor en el puerto especificado
    console.log(`Server running at http://localhost:${port}`);
});
