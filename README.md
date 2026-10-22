# Interactive Dashboard UI & Data Tables

A responsive full-stack admin dashboard built with HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB. The application provides an interactive interface for managing users, searching records, filtering data, and monitoring user statistics.

## Features

- **Responsive Dashboard:** Layout designed for desktop and mobile screens.
- **User Management:** Add, view, edit, and delete user records.
- **Search Functionality:** Search users by name or email.
- **Advanced Filtering:** Filter records by user role and account status.
- **User Statistics:** Display total users, active users, administrators, and inactive users.
- **Status Indicators:** Visual status pills for active and inactive accounts.
- **Data Tables:** Organized user records with pagination.
- **Database Integration:** Persist user data in MongoDB using Mongoose.
- **REST API:** Express.js endpoints for creating, retrieving, updating, and deleting users.
- **Environment Configuration:** Use environment variables for database configuration.
- **Error Handling:** Handle database errors, duplicate email addresses, and invalid user data.

## Technologies Used

| Category | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| API | REST API |
| Environment Variables | dotenv |
| Development Tools | Visual Studio Code, Git, GitHub |

## Project Structure

```text
interactive-dashboard-project/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## Getting Started

Follow these steps to run the application locally.

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm
- A MongoDB database, such as [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd interactive-dashboard-project
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual URL of your GitHub repository.

### 2. Install Dependencies

On Windows PowerShell, run:

```powershell
npm.cmd install
```

### 3. Configure Environment Variables

Create a `.env` file in the project's root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace the example MongoDB URI with your own connection string. Ensure your MongoDB Atlas network access settings allow your development machine to connect.

**Security:** Never upload your `.env` file or expose your database credentials on GitHub.

### 4. Start the Server

Run:

```powershell
npm.cmd start
```

When the server starts successfully, open:

http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API and database connectivity |
| GET | `/api/users` | Retrieve all users |
| POST | `/api/users` | Add a new user |
| PUT | `/api/users/:id` | Update an existing user |
| DELETE | `/api/users/:id` | Delete a user |

## User Data Management

Each user record can include:

- Name
- Email address
- Role (`admin`, `user`, or `editor`)
- Account status (`active` or `inactive`)
- Date joined
- Last active information

MongoDB stores user records so that changes persist beyond a page refresh or server restart.

## Testing

The application has been tested locally for its core functionality:

- Connecting to MongoDB Atlas.
- Adding and retrieving user records.
- Searching users by name and email.
- Filtering records by role and status.
- Editing and deleting users.
- Updating dashboard statistics.
- Displaying user information in a data table.

## Future Improvements

- Add user authentication and permission controls.
- Add sorting by table columns.
- Improve loading indicators and error messages.
- Add automated API and frontend tests.
- Deploy the application to a hosting service.

## Author

Developed as a learning project to practice frontend development, backend programming, REST API integration, database operations, and responsive dashboard design.

