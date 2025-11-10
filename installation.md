# Motion-Snap Installation Guide (Motion-Snap)

This guide shows how to install and run the Motion-snap project using EasyMocap with Docker.

---

## Prerequisites

Before starting, make sure you have installed:

- **Python 3.10+**  
- **Node.js**  
- **Docker**  

---

## 1. Clone Motion-Snap

```bash
git clone https://github.com/ntth2000/motion-snap.git install_motionsnap
cd install_motionsnap/BE
pip install -r requirements.txt
```

## 2. Clone EasyMocap
```bash
git clone https://github.com/zju3dv/EasyMocap.git
```

## 3. Install Required Models and Packages
- Follow the installation instructions in EasyMocap/doc/installation.md.
- Download the pare model from Google Drive and place it into EasyMocap/models/pare.
- Copy J_regressor_body25.npy into EasyMocap/models/.

## 4. Build Docker Image
```bash
cd BE
docker build -t easymocap .
```

## 5. Set Up Environment Variables
Create a .env file in BE/ with the following content:
SECRET_KEY=your_secret_key
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name

### Make sure to replace the placeholder values with your actual credentials.


