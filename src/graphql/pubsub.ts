import { PubSub } from "graphql-subscriptions";

type PubSubEvents = {
  BOOKING_CREATED: {
    spaceAvailability: {
      spaceId: number;
      spaceName: string;
      location: string;
      isAvailable: boolean;
      startTime: string;
      endTime: string;
    };
  };
};

export const pubsub = new PubSub<PubSubEvents>();
export const BOOKING_CREATED = "BOOKING_CREATED" as const;
