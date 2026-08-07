# Car Rental Website API Documentation

## Overview
This document provides detailed information about the API endpoints for the Car Rental Website. The API is built with Node.js and Express, using MongoDB as the database. It supports user authentication, car listings, bookings, messaging, ratings, and administrative functions.

## Base URL
The base URL for all API endpoints is:
```
https://pfe-uhbw.onrender.com/api
```
For local development, use:
```
http://localhost:5001/api
```

## Authentication
Most endpoints require authentication via JSON Web Tokens (JWT). Include the token in the Authorization header as follows:
```
Authorization: Bearer <your_token>
```

## Content Type
Unless specified otherwise, all requests and responses use JSON format. Set the Content-Type header to:
```
Content-Type: application/json
```

## API Endpoints

### 1. Authentication

#### 1.1 Register
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "phone": "string"
  }
  ```
- **Response**: 
  - 201: User created successfully with user details and token
  - 400: Bad request if email already exists or validation fails

#### 1.2 Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - 200: Successful login with user details and token
  - 401: Invalid credentials

#### 1.3 Get Current User
- **Endpoint**: `GET /auth/me`
- **Description**: Get current authenticated user details
- **Authentication**: Required
- **Response**:
  - 200: User details
  - 401: Unauthorized

### 2. Cars

#### 2.1 Get All Cars
- **Endpoint**: `GET /cars`
- **Description**: Retrieve list of cars with optional filters
- **Query Parameters**:
  - `brand`: Filter by car brand
  - `energy`: Filter by energy type (Essence, Diesel, Hybrid, Electric)
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `startDate`: Availability start date
  - `endDate`: Availability end date
- **Response**:
  - 200: Array of car objects

#### 2.2 Get Car Details
- **Endpoint**: `GET /cars/details/:carId`
- **Description**: Get detailed information about a specific car
- **Parameters**:
  - `carId`: ID of the car to fetch
- **Response**:
  - 200: Car details including owner information
  - 404: Car not found

#### 2.3 Create Car Listing
- **Endpoint**: `POST /cars`
- **Description**: Create a new car listing
- **Authentication**: Required
- **Content-Type**: multipart/form-data
- **Request Body**:
  - `carName`: String (required)
  - `brand`: String (required)
  - `description`: String (required)
  - `energy`: String (Essence, Diesel, Hybrid, Electric)
  - `seats`: Number (required)
  - `doors`: Number (required)
  - `transmission`: String (Manual, Automatic)
  - `mileage`: Number (required)
  - `engine`: String (required)
  - `wilaya`: String (required)
  - `carType`: String (SUV, VAN, STATIONWAGON, CITADINE, SEDAN)
  - `availabilityStart`: Date (required)
  - `availabilityEnd`: Date (required)
  - `price`: Number (required)
  - `features`: Array of strings
  - `file`: Image file (required)
- **Response**:
  - 201: Car created successfully
  - 400: Validation errors
  - 401: Unauthorized

#### 2.4 Update Car
- **Endpoint**: `PUT /cars/:id`
- **Description**: Update an existing car listing
- **Authentication**: Required (owner or admin)
- **Parameters**:
  - `id`: Car ID
- **Request Body**: Same fields as create car, all optional
- **Response**:
  - 200: Updated car details
  - 404: Car not found
  - 403: Forbidden (not owner)

#### 2.5 Delete Car
- **Endpoint**: `DELETE /cars/:id`
- **Description**: Delete a car listing
- **Authentication**: Required (owner or admin)
- **Parameters**:
  - `id`: Car ID
- **Response**:
  - 200: Success message
  - 404: Car not found
  - 403: Forbidden

#### 2.6 Update Car Booking Status
- **Endpoint**: `PATCH /cars/:carId/booking-status`
- **Description**: Update booking status of a car
- **Authentication**: Required (owner or admin)
- **Parameters**:
  - `carId`: Car ID
- **Request Body**:
  ```json
  {
    "bookingStatus": "available" or "booked"
  }
  ```
- **Response**:
  - 200: Success message and updated car
  - 400: Invalid status or ID format
  - 404: Car not found

### 3. Bookings

#### 3.1 Create Booking
- **Endpoint**: `POST /bookings`
- **Description**: Create a new booking request
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "carId": "string",
    "startDate": "date",
    "endDate": "date",
    "totalPrice": "number"
  }
  ```
- **Response**:
  - 201: Booking created
  - 400: Validation errors
  - 404: Car not found

#### 3.2 Get User Bookings
- **Endpoint**: `GET /bookings/user`
- **Description**: Get bookings for the authenticated user
- **Authentication**: Required
- **Response**:
  - 200: Array of booking objects

#### 3.3 Update Booking Status
- **Endpoint**: `PATCH /bookings/:id/status`
- **Description**: Update booking status (accept/reject)
- **Authentication**: Required (car owner or admin)
- **Parameters**:
  - `id`: Booking ID
- **Request Body**:
  ```json
  {
    "status": "accepted" or "rejected"
  }
  ```
- **Response**:
  - 200: Updated booking
  - 404: Booking not found
  - 403: Forbidden

### 4. Messaging

