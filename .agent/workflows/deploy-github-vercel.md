---
description: อัพโหลดโปรเจคลง GitHub และ Deploy บน Vercel
---

# วิธีอัพโหลดโปรเจคลง GitHub และ Deploy บน Vercel

## ส่วนที่ 1: เตรียมโปรเจค

### 1.1 สร้างไฟล์ .gitignore หลัก
สร้างไฟล์ `.gitignore` ที่ root ของโปรเจค:

```bash
cd d:\Workshop\Blacklist
```

สร้างไฟล์ `.gitignore` ด้วยเนื้อหา:
```
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
*/.env

# Build outputs
dist/
*/dist/
.angular/
*/.angular/

# Uploads
uploads/
*/uploads/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### 1.2 ตรวจสอบไฟล์สำคัญ
ตรวจสอบว่ามีไฟล์เหล่านี้:
- ✅ `README.md` - มีอยู่แล้ว
- ✅ `server/.env.example` - มีอยู่แล้ว (สำหรับตัวอย่างการตั้งค่า)
- ✅ `.gitignore` - จะสร้างในขั้นตอนนี้

## ส่วนที่ 2: อัพโหลดลง GitHub

### 2.1 เริ่มต้น Git Repository
```bash
cd d:\Workshop\Blacklist
git init
```

### 2.2 เพิ่มไฟล์ทั้งหมด
```bash
git add .
```

### 2.3 Commit ครั้งแรก
```bash
git commit -m "Initial commit: Restaurant & Hotel Blacklist Website"
```

### 2.4 สร้าง Repository บน GitHub
1. ไปที่ https://github.com
2. คลิก **"New repository"** หรือ **"+"** ที่มุมขวาบน
3. ตั้งชื่อ repository เช่น `blacklist-website`
4. เลือก **Public** หรือ **Private** ตามต้องการ
5. **ไม่ต้อง** เลือก "Initialize with README" (เพราะเรามีอยู่แล้ว)
6. คลิก **"Create repository"**

### 2.5 เชื่อมต่อกับ GitHub และ Push
```bash
# เปลี่ยน YOUR_USERNAME เป็นชื่อ GitHub ของคุณ
git remote add origin https://github.com/YOUR_USERNAME/blacklist-website.git
git branch -M main
git push -u origin main
```

**หมายเหตุ:** GitHub อาจขอ username และ password/token:
- Username: ชื่อ GitHub ของคุณ
- Password: ใช้ **Personal Access Token** แทน (สร้างได้ที่ GitHub Settings > Developer settings > Personal access tokens)

## ส่วนที่ 3: Deploy Backend บน Vercel

### 3.1 เตรียม Backend สำหรับ Vercel

สร้างไฟล์ `vercel.json` ที่ root ของโปรเจค:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/app.js"
    }
  ]
}
```

### 3.2 แก้ไข server/src/app.js
เพิ่มการ export module สำหรับ Vercel ที่ท้ายไฟล์:
```javascript
// Export for Vercel
module.exports = app;
```

### 3.3 Deploy Backend
1. ไปที่ https://vercel.com
2. คลิก **"Sign Up"** หรือ **"Login"** (ใช้ GitHub account)
3. คลิก **"Add New Project"**
4. เลือก repository `blacklist-website`
5. ตั้งค่า:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (ค้างไว้)
   - **Build Command**: ค้างว่างไว้
   - **Output Directory**: ค้างว่างไว้

6. เพิ่ม **Environment Variables**:
   ```
   DB_HOST=your-mysql-host
   DB_USER=your-mysql-user
   DB_PASSWORD=your-mysql-password
   DB_NAME=blacklist_db
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   PORT=5000
   ```

7. คลิก **"Deploy"**

### 3.4 รับ Backend URL
หลัง deploy สำเร็จ คุณจะได้ URL เช่น:
```
https://blacklist-website.vercel.app
```

## ส่วนที่ 4: Deploy Frontend บน Vercel

### 4.1 แก้ไข API URL ใน Frontend

