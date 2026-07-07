import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useGroupStore } from "../../store/groupStore";
import GroupCard from "../../components/groups/GroupCard";
import ErrorPage from "../common/ErrorPage";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// ==================== Types ====================

type GroupType = "personal" | "family" | "friends" | "custom";

// ==================== Dashboard Component ====================

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { groups, fetchGroups, loading, error, clearError } = useGroupStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Check authentication and fetch groups
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }
    fetchGroups();
  }, [isAuthenticated, user]);

  // ✅ Handle auth errors
  useEffect(() => {
    if (error?.includes("Session expired") || error?.includes("login")) {
      logout();
      navigate("/login", { replace: true });
    }
  }, [error, logout, navigate]);

  // ✅ Cleanup error on unmount
  useEffect(() => {
    return () => clearError();
  }, []);

  // ✅ Calculate totals
  const totalBalance = groups.reduce(
    (sum, group) => sum + (group.balance || 0),
    0,
  );
  const totalGroups = groups.length;

  // ✅ Handlers
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // ✅ Get and validate type
    const typeValue = formData.get("type") as string;
    const validTypes = ["personal", "family", "friends", "custom"] as const;
    const groupType = validTypes.includes(typeValue as any)
      ? (typeValue as GroupType)
      : "personal";

    // ✅ Build data
    const data = {
      name: (formData.get("name") as string)?.trim() || "",
      type: groupType,
      description: (formData.get("description") as string)?.trim() || "",
      email: (formData.get("email") as string)?.trim() || "",
      phoneNumber: (formData.get("phoneNumber") as string)?.trim() || "",
    };

    // ✅ Validate name
    if (!data.name || data.name.length < 2) {
      alert("Please enter a valid group name (minimum 2 characters)");
      setIsSubmitting(false);
      return;
    }

    try {
      await useGroupStore.getState().createGroup(data);
      setShowCreateModal(false);
      fetchGroups();
      form.reset();
    } catch (error: any) {
      console.error("❌ Create group error:", error);
      alert(error.message || "Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Show loading
  if (loading) {
    return <LoadingSpinner message="Loading your groups..." />;
  }

  // ✅ Show error (not auth errors as they redirect)
  if (error && !error.includes("Session expired") && !error.includes("login")) {
    return <ErrorPage statusCode={500} message={error} />;
  }

  return (
    <div className="dashboard container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="user-info">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here's your financial overview</p>
        </div>
        <div className="header-btns">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Group
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value positive">₹{totalBalance.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Groups</div>
          <div className="stat-value">{totalGroups}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Income</div>
          <div className="stat-value positive">₹0.00</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Expenses</div>
          <div className="stat-value negative">₹0.00</div>
        </div>
      </div>

      {/* Groups Section */}
      <div className="dashboard-content">
        <div className="card">
          <h3>Your Groups</h3>
          {groups.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any groups yet.</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Group
              </button>
            </div>
          ) : (
            <div className="group-list-container">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onDelete={async (id) => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this group?",
                      )
                    ) {
                      await useGroupStore.getState().deleteGroup(id);
                      fetchGroups();
                    }
                  }}
                  onEdit={() => {
                    alert("Edit functionality coming soon!");
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              {/* Group Name */}
              <div className="form-group">
                <label>
                  Group Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter group name"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>

              {/* Group Type */}
              <div className="form-group">
                <label>
                  Group Type <span className="required">*</span>
                </label>
                <select name="type" defaultValue="personal">
                  <option value="personal">Personal</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Brief description"
                  maxLength={200}
                />
              </div>

              {/* Email & Phone */}
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="Group email" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="form-btns">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
