# Gyros Heroes 🥙🦸‍♂️

A high-fidelity, single-page web application for "Gyros Heroes," a fast-food restaurant. This project serves as a digital storefront for local customers to browse the menu, find locations, and access ordering options, as well as for potential employees to join the team.

## 🚀 Features

*   **Hero Section:** Engaging landing area with "Hero is in Town" messaging and call-to-actions for ordering.
*   **Menu Showcase:** Detailed visual menu displaying categories like Classic Hero, Veliki Hero, and Kids Hero with descriptions and images.
*   **About Us:** Brand story ("O Nama") sharing the Gyros Heroes journey.
*   **Locations & Gallery:** Visual showcase of store locations and interior atmosphere.
*   **Recruitment:** "Pridruži se Hero timu!" section for job applications.
*   **Testimonials:** Customer reviews section ("Šta naši gosti kažu").
*   **Responsive Design:** Fully responsive layout optimized for mobile and desktop devices.
*   **Localization:** Content available in Serbian.

## 🛠️ Tech Stack

*   **Frontend Framework:** [React](https://react.dev/) (v19)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v3.4)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Testing:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)

## 🏁 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (Latest LTS version recommended)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd gyros-heroes
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

To create a production-ready build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🧪 Running Tests

Run the test suite using Vitest:

```bash
npm test
```

## 📂 Project Structure

```
gyros-heroes/
├── src/
│   ├── assets/         # Images, icons, and static assets
│   ├── components/     # Reusable React components (Hero, Navbar, Menu, etc.)
│   ├── data/           # Static data files (menu items, text content)
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── conductor/          # Project documentation and specifications
├── tests/              # Unit and integration tests
├── public/             # Static public assets
└── ...config files     # Vite, Tailwind, TypeScript configurations
```

## 📄 License

This project is licensed under the ISC License.
