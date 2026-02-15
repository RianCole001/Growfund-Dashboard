<<<<<<< HEAD
# Trading Dashboard

A modern, responsive trading dashboard built with React, Tailwind CSS, and Recharts. This project provides a sleek interface for viewing market summaries, stock indices, and watchlists.

![Trading Dashboard Screenshot](http://www.marketcalls.in/wp-content/uploads/2024/06/Screenshot-2024-06-23-at-9.40.41 AM.png)

## Features

- Real-time market summary display
- Interactive line chart for visualizing market trends
- Customizable watchlist
- Responsive design for desktop and mobile devices
- Country flags for quick visual reference of market indices

## Technologies Used

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) for data visualization
- [Lucide React](https://lucide.dev/) for icons

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/marketcalls/trading-dashboard.git
   ```

2. Navigate to the project directory:
   ```sh
   cd trading-dashboard
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

4. Start the development server:
   ```sh
   npm start
   ```

5. Open your browser and visit `http://localhost:3000` to view the dashboard.

## Usage

The trading dashboard displays market summaries for major indices, an interactive chart, and a watchlist. Users can:

- View real-time market data (mock data used in this demo)
- Interact with the chart to view specific data points
- Customize the watchlist (functionality to be implemented)

## Customization

### Adding New Indices

To add new indices to the market summary, edit the `indices` array in the `TradingDashboard` component:

```javascript
const indices = [
  // ... existing indices
  { name: 'New Index', value: 1000.00, change: 0.5, color: 'green', flag: '🇺🇸' },
];
```

### Modifying the Watchlist

To modify the watchlist, edit the `watchlistItems` array in the `TradingDashboard` component:

```javascript
const watchlistItems = [
  // ... existing items
  { symbol: 'NEW', price: 100.00, change: 1.5, color: 'green' },
];
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide React](https://lucide.dev/)


=======
# Growfund Dashboard

Growfund Dashboard is a modern React-based investment dashboard designed to manage user onboarding, investments, deposits, and portfolio insights. It serves as the authenticated area of the Growfund platform, working alongside the main marketing website.

---

## 🚀 Features

- 🔐 User Authentication (Register & Login)
- 📊 Investment Dashboard
- 💰 Deposit & Transaction Tracking
- 📈 Portfolio Overview
- 🧭 User Onboarding Flow
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast development using Vite

---

## 🏗️ Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **State Management:** Context API
- **Auth Integration:** API-based (JWT / Session-ready)
- **Package Manager:** npm

---

## ⚙️ Getting Started (Local Development)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/RianCole001/Growfund-Dashboard.git<img width="1366" height="686" alt="investment plans" src="https://github.com/user-attachments/assets/02824688-43a8-483d-82d7-efa80008359d" />

cd Growfund-Dashboard
npm install


---

## 📂 Project Structure
>>>>>>> e61124b582335b4337c3fc80e9bd7016285cb59e

