"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

type PasswordStrength = 0 | 1 | 2 | 3 | 4;

function getStrength(password: string): PasswordStrength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score as PasswordStrength;
}

const strengthColors: Record<PasswordStrength, string> = {
  0: "bg-gray-100",
  1: "bg-red-400",
  2: "bg-amber-400",
  3: "bg-yellow-400",
  4: "bg-green-500",
};

export default function AccountPage() {
  const [displayName, setDisplayName] = useState("Nguyen Creator");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const strength = getStrength(newPassword);
  const WORKSPACE_NAME = "My Creator Brand";
  const canDelete = deleteConfirmName === WORKSPACE_NAME;

  return (
    <div className="flex flex-col gap-4 max-w-[640px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile and workspace settings.
        </p>
      </div>

      {/* Profile Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Profile</h2>

        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 text-brand-700 text-lg font-semibold shrink-0">
            NK
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              Change photo
            </Button>
            <button className="text-[12px] text-red-600 ml-2 hover:underline">
              Remove
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <Input
            label="Display name"
            defaultValue={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                defaultValue="user@example.com"
                disabled
                className="w-full h-9 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900 opacity-70 cursor-not-allowed"
              />
              <Badge variant="success" className="shrink-0">
                Verified
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <Button variant="primary">Save changes</Button>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          Change Password
        </h2>

        <div className="flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {/* Strength bar */}
          <div className="flex gap-1">
            {([1, 2, 3, 4] as const).map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-200",
                  strength >= level ? strengthColors[strength] : "bg-gray-100"
                )}
              />
            ))}
          </div>

          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-5">
          <Button variant="primary">Update password</Button>
        </div>
      </Card>

      {/* Danger Zone Card */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-[15px] font-semibold text-red-700">
            Danger Zone
          </span>
        </div>
        <hr className="border-red-200 my-3" />
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Delete workspace
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently delete your workspace and all data.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete workspace
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmName("");
        }}
        title="Delete workspace permanently?"
        maxWidth="max-w-[440px]"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmName("");
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" disabled={!canDelete}>
              Yes, delete permanently
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-4">
          This will permanently delete all your data. This cannot be undone.
        </p>
        <Input
          label="Type workspace name to confirm:"
          placeholder="My Creator Brand"
          value={deleteConfirmName}
          onChange={(e) => setDeleteConfirmName(e.target.value)}
        />
      </Modal>
    </div>
  );
}
