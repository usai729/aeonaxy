## Environment Variables

Create a `.env` file in the root directory with the following environment variables:

```
DATABASE_URL = ""
PORT = 3001
SERVER = ""
JWT_SECRET = ""
EMAIL = ""
PASSWORD = ""
RESEND_API_KEY =""
```

# Available Routes

This document outlines the available routes in the Express.js application.

## User Routes

### Register a New User

-   **Method:** `POST`
-   **Route:** `/api/user/register`
-   **Description:** Registers a new user.
-   **Request Body:**
    -   `email`: User's email address.
    -   `password`: User's password.
    -   `name`: User's name.
    -   `profile`: User's profile picture (optional).
-   **Authentication:** Not required.

### Confirm User's Email

-   **Method:** `PUT`
-   **Route:** `/api/user/confirm-email`
-   **Description:** Confirms a new user's email.
-   **Authentication:** JWT token required.

### Login Existing User

-   **Method:** `POST`
-   **Route:** `/api/user/login`
-   **Description:** Logs in an existing user.
-   **Request Body:**
    -   `email`: User's email address.
    -   `password`: User's password.
-   **Authentication:** Not required.

### Edit User Profile Details

-   **Method:** `PUT`
-   **Route:** `/api/user/editProfileDetails`
-   **Description:** Edits user profile details.
-   **Request Body:**
    -   `email`: User's email address.
    -   `name`: User's name.
    -   `new_profile`: New profile picture (optional).
-   **Authentication:** JWT token required.

### Forgot Password

-   **Method:** `POST`
-   **Route:** `/api/user/forgot-password`
-   **Description:** Initiates the process to reset user's password.
-   **Request Body:**
    -   `email`: User's email address.
-   **Authentication:** Not required.

### Reset Password

-   **Method:** `PUT`
-   **Route:** `/api/user/reset-password`
-   **Description:** Resets user's password.
-   **Request Body:**
    -   `email`: User's email address.
    -   `newPassword`: New password.
-   **Authentication:** Not required.

## Course Routes

### Add a New Course

-   **Method:** `POST`
-   **Route:** `/api/course/new`
-   **Description:** Adds a new course.
-   **Request Body:**
    -   `category`: Course category.
    -   `course_desc`: Course description.
    -   `course_title`: Course title.
    -   `level`: Course level (advanced, intermediate, beginner).
-   **Authentication:** JWT token required.

### Fetch All Courses

-   **Method:** `GET`
-   **Route:** `/api/course/courses`
-   **Description:** Fetches all available courses.
-   **Authentication:** Not required.

### Register in a Course

-   **Method:** `POST`
-   **Route:** `/api/course/enroll/:cid`
-   **Description:** Registers a user in a course.
-   **Authentication:** JWT token required.

### Fetch Courses User is Registered In

-   **Method:** `GET`
-   **Route:** `/api/course/my/courses`
-   **Description:** Fetches courses the user is registered in.
-   **Authentication:** JWT token required.
