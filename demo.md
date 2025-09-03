# System Performance Monitor Dashboard - Demo Guide

## 🚀 Quick Start Demo

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open Your Browser
Navigate to: http://localhost:3000

### 3. What You'll See
- **Home Page**: Automatically redirects to `/dashboard`
- **Dashboard**: Real-time system metrics with beautiful charts
- **Navigation**: Switch between Dashboard and Settings
- **Theme Toggle**: Switch between Light/Dark/System themes

## 🎯 Key Features to Demo

### Real-time Metrics
- **CPU Usage**: Live percentage with color-coded status
- **Memory Usage**: Current memory consumption
- **Disk Usage**: Storage utilization tracking
- **Auto-refresh**: Updates every 2 seconds by default

### Interactive Charts
- **Line Charts**: Historical data visualization
- **Hover Effects**: Detailed information on hover
- **Responsive Design**: Adapts to different screen sizes

### Settings Page
- **Theme Selection**: Light, Dark, or System preference
- **Polling Interval**: Adjust update frequency (1s to 30s)
- **Persistent Storage**: Settings saved in database

### Dark/Light Mode
- **Theme Toggle**: Click the theme button in navigation
- **System Preference**: Automatically follows OS setting
- **Smooth Transitions**: Beautiful theme switching animations

## 🔧 Demo Scenarios

### 1. Basic Monitoring
1. Open the dashboard
2. Watch real-time metrics update
3. Hover over charts to see detailed values
4. Switch between different time periods

### 2. Theme Switching
1. Click the theme toggle button
2. See immediate visual changes
3. Refresh the page to verify persistence
4. Try system theme mode

### 3. Settings Configuration
1. Navigate to Settings page
2. Change polling interval
3. Select different theme
4. Save and verify changes

### 4. Responsive Design
1. Resize browser window
2. Test on mobile viewport
3. Verify chart responsiveness
4. Check navigation adaptation

## 📊 Expected Metrics

### Windows Systems
- **CPU**: Uses `wmic` commands for accurate readings
- **Memory**: Native Node.js `os` module
- **Disk**: `wmic logicaldisk` commands

### Unix/Linux Systems
- **CPU**: Calculated from `/proc/loadavg`
- **Memory**: Native Node.js `os` module  
- **Disk**: `df` command output

## 🎨 Visual Elements

### Status Indicators
- **Green**: Normal usage (< 60%)
- **Yellow**: Warning (60-80%)
- **Red**: Critical (> 80%)

### Chart Colors
- **CPU**: Blue (#3B82F6)
- **Memory**: Orange (#F59E0B)
- **Disk**: Red (#EF4444)

### Navigation
- **Active Page**: Highlighted with primary color
- **Hover Effects**: Smooth transitions
- **Icons**: Lucide React icons for clarity

## 🚨 Troubleshooting

### If Metrics Don't Load
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check system permissions for OS commands
4. Ensure database is running (if using)

### If Charts Don't Render
1. Check Chart.js dependencies
2. Verify data is being passed correctly
3. Check for JavaScript errors
4. Ensure proper CSS loading

## 🎉 Success Indicators

✅ **Dashboard loads with real-time metrics**
✅ **Charts display with smooth animations**
✅ **Theme switching works seamlessly**
✅ **Settings save and persist**
✅ **Responsive design adapts properly**
✅ **Navigation works between pages**

---

**Your System Performance Monitor Dashboard is now running successfully! 🎊**
