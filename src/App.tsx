import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Register,
  Dashboard,
  MyChildren,
  Calendar,
  Settings,
  DashboardTeacher,
  Courses,
  Students,
  DailyQuizStudent,
  Lessons,
  Material,
  MultiplayerQuiz,
  QuizConfirmation,
  SoloQuiz,
  QuizResult,
  StudentDashboard,
  StudentResult,
  StudentSubjects,
  StudentTopics,
  RootSubjects,
  DailyQuizOverview,
  AddQuiz,
  EmployeeDetails,
  MyQuizzes,
  UpdateQuiz,
  QuizzesDetails,
  StudentResult as EmployeeResultScreen
} from "./screens";
import Employees from "./screens/hrAdminScreens/Employees/Employees";
import Subscription from "./screens/hrAdminScreens/Subscription/Subscription";
import { RouteName } from "./routes/RouteNames";
import { Navbar, SideDrawer, ProtectedRoute } from "./components";
import { SubjectTopicManagement } from "./screens/hrAdminScreens/SubjectTopicManagement";
import { TeacherFeedback } from './screens/hrAdminScreens/TeacherFeedback';

/**
 * App Component with Authentication Protection
 * 
 * This app implements route protection where:
 * - Only login page (AUTH_SCREEN) is publicly accessible
 * - All other routes require authentication
 * - Role-based access control is enforced for specific routes
 * - Users are redirected to login if not authenticated
 * - After login, users are redirected to their intended destination
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path={RouteName.AUTH_SCREEN} element={<Register />} />

        {/* Future: Homepage route will be added here when implemented */}
        {/* <Route path={RouteName.HOME_SCREEN} element={<HomePage />} /> */}

        {/* Protected Routes - Authentication required */}

        {/* HR-Admin Routes */}
        <Route path={RouteName.DASHBOARD_SCREEN_HR_ADMIN} element={
          <ProtectedRoute requiredRole="HR-Admin">
            <DashboardTeacher />
          </ProtectedRoute>
        } />
        <Route path={RouteName.SUBSCRIPTION} element={
          <ProtectedRoute requiredRole="HR-Admin">
            <Subscription />
          </ProtectedRoute>
        } />
        <Route path={RouteName.EMPLOYEES_SCREEN} element={
          <ProtectedRoute requiredRole="HR-Admin">
            <Employees />
          </ProtectedRoute>
        } />
        <Route path={RouteName.EMPLOYEE_DETAILS_SCREEN} element={
          <ProtectedRoute requiredRole="HR-Admin">
            <EmployeeDetails />
          </ProtectedRoute>
        } />
        <Route path={RouteName.MY_QUIZZES} element={
          <ProtectedRoute requiredRole="HR-Admin">
            <MyQuizzes />
          </ProtectedRoute>
        } />
        <Route path={RouteName.ADD_QUIZ} element={
          <ProtectedRoute requiredRole="HR-Admin">
            <AddQuiz />
          </ProtectedRoute>
        } />
        <Route path={RouteName.UPDATE_QUIZ} element={
          <ProtectedRoute requiredRole="HR-Admin">
            <UpdateQuiz />
          </ProtectedRoute>
        } />
        <Route path={RouteName.SUBJECT_TOPIC_MANAGEMENT} element={
          <ProtectedRoute requiredRole="HR-Admin">
            <SubjectTopicManagement />
          </ProtectedRoute>
        } />

        {/* Supervisor Routes */}
        <Route path={RouteName.DASHBOARD_SCREEN} element={
          <ProtectedRoute requiredRole="Supervisor">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path={RouteName.MYEMPLOYEES_SCREEN} element={
          <ProtectedRoute requiredRole="Supervisor">
            <MyChildren />
          </ProtectedRoute>
        } />

        {/* Employee Routes */}
        <Route path={RouteName.DASHBOARD_SCREEN_EMPLOYEE} element={
          <ProtectedRoute requiredRole="Employee">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path={RouteName.SUBJECTS_SCREEN} element={
          <ProtectedRoute requiredRole="Employee">
            <StudentSubjects />
          </ProtectedRoute>
        } />
        <Route path={RouteName.TOPICS_SUBJECTS} element={
          <ProtectedRoute requiredRole="Employee">
            <StudentTopics />
          </ProtectedRoute>
        } />
        <Route path={RouteName.LESSONS_EMPLOYEE} element={
          <ProtectedRoute requiredRole="Employee">
            <Lessons />
          </ProtectedRoute>
        } />
        <Route path={RouteName.MATERIAL_EMPLOYEE} element={
          <ProtectedRoute requiredRole="Employee">
            <Material />
          </ProtectedRoute>
        } />
        <Route path={RouteName.RESULTS_SCREEN} element={
          <ProtectedRoute requiredRole="Employee">
            <EmployeeResultScreen />
          </ProtectedRoute>
        } />
        <Route path={RouteName.QUIZZES_DETAILS} element={
          <ProtectedRoute requiredRole="Employee">
            <QuizzesDetails />
          </ProtectedRoute>
        } />
        <Route path={RouteName.QUIZ_CONFIRMATION} element={
          <ProtectedRoute requiredRole="Employee">
            <QuizConfirmation />
          </ProtectedRoute>
        } />
        <Route path={RouteName.SOLO_QUIZ} element={
          <ProtectedRoute requiredRole="Employee">
            <SoloQuiz />
          </ProtectedRoute>
        } />
        <Route path={RouteName.QUIZ_RESULT} element={
          <ProtectedRoute requiredRole="Employee">
            <QuizResult />
          </ProtectedRoute>
        } />

        {/* Shared Routes - Available to all authenticated users */}
        <Route path={RouteName.CALENDAR_SCREEN} element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } />
        <Route path={RouteName.SETTING_SCREEN} element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
