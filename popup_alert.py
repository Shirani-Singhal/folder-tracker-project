import time
import os
import json
from tkinter import messagebox, Tk

LOG_FILE = 'visit_logs.txt'
last_size = 0

MY_NAME = "Shirani Singhal"

def show_alert(visitor, video, checklist_status):
    message = (
        f"My Name: {MY_NAME}\n"
        f"Visitor Name: {visitor}\n"
        f"Video Completed: {video}\n"
        f"Checklist Status: {checklist_status}"
    )
    
    root = Tk()
    root.withdraw()  # Hide main window
    messagebox.showinfo("Folder Activity Alert", message)
    root.destroy()

try:
    while True:
        if os.path.exists(LOG_FILE):
            current_size = os.path.getsize(LOG_FILE)
            if current_size > last_size:
                with open(LOG_FILE, 'r') as f:
                    f.seek(last_size)
                    new_lines = f.readlines()
                    for line in new_lines:
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            log = json.loads(line)
                            visitor = log.get("visitor", "Unknown")
                            action = log.get("action", "Unknown action")
                            video = log.get("video", "N/A")

                            if action == 'marked video as completed':
                                show_alert(visitor, video, "Checked")
                            elif action == 'visited folder':
                                show_alert(visitor, "N/A", "N/A")

                        except json.JSONDecodeError:
                            continue
                last_size = current_size
        time.sleep(2)
except KeyboardInterrupt:
    print("\n[+] Popup alert monitoring stopped by user.")
