# Food Ordering API Documentation

Base URL: `http://localhost:5000/api`

All authentication endpoints require:
- Header: `Authorization: Bearer {JWT_TOKEN}`
- Content-Type: `application/json`

## Authentication Endpoints

### Register User
```
POST /auth/register

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}

Status: 201 Created
Errors: 400 (validation), 400 (user exists)
```

### Login
```
POST /auth/login

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}

Status: 200 OK
Errors: 401 (invalid credentials), 404 (user not found)
```

### Request Password Reset (Send OTP)
```
POST /auth/forgot-password

Request Body:
{
  "email": "john@example.com"
}

Response:
{
  "message": "OTP sent to your email",
  "expiresIn": 600  // 10 minutes in seconds
}

Status: 200 OK
Errors: 404 (user not found), 500 (email error)
```

### Verify OTP
```
POST /auth/verify-otp

Request Body:
{
  "email": "john@example.com",
  "otp": "123456"
}

Response:
{
  "message": "OTP verified successfully"
}

Status: 200 OK
Errors: 400 (invalid/expired OTP)
```

### Reset Password
```
POST /auth/reset-password

Request Body:
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass456"
}

Response:
{
  "message": "Password reset successfully"
}

Status: 200 OK
Errors: 400 (invalid OTP), 404 (user not found)
```

---

## Food Endpoints

### Get All Foods
```
GET /foods?category=Indian&maxPrice=500&search=butter

Query Parameters:
- category (optional): "Indian", "Chinese", "Fast Food", "Dessert", "Beverage"
- maxPrice (optional): Maximum price in rupees
- hotelId (optional): Filter by restaurant ID
- search (optional): Search in name and description

Response:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Butter Chicken",
    "description": "Tender chicken in creamy tomato and butter sauce",
    "category": "Indian",
    "price": 320,
    "image": "https://...",
    "rating": 4.8,
    "reviews": 340,
    "available": true,
    "hotelId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Taj Hotel",
      "image": "https://..."
    },
    "preparationTime": 25,
    "spicy": "mild",
    "vegetarian": false,
    "vegan": false,
    "nutrition": {
      "calories": 380,
      "protein": 28,
      "fat": 22,
      "carbs": 12
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]

Status: 200 OK
```

### Get Single Food
```
GET /foods/:foodId

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Butter Chicken",
  ... (full food object with hotel populated)
}

Status: 200 OK
Errors: 404 (food not found)
```

### Create Food (Admin)
```
POST /foods
Authorization: Bearer {JWT_TOKEN}

Request Body:
{
  "name": "Paneer Butter Masala",
  "description": "Cottage cheese in creamy tomato sauce",
  "category": "Indian",
  "price": 280,
  "image": "https://...",
  "hotelId": "507f1f77bcf86cd799439012",
  "preparationTime": 20,
  "spicy": "mild",
  "vegetarian": true,
  "vegan": false,
  "nutrition": {
    "calories": 300,
    "protein": 18,
    "fat": 15,
    "carbs": 20
  }
}

Response: (full created food object)
Status: 201 Created
Errors: 400 (validation), 500 (server error)
```

### Update Food (Admin)
```
PUT /foods/:foodId
Authorization: Bearer {JWT_TOKEN}

Request Body: (partial update allowed)
{
  "price": 290,
  "available": false
}

Response: (updated food object)
Status: 200 OK
Errors: 404 (food not found), 400 (validation)
```

### Delete Food (Admin)
```
DELETE /foods/:foodId
Authorization: Bearer {JWT_TOKEN}

Response:
{
  "message": "Food deleted successfully"
}

Status: 200 OK
Errors: 404 (food not found)
```

---

## Hotel/Restaurant Endpoints

