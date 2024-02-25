const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { 
    let filtered_users = users.filter((user)=> user.username === user);
    if(filtered_users){
        return true;
    }
    return false;
    //returns boolean
    //write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
    //returns boolean
    //write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
    //Write your code here
    //return res.status(300).json({ message: "Yet to be implemented" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username; // Retrieve logged-in username from session

    // Check if the review and username are provided
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }
    if (!username) {
        return res.status(401).json({ message: "User is not authenticated" });
    }

    // Check if the book exists
    if (books[isbn]) {
        // Check if the user has already reviewed this book
        if (!books[isbn].reviews.hasOwnProperty(username)) {
            // If not, add the review
            books[isbn].reviews[username] = review;
            return res.status(201).json({ message: "Review added successfully" });
        } else {
            // If the user has already reviewed, modify the existing review
            books[isbn].reviews[username] = review;
            return res.status(200).json({ message: "Review modified successfully" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }

    //Write your code here
    //return res.status(300).json({ message: "Yet to be implemented" });
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Retrieve logged-in username from session

    // Check if the user is logged in
    if (!username) {
        return res.status(401).json({ message: "User is not authenticated" });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has reviewed the book
    if (!books[isbn].reviews.hasOwnProperty(username)) {
        return res.status(404).json({ message: "User has not reviewed this book" });
    }

    // Delete the review
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
