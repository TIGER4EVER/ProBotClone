# دليل نشر ProBot Clone على Fly.io (مجاني)

## المقدمة

**Fly.io** هي منصة استضافة سحابية عندها خطة مجانية كويسة. بتشغل المشروع بتاعك في Docker containers وبتديك سيرفرات في أكتر من 30 منطقة حول العالم. الخطة المجانية بتديك 3 machines صغيرة و 256MB رام.

---

## الخطوة 1: إنشاء حساب على Fly.io

1. روح على: [https://fly.io](https://fly.io)
2. اضغط **"Sign Up"**
3. سجل بالإيميل بتاعك أو بحساب **GitHub**
4. أكد الإيميل بتاعك

**ملاحظة:** Fly.io ممكن يطلب فيزا للتحقق بس مش هيخصم منك حاجة على الخطة المجانية. لو مطلبش، يبقى تمام!

---

## الخطوة 2: تثبيت Fly CLI على جهازك

محتاج تنزل أداة `flyctl` على جهازك عشان ترفع المشروع. افتح Terminal أو CMD واكتب:

### على Windows (PowerShell):
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### على Mac:
```bash
brew install flyctl
```

### على Linux (Ubuntu):
```bash
curl -L https://fly.io/install.sh | sh
```

بعد التثبيت، سجل دخول:
```bash
flyctl auth login
```
هيفتحلك المتصفح، سجل دخول وارجع للـ Terminal.

---

## الخطوة 3: تحضير المشروع

1. نزل المشروع من GitHub على جهازك:
```bash
git clone https://github.com/TIGER4EVER/ProBotClone.git
cd ProBotClone
```

2. تأكد إن ملف `fly.toml` موجود في المشروع (هنرفعه على GitHub كمان).

3. تأكد إن ملف `Dockerfile` موجود (موجود بالفعل في المشروع).

---

## الخطوة 4: إنشاء التطبيق على Fly.io

اكتب الأمر ده في Terminal وأنت جوا مجلد المشروع:

```bash
flyctl apps create probot-clone
```

لو الاسم مش متاح، اختار اسم تاني:
```bash
flyctl apps create اسم-تاني-هنا
```

**مهم:** لو غيرت الاسم، لازم تغيره كمان في ملف `fly.toml` في أول سطر.

---

## الخطوة 5: إنشاء مساحة تخزين (Volume)

عشان قاعدة البيانات متتمسحش مع كل deploy:

```bash
flyctl volumes create probot_data --region iad --size 1
```

ده هيعمل مساحة تخزين 1 جيجا في منطقة iad (واشنطن).

---

## الخطوة 6: إعداد الأسرار (Environment Variables)

حط كل المتغيرات السرية بالأوامر دي (غيّر القيم بتاعتك):

```bash
flyctl secrets set DISCORD_BOT_TOKEN=هنا_حط_توكن_البوت
flyctl secrets set DISCORD_CLIENT_ID=هنا_حط_الكلاينت_اي_دي
flyctl secrets set DISCORD_CLIENT_SECRET=هنا_حط_الكلاينت_سيكريت
flyctl secrets set SESSION_SECRET=اكتب_اي_كلام_طويل_وعشوائي
flyctl secrets set BASE_URL=https://probot-clone.fly.dev
```

### منين تجيب كل قيمة:

| المتغير | منين تجيبه |
|---------|------------|
| `DISCORD_BOT_TOKEN` | Discord Developer Portal > التطبيق بتاعك > Bot > Reset Token |
| `DISCORD_CLIENT_ID` | Discord Developer Portal > التطبيق بتاعك > OAuth2 > Client ID |
| `DISCORD_CLIENT_SECRET` | Discord Developer Portal > التطبيق بتاعك > OAuth2 > Reset Secret |
| `SESSION_SECRET` | اكتب أي كلام طويل عشوائي زي: `xK9mP2qL7wN4vR8tY3bJ6hF1` |
| `BASE_URL` | `https://اسم-التطبيق.fly.dev` (نفس الاسم اللي اخترته) |

### إزاي تجيب بيانات Discord:

1. روح على: [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. اضغط **"New Application"** واكتب اسم البوت
3. من القائمة الجانبية اضغط **"Bot"**:
   - اضغط **"Reset Token"** وانسخ التوكن (ده DISCORD_BOT_TOKEN)
   - فعّل الثلاث Intents:
     - ✅ Presence Intent
     - ✅ Server Members Intent
     - ✅ Message Content Intent
4. من القائمة الجانبية اضغط **"OAuth2"**:
   - انسخ **Client ID** (ده DISCORD_CLIENT_ID)
   - اضغط **"Reset Secret"** وانسخ السيكريت (ده DISCORD_CLIENT_SECRET)

---

## الخطوة 7: النشر (Deploy)

دلوقتي الخطوة الأخيرة! اكتب:

```bash
flyctl deploy
```

استنى شوية (ممكن ياخد 3-5 دقائق أول مرة). لما يخلص هيقولك:

```
==> Monitoring deployment
 1 desired, 1 placed, 1 healthy, 0 unhealthy
--> v1 deployed successfully
```

الداشبورد بتاعك هيكون على:
```
https://probot-clone.fly.dev
```

---

## الخطوة 8: دعوة البوت للسيرفر

1. روح على [Discord Developer Portal](https://discord.com/developers/applications)
2. اختار التطبيق بتاعك
3. روح على **"OAuth2"** > **"URL Generator"**
4. في **Scopes** اختار: `bot` و `applications.commands`
5. في **Bot Permissions** اختار: `Administrator`
6. انسخ الرابط اللي اتعمل تحت وافتحه في المتصفح
7. اختار السيرفر اللي عايز تضيف البوت فيه واضغط **"Authorize"**

---

## الخطوة 9: أوامر مفيدة

| الأمر | الوظيفة |
|-------|---------|
| `flyctl status` | شوف حالة التطبيق |
| `flyctl logs` | شوف اللوجات (مفيد لو في مشكلة) |
| `flyctl ssh console` | ادخل على السيرفر مباشرة |
| `flyctl secrets list` | شوف قائمة المتغيرات السرية |
| `flyctl deploy` | ارفع تحديث جديد |
| `flyctl open` | افتح الموقع في المتصفح |

---

## حدود الخطة المجانية على Fly.io

| الحد | التفاصيل |
|------|----------|
| **الماكينات** | حتى 3 shared-cpu-1x machines |
| **الرام** | 256 MB لكل ماكينة |
| **التخزين** | 1 GB volumes مجاني |
| **الترافيك** | 100 GB outbound مجاني في الشهر |
| **النوم** | مش بينام لو حطيت `auto_stop_machines = false` في fly.toml |

**ميزة مهمة:** Fly.io مش بينام زي Render و Glitch! لو حطيت الإعداد `auto_stop_machines = false` (وده موجود بالفعل في ملف fly.toml)، البوت هيفضل شغال 24/7.

---

## حل المشاكل الشائعة

### خطأ في الـ Deploy؟
- تأكد إن ملف `Dockerfile` موجود وصح
- شوف اللوجات: `flyctl logs`

### البوت مش بيشتغل؟
- تأكد إن كل الـ secrets اتحطت صح: `flyctl secrets list`
- تأكد إنك فعلت الـ 3 Intents في Discord Developer Portal

### الداشبورد مش بيفتح؟
- جرب: `flyctl status` وشوف لو الماكينة شغالة
- جرب: `flyctl logs` وشوف لو في خطأ

### مشكلة في قاعدة البيانات؟
- تأكد إن الـ Volume اتعمل: `flyctl volumes list`
- لو مفيش volume، اعمله تاني: `flyctl volumes create probot_data --region iad --size 1`

### عايز تحذف التطبيق وتبدأ من الأول؟
```bash
flyctl apps destroy probot-clone
```

---

## ملخص سريع

1. اعمل حساب على fly.io
2. نزل flyctl وسجل دخول
3. نزل المشروع من GitHub
4. اعمل التطبيق والـ Volume
5. حط الـ Secrets (التوكنات)
6. اعمل Deploy
7. ادعو البوت للسيرفر

**بالتوفيق يا صديقي!** 🚀
