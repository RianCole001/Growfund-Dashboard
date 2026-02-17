import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { UserAuthProvider } from './auth/UserAuthContext';
import { AdminAuthProvider } from './auth/AdminAuthContext';
import { DemoProvider } from './demo/DemoContext';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import AppNew from './AppNew';
import AdminApp from './AdminApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DemoProvider>
      <AuthProvider>
        <UserAuthProvider>
          <AdminAuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify" element={<VerifyEmailPage />} />
                <Route path="/forgot" element={<ForgotPasswordPage />} />
                <Route path="/reset" element={<ResetPasswordPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/app/*" element={<AppNew />} />
                <Route path="/admin" element={
                  <ProtectedAdminRoute>
                    <AdminApp />
                  </ProtectedAdminRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AdminAuthProvider>
        </UserAuthProvider>
      </AuthProvider>
    </DemoProvider>
  </React.StrictMode>
);

reportWebVitals();
