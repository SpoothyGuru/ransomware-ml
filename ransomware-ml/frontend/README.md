# 🛡️ Ransomware Detection Frontend

React + Tailwind CSS frontend for the AI-Powered Malware Detection System.

## ✨ Features

- 🔐 **Authentication** - JWT-based login with secure token management
- 📊 **Dashboard** - Real-time statistics and recent activity tracking
- 🔍 **File Scanner** - Upload and analyze PDF, DOCX, DOC, and JSON files
- 📈 **Model Analysis** - Comprehensive performance metrics and visualizations
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 🔔 **Toast Notifications** - User-friendly success/error feedback

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (optional - app works in development mode without backend)

### Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment Variables**

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

**Note:** If `VITE_API_BASE_URL` is not set, the app defaults to `http://localhost:8000`.

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

### API Endpoints

The frontend expects the following backend endpoints:

#### Authentication
- `POST /auth/login` - User login
  - Request: `{ username: string, password: string }`
  - Response: `{ access_token: string, token_type: "bearer", user: {...} }`

#### Dashboard
- `GET /dashboard` - Dashboard summary statistics
  - Response: `{ total_scans: int, malicious_count: int, benign_count: int, todays_scans: int, false_positives: int, false_negatives: int }`
- `GET /dashboard/recent` - Recent activity
  - Response: `[{ filename: string, status: string, confidence: string, date: string }, ...]`

#### Prediction
- `POST /predict` - File upload for malware detection
  - Request: `multipart/form-data { file: File }`
  - Response: `{ status: "Malicious"|"Benign", confidence: string, threat_level: string, details: string, rf_confidence: string, xgb_confidence: string, nn_confidence: string }`

#### Analysis
- `GET /analysis` - Model performance analysis
  - Response: `{ confusion_matrix: [[tn, fp], [fn, tp]], model_accuracies: {...}, top_features: [...], roc: { fpr: [...], tpr: [...], auc: number }, evaluation_image_url: string }`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Navigation bar with logout
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   ├── FileUploader.jsx # Drag & drop file upload
│   │   ├── ResultCard.jsx   # Scan results display
│   │   ├── MetricCard.jsx   # Dashboard metric cards
│   │   ├── ModelChart.jsx   # Chart.js wrapper
│   │   ├── ConfusionMatrix.jsx # Confusion matrix visualization
│   │   └── Toast.jsx         # Toast notifications
│   ├── pages/               # Page components
│   │   ├── Login.jsx        # Authentication page
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── Predict.jsx       # File upload & scanning
│   │   └── Analysis.jsx     # Model analysis & charts
│   ├── hooks/               # Custom React hooks
│   │   └── useToast.js      # Toast notification hook
│   ├── api.js               # Axios instance & API helpers
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind directives
├── .env                     # Environment variables (create this)
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies
```

## 🔐 Authentication

### Sample Credentials

For development/demo purposes:
- **Username:** `admin@example.com`
- **Password:** `StrongPass123`

**Note:** In production, ensure the backend properly hashes passwords and issues secure JWT tokens.

### Token Storage

- Tokens are stored in `localStorage` as `ransom_token`
- User information is stored as `user` in `localStorage`
- Tokens are automatically included in API requests via axios interceptors
- 401 responses automatically redirect to login

## 🎨 Features Breakdown

### Dashboard
- Real-time statistics (total scans, malicious/benign counts, today's scans)
- False positive/negative tracking
- Recent activity feed with timestamps
- File classification distribution chart

### Predict Page
- Drag & drop file upload
- File type validation (PDF, DOCX, DOC, JSON)
- File size validation (max 50MB)
- Real-time scanning with progress indicator
- Detailed results with model confidence scores
- Threat level indicators

### Analysis Page
- Confusion matrix visualization
- Model accuracy comparison (bar chart)
- Top 10 feature importance (horizontal bar chart)
- ROC curve with AUC score
- Model evaluation image display and download

## 🛠️ Development Mode

If the backend is not available, the app automatically falls back to development mode:
- Login works with any credentials (creates mock token)
- Dashboard and Analysis pages show demo data
- Predict page shows mock scan results

This allows frontend development without requiring a running backend.

## 📦 Dependencies

### Core
- `react` - UI framework
- `react-dom` - React DOM bindings
- `react-router-dom` - Client-side routing

### Styling
- `tailwindcss` - Utility-first CSS framework
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixing

### Data Visualization
- `chart.js` - Chart library
- `react-chartjs-2` - React bindings for Chart.js

### HTTP Client
- `axios` - Promise-based HTTP client

### Icons
- `@heroicons/react` - Icon library

## 🚨 Troubleshooting

### Backend Connection Issues

If you see "Cannot connect to server" errors:
1. Ensure the backend is running on the configured port
2. Check `VITE_API_BASE_URL` in `.env` file
3. Verify CORS is enabled on the backend
4. Check browser console for detailed error messages

### Build Issues

If build fails:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

If port 5173 is in use:
- Vite will automatically try the next available port
- Check terminal output for the actual port number

## 🔒 Security Notes

- **Development:** Tokens stored in localStorage (acceptable for demo)
- **Production:** Consider using httpOnly cookies for token storage
- **Backend:** Must hash passwords (never store plaintext)
- **HTTPS:** Use HTTPS in production environments
- **CORS:** Configure backend CORS properly for production

## 📝 API Integration Checklist

When connecting to a real backend:

- [ ] Update `VITE_API_BASE_URL` in `.env`
- [ ] Ensure backend implements all required endpoints
- [ ] Verify CORS configuration
- [ ] Test authentication flow
- [ ] Verify file upload endpoint accepts multipart/form-data
- [ ] Check response formats match expected structure
- [ ] Test error handling (401, 404, 500)

## 🤝 Contributing

1. Follow existing code style
2. Add error handling for all API calls
3. Include loading states for async operations
4. Use toast notifications for user feedback
5. Test with and without backend connection

## 📄 License

This project is intended for research and educational purposes only.

## 🙏 Acknowledgments

- Built with React, Vite, and Tailwind CSS
- Charts powered by Chart.js
- Icons from Heroicons
