import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import { useStaffSession } from './hooks/useStaffSession';

function RequireStaff({ children }: { children: React.ReactNode }) {
  const { status } = useStaffSession();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'anonymous') return <Navigate to="/scan/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { status } = useStaffSession();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'authenticated') return <Navigate to="/scan/" replace />;
  return <>{children}</>;
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-hero-blue-dark text-white font-montserrat">
      <span className="text-sm uppercase tracking-widest opacity-80">Učitavanje…</span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/scan/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/scan/"
          element={
            <RequireStaff>
              <Scanner />
            </RequireStaff>
          }
        />
        <Route path="*" element={<Navigate to="/scan/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
