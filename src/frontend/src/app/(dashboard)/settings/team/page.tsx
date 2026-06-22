"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/input";

type Role = "admin" | "editor" | "viewer";

interface ActiveMember {
  kind: "active";
  id: string;
  name: string;
  email: string;
  role: Role;
  joined: string;
  isYou?: boolean;
}

interface PendingMember {
  kind: "pending";
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
}

type TeamMember = ActiveMember | PendingMember;

const MOCK_MEMBERS: TeamMember[] = [
  {
    kind: "active",
    id: "1",
    name: "Nguyen Creator",
    email: "nhat@example.com",
    role: "admin",
    joined: "Jun 2026",
    isYou: true,
  },
  {
    kind: "active",
    id: "2",
    name: "Team Lead",
    email: "lead@example.com",
    role: "editor",
    joined: "Jun 2026",
  },
  {
    kind: "active",
    id: "3",
    name: "Intern",
    email: "intern@example.com",
    role: "viewer",
    joined: "Jun 2026",
  },
  {
    kind: "pending",
    id: "4",
    email: "newmember@example.com",
    role: "editor",
    invitedBy: "You",
  },
];

const ROLE_BADGE_VARIANT: Record<Role, "brand" | "info" | "default"> = {
  admin: "brand",
  editor: "info",
  viewer: "default",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface InviteForm {
  email: string;
  role: Role;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    email: "",
    role: "viewer",
  });
  const [removeTarget, setRemoveTarget] = useState<ActiveMember | null>(null);

  function handleSendInvite() {
    if (!inviteForm.email) return;
    const newPending: PendingMember = {
      kind: "pending",
      id: String(Date.now()),
      email: inviteForm.email,
      role: inviteForm.role,
      invitedBy: "You",
    };
    setMembers((prev) => [...prev, newPending]);
    setInviteForm({ email: "", role: "viewer" });
    setShowInviteModal(false);
  }

  function handleRemove() {
    if (!removeTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
    setRemoveTarget(null);
  }

  function handleRevoke(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="flex flex-col gap-4 max-w-[800px]">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage who has access to your workspace.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus className="w-4 h-4" />
          Invite member
        </Button>
      </div>

      {/* Members Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Member", "Role", "Status", "Joined", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 text-left"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                if (member.kind === "active") {
                  return (
                    <tr
                      key={member.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Member cell */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold shrink-0">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-gray-900">
                                {member.name}
                              </span>
                              {member.isYou && (
                                <Badge variant="brand">You</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-4 py-3">
                        <Badge variant={ROLE_BADGE_VARIANT[member.role]}>
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </Badge>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge variant="success">Active</Badge>
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-3 text-[13px] text-gray-500">
                        {member.joined}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        {!member.isYou && (
                          <div className="flex items-center gap-3">
                            <button className="text-sm text-brand-600 hover:underline cursor-pointer">
                              Change role
                            </button>
                            <button
                              className="text-sm text-red-600 hover:underline cursor-pointer"
                              onClick={() => setRemoveTarget(member)}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }

                // Pending row
                return (
                  <tr
                    key={member.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors opacity-80"
                  >
                    {/* Member cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 text-xs font-semibold shrink-0">
                          ?
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Invited by {member.invitedBy}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_BADGE_VARIANT[member.role]}>
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </Badge>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant="pending">Pending</Badge>
                    </td>
                    {/* Joined */}
                    <td className="px-4 py-3 text-[13px] text-gray-500">—</td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button className="text-sm text-brand-600 hover:underline cursor-pointer">
                          Resend
                        </button>
                        <button
                          className="text-sm text-red-600 hover:underline cursor-pointer"
                          onClick={() => handleRevoke(member.id)}
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite a team member"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowInviteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendInvite}
              disabled={!inviteForm.email}
            >
              Send invite
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@example.com"
            value={inviteForm.email}
            onChange={(e) =>
              setInviteForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <Select
            label="Role"
            value={inviteForm.role}
            onChange={(e) =>
              setInviteForm((prev) => ({
                ...prev,
                role: e.target.value as Role,
              }))
            }
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </Select>
          <p className="text-xs text-gray-400">
            They&apos;ll receive an email invite to join your workspace.
          </p>
        </div>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title={`Remove ${removeTarget?.name ?? ""}?`}
        maxWidth="max-w-[440px]"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRemove}>
              Remove member
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          {removeTarget?.name} will lose access to this workspace immediately.
          You can invite them again at any time.
        </p>
      </Modal>
    </div>
  );
}
