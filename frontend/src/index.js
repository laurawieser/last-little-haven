import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';

// base
import "./styles/base/reset.css";
import "./styles/base/variables.css";
import "./styles/base/typography.css";

// layout
import "./styles/layout/layout.css";
import "./styles/layout/header.css";
import "./styles/layout/footer.css";

// components
import "./styles/components/buttons.css";
import "./styles/components/cards.css";
import "./styles/components/forms.css";

// pages
import "./styles/pages/archive.css";
import "./styles/pages/entry-detail.css";
import "./styles/pages/map.css";
import "./styles/pages/submit.css";
import "./styles/pages/admin.css";
import "./styles/pages/home.css";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
