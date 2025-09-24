# Hero Images Directory

This directory contains hero section images for the landing page.

## Recommended Image Specifications

### Hero Background Images
- **Dimensions**: 
  - Desktop: 1920x1080px
  - Tablet: 1440x900px
  - Mobile: 1024x768px
- **Format**: WebP (with PNG/JPG fallback)
- **Quality**: 85-90% compression
- **File Size**: Max 500KB per image

### Required Images
1. **hero-gardening-tools.webp** - Main hero background showing garden tools
2. **hero-lawn-care.webp** - Lawn mowers and care equipment
3. **hero-watering-systems.webp** - Irrigation and watering systems

### Optimization Guidelines
- Use WebP format for better compression
- Provide fallback images in JPG/PNG
- Implement lazy loading for below-fold images
- Use responsive images with srcset
- Optimize for Core Web Vitals (LCP < 2.5s)

### Image Naming Convention
- hero-[description]-[size].webp
- Example: hero-gardening-tools-1920.webp

### CDN Recommendation
Consider using a CDN service for production:
- Cloudinary
- ImageKit
- Cloudflare Images

## Placeholder Images
Currently using gradient backgrounds. Replace with actual product images for production.