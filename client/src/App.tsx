/* TalentKenya — route tree. Public pages use PublicLayout; portals use
   PortalLayout with role-based guards (PlatformProvider wraps all). */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PlatformProvider } from "./lib/platform";

import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import CompaniesPage from "./pages/CompaniesPage";
import MarketInsightsPage from "./pages/MarketInsightsPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import CoursesPage from "./pages/CoursesPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import EmployersPage from "./pages/EmployersPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQsPage from "./pages/FAQsPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import AuthPage from "./pages/AuthPage";

import CandidateDashboardPage from "./pages/CandidateDashboardPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import CandidateApplicationsPage from "./pages/CandidateApplicationsPage";
import CandidateSavedJobsPage from "./pages/CandidateSavedJobsPage";
import CandidateApplicationReceiptsPage from "./pages/CandidateApplicationReceiptsPage";
import CandidateAlertsPage from "./pages/CandidateAlertsPage";
import CandidateResumePage from "./pages/CandidateResumePage";
import CandidateNotificationsPage from "./pages/CandidateNotificationsPage";
import CandidateOffersPage from "./pages/CandidateOffersPage";

import EmployerDashboardPage from "./pages/EmployerDashboardPage";
import EmployerPostJobPage from "./pages/EmployerPostJobPage";
import EmployerManageJobsPage from "./pages/EmployerManageJobsPage";
import EmployerATSBoardPage from "./pages/EmployerATSBoardPage";
import EmployerTalentSearchPage from "./pages/EmployerTalentSearchPage";
import EmployerBillingPage from "./pages/EmployerBillingPage";
import EmployerCompanyPage from "./pages/EmployerCompanyPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminVerificationsPage from "./pages/AdminVerificationsPage";
import AdminModerationPage from "./pages/AdminModerationPage";
import AdminFinancePage from "./pages/AdminFinancePage";
import AdminContentPage from "./pages/AdminContentPage";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={HomePage} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/jobs/:slug" component={JobDetailPage} />
      <Route path="/companies" component={CompaniesPage} />
      <Route path="/insights" component={MarketInsightsPage} />
      <Route path="/companies/:slug" component={CompanyDetailPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:id" component={BlogPostPage} />
      <Route path="/employers" component={EmployersPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/faqs" component={FAQsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/auth" component={AuthPage} />

      {/* Candidate portal */}
      <Route path="/candidate/dashboard" component={CandidateDashboardPage} />
      <Route path="/candidate/profile" component={CandidateProfilePage} />
      <Route path="/candidate/applications" component={CandidateApplicationsPage} />
      <Route path="/candidate/saved-jobs" component={CandidateSavedJobsPage} />
      <Route path="/candidate/application-receipts" component={CandidateApplicationReceiptsPage} />
      <Route path="/candidate/alerts" component={CandidateAlertsPage} />
      <Route path="/candidate/notifications" component={CandidateNotificationsPage} />
      <Route path="/candidate/offers" component={CandidateOffersPage} />
      <Route path="/candidate/resume-builder" component={CandidateResumePage} />

      {/* Employer portal */}
      <Route path="/employer/dashboard" component={EmployerDashboardPage} />
      <Route path="/employer/post-job" component={EmployerPostJobPage} />
      <Route path="/employer/post-job/:id" component={EmployerPostJobPage} />
      <Route path="/employer/manage-jobs" component={EmployerManageJobsPage} />
      <Route path="/employer/ats" component={EmployerATSBoardPage} />
      <Route path="/employer/ats/:jobId" component={EmployerATSBoardPage} />
      <Route path="/employer/talent-search" component={EmployerTalentSearchPage} />
      <Route path="/employer/billing" component={EmployerBillingPage} />
      <Route path="/employer/company" component={EmployerCompanyPage} />

      {/* Admin control center */}
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/verifications" component={AdminVerificationsPage} />
      <Route path="/admin/moderation" component={AdminModerationPage} />
      <Route path="/admin/finance" component={AdminFinancePage} />
      <Route path="/admin/content" component={AdminContentPage} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <PlatformProvider>
            <Router />
          </PlatformProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
