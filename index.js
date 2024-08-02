import puppeteer from "puppeteer";                                                               //importa puppeteer para scrapear la pagina.

export async function getDataFromWebPage() {
    let browser;
    try {
        console.log("Iniciando el navegador...");
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 400
        });
        const page = await browser.newPage();
        console.log("Navegando a la página...");
        await page.goto('https://www.sqlserverversions.com/', { waitUntil: 'networkidle0' });

        console.log("Ejecutando script en la página...");
        const data = await page.evaluate(() => {
            console.log("Dentro de page.evaluate...");
            const tables = document.querySelectorAll('div.oxa');
            let versionsData = {};

            const versionMapping = {
                1: '2022',
                2: '2019',
                3: '2017',
                4: '2016',
                5: '2014'
            };

            tables.forEach((table, index) => {
                if (index >= 1 && index <= 5) {
                    const versionYear = versionMapping[index];
                    let data = [];
                    let stopConditionMet = false;

                    const rows = table.querySelectorAll('table.tbl tbody tr');
                    rows.forEach(row => {
                        if (stopConditionMet) return;

                        const columns = row.querySelectorAll('td');
                        if (columns.length >= 7) {
                            const build = columns[0].innerText;
                            const fileVersion = columns[2].innerText;
                            let kbDescription = columns[5].innerText.replace(/'/g, "''");
                            const releaseDate = columns[6].querySelector('time') ? columns[6].querySelector('time').innerText : columns[6].innerText;

                            data.push({
                                build: build,
                                fileVersion: fileVersion,
                                kbDescription: kbDescription,
                                releaseDate: releaseDate
                            });

                            if ((index === 1 && build === '16.0.100.4') ||
                                (index === 2 && build === '15.0.1000.34') ||
                                (index === 3 && build === '14.0.1.246') ||
                                (index === 4 && build === '13.0.200.172') ||
                                (index === 5 && build === '11.0.9120.0')) {
                                stopConditionMet = true;
                                return;
                            }
                        }
                    });

                    versionsData[versionYear] = data;
                }
            });

            console.log("Datos recolectados:", JSON.stringify(versionsData));
            return versionsData;
        });

        console.log("Datos obtenidos de la página:", data);

        if (!data || Object.keys(data).length === 0) {
            throw new Error("No se obtuvieron datos de la página");
        }

        await browser.close();

        let fullSqlScript = "USE VersionSql;\n\n";
        fullSqlScript += `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='versionesSql' AND xtype='U')
            BEGIN
            CREATE TABLE versionesSql (
                anio VARCHAR(4),
                build VARCHAR(255),
                file_version VARCHAR(255),
                description VARCHAR(MAX),
                release_date DATE
            );
            END;\n\n`;

        for (const [versionYear, results] of Object.entries(data)) {
            results.forEach(row => {
                fullSqlScript += `IF NOT EXISTS (SELECT * FROM versionesSql WHERE build = '${row.build}')
            BEGIN
                INSERT INTO versionesSql (anio, build, file_version, description, release_date)
                VALUES ('${versionYear}', '${row.build}', '${row.fileVersion}', '${row.kbDescription}', '${row.releaseDate}');
            END
            ELSE
            BEGIN
                UPDATE versionesSql
                SET anio = '${versionYear}',
                    file_version = '${row.fileVersion}',
                    description = '${row.kbDescription}',
                    release_date = '${row.releaseDate}'
                WHERE build = '${row.build}';
            END;\n\n`;
            });
        }

        console.log('Full SQL script generated successfully.');
        return { success: true, message: 'SQL script generated successfully', script: fullSqlScript };
    } catch (error) {
        console.error("Error en getDataFromWebPage:", error);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
// Si este módulo se está ejecutando directamente, llama a getDataFromWebPage y muestra el resultado
if (import.meta.url === `file://${process.argv[1]}`) {
    getDataFromWebPage().then(result => console.log(result));
}
