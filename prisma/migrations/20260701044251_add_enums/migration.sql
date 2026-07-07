UPDATE "Space" SET "type" = 'individual_desk' WHERE "type" NOT IN ('individual_desk', 'private_room', 'business_suite');

CREATE TYPE "Role" AS ENUM ('member', 'admin');
CREATE TYPE "SpaceType" AS ENUM ('individual_desk', 'private_room', 'business_suite');
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'canceled');
CREATE TYPE "MembershipPlan" AS ENUM ('basic', 'pro', 'enterprise');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'member'::"Role";

ALTER TABLE "Space" ALTER COLUMN "type" TYPE "SpaceType" USING "type"::"SpaceType";

ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus" USING "status"::"BookingStatus";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'pending'::"BookingStatus";

ALTER TABLE "Membership" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Membership" ALTER COLUMN "plan" TYPE "MembershipPlan" USING "plan"::"MembershipPlan";
ALTER TABLE "Membership" ALTER COLUMN "plan" SET DEFAULT 'basic'::"MembershipPlan";


