# Family Gallery

A beautiful, minimalist family photo gallery built with React, TypeScript, and Firebase. Share and organize your family's precious memories in a private, secure space.

## 🚀 Features

- **Private Family Access**: Secure authentication with family-specific passwords
- **Photo Management**: Upload, view, and organize family photos
- **Albums**: Create themed collections for special occasions
- **Favorites**: Mark and easily access your favorite moments
- **Comments**: Add personal notes and memories to photos
- **Responsive Design**: Works beautifully on desktop and mobile
- **Dark Mode Support**: Clean, minimalist interface with dark theme
- **Real-time Sync**: Instant updates across all family members

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel
- **Build Tool**: Vite
- **UI Components**: Radix UI, Lucide Icons

## 📋 Prerequisites

- Node.js 20+
- npm or pnpm
- Firebase project with Authentication, Firestore, and Storage enabled

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd family-gallery
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Fill in your Firebase configuration and family password in `.env`.

### 4. Development
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)

#### Option 1: GitHub Integration (Automated)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

#### Option 2: Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
npm run vercel-deploy
```

### Environment Variables

Set these in your Vercel dashboard or `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FAMILY_PASSWORD=your_family_password
```

## 🔧 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication, Firestore, and Storage

### 2. Authentication
- Enable Email/Password authentication
- Configure authorized domains

### 3. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(ownerId) {
      return isSignedIn() && request.auth.uid == ownerId;
    }

    match /users/{userId} {
      allow read: if true;
      allow create: if isOwner(userId);
      allow update, delete: if isOwner(userId);
    }

    match /photos/{photoId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.resource.data.ownerId == request.auth.uid
        && request.resource.data.keys().hasOnly([
          "ownerId","ownerName","createdAt","fullUrl",
          "thumbUrl","albumIds","commentCount","width","height","title"
        ]);
      allow update: if isOwner(resource.data.ownerId);
      allow delete: if isOwner(resource.data.ownerId);
    }

    match /albums/{albumId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.ownerId);
    }
  }
}
```

### 4. Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    match /photos/{uid}/{variant}/{file} {
      allow read: if isSignedIn();
      allow write: if isOwner(uid)
        && (variant == "original" || variant == "thumb");
      allow delete: if isOwner(uid);
    }
  }
}
```

## 📱 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Quality Assurance
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run ci          # Run all checks (type-check, lint, build)

# Deployment
npm run predeploy    # Run before deployment
npm run deploy       # Deploy to Vercel
npm run vercel-deploy # Deploy to Vercel (production)
```

## 🔒 Security Features

- **Private Access**: Family-only authentication
- **Secure Uploads**: Server-side validation and compression
- **Firebase Security**: Comprehensive security rules
- **HTTPS Only**: Secure connections enforced
- **Input Validation**: Client and server-side validation

## 🎨 Design System

- **Minimalist UI**: Clean, distraction-free interface
- **Black & Grey**: Sophisticated color palette
- **Red Accents**: Important actions and branding
- **Responsive**: Works on all device sizes
- **Dark Mode**: Automatic theme switching

## 📊 Performance

- **Optimized Images**: Automatic compression and WebP conversion
- **Lazy Loading**: Photos load as you scroll
- **Caching**: Intelligent caching strategies
- **Fast Builds**: Optimized Vite build process

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and intended for family use only.

## 🆘 Support

For questions or issues, please contact the family administrator.

---

Made with ❤️ for family memories
