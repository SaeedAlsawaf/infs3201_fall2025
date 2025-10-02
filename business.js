/*  Saeed Al Sawaff - 60103929
    INFS3201 - Web Technologies 2 - Assignment 2
    Business Layer: All functions that have anything to do with the business logic
*/

const persistence = require("./persistence")


async function login(username, password) {
    let allUsers = await persistence.readJson("users.json")
    for (let u of allUsers) {
        if (u.username === username && u.password === password) {
            return u
        }
    }
    return null
}


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
