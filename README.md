# RiffBoard

## Real-Time Collaborative Whiteboard Platform


RiffBoard is a powerful, real-time collaborative whiteboard platform that enables multiple users to draw, design, and interact simultaneously. The application provides a seamless collaborative experience for remote teams, educators, and creative professionals who need a shared visual workspace.

Built with a modern tech stack featuring a React-based frontend and a Node.js/Express backend, RiffBoard delivers exceptional performance and reliability. It implements JWT authentication for secure access controls and MongoDB for efficient, persistent storage of whiteboard sessions, while Socket.IO powers the instant bi-directional communication that makes real-time collaboration possible.

## ✨ Key Features

- **Multi-user Collaboration**: Draw, erase, and modify content simultaneously with team members
- **Low Latency Updates**: Experience near-instantaneous synchronization across all connected clients
- **Secure Session Management**: Protected workspaces with user authentication and authorization
- **Persistent Storage**: Automatic saving of whiteboard sessions for future access and continuation
- **Intuitive Interface**: Clean, responsive design that works across desktop and mobile devices
- **Drawing Tools**: A variety of tools including a brush, line, rectangle, circle, arrow, and text tool, with customizable colors and sizes.

## 🛠️ Interesting Technical Implementations

* **Real-Time Communication**: Leverages [Socket.IO](https://socket.io/) to implement bidirectional event-based communication between clients and server, ensuring that all drawing actions are instantly propagated to all connected users with minimal latency.

* **Secure API Architecture**: Implements [JWT authentication](https://jwt.io/) for robust security, protecting API endpoints and whiteboard sessions from unauthorized access while maintaining a smooth user experience.

* **Performance-Optimized Database**: Achieves significant query performance improvements through advanced [MongoDB indexing](https://www.mongodb.com/docs/manual/indexes/) strategies and efficient document structures.

* **Modern JavaScript Practices**: Utilizes ES6+ features including [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), destructuring, async/await patterns, and functional programming concepts for cleaner, more maintainable code.

* **Canvas Optimization**: Implements efficient drawing algorithms and canvas management techniques to handle complex whiteboard sessions without performance degradation.

## 🔧 Technology Stack

### Frontend
- **React**: Component-based UI development with efficient state management
- **HTML5 Canvas API**: Core drawing functionality with optimized rendering
- **TAILWIND CSS**: For responsive design and styling.
- **Socket.IO Client**: Real-time event handling and state synchronization

### Backend
- **Node.js**: JavaScript runtime for building the server-side application
- **Express**: Web application framework with middleware architecture for efficient routing
- **MongoDB**: NoSQL database providing flexible document storage and retrieval
- **Socket.IO**: Server implementation of WebSocket-based real-time communication
- **JSON Web Tokens**: Secure authentication and authorization mechanism

### Deployment & Infrastructure
- **Vercel**: Frontend hosting with automatic deployments and global CDN
- **Render**: Backend service deployment with automatic scaling
- **MongoDB Atlas**: Cloud database service with backup and monitoring

## 📁 Project Structure

```
RiffBoard_333/
├── frontend/           # React application
│   ├── public/         # Static assets and index.html
│   ├── src/            # Source code
│   │   ├── Components/ # UI components (Board, Toolbar, Toolbox)
│   │   ├── Pages/      # Page components (Login, Profile, etc.)
│   │   ├── store/      # React context providers and contexts
│   │   └── utils/      # Utility functions
│   └── package.json    # Frontend dependencies and scripts
│
├── backend/            # Node.js/Express server
│   ├── controllers/    # Request handlers for routes
│   ├── middlewares/    # Express middleware (e.g., authentication)
│   ├── models/         # Mongoose schema definitions
│   ├── routes/         # API route definitions
│   └── index.js        # Server entry point
│   └── package.json    # Backend dependencies and scripts
```

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance (local or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/Hebion432/Riffboard_333.git
cd RiffBoard_333
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create an environment variables file (.env) from the .env.example if available,
# or create it manually.
# Add your MongoDB URI, JWT secret, and other configurations.

# Start the development server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create a .env file and add your backend API URL, for example:
# REACT_APP_API_URL=http://localhost:3339

# Start the development server
npm start
```

### 4. Access the Application
Once both servers are running, you can access the application locally at `http://localhost:3000` (or the port specified in your frontend configuration).

## 🙏 Acknowledgements

- Thanks to all contributors who have helped shape this project
- Special appreciation to the open-source community for the amazing tools that made this possible
