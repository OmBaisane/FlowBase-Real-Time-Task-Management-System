# ⚡ FlowBase - Real-Time Task Management System

FlowBase is a modern, real-time task management web application designed to streamline team collaboration. Built with a robust full-stack architecture, it features instant task synchronization, role-based access control, and a premium responsive UI.

## 🚀 Key Features

* **Real-Time Synchronization:** Powered by Socket.IO, tasks created, updated, or deleted are instantly reflected across all connected clients without page reloads.
* **Role-Based Access Control (RBAC):** * **Admin:** Access to global task analytics, full team management, and global task assignment.
    * **User:** Isolated workspace focusing only on personally assigned tasks and profile management.
* **Interactive Analytics:** Dynamic Doughnut charts providing a visual breakdown of task statuses (Todo, In-Progress, Completed).
* **Premium UI/UX:** Built with Tailwind CSS, featuring a fully responsive design, smooth slide-out mobile menus, and a seamless Dark/Light mode toggle.
* **Secure Authentication:** JWT-based user authentication and route protection using Angular Route Guards.

## 💻 Tech Stack

* **Frontend:** Angular, Tailwind CSS, Chart.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Real-Time Engine:** Socket.IO
* **Authentication:** JSON Web Tokens (JWT), bcryptjs

## 📂 Project Structure

\`\`\`text
FlowBase/
├── backend/
│   ├── controllers/      # Route logic (taskController, authController)
│   ├── models/           # MongoDB Schemas (User, Task)
│   ├── routes/           # Express API routes
│   └── server.js         # Entry point & Socket.IO initialization
└── frontend/
    └── src/
        ├── app/
        │   ├── components/   # Reusable UI (Sidebar, Header, TaskForm)
        │   ├── pages/        # Main views (AdminDashboard, UserDashboard, Profile)
        │   ├── services/     # API handlers (AuthService, TaskService, SocketService)
        │   └── guards/       # Route protection (AuthGuard, AdminGuard)
        └── index.html
\`\`\`

## 🛠️ Installation & Setup

### Prerequisites
* Node.js installed
* Angular CLI installed globally (`npm install -g @angular/cli`)
* MongoDB instance (Local or Atlas)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/FlowBase.git
cd FlowBase
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
* Create a `.env` file in the `backend` directory and add the following:
    \`\`\`env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key
    \`\`\`
* Start the server:
    \`\`\`bash
    npm run dev
    \`\`\`

### 3. Frontend Setup
\`\`\`bash
cd ../frontend
npm install
\`\`\`
* Start the Angular development server:
    \`\`\`bash
    ng serve
    \`\`\`

### 4. Access the Application
Open your browser and navigate to `http://localhost:4200`

## 🤝 Contribution
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the MIT License.