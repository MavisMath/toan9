import sys
import os
import zipfile
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

folder = r'chuyen-de-co-ban-mon-toan-9-ket-noi-tri-thuc-voi-cuoc-song-tap-1'

def read_docx_paragraphs(file_path):
    with zipfile.ZipFile(file_path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        paras = []
        for p in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
            if texts:
                paras.append(''.join(texts))
        return paras

for doc in ['Ma_de_101.docx', 'Ma_de_102.docx']:
    path = os.path.join(folder, doc)
    if os.path.exists(path):
        paras = read_docx_paragraphs(path)
        print(f"=== {doc} ({len(paras)} paragraphs) ===")
        for p in paras[:35]:
            print(p)
