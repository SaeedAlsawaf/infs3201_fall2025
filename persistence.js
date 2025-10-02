/*  Saeed Al Sawaff - 60103929
    INFS3201 - Web Technologies 2 - Assignment 2
    Persistence Layer: All File/Data Access is in this layer
*/

const fs = require("fs/promises")

/**
 * Writes JavaScript data to a JSON file with pretty formatting.
 *
 * @param {string} fileName - The name of the file to write to.
 * @param {any} data - The data to be saved as JSON.
 * @returns {Promise<void>} - Resolves when the file has been written.
 */

async function writeJson(fileName, data) {
    await fs.writeFile(fileName, JSON.stringify(data, null, 2))
}

/**
 * Reads a JSON file and parses its content into a JavaScript object.
 *
 * @param {string} fileName - The name of the JSON file to read.
 * @returns {Promise<any>} - Resolves with the parsed data from the file.
 */

async function readJson(fileName) {
    let data = await fs.readFile(fileName, "utf-8")
    return JSON.parse(data)
}

module.exports = { writeJson, readJson }