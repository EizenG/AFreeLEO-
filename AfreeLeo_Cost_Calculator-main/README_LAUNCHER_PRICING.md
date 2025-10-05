# 🚀 AFREELEO Launcher Pricing Tiers

## Overview

The AFREELEO Mission Calculator now supports **three launcher configurations** (PD-1, PD-2, PD-3) based on NASA's Point Design study for air-launched space vehicles. Each tier has different payload capacities and pricing structures.

---

## 📋 Launcher Specifications

### **PD-1 (Small)**
- **Configuration**: 3-stage solid rocket + liquid hydrogen
- **Payload Capacity**: 1 - 5,660 lbs (≈ 2,567 kg)
- **Turnaround Time**: 43 hours
- **Call-up Time**: 3.8 hours
- **Best For**: Small satellites, CubeSats, technology demonstrators

### **PD-2 (Medium)**
- **Configuration**: 2-stage liquid hydrogen
- **Payload Capacity**: 5,660 - 12,580 lbs (≈ 5,706 kg)
- **Turnaround Time**: 68 hours
- **Call-up Time**: 5.9 hours
- **Best For**: Medium satellites, constellations, Earth observation

### **PD-3 (Large)**
- **Configuration**: Heavy-lift 2-stage liquid hydrogen
- **Payload Capacity**: 12,580 - 17,810 lbs (≈ 8,078 kg)
- **Turnaround Time**: 57 hours
- **Call-up Time**: 7.2 hours
- **Best For**: Large satellites, multi-satellite deployments, deep space probes

---

## 💰 Pricing Structure (FY2010 Dollars)

| Cost Component | PD-1 | PD-2 | PD-3 |
|----------------|------|------|------|
| **Base Launch** | $48.36M | $111.6M | $120.9M |
| **Cost per kg** | $18,837 | $19,558 | $14,966 |
| **Eco-Brake System** | $20,000 | $25,000 | $30,000 |
| **Fuel (deorbit) per kg** | $400 | $420 | $450 |
| **Telemetry per year** | $2,000 | $2,000 | $2,000 |
| **Insurance Rate** | 3% | 3% | 3% |

### **Conversion to EUR (approximate)**
Using 1 USD = 0.85 EUR (2010 average):

| Cost Component | PD-1 | PD-2 | PD-3 |
|----------------|------|------|------|
| **Base Launch** | €48,360,000 | €111,600,000 | €120,900,000 |
| **Cost per kg** | €18,837 | €19,558 | €14,966 |

---

## 🎯 Implementation

### Frontend (React/TypeScript)

#### **1. Form Data Interface**
```typescript
export interface FormData {
  // ... other fields
  launcherTier: string; // "PD-1", "PD-2", or "PD-3"
  // ...
}
```

#### **2. Launcher Selection Component**
Location: `src/components/GeneralInfoSection.tsx`

```tsx
<Select
  value={formData.launcherTier}
  onValueChange={(value) => updateFormData("launcherTier", value)}
>
  <SelectItem value="PD-1">PD-1 (Small ≤2,567 kg)</SelectItem>
  <SelectItem value="PD-2">PD-2 (Medium ≤5,706 kg)</SelectItem>
  <SelectItem value="PD-3">PD-3 (Large ≤8,078 kg)</SelectItem>
</Select>
```

#### **3. Results Display**
The launcher tier is displayed in the results:
```tsx
<p className="text-sm text-slate-400">
  Launcher: <span className="font-semibold text-cyan-400">
    {results.costs.launcher_tier}
  </span>
</p>
```

---

### Backend (Python/Flask)

#### **1. Pricing Configuration**
Location: `script.py` (lines 29-57)

```python
PRICING_PD1 = {
  "tier": "PD-1 (Small)",
  "base_launch": 48360000,    # EUR
  "per_kg": 18837,
  "eco_brake_system": 20000,
  "fuel_per_kg": 400,
  "telemetry_per_year": 2000,
  "insurance_rate": 0.03
}

PRICING_PD2 = { ... }  # Medium
PRICING_PD3 = { ... }  # Large
```

#### **2. Cost Calculator**
Location: `script.py` `CostCalculator` class

