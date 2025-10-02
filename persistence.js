/*  Saeed Al Sawaff - 60103929
    INFS3201 - Web Technologies 2 - Assignment 2
    Persistence Layer: All File/Data Access is in this layer
*/

const fs = require("fs/promises")

async function writeJson(fileName, data) {
    await fs.writeFile(fileName, JSON.stringify(data, null, 2))
}

async function readJson(fileName) {
    let data = await fs.readFile(fileName, "utf-8")
    return JSON.parse(data)
}

module.exports = { writeJson, readJson }