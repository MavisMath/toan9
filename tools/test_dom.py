import os, subprocess

paths = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
]
edge = None
for p in paths:
    if os.path.exists(p):
        edge = p
        break

print('Edge path:', edge)
if edge:
    cmd = [edge, '--headless', '--disable-gpu', '--dump-dom', 'http://localhost:8080/']
    try:
        out = subprocess.check_output(cmd, stderr=subprocess.STDOUT, timeout=10)
        dom = out.decode('utf-8', errors='ignore')
        print('Dump size:', len(dom))
        idx = dom.find('id="home-content"')
        print('home-content snippet:', repr(dom[idx:idx+300]))
    except Exception as e:
        print('Error running edge:', e)
