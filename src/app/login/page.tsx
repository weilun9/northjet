import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
