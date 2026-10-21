import { useState, useCallback } from "react";
import {
  Navbar,
  SideDrawer,
  Notifications,
} from "../../../components";
import SupervisorMetricsCards from "../../../components/supervisorComponents/Dashboard/SupervisorMetricsCards/SupervisorMetricsCards";
import SupervisorWelcomeNotice from "../../../components/supervisorComponents/Dashboard/SupervisorWelcomeNotice/SupervisorWelcomeNotice";
import SupervisorTeamOverview from "../../../components/supervisorComponents/Dashboard/SupervisorTeamOverview/SupervisorTeamOverview";
import SupervisorRecentActivity from "../../../components/supervisorComponents/Dashboard/SupervisorRecentActivity/SupervisorRecentActivity";
import SupervisorQuickActions from "../../../components/supervisorComponents/Dashboard/SupervisorQuickActions/SupervisorQuickActions";

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex w-full">
        {/* Sidebar */}
        <div className="lg:w-1/6 hidden lg:block">
          <SideDrawer />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <Navbar title="Supervisor Dashboard" />
          </div>

          {/* Main Dashboard Content */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-6">
                <SupervisorWelcomeNotice />
              </div>

              {/* Metrics Cards */}
              <div className="mb-6">
                <SupervisorMetricsCards refreshTrigger={refreshTrigger} />
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Team Overview */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Team Overview</h2>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={triggerRefresh}
                            className="text-sm text-blue-600 hover:text-blue-700 underline"
                          >
                            Refresh
                          </button>
                          <span className="text-sm text-gray-500">Manage your team</span>
                        </div>
                      </div>
                      <SupervisorTeamOverview refreshTrigger={refreshTrigger} />
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                        <span className="text-sm text-gray-500">Stay updated</span>
                      </div>
                      <SupervisorRecentActivity />
                    </div>
                  </div>
                </div>

                {/* Right Column - Sidebar Content */}
                <div className="space-y-6">
                  {/* Notifications */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                      <Notifications maxNotifications={5} />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <SupervisorQuickActions />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
