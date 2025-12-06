# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Firebase Setup
- [ ] Create Firebase project
- [ ] Enable Authentication (Email/Password)
- [ ] Enable Firestore database
- [ ] Enable Storage
- [ ] Configure security rules (see README.md)
- [ ] Add authorized domains

### ✅ Environment Variables
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all Firebase configuration values
- [ ] Set secure family password
- [ ] Verify all values are correct

### ✅ Vercel Setup
- [ ] Connect GitHub repository to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Configure build settings
- [ ] Set up custom domain (optional)

### ✅ GitHub Setup
- [ ] Create GitHub repository
- [ ] Add Vercel secrets to GitHub (VERCEL_TOKEN)
- [ ] Verify GitHub Actions workflow is enabled
- [ ] Set up branch protection rules

### ✅ Testing
- [ ] Run `npm run ci` (type-check + lint + build)
- [ ] Test all authentication flows
- [ ] Test photo upload/download
- [ ] Test on different devices/browsers
- [ ] Verify all environment variables work

## Deployment Steps

### Option 1: Automated (GitHub + Vercel)

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Vercel automatically deploys** via GitHub Actions

3. **Monitor deployment** in Vercel dashboard

### Option 2: Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy to production:**
   ```bash
   npm run vercel-deploy
   ```

3. **Set up domain** in Vercel dashboard

## Post-Deployment Verification

### ✅ Functionality Tests
- [ ] App loads without errors
- [ ] Authentication works
- [ ] Photo upload/download works
- [ ] All pages load correctly
- [ ] Mobile responsiveness

### ✅ Performance Tests
- [ ] Lighthouse score > 90
- [ ] Images load quickly
- [ ] No console errors
- [ ] Fast initial load

### ✅ Security Tests
- [ ] HTTPS enabled
- [ ] Firebase security rules active
- [ ] Environment variables not exposed
- [ ] Private routes protected

## Monitoring & Maintenance

### Health Checks
- Visit `https://yourdomain.com/health` for service status
- Monitor Vercel dashboard for errors
- Check Firebase console for usage metrics

### Updates
- Push changes to main branch for automatic deployment
- Use feature branches for development
- Test thoroughly before merging

### Backup & Recovery
- Firebase data is automatically backed up
- Use Vercel deployments for rollback capability
- Keep environment variables secure

## Troubleshooting

### Common Issues

**Build Fails:**
- Check environment variables
- Verify Firebase configuration
- Run `npm run ci` locally

**Authentication Issues:**
- Verify Firebase Auth settings
- Check authorized domains
- Confirm environment variables

**Photo Upload Issues:**
- Check Firebase Storage rules
- Verify storage bucket settings
- Confirm file permissions

**Performance Issues:**
- Enable Vercel Analytics
- Check bundle size with `npm run build`
- Optimize images and lazy loading

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review GitHub Actions output
3. Verify Firebase console
4. Contact development team

---

**Ready for launch! 🚀**