### Get All Hotels
```
GET /hotels?latitude=19.0176&longitude=72.8479&radius=5

Query Parameters:
- latitude (optional): User's latitude for nearby restaurants
- longitude (optional): User's longitude for nearby restaurants
- radius (optional): Search radius in kilometers (default: 5km)

Response:
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Taj Hotel",
    "description": "Premium North Indian cuisine",
    "image": "https://...",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipcode": "400001"
    },
    "location": {
      "type": "Point",
      "coordinates": [72.8479, 19.0176]
    },
    "phone": "+91-9876543210",
    "email": "taj@example.com",
    "openTime": "10:00",
    "closeTime": "23:30",
    "rating": 4.8,
    "reviews": 1250,
    "cuisine": ["Indian", "North Indian", "Mughlai"],
    "deliveryTime": 30,
    "minimumOrder": 200,
    "deliveryFee": 40,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]

Status: 200 OK
```

### Get Hotel with Menu
```
GET /hotels/:hotelId

Response:
{
  ... (full hotel object),
  "menu": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Butter Chicken",
      ... (food object)
    },
    ... (more food items)
  ]
}

Status: 200 OK
Errors: 404 (hotel not found)
```

### Create Hotel (Admin)
```
POST /hotels
Authorization: Bearer {JWT_TOKEN}

Request Body:
{
  "name": "New Restaurant",
  "description": "Description of restaurant",
  "image": "https://...",
  "phone": "+91-9876543210",
  "email": "restaurant@example.com",
  "address": {
    "street": "123 Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipcode": "400001"
  },
  "location": {
    "coordinates": [72.8479, 19.0176]
  },
  "openTime": "10:00",
  "closeTime": "23:30",
  "cuisine": ["Indian", "North Indian"],
  "deliveryTime": 30,
  "minimumOrder": 200,
  "deliveryFee": 40
}

Response: (created hotel object)
Status: 201 Created
Errors: 400 (validation), 500 (server error)
```

### Update Hotel (Admin)
```
PUT /hotels/:hotelId
Authorization: Bearer {JWT_TOKEN}

Request Body: (partial update)
{
  "rating": 4.9,
  "status": "maintenance"
}

Response: (updated hotel object)
Status: 200 OK
Errors: 404 (hotel not found)
```

### Delete Hotel (Admin)
```
DELETE /hotels/:hotelId
Authorization: Bearer {JWT_TOKEN}

Response:
{
  "message": "Hotel deleted successfully"
}

Status: 200 OK
Errors: 404 (hotel not found)
```

---

## Order Endpoints

### Get User Orders
```
GET /orders
Authorization: Bearer {JWT_TOKEN}

Response:
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "orderId": "ORD-1234567890",
    "userId": "507f1f77bcf86cd799439011",
    "items": [...],
    "hotelId": "507f1f77bcf86cd799439012",
    "subtotal": 640,
    "deliveryFee": 40,
    "tax": 32,
    "total": 712,
    "status": "delivered",
    "paymentStatus": "completed",
    ... (more order details)
  }
]

Status: 200 OK
Errors: 401 (not authenticated)
```

### Create Order
```
POST /orders
Authorization: Bearer {JWT_TOKEN}

Request Body:
{
  "items": [
    {
      "foodId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "hotelId": "507f1f77bcf86cd799439012",
  "deliveryAddress": {
    "street": "456 Home Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipcode": "400005"
  },
  "paymentMethod": "cod"
}

Response:
{
  "_id": "507f1f77bcf86cd799439013",
  "orderId": "ORD-1234567890",
  "total": 712,
  "status": "pending",
  ... (order details)
}

Status: 201 Created
Errors: 400 (validation), 401 (not authenticated)
```

### Get Order Details
```
GET /orders/:orderId
Authorization: Bearer {JWT_TOKEN}

Response: (full order object with populated items and hotel)
Status: 200 OK
Errors: 404 (order not found), 401 (not authorized)
```

### Update Order Status (Admin)
```
PUT /orders/:orderId
Authorization: Bearer {JWT_TOKEN}

Request Body:
{
  "status": "on_the_way",  // pending, confirmed, preparing, ready, on_the_way, delivered, cancelled
  "estimatedDeliveryTime": "2024-01-15T14:30:00Z"
}

Response: (updated order object)
Status: 200 OK
Errors: 404 (order not found), 400 (invalid status)
```

---

## Error Response Format

All errors follow this format:
```json
{
  "message": "Error description",
  "errors": [
    {
      "msg": "Specific validation error",
      "param": "fieldName"
    }
  ]
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation or input error
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

**Last Updated:** January 2024
