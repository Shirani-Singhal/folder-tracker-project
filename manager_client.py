import socketio
from plyer import notification

sio = socketio.Client()

@sio.event
def connect():
    print("✅ Connected to server.")

@sio.on("new_visit")
def handle_new_visit(data):
    print("🚨 New Visit:", data)
    notification.notify(
        title="🚨 New Activity",
        message=f"{data['visitor']} | {data['action']} | {data.get('file','')}",
        timeout=5
    )

@sio.event
def disconnect():
    print("❌ Disconnected from server.")

# Replace with your Render app URL
sio.connect("https://folder-tracker-project-7jh7.onrender.com", transports=["websocket"])
sio.wait()
