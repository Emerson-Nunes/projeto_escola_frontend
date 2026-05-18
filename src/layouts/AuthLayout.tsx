import React from 'react';
import { Outlet } from 'react-router-dom';
import { School } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SisEscolar</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sistema de Gestão Escolar</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
