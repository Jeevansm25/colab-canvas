Here’s a **refined, professional, and concise rewrite** of your **Architecture Documentation** — keeping all the essential technical details while removing redundancy and simplifying the language.
It’s written in a clear, student-professional tone suitable for documentation or portfolio submission.

---

# 🏗️ Architecture Overview

## System Design

The **Collaborative Canvas** follows a **client-server architecture** using **WebSockets (Socket.IO)** for real-time communication.
All drawing actions are captured on the client, sent to the server, and broadcast to all connected users in the same room, ensuring synchronized collaboration.

---

## Data Flow

**Drawing Pipeline:**

```
User Action → Canvas Event → Emit to Server → Broadcast → Other Clients → Render
```

1. **Client captures stroke data**

   * Local canvas updates immediately
   * Data includes position, color, and brush size

2. **Server receives and rebroadcasts**

   ```javascript
   socket.on('draw:move', data => {
     socket.broadcast.emit('draw:move', { ...data, userId: socket.id })
   })
   ```

3. **Clients render incoming data**

   ```javascript
   socket.on('draw:move', data => draw(data.x, data.y, data.color, data.size))
   ```

---

## Event Protocol

| Event         | Direction       | Description                        |
| ------------- | --------------- | ---------------------------------- |
| `draw:start`  | Client → Server | Start stroke with color and size   |
| `draw:move`   | Client ↔ Server | Transmit coordinates while drawing |
| `draw:end`    | Client → Server | Complete stroke (send path)        |
| `undo`        | Client ↔ Server | Remove last stroke                 |
| `clear`       | Client ↔ Server | Clear canvas for all users         |
| `cursor:move` | Client ↔ Server | Update user cursor positions       |

---

## History and Synchronization

When a new user connects:

* Server sends current drawing history
* Client replays strokes to sync with existing canvas

```javascript
socket.emit('init', { history, userId, userColor })
```

Undo and redo are globally shared — one user’s action affects all.
Each client maintains local stacks for responsiveness.

---

## Performance and Optimization

**Challenges:** High-frequency draw events and growing memory usage.
**Solutions:**

* Throttled cursor updates (50ms interval)
* Lightweight JSON payloads (no bitmap transfer)
* History limited to 1000 strokes per room
* Undo stack capped at 50 states

**Future Enhancements:**

* Event batching or binary transmission
* Offscreen rendering for large histories

---

## Scalability and Persistence

### Current Setup

* In-memory storage for each room
* Stateless across restarts
* All users share global access

### Scalable Architecture

* **Rooms:** `socket.join(roomId)` for isolated canvases
* **Persistence:** Save room history to file or database
* **Redis Adapter:** Enables horizontal scaling across multiple servers
* **Load Balancing:** Use Socket.IO Redis adapter for distributed sessions

---

## Security and Reliability

| Concern          | Current State   | Recommended Improvement          |
| ---------------- | --------------- | -------------------------------- |
| Authentication   | None            | Token-based validation           |
| Rate Limiting    | None            | Express middleware               |
| Input Validation | Basic           | Verify coordinates, color, size  |
| XSS / Abuse      | Not implemented | Sanitize inputs, add constraints |

Example:

```javascript
if (!isValidCoordinate(x, y)) return
if (!isValidColor(color)) return
```

---

## Technology Choices

| Component            | Technology              | Reason                                 |
| -------------------- | ----------------------- | -------------------------------------- |
| **Real-time engine** | Socket.IO               | Reliable, reconnection, built-in rooms |
| **Frontend**         | Vanilla JS + Canvas API | Lightweight, no build tools            |
| **Backend**          | Node.js + Express       | Fast, scalable, and simple to deploy   |

---

## Testing

### Manual

* Open multiple tabs
* Draw and confirm synchronization
* Test undo/redo and reconnect behavior

### Automated (Future)

Use Jest + Socket.IO client to simulate users:

```javascript
test('syncs drawings across clients', async () => { ... })
```

---

## Deployment

### Development

```bash
npm install
npm start
# Visit http://localhost:3000
```

### Production

* Use **PM2** for process management
* Use **Nginx** as reverse proxy
* Deploy on Render, Railway, or DigitalOcean

```bash
pm2 start server/server.js --name collab-canvas
```

---

## Summary

* **Architecture:** Client–Server with WebSocket communication
* **Scalability:** Room-based, extendable with Redis
* **Performance:** Optimized for low latency
* **Security:** Basic safeguards, extensible for auth and rate limits
* **Deployment:** Portable Node.js app, runs anywhere

---

**Last Updated:** Phase 2 – Real-Time Collaboration
**Author:** Jeevan S M

---

Would you like me to rewrite this version as a **clean Markdown file (architecture.md)** ready for your GitHub repo (with better formatting and headers)?
