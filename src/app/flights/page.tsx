import { Suspense } from 'react';
import FlightsContent from './FlightsContent';

export default function FlightsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading flights…</p>
        </div>
      </div>
    }>
      <FlightsContent />
    </Suspense>
  );
}
