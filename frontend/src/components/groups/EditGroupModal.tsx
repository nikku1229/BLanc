import React, { useState, useEffect } from "react";
import { useGroupStore } from "../../store/groupStore";
import type { Group, GroupType } from "../../types";

interface EditGroupModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  group,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updateGroup } = useGroupStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "personal" as GroupType,
    description: "",
    email: "",
    phoneNumber: "",
  });

  // ✅ Populate form when group changes
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || "",
        type: group.type || "personal",
        description: group.description || "",
        email: group.email || "",
        phoneNumber: group.phoneNumber || "",
      });
    }
  }, [group]);

  // ✅ Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ✅ Validate name
    if (!formData.name || formData.name.trim().length < 2) {
      setError("Group name must be at least 2 characters");
      setLoading(false);
      return;
    }

    try {
      await updateGroup(group.id, {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description?.trim(),
        email: formData.email?.trim(),
        phoneNumber: formData.phoneNumber?.trim(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-container" onClick={onClose}>
      <div className="group-form" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2>Edit Group</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Group Name */}
          <div className="form-group">
            <label>
              Group Name <span className="label-required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter group name"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          {/* Group Type */}
          <div className="form-group">
            <label>
              Group Type <span className="label-required">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
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
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description"
              maxLength={200}
            />
          </div>

          {/* Email & Phone */}
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Group email"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
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
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;
