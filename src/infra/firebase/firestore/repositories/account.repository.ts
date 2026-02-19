/**
 * @fileoverview Account Repository.
 *
 * This file contains all Firestore write operations related to the 'accounts'
 * collection and its associated data. It encapsulates the direct interactions
 * with the Firebase SDK for creating and managing accounts (both user and organization types), teams, and members.
 */

import {
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  deleteDoc,
  runTransaction,
  increment,
  collection,
  writeBatch,
  updateDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firestore.client'
import { updateDocument, addDocument, setDocument } from '../firestore.write.adapter'
import type {
  Account,
  MemberReference,
  Team,
  ThemeConfig,
  ScheduleItem,
  DailyLog,
  DailyLogComment,
} from '@/types/domain'

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

export const createScheduleItem = async (
  itemData: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const dataWithTimestamp = {
    ...itemData,
    assigneeIds: itemData.assigneeIds || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const docRef = await addDocument(
    `accounts/${itemData.accountId}/schedule_items`,
    dataWithTimestamp
  )
  return docRef.id
}

export const updateScheduleItemStatus = async (
  orgId: string,
  itemId: string,
  newStatus: 'OFFICIAL' | 'REJECTED'
): Promise<void> => {
  const itemRef = doc(db, `accounts/${orgId}/schedule_items`, itemId)
  return updateDoc(itemRef, { status: newStatus, updatedAt: serverTimestamp() })
}


export const assignMemberToScheduleItem = async (
  accountId: string,
  itemId: string,
  memberId: string
): Promise<void> => {
  return updateDocument(`accounts/${accountId}/schedule_items/${itemId}`, { assigneeIds: arrayUnion(memberId) })
}

export const unassignMemberFromScheduleItem = async (
  accountId: string,
  itemId: string,
  memberId: string
): Promise<void> => {
  return updateDocument(`accounts/${accountId}/schedule_items/${itemId}`, { assigneeIds: arrayRemove(memberId) })
}

export const toggleDailyLogLike = async (orgId: string, logId: string, userId: string): Promise<void> => {
  const logRef = doc(db, `accounts/${orgId}/dailyLogs`, logId)

  await runTransaction(db, async (transaction) => {
    const logDoc = await transaction.get(logRef)
    if (!logDoc.exists()) {
      throw "Document does not exist!"
    }

    const logData = logDoc.data() as DailyLog
    const likes = logData.likes || []
    let newLikes
    let newLikeCount

    if (likes.includes(userId)) {
      newLikes = arrayRemove(userId)
      newLikeCount = increment(-1)
    } else {
      newLikes = arrayUnion(userId)
      newLikeCount = increment(1)
    }

    transaction.update(logRef, {
      likes: newLikes,
      likeCount: newLikeCount,
    })
  })
}

export const addDailyLogComment = async (
    orgId: string, 
    logId: string, 
    author: { uid: string; name: string; avatarUrl?: string }, 
    content: string
): Promise<void> => {
    const logRef = doc(db, `accounts/${orgId}/dailyLogs`, logId)
    const commentRef = doc(collection(db, `accounts/${orgId}/dailyLogs/${logId}/comments`))

    const newComment: Omit<DailyLogComment, 'id' | 'createdAt'> & { createdAt: any } = {
        author,
        content,
        createdAt: serverTimestamp(),
    }

    const batch = writeBatch(db)
    batch.set(commentRef, newComment)
    batch.update(logRef, { commentCount: increment(1) })

    await batch.commit()
}

// =================================================================
// == User Profile Functions (merged from user.repository.ts)
// =================================================================

/**
 * Fetches a user's profile from Firestore.
 * @param userId The ID of the user whose profile is to be fetched.
 * @returns A promise that resolves to the Account object or null if not found.
 */
export const getUserProfile = async (
  userId: string
): Promise<Account | null> => {
  const docRef = doc(db, 'accounts', userId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Account
  } else {
    // Optionally create a default profile if it doesn't exist
    const defaultProfile: Omit<Account, 'id'> = {
      name: '',
      accountType: 'user',
      bio: '',
      photoURL: '',
      achievements: [],
      expertiseBadges: [],
    }
    await setDocument(`accounts/${userId}`, defaultProfile)
    return { id: userId, ...defaultProfile }
  }
}

/**
 * Updates a user's profile in Firestore.
 * @param userId The ID of the user whose profile is to be updated.
 * @param data A partial Account object with the fields to update.
 */
export const updateUserProfile = async (
  userId: string,
  data: Partial<Account>
): Promise<void> => {
  // We use set with merge:true to handle both creation and update gracefully.
  const docRef = doc(db, 'accounts', userId)
  return setDoc(docRef, data, { merge: true })
}


/**
 * Adds a log to a user's bookmarks.
 * @param userId The ID of the user.
 * @param logId The ID of the daily log to bookmark.
 */
export const addBookmark = async (userId: string, logId: string): Promise<void> => {
    // We create an empty document where the ID is the logId for easy lookup.
    const bookmarkRef = doc(db, `accounts/${userId}/bookmarks`, logId)
    await setDoc(bookmarkRef, {})
}


/**
 * Removes a log from a user's bookmarks.
 * @param userId The ID of the user.
 * @param logId The ID of the daily log to unbookmark.
 */
export const removeBookmark = async (userId: string, logId: string): Promise<void> => {
    const bookmarkRef = doc(db, `accounts/${userId}/bookmarks`, logId)
    await deleteDoc(bookmarkRef)
}
