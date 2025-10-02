# PodDB GitHub Pages Deployment Guide

यह guide आपको बताएगी कि कैसे आप अपने PodDB app को GitHub Pages पर deploy कर सकते हैं।

## 🚀 Quick Deployment Steps

### 1. GitHub Repository Setup

1. अपने GitHub account में जाएं
2. Repository: `https://github.com/itsksrathore/guided-app-launch` को access करें
3. अगर repository exist नहीं करती, तो इसे create करें

### 2. Code Upload

```bash
# अपने local project directory में जाएं
cd "D:\PodDb\Production\V 1.1\PodDB"

# Git initialize करें (अगर पहले से नहीं है)
git init

# Remote repository add करें
git remote add origin https://github.com/itsksrathore/guided-app-launch.git

# सभी files को add करें
git add .

# Commit करें
git commit -m "Initial PodDB deployment"

# Push करें
git push -u origin main
```

### 3. GitHub Secrets Setup

Repository में जाकर Settings > Secrets and variables > Actions में जाएं और ये secrets add करें:

#### Required Secrets:
- `NEXT_PUBLIC_SUPABASE_URL` - आपका Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - आपका Supabase Anonymous Key
- `SUPABASE_SERVICE_ROLE_KEY` - आपका Supabase Service Role Key
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - आपका Cloudinary Cloud Name
- `CLOUDINARY_API_KEY` - आपका Cloudinary API Key
- `CLOUDINARY_API_SECRET` - आपका Cloudinary API Secret
- `YOUTUBE_API_KEY` - आपका YouTube API Key

### 4. GitHub Pages Enable करें

1. Repository Settings में जाएं
2. Pages section में जाएं
3. Source को "GitHub Actions" select करें
4. Save करें

### 5. Deployment Trigger

Code push करने के बाद automatic deployment start हो जाएगी। आप Actions tab में progress देख सकते हैं।

## 🔧 Configuration Details

### Environment Variables

Production deployment के लिए ये environment variables set हैं:

```env
NEXT_PUBLIC_APP_URL=https://itsksrathore.github.io/guided-app-launch
NODE_ENV=production
```

### Build Configuration

- **Static Export**: GitHub Pages के लिए static files generate होती हैं
- **Base Path**: `/dev-collaborate-space` repository name के अनुसार
- **Asset Prefix**: Static assets के लिए proper path
- **Image Optimization**: Disabled (GitHub Pages limitation)

## 📱 Access Your App

Deployment के बाद आपका app यहाँ available होगा:
```
https://itsksrathore.github.io/guided-app-launch
```

## 🚨 Important Notes

### 1. Static Export Limitations
- Server-side functions work नहीं करेंगे
- API routes static files बन जाएंगे
- Database operations client-side से होंगे

### 2. Supabase Configuration
- सभी database operations client-side से होंगे
- RLS (Row Level Security) properly configure करें
- Anonymous access के लिए proper policies set करें

### 3. Performance Considerations
- Static files fast load होती हैं
- CDN automatically enabled होता है
- Caching optimized होती है

## 🔄 Update Process

Code update करने के लिए:

```bash
# Changes करें
git add .
git commit -m "Update description"
git push origin main
```

Automatic deployment trigger हो जाएगी।

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**: 
   - Check GitHub Actions logs
   - Verify all secrets are set correctly
   - Check for TypeScript errors

2. **App Not Loading**:
   - Check browser console for errors
   - Verify Supabase configuration
   - Check network requests

3. **Images Not Loading**:
   - Use absolute URLs for images
   - Check Cloudinary configuration
   - Verify image paths

### Debug Steps:

1. Check Actions tab में build logs
2. Browser developer tools में console check करें
3. Network tab में failed requests देखें
4. Supabase dashboard में logs check करें

## 📞 Support

अगर कोई issue आए तो:
1. GitHub Issues में report करें
2. Build logs share करें
3. Browser console errors share करें

---

**Happy Deploying! 🚀**
