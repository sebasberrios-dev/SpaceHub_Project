export const typeDefs = `
  type Query {
    occupancyAnalytics(startDate: String, endDate: String): OccupancyAnalytics!
  }

  type Subscription {
    spaceAvailability: SpaceAvailabilityEvent!
  }

  type OccupancyAnalytics {
    occupancyByLocation: [LocationOccupancy!]!
    occupancyByType:     [TypeOccupancy!]!
    totalRevenue:        Float!
    revenueByPeriod:     [PeriodRevenue!]!
    expiringMemberships: [ExpiringMembership!]!
    topUsers:            [UserActivity!]!
  }

  type LocationOccupancy {
    location:      String!
    spaceCount:    Int!
    bookedHours:   Float!
    occupancyRate: Float!
  }

  type TypeOccupancy {
    type:          String!
    spaceCount:    Int!
    bookedHours:   Float!
    occupancyRate: Float!
  }

  type PeriodRevenue {
    period:  String!
    revenue: Float!
  }

  type ExpiringMembership {
    userId:   Int!
    userName: String!
    plan:     String!
    endDate:  String!
  }

  type UserActivity {
    userId:       Int!
    userName:     String!
    bookingCount: Int!
    totalSpent:   Float!
  }

  type SpaceAvailabilityEvent {
    spaceId:     Int!
    spaceName:   String!
    location:    String!
    isAvailable: Boolean!
    startTime:   String!
    endTime:     String!
  }
`;
