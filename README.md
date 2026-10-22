
# Auth Guards & Role-Based Access Control

A full-stack authentication project built with Node.js, Express.js, MongoDB, and JWT. It demonstrates secure user authentication, protected routes, and role-based authorization.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Protected dashboard for authenticated users
- Role-based access control for users and admins
- Admin-only API endpoint
- Session persistence using sessionStorage
- Logout functionality
- MongoDB database integration
- Environment variables for sensitive configuration

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcryptjs
- **Development:** VS Code, Git, GitHub

## Project Structure

```text
auth-rbac-project/
├── middleware/
│   └── authMiddleware.js
├── models/
│   └── user.js
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── routes/
│   ├── auth.js
│   ├── protected.js
│   └── userRoutes.js
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database, such as MongoDB Atlas
- Git

### 1. Clone the repository

```bash
git clone https://github.com/saherarshad657-png/auth-guards-rbac.git
cd auth-guards-rbac
```

### 2. Install dependencies

On Windows PowerShell, run:

```powershell
npm.cmd install
```

### 3. Configure environment variables

Create a `.env` file in the project's root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1h
```

Replace the example values with your own private configuration. Never commit `.env` or share your database credentials.

### 4. Start the server

```powershell
node server.js
```

Open the application at:

http://localhost:5000

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/dashboard` | Authenticated users |
| GET | `/api/admin` | Admin only |
| GET | `/api/health` | Public |

## Security Behavior

- Passwords are hashed before being stored.
- Protected endpoints require a valid JWT.
- Missing, invalid, or expired tokens are rejected.
- Normal users cannot access admin-only endpoints.
- New registrations receive the default `user` role.
- Admin privileges must be assigned through a trusted administrative process.

## Testing

The following behaviors have been tested locally:

- Successful signup and login
- Access denied when a token is missing
- Invalid token rejected
- Normal user denied access to the admin endpoint
- Admin user allowed to access the admin endpoint

## Future Improvements

- Add automated tests
- Add password reset functionality
- Improve input validation and rate limiting
- Deploy the application to a hosting service

## Author

Developed as a learning project to practice backend authentication, API security, and role-based access control.
