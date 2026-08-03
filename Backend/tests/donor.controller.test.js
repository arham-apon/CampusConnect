jest.mock("../src/config/prisma", () => {
  const mockPrisma = {
    users: { findUnique: jest.fn(), update: jest.fn() },
    donorRecord: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
  };
  mockPrisma.$transaction = jest.fn((callback) => callback(mockPrisma));
  return mockPrisma;
});

const prisma = require("../src/config/prisma");
const { registerDonor } = require("../controllers/donor.controller");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

afterEach(() => {
  jest.clearAllMocks();
});

test("should reject donor registration when required fields are missing", async () => {
  const req = { verifiedUser: { user_id: 1 }, body: { blood_group: "A+" } };
  const res = mockRes();

  await registerDonor(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
});

test("should assign the user as a new donor when all required fields are provided", async () => {
  prisma.users.findUnique.mockResolvedValue({ phone_number: null });
  prisma.donorRecord.findUnique.mockResolvedValue(null);
  prisma.donorRecord.create.mockResolvedValue({
    donor_id: 5,
    blood_group: "A+",
    location: "Dhaka",
    isActive: true,
  });

  const req = {
    verifiedUser: { user_id: 1 },
    body: { blood_group: "A+", location: "Dhaka", phone_number: "0123456789" },
  };
  const res = mockRes();

  await registerDonor(req, res);

  expect(prisma.donorRecord.create).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(201);
});
