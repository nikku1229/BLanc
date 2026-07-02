import React from "react";
import { useNavigate } from "react-router-dom";
import type { Group } from "../types";

interface GroupCardProps {
  group: Group;
  onDelete: (id: string) => void;
  onEdit: (group: Group) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/group/${group.id}`);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      personal: "bg-blue-100 text-blue-800",
      family: "bg-green-100 text-green-800",
      friends: "bg-purple-100 text-purple-800",
      custom: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || colors.custom;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="p-6 cursor-pointer" onClick={handleClick}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {group.name}
            </h3>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getTypeColor(group.type)}`}
            >
              {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">
              ₹{group.balance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Available Balance</p>
          </div>
        </div>

        {group.description && (
          <p className="mt-2 text-gray-600 text-sm">{group.description}</p>
        )}

        <div className="mt-4 flex items-center text-sm text-gray-500">
          <span>{group.members.length} members</span>
        </div>
      </div>

      <div className="border-t border-gray-100 px-6 py-3 flex justify-end space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(group);
          }}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Are you sure you want to delete this group?")) {
              onDelete(group.id);
            }
          }}
          className="text-red-600 hover:text-red-900 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default GroupCard;
