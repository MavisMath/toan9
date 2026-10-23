# tools/check_js_error.py
import subprocess
import json
import urllib.request

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

# Let's run edge with remote debugging
import time

proc = subprocess.Popen([
    edge_path,
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    'http://localhost:8080/'
])

time.sleep(2)

try:
    with urllib.request.urlopen('http://localhost:9222/json') as r:
        tabs = json.loads(r.read())
        print('Tabs:', tabs)
        ws_url = tabs[0]['webSocketDebuggerUrl']
        print('WS URL:', ws_url)
except Exception as e:
    print('Failed to get tabs:', e)
finally:
    proc.terminate()
