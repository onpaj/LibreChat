// Temporary Group types for UI development
export interface Group {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  memberCount: number;
  timeWindows: TimeWindow[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeWindow {
  _id?: string;
  name: string;
  windowType: 'recurring' | 'one-time';
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  startDate?: string;
  endDate?: string;
  timezone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupsListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GroupsListResponse {
  groups: Group[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GroupStatsResponse {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  averageMembersPerGroup: number;
  groupsWithTimeWindows: number;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}