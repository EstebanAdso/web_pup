npm init -y -- para inicializar el servidor nodeJs
npm i express --para instalar express
En el package.json usar "type": "module",
npm install -- en caso de instalar todas las dependencias de esta forma




Axios
Axios es una biblioteca de JavaScript utilizada para hacer solicitudes HTTP desde el navegador o Node.js,
facilitando la comunicación con servidores y el manejo de respuestas.
Es una biblioteca de promesas para realizar solicitudes HTTP en Node.js y en el navegador.
 En este caso, se utiliza para obtener el HTML de la página web de la URL proporcionada (https://www.sqlserverversions.com/).


 Axios
Uso en el proyecto:
Axios se utilizó en el archivo HTML para hacer una solicitud POST desde el frontend al backend. Cuando el usuario hace clic en el botón
 para generar el script SQL, Axios envía una solicitud al servidor Express para que ejecute la función de Puppeteer y retorne el script generado.


Cheerio:
Es una biblioteca que proporciona una implementación ligera de jQuery para el servidor, lo que permite manipular
y analizar HTML en Node.js. En este código, Cheerio se utiliza para cargar y analizar el HTML obtenido por Axios
y extraer los datos necesarios.

Express
Express es un framework web de Node.js minimalista y flexible, que proporciona un 
conjunto robusto de características para crear aplicaciones web y APIs, manejando rutas,
 middleware, y solicitudes HTTP.

 Express
Uso en el proyecto:
Express se utilizó para crear el servidor web que maneja las solicitudes HTTP. En server.js, se configura una ruta POST (/generate-sql-script)
 que, al recibir una solicitud, llama a la función getDataFromWebPage y devuelve el script SQL generado como respuesta.