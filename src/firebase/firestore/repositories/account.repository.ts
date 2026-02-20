/**
 * @fileoverview Account Repository.
 *
 * Firestore write operations for the `accounts` collection — organization and
 * user account management, teams, and member roster operations.
 */

import {
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../firestore.client'
import { updateDocument, addDocument, setDocument } from '../firestore.write.adapter'
import type {
  Account,
  MemberReference,
  Team,
  ThemeConfig,
} from '@/domain-types/account'

/**
 * Creates a user account in the accounts collection.
 * @param userId The ID of the user (from Firebase Auth).
 * @param name The user's display name.
 * @param email The user's email address.
 */
export const createUserAccount = async (userId: string, name: string, email: string): Promise<void> => {
  const accountData: Omit<Account, 'id'> = {
    name,
    email,
    accountType: 'user',
  }
  await setDocument(`accounts/${userId}`, accountData)
}

/**
 * Creates an organization account in the accounts collection.
 * @param orgName The name of the organization.
 * @param owner The owner's account information.
 * @returns The ID of the newly created organization.
 */
export const createOrganization = async (orgName: string, owner: Account): Promise<string> => {
  const orgData: Omit<Account, 'id' | 'createdAt'> = {
    name: orgName,
    accountType: 'organization',
    description: 'A custom dimension for collaboration and resource management.',
    ownerId: owner.id,
    role: 'Owner',
    members: [{ id: owner.id, name: owner.name, email: owner.email || '', role: 'Owner', presence: 'active' }],
    memberIds: [owner.id],
    teams: [],
  }
  const docRef = await addDocument('accounts', { ...orgData, createdAt: serverTimestamp() })
  return docRef.id
}

export const recruitOrganizationMember = async (orgId: string, newId: string, name: string, email: string): Promise<void> => {
  const newMember: MemberReference = { id: newId, name: name, email: email, role: 'Member', presence: 'active' }
  const updates = { members: arrayUnion(newMember), memberIds: arrayUnion(newId) }
  return updateDocument(`accounts/${orgId}`, updates)
}

export const dismissOrganizationMember = async (orgId: string, member: MemberReference): Promise<void> => {
  const updates = { members: arrayRemove(member), memberIds: arrayRemove(member.id) }
  return updateDocument(`accounts/${orgId}`, updates)
}

export const createTeam = async (orgId: string, teamName: string, type: 'internal' | 'external'): Promise<void> => {
  const newTeam: Team = {
    id: `${type === 'internal' ? 't' : 'pt'}-${Math.random().toString(36).slice(-4)}`,
    name: teamName.trim(),
    description: type === 'internal' ? 'An internal team for business or technical purposes.' : 'An external team for cross-dimension collaboration.',
    type: type,
    memberIds: [],
  }
  const updates = { teams: arrayUnion(newTeam) }
  return updateDocument(`accounts/${orgId}`, updates)
}

export const updateTeamMembers = async (orgId: string, teamId: string, memberId: string, action: 'add' | 'remove'): Promise<void> => {
  const orgRef = doc(db, 'accounts', orgId)
  const orgSnap = await getDoc(orgRef)
  if (!orgSnap.exists()) throw new Error('Organization not found')

  const organization = orgSnap.data() as any
  const updatedTeams = (organization.teams || []).map((t: Team) => {
    if (t.id === teamId) {
      const currentMemberIds = t.memberIds || []
      const memberExists = currentMemberIds.includes(memberId)
      if (action === 'add' && !memberExists) {
        return { ...t, memberIds: [...currentMemberIds, memberId] }
      }
      if (action === 'remove' && memberExists) {
        return { ...t, memberIds: currentMemberIds.filter((id) => id !== memberId) }
      }
    }
    return t
  })
  return updateDocument(`accounts/${orgId}`, { teams: updatedTeams })
}

export const sendPartnerInvite = async (orgId: string, teamId: string, email: string): Promise<void> => {
  const inviteData = { email: email.trim(), teamId: teamId, role: 'Guest', inviteState: 'pending', invitedAt: serverTimestamp(), protocol: 'Deep Isolation' }
  await addDocument(`accounts/${orgId}/invites`, inviteData)
}

export const dismissPartnerMember = async (orgId: string, teamId: string, member: MemberReference): Promise<void> => {
  const orgRef = doc(db, 'accounts', orgId)
  const orgSnap = await getDoc(orgRef)
  if (!orgSnap.exists()) throw new Error('Organization not found')

  const organization = orgSnap.data() as any
  const updatedTeams = (organization.teams || []).map((t: Team) => t.id === teamId ? { ...t, memberIds: (t.memberIds || []).filter((mid) => mid !== member.id) } : t)
  const updatedMembers = (organization.members || []).filter((m: MemberReference) => m.id !== member.id)
  const updatedMemberIds = (organization.memberIds || []).filter((id: string) => id !== member.id)
  
  return updateDocument(`accounts/${orgId}`, { teams: updatedTeams, members: updatedMembers, memberIds: updatedMemberIds })
}

export const updateOrganizationSettings = async (orgId: string, settings: { name?: string; description?: string; theme?: ThemeConfig | null; }): Promise<void> => {
    return updateDocument(`accounts/${orgId}`, settings)
}

export const deleteOrganization = async (orgId: string): Promise<void> => {
    // In a real app, this should trigger a Cloud Function to delete all subcollections and associated data.
    return deleteDoc(doc(db, 'accounts', orgId))
}
