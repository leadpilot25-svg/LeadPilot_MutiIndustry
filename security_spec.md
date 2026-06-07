# Security Specification for LeadPilot Secure Relational CRM

## 1. Data Invariants

1.  **Strict Isolation**: A user belonging to `Workspace A` can never write, read, or list records belonging to `Workspace B`.
2.  **Role Hierarchy**:
    - **Owner**: Can perform full CRUD on workspace data, manage agents, assign leads, and adjust configurations.
    - **Agent**: Can read and write *only* leads assigned specifically to them (`assignedTo == request.auth.uid`). They can add notes and complete followups on these leads. They cannot view or touch unassigned or other agents' leads.
3.  **Immutable Identity**: Users cannot modify their own profiles to change their `role` or `workspaceId` (preventing privilege escalation).
4.  **Temporal Authenticity**: All timestamp edits must be verified against server-backed `request.time`.

---

## 2. The "Dirty Dozen" (Target Attack Payloads)

Here are 12 specific payloads representing critical security attacks that must be blocked:

1.  **Identity Spoofing**: Creating a lead doc on `Workspace A` but passing `assignedTo = "User B"`.
2.  **Cross-Tenant Injection**: An authenticated user of `Workspace A` attempting to query or get `/workspaces/WorkspaceB/leads/lead-1`.
3.  **Privilege Escalation**: An active member of `Workspace A` writing to `/users/my-userId` to change `role` to `'owner'`.
4.  **Anarchy Invitation**: An agent trying to write to `/invitations/attacker@corp.com` to invite an accomplice.
5.  **Ghost Field Injection (Shadow Update)**: Attempting to update a lead with extra un-defined fields like `isVulnerableTestField: true`.
6.  **Admin Spoofing**: Attempting to bypass guards by spoofing custom auth claims.
7.  **Overdue Action Date Hijacking**: An agent attempting to modify the `createdAt` or `ownerUid` of their company's workspace document.
8.  **Denial of Wallet Long String Attack**: Injecting a 1MB string sequence inside the custom fields or descriptions.
9.  **Relational Verification Bypass**: Creating a lead that claims to be assigned to an agent who is completely outside the team.
10. **State Shortcutting**: Updating a won lead status to active when it should be locked.
11. **Bypassing Inward Registration Gate**: An anonymous viewer reading user registry lists.
12. **Self-Approval / Role Injection**: Onboarding a profile and setting `role = "owner"` manually when the user was invited as an `"agent"`.

---

## 3. The Test Cases Definition

We define test definitions to verify that all the above attacks return `PERMISSION_DENIED` under all circumstances. We enforce these criteria directly in our generated `firestore.rules`.
