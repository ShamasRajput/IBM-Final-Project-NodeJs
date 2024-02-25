const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
    //Write your code here
    //return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        res.send(JSON.stringify(books, null, 4));
    } catch (error) {
        console.error("Error fetching book data:", error); // Log the error
        res.status(500).json({ error: "An error occurred while fetching book data" });
    }
    //Write your code here
    //return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    // Create a new Promise
    const promise = new Promise((resolve, reject) => {
        // Check if the ISBN exists in the books object
        if (books.hasOwnProperty(isbn)) {
            // If found, resolve the Promise with the book data
            resolve(books[isbn]);
        } else {
            // If not found, reject the Promise with an error message
            reject("Book not found with ISBN: " + isbn);
        }
    });
    // Handle the Promise resolution
    promise.then((bookData) => {
        // If the Promise resolves successfully, send the book data
        res.send(bookData);
    }).catch((error) => {
        // If there's an error, send an error response
        res.status(404).json({ error: error });
    });
    //Write your code here
    //return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {

    try {
        const author = req.params.author;
        const booksByAuthor = [];

        // Filter books by author
        for (const isbn in books) {
            if (books[isbn].author === author) {
                booksByAuthor.push(books[isbn]);
            }
        }

        if (booksByAuthor.length > 0) {
            res.status(200).json({ books: booksByAuthor });
        } else {
            res.status(404).json({ message: "No books found for the specified author" });
        }
    } catch (error) {
        console.error("Error fetching books by author:", error);
        res.status(500).json({ error: "An error occurred while fetching books by author" });
    }
    // const author = req.params.author;
    // const booksByAuthor = [];

    // for (const isbn in books) {
    //     if (books[isbn].author === author) {
    //         booksByAuthor.push(books[isbn]);
    //     }
    // }

    // if (booksByAuthor.length > 0) {
    //     return res.status(200).json({ books: booksByAuthor });
    // } else {
    //     return res.status(404).json({ message: "No books found for the specified author" });
    // }

    //Write your code here

    //return res.status(300).json({message: "Yet to be implemented"});
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;


    // Create a promise to filter books by title
    const filterBooksByTitle = new Promise((resolve, reject) => {
        const bookTitle = [];

        // Filter books by title
        for (const isbn in books) {
            if (books[isbn].title === title) {
                bookTitle.push(books[isbn]);
            }
        }

        if (bookTitle.length > 0) {
            resolve(bookTitle);
        } else {
            reject("No books found for the specified title");
        }
    });

    // Handle the promise
    filterBooksByTitle
        .then(filteredBooks => {
            res.status(200).json({ books: filteredBooks });
        })
        .catch(error => {
            console.error("Error fetching books by title:", error);
            res.status(404).json({ message: error });
        });
    // const title = req.params.title;
    // const bookTitle = [];

    // for (const isbn in books) {
    //     if (books[isbn].title === title) {
    //         bookTitle.push(books[isbn]);
    //     }
    // }

    // if (bookTitle.length > 0) {
    //     return res.status(200).json({ books: bookTitle });
    // } else {
    //     return res.status(404).json({ message: "No books found for the specified title" });
    // }
    //Write your code here
    //return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Check if the book exists
    if (books[isbn] !== undefined && books[isbn] !== null) {
        const book = books[isbn];

        // Check if the book has reviews
        let hasReviews = false;
        for (const review in book.reviews) {
            hasReviews = true;
            break;
        }

        if (hasReviews) {
            return res.status(200).json({ reviews: book.reviews });
        } else {
            return res.status(404).json({ message: "No reviews found for the specified book" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
    //Write your code here
    //return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
