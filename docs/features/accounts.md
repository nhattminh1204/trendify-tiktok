# Feature: Accounts Module

## Purpose

Manages user identity, workspace configuration, connected social media accounts, and account grouping.
This is the foundational module — all other modules depend on the identity and social account data it provides.

---

## Entities

### Workspace (= Tenant)
The top-level container. One workspace per creator (Phase 1). One workspace per agency (Phase 2).

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(255) | Workspace display name |
| slug | VARCHAR(100) | Unique URL slug |
| plan | VARCHAR(50) | 'free', 'pro', 'agency' |

### User
A person with access to a workspace.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | FK → workspaces |
| email | VARCHAR(255) | Unique, login identifier |
| password_hash | VARCHAR(255) | bcrypt |
| display_name | VARCHAR(255) | |
| role | VARCHAR(50) | 'owner' in Phase 1 |

### SocialAccount
A TikTok (or other platform) account connected to a workspace.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | FK → workspaces |
| platform | VARCHAR(50) | 'tiktok' |
| platform_user_id | VARCHAR(255) | TikTok's internal user ID |
| username | VARCHAR(255) | @handle |
| access_token | TEXT | AES-256-GCM encrypted |
| refresh_token | TEXT | AES-256-GCM encrypted |
| token_expires_at | TIMESTAMPTZ | |
| follower_count | BIGINT | Cached from last sync |
| last_synced_at | TIMESTAMPTZ | |

### AccountGroup
Named grouping of social accounts (e.g., "English Accounts", "Fitness Niche").

---

## Business Rules

1. A workspace must have exactly one owner
2. A social account belongs to exactly one workspace
3. A social account can belong to multiple groups
4. Disconnecting a social account does NOT delete historical data (analytics, posts) — sets `is_active = false`
5. Token refresh is automatic — if refresh fails, account status becomes `token_expired`
6. Account sync (follower count, profile data) runs every 6 hours via `AccountSyncJob`

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `AccountCreatedEvent` | New workspace created | AI Engine (init prompts), Audience (init profile) |
| `SocialAccountConnectedEvent` | TikTok account linked | Analytics (begin tracking), Audience (begin analysis) |
| `SocialAccountDisconnectedEvent` | Account unlinked | Analytics (stop sync) |
| `TokenExpiredEvent` | OAuth token cannot be refreshed | — (notification to user) |

---

## API Endpoints

See `docs/api-map.md#module-accounts` for full endpoint list.

Key endpoints:
- `POST /accounts/social` — Connect TikTok via OAuth
- `POST /accounts/social/{id}/sync` — Manual profile sync
- `GET /accounts/social` — List all connected accounts

---

## Acceptance Criteria

### AC-1: Connect TikTok Account
- [ ] User clicks "Connect TikTok" → redirected to TikTok OAuth
- [ ] After OAuth, account appears in account list within 5 seconds
- [ ] Profile image, username, follower count displayed correctly
- [ ] Connecting the same account twice returns a meaningful error (not a 500)

### AC-2: Account Groups
- [ ] User can create a group with a name
- [ ] User can add/remove accounts from a group
- [ ] Deleting a group does not delete the accounts in it
- [ ] Empty groups are allowed

### AC-3: Token Expiry
- [ ] Expired tokens are refreshed automatically before each API call
- [ ] If refresh fails 3 times, account status becomes `token_expired`
- [ ] User sees a clear warning on the dashboard for expired accounts

---

## Implementation Notes

- TikTok OAuth uses Authorization Code Flow
- `access_token` and `refresh_token` are encrypted using `ITokenEncryptionService`
- The `ICurrentUser` interface is the only way modules access user/tenant identity
- No `tenant_id` is ever accepted from the HTTP request body — always from JWT claims
