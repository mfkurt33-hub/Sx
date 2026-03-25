#!/usr/bin/env python3
import subprocess, json, os, shutil, logging
from datetime import datetime
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler, filters

logging.basicConfig(level=logging.INFO)

TOKEN   = "8669055916:AAHY7Agku0hH0UIP_uKTZducFjZbjHDY7Mo"
CHAT_ID = 7565707128
INDEX      = "/var/www/html/index.html"
YEDEK      = "/var/www/html/index_yedek.html"
FIYAT_FILE = "/root/fiyatlar.json"

BAKIM = """<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bakim</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0A0806;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif;text-align:center;padding:40px}h1{color:#D4AF37;font-size:28px;margin-bottom:16px}p{color:rgba(255,255,255,.6);font-size:15px;margin-bottom:28px;line-height:1.8}a{background:#25D366;color:#fff;padding:12px 32px;text-decoration:none;border-radius:4px}</style></head><body><div><div style="font-size:52px;margin-bottom:20px">⚜</div><h1>Salih Cetinkaya Kuyumculuk</h1><p>Sitemiz bakim modunda.<br>Kisa sure icinde donecegiz.</p><a href="https://wa.me/905324143365">WhatsApp ile ulas</a></div></body></html>"""

ADIMLAR = [
    ("gram_alis","Has Altin Alis"),("gram_satis","Has Altin Satis"),
    ("ceyrek_alis","Ceyrek Alis"),("ceyrek_satis","Ceyrek Satis"),
    ("yarim_alis","Yarim Alis"),("yarim_satis","Yarim Satis"),
    ("tam_alis","Tam Altin Alis"),("tam_satis","Tam Altin Satis"),
    ("bilezik_alis","22 Ayar Alis"),("bilezik_satis","22 Ayar Satis"),
    ("usd_alis","Dolar Alis"),("usd_satis","Dolar Satis"),
    ("eur_alis","Euro Alis"),("eur_satis","Euro Satis"),
]

oturum = {}

def yetki(u):
    return u.effective_chat.id == CHAT_ID

