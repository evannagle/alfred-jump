const fs = require('fs');

const { exec } = require('child_process');


/**
 * Get autojump directories that match a query
 * 
 * @param {string} query The query to search for
 * @returns  A promise that resolves to an array of directories
 */
function getAutojumps(autojump_bin, query) {
    return new Promise((resolve, reject) => {
        exec(`${autojump_bin} --complete ${query}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            const directories = stdout.trim().split('\n');
            resolve(directories);
        });
    });
}

/**
 * Format autojump results to Alfred Script Filter JSON Format
 * 
 * @param {*} autojumpResults 
 * @returns An array of formatted results. 
 * If a result from autojump does not exist, it will be null.
 * 
 * @link [Script Filter JSON Format - Alfred Help and Support](https://www.alfredapp.com/help/workflows/inputs/script-filter/json/)
 */
function formatAutojumpResults(autojumpResults) {
    const splitRegex = new RegExp(`__\\d+__`); // Match "__<number>__"

    return autojumpResults.map(path => {
        const [_, formattedPath] = path.split(splitRegex);

        const relname = formattedPath.split('/').pop();

        if (!fs.existsSync(formattedPath)) return null;

        return {
            uid: formattedPath,
            title: relname,
            subtitle: formattedPath,
            arg: formattedPath,
            icon: {
                path: `./src/svg/folder.svg`
            }
        };
    });
}

/**
 * Filter autojump results to unique results
 *  
 * @param {*} autojumpResults The results from autojump to filter
 * @returns An array of unique results, with no duplicates and no null values
 */
function filterAutojumpResultsToUnique(autojumpResults) {
    const uniqueResults = [];
    const seen = new Set();

    autojumpResults.forEach(result => {
        if (!result || !result.uid || seen.has(result.uid)) return;
        seen.add(result.uid);
        uniqueResults.push(result);
    });

    return uniqueResults;
}

/**
 * Main function for the script
 */
function main() {
    const args = process.argv.slice(2);
    const query = args[0];
    const autojump_bin = args[1];

    getAutojumps(autojump_bin, query).then((directories) => {
        const results = formatAutojumpResults(directories);
        const uniqueResults = filterAutojumpResultsToUnique(results);
        const data = {
            items: uniqueResults
        };
        console.log(JSON.stringify(data));
    }).catch((error) => {
        console.error(error);
    });
}

main();