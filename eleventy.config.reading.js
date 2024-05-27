export function pluginReading(eleventyConfig) {
    eleventyConfig.addFilter("readingSorted", (readingObj) => {
        // return readingObj.sort((a, b) => a.dateRead.localeCompare(b.dateRead));
        return readingObj
    });
}