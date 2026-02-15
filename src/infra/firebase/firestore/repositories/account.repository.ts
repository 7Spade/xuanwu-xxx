/**
 * @fileoverview Account Repository.
 *
 * This file contains all Firestore write operations related to the 'organizations'
 * collection and its associated data, which represents a type of account. It encapsulates the direct interactions
 * with the Firebase SDK for creating and managing organizations, teams, and members.
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
} from 'firebase/firestore';
import { db } from '../firestore.client';
import { updateDocument, addDocument } from '../firestore.write.adapter';
import type {
  User,
  Organization,
  MemberReference,
  Team,
  ThemeConfig,
  ScheduleItem,
  DailyLog,
  DailyLogComment,
} from '@/types/domain';

export const createOrganization = async (orgName: string, owner: User): Promise<string> => {
  const orgData: Omit<Organization, 'id' | 'createdAt'> = {
    name: orgName,
    description: 'A custom dimension for collaboration and resource management.',
    ownerId: owner.id,
    role: 'Owner',
    members: [{ id: owner.id, name: owner.name, email: owner.email, role: 'Owner', presence: 'active' }],
    memberIds: [owner.id],
    teams: [],
  };
  const docRef = await addDocument('organizations', { ...orgData, createdAt: serverTimestamp() });
  return docRef.id;
};

export const recruitOrganizationMember = async (orgId: string, newId: string, name: string, email: string): Promise<void> => {
  const newMember: MemberReference = { id: newId, name: name, email: email, role: 'Member', presence: 'active' };
  const updates = { members: arrayUnion(newMember), memberIds: arrayUnion(newId) };
  return updateDocument(`organizations/${orgId}`, updates);
};

export const dismissOrganizationMember = async (orgId: string, member: MemberReference): Promise<void> => {
  const updates = { members: arrayRemove(member), memberIds: arrayRemove(member.id) };
  return updateDocument(`organizations/${orgId}`, updates);
};

export const createTeam = async (orgId: string, teamName: string, type: 'internal' | 'external'): Promise<void> => {
  const newTeam: Team = {
    id: `${type === 'internal' ? 't' : 'pt'}-${Math.random().toString(36).slice(-4)}`,
    name: teamName.trim(),
    description: type === 'internal' ? 'An internal team for business or technical purposes.' : 'An external team for cross-dimension collaboration.',
    type: type,
    memberIds: [],
  };
  const updates = { teams: arrayUnion(newTeam) };
  return updateDocument(`organizations/${orgId}`, updates);
};

export const updateTeamMembers = async (orgId: string, teamId: string, memberId: string, action: 'add' | 'remove'): Promise<void> => {
  const orgRef = doc(db, 'organizations', orgId);
  const orgSnap = await getDoc(orgRef);
  if (!orgSnap.exists()) throw new Error('Organization not found');

  const organization = orgSnap.data() as any;
  const updatedTeams = (organization.teams || []).map((t: Team) => {
    if (t.id === teamId) {
      const currentMemberIds = t.memberIds || [];
      const memberExists = currentMemberIds.includes(memberId);
      if (action === 'add' && !memberExists) {
        return { ...t, memberIds: [...currentMemberIds, memberId] };
      }
      if (action === 'remove' && memberExists) {
        return { ...t, memberIds: currentMemberIds.filter((id) => id !== memberId) };
      }
    }
    return t;
  });
  return updateDocument(`organizations/${orgId}`, { teams: updatedTeams });
};

export const sendPartnerInvite = async (orgId: string, teamId: string, email: string): Promise<void> => {
  const inviteData = { email: email.trim(), teamId: teamId, role: 'Guest', inviteState: 'pending', invitedAt: serverTimestamp(), protocol: 'Deep Isolation' };
  await addDocument(`organizations/${orgId}/invites`, inviteData);
};

export const dismissPartnerMember = async (orgId: string, teamId: string, member: MemberReference): Promise<void> => {
  const orgRef = doc(db, 'organizations', orgId);
  const orgSnap = await getDoc(orgRef);
  if (!orgSnap.exists()) throw new Error('Organization not found');

  const organization = orgSnap.data() as any;
  const updatedTeams = (organization.teams || []).map((t: Team) => t.id === teamId ? { ...t, memberIds: (t.memberIds || []).filter((mid) => mid !== member.id) } : t);
  const updatedMembers = (organization.members || []).filter((m: MemberReference) => m.id !== member.id);
  const updatedMemberIds = (organization.memberIds || []).filter((id: string) => id !== member.id);
  
  return updateDocument(`organizations/${orgId}`, { teams: updatedTeams, members: updatedMembers, memberIds: updatedMemberIds });
};

export const updateOrganizationSettings = async (orgId: string, settings: { name?: string; description?: string; theme?: ThemeConfig | null; }): Promise<void> => {
    return updateDocument(`organizations/${orgId}`, settings);
};

export const deleteOrganization = async (orgId: string): Promise<void> => {
    // In a real app, this should trigger a Cloud Function to delete all subcollections and associated data.
    return deleteDoc(doc(db, 'organizations', orgId));
};

export const createScheduleItem = async (
  itemData: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const wsDoc = await getDoc(doc(db, 'workspaces', itemData.workspaceId));
  const wsName = wsDoc.exists() ? wsDoc.data().name : 'Unknown';

  const dataWithTimestamp = {
    ...itemData,
    assigneeIds: itemData.assigneeIds || [],
    workspaceName: wsName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDocument(
    `organizations/${itemData.accountId}/schedule_items`,
    dataWithTimestamp
  );
  return docRef.id;
};

export const updateScheduleItemStatus = async (
  orgId: string,
  itemId: string,
  newStatus: 'OFFICIAL' | 'REJECTED'
): Promise<void> => {
  const itemRef = doc(db, `organizations/${orgId}/schedule_items`, itemId);
  return updateDoc(itemRef, { status: newStatus, updatedAt: serverTimestamp() });
};


export const assignMemberToScheduleItem = async (
  workspaceId: string,
  itemId: string,
  memberId: string
): Promise<void> => {
  const wsSnap = await getDoc(doc(db, 'workspaces', workspaceId));
  if (!wsSnap.exists()) throw new Error("Workspace not found during member assignment.");
  const orgId = wsSnap.data().dimensionId;

  const updates = {
    assigneeIds: arrayUnion(memberId),
  };
  return updateDocument(
    `organizations/${orgId}/schedule_items/${itemId}`,
    updates
  );
};

export const unassignMemberFromScheduleItem = async (
  workspaceId: string,
  itemId: string,
  memberId: string
): Promise<void> => {
  const wsSnap = await getDoc(doc(db, 'workspaces', workspaceId));
  if (!wsSnap.exists()) throw new Error("Workspace not found during member unassignment.");
  const orgId = wsSnap.data().dimensionId;

  const updates = {
    assigneeIds: arrayRemove(memberId),
  };
  return updateDocument(
    `organizations/${orgId}/schedule_items/${itemId}`,
    updates
  );
};

export const toggleDailyLogLike = async (orgId: string, logId: string, userId: string): Promise<void> => {
  const logRef = doc(db, `organizations/${orgId}/dailyLogs`, logId);

  await runTransaction(db, async (transaction) => {
    const logDoc = await transaction.get(logRef);
    if (!logDoc.exists()) {
      throw "Document does not exist!";
    }

    const logData = logDoc.data() as DailyLog;
    const likes = logData.likes || [];
    let newLikes;
    let newLikeCount;

    if (likes.includes(userId)) {
      newLikes = arrayRemove(userId);
      newLikeCount = increment(-1);
    } else {
      newLikes = arrayUnion(userId);
      newLikeCount = increment(1);
    }

    transaction.update(logRef, {
      likes: newLikes,
      likeCount: newLikeCount,
    });
  });
};

export const addDailyLogComment = async (
    orgId: string, 
    logId: string, 
    author: { uid: string; name: string; avatarUrl?: string }, 
    content: string
): Promise<void> => {
    const logRef = doc(db, `organizations/${orgId}/dailyLogs`, logId);
    const commentRef = doc(collection(db, `organizations/${orgId}/dailyLogs/${logId}/comments`));

    const newComment: Omit<DailyLogComment, 'id' | 'createdAt'> & { createdAt: any } = {
        author,
        content,
        createdAt: serverTimestamp(),
    };

    const batch = writeBatch(db);
    batch.set(commentRef, newComment);
    batch.update(logRef, { commentCount: increment(1) });

    await batch.commit();
};
