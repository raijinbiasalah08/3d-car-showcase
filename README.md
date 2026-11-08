# 🏎️ 3D Hypercar Studio & Multi-Route City Showcase

A WebGL / Three.js interactive 3D automotive experience featuring real-time vehicle dynamics, dynamic camera controls, multi-model vehicle switching, two-way reactive ambient traffic with collision physics, and 4 drivable environments.

---

## ✨ Features

### 🚗 Vehicle Catalog
- **Verde R1**: Acid-lime concept hypercar with carbon aerodynamics and LED signature lighting.
- **Lexus IS**: Premium sports sedan in metallic silver pearl with dual-lens quad-LED headlights.
- **Golf 8**: Iconic German hot hatch in pure red with signature honeycomb matrix front intake.
- **Audi e-tron**: Deep metallic mythos black electric SUV with illuminated cyber-grille elements.

### 🛣️ 4 Drivable Routes
1. **Waterfront Boulevard**: Ground-level ($y = 0\text{m}$) scenic coastal drive overlooking the East River promenade and distant Manhattan skyline.
2. **Elevated Expressway (Skyway)**: Elevated viaduct ($y = 7.8\text{m}$) with concrete jersey barriers, green overhead destination gantries, and sweeping highway curves.
3. **Brooklyn Bridge Run**: High-altitude suspension crossing ($y = 24.5\text{m}$) passing directly through Neo-Gothic lancet arch stone portals, radiating diagonal stay wire ropes, and glowing emerald necklace lights.
4. **Metropolis Canyon**: Downtown skyscraper canyon ($y = 0\text{m}$) flanked by illuminated skybridges, neon blade signage, and bustling sidewalks.

### 💥 Realistic Vehicle Physics & Interactions
- **Spring-Damper Suspension**: Hooke's law + viscous damping simulation for authentic body roll, pitch dive/squat under braking, and vertical road bounce.
- **Dynamic 2-Way Traffic**: Oncoming traffic on the left lanes with glowing xenon headlights; forward traffic on the right lanes with reactive brake lights.
- **Full Collision & Bump Motion**: Momentum exchange, lateral push apart, momentary yaw kick, spark particle bursts, and camera trauma shake upon vehicle contact.
- **Articulated Pedestrians**: Animated walking pedestrians strolling along sidewalks and promenades.

---

## 🎮 Controls

| Action | Key / Input |
|---|---|
| **Steer Left / Right** | `A` / `D` or `←` / `→` |
| **Accelerate / Drive** | `W` or `↑` |
| **Brake / Reverse** | `S` or `↓` |
| **Switch Car Model** | `C` or Top HUD Buttons |
| **Switch Route** | `R` or Top HUD Route Pills |
| **Free Orbit Camera** | Click + Drag mouse |
| **Zoom Camera** | Mouse Wheel |

---

## 🛠️ Tech Stack
- **Three.js** (WebGL 3D Rendering)
- **Vite** (Build Tool & Development Server)
- Pure Procedural Geometries & Shaders

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/raijinbiasalah08/3d-car-showcase.git
cd 3d-car-showcase

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

