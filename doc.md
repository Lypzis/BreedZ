# 🐄 BreedZ — Product Spec (MVP v1)

## 🎯 Purpose

BreedZ is a **simple livestock management system** designed for:

- small to medium farmers  
- low connectivity environments  
- daily operational tracking  

Core idea:

> Track animals and events, even without internet

---

## 🧠 Product Principles

BreedZ MUST be:

- offline-first  
- fast to use  
- minimal UI  
- mobile-friendly  

BreedZ should NOT be:

- a full ERP  
- analytics-heavy  
- feature overloaded  

---

## 📦 Core Use Case

> User opens app in the field → finds an animal → records an event → done in seconds

---

## 🧩 MVP Scope (STRICT)

### 1️⃣ Animal Management

User can:

- create animal  
- edit animal  
- list animals  

**Animal fields:**

- id  
- tag / name  
- species (cow, pig, etc)  
- birth date  
- status (active, sold, dead)  
- notes  

---

### 2️⃣ Event Tracking

User can log:

- birth  
- breeding  
- vaccination  
- health issue  
- death  
- custom event  

**Each event:**

- animal_id  
- type  
- date  
- notes  

---

### 3️⃣ Timeline (VERY important)

Each animal has:

- chronological event history  

This is the **main value screen**.

---

### 4️⃣ Simple Dashboard (NO charts)

Instead of charts:

**Today:**

- 2 animals need vaccination  
- 1 breeding expected  

Keep it:

- actionable  
- not analytical  

---

### 5️⃣ Offline Mode (CORE FEATURE)

App must work:

- without internet  

**Behavior:**

- store data locally (IndexedDB)  
- no backend required  
- works fully offline  

---

### 6️⃣ Data Safety (MVP)

To compensate for no backend:

- export data as JSON  
- import data from JSON  

---

## ⚙️ Technical Architecture (MVP)

### Frontend

- Quasar (Vue)  
- PWA enabled  
- IndexedDB for storage  

---

### Backend

❌ No backend in MVP

Future (v2+):

- backend for sync  
- user accounts  
- cloud backup  

---

## 🔄 Future Sync Strategy (NOT in MVP)

When backend is introduced:

- push local changes → server  
- pull server updates → client  

Conflict rule:

- last write wins  

---

## 📱 UX Design

### Home screen

**Today:**

- 1 vaccination due  
- 2 animals in heat  

Buttons:

- View animals  
- Add event  

---

### Animal screen

- Animal name  
- Status  

**Timeline:**

- Vaccination (Jan 10)  
- Breeding (Feb 2)  
- Birth (Mar 5)  

---

### Add event (fast)

- Select animal  
- Select event type  
- Add note  
- Save  

Target:

> < 5 seconds interaction

---

## 🚫 Not in MVP

Do NOT build:

- backend  
- authentication  
- sync system  
- charts  
- finance tracking  
- inventory  
- multi-farm support  
- advanced analytics  
- IoT integration  

---

## 💰 Monetization (future)

- Free → local-only usage  
- Paid → sync + backup + multi-device + reports  

---

## 🧪 Validation Goal

> Will a farmer actually use this daily?

---

## 🧭 Development Scope

- 1 week → usable MVP  
- 2 weeks → polished MVP  

---

## ⚠️ Current Priority

This is a **future project**.

Current focus:

- PriceZ → traction  
- Leadz → minimal usable slice  

---

## 🧠 Summary

BreedZ is a:

- simple  
- offline-first  
- fast  
- real-world tool  

focused on:

> daily farm operations, not analytics
