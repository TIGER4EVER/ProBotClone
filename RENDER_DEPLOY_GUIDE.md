# دليل نشر ProBot Clone على Render (مجاني)

## المقدمة

الدليل ده هيشرحلك خطوة بخطوة إزاي تنشر مشروع ProBot Clone على منصة **Render** ببلاش. Render هي منصة استضافة سحابية بتقدم خطة مجانية كويسة للمشاريع الصغيرة والمتوسطة.

---

## الخطوة 1: إنشاء حساب على Render

1. روح على الموقع: [https://render.com](https://render.com)
2. اضغط على **"Get Started for Free"**
3. سجل بحساب **GitHub** بتاعك (ده أسهل طريقة وهيسهل ربط الريبو بعدين)
4. أكد الإيميل بتاعك لو طلب منك

---

## الخطوة 2: ربط الريبو من GitHub

1. بعد ما تسجل دخول، اضغط على **"New +"** في أعلى الصفحة
2. اختار **"Web Service"**
3. هتلاقي قائمة بالريبوهات بتاعتك على GitHub
4. اختار ريبو **ProBotClone**
5. لو مش ظاهر، اضغط **"Configure account"** واسمح لـ Render يوصل للريبو

---

## الخطوة 3: إعدادات المشروع

بعد ما تختار الريبو، عدّل الإعدادات دي:

| الإعداد | القيمة |
|---------|--------|
| **Name** | `probot-clone` (أو أي اسم تحبه) |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install -g pnpm && pnpm install --frozen-lockfile && pnpm run build` |
| **Start Command** | `chmod +x start.sh && ./start.sh` أو `pnpm start` |
| **Plan** | **Free** |

---

## الخطوة 4: إعداد Environment Variables

ده أهم خطوة! اضغط على **"Advanced"** وبعدين **"Add Environment Variable"** وحط المتغيرات دي:

| المتغير | الوصف | مثال |
|---------|-------|------|
| `NODE_ENV` | بيئة التشغيل | `production` |
| `DATABASE_URL` | مسار قاعدة البيانات | `file:./data/probot.db` |
| `DISCORD_BOT_TOKEN` | توكن البوت من Discord Developer Portal | `MTI3...` |
| `DISCORD_CLIENT_ID` | الـ Client ID بتاع التطبيق | `1234567890` |
| `DISCORD_CLIENT_SECRET` | الـ Client Secret بتاع التطبيق | `abc123...` |
| `SESSION_SECRET` | مفتاح سري للجلسات (اكتب أي حاجة طويلة وعشوائية) | `my-super-secret-key-12345` |
| `BASE_URL` | رابط الداشبورد بعد النشر | `https://probot-clone.onrender.com` |

### إزاي تجيب توكن البوت من Discord؟

1. روح على [Discord Developer Portal](https://discord.com/developers/applications)
2. اضغط **"New Application"** واكتب اسم البوت
3. من القائمة الجانبية روح على **"Bot"**
4. اضغط **"Reset Token"** وانسخ التوكن
5. فعّل **"Message Content Intent"** و **"Server Members Intent"** و **"Presence Intent"**
6. من **"OAuth2"** انسخ الـ **Client ID** و **Client Secret**

---

## الخطوة 5: النشر

1. بعد ما تحط كل الإعدادات، اضغط **"Create Web Service"**
2. Render هيبدأ يبني المشروع (ممكن ياخد 3-5 دقائق أول مرة)
3. لما يخلص، هتلاقي رابط الداشبورد بتاعك زي كده:
   ```
   https://probot-clone.onrender.com
   ```
4. افتح الرابط وسجل دخول بحساب Discord بتاعك

---

## الخطوة 6: دعوة البوت للسيرفر

1. روح على [Discord Developer Portal](https://discord.com/developers/applications)
2. اختار التطبيق بتاعك
3. روح على **"OAuth2"** > **"URL Generator"**
4. في **Scopes** اختار: `bot` و `applications.commands`
5. في **Bot Permissions** اختار الصلاحيات اللي محتاجها:
   - `Administrator` (أسهل حاجة) أو اختار صلاحيات محددة
6. انسخ الرابط اللي اتعمل وافتحه في المتصفح
7. اختار السيرفر اللي عايز تضيف البوت فيه

---

## حدود الخطة المجانية على Render

لازم تعرف الحاجات دي عن الخطة المجانية:

| الحد | التفاصيل |
|------|----------|
| **النوم (Sleep)** | السيرفر بينام بعد 15 دقيقة من عدم النشاط |
| **الصحيان** | بياخد 30-60 ثانية عشان يصحى لما حد يفتح الموقع |
| **ساعات التشغيل** | 750 ساعة مجانية في الشهر |
| **الرام** | 512 MB |
| **التخزين** | 1 GB (مع Disk) |

---

## نصائح مهمة: إزاي تخلي البوت صاحي 24/7

عشان البوت ميناموش على الخطة المجانية، استخدم **UptimeRobot**:

1. روح على [https://uptimerobot.com](https://uptimerobot.com) وسجل حساب مجاني
2. اضغط **"Add New Monitor"**
3. حط الإعدادات دي:

| الإعداد | القيمة |
|---------|--------|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | ProBot Clone |
| **URL** | `https://probot-clone.onrender.com` |
| **Monitoring Interval** | 5 minutes |

4. اضغط **"Create Monitor"**

كده UptimeRobot هيبعت طلب للموقع كل 5 دقائق وده هيخليه صاحي طول الوقت.

---

## حل المشاكل الشائعة

### المشروع مش بيتبنى؟
- تأكد إن الـ Build Command صح
- شوف الـ Logs في Render عشان تعرف الخطأ

### البوت مش بيشتغل؟
- تأكد إن الـ `DISCORD_BOT_TOKEN` صح
- تأكد إنك فعلت الـ Intents في Discord Developer Portal

### الداشبورد مش بيفتح؟
- استنى دقيقة لو السيرفر نايم
- تأكد إن الـ `BASE_URL` هو نفس رابط Render

### مشكلة في قاعدة البيانات؟
- تأكد إن الـ `DATABASE_URL` هو `file:./data/probot.db`
- لو عايز تبدأ من الأول، امسح الـ Disk من إعدادات Render

---

## ملخص سريع

1. اعمل حساب على Render وربط GitHub
2. اعمل Web Service جديد واختار ريبو ProBotClone
3. حط الـ Environment Variables
4. اضغط Deploy واستنى
5. ادعو البوت للسيرفر
6. استخدم UptimeRobot عشان البوت يفضل شغال

**بالتوفيق يا صديقي!** 🚀
