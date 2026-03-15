# 🎬 FrameSync

FrameSync is a **real-time collaborative video review platform** built for teams to review videos, leave timestamped comments, and annotate frames directly on the video timeline.

It allows creators, editors, and reviewers to **collaborate efficiently on video feedback**, similar to tools like Frame.io.

---

## 🌐 Live Demo

Frontend
https://framesync-phi.vercel.app

Backend API
https://framesync-knk8.onrender.com

---

## ✨ Features

• Upload and manage video projects
• Timestamped comments on videos
• Frame-accurate annotations and drawing tools
• Real-time comment updates using Socket.io
• Shareable review links for collaborators
• Timeline markers for comments and annotations
• Modern video review UI

---

## 🛠 Tech Stack

### Frontend

* Next.js (App Router)
* React
* TypeScript
* TailwindCSS
* Socket.io client
* Lucide Icons

### Backend

* Node.js
* Express
* Prisma ORM
* PostgreSQL (Neon)

### Storage

* Cloudflare R2 (video storage)

### Realtime

* Socket.io

### Deployment

* Frontend → Vercel
* Backend → Render
* Database → Neon

---

## 📂 Project Structure

```
framesync
│
├── frontend        # Next.js frontend
│
├── backend         # Express API server
│
└── README.md
```

---

## ⚙️ Installation (Local Development)

Clone the repository

```
git clone https://github.com/niyatiii28/framesync.git
cd framesync
```

### Backend

```
cd backend
npm install
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Backend `.env`

```
DATABASE_URL=your_database_url

JWT_SECRET=your_secret

R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
R2_PUBLIC_URL=your_r2_url
```

---

## 🚀 Future Improvements

* Live cursor collaboration
* Video waveform timeline
* Frame thumbnails preview
* Email invites for collaborators
* Playback-synced comments

---

## 👩‍💻 Author

Niyati Shetty

GitHub
https://github.com/niyatiii28

---

## ⭐ If you like this project

Give the repository a star ⭐
