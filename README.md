# 🏛️ CitySnap — Civic Issue Reporting System

A full-stack web app for reporting civic issues: a citizen photographs a problem, an
image-captioning model drafts the description, the location is pinned on a map, and an
admin dashboard tracks each report through to resolution.

**Live demo:** https://city-snap-civics-issuse-reporting-s.vercel.app

## Features

- **Photo → description** — HuggingFace BLIP captions the uploaded/captured image; the user can edit before submitting
- **Location** — browser geolocation with a draggable map marker (Google Maps)
- **Report lifecycle** — Pending → In Progress → Resolved, updated by admins
- **Admin dashboard** — table and map views, filter by status and date range, counts per status
- **Auth** — JWT with role-based access (citizen / admin)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Google Maps API** - Maps and geolocation

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### AI & APIs
- **HuggingFace** - BLIP image captioning model
- **Google Maps** - Geocoding and mapping

## 📁 Project Structure

```
civic/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── CameraCapture.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── MapPicker.jsx
│   │   │   ├── ReportCard.jsx
│   │   │   ├── ReportTable.jsx
│   │   │   ├── ReportMap.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── CreateReport.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/        # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── reportService.js
│   │   │   └── aiService.js
│   │   ├── context/         # React context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/           # Utility functions
│   │   │   └── geolocation.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── backend/
│   ├── models/              # Database models
│   │   ├── User.js
│   │   └── Report.js
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── reportController.js
│   │   └── aiController.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── reports.js
│   │   └── ai.js
│   ├── middleware/          # Custom middleware
│   │   └── auth.js
│   ├── services/            # Business logic
│   │   ├── huggingface.js
│   │   └── geocoding.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Maps API key
- HuggingFace API token

### 1. Clone the Repository
```bash
cd civic
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civiceye
JWT_SECRET=your_super_secret_jwt_key_change_this
HUGGINGFACE_API_KEY=hf_your_huggingface_api_token
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Get API Keys

#### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials → API Key
5. Restrict the key (optional but recommended)

#### HuggingFace API Token
1. Go to [HuggingFace](https://huggingface.co/)
2. Sign up / Log in
3. Go to Settings → Access Tokens
4. Create new token with read permissions

#### MongoDB Connection String
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Get connection string
5. Replace `<password>` with your password

### 5. Run the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📱 Usage

### For Users
1. **Register** - Create a new account
2. **Login** - Access your dashboard
3. **Create Report**:
   - Capture image or upload from device
   - AI generates description automatically
   - Edit description if needed
   - Confirm location on map
   - Submit report
4. **View Reports** - Track status of your submissions

### For Admins
1. **Login** with admin account
2. **View Analytics** - See total, pending, in-progress, and resolved reports
3. **Filter Reports** - By status or date range
4. **Switch Views** - Toggle between table and map view
5. **Update Status** - Change report status as work progresses
6. **View Details** - Click any report for full information

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (user/admin)
- ✅ Protected API routes
- ✅ Environment variables for sensitive data
- ✅ CORS configuration
- ✅ Input validation
- ✅ API key protection (backend proxy)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Reports
- `POST /api/reports` - Create new report (authenticated)
- `GET /api/reports` - Get all reports (admin only)
- `GET /api/reports/user/:userId` - Get user's reports
- `GET /api/reports/:id` - Get single report
- `PATCH /api/reports/:id/status` - Update report status (admin only)
- `GET /api/reports/analytics` - Get analytics (admin only)

### AI
- `POST /api/ai/caption` - Generate image caption (authenticated)

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
5. Add environment variables:
   - `VITE_API_URL` - Your backend URL
   - `VITE_GOOGLE_MAPS_API_KEY` - Your Google Maps key
6. Deploy

### Backend (Render)

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect your repository
4. Set build settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`
5. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `HUGGINGFACE_API_KEY`
   - `GOOGLE_MAPS_API_KEY`
   - `FRONTEND_URL` - Your Vercel URL
   - `NODE_ENV=production`
6. Deploy

### Database (MongoDB Atlas)

Already set up in step 4 of installation. Just use the connection string in your backend environment variables.

## 🎨 UI/UX Features

- ✨ Modern gradient backgrounds
- 🎭 Smooth animations and transitions
- 📱 Fully responsive design
- 🎨 Status color coding (Red/Orange/Green)
- 🗺️ Interactive maps with draggable markers
- 📊 Real-time analytics dashboard
- 🔄 Loading states for async operations
- ⚠️ Comprehensive error handling

## 🐛 Troubleshooting

### Camera not working
- Ensure HTTPS or localhost (camera requires secure context)
- Check browser permissions
- Try different browser

### AI caption generation slow
- HuggingFace models may take 10-20 seconds on first load
- Model needs to "warm up" after inactivity
- This is normal for free tier

### Maps not loading
- Verify Google Maps API key is correct
- Ensure Maps JavaScript API is enabled
- Check API key restrictions

### MongoDB connection failed
- Verify connection string format
- Check database user credentials
- Ensure IP whitelist includes your IP (or use 0.0.0.0/0 for all)

## 📝 License

MIT License - Feel free to use this project for learning or production.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for better civic engagement**
