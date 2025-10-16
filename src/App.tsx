import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { RouteName } from "./routes/RouteNames";
import { ProtectedRoute } from "./components";

// Lazy load all screens to reduce initial bundle size
const Register = lazy(() => import("./screens/auth/register/register"));
const Dashboard = lazy(() => import("./screens/supervisorScreens/Dashboard/Dashboard"));
const MyChildren = lazy(() => import("./screens/supervisorScreens/MyChildren/MyChildren"));
const Calendar = lazy(() => import("./screens/supervisorScreens/Calendar/Calendar"));
const Settings = lazy(() => import("./screens/supervisorScreens/Settings/Settings"));
const DashboardTeacher = lazy(() => import("./screens/hrAdminScreens/Dashboard").then(module => ({ default: module.DashboardTeacher })));
const Employees = lazy(() => import("./screens/hrAdminScreens/Employees").then(module => ({ default: module.Students })));
const Supervisors = lazy(() => import("./screens/hrAdminScreens/Supervisors/Supervisors"));
const Instructors = lazy(() => import("./screens/hrAdminScreens/Instructors/Instructors"));
const Subscription = lazy(() => import("./screens/hrAdminScreens/Subscription/Subscription"));
const Rubrics = lazy(() => import("./screens/hrAdminScreens/Rubrics").then(module => ({ default: module.Rubrics })));
const Assignments = lazy(() => import("./screens/hrAdminScreens/Assignments").then(module => ({ default: module.Assignments })));
const EmployeeAssignments = lazy(() => import("./screens/employeeScreens/Assignments").then(module => ({ default: module.Assignments })));
const EmployeeDetails = lazy(() => import("./screens/hrAdminScreens/EmployeeDetails").then(module => ({ default: module.EmployeeDetails })));
const MyQuizzes = lazy(() => import("./screens/hrAdminScreens/MyQuizzes").then(module => ({ default: module.MyQuizzes })));
const AddQuiz = lazy(() => import("./screens/hrAdminScreens/AddQuiz").then(module => ({ default: module.AddQuiz })));
const UpdateQuiz = lazy(() => import("./screens/hrAdminScreens/UpdateQuiz").then(module => ({ default: module.UpdateQuiz })));
const SubjectTopicManagement = lazy(() => import("./screens/hrAdminScreens/SubjectTopicManagement").then(module => ({ default: module.SubjectTopicManagement })));
const StudentDashboard = lazy(() => import("./screens/employeeScreens/Dashboard").then(module => ({ default: module.StudentDashboard })));
const StudentSubjects = lazy(() => import("./screens/employeeScreens/Subjects").then(module => ({ default: module.StudentSubjects })));
const StudentTopics = lazy(() => import("./screens/employeeScreens/Topics").then(module => ({ default: module.StudentTopics })));
const Lessons = lazy(() => import("./screens/employeeScreens/Lessons").then(module => ({ default: module.Lessons })));
const Material = lazy(() => import("./screens/employeeScreens/Material").then(module => ({ default: module.Material })));
const QuizzesDetails = lazy(() => import("./screens/employeeScreens/QuizzesDetails").then(module => ({ default: module.QuizzesDetails })));
const QuizConfirmation = lazy(() => import("./screens/employeeScreens/QuizConfirmation").then(module => ({ default: module.QuizConfirmation })));
const SoloQuiz = lazy(() => import("./screens/employeeScreens/SoloQuiz").then(module => ({ default: module.SoloQuiz })));
const QuizResult = lazy(() => import("./screens/employeeScreens/QuizResult").then(module => ({ default: module.QuizResult })));
const EmployeeResultScreen = lazy(() => import("./screens/employeeScreens/Result").then(module => ({ default: module.StudentResult })));
const Discussion = lazy(() => import("./screens/Discussion/Discussion"));
const DiscussionSubjects = lazy(() => import("./screens/Discussion/DiscussionSubjects"));
const DiscussionTopics = lazy(() => import("./screens/Discussion/DiscussionTopics"));
const DiscussionLessons = lazy(() => import("./screens/Discussion/DiscussionLessons"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

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
      <Suspense fallback={<LoadingSpinner />}>
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
          <Route path={RouteName.SUPERVISORS_SCREEN} element={
            <ProtectedRoute requiredRole="HR-Admin">
              <Supervisors />
            </ProtectedRoute>
          } />
          <Route path={RouteName.INSTRUCTORS_SCREEN} element={
            <ProtectedRoute requiredRole="HR-Admin">
              <Instructors />
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
          <Route path={RouteName.RUBRICS_SCREEN} element={
            <ProtectedRoute requiredRole="HR-Admin">
              <Rubrics />
            </ProtectedRoute>
          } />
          <Route path={RouteName.ASSIGNMENTS_SCREEN} element={
            <ProtectedRoute requiredRole="HR-Admin">
              <Assignments />
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
          <Route path={RouteName.ASSIGNMENTS_SCREEN_EMPLOYEE} element={
            <ProtectedRoute requiredRole="Employee">
              <EmployeeAssignments />
            </ProtectedRoute>
          } />

          {/* Shared Routes - Available to all authenticated users */}
          <Route path={RouteName.CALENDAR_SCREEN} element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } />
          <Route path={RouteName.DISCUSSION} element={
            <ProtectedRoute>
              <DiscussionSubjects />
            </ProtectedRoute>
          } />
          <Route path={RouteName.DISCUSSION_SUBJECT} element={
            <ProtectedRoute>
              <DiscussionTopics />
            </ProtectedRoute>
          } />
          <Route path={RouteName.DISCUSSION_TOPIC} element={
            <ProtectedRoute>
              <DiscussionLessons />
            </ProtectedRoute>
          } />
          <Route path={RouteName.DISCUSSION_LESSON} element={
            <ProtectedRoute>
              <Discussion />
            </ProtectedRoute>
          } />
          <Route path={RouteName.SETTING_SCREEN} element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
