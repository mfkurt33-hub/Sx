#!/usr/bin/env python3
# Sunucuda calistir: python3 fiyatcek_test.py
import urllib.request, json, re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
    'Accept': 'application/json, text/html, */*',
    'Accept-Language': 'tr-TR,tr;q=0.9',
    'Referer': 'https://www.haremaltin.com/',
}

print("=== HAREMALTIN TEST ===\n")

# 1. Ana sayfa HTML'inden veri cek
try:
    req = urllib.request.Request('https://www.haremaltin.com/altin-fiyatlari', headers=headers)
    with urllib.request.urlopen(req, timeout=10) as r:
        html = r.read().decode('utf-8','ignore')
        print(f"Ana sayfa boyutu: {len(html)} chars")
        # JSON data ara
        matches = re.findall(r'"gram[^"]*":\s*\{[^}]+\}', html)
        if matches:
            print("JSON buludu:", matches[0][:200])
        # Fiyat pattern ara
        prices = re.findall(r'(\d{3,6}[.,]\d{2,4})', html)
        if prices:
            print("Fiyat ornekleri:", prices[:10])
except Exception as e:
    print(f"Ana sayfa hatasi: {e}")

# 2. API endpoint'leri dene
apis = [
    'https://www.haremaltin.com/api/altin-fiyatlari',
    'https://www.haremaltin.com/api/fiyatlar', 
    'https://www.haremaltin.com/altin-fiyatlari/data',
    'https://www.haremaltin.com/data.json',
]

for url in apis:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as r:
            data = r.read().decode('utf-8','ignore')
            print(f"\n✅ {url}")
            print(data[:300])
    except Exception as e:
        print(f"❌ {url}: {str(e)[:80]}")

# 3. Truncgil (backup)
try:
    req = urllib.request.Request('https://finans.truncgil.com/v4/today.json', headers=headers)
    with urllib.request.urlopen(req, timeout=5) as r:
        data = json.loads(r.read().decode())
        gram = data.get('Gram Altin', data.get('gram altin', {}))
        print(f"\n✅ Truncgil calisiyor!")
        print(f"Gram Altin: {data.get('Gram Altin', 'yok')}")
except Exception as e:
    print(f"❌ Truncgil: {e}")
