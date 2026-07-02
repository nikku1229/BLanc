import React from "react";
import { useNavigate } from "react-router-dom";
import type { Group } from "../../types";

interface GroupCardProps {
  group: Group;
  onDelete: (id: string) => void;
  onEdit: (group: Group) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (group.id) {
      navigate(`/group/${group.id}`);
    } else {
      console.error("Group ID is undefined", group);
      alert("Error: Group ID not found");
    }
  };

  const getTypeLabel = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="group-card" onClick={handleClick}>
      <div className="group-name">{group.name || "Unnamed Group"}</div>
      <span className="group-type">{getTypeLabel(group.type || "custom")}</span>
      {group.description && (
        <div className="group-description">{group.description}</div>
      )}
      <div className="group-balance">₹{(group.balance || 0).toFixed(2)}</div>

      <div className="group-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(group)}
        >
          Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this group?")) {
              onDelete(group.id);
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default GroupCard;
