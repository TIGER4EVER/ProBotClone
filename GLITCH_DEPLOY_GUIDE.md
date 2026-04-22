# دليل نشر ProBot Clone على Glitch (مجاني 100% بدون فيزا)

## المقدمة

**Glitch** هي منصة استضافة مجانية تماماً ومش بتطلب فيزا أو أي بيانات دفع. بتشتغل من المتصفح مباشرة وسهلة جداً في الاستخدام.

---

## الخطوة 1: إنشاء حساب على Glitch

1. روح على: [https://glitch.com](https://glitch.com)
2. اضغط **"Sign in"** في أعلى يمين الصفحة
3. اختار **"Sign in with GitHub"** (عشان تربط حساب GitHub بتاعك)
4. وافق على الصلاحيات وخلاص، الحساب جاهز!

---

## الخطوة 2: استيراد المشروع من GitHub

1. بعد ما تسجل دخول، اضغط **"New Project"** في أعلى يمين الصفحة
2. اختار **"Import from GitHub"**
3. اكتب اسم الريبو بتاعك:
   ```
   TIGER4EVER/ProBotClone
   ```
4. اضغط Enter واستنى شوية لحد ما يستورد المشروع

---

## الخطوة 3: إعداد ملف .env

ده أهم خطوة! Glitch عنده ملف `.env` مخصوص للأسرار ومحدش بيشوفه غيرك.

1. في القائمة الجانبية على الشمال، دور على ملف اسمه **`.env`**
2. لو مش موجود، اعمل ملف جديد وسميه `.env`
3. اكتب فيه الكلام ده:

```
NODE_ENV=production
DATABASE_URL=file:./data/probot.db
DISCORD_BOT_TOKEN=هنا_حط_توكن_البوت
DISCORD_CLIENT_ID=هنا_حط_الكلاينت_اي_دي
DISCORD_CLIENT_SECRET=هنا_حط_الكلاينت_سيكريت
SESSION_SECRET=اكتب_اي_كلام_طويل_وعشوائي_هنا
BASE_URL=https://اسم-مشروعك.glitch.me
```

### شرح كل واحد:

| المتغير | إيه اللي تكتبه | منين تجيبه |
|---------|----------------|------------|
| `NODE_ENV` | `production` | اكتبها زي ما هي بالظبط |
| `DATABASE_URL` | `file:./data/probot.db` | اكتبها زي ما هي بالظبط |
| `DISCORD_BOT_TOKEN` | توكن البوت | من Discord Developer Portal (شرح تحت) |
| `DISCORD_CLIENT_ID` | الـ Client ID | من Discord Developer Portal (شرح تحت) |
| `DISCORD_CLIENT_SECRET` | الـ Client Secret | من Discord Developer Portal (شرح تحت) |
| `SESSION_SECRET` | أي كلام عشوائي طويل | اكتب أي حاجة زي: `mYsUpErSeCrEt12345xYz` |
| `BASE_URL` | رابط مشروعك على Glitch | هتلاقيه فوق في Glitch (شرح تحت) |

---

## الخطوة 4: إزاي تجيب بيانات Discord

### توكن البوت (DISCORD_BOT_TOKEN):
1. روح على: [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. اضغط **"New Application"** واكتب اسم البوت
3. من القائمة الجانبية اضغط **"Bot"**
4. اضغط **"Reset Token"** وانسخ التوكن
5. **مهم:** فعّل الثلاث Intents دول:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### الـ Client ID (DISCORD_CLIENT_ID):
1. في نفس الصفحة، روح على **"OAuth2"** من القائمة الجانبية
2. هتلاقي **Client ID** فوق، انسخه

### الـ Client Secret (DISCORD_CLIENT_SECRET):
1. في نفس صفحة **"OAuth2"**
2. اضغط **"Reset Secret"** جنب Client Secret
3. انسخ السيكريت اللي ظهر

---

## الخطوة 5: معرفة رابط المشروع (BASE_URL)

1. في Glitch، اضغط على اسم المشروع فوق على الشمال
2. هتلاقي الرابط بتاعك زي كده:
   ```
   https://اسم-المشروع.glitch.me
   ```
3. انسخ الرابط ده وحطه في `BASE_URL` في ملف `.env`

---

## الخطوة 6: تشغيل المشروع

1. بعد ما تحط كل الإعدادات في `.env`، Glitch هيعمل restart تلقائي
2. افتح **Terminal** في Glitch (من الأسفل اضغط "Terminal")
3. اكتب الأوامر دي:

```bash
npm install -g pnpm
pnpm install
pnpm run build
pnpm start
```

4. استنى شوية لحد ما يشتغل
5. افتح رابط المشروع بتاعك في المتصفح وشوف الداشبورد!

---

## الخطوة 7: دعوة البوت للسيرفر

1. روح على [Discord Developer Portal](https://discord.com/developers/applications)
2. اختار التطبيق بتاعك
3. روح على **"OAuth2"** > **"URL Generator"**
4. في **Scopes** اختار: `bot` و `applications.commands`
5. في **Bot Permissions** اختار: `Administrator`
6. انسخ الرابط اللي اتعمل تحت وافتحه في المتصفح
7. اختار السيرفر اللي عايز تضيف البوت فيه واضغط **"Authorize"**

---

## الخطوة 8: خلي البوت صاحي 24/7

Glitch المجاني بينام بعد 5 دقائق من عدم النشاط. عشان تخليه صاحي:

### الطريقة: استخدم UptimeRobot

1. روح على [https://uptimerobot.com](https://uptimerobot.com) وسجل حساب مجاني
2. اضغط **"Add New Monitor"**
3. حط الإعدادات دي:

| الإعداد | القيمة |
|---------|--------|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | ProBot Clone |
| **URL** | `https://اسم-مشروعك.glitch.me` |
| **Monitoring Interval** | 5 minutes |

4. اضغط **"Create Monitor"**

كده UptimeRobot هيبعت طلب كل 5 دقائق والبوت هيفضل صاحي!

---

## حدود Glitch المجاني

| الحد | التفاصيل |
|------|----------|
| **النوم** | بينام بعد 5 دقائق من عدم النشاط (UptimeRobot بيحل المشكلة دي) |
| **الرام** | 512 MB |
| **التخزين** | 200 MB |
| **ساعات التشغيل** | 1000 ساعة في الشهر |

---

## حل المشاكل الشائعة

### المشروع مش بيشتغل؟
- تأكد إن ملف `.env` فيه كل المتغيرات صح
- افتح Terminal واكتب `pnpm install` تاني

### البوت مش بيرد في الديسكورد؟
- تأكد إن `DISCORD_BOT_TOKEN` صح
- تأكد إنك فعلت الـ 3 Intents في Discord Developer Portal
- تأكد إنك دعوت البوت للسيرفر

### الداشبورد مش بيفتح؟
- استنى دقيقة لو المشروع نايم
- تأكد إن الـ `BASE_URL` هو نفس رابط Glitch بتاعك

### خطأ في قاعدة البيانات؟
- افتح Terminal واكتب:
  ```bash
  mkdir -p data
  pnpm drizzle-kit migrate
  ```

---

## ملخص سريع

1. اعمل حساب على Glitch بحساب GitHub
2. استورد ريبو TIGER4EVER/ProBotClone
3. حط الإعدادات في ملف .env
4. شغل المشروع من Terminal
5. ادعو البوت للسيرفر
6. استخدم UptimeRobot عشان يفضل شغال

**بالتوفيق يا صديقي!** 🚀
