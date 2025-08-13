# Qualiextra-Back

This project is a REST API for user management, built with Node.js, Express, TypeScript, TSOA, and Prisma. It includes features like role-based access control, email verification, and protection against temporary email addresses.

## Features

- **User Management:** CRUD operations for users.
- **Authentication:** JWT-based authentication.
- **Role-based Access Control (RBAC):**
  - **Admin:** Can manage all users.
  - **User:** Can only manage their own profile.
- **Email Verification:** New users receive a verification email to activate their accounts.
- **Temporary Email Blocking:** Prevents registration with disposable email addresses.
- **API Documentation:** Automatically generated Swagger documentation.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later)
- A PostgreSQL database

## Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/qualiextra-back.git
    cd qualiextra-back
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following variables:

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    JWT_SECRET="your-jwt-secret"
    ```

4.  **Apply database migrations:**

    ```bash
    npm run prisma migrate dev
    ```

5.  **Seed the database (optional):**

    This will create an admin user.

    ```bash
    npx prisma db seed
    ```

    > **Note:**  
    > You can view the credentials of the seeded admin user for testing purposes by checking the `prisma/seed.ts` file.  
    > The default admin email is `admin@example.com` and the password is `password-admin`

## Running the Application

- **Development mode:**

  ```bash
  npm run dev
  ```

  The server will start on `http://localhost:3000` and will automatically restart on file changes.

- **Production mode:**

  ```bash
  npm run build
  npm run start
  ```

## Viewing the Database

You can use Prisma Studio to view and manage your database records through a browser-based GUI.

```bash
npx prisma studio
```

## API Endpoints

The API documentation is available at `/docs` when the server is running.

### Authentication

- `POST /login`: Authenticate a user and get a JWT token.

### Users

- `GET /users`: Get a list of all users (Admin only).
- `GET /users/{userId}`: Get a user by ID (Admin only).
- `POST /users`: Create a new user.
- `PUT /users/{userId}`: Update a user (Admin only).
- `DELETE /users/{userId}`: Delete a user (Admin only).

### Private

- `GET /private`: A protected route that returns a greeting to the authenticated user.

## Security Features

- **Password Hashing:** Passwords are hashed using `bcryptjs`.
- **JWT Authentication:** Secure endpoints using JSON Web Tokens.
- **Email Verification:** Prevents users from logging in until their email is verified.
- **Disposable Email Detection:** Blocks registration from known temporary email providers.
