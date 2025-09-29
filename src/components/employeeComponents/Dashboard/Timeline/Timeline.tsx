import React, { useEffect, useState } from "react";
import { Get, Put, Delete } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import {
  BsCheckCircle,
  BsXCircle,
  BsPeople,
  BsClock,
  BsPersonFill,
  BsTrash
} from "react-icons/bs";

interface TimelineProps {
  onRequestAccepted?: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ onRequestAccepted }) => {
  const [requests, setRequests] = useState<any[]>([])
  const [myTeachers, setmyTeachers] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  const getrequest = () => {
    setLoadingRequests(true)
    Get("/employee/myrequests").then((d) => {
      if (d.data?.length > 0) {
        setRequests(d.data)
      } else {
        setRequests([])
      }
    }).catch((error) => {
      console.error("Timeline: Request error:", error);
      displayMessage("Failed to load requests", "error");
    }).finally(() => {
      setLoadingRequests(false)
    })
  }

  const getTeachers = () => {
    Get("/employee/myteachers").then((d) => {
      if (d.data?.length > 0) {
        setmyTeachers(d.data)
      }
    })
  }

  useEffect(() => {
    getTeachers()
    getrequest()
  }, [])

  const updateRequest = (id: any, status: any) => {
    setProcessingRequest(id)
    Put(`/employee/request/${id}`, { status }).then((d) => {
      if (d.success) {
        displayMessage(d.message, "success")
        // If the request was accepted (status = "Complete"), trigger the callback to refresh My Team
        if (status === "Complete" && onRequestAccepted) {
          onRequestAccepted()
        }
      } else {
        displayMessage(d.message, "error")
      }
      getrequest()
    }).catch((error) => {
      displayMessage("Failed to update request", "error");
    }).finally(() => {
      setProcessingRequest(null)
    })
  }

  const deleteRequest = (id: any) => {
    setProcessingRequest(id)
    Delete(`/employee/request/${id}`).then((d) => {
      if (d.success) {
        displayMessage("Request deleted successfully", "success")
      } else {
        displayMessage(d.message || "Failed to delete request", "error")
      }
      getrequest()
    }).catch((error) => {
      displayMessage("Failed to delete request", "error");
    }).finally(() => {
      setProcessingRequest(null)
    })
  }

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto">
      {/* Team Requests Section */}
      <div className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <BsPeople className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Team Requests</span>
          </div>
          {requests.filter(req => req.status !== "Complete").length > 0 && (
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {requests.filter(req => req.status === "Pending").length} pending
            </div>
          )}
        </div>
        {/* Request Cards */}
        {loadingRequests ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 text-sm">Loading requests...</span>
            </div>
          </div>
        ) : requests.filter(req => req.status !== "Complete").length === 0 ? (
          <div className="text-center py-4">
            <BsPeople className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.filter(req => req.status !== "Complete").map((item) => (
              <div key={item._id} className={`rounded-lg border p-3 transition-all duration-200 ${item.status === "Pending"
                ? "bg-gray-50 border-gray-200 hover:shadow-sm"
                : item.status === "Rejected"
                  ? "bg-white border-slate-200 ring-1 ring-slate-200/60 shadow-sm hover:shadow-md"
                  : "bg-green-50 border-green-200 hover:shadow-sm"
                }`}>
                {/* Top Section with Avatar, Request Details, and Status Tag */}
                <div className="flex items-start space-x-3">
                  {/* HR Admin Avatar */}
                  <div className="flex-shrink-0">
                    {item?.hrAdmin?.auth?.image ? (
                      <img
                        src={item.hrAdmin.auth.image}
                        alt={item?.hrAdmin?.auth?.userName || 'HR Admin'}
                        className={`w-8 h-8 rounded-full object-cover border ${item.status === "Rejected"
                          ? "border-slate-300"
                          : "border-blue-200"
                          }`}
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${item.status === "Rejected"
                        ? "bg-slate-100 border-slate-300 text-slate-600"
                        : "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-200 text-white"
                        }`}>
                        <span className="font-semibold text-xs">
                          {item?.hrAdmin?.auth?.userName?.charAt(0).toUpperCase() || 'H'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Request Details */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.status === "Rejected"
                      ? "text-slate-700"
                      : "text-gray-900"
                      }`}>
                      <span className={`font-semibold ${item.status === "Rejected"
                        ? "text-slate-600"
                        : "text-blue-600"
                        }`}>{item?.hrAdmin?.auth?.userName}</span>
                      {item.status === "Rejected"
                        ? " request was declined"
                        : " invited you"
                      }
                    </p>
                  </div>

                  {/* Status Tag - Top Right */}
                  <div className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full border ${item.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : item.status === "Rejected"
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-green-100 text-green-800 border-green-200"
                    }`}>
                    <div className="flex items-center space-x-1">
                      {item.status === "Pending" && <BsClock className="w-3 h-3" />}
                      {item.status === "Rejected" && <BsXCircle className="w-3 h-3" />}
                      {item.status === "Complete" && <BsCheckCircle className="w-3 h-3" />}
                      <span className="capitalize">
                        {item.status === "Pending" && "Pending"}
                        {item.status === "Rejected" && "Declined"}
                        {item.status === "Complete" && "Accepted"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section with Action Buttons */}
                <div className={`flex items-center justify-end space-x-2 mt-3 pt-2 border-t ${item.status === "Rejected"
                  ? "border-slate-200"
                  : "border-gray-200"
                  }`}>
                  {item.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => updateRequest(item._id, "Rejected")}
                        disabled={processingRequest === item._id}
                        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <BsXCircle className="w-3 h-3" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => updateRequest(item._id, "Complete")}
                        disabled={processingRequest === item._id}
                        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingRequest === item._id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <BsCheckCircle className="w-3 h-3" />
                        )}
                        <span>Accept</span>
                      </button>
                    </>
                  ) : item.status === "Rejected" ? (
                    <>
                      <button
                        onClick={() => deleteRequest(item._id)}
                        disabled={processingRequest === item._id}
                        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingRequest === item._id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                        ) : (
                          <BsTrash className="w-3 h-3" />
                        )}
                        <span>Remove</span>
                      </button>
                      <button
                        onClick={() => updateRequest(item._id, "Complete")}
                        disabled={processingRequest === item._id}
                        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingRequest === item._id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <BsCheckCircle className="w-3 h-3" />
                        )}
                        <span>Accept</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-green-700 font-medium">Accepted ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
