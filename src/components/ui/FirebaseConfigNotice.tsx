import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const FirebaseConfigNotice = () => (
  <div className="w-full max-w-md rounded-xl border border-amber-400/30 bg-amber-400/10 p-6 text-left text-amber-50 shadow-lg">
    <div className="flex items-start gap-3">
      <ExclamationTriangleIcon className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" aria-hidden="true" />
      <div>
        <h1 className="text-lg font-semibold">Firebase setup required</h1>
        <p className="mt-2 text-sm leading-6 text-amber-100/80">
          This development build cannot connect to Firebase yet. Add your project settings to a local
          <code className="mx-1 rounded bg-black/20 px-1.5 py-0.5 text-amber-100">.env</code>
          file, then restart the dev server.
        </p>
        <p className="mt-3 text-xs text-amber-100/60">
          Start by copying <code>.env.example</code> to <code>.env</code> and replacing the placeholder API key.
        </p>
      </div>
    </div>
  </div>
);
