import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import { AppShell } from "./AppShell";
import { LandingPage } from "@/features/landing/LandingPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/features/auth/VerifyEmailPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { SkillsPage } from "@/features/skills/SkillsPage";
import { MentorsPage } from "@/features/mentors/MentorsPage";
import { MatchesPage } from "@/features/matching/MatchesPage";
import { RequestsPage } from "@/features/requests/RequestsPage";
import { ReviewsPage } from "@/features/reviews/ReviewsPage";
import { AiAssistantPage } from "@/features/ai/AiAssistantPage";
import { RagAssistantPage } from "@/features/ai/RagAssistantPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { AdminLayout } from "@/features/admin/AdminLayout";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { UserManagement } from "@/features/admin/UserManagement";
import { MentorManagement } from "@/features/admin/MentorManagement";
import { AnalyticsPage } from "@/features/admin/AnalyticsPage";
import { ReportsPage } from "@/features/admin/ReportsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="mentors" element={<MentorsPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="ai" element={<AiAssistantPage />} />
          <Route path="rag" element={<RagAssistantPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route element={<RequireAuth roles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="mentors" element={<MentorManagement />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
