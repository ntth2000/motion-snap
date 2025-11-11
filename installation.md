# Motion-Snap Installation Guide (Motion-Snap)

This guide shows how to install and run the Motion-snap project using EasyMocap with Docker.

---

## 1. Clone EasyMocap
```bash
cd BE
git clone https://github.com/zju3dv/EasyMocap.git
```

## 2. Install Required Models and Packages
- Follow the installation instructions in EasyMocap/doc/installation.md.
- Download the pare model from Google Drive and place it into EasyMocap/models/pare.
- Copy J_regressor_body25.npy into EasyMocap/models/.

## 3. Build Docker Image
```bash
cd BE
docker build -t easymocap .
```


