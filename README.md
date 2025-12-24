# Digital Vault - Secure Secret Sharing Platform

A full-stack application for securely storing and sharing sensitive text data with fine-grained access controls and full audit logging.


## Features

- Secure user authentication with httpOnly cookies
- Create and manage encrypted vault items
- Generate shareable links with:
  - Time-based expiration
  - View limits
  - Optional password protection
- Full access control: lock/unlock, regenerate token, update settings
- Complete audit trail of all access attempts
- Public access page with password prompt
- Responsive glassmorphism UI

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Lucide Icons
- React Router v6

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- bcrypt for hashing
- JWT in httpOnly cookies

## Setup

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Base URL: `http://localhost:3000/api` (development)  
Production: Configure via environment variable

All protected routes require authentication via **httpOnly cookie** (sent automatically with `credentials: 'include'`).

### Authentication

#### Register
- **POST** `/users/register`
- **Body**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "yourpassword123"
  }
  ```
- **Success**: `201 Created` + sets httpOnly cookie

#### Login
- **POST** `/users/login`
- **Body**
  ```json
  {
    "email": "john@example.com",
    "password": "yourpassword123"
  }
  ```
- **Success**: `200 OK` + sets httpOnly cookie

#### Logout
- **POST** `/users/logout`
- **Success**: `200 OK` + clears cookie

### Vaults

#### List All Vaults
- **GET** `/vaults`
- **Success**: `200 OK`
  ```json
  {
    "status": "success",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "content": "string",
        "owner": "string",
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  }
  ```

#### Create Vault Item
- **POST** `/vaults`
- **Body**
  ```json
  {
    "title": "My API Key",
    "content": "sk-1234567890abcdef"
  }
  ```
- **Success**: `201 Created`

#### Get Single Vault
- **GET** `/vaults/:id`
- **Success**: `200 OK` (returns vault object)

### Share Links

#### Create Share Link
- **POST** `/share-links/vaults/:vaultId/share`
- **Body**
  ```json
  {
    "expiresIn": "24h",   // "1h" | "6h" | "24h" | "7d" | "30d" | "never"
    "maxViews": 5,        // optional, number
    "password": "secret123" // optional
  }
  ```
- **Success**: `201 Created` with share URL

#### List Share Links for Vault
- **GET** `/share-links/vaults/:vaultId/share-link`
- **Success**: Array of share link objects

#### Lock Share Link
- **PATCH** `/share-links/shares/:id/lock`
- **Success**: `200 OK`

#### Unlock Share Link
- **PATCH** `/share-links/shares/:id/unlock`
- **Success**: `200 OK`

#### Regenerate Token
- **PATCH** `/share-links/shares/:id/regenerate`
- **Success**: Returns new token and URL (old link invalidated)

#### Update Share Link Settings
- **PATCH** `/share-links/shares/:id/update`
- **Body** (any combination)
  ```json
  {
    "expiresIn": "7d",
    "maxViews": 10,
    "password": "newpass" // or null to remove
  }
  ```
- **Success**: `200 OK`

#### Delete Share Link
- **DELETE** `/share-links/:id`
- **Success**: `200 OK` (deletes link + all access logs)

### Public Access

#### Access Shared Vault
- **POST** `/share/:token`
- **Body** (optional)
  ```json
  {
    "password": "optionalpassword"
  }
  ```
- **Success**: `200 OK`
  ```json
  {
    "title": "My API Key",
    "content": "sk-1234567890abcdef",
    "remainingViews": 4
  }
  ```
- **Errors**:
  - `401` Password required / Invalid password
  - `403` Link locked or exhausted
  - `410` Link expired
  - `404` Invalid link

### Access Logs

#### Get Logs for Vault
- **GET** `/share-links/vaults/:vaultId/logs`
- **Success**: Array of logs
  ```json
  [
    {
      "outcome": "ALLOWED" | "DENIED",
      "ipAddress": "192.168.1.1",
      "shareLinkId": "string",
      "createdAt": "date"
    }
  ]
  ```

---

**All responses follow consistent format**:
```json
{
  "status": "success" | "error",
  "data": { ... } | null,
  "message": "string"
}
```

---


<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/d8b0d619-3f47-498e-95f8-9a97290e453f" />
<img width="1908" height="904" alt="image" src="https://github.com/user-attachments/assets/8bf4cae1-5a66-431e-9bd7-641af7b2b65e" />
<img width="1899" height="903" alt="image" src="https://github.com/user-attachments/assets/5a7669b0-7bd8-4585-bef3-acb2624b371e" />
<img width="1892" height="891" alt="image" src="https://github.com/user-attachments/assets/542667ef-530a-457b-8700-a0b172664e1e" />
<img width="1889" height="900" alt="image" src="https://github.com/user-attachments/assets/98918bd6-e2fa-442e-9a1f-9aab1a6339f1" />
<img width="1908" height="909" alt="image" src="https://github.com/user-attachments/assets/c44d29e3-7254-41a1-9449-6fef7d210e2d" />
<img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/43096858-9de9-4104-8ff9-b03add67465e" />
<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/78ad0ae1-0d36-45cc-b22e-e2466dabb12d" />










Made by Muhammad Owais- December 2025

