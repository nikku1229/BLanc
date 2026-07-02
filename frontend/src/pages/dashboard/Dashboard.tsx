import React, { useEffect, useState, Activity } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useGroupStore } from "../../store/groupStore";
import GroupCard from "../../components/groups/GroupCard";
import ErrorPage from "../common/ErrorPage";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { groups, fetchGroups, loading, error } = useGroupStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchGroups();
  }, [user]);

  const totalBalance = groups.reduce(
    (sum, group) => sum + (group.balance || 0),
    0,
  );
  const totalGroups = groups.length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const typeValue = formData.get("type") as string;
    const validTypes = ["personal", "family", "friends", "custom"] as const;
    const groupType = validTypes.includes(typeValue as any)
      ? (typeValue as "personal" | "family" | "friends" | "custom")
      : "personal";

    const data = {
      name: formData.get("name") as string,
      type: groupType,
      description: (formData.get("description") as string) || "",
      email: (formData.get("email") as string) || "",
      phoneNumber: (formData.get("phoneNumber") as string) || "",
    };

    if (!data.name || data.name.trim().length < 2) {
      alert("Please enter a valid group name (minimum 2 characters)");
      return;
    }

    try {
      await useGroupStore.getState().createGroup(data);
      setShowCreateModal(false);
      fetchGroups();
      form.reset();
    } catch (error: any) {
      console.error("Create group error:", error);
      alert(error.message || "Failed to create group. Please try again.");
    }
  };

  if (error) {
    // logout();
    return <ErrorPage statusCode={401} message={error} />;
  }

  return (
    <div className="dashboard container">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's your financial overview</p>
        </div>
        <div className="header-btns">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Group
          </button>
          <button className="btn btn-primary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value positive">
            {loading ? "..." : `₹${totalBalance.toFixed(2)}`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Groups</div>
          <div className="stat-value">{loading ? "..." : totalGroups}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Income</div>
          <div className="stat-value positive">{loading ? "..." : "₹0.00"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Expenses</div>
          <div className="stat-value negative">{loading ? "..." : "₹0.00"}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h3>Your Groups</h3>
          {!loading ? (
            <>
              {groups.length === 0 ? (
                <div className="loading">
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
            </>
          ) : (
            <>
              <div className="loading">
                <div className="spinner" />
                <p>Loading your groups...</p>
              </div>
            </>
          )}
        </div>
      </div>

      <Activity mode={showCreateModal ? "visible" : "hidden"}>
        <div
          className="modal-container"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="group-form" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Group</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Group Name <span className="label-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Group Type <span className="label-required">*</span>
                </label>
                <select name="type" defaultValue="personal">
                  <option value="personal">Personal</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Brief description"
                />
              </div>

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

              <div className="form-btns">
                <button
                  type="button"
                  className="btn btn-custom"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      </Activity>
    </div>
  );
};

export default Dashboard;
