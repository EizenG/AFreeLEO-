# 🛰️ Trajectory Visualization - Complete Documentation

## Overview

The AFREELEO mission calculator now includes **interactive trajectory visualization** for both the satellite payload and the upper stage deorbit maneuver using the Eco-Brake system.

---

## 📊 Features

### 1. **Altitude Profile** (Both Objects)
- **X-axis**: Time (seconds)
- **Y-axis**: Altitude (km)
- **Two Lines**:
  - 🛰️ **Cyan line**: Satellite remains in stable orbit (~750 km)
  - 🚀 **Red line**: Upper stage descends after Eco-Brake burn

**Purpose**: Compare the satellite's stable orbit with the upper stage's controlled descent.

---

### 2. **Ground Track** (Satellite Only)
- **X-axis**: Longitude (-180° to +180°)
- **Y-axis**: Latitude (-90° to +90°)
- **Visualization**: Scatter plot showing the satellite's sub-satellite point (nadir) projected onto Earth's surface

**Purpose**: Visualize the satellite's coverage path over Earth.

---

### 3. **Upper Stage Descent** (Upper Stage Only)
- **X-axis**: Time (seconds)
- **Y-axis**: Altitude (km)
- **Red curve**: Detailed view of the upper stage's deorbit trajectory

**Purpose**: Analyze the Eco-Brake system's effectiveness in deorbiting the rocket stage.

---

## 🔧 Technical Implementation

### Data Sources

All trajectory data comes from GMAT simulation output files:

#### **Satellite Data** (`mission_{id}_satellite.txt`)
```
Columns:
- UTCGregorian: Timestamp
- ElapsedSecs: Elapsed time
- Earth.Altitude: Altitude above Earth (km)
- Earth.Latitude: Latitude (degrees)
- Earth.Longitude: Longitude (degrees)
- EarthMJ2000Eq.VX/VY/VZ: Velocity components (km/s)
```

#### **Upper Stage Data** (`mission_{id}_upperstage.txt`)
```
Columns:
- UTCGregorian: Timestamp
- ElapsedSecs: Elapsed time
- Earth.Altitude: Altitude above Earth (km)
- EcoBrakeFuelTank.FuelMass: Remaining fuel (kg)
- TotalMass: Total mass (kg)
```

---

## 📁 Component Structure

### **TrajectoryVisualizer.tsx**
Location: `src/components/TrajectoryVisualizer.tsx`

**Props**:
```typescript
interface TrajectoryVisualizerProps {
  satelliteTrajectory: Array<{
    time: string;
    latitude: number;
    longitude: number;
    altitude: number;
  }>;
  upperstageTrajectory: Array<{
    time: string;
    altitude: number;
  }>;
}
```

**Features**:
- Three tabbed views (Altitude Profile, Ground Track, Upper Stage Descent)
- Responsive design using Recharts
- Dark theme matching AFREELEO UI
- Interactive tooltips and legends

---

## 🎨 Color Scheme

| Element | Color | Hex Code | Purpose |
|---------|-------|----------|---------|
| Satellite Line | Cyan | `#06b6d4` | Represents payload in orbit |
| Upper Stage Line | Red | `#ef4444` | Represents deorbiting rocket stage |
| Grid | Slate | `#334155` | Background grid lines |
| Text Labels | Slate | `#94a3b8` | Axis labels and text |
| Background | Dark Slate | `#1e293b` | Tooltip background |

---

## 🚀 Usage Example

### In `ResultsDisplay.tsx`:
```tsx
import TrajectoryVisualizer from "@/components/TrajectoryVisualizer";

<TrajectoryVisualizer
  satelliteTrajectory={results.satellite_trajectory}
  upperstageTrajectory={results.upperstage_trajectory}
/>
```

The component automatically receives data from the API response after a mission calculation.

---

## 📈 Data Flow

```
1. User submits mission parameters
   ↓
2. Backend generates GMAT script
   ↓
3. GMAT executes simulation
   ↓
4. Backend parses output files:
   - mission_{id}_satellite.txt → satellite_trajectory
   - mission_{id}_upperstage.txt → upperstage_trajectory
   ↓
5. Frontend receives JSON response
   ↓
6. TrajectoryVisualizer renders 3 interactive charts
```

---

## 🔍 Interpreting Results

### **Altitude Profile**
- **Satellite (Cyan)**: Should remain relatively flat (~750 km ± 5 km)
- **Upper Stage (Red)**: Should show gradual descent (750 km → ~650 km over 15 minutes)

### **Ground Track**
- Shows the satellite's orbital path
- Inclination visible from the pattern (14.7° for Dakar equatorial orbit)
- One full pass visible in the simulation

### **Upper Stage Descent**
- Initial plateau: Orbit phase before Eco-Brake activation
- Sharp descent: Eco-Brake burn (300 seconds)
- Gradual descent: Post-burn gravitational descent
- Target: Eventually reach 100-120 km for atmospheric reentry

---

## 🛠️ Customization

### Adding More Charts

To add a new chart, edit `TrajectoryVisualizer.tsx`:

```tsx
<TabsList className="grid w-full grid-cols-4 bg-slate-700">
  {/* Add new tab trigger */}
  <TabsTrigger value="newchart">New Chart</TabsTrigger>
</TabsList>

<TabsContent value="newchart" className="mt-6">
  {/* Your custom chart here */}
</TabsContent>
```

### Changing Colors

Edit the `stroke` property in the Line/Scatter components:
```tsx
<Line
  dataKey="satelliteAltitude"
  stroke="#YOUR_COLOR_HERE"
  strokeWidth={2}
/>
```

---

## 📦 Dependencies

- **Recharts**: `^2.x.x` - Charting library
- **Radix UI Tabs**: For tabbed interface
- **Tailwind CSS**: For styling

Install if missing:
```bash
npm install recharts
```

---

## 🐛 Troubleshooting

### Charts Not Displaying
- Check browser console for errors
- Verify `satellite_trajectory` and `upperstage_trajectory` exist in API response
- Ensure data arrays are not empty

### Data Format Errors
- Verify backend is parsing GMAT files correctly
- Check `script.py` lines 558-575 for trajectory data formatting

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check `tailwind.config.js` includes component paths

---

## 🎯 Future Enhancements

Possible additions:
1. **3D Orbit Visualization** (using Three.js or Plotly)
2. **Real-time Animation** (playback of orbital motion)
3. **Earth Map Overlay** (show ground track on actual world map)
4. **Fuel Consumption Chart** (show fuel vs time)
5. **Export Charts** (download as PNG/SVG)

---

## 📞 Support

For questions or issues:
- Check GMAT output files in `output/` directory
- Verify API response structure matches TypeScript interfaces
- Review browser DevTools Network tab for API errors

---

## ✅ Complete Code Checklist

- [x] `TrajectoryVisualizer.tsx` - Main visualization component
- [x] `ResultsDisplay.tsx` - Integration point
- [x] `Index.tsx` - TypeScript interfaces updated
- [x] `script.py` - Backend trajectory data extraction
- [x] English UI/comments throughout
- [x] Responsive design
- [x] Interactive tooltips
- [x] Three visualization modes

---

**Generated for AFREELEO Mission Calculator**
*Sustainable Space Launch Solutions from Africa* 🌍🚀
