# The House by Cozy Home 🏠

A bilingual (English/Chinese) co-living rental platform built with **React + Flask + PostgreSQL**.

## Project Structure

```
The house/
├── backend/        # Flask API
├── frontend/       # React (Vite)
└── render.yaml     # Render deployment
```

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (running via pgAdmin)

### 1. Create PostgreSQL Database
In pgAdmin, create a database named `thehouse`.

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python seed.py         # Creates tables + default admin + demo data
python run.py          # Starts Flask on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev            # Starts React on http://localhost:3000
```

### 4. Access the App
- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login
  - Username: `admin`
  - Password: `admin123`

> ⚠️ **Change the admin password before deploying to production!**

## Deployment to Render

1. Push to GitHub
2. Connect repo in Render → "New Blueprint"
3. Select `render.yaml`
4. Set env vars if needed
5. Deploy

## Features
- Browse multiple properties with photo galleries
- Unit availability with gender/stay type badges
- Room pricing (short & long stay in MYR)
- Equipment lists at unit & room level
- Inclusions/exclusions per unit & room
- Phone + WhatsApp contact per property
- Bilingual EN/ZH toggle
- Full admin CRUD dashboard
- JWT-secured admin auth
