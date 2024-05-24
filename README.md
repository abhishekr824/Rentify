# Rentify - Where Renting Meets Simplicity

## Overview
Rentify is a web application designed to simplify the process of finding rental properties. It connects property owners with potential tenants, providing a platform for listing properties and applying various filters to find the perfect rental home.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Features
### Part I: Basic Application
- User Registration and Login (Buyer and Seller)
- Sellers can post properties with essential details
- Buyers can view properties and apply filters
- Sellers can view, update, and delete their properties

### Part II: Add-On Features
- Pagination for property listings
- Form validation for property details
- Mandate login for buyers to view seller details
- Like button for properties
- Email notifications for interested buyers and sellers

### Part III: Optional Bonus Features
- Deploy the full-stack application on a cloud platform (Heroku, AWS, Azure, etc.)

## Tech Stack
- **Frontend:** React, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Email Service:** Nodemailer

## Installation
1. **Clone the repository:**
    ```bash
    git clone https://github.com/abhishekr824/Rentify
    cd rentify
    ```

2. **Install server dependencies:**
    ```bash
    cd server
    npm install
    ```

3. **Install client dependencies:**
    ```bash
    cd ../client
    npm install
    ```

## Environment Variables
Create a `.env` file in the `server` directory and add the following environment variables:
```plaintext
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