#### 4.1 Send Message
- **Endpoint**: `POST /messages`
- **Description**: Send a message to another user
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "receiverId": "string",
    "content": "string",
    "carId": "string" (optional)
  }
  ```
- **Response**:
  - 201: Message sent
  - 400: Validation error

#### 4.2 Get Conversations
- **Endpoint**: `GET /messages/conversations`
- **Description**: Get list of conversations for authenticated user
- **Authentication**: Required
- **Response**:
  - 200: Array of conversation summaries

#### 4.3 Get Messages in Conversation
- **Endpoint**: `GET /messages/conversation/:userId`
- **Description**: Get messages with a specific user
- **Authentication**: Required
- **Parameters**:
  - `userId`: ID of the other user in conversation
- **Query Parameters**:
  - `carId`: Optional car ID to filter messages
- **Response**:
  - 200: Array of message objects

#### 4.4 Mark Messages as Read
- **Endpoint**: `PATCH /messages/read/:userId`
- **Description**: Mark messages from a user as read
- **Authentication**: Required
- **Parameters**:
  - `userId`: ID of the other user
- **Response**:
  - 200: Success message

### 5. Ratings and Feedback

#### 5.1 Submit Rating
- **Endpoint**: `POST /ratings`
- **Description**: Submit a rating and feedback for a user or car
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "ratedEntityId": "string",
    "entityType": "user" or "car",
    "bookingId": "string",
    "rating": "number (1-5)",
    "comment": "string" (optional)
  }
  ```
- **Response**:
  - 201: Rating submitted
  - 400: Validation error or already rated

#### 5.2 Get User Ratings
- **Endpoint**: `GET /ratings/user/:userId`
- **Description**: Get ratings for a specific user
- **Parameters**:
  - `userId`: ID of user to fetch ratings for
- **Response**:
  - 200: Array of rating objects

#### 5.3 Get Average Rating
- **Endpoint**: `GET /ratings/average/user/:userId`
- **Description**: Get average rating for a user
- **Parameters**:
  - `userId`: ID of user
- **Response**:
  - 200: Object with averageRating and totalRatings

#### 5.4 Submit Feedback
- **Endpoint**: `POST /feedback`
- **Description**: Submit general feedback about the platform
- **Request Body**:
  ```json
  {
    "content": "string"
  }
  ```
- **Response**:
  - 201: Feedback submitted

### 6. Admin Endpoints

#### 6.1 Get Pending Cars
- **Endpoint**: `GET /admin/cars/pending`
- **Description**: Get list of cars pending approval
- **Authentication**: Required (admin only)
- **Response**:
  - 200: Array of pending car listings
  - 403: Forbidden (not admin)

#### 6.2 Approve Car
- **Endpoint**: `PATCH /admin/cars/:id/approve`
- **Description**: Approve a car listing
- **Authentication**: Required (admin only)
- **Parameters**:
  - `id`: Car ID
- **Response**:
  - 200: Updated car with approved status
  - 404: Car not found
  - 403: Forbidden

#### 6.3 Reject Car
- **Endpoint**: `PATCH /admin/cars/:id/reject`
- **Description**: Reject a car listing
- **Authentication**: Required (admin only)
- **Parameters**:
  - `id`: Car ID
- **Request Body**:
  ```json
  {
    "rejectionReason": "string"
  }
  ```
- **Response**:
  - 200: Updated car with rejected status
  - 404: Car not found
  - 403: Forbidden

#### 6.4 Get Platform Feedback
- **Endpoint**: `GET /admin/feedback`
- **Description**: Get all platform feedback
- **Authentication**: Required (admin only)
- **Response**:
  - 200: Array of feedback objects
  - 403: Forbidden

## Error Handling
All error responses follow this format:
```json
{
  "message": "Error description"
}
```
Common status codes:
- 400: Bad Request - Invalid input data
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - User doesn't have permission
- 404: Not Found - Resource doesn't exist
- 500: Internal Server Error - Unexpected server error

## Data Models

### Car Model
```json
{
  "_id": "string",
  "carName": "string",
  "brand": "string",
  "description": "string",
  "energy": "string (Essence|Diesel|Hybrid|Electric)",
  "seats": "number",
  "doors": "number",
  "transmission": "string (Manual|Automatic)",
  "mileage": "number",
  "engine": "string",
  "wilaya": "string",
  "carType": "string (SUV|VAN|STATIONWAGON|CITADINE|SEDAN)",
  "availabilityStart": "date",
  "availabilityEnd": "date",
  "price": "number",
  "images": ["string"],
  "features": ["string"],
  "owner": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string",
    "phone": "string"
  },
  "status": "string (pending|approved|rejected)",
  "bookingStatus": "string (available|booked)"
}
```

### User Model
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "avatar": "string",
  "role": "string (user|admin)",
  "createdAt": "date"
}
```

### Booking Model
```json
{
  "_id": "string",
  "carId": {
    "_id": "string",
    "carName": "string",
    "brand": "string",
    "images": ["string"]
  },
  "renterId": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string"
  },
  "ownerId": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string"
  },
  "startDate": "date",
  "endDate": "date",
  "totalPrice": "number",
  "status": "string (pending|accepted|rejected|completed)",
  "createdAt": "date"
}
```

## Additional Notes
- Date fields should be in ISO format (YYYY-MM-DDTHH:mm:ssZ)
- File uploads for car images use multipart/form-data
- Pagination is not currently implemented but may be added for endpoints returning large datasets
- Rate limiting may be applied to prevent abuse

## Contact
For API support or to report issues, contact the development team at [amin19osmani@gmail.com].
