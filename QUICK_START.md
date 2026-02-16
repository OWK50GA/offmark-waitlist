# Quick Start Guide - OffMark Waitlist

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Frontend
```bash
npm run dev:frontend
```

### 3. Open Browser
Visit: **http://localhost:3000**

---

## 📱 What You'll See

✅ Beautiful waitlist landing page
✅ Email capture form
✅ Phone mockup with app preview
✅ Feature showcase section
✅ Responsive design

---

## 🔧 Optional: Start Backend

If you want full functionality (email submissions):

```bash
# Terminal 1: Backend (requires PostgreSQL)
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

---

## 📊 Compare with Figma

**Figma Design**: https://www.figma.com/design/UX8bNNTDKBkBfepCC0uX0Y/offmark?node-id=366-558

**Local App**: http://localhost:3000

---

## 📁 Project Structure

```
offmark_waitlist/
├── packages/
│   ├── frontend/     ← Next.js app (Port 3000)
│   └── backend/      ← Express API (Port 3001)
└── README.md
```

---

## 🎨 Tech Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Backend**: Express + TypeScript + PostgreSQL
- **Design**: Figma → Code (Pixel Perfect)

---

## 📚 Documentation

- [Main README](README.md)
- [Frontend README](packages/frontend/README.md)
- [Frontend Setup](packages/frontend/SETUP.md)
- [Visual QA](packages/frontend/VISUAL_QA.md)
- [Implementation Summary](packages/frontend/IMPLEMENTATION_SUMMARY.md)

---

## ❓ Troubleshooting

### Frontend won't start
```bash
cd packages/frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Images not loading
- Check `packages/frontend/public/assets/figma/` exists
- Verify assets were downloaded (should be ~1.4MB total)

### Form submission fails
- Backend needs to be running on port 3001
- PostgreSQL database must be configured
- Check `.env` file in root directory

---

## 🎯 Next Steps

1. ✅ Frontend is running
2. ⏳ Configure PostgreSQL for backend
3. ⏳ Test form submission
4. ⏳ Deploy to production

---

## 💡 Tips

- Use Chrome DevTools to compare with Figma
- Check responsive design at different breakpoints
- Test form with valid/invalid emails
- Monitor console for any errors

---

## 🆘 Need Help?

Check the documentation files or review:
- `.kiro/rules.mdc` - Design system rules
- `packages/frontend/VISUAL_QA.md` - QA checklist
- `packages/frontend/IMPLEMENTATION_SUMMARY.md` - What was built

---

**Happy Coding! 🎉**
