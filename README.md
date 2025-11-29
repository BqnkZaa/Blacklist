# Restaurant & Hotel Blacklist Website

เว็บไซต์ตรวจสอบและรายงานร้านอาหาร/โรงแรมที่มีปัญหา

## Tech Stack

### Frontend
- **Angular 17** - Standalone components
- **SCSS** - Styling with 3-color theme
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe development

### Backend
- **Node.js & Express** - REST API
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Express Rate Limit** - Security

## Features

✅ **Authentication System** - Register, Login, Profile Management  
✅ **Blacklist Reporting** - Upload images, descriptions, ratings  
✅ **Search & Filter** - By name, type, address  
✅ **Voting System** - Upvote/Downvote blacklist items  
✅ **Comments** - Add reviews and comments  
✅ **Responsive Design** - Mobile and desktop support  
✅ **Security** - JWT auth, rate limiting, input validation  
✅ **Multi-language** - Thai language support  

## Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8+

## Installation

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE blacklist_db;
```

Configure database credentials in `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blacklist_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
```

### 3. Run the Application

**Backend:**
```bash
cd server
npm run dev
```
Server runs on http://localhost:5000

**Frontend:**
```bash
cd client
npm start
```
Client runs on http://localhost:4200

## Project Structure

```
blacklist/
├── server/
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & rate limiting
│   │   └── app.js         # Express app
│   ├── uploads/           # Uploaded images
│   └── package.json
│
└── client/
    ├── src/
    │   ├── app/
    │   │   ├── pages/     # Page components
    │   │   ├── services/  # HTTP services
    │   │   └── app.component.ts
    │   ├── styles.scss    # Global styles
    │   └── index.html
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Blacklist
- `POST /api/blacklist` - Create blacklist item (auth required)
- `GET /api/blacklist` - Get all blacklists (with pagination/filters)
- `GET /api/blacklist/:id` - Get single blacklist
- `GET /api/blacklist/:id/stats` - Get statistics
- `POST /api/blacklist/:id/report` - Report false info (auth required)

### Reviews
- `POST /api/reviews` - Add review (auth required)
- `DELETE /api/reviews/:id` - Delete review (auth required)

### Votes
- `POST /api/votes` - Cast/update vote (auth required)
- `DELETE /api/votes/:blacklist_id` - Remove vote (auth required)
- `GET /api/votes/check/:blacklist_id` - Check user's vote (auth required)

## Design Theme

### Color Palette
- **Primary**: `#D32F2F` (Red) - Alerts and warnings
- **Secondary**: `#FFA000` (Amber) - Highlights
- **Accent**: `#1976D2` (Blue) - Interactive elements

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation
- File upload restrictions
- CORS configuration

## Development

```bash
# Server with auto-reload
cd server
npm run dev

# Client with hot reload
cd client
npm start
```

## License

MIT
