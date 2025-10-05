
# 🚀 TriVana - Exoplanet Detection Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)  
[![React](https://img.shields.io/badge/React-17.0+-blue)](https://reactjs.org/)

---

## 🌌 Overview
*TriVana* is a web-based platform designed to *accelerate exoplanet discovery* using *advanced machine learning* and *immersive 3D simulations. Leveraging **CNNs, Random Forest classifiers, and clustering algorithms*, the platform enables users—from casual enthusiasts to professional researchers—to analyze astrophysical datasets, predict exoplanet existence accurately, and explore orbital systems interactively in real time.

---

## ✨ Key Features
- *Dual Modes of Use*
  - *Demo Mode:* Quick Kepler ID predictions with instant 3D orbital simulation.  
  - *Explore Mode:* Advanced research tools, including CSV uploads, light curve generation, classification, graph plotting, and detailed feature visualization.
- *Hybrid Machine Learning:* Combines CNN, Random Forest, and clustering for precise exoplanet detection.  
- *Data Flexibility:* Supports NASA catalogue queries and custom user uploads.  
- *Immersive Interface:* Dark-themed, responsive UI with animated starfield and interactive 2D/3D orbit visualizations using Three.js/WebGL.  
- *Real-time Feedback:* Instant results and visualizations with interactive planetary simulations.  

---

## 🛠 Technologies Used
- *Frontend:* ReactJS, JavaScript, Three.js/WebGL, CSS/HTML  
- *Backend:* Python (Flask or FastAPI), REST APIs  
- *Machine Learning:* TensorFlow, Keras, scikit-learn  
- *Deployment:* Docker, AWS/Azure cloud platforms  

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm  
- Python 3.8+  
- Docker (optional for containerized deployment)  
- NASA Exoplanet Archive API access or sample datasets  

### Installation

#### Frontend
```bash
cd frontend
npm install
npm start
```
#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

### 🎯 Usage

1. Select Demo Mode or Explore Mode.


2. Upload a CSV dataset or query the NASA database.


3. Run ML analysis to detect potential exoplanets.


4. Visualize and interact with 2D/3D orbital simulations.


5. Explore predictions, light curves, and detailed feature insights.




---

### 📂 Project Structure
```graphql
TriVana/
├── frontend/        # ReactJS user interface
│   ├── public/      # Public assets like index.html, favicon, etc.
│   └── src/         # React components, pages, styles, and utilities
├── backend/         # API server and ML model hosting
│   ├── app/         # Core backend logic (routes, controllers)
│   ├── requirements.txt  # Python dependencies
│   └── server.py    # Entry point for backend server
├── models/          # Pre-trained and serialized ML models
├── data/            # Sample datasets and data processing scripts
├── docs/            # Project documentation, notes, and diagrams
├── scripts/         # Utility scripts for preprocessing or automation
└── README.md        # Project overview and instructions
```


---

### 🤝 Contributing

We welcome contributions!

1. Fork the repository


2. Create a new branch (git checkout -b feature-name)


3. Make your changes and commit (git commit -m 'Add feature')


4. Push to the branch (git push origin feature-name)


5. Open a Pull Request





---

### 👥 Team

Team TriVana

Team Lead: Abhinav Singh



---

### 🙏 Acknowledgements

Developed as part of the NASA Space Apps Challenge – Noida 2025.




---

If you want, I can also *create a shorter “landing-page style” README* that fits within 1–2 scrolls, perfect for first impressions on GitHub. Do you want me to do that?
