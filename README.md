

# **README.md**

# Real-Time Collaborative Drawing Canvas

A web-based real-time collaborative drawing app built using **vanilla JavaScript**, **Node.js**, **Express**, and **Socket.IO**.
It allows multiple users to draw together on shared canvases in real time — complete with user management, synchronization, notifications, and an intuitive modern interface.

---

## **Overview**

This project demonstrates a **full-stack real-time collaboration system** with synchronized drawing, user tracking, and room-based sessions.
It’s production-ready, easy to deploy, and built without frontend frameworks — focusing on clean code, performance, and clarity.

**Version:** 3.0.0
**Status:** Production Ready
**Tech Stack:** JavaScript (Vanilla), Node.js, Express, Socket.IO

---

## **Core Features**

### Phase 1 – Local Drawing

* Freehand drawing with adjustable brush size
* Color picker and eraser tool
* Undo/Redo (50 actions)
* Clear canvas
* Touch and high-DPI support
* Keyboard shortcuts

### Phase 2 – Real-Time Collaboration

* WebSocket-based sync across users
* Multi-user drawing and cursor tracking
* Shared undo/redo and drawing history
* User join/leave notifications
* Automatic reconnection

### Phase 3 – Advanced Features

* Modern gradient UI with glassmorphism
* Online users panel with color-coded avatars
* Real-time connection status indicator
* Toast notifications for system events
* Export canvas as PNG or JSON
* Optimized performance (throttled events, memory limits)
* Responsive mobile design

---

## **Architecture**

The system follows a **client-server** model using **WebSockets** for bi-directional data flow:

```
Client → Server (Socket.IO) → Broadcast → Other Clients
```

Each drawing event (`draw:start`, `draw:move`, `draw:end`) is captured and shared in real time.
Undo/Redo and Clear actions are synchronized globally.
The server stores up to 1000 strokes in memory per room.

---

## **Room System**

Rooms allow multiple independent drawing sessions:

* Each room has its own history and users
* Users join via `?room=roomID` or through the **Rooms** button
* Default room (`/`) for general use
* Shareable links like:

  ```
  https://your-app.com/?room=project-team
  ```

**Navigation Flow:**

```
Canvas → [🏠 Rooms] → Rooms Page → Create/Join Room → Canvas
```

Rooms are cleaned up automatically when empty.

---

## **Testing the Room System**

| Scenario                      | Expected Result           |
| ----------------------------- | ------------------------- |
| Same Room (`?room=shared`)    | Drawings sync instantly   |
| Different Rooms (`?room=A/B`) | Drawings are isolated     |
| No Parameter                  | Joins default room        |
| Room Creation                 | Generates shareable link  |
| Room Cleanup                  | Server clears empty rooms |

Check server logs to confirm:

```
User abc joined room: test1
Room test1 cleaned up
```

---

## **Technical Details**

### Backend

* **Server:** Node.js + Express + Socket.IO
* **Responsibilities:** static file serving, user tracking, stroke broadcasting, room management

### Frontend

* **Canvas API** for rendering
* **Pure JS modules:**

  * `canvas.js` – Drawing logic
  * `websocket.js` – Real-time events
  * `main.js` – Initialization
  * `tools.js` – State management

### Data Flow

```
Draw → Emit → Server → Broadcast → Render on others
```

---

## **Performance and Scalability**

* Drawing events: ~100 bytes per action
* Cursor updates: 50ms throttle
* Undo/Redo stack limited to 50 states
* Tested up to 10+ concurrent users
* Future scaling via Redis adapter or database persistence

---

## **Security and Reliability**

* Input validation for draw events
* Basic error handling and reconnection
* Recommended improvements: authentication, rate limiting, database persistence

---

## **UI Overview**

* **Toolbar:** Brush, Eraser, Undo, Redo, Color, Size, Save, Export, Users, Rooms
* **Users Panel:** Shows connected users and colors
* **Canvas:** Fullscreen responsive surface
* **Toast Notifications:** For user events and connection status

---

## **Planned Enhancements**

* Persistent room storage
* Authentication and permissions
* Additional drawing tools (shapes, text)
* Room passwords
* Chat integration
* Database + Redis scaling

---

## **Learning Outcomes**

* Full-stack real-time communication
* Event-driven architecture
* Frontend state management with vanilla JS
* Performance optimization
* Clear modular code and documentation

---

## **License**

MIT License — free for educational or commercial use.

---

