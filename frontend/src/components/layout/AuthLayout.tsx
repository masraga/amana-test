import { Outlet } from 'react-router-dom';
import ToastContainer from '../common/ToastContainer';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Amana</h1>
          <p className="text-gray-500 mt-1">Case Management Platform</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8">
          <Outlet />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
