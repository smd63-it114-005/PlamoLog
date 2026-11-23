# PlamoLog — Model Kit Management Application

Full-stack 3-tier web application deployed across three Ubuntu virtual machines on a private Virtual LAN (VLAN).

## Architecture
- **VM1-Frontend (`192.168.100.10`)**: Nginx reverse proxy serving static HTML/CSS/JS and routing `/api/` requests to the backend.
- **VM2-Backend (`192.168.100.20`)**: Private Node.js + Express REST API running as a `systemd` service (`plamolog-api.service`), protected by UFW.
- **VM3-Database (`192.168.100.30`)**: Private MongoDB instance restricted via UFW to accept port `27017` traffic only from `VM2-Backend`.

## Setup Instructions
1. Copy `backend/.env.example` to `backend/.env` and fill in your MongoDB credentials and `JWT_SECRET`.
2. Install backend dependencies inside `backend/`:
   npm install
3. Start the Express server (`node server.js` or via `systemctl start plamolog-api`).
4. Serve `frontend/` through Nginx with `/api/` proxied to `http://192.168.100.20:3000`.

## AI Usage Documentation
AI tools were used during development to assist with:
- Generating initial HTML/CSS/JS templates for the catalog, login, and registration pages.
- Structuring Mongoose user schemas and Express JWT authentication routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- Troubleshooting JavaScript syntax errors, Nginx reverse-proxy configuration, and UFW firewall rules.
