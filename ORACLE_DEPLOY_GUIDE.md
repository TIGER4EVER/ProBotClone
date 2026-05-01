# دليل نشر ProBot Clone على Oracle Cloud (مجاني للأبد)

## ليه Oracle Cloud؟

Oracle Cloud بيديك **سيرفر VPS مجاني للأبد** (Always Free Tier). يعني سيرفر حقيقي شغال 24/7 من غير ما تدفع ولا مليم ومن غير فيزا. ده أحسن حل مجاني للديسكورد بوت.

**اللي هتاخده مجاناً:**
- سيرفر بـ 1 GB رام و 1 CPU (كافي جداً للبوت)
- 50 GB تخزين
- شغال 24/7 للأبد
- عنوان IP ثابت

---

## الخطوة 1: إنشاء حساب Oracle Cloud

1. روح على: [https://cloud.oracle.com/](https://cloud.oracle.com/)
2. اضغط **"Sign Up"** أو **"Start for free"**
3. املا البيانات دي:
   - الاسم والإيميل
   - البلد
   - اختار **"Home Region"** الأقرب ليك (مثلاً: Germany أو UK)
4. هيطلب منك تحقق الإيميل
5. **مهم:** ممكن يطلب بيانات هوية (جواز سفر أو بطاقة) للتحقق بس مش هيخصم منك فلوس
6. بعد التحقق، الحساب هيتفعل (ممكن ياخد من دقائق لساعات)

---

## الخطوة 2: إنشاء سيرفر (VM Instance)

1. سجل دخول على: [https://cloud.oracle.com/](https://cloud.oracle.com/)
2. من القائمة الرئيسية اضغط على **"Create a VM instance"** أو روح على:
   - القائمة (الثلاث خطوط) > Compute > Instances > Create Instance

3. حط الإعدادات دي:

| الإعداد | القيمة |
|---------|--------|
| **Name** | `probot-server` |
| **Image** | Ubuntu 22.04 (أو أحدث) |
| **Shape** | VM.Standard.E2.1.Micro (ده المجاني - Always Free) |
| **OCPU** | 1 |
| **Memory** | 1 GB |

4. في قسم **"Add SSH keys"**:
   - اختار **"Generate a key pair for me"**
   - اضغط **"Save Private Key"** ونزل الملف على جهازك
   - **مهم جداً:** احفظ الملف ده كويس! ده مفتاح الدخول على السيرفر

5. اضغط **"Create"**

6. استنى شوية لحد ما الـ Status يبقى **"Running"** (أخضر)

7. انسخ الـ **Public IP Address** اللي ظهر (هنحتاجه بعدين)

---

## الخطوة 3: الدخول على السيرفر

### من Windows:

1. نزل برنامج **PuTTY** من هنا: [https://www.putty.org/](https://www.putty.org/)

2. بس الأول محتاج تحول مفتاح SSH. نزل **PuTTYgen** (بينزل مع PuTTY):
   - افتح PuTTYgen
   - اضغط **"Load"** واختار ملف المفتاح اللي نزلته (.key)
   - اضغط **"Save private key"** واحفظه كملف .ppk

3. افتح **PuTTY**:
   - في **Host Name** حط الـ Public IP بتاع السيرفر
   - في **Port** سيبه 22
   - روح على **Connection > SSH > Auth > Credentials**
   - في **Private key file** اختار ملف .ppk اللي عملته
   - ارجع لـ **Session** واضغط **"Open"**

4. لما يسألك عن الـ username اكتب:
   ```
   ubuntu
   ```

5. المفروض تدخل على السيرفر وتشوف سطر أوامر زي كده:
   ```
   ubuntu@probot-server:~$
   ```

---

## الخطوة 4: تجهيز السيرفر

بعد ما تدخل على السيرفر، اكتب الأوامر دي واحد واحد:

### تحديث النظام:
```bash
sudo apt update && sudo apt upgrade -y
```

### تنزيل Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### تنزيل pnpm:
```bash
sudo npm install -g pnpm
```

### تنزيل المشروع:
```bash
git clone https://github.com/TIGER4EVER/ProBotClone.git
cd ProBotClone
```

### تنزيل المكتبات:
```bash
pnpm install
```

---

## الخطوة 5: إعداد ملف .env

اكتب الأمر ده عشان تعمل ملف الإعدادات:

```bash
nano .env
```

هيفتحلك محرر نصوص. اكتب فيه (غيّر القيم بتاعتك):

```
NODE_ENV=production
DATABASE_URL=file:./data/probot.db
DISCORD_BOT_TOKEN=هنا_حط_توكن_البوت
DISCORD_CLIENT_ID=هنا_حط_الكلاينت_اي_دي
DISCORD_CLIENT_SECRET=هنا_حط_الكلاينت_سيكريت
SESSION_SECRET=اكتب_اي_كلام_طويل_وعشوائي
BASE_URL=http://عنوان_الIP_بتاعك:5000
```

**ملاحظة:** الـ BASE_URL هنا هو الـ Public IP بتاع السيرفر. يعني لو الـ IP هو 129.213.45.67 يبقى:
```
BASE_URL=http://129.213.45.67:5000
```

بعد ما تخلص:
- اضغط **Ctrl + X**
- اضغط **Y**
- اضغط **Enter**

---

## الخطوة 6: فتح البورت في Oracle Cloud

عشان الداشبورد يشتغل من المتصفح، لازم تفتح بورت 5000:

### من لوحة تحكم Oracle Cloud:

1. روح على: **Networking > Virtual Cloud Networks**
2. اضغط على الـ VCN بتاعك
3. اضغط على **"Security Lists"** > الـ Default Security List
4. اضغط **"Add Ingress Rules"**
5. حط الإعدادات دي:

| الإعداد | القيمة |
|---------|--------|
| **Source CIDR** | `0.0.0.0/0` |
| **Destination Port Range** | `5000` |
| **IP Protocol** | TCP |

6. اضغط **"Add Ingress Rules"**

### كمان من السيرفر نفسه:
```bash
sudo iptables -I INPUT -p tcp --dport 5000 -j ACCEPT
sudo netfilter-persistent save
```

لو الأمر التاني مشتغلش، اكتب:
```bash
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

---

## الخطوة 7: بناء وتشغيل المشروع

### بناء المشروع:
```bash
mkdir -p data
pnpm run build
```

### تشغيل المشروع:
```bash
pnpm start
```

لو كل حاجة تمام، هتشوف رسالة إن السيرفر شغال. افتح المتصفح وروح على:
```
http://عنوان_الIP_بتاعك:5000
```

---

## الخطوة 8: خلي البوت شغال 24/7

عشان البوت يفضل شغال حتى لو قفلت PuTTY، هنستخدم **PM2**:

### تنزيل PM2:
```bash
sudo npm install -g pm2
```

### تشغيل البوت بـ PM2:
```bash
pm2 start "pnpm start" --name probot
```

### خلي PM2 يشتغل تلقائي لما السيرفر يعمل restart:
```bash
pm2 startup
pm2 save
```

### أوامر مفيدة لـ PM2:

| الأمر | الوظيفة |
|-------|---------|
| `pm2 status` | شوف حالة البوت |
| `pm2 logs probot` | شوف اللوجات |
| `pm2 restart probot` | أعد تشغيل البوت |
| `pm2 stop probot` | وقف البوت |

---

## الخطوة 9: دعوة البوت للسيرفر

1. روح على [Discord Developer Portal](https://discord.com/developers/applications)
2. اختار التطبيق بتاعك
3. روح على **"OAuth2"** > **"URL Generator"**
4. في **Scopes** اختار: `bot` و `applications.commands`
5. في **Bot Permissions** اختار: `Administrator`
6. انسخ الرابط اللي اتعمل وافتحه في المتصفح
7. اختار السيرفر واضغط **"Authorize"**

---

## إزاي تجيب بيانات Discord (تذكير)

| البيان | منين تجيبه |
|--------|------------|
| **DISCORD_BOT_TOKEN** | Discord Developer Portal > التطبيق > Bot > Reset Token |
| **DISCORD_CLIENT_ID** | Discord Developer Portal > التطبيق > OAuth2 > Client ID |
| **DISCORD_CLIENT_SECRET** | Discord Developer Portal > التطبيق > OAuth2 > Reset Secret |
| **SESSION_SECRET** | اكتب أي كلام طويل عشوائي |
| **BASE_URL** | `http://الIP_بتاع_السيرفر:5000` |

---

## حل المشاكل الشائعة

### مش قادر أعمل حساب Oracle؟
- جرب إيميل مختلف
- تأكد إن البيانات صح
- ممكن تحتاج تستنى شوية للتحقق

### مش قادر أدخل على السيرفر بـ PuTTY؟
- تأكد إن الـ IP صح
- تأكد إنك حولت المفتاح لـ .ppk
- الـ username هو `ubuntu`

### الداشبورد مش بيفتح من المتصفح؟
- تأكد إنك فتحت بورت 5000 في Security List
- تأكد إنك فتحت البورت بـ iptables
- تأكد إن البوت شغال: `pm2 status`

### البوت وقف فجأة؟
- شوف اللوجات: `pm2 logs probot`
- أعد التشغيل: `pm2 restart probot`

---

## ملخص سريع

1. اعمل حساب Oracle Cloud مجاني
2. اعمل سيرفر VM (Always Free)
3. ادخل عليه بـ PuTTY
4. نزل Node.js والمشروع
5. حط الإعدادات في .env
6. افتح بورت 5000
7. شغل المشروع بـ PM2
8. ادعو البوت للسيرفر

**كده البوت هيفضل شغال 24/7 مجاناً للأبد!** 🚀
