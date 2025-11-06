import { Outlet } from "react-router-dom";


export default function AccommodationPage() {
return (
<div className="min-h-screen bg-gray-50">
<header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
<h1 className="text-xl font-bold text-rose-600">Accommodation</h1>
<nav className="flex items-center gap-4 text-sm text-gray-700">
<a href="/accommodations" className="hover:underline">목록</a>
<a href="/accommodations/new" className="hover:underline">등록</a>
</nav>
</div>
</header>
<main className="mx-auto max-w-7xl p-4 lg:p-8">
<Outlet />
</main>
</div>
);
}