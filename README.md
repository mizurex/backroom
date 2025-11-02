backroom
========

A tiny, minimal chat for quick Q&A sessions. Spin up a room, share the ID, and talk in real time.

Quick start
-----------

 Backend

```
cd server
npm install
# create .env 
npm run dev
```

Environment
-----------

Server (.env)
- MONGO_URI=
- JWT_SECRET=
- CLIENT_ORIGIN=http://localhost:5173

Client (.env)
- VITE_API_BASE=http://localhost:5000
- VITE_SOCKET_URL=http://localhost:5000

How it works
------------

- Register or login to get a token
- Create a room or join with a room ID
- Messages are delivered over Socket.IO and stored in MongoDB

Tech
----

- React + Vite, Tailwind classes for styling
- Node.js, Express, Socket.IO
- MongoDB + Mongoose
- JWT auth


