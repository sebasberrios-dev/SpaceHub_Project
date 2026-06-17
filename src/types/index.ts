export interface AuthUser {
  userId: number;
  email: string;
  role: string;
}

export interface CreateSpaceBody {
  name: string;
  type: string;
  capacity: number;
  pricePerHour: number;
  isActive?: boolean;
}

export interface CreateBookingBody {
  spaceId: string;
  startTime: string;
  endTime: string;
}

export interface UpdateMembershipBody {
  plan: string;
}
