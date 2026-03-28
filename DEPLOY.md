# Tu Tiên — Firebase Deploy Guide

## Cấu trúc thư mục
```
game/                  ← root project
├── firebase.json      ← hosting + firestore config
├── .firebaserc        ← project ID
├── firestore.rules    ← security rules
├── firestore.indexes.json
└── game/              ← public folder (deploy lên hosting)
    ├── index.html
    ├── css/
    └── js/
        └── firebase/  ← Firebase integration modules
```

## Lần đầu deploy

### 1. Cài Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login
```bash
firebase login
```

### 3. Deploy toàn bộ (hosting + firestore rules)
```bash
cd game/          # vào thư mục root chứa firebase.json
firebase deploy
```

### 4. Chỉ deploy hosting (code thay đổi)
```bash
firebase deploy --only hosting
```

### 5. Chỉ deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

## Sau mỗi update code
```bash
firebase deploy --only hosting
```

## URL sau deploy
- **Hosting**: https://tu-tien-c3258.web.app  
- **Firestore Console**: https://console.firebase.google.com/project/tu-tien-c3258/firestore

## Bật Anonymous Auth + Google Auth trên Firebase Console
1. Vào https://console.firebase.google.com/project/tu-tien-c3258/authentication
2. Tab **Sign-in method**
3. Bật **Anonymous**
4. Bật **Google** → nhập email hỗ trợ → Save

## Bật Firestore trên Firebase Console
1. Vào https://console.firebase.google.com/project/tu-tien-c3258/firestore
2. Click **Create database**
3. Chọn **Production mode** (rules đã có sẵn)
4. Chọn region gần nhất (asia-southeast1 cho SEA)

## Firestore Security Rules
Mỗi user chỉ đọc/ghi save của chính mình:
```
match /saves/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