แก้ไฟล์ที่เรียกใช้ API ให้ชี้ไปที่ Backend URL จาก Vercel:

ในไฟล์ `client/src/app/services/*.service.ts` ทั้งหมด เปลี่ยน:
```typescript
// จาก
private apiUrl = 'http://localhost:5000/api';

// เป็น
private apiUrl = 'https://blacklist-website.vercel.app/api';
```

หรือใช้ environment variables:

สร้างไฟล์ `client/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://blacklist-website.vercel.app/api'
};
```

### 4.2 แก้ไข angular.json
เพิ่ม output path configuration:
```json
"outputPath": "dist/client/browser"
```

### 4.3 สร้างไฟล์ vercel.json สำหรับ Frontend

สร้างไฟล์ `client/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4.4 Commit และ Push การเปลี่ยนแปลง
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 4.5 Deploy Frontend แยกต่างหาก
1. ไปที่ Vercel Dashboard
2. คลิก **"Add New Project"** อีกครั้ง
3. เลือก repository เดียวกัน `blacklist-website`
4. ตั้งค่า:
   - **Framework Preset**: Angular
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/client/browser`

5. คลิก **"Deploy"**

### 4.6 รับ Frontend URL
หลัง deploy สำเร็จ คุณจะได้ URL เช่น:
```
https://blacklist-website-client.vercel.app
```

## ส่วนที่ 5: ตั้งค่า Database

### 5.1 ใช้ Database Cloud Service
เนื่องจาก Vercel ไม่รองรับ MySQL โดยตรง คุณต้องใช้ Cloud Database:

**ตัวเลือกที่แนะนำ:**
1. **PlanetScale** (MySQL-compatible, Free tier)
   - ไปที่ https://planetscale.com
   - สร้าง database
   - คัดลอก connection string

2. **Railway** (MySQL, Free tier)
   - ไปที่ https://railway.app
   - สร้าง MySQL database
   - คัดลอก connection details

3. **AWS RDS** (สำหรับ production)

### 5.2 อัพเดท Environment Variables
กลับไปที่ Vercel Project Settings > Environment Variables และอัพเดท:
```
DB_HOST=your-cloud-db-host
DB_USER=your-cloud-db-user
DB_PASSWORD=your-cloud-db-password
DB_NAME=blacklist_db
```

### 5.3 Import Database Schema
ใช้ไฟล์ `server/database_schema.sql` เพื่อสร้างตารางใน Cloud Database

## ส่วนที่ 6: ทดสอบ

### 6.1 ทดสอบ Backend
```bash
curl https://blacklist-website.vercel.app/api/blacklist
```

### 6.2 ทดสอบ Frontend
เปิดเบราว์เซอร์ไปที่:
```
https://blacklist-website-client.vercel.app
```

## ส่วนที่ 7: การอัพเดทในอนาคต

เมื่อต้องการอัพเดทโค้ด:
```bash
git add .
git commit -m "คำอธิบายการเปลี่ยนแปลง"
git push origin main
```

Vercel จะ auto-deploy ทุกครั้งที่มีการ push ไปที่ main branch

## หมายเหตุสำคัญ

⚠️ **สิ่งที่ต้องระวัง:**
1. **อย่า commit ไฟล์ `.env`** - ใช้ Environment Variables บน Vercel แทน
2. **อย่า commit โฟลเดอร์ `node_modules`** - ใช้ `.gitignore`
3. **อย่า commit โฟลเดอร์ `uploads`** - ใช้ Cloud Storage (เช่น AWS S3, Cloudinary) สำหรับ production
4. **ตรวจสอบ CORS** - ต้องอนุญาต Frontend URL ใน Backend

✅ **Best Practices:**
1. ใช้ Environment Variables สำหรับข้อมูลสำคัญ
2. แยก Frontend และ Backend เป็น 2 projects บน Vercel
3. ใช้ Cloud Database สำหรับ production
4. ใช้ Cloud Storage สำหรับไฟล์อัพโหลด
5. ตั้งค่า Custom Domain (ถ้ามี)
