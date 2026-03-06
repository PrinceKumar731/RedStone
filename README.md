RedStone

RedStone is a desktop Minecraft server manager that allows users to easily create, manage, and run Minecraft servers locally through a modern web dashboard.

The application bundles a Spring Boot backend, React frontend, and a custom installer, allowing users to run Minecraft servers without manually configuring Java or server files.

Features

Create Minecraft servers for different versions

Manage multiple worlds per server

Accept Minecraft EULA automatically

Start and stop servers from a dashboard

Download server versions automatically

Real-time server console output

Automatic browser launch on startup

Bundled Java runtime (no manual installation required)

Windows installer for easy setup

Architecture

RedStone is built using a full-stack architecture:

Frontend
React (Dashboard UI)

Backend
Spring Boot (Server management API)

Server Management
Local Minecraft server processes

Packaging
Java JAR + bundled JDK + Windows installer

User
 │
 ▼
React Dashboard
 │
 ▼
Spring Boot API
 │
 ▼
Minecraft Server Process
Project Structure
RedStone
│
├── frontend/          # React dashboard
│
├── backend/           # Spring Boot API
│   └── minecraft-server/
│       └── versions.json
│
├── screenshots/       # UI screenshots
│
├── README.md
└── .gitignore
Screenshots
Dashboard

Create Server

Server Running

Installation

Download the installer:

Download:
RedStoneSetup.exe

Run the installer and follow the setup steps.

After installation:

Launch RedStone

The dashboard will open automatically in your browser

Create a server

Share your IP with friends and start playing

Requirements

Operating System
Windows 10 or later

Internet connection required for downloading Minecraft server versions.

Java installation is not required, as RedStone bundles its own runtime.

How It Works

When RedStone starts:

The backend server launches on localhost:8080

The browser automatically opens the dashboard

The application manages Minecraft servers inside

minecraft-server/
   ├── versions.json
   └── <version>/
       └── <worlds>

Server versions and worlds are tracked in versions.json.

Development Setup

Clone the repository

git clone https://github.com/yourusername/redstone.git
Run Backend
cd backend
mvn spring-boot:run
Run Frontend
cd frontend
npm install
npm start

Frontend runs on:

http://localhost:3000

Backend runs on:

http://localhost:8080
Packaging

Production build process:

Frontend

npm run build

Copy the build into:

backend/src/main/resources/static

Backend

mvn clean package

This generates the final JAR used by the installer.

Future Improvements

Cross-platform support (Linux / Mac)

Server performance monitoring

Plugin management

Automatic updates

Cloud server deployment

License

This project is licensed under the MIT License.

Author

Prince Kumar

AIT Pun