async def start(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    await u.message.reply_text(
        "Salih Cetinkaya Yonetim Botu\n\n"
        "SITE\n/ac /kapat /bakim /geri /yenile /durum\n\n"
        "FIYAT\n/fiyatlar /fiyatgir /fiyatsifirla\n\n"
        "SUNUCU\n/sunucu /log /yedek"
    )

async def ac(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    if os.path.exists(YEDEK): shutil.copy(YEDEK, INDEX)
    r = subprocess.run(["systemctl","start","nginx"], capture_output=True)
    await u.message.reply_text("Site acildi!" if r.returncode==0 else "Hata: "+r.stderr.decode()[:200])

async def kapat(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    r = subprocess.run(["systemctl","stop","nginx"], capture_output=True)
    await u.message.reply_text("Site kapatildi!" if r.returncode==0 else "Hata: "+r.stderr.decode()[:200])

async def yenile(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    r = subprocess.run(["systemctl","restart","nginx"], capture_output=True)
    await u.message.reply_text("Nginx yenilendi!" if r.returncode==0 else "Hata: "+r.stderr.decode()[:200])

async def bakim(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    if os.path.exists(INDEX): shutil.copy(INDEX, YEDEK)
    with open(INDEX,"w",encoding="utf-8") as f: f.write(BAKIM)
    await u.message.reply_text("Bakim modu acildi!\n/geri ile don.")

async def geri(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    if os.path.exists(YEDEK):
        shutil.copy(YEDEK, INDEX)
        await u.message.reply_text("Site normale dondu!")
    else:
        await u.message.reply_text("Yedek yok. index.html yukle.")

async def durum(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    r = subprocess.run(["systemctl","is-active","nginx"], capture_output=True, text=True)
    site = "ACIK" if r.stdout.strip()=="active" else "KAPALI"
    disk = shutil.disk_usage("/")
    dp = str(round(disk.used/disk.total*100,1))
    dstr = str(disk.used//1024**3)+"GB/"+str(disk.total//1024**3)+"GB"
    try:
        with open("/proc/meminfo") as f: mem = f.read()
        md = {}
        for line in mem.strip().split("\n"):
            p = line.split()
            if len(p)>=2:
                try: md[p[0].rstrip(":")] = int(p[1])
                except: pass
        mp = str(round((1-md.get("MemAvailable",0)/max(md.get("MemTotal",1),1))*100,1))
    except: mp = "?"
    r2 = subprocess.run(["uptime","-p"], capture_output=True, text=True)
    await u.message.reply_text(
        "Site: "+site+"\nDisk: "+dstr+" ("+dp+"%)\nRAM: "+mp+"%\nUptime: "+r2.stdout.strip()+"\nSaat: "+datetime.now().strftime("%d.%m.%Y %H:%M")
    )

async def sunucu(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    r1 = subprocess.run(["df","-h","/"], capture_output=True, text=True)
    r2 = subprocess.run(["free","-h"], capture_output=True, text=True)
    r3 = subprocess.run(["uptime"], capture_output=True, text=True)
    await u.message.reply_text("DISK:\n"+r1.stdout+"\nRAM:\n"+r2.stdout+"\nUPTIME:\n"+r3.stdout)

async def log(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    r = subprocess.run(["tail","-n","25","/var/log/nginx/error.log"], capture_output=True, text=True)
    await u.message.reply_text("LOGLAR:\n\n"+(r.stdout.strip() or "Log bos!")[-3000:])

async def yedek(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    tarih = datetime.now().strftime("%Y%m%d_%H%M")
    yol = "/root/yedek_"+tarih+".html"
    if os.path.exists(INDEX):
        shutil.copy(INDEX, yol)
        await u.message.reply_text("Yedek alindi:\n"+yol)
    else:
        await u.message.reply_text("index.html bulunamadi!")

async def fiyatlar(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    try:
        with open(FIYAT_FILE,encoding="utf-8") as f: data=json.load(f)
        isimler = dict(ADIMLAR)
        msg = "FIYATLAR:\n\n"+"\n".join(isimler.get(k,k)+": "+str(v)+" TL" for k,v in data.items() if v)
    except:
        msg = "Fiyat yok.\n/fiyatgir ile gir."
    await u.message.reply_text(msg)

async def fiyatgir(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    oturum[u.effective_chat.id] = {"adim":0,"data":{}}
    await u.message.reply_text("Fiyat girisi basliyor.\nGecmek icin 0 yaz.\n\n"+ADIMLAR[0][1]+":")

async def fiyatsifirla(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    if os.path.exists(FIYAT_FILE): os.remove(FIYAT_FILE)
    await u.message.reply_text("Fiyatlar silindi!")

async def mesaj(u: Update, c: ContextTypes.DEFAULT_TYPE):
    if not yetki(u): return
    cid = u.effective_chat.id
    if cid not in oturum: return
    s = oturum[cid]
    txt = u.message.text.strip()
    a = s["adim"]
    if txt != "0":
        try: s["data"][ADIMLAR[a][0]] = float(txt.replace(",","."))
        except:
            await u.message.reply_text("Sayi gir veya 0 ile gec.")
            return
    s["adim"] += 1
    if s["adim"] < len(ADIMLAR):
        await u.message.reply_text(ADIMLAR[s["adim"]][1]+":")
    else:
        with open(FIYAT_FILE,"w",encoding="utf-8") as f: json.dump(s["data"],f,ensure_ascii=False)
        del oturum[cid]
        ozet = "\n".join(dict(ADIMLAR).get(k,k)+": "+str(v)+" TL" for k,v in s["data"].items())
        await u.message.reply_text("Fiyatlar kaydedildi!\n\n"+ozet)

def main():
    app = ApplicationBuilder().token(TOKEN).build()
    for cmd, fn in [
        ("start",start),("ac",ac),("kapat",kapat),("yenile",yenile),
        ("bakim",bakim),("geri",geri),("durum",durum),("sunucu",sunucu),
        ("log",log),("yedek",yedek),("fiyatlar",fiyatlar),
        ("fiyatgir",fiyatgir),("fiyatsifirla",fiyatsifirla),
    ]:
        app.add_handler(CommandHandler(cmd, fn))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, mesaj))
    print("Bot baslatildi...")
    app.run_polling()

if __name__ == "__main__":
    main()
