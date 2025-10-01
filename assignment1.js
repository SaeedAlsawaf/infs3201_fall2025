const fs = require("fs/promises")
const prompt = require("prompt-sync")()

/**
 * This is a simple function that takes a photoId as a parameter, and checks the json file to find a photo of that id.
 * If there is a photo with the given id, the function returns that specific photo, otherwise the function returns null.
 * 
 * @param {Number} photoId This is the specific ID, of which the photo needs to be found
 * @returns {Photo} photoToFind This is the photo which will be returned, if the photoId exists.
 */
async function findPhoto(photoId) {
    let photoFile = await fs.readFile("photos.json", "utf-8")
    let allPhotos = JSON.parse(photoFile)
    let photoToFind = null
    for (let photo of allPhotos) {
        if (photo.id == photoId) {
            photoToFind = photo
            break
        }
    }
    return photoToFind
}

/**
 * This is a function that shows specific details of a photo like the filename, title, date, albums and tags.
 * It takes a photoId as a parameter, then calls the function to find the photo.
 * If the photo is found, the function displays specific details of the photo, otherwise showing an error message
 * 
 * @param {Number} photoId This is the ID of the photo, for which the details need to be shown
 */
async function showDetails(photoId) {
    let targetPhoto = await findPhoto(photoId)
    let albumFile = await fs.readFile("albums.json", "utf-8")
    let allAlbums = JSON.parse(albumFile)
    if (targetPhoto == null) {
        console.log("Incorrect photo ID. Please try again")
    } else {
        console.log(" ")
        console.log("Filename: " + targetPhoto.filename)
        console.log("Title: " + targetPhoto.title)
        let photoDate = new Date(targetPhoto.date)
        console.log("Date: " + photoDate.toDateString())
        let photoAlbums = ""
        for (albumId of targetPhoto.albums) {
            for (let a of allAlbums) {
                if (a.id == albumId)
                    photoAlbums = photoAlbums + a.name + " "
            }
        }
        console.log("Albums: " + photoAlbums)
        console.log("Tags: " + targetPhoto.tags)
    }

}

/**
 * This function asks the user for new title and new description of a picture that the user wants to update.
 * If the user does not add a new value, and uses the same value, an informative message is shown to the user.
 * If the value is updated, a message is shown to the user saying that the photo has been updated!
 * 
 * @param {Number} photoId This is the ID of the photo that needs to be updated
 * @returns This function does not return anything, it simply displays messages based on what happens using console.log
 */
async function updatePhoto(photoId) {
    let photoFile = await fs.readFile("photos.json", "utf-8")
    let allPhotos = JSON.parse(photoFile)
    let photoToUpdate = null
    for (let photo of allPhotos) {
        if (photo.id == photoId) {
            photoToUpdate = photo
            break
        }
    }

    if (photoToUpdate == null) {
        console.log("Incorrect photo ID. Please try again")
    } else {
        console.log("Press enter to reuse existing value")
        let updatedTitle = prompt("Enter value for title: [" + photoToUpdate.title + "]: ")
        let updatedDescription = prompt("Enter value for desctiption: [" + photoToUpdate.description + "]: ")
        if (updatedTitle || updatedDescription) {
            if (updatedTitle) {
                photoToUpdate.title = updatedTitle
            }
            if (updatedDescription) {
                photoToUpdate.description = updatedDescription
            }
            await fs.writeFile("photos.json", JSON.stringify(allPhotos, null, 2))
            console.log("Photo updated")
            return
        }
        console.log("No new title or description added for the photo.")
    }
}

/**
 * This is a function, that takes the title of an album as the parameter, and returns the information about each photo for that album in a specific format.
 * If an invalid album title is given, an error message is shown to the user
 * 
 * @param {String} albumTitle This is the name of the album to search for
 */
async function albumList(albumTitle) {
    let photoFile = await fs.readFile("photos.json", "utf-8")
    let allPhotos = JSON.parse(photoFile)
    let albumFile = await fs.readFile("albums.json", "utf-8")
    let allAlbums = JSON.parse(albumFile)
    let albumId = null
    for (let album of allAlbums) {
        if (album.name.toLowerCase() == albumTitle.toLowerCase()) {
            albumId = album.id
            break
        }
    }

    if (albumId) {
        console.log("filename,resolution,tags")
        for (let photo of allPhotos) {
            for (let id of photo.albums) {
                if (id == albumId) {
                    console.log(photo.filename + "," + photo.resolution + "," + photo.tags.join(":"))
                }
            }
        }
    } else {
        console.log("Invalid title. Try again with correct title")
    }
}

/**
 * This is a function that takes the photoId, and a new tag as the parameter.
 * The function finds the photo and adds this specific new tag.
 * If the photo is not found or the tag already exists in the photo, informative error messages are shown to the user
 * 
 * @param {Number} photoId This is the ID of the photo to tag
 * @param {String} tag This is the new tag that is given to be added to the photo
 */
async function tagPhoto(photoId, tag) {
    let photoFile = await fs.readFile("photos.json", "utf-8")
    let allPhotos = JSON.parse(photoFile)
    let albumFile = await fs.readFile("albums.json", "utf-8")
    let allAlbums = JSON.parse(albumFile)
    let photoToTag = null
    for (let photo of allPhotos) {
        if (photo.id == photoId) {
            photoToTag = photo
            break
        }
    }

    if (photoToTag == null){
        console.log("Incorrect photo ID. Try again!")
    }else{
        for (let t of photoToTag.tags){
            if (t == tag){
                console.log("The photo already has the tag "+tag+". Try again with a different tag!")
                return
            }
        }
        photoToTag.tags.push(tag)
        console.log("Updated!")
        await fs.writeFile("photos.json", JSON.stringify(allPhotos, null, 2))
    }

}


/**
 * This is a function that contains the main menu of the assignment
 * It has an infinite loop that stops only when the user selects to exit the program
 * Based on the user choice, it calls separate functions, each function does a specific task
 */
async function assignment1() {
    while (true) {
        console.log(" ")
        console.log("1. Find Photo")
        console.log("2. Update Photo Details")
        console.log("3. Album Photo List")
        console.log("4. Tag Photo")
        console.log("5. Exit ")
        console.log(" ")

        let userInput = Number(prompt("Your selection> "))

        if (userInput == 1) {
            let photoId = Number(prompt("Photo ID? "))
            await showDetails(photoId)

        } else if (userInput == 2) {
            let photoId = Number(prompt("Photo ID? "))
            await updatePhoto(photoId)
        } else if (userInput == 3) {
            let albumTitle = prompt("What is the name of the album? ")
            await albumList(albumTitle)
        } else if (userInput == 4) {
            let photoId = Number(prompt("What photo ID to tag? "))
            let tag = prompt("What tag to add (cave,rocks,explore)? ")
            await tagPhoto(photoId, tag)
        } else if (userInput == 5) {
            break
        } else {
            console.log("Invalid option! Enter a choice between 1-5")
        }



    }


}


assignment1()

/*  Saeed Al Sawaff - 60103929
    INFS3201 - Web Technologies 2 - Assignment 1
*/