# TerraTales.earth 🌍

A satellite imagery comparison application that visualizes temporal changes in different regions using NASA satellite data and Google Earth Engine.

## Features

- **Interactive Map Viewer**: Explore satellite imagery from 1990-2025
- **Region Comparison**: Compare two different years side-by-side with a slider
- **Time Series Analysis**: View temporal evolution charts for Alaska (NDSI), Manaos (NDVI), and CDMX (NDBI)
- **Audio Feedback**: Hear region names when selecting them

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Python, Flask, Google Earth Engine
- **Data**: Landsat 5, 7, 8, 9 satellite imagery

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Python 3.8+
- Google Earth Engine account (free at https://earthengine.google.com/)

## Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd terratales
\`\`\`

### 2. Frontend Setup (Next.js)

\`\`\`bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Create environment variables file
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add:
\`\`\`
BACKEND_URL=http://localhost:5000
\`\`\`

### 3. Backend Setup (Python/Flask)

\`\`\`bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### 4. Google Earth Engine Authentication

\`\`\`bash
# Authenticate with Google Earth Engine
earthengine authenticate

# Follow the prompts to sign in with your Google account
# This will open a browser window for authentication
\`\`\`

After authentication, you'll need to create a service account key:

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Earth Engine API
4. Create a service account
5. Download the JSON key file
6. Save it as `backend/service-account-key.json`

## Running the Application

### Start Backend Server

\`\`\`bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run Flask server
python app.py
\`\`\`

The backend will start on `http://localhost:5000`

### Start Frontend Server

Open a new terminal window:

\`\`\`bash
# Make sure you're in the root directory
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

The frontend will start on `http://localhost:3000`

### Access the Application

Open your browser and navigate to:
\`\`\`
http://localhost:3000
\`\`\`

## Project Structure

\`\`\`
terratales/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Homepage with map viewer
│   ├── compare/             # Comparison page
│   ├── timeseries/          # Time series analysis page
│   └── api/                 # API routes (proxy to backend)
├── components/              # React components
├── hooks/                   # Custom React hooks
├── public/                  # Static assets (images, audio)
├── backend/                 # Python Flask backend
│   ├── app.py              # Main Flask application
│   ├── init_gee.py         # Google Earth Engine initialization
│   ├── indices.py          # Satellite indices calculations
│   └── requirements.txt    # Python dependencies
└── README.md               # This file
\`\`\`

## Usage

### Homepage
- Select a region (Alaska, Manaos, or CDMX)
- Use the timeline slider to view different years
- View the index legend for color interpretation

### Comparison Page
- Select two years (Year A and Year B)
- Choose a region to compare
- Click "COMPARE" to see side-by-side comparison
- Drag the slider to compare images

### Time Series Page
- View temporal evolution charts for all three regions
- See reference images and analysis for each region
- Scroll down to explore all regions

## Satellite Indices

- **NDSI (Alaska)**: Normalized Difference Snow Index - measures snow and ice coverage
- **NDVI (Manaos)**: Normalized Difference Vegetation Index - measures vegetation health
- **NDBI (CDMX)**: Normalized Difference Built-up Index - measures urban development

## Troubleshooting

### Backend Issues

**Error: "Earth Engine not initialized"**
- Make sure you've authenticated with `earthengine authenticate`
- Check that your service account key is in the correct location

**Error: "CORS policy"**
- Ensure Flask-CORS is installed: `pip install flask-cors`
- Check that BACKEND_URL in `.env.local` matches your Flask server URL

### Frontend Issues

**Error: "Failed to fetch"**
- Make sure the backend server is running on port 5000
- Check that BACKEND_URL environment variable is set correctly
- Verify there are no firewall issues blocking localhost connections

**Audio not playing**
- Check browser console for errors
- Ensure your browser supports Web Speech API
- Try a different browser (Chrome/Edge recommended)

## Environment Variables

### Frontend (.env.local)
\`\`\`
BACKEND_URL=http://localhost:5000
\`\`\`

### Backend
No environment variables required, but you need:
- `service-account-key.json` for Google Earth Engine authentication

## Development

### Adding New Regions

1. Update region coordinates in `backend/app.py`
2. Add region button in frontend pages
3. Add region image in `public/` directory
4. Update audio hook with new region name

### Modifying Indices

Edit `backend/indices.py` to add or modify satellite indices calculations.

## Deployment

### Frontend (Vercel)
\`\`\`bash
# Deploy to Vercel
vercel deploy
\`\`\`

### Backend (Railway/Render/Heroku)
- Push backend directory to a separate repository
- Configure service account key as environment variable
- Set PORT environment variable if required

## License

MIT License

## Credits

- Satellite data: NASA Landsat missions
- Processing: Google Earth Engine
- Built with Next.js and Flask
