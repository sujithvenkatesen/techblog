import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import { trackPageView } from './hooks';

// Article page pulls in highlight.js, so it is split out of the main bundle.
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));

// Admin is code-split so public visitors never download the CMS.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const PostEditor = lazy(() => import('./pages/admin/PostEditor'));
const TaxonomyPage = lazy(() => import('./pages/admin/TaxonomyPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));

function PublicLayout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    else setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
    trackPageView(pathname);
  }, [pathname, hash]);
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}

const NotFound = () => (
  <div className="container-x pt-[calc(var(--nav-h)+120px)] text-center">
    <h1 className="font-display text-8xl text-cobalt">404</h1>
    <p className="mt-4 text-white/60">This page drifted off the grid.</p>
    <Link to="/" className="btn-lime mt-8">Back home →</Link>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center font-mono text-xs uppercase tracking-[0.2em] text-white/50">Loading…</div>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:slug" element={<ArticleDetail />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:id" element={<PostEditor />} />
          <Route path="taxonomy" element={<TaxonomyPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
