/*  Saeed Al Sawaff - 60103929
    INFS3201 - Web Technologies 2 - Assignment 2
    Business Layer: All functions that have anything to do with the business logic
*/

const persistence = require("./persistence")

/**
 * Logs in a user by checking if the provided username and password match any user in the database.
 *
 * @param {string} username - The username of the user trying to log in.
 * @param {string} password - The password of the user trying to log in.
 * @returns {Promise<Object|null>} - Returns the user object if credentials match, otherwise returns null.
 */

async function login(username, password) {
    let allUsers = await persistence.readJson("users.json")
    for (let u of allUsers) {
        if (u.username === username && u.password === password) {
            return u
        }
    }
    return null
}

/**
 * Finds a photo by its ID and checks if the logged-in user has permission to view it.
 *
 * @param {string} photoId - The ID of the photo to find.
 * @param {string} loggedInUserId - The ID of the user trying to access the photo.
 * @returns {Promise<Object>} - Returns an object with a `found` flag and either a `photo` object or a `reason` for failure.
 *   - `{ found: true, photo: Object }` if the photo is found and the user has access.
 *   - `{ found: false, reason: 'accessDenied' }` if the user does not own the photo.
 *   - `{ found: false, reason: 'notFound' }` if the photo with the given ID does not exist.
 */
async function findPhoto(photoId, loggedInUserId) {
    let allPhotos = await persistence.readJson("photos.json")
    for (let photo of allPhotos) {
        if (photo.id == photoId) {
            if (photo.owner !== loggedInUserId) {
                return { found: false, reason: "accessDenied" }
            }
            return { found: true, photo: photo }
        }
    }
    return { found: false, reason: "notFound" }
}

/**
 * Retrieves detailed information about a photo, including its albums and other metadata, if the user has permission to view it.
 *
 * @param {string} photoId - The ID of the photo to show details for.
 * @param {string} loggedInUserId - The ID of the user requesting the photo details.
 * @returns {Promise<Object>} - Returns an object with the photo's details or a failure reason.
 *   - `{ found: true, filename: string, title: string, date: string, albums: string, tags: Array }` if the photo is found and the user has access.
 *   - `{ found: false, reason: 'accessDenied' }` or `{ found: false, reason: 'notFound' }` if the photo is not found or the user does not have access.
 */

async function showDetails(photoId, loggedInUserId) {
    let result = await findPhoto(photoId, loggedInUserId)
    if (!result.found) return result

    let targetPhoto = result.photo
    let allAlbums = await persistence.readJson("albums.json")

    let photoAlbums = ""
    for (let albumId of targetPhoto.albums) {
        for (let a of allAlbums) {
            if (a.id == albumId)
                photoAlbums = photoAlbums + a.name + " "
        }
    }

    return {
        found: true,
        filename: targetPhoto.filename,
        title: targetPhoto.title,
        date: new Date(targetPhoto.date).toDateString(),
        albums: photoAlbums,
        tags: targetPhoto.tags
    }
}

/**
 * Updates the title and/or description of a photo if the logged-in user is the owner of the photo.
 *
 * @param {string} photoId - The ID of the photo to update.
 * @param {string} newTitle - The new title for the photo (optional).
 * @param {string} newDescription - The new description for the photo (optional).
 * @param {string} loggedInUserId - The ID of the user requesting the update.
 * @returns {Promise<Object>} - Returns an object with the update status.
 *   - `{ found: true, updated: true }` if the photo is updated successfully.
 *   - `{ found: true, updated: false }` if no changes were made (no new title or description).
 *   - `{ found: false, reason: 'notFound' }` if the photo is not found.
 *   - `{ found: false, reason: 'accessDenied' }` if the user does not own the photo.
 */

async function updatePhoto(photoId, newTitle, newDescription, loggedInUserId) {
    let allPhotos = await persistence.readJson("photos.json")
    let photoToUpdate = null
    for (let photo of allPhotos) {
        if (photo.id == photoId) {
            photoToUpdate = photo
            break
        }
    }

    if (!photoToUpdate) return { found: false, reason: "notFound" }
    if (photoToUpdate.owner !== loggedInUserId)
        return { found: false, reason: "accessDenied" }

    if (newTitle || newDescription) {
        if (newTitle) photoToUpdate.title = newTitle
        if (newDescription) photoToUpdate.description = newDescription
        await persistence.writeJson("photos.json", allPhotos)
        return { found: true, updated: true }
    }
    return { found: true, updated: false }
}

/**
 * Retrieves a list of photos belonging to a specified album for the logged-in user.
 *
 * @param {string} albumTitle - The title of the album to search for.
 * @param {string} loggedInUserId - The ID of the user requesting the album list.
 * @returns {Promise<Object>} - Returns an object with the result.
 *   - `{ found: true, rows: string[] }` where each row contains photo filename, resolution, and tags separated by commas.
 *   - `{ found: false }` if the album with the given title does not exist.
 */

async function albumList(albumTitle, loggedInUserId) {
    let allPhotos = await persistence.readJson("photos.json")
    let allAlbums = await persistence.readJson("albums.json")

    let albumId = null
    for (let album of allAlbums) {
        if (album.name.toLowerCase() == albumTitle.toLowerCase()) {
            albumId = album.id
            break
        }
    }

    if (!albumId) return { found: false }

    let rows = []
    for (let photo of allPhotos) {
        if (photo.owner !== loggedInUserId) continue
        for (let id of photo.albums) {
            if (id == albumId) {
                rows.push(
                    photo.filename + "," + photo.resolution + "," + photo.tags.join(":")
                )
            }
        }
    }

    return { found: true, rows }
}

/**
 * Adds a new tag to a photo if the logged-in user is the owner and the tag is not already present.
 *
 * @param {string} photoId - The ID of the photo to tag.
 * @param {string} tag - The tag to add to the photo.
 * @param {string} loggedInUserId - The ID of the user adding the tag.
 * @returns {Promise<Object>} - Returns an object describing the result:
 *   - `{ found: true, added: true }` if the tag was successfully added.
 *   - `{ found: true, added: false, reason: 'duplicate' }` if the tag already exists on the photo.
 *   - `{ found: false, reason: 'notFound' }` if the photo does not exist.
 *   - `{ found: false, reason: 'accessDenied' }` if the user does not own the photo.
 */

async function tagPhoto(photoId, tag, loggedInUserId) {
    let allPhotos = await persistence.readJson("photos.json")
    let photoToTag = null
    for (let photo of allPhotos) {
        if (photo.id == photoId) {
            photoToTag = photo
            break
        }
    }

    if (!photoToTag) return { found: false, reason: "notFound" }
    if (photoToTag.owner !== loggedInUserId)
        return { found: false, reason: "accessDenied" }

    for (let t of photoToTag.tags) {
        if (t == tag) return { found: true, added: false, reason: "duplicate" }
    }

    photoToTag.tags.push(tag)
    await persistence.writeJson("photos.json", allPhotos)
    return { found: true, added: true }
}


module.exports = { login, showDetails, updatePhoto, albumList, tagPhoto }
