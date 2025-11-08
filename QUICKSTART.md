
# ⚡ Quick Start Guide

Get your collaborative drawing canvas running in under a minute.

---

## **For Users**

### Option 1: Use Hosted Version

If deployed, simply open the live URL and start drawing.

### Option 2: Run Locally

**1. Download & Setup**

```bash
git clone <repo_url>
cd collaborative-canvas
npm install
npm start
```

**2. Open Browser**

```
http://localhost:3000
```

**3. Start Drawing**
Draw, erase, undo, and redo directly from your toolbar.

---

## **For Developers**

### Prerequisites

* Node.js v14+
* npm installed

### Commands

```bash
# Install dependencies
npm install

# Start server
npm start

# Development (auto-reload)
npm run dev
```

---

## **Testing Collaboration**

1. Open two browser tabs at `http://localhost:3000`.
2. Draw in one — strokes appear in both instantly.
3. To test rooms:

   ```
   http://localhost:3000/?room=team
   http://localhost:3000/?room=team
   ```

   Drawings sync only within the same room.

---

## **Using the App**

### Drawing Tools

* **Brush (B)** – Freehand tool
* **Eraser (E)** – Remove strokes
* **Undo (Ctrl+Z)**
* **Redo (Ctrl+Y)**
* **Color Picker** – Choose custom colors
* **Brush Size Slider** – Adjust stroke thickness

### Collaboration

* Real-time user cursors
* Color-coded names
* Toast notifications for joins/leaves
* Live connection indicator

---

## **Rooms**

Open `rooms.html` or click the **🏠 Rooms** button to:

* Create a random room
* Join a specific one
* Return to default canvas

Share links easily:

```
http://localhost:3000/?room=myRoom
```

---

## **Troubleshooting**

| Issue                | Cause              | Solution                               |
| -------------------- | ------------------ | -------------------------------------- |
| `npm start` fails    | Node not installed | Install Node.js v14+                   |
| Disconnected message | Server not running | Check terminal                         |
| Drawings not syncing | Different rooms    | Verify same URL                        |
| Lag or delay         | Heavy load         | Use smaller brush size or clear canvas |

---

## **Testing Checklist**

* [ ] Can open `rooms.html`
* [ ] Create and join random room
* [ ] Drawings sync in same room
* [ ] Drawings isolated across rooms
* [ ] Toasts and users panel visible

---

## **Mobile Support**

* Works on Chrome/Safari
* Draw using touch
* Landscape mode recommended

---

## **Next Steps**

* Explore features (save, export, undo, redo)
* Invite others to collaborate
* Experiment with multiple rooms
* Deploy online using Render or Railway

---

## **Deployment (Optional)**

```bash
npm install
npm start
# App runs on http://localhost:3000
```

For production:
Use **Render**, **Railway**, or **DigitalOcean** for WebSocket support.

---

## **Success Criteria**

Your setup is correct if:

* You can draw and see strokes across users
* Room links isolate sessions
* Server shows correct room logs

---

These two files — `README.md` and `QUICKSTART.md` — now fully replace the previous eight, preserving all critical information while keeping the documentation **clear, efficient, and professional**.
