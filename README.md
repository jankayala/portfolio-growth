# Portfolio Growth Visualizer

An interactive web tool to visualize long-term portfolio growth with customizable return scenarios.

## Features

- **Triple-handle slider** — set pessimistic, expected, and optimistic annual return rates
- **Contribution growth** — model increasing contributions over time (e.g., raises or inflation-adjusted saving)
- **Interactive chart** — line graph showing portfolio value, total invested, bad/good return scenarios
- **Milestone table** — year-by-year breakdown with automatic highlighting when the portfolio reaches €1M
- **State persistence** — your inputs are saved to localStorage across sessions

## Usage

Open `index.html` in a browser. No build step or server required.

| Input | Description |
|---|---|
| Initial Portfolio | Starting lump sum (€) |
| Monthly Contribution | Regular monthly investment (€) |
| Contribution Growth | Yearly increase of contributions (%) |
| Annual Return | Three-point slider: bad / expected / good return (%) |
| Years | Investment horizon |

## Stack

- Vanilla JavaScript (ES6)
- [Chart.js](https://www.chartjs.org/) for charting
- CSS Grid layout, no frameworks