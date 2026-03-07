# RedStone

⬇️ **Download the Application**

 **[Download RedStone Setup]([https://github.com/PrinceKumar731/RedStone/releases/download/v1.0/redstone.zip](https://github.com/PrinceKumar731/RedStone/releases/download/v1.0/redstone.zip))**

---

RedStone is a **desktop Minecraft server manager** that allows users to easily create, manage, and run Minecraft servers locally through a modern web dashboard.

The application bundles a **Spring Boot backend, React frontend, and a custom installer**, allowing users to run Minecraft servers without manually configuring Java or server files.

---

## Screenshots

## Dashboard
![Dashboard](assets/Screenshot%202026-03-06%20222911.png)

## Create Server
![Create Server](assets/Screenshot%202026-03-06%20222541.png)

## Server Running
![Server Running](assets/Screenshot%202026-03-06%20223125.png)

---

# Features

- Create Minecraft servers for different versions
- Manage multiple worlds per server
- Accept Minecraft EULA automatically
- Start and stop servers from a dashboard
- Download server versions automatically
- Real-time server console output
- Automatic browser launch on startup
- Bundled Java runtime (no manual installation required)
- Windows installer for easy setup

---

# Architecture

RedStone is built using a **full-stack architecture**.

| Layer | Technology |
|------|------|
| Frontend | React (Dashboard UI) |
| Backend | Spring Boot (Server Management API) |
| Server Management | Local Minecraft server processes |
| Packaging | Java JAR + bundled JDK + Windows installer |

### Flow

```
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
```

---

# Project Structure

```
RedStone
│
├── frontend/                # React dashboard
│
├── backend/                 # Spring Boot API
│
├── minecraft-server/
│   └── versions.json
│
├── screenshots/             # UI screenshots
│
├── README.md
└── .gitignore
```

---

# Installation

### 1️⃣ Download the installer

Download:  
👉 **[RedStoneSetup.exe]([https://github.com/PrinceKumar731/RedStone/releases/download/v1.0/redstone.zip](https://github.com/PrinceKumar731/RedStone/releases/download/v1.0/redstone.zip))**

### 2️⃣ Run the installer

Follow the installation steps.

### 3️⃣ Start RedStone

After installation:

- Launch **RedStone**
- The dashboard will open automatically in your browser
- Create a server
- Share your IP with friends and start playing

---

# Requirements

| Requirement | Details |
|-------------|---------|
| Operating System | Windows 10 or later |
| Internet | Required to download Minecraft server versions |
| Java | Not required (bundled with RedStone) |

---

# How It Works

When RedStone starts:

1. The backend server launches on  
   **http://localhost:8080**

2. The browser automatically opens the dashboard.

3. Minecraft servers are managed inside:

```
minecraft-server/
│
├── versions.json
└── <server folders>
```

Server versions and worlds are tracked inside **versions.json**.

---

# Development Setup

### Clone the repository

```bash
git clone https://github.com/yourusername/redstone.git
```

---

### Run Backend

```bash
cd backend
mvn spring-boot:run
```

---

### Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

Backend runs on:

```
http://localhost:8080
```

---

# Packaging

### 1️⃣ Build Frontend

```bash
npm run build
```

Copy the build into:

```
backend/src/main/resources/static
```

---

### 2️⃣ Build Backend

```bash
mvn clean package
```

This generates the **final JAR used by the installer**.

---

# License

This project is licensed under the **MIT License**.

---

# Author

**Prince Kumar**  
AIT Pune
