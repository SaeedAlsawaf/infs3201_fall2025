/*  Saeed Al Sawaff - 60103929
    INFS3201 - Web Technologies 2 - Assignment 2
    Presentation Layer : All User Input/Output
*/

// presentation.js
const prompt = require("prompt-sync")()
const business = require("./business")

/**
 * Runs the main interactive console program for user login and managing photos.
 * Allows the logged-in user to find photos, update photo details, list album photos, tag photos, or exit.
 *
 * This function uses prompts to get user input and displays results in the console.
 *
 * @returns {Promise<void>} - Resolves when the user chooses to exit.
 */

async function assignment2() {
    console.log("===== LOGIN =====")
    let loggedInUser = null

    while (!loggedInUser) {
        let username = prompt("Username: ")
        let password = prompt("Password: ")
        loggedInUser = await business.login(username, password)
        if (!loggedInUser) console.log("Invalid credentials. Please try again.\n")
    }

    console.log(`\nWelcome, ${loggedInUser.username}!\n`)

    while (true) {
        console.log(" ")
        console.log("1. Find Photo")
        console.log("2. Update Photo Details")
        console.log("3. Album Photo List")
        console.log("4. Tag Photo")
        console.log("5. Exit")
        console.log(" ")

        let userInput = Number(prompt("Your selection> "))

        if (userInput == 1) {
            let photoId = Number(prompt("Photo ID? "))
            let result = await business.showDetails(photoId, loggedInUser.id)
            if (!result.found) {
                if (result.reason === "accessDenied")
                    console.log("Access denied: You do not own this photo.")
                else
                    console.log("Incorrect photo ID. Please try again.")
            } else {
                console.log(" ")
                console.log("Filename: " + result.filename)
                console.log("Title: " + result.title)
                console.log("Date: " + result.date)
                console.log("Albums: " + result.albums)
                console.log("Tags: " + result.tags)
            }

        } else if (userInput == 2) {
            let photoId = Number(prompt("Photo ID? "))
            console.log("Press enter to reuse existing value")
            let updatedTitle = prompt("Enter value for title: ")
            let updatedDescription = prompt("Enter value for description: ")
            let result = await business.updatePhoto(
                photoId,
                updatedTitle,
                updatedDescription,
                loggedInUser.id
            )

            if (!result.found) {
                if (result.reason === "accessDenied")
                    console.log("Access denied: You do not own this photo.")
                else
                    console.log("Incorrect photo ID. Please try again.")
            } else if (result.updated) {
                console.log("Photo updated")
            } else {
                console.log("No new title or description added for the photo.")
            }

        } else if (userInput == 3) {
            let albumTitle = prompt("What is the name of the album? ")
            let result = await business.albumList(albumTitle, loggedInUser.id)
            if (!result.found) {
                console.log("Invalid title. Try again with correct title.")
            } else if (result.rows.length === 0) {
                console.log("No photos you own in this album.")
            } else {
                console.log("filename,resolution,tags")
                for (let row of result.rows) console.log(row)
            }

        } else if (userInput == 4) {
            let photoId = Number(prompt("What photo ID to tag? "))
            let tag = prompt("What tag to add (cave,rocks,explore)? ")
            let result = await business.tagPhoto(photoId, tag, loggedInUser.id)
            if (!result.found) {
                if (result.reason === "accessDenied")
                    console.log("Access denied: You do not own this photo.")
                else
                    console.log("Incorrect photo ID. Try again!")
            } else if (result.reason === "duplicate") {
                console.log("The photo already has the tag " + tag + ". Try again with a different tag!")
            } else if (result.added) {
                console.log("Updated!")
            }

        } else if (userInput == 5) {
            break
        } else {
            console.log("Invalid option! Enter a choice between 1-5")
        }
    }
}

assignment2()