```python
def calculate_costs(params, metrics):
    # Select pricing tier
    launcher_tier = params.get('launcher_tier', 'PD-1')

    if launcher_tier == 'PD-2':
        PRICING = PRICING_PD2
    elif launcher_tier == 'PD-3':
        PRICING = PRICING_PD3
    else:
        PRICING = PRICING_PD1

    # Calculate costs using selected tier
    base_launch = PRICING['base_launch']
    mass_cost = params['satellite_mass'] * PRICING['per_kg']
    # ...
```

---

## 🔄 Data Flow

```
1. User selects launcher tier in form (PD-1/PD-2/PD-3)
   ↓
2. Frontend sends launcher_tier in API request
   ↓
3. Backend selects appropriate PRICING dict
   ↓
4. Costs calculated using tier-specific rates
   ↓
5. Results include launcher_tier in response
   ↓
6. Frontend displays launcher tier + calculated costs
```

---

## 📊 Cost Calculation Example

### Scenario:
- **Satellite Mass**: 50 kg
- **Launcher Tier**: PD-2 (Medium)
- **Upper Stage Fuel Consumed**: 66 kg
- **Telemetry**: 1 year
- **Insurance**: 3% of $100,000

### Calculation:
```
Base Launch:       €111,600,000
Payload (50 kg):   €977,900  (50 × €19,558)
Eco-Brake System:  €25,000
Fuel (66 kg):      €27,720   (66 × €420)
Telemetry:         €2,000
Insurance:         €3,000    (€100,000 × 0.03)
─────────────────────────────────────
TOTAL:             €112,635,620
```

---

## 🎨 UI Features

### **Launcher Selection Widget**
- **Dropdown selector** with 3 options
- **Tooltip** showing payload capacity ranges
- **Info box** displaying current selection details:
  - PD-1: "3-stage solid rocket + liquid hydrogen configuration"
  - PD-2: "Liquid hydrogen 2-stage configuration"
  - PD-3: "Heavy-lift 2-stage liquid hydrogen system"

### **Results Display**
- Shows selected launcher tier prominently
- Color-coded (cyan) for visibility
- Appears below total cost in mission status card

---

## 📈 Performance Metrics

### **Mission Success Rate** (16th flight)
| Tier | Total Loss of Mission Probability |
|------|----------------------------------|
| PD-1 | 1.56% |
| PD-2 | 1.22% |
| PD-3 | 1.27% |

### **Effectiveness**
| Tier | Payload to LEO | Min Turnaround | Call-up Time |
|------|---------------|----------------|--------------|
| PD-1 | 5,660 lbs | 36 hrs | 3.8 hrs |
| PD-2 | 12,580 lbs | 68 hrs | 5.9 hrs |
| PD-3 | 17,810 lbs | 57 hrs | 7.2 hrs |

---

## 🛠️ Customization

### Adding a New Launcher Tier

**1. Backend - Add pricing config**:
```python
PRICING_PD4 = {
  "tier": "PD-4 (Extra Large)",
  "base_launch": 150000000,
  "per_kg": 13000,
  # ...
}
```

**2. Backend - Update cost calculator**:
```python
elif launcher_tier == 'PD-4':
    PRICING = PRICING_PD4
```

**3. Frontend - Add to selector**:
```tsx
<SelectItem value="PD-4">
  PD-4 (Extra Large ≤15,000 kg)
</SelectItem>
```

---

## 🐛 Troubleshooting

### Issue: Wrong pricing applied
- **Check**: `launcher_tier` value in API request
- **Verify**: Backend receives correct tier (check logs)
- **Default**: If tier is missing, defaults to PD-1

### Issue: Launcher tier not showing in results
- **Check**: TypeScript interface includes `launcher_tier` in costs
- **Verify**: Backend returns `launcher_tier` in JSON response
- **Console**: Check browser DevTools for API response structure

---

## 📚 References

Based on:
- **NASA AFRL-RQ-WP-TR-2010-3162**
- "Study of a Commercially Developed Air-Launched Space Booster"
- Table 7: Projected Costs for Point Design System Concepts
- Table 8: Figures of Merit for each Point Design

---

## ✅ Checklist

- [x] PD-1, PD-2, PD-3 pricing configured in backend
- [x] Launcher selection dropdown in frontend
- [x] TypeScript interfaces updated
- [x] Cost calculator uses tier-specific pricing
- [x] Results display shows launcher tier
- [x] All UI text in English
- [x] Tooltips with payload capacity info
- [x] Info box with configuration details

---

**AFREELEO Mission Calculator**
*Sustainable Space Launch Solutions from Africa* 🌍🚀
