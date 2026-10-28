# ATM Cash Refill Simulator 🏦
> **Interactive Operating Systems Producer–Consumer Problem Laboratory**

A modern, educational web application built with **React**, **TypeScript**, and **Tailwind CSS** that visualizes the classical **Producer–Consumer (Bounded Buffer)** operating systems problem using a real-world **ATM Cash Refill & Withdrawal** analogy.

Developed for Computer Science and Engineering students, professors, and lab practical demonstrations.

---

## 📌 Project Overview

In operating systems, the **Producer–Consumer Problem** represents synchronization between concurrent processes sharing a fixed-size buffer:
- **Producer (Bank Cash Refill Team):** Refills $100 cash units into the ATM's internal bounded cash cassette.
- **Consumer (ATM Customer):** Withdraws $100 cash units from the ATM.
- **Shared Buffer (ATM Cash Storage):** A circular memory array with a bounded capacity of **10 slots**.

Without proper synchronization, concurrent memory operations lead to **buffer overflow** (jamming cash into a full ATM), **buffer underflow** (dispensing cash from an empty ATM), or **race conditions / lost updates**.

This simulator demonstrates how **Dijkstra Counting Semaphores** (`empty` and `full`) and a **Binary Mutex Lock** guarantee safety and mutual exclusion.

---

## 🚀 Key Features

### 1. Real-Time Live Simulation Stage
- **Visual Process Pipeline:** Watch cash notes travel from the Bank Refill Van $\to$ ATM Storage Slot $\to$ Customer withdrawal chute with animated bill motion and halos.
- **Live State Ticker:** Instant visual reporting of current memory actions (e.g., `⚡ Bank Refill Team: Loading $100 into Slot #4 (Mutex Locked)`).
- **Execution Speed Controller:** Switch between **Slow (2.6s)**, **Normal (1.6s)**, and **Fast ⚡ (0.9s)** speeds for classroom presentations.
- **Step-by-Step Mode:** Pause the automated loop and trigger operations one at a time (`Step`) during oral examinations (viva).

### 2. Comprehensive Dashboard
- **Key Metrics:** Current ATM cash units, available free slots, occupied slots, total deposits, and total withdrawals.
- **Real-Time Recharts Area Chart:** Live tracking of ATM cash capacity and utilization over time.
- **Recent Activity Log:** Timestamped log of memory operations, actor IDs, and semaphore values.

### 3. Producer–Consumer Simulator
- **10 Visual Storage Slots:** Circular buffer slots (#0 to #9) with dynamic `IN` (refill insertion) and `OUT` (dispense extraction) pointer tracking.
- **Manual & Automated Controls:** Add Cash (+$100), Withdraw Cash (-$100), Start, Pause, Step, and Reset.
- **Process States:** Visual indicators for `RUNNING`, `WAITING`, `ATM FULL`, and `ATM EMPTY`.

### 4. Synchronization Deep Dive
- **Counting Semaphores:**
  - `empty`: Number of free slots (initialized to 10; decrements on refill, increments on withdrawal).
  - `full`: Number of occupied notes (initialized to 0; increments on refill, decrements on withdrawal).
- **Binary Mutex Lock:** Binary lock (0 or 1) that enforces **Mutual Exclusion** in the Critical Section.
- **Mathematical Invariant:** Continuous runtime verification that $\text{empty} + \text{full} = 10$.
- **POSIX C Code Reference:** Step-by-step walkthrough of `sem_wait(&empty)`, `pthread_mutex_lock(&mutex)`, array insertion, `pthread_mutex_unlock(&mutex)`, and `sem_post(&full)`.

### 5. Empty & Full Boundary Conditions Lab
- **ATM Empty Testing:** Triggers `ATM EMPTY — Consumer Waiting` when buffer count is 0, demonstrating that `sem_wait(&full)` blocks consumer processes to prevent underflow.
- **ATM Full Testing:** Triggers `ATM FULL — Producer Waiting` when buffer count is 10, demonstrating that `sem_wait(&empty)` blocks producer processes to prevent overflow.
- **Quick Scenarios:** "Demonstrate ATM Empty", "Demonstrate ATM Full", and "Reset Initial State".

### 6. Race Condition Demonstration Lab
- **Controlled Concurrency Experiment:** Two customers attempt to withdraw $300 simultaneously from a shared $1,000 balance.
- **Without Mutex:** Demonstrates the classical **Lost Update Anomaly** where thread preemption causes Customer B's write to be overwritten by Customer A, resulting in an erroneous final balance of $700 instead of $400.
- **With Mutex:** Demonstrates proper serialized critical sections where the lock queues Customer B until Customer A completes, resulting in the correct $400 balance.

### 7. Analytics & Telemetry
- **Recharts Visualizations:**
  - Cash Level Timeline (Area Chart).
  - Cash Refills vs. Cash Withdrawals (Bar Chart).
- **Quantitative Metrics:** Buffer utilization percentage, total operations, producer waiting count, and consumer waiting count.

### 8. Learn OS Concepts & Quiz
- **8 Core Conceptual Cards:**
  1. Producer–Consumer Problem
  2. Shared Buffer
  3. Process Synchronization
  4. Semaphore
  5. Mutex
  6. Critical Section
  7. Race Condition
  8. Deadlock
  *(Each concept includes a formal OS definition paired with an intuitive ATM real-world analogy).*
- **Practical Multiple-Choice Quiz:** 5 questions with instant feedback, explanations, and score tracking.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 (TypeScript)
- **Bundler & Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (Purple & White Academic Theme)
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18.0 or higher recommended)
- npm or yarn

### Installation
1. Clone or extract the project repository:
   ```bash
   cd atm-cash-refill-simulator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).

### Production Build
To create an optimized production build:
```bash
npm run build
```

---

## 📐 Operating Systems Theory Summary

### Producer Algorithm (Bank Refill Team)
```c
void* producer(void* param) {
    while (1) {
        sem_wait(&empty);            // Decrement empty slots (blocks if buffer is full)
        pthread_mutex_lock(&mutex);   // Enter Critical Section

        buffer[in] = cash_note;      // Insert cash item into shared array
        in = (in + 1) % CAPACITY;

        pthread_mutex_unlock(&mutex); // Exit Critical Section
        sem_post(&full);             // Increment filled slots (wakes waiting consumer)
    }
}
```

### Consumer Algorithm (ATM Customer)
```c
void* consumer(void* param) {
    while (1) {
        sem_wait(&full);             // Decrement filled slots (blocks if buffer is empty)
        pthread_mutex_lock(&mutex);   // Enter Critical Section

        cash_note = buffer[out];     // Extract cash item from shared array
        out = (out + 1) % CAPACITY;

        pthread_mutex_unlock(&mutex); // Exit Critical Section
        sem_post(&empty);            // Increment empty slots (wakes waiting producer)
    }
}
```

---

## 📄 License
This project is licensed under the Apache-2.0 License.
