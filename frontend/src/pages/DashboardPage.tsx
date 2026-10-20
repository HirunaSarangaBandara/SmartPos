import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { employee, logout } = useAuth();

  const isAdmin = employee?.role === 'ADMIN';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              SmartPOS Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Store Management System
            </p>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium transition hover:bg-slate-100"
          >
            Sign Out
          </button>
        </header>

        {/* Employee Information */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Welcome to SmartPOS
          </h2>

          <div className="space-y-3">
            <p>
              Welcome back,{' '}
              <span className="font-semibold text-blue-700">
                {employee?.name ?? 'Employee'}
              </span>
              !
            </p>

            <p className="text-sm text-slate-600">
              Email:{' '}
              <span className="font-medium">
                {employee?.email}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                Employee Role:
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isAdmin
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {employee?.role}
              </span>
            </div>
          </div>
        </section>

        {/* Module Navigation */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Management Modules
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Product Management */}
            <Link
              to="/products"
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                📦
              </div>

              <h3 className="mb-2 text-lg font-semibold group-hover:text-blue-700">
                Product Management
              </h3>

              <p className="mb-4 text-sm text-slate-500">
                {isAdmin
                  ? 'Add, edit, search and manage store products.'
                  : 'View and search available store products.'}
              </p>

              <span className="text-sm font-semibold text-blue-700">
                Open Products →
              </span>
            </Link>

            {/* Admin Management */}
            {isAdmin && (
              <Link
                to="/admin"
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-400 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                  🛡️
                </div>

                <h3 className="mb-2 text-lg font-semibold group-hover:text-violet-700">
                  Admin Area
                </h3>

                <p className="mb-4 text-sm text-slate-500">
                  Access administrator-only features and
                  verify role-based permissions.
                </p>

                <span className="text-sm font-semibold text-violet-700">
                  Open Admin Area →
                </span>
              </Link>
            )}

            {/* Inventory - Future Feature */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 opacity-60">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                📊
              </div>

              <h3 className="mb-2 text-lg font-semibold">
                Inventory Management
              </h3>

              <p className="mb-4 text-sm text-slate-500">
                Track stock levels and inventory movements.
              </p>

              <span className="text-xs font-medium text-slate-400">
                Coming Soon
              </span>
            </div>

            {/* Sales - Future Feature */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 opacity-60">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                🛒
              </div>

              <h3 className="mb-2 text-lg font-semibold">
                Point of Sale
              </h3>

              <p className="mb-4 text-sm text-slate-500">
                Process customer purchases and generate receipts.
              </p>

              <span className="text-xs font-medium text-slate-400">
                Coming Soon
              </span>
            </div>

            {/* Reports - Future Feature */}
            {isAdmin && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 opacity-60">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-2xl">
                  📈
                </div>

                <h3 className="mb-2 text-lg font-semibold">
                  Sales Reports
                </h3>

                <p className="mb-4 text-sm text-slate-500">
                  View sales summaries and business performance.
                </p>

                <span className="text-xs font-medium text-slate-400">
                  Coming Soon
                </span>
              </div>
            )}

          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-5 text-center text-sm text-slate-400">
          SmartPOS — Day 5 Product Management
        </footer>

      </div>
    </main>
  );
}