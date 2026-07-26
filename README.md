# SPRASH e-Library

A full-stack digital e-library developed for the **Sparsh Balgram** NGO, providing free digital access to NCERT books for children.

## Features

- **Modern & Responsive UI**: Handcrafted, educational, and clean design.
- **Book Library**: Browse NCERT books for Class 9 and Class 10.
- **Search & Filter**: Find books easily by subject, class, or keyword.
- **Read Online**: Built-in PDF viewer so students don't need to leave the site.
- **Admin Dashboard**: Secure session-based admin portal to manage books, cover images, and PDFs.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: `express-session` & `bcrypt` for secure admin login
- **File Uploads**: `multer` for managing PDF and image uploads

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally, or use a MongoDB Atlas URI)

## Installation & Setup

1. **Clone the repository** (or navigate to the project folder):
   ```bash
   cd sprash-elibrary
   ```

2. **Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the `server` directory and update variables if needed:
   ```bash
   cp .env.example .env
   ```
   *Make sure MongoDB is running locally on port 27017, or update `MONGO_URI`.*

4. **Seed the Database**:
   Populate the database with sample NCERT books and create the default admin account:
   ```bash
   npm run seed
   ```
   *Default Admin Credentials:*
   - **Username**: `admin`
   - **Password**: `admin123`

5. **Start the Server**:
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Or Production mode
   npm start
   ```

6. **Access the Application**:
   Open your browser and navigate to: `http://localhost:5000`

## Folder Structure

```
sprash-elibrary/
├── client/                 # Frontend HTML, CSS, JS
│   ├── css/
│   ├── js/
│   ├── images/
│   └── *.html
├── server/                 # Backend Node.js/Express Server
│   ├── config/             # DB config
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & Upload middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── uploads/            # PDFs and Covers (generated dynamically)
│   ├── server.js           # Entry point
│   └── seed.js             # Database seeder script
├── .env.example            # Environment template
└── README.md
```

## Security Note

For production deployment, ensure:
- The session secret (`SESSION_SECRET`) in `.env` is a strong, random string.
- Default admin credentials are changed immediately.
- Use HTTPS in production so session cookies can be marked `secure`.

## Future Scope

- Support for Classes 1–12 and more subjects.
- Student login and reading history.
- AI Study Assistant and progress tracking.
