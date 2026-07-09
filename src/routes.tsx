import React from 'react';
import type { ReactNode } from 'react';

// Public pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import NomineesPage from './pages/NomineesPage';
import VotePage from './pages/VotePage';
import NomineeProfilePage from './pages/NomineeProfilePage';
import SponsorsPage from './pages/SponsorsPage';
import PartnersPage from './pages/PartnersPage';
import GalleryPage from './pages/GalleryPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Registration pages
import NomineeRegistrationPage from './pages/NomineeRegistrationPage';
import SponsorRegistrationPage from './pages/SponsorRegistrationPage';
import PartnerRegistrationPage from './pages/PartnerRegistrationPage';

// User pages
import UserProfilePage from './pages/UserProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminNominees from './pages/admin/AdminNominees';
import AdminCategories from './pages/admin/AdminCategories';
import AdminVotes from './pages/admin/AdminVotes';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSponsors from './pages/admin/AdminSponsors';
import AdminPartners from './pages/admin/AdminPartners';
import AdminNews from './pages/admin/AdminNews';
import AdminGallery from './pages/admin/AdminGallery';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminMessages from './pages/admin/AdminMessages';
import AdminReports from './pages/admin/AdminReports';
import AdminAudit from './pages/admin/AdminAudit';
import AdminSettings from './pages/admin/AdminSettings';
import AdminVoters from './pages/admin/AdminVoters';

import NotFound from './pages/NotFound';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  // Public
  { name: 'Home', path: '/', element: <HomePage />, public: true },
  { name: 'Categories', path: '/categories', element: <CategoriesPage />, public: true },
  { name: 'Nominees', path: '/nominees', element: <NomineesPage />, public: true },
  { name: 'Vote', path: '/vote', element: <VotePage />, public: true },
  { name: 'Nominee Profile', path: '/nominees/:id', element: <NomineeProfilePage />, public: true },
  { name: 'Sponsors', path: '/sponsors', element: <SponsorsPage />, public: true },
  { name: 'Partners', path: '/partners', element: <PartnersPage />, public: true },
  { name: 'Gallery', path: '/gallery', element: <GalleryPage />, public: true },
  { name: 'News', path: '/news', element: <NewsPage />, public: true },
  { name: 'News Detail', path: '/news/:id', element: <NewsDetailPage />, public: true },
  { name: 'About', path: '/about', element: <AboutPage />, public: true },
  { name: 'Contact', path: '/contact', element: <ContactPage />, public: true },
  { name: 'FAQ', path: '/faq', element: <FAQPage />, public: true },

  // Auth
  { name: 'Login', path: '/login', element: <LoginPage />, public: true },
  { name: 'Register', path: '/register', element: <RegisterPage />, public: true },
  { name: 'Forgot Password', path: '/forgot-password', element: <ForgotPasswordPage />, public: true },

  // Registrations
  { name: 'Register Nominee', path: '/register-nominee', element: <NomineeRegistrationPage />, public: true },
  { name: 'Sponsor Registration', path: '/sponsor-registration', element: <SponsorRegistrationPage />, public: true },
  { name: 'Partner Registration', path: '/partner-registration', element: <PartnerRegistrationPage />, public: true },

  // User
  { name: 'Profile', path: '/profile', element: <UserProfilePage />, public: false },

  // Admin
  { name: 'Admin Dashboard', path: '/admin', element: <AdminDashboard />, public: false },
  { name: 'Admin Users', path: '/admin/users', element: <AdminUsers />, public: false },
  { name: 'Admin Nominees', path: '/admin/nominees', element: <AdminNominees />, public: false },
  { name: 'Admin Categories', path: '/admin/categories', element: <AdminCategories />, public: false },
  { name: 'Admin Votes', path: '/admin/votes', element: <AdminVotes />, public: false },
  { name: 'Admin Payments', path: '/admin/payments', element: <AdminPayments />, public: false },
  { name: 'Admin Sponsors', path: '/admin/sponsors', element: <AdminSponsors />, public: false },
  { name: 'Admin Partners', path: '/admin/partners', element: <AdminPartners />, public: false },
  { name: 'Admin Voters', path: '/admin/voters', element: <AdminVoters />, public: false },
  { name: 'Admin News', path: '/admin/news', element: <AdminNews />, public: false },
  { name: 'Admin Gallery', path: '/admin/gallery', element: <AdminGallery />, public: false },
  { name: 'Admin Announcements', path: '/admin/announcements', element: <AdminAnnouncements />, public: false },
  { name: 'Admin Messages', path: '/admin/messages', element: <AdminMessages />, public: false },
  { name: 'Admin Reports', path: '/admin/reports', element: <AdminReports />, public: false },
  { name: 'Admin Audit', path: '/admin/audit', element: <AdminAudit />, public: false },
  { name: 'Admin Settings', path: '/admin/settings', element: <AdminSettings />, public: false },

  // 404
  { name: 'Not Found', path: '/404', element: <NotFound />, public: true },
];
