-- CreateTable
CREATE TABLE "Users" (
    "users_id" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "gender" TEXT,
    "image" TEXT,
    "dept" TEXT,
    "batch" TEXT,
    "student_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("users_id")
);

-- CreateTable
CREATE TABLE "RoommateListing" (
    "id" SERIAL NOT NULL,
    "area" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "currentStudents" INTEGER NOT NULL,
    "studentsInfo" JSONB NOT NULL,
    "rent" INTEGER NOT NULL,
    "facilities" TEXT,
    "phone_number" TEXT NOT NULL,
    "isGirlsOnly" BOOLEAN NOT NULL DEFAULT false,
    "whatsappAvailable" BOOLEAN NOT NULL DEFAULT false,
    "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postedBy" INTEGER NOT NULL,

    CONSTRAINT "RoommateListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_items" (
    "item_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "phone_number" TEXT,
    "image" TEXT,
    "whatsappAvailable" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lost_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "BloodRequest" (
    "request_id" SERIAL NOT NULL,
    "blood_group" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "DonorRecord" (
    "donor_id" SERIAL NOT NULL,
    "blood_group" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "last_donated" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DonorRecord_pkey" PRIMARY KEY ("donor_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DonorRecord_userId_key" ON "DonorRecord"("userId");

-- AddForeignKey
ALTER TABLE "RoommateListing" ADD CONSTRAINT "RoommateListing_postedBy_fkey" FOREIGN KEY ("postedBy") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_items" ADD CONSTRAINT "lost_items_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorRecord" ADD CONSTRAINT "DonorRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;
