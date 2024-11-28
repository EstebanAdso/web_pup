import axios from 'axios';
import cheerio from 'cheerio';


export async function getDataFromWebPage() {
    try {
        // Obtener el HTML de la página web
        const { data } = await axios.get('https://www.sqlserverversions.com/');
        const $ = cheerio.load(data);
        
        // Analizar el HTML usando cheerio
        const tables = $('div.oxa');
        let versionsData = {};

        const versionMapping = {
            1: '2022',
            2: '2019',
            3: '2017',
            4: '2016',
            5: '2014'
        };

        tables.each((index, table) => {
            if (index >= 1 && index <= 5) {
                const versionYear = versionMapping[index];
                let data = [];
                let stopConditionMet = false;

                $(table).find('table.tbl tbody tr').each((_, row) => {
                    if (stopConditionMet) return;

                    const columns = $(row).find('td');
                    if (columns.length >= 7) {
                        const build = $(columns[0]).text();
                        const fileVersion = $(columns[2]).text();
                        let kbDescription = $(columns[5]).text().replace(/'/g, "''");
                        const releaseDate = $(columns[6]).find('time').length ? $(columns[6]).find('time').text() : $(columns[6]).text();

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

        console.log("Datos obtenidos de la página:", versionsData);

        // Construir el script SQL
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

        for (const [versionYear, results] of Object.entries(versionsData)) {
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
    }
}

