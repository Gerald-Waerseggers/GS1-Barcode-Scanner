**Guide to Running and Using the Local Python Server with a Tray Icon**

---

### Overview

This guide explains how to use a Python-based local HTTP server with a tray icon. The server serves files from the same directory where the script resides. It includes a system tray icon for easy control and launches a browser to access the server.

---

### Features

- Serves files (e.g., `index.html`) from the same folder as the script.
- Includes a system tray icon with options to:
  - Open the server in a browser.
  - Stop the server.
- Runs a local server accessible at `http://localhost:8000`.

---

### Requirements

1. A Windows system.
2. Python installed (version 3.6 or newer).
3. Required Python libraries:
   - `pystray`
   - `Pillow`
4. The `launch.pyw` script.

To install the required libraries, run the following command in a terminal:

```
pip install pystray Pillow
```

---

### Step-by-Step Instructions

#### 1. Setup

1. Copy the provided `launch.pyw` script to a folder.
2. Place your files (e.g., `index.html`, `server_with_tray.py`) in the same folder.

#### 2. Start the Server

1. Double-click the `launch.pyw` file to start the server.
2. A system tray icon (a blue square with a white circle) will appear in the taskbar.

#### 3. Open the Server in a Browser

1. Right-click the tray icon.
2. Select **Open Browser**.
3. The browser will open `http://localhost:8000`, displaying your `index.html`.

#### 4. Stop the Server

1. Right-click the tray icon.
2. Select **Quit** to stop the server and close the application.

---

### Notes

- **Default Behavior**: The server automatically serves files from the folder containing the `launch.pyw` script. If your `index.html` doesn’t load, ensure it is in the same directory as the script.
- **Port**: The server runs on port `8000`. If this port is in use, you’ll need to free it or use a different server setup.
- **Troubleshooting**:
  - If the browser displays “ERR\_EMPTY\_RESPONSE,” verify that the script is in the correct folder.
  - Ensure your firewall is not blocking local connections.

---

### FAQ

#### Q1: How do I change the files being served?

A: Replace the files (e.g., `index.html`) in the folder containing the script. Restart the server if necessary.

#### Q2: Can I use this on another computer?

A: Yes, copy the `launch.pyw` script and your files to the target computer. Install Python and the required libraries, then follow the steps in this guide.\
\
Important!: Before you do please export the GTINREFmapping so you can import it on the new computer. From now on the mappings wont be in sync with each other



#### Q3: The server isn’t working. What should I do?

A:

1. Ensure the script is in the same folder as your files.
2. Check the system tray for the server icon.
3. Verify no other application is using port `8000`.
4. Contact IT (Gérald Waerseggers) for further assistance.

---

### Example Folder Structure

```
ScannerFolder
├── index.html
├── server_with_tray.py
└── launch.pyw
```

Place all your project files alongside the `launch.pyw` script. Then launch the script to serve your project locally.

---

Thank you for using this tool! If you have questions or need further help, reach out to the IT team.

