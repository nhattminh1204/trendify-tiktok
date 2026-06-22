"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

interface TikTokAccount {
  id: string;
  handle: string;
  initials: string;
  followers: string;
  active: boolean;
}

const MOCK_ACCOUNTS: TikTokAccount[] = [
  {
    id: "1",
    handle: "@nk_creator",
    initials: "NC",
    followers: "124.5K followers",
    active: true,
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<TikTokAccount[]>(MOCK_ACCOUNTS);
  const [disconnectTarget, setDisconnectTarget] =
    useState<TikTokAccount | null>(null);

  function handleDisconnect() {
    if (!disconnectTarget) return;
    setAccounts((prev) => prev.filter((a) => a.id !== disconnectTarget.id));
    setDisconnectTarget(null);
  }

  return (
    <div className="flex flex-col gap-4 max-w-[640px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Connected Accounts
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the social accounts linked to your workspace.
        </p>
      </div>

      {/* TikTok Accounts Card */}
      <Card padding="lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[20px] font-bold leading-none">♪</span>
          <span className="text-base font-semibold text-gray-900">TikTok</span>
          {accounts.length > 0 && (
            <Badge variant="brand">{accounts.length} connected</Badge>
          )}
        </div>

        {/* Connected account rows */}
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center gap-3 py-3 border-b border-gray-100"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold shrink-0">
              {account.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {account.handle}
              </p>
              <p className="text-xs text-gray-500">{account.followers}</p>
            </div>
            <Badge variant="success">Active</Badge>
            <button
              className="text-xs text-red-600 hover:bg-red-50 h-8 px-3 rounded-lg ml-2 transition-colors"
              onClick={() => setDisconnectTarget(account)}
            >
              Disconnect
            </button>
          </div>
        ))}

        {/* Add account row */}
        <div className="flex items-center gap-3 pt-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 shrink-0">
            <Plus className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 flex-1">
            Add another account
          </span>
          <Button variant="primary" size="sm">
            Connect
          </Button>
        </div>
      </Card>

      {/* Coming Soon Card */}
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-500 mb-3">
          More platforms coming soon
        </p>
        <div className="flex gap-2 opacity-50">
          {["YouTube", "Instagram", "X"].map((platform) => (
            <span
              key={platform}
              className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-600"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <Modal
        open={!!disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        title={`Disconnect ${disconnectTarget?.handle ?? ""}?`}
        maxWidth="max-w-[440px]"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDisconnectTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          This account will be removed from your workspace. You can reconnect it
          at any time.
        </p>
      </Modal>
    </div>
  );
}
