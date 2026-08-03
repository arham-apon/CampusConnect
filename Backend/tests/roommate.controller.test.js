jest.mock("../src/config/prisma", () => ({
  roommateListing: { create: jest.fn() },
}));
jest.mock("../utils/notificationHelper", () => ({
  createNotification: jest.fn(),
}));

const prisma = require("../src/config/prisma");
const { createListing } = require("../controllers/roommate.controller");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

afterEach(() => {
  jest.clearAllMocks();
});

test("should create a new roommate listing under the posting user's ID", async () => {
  prisma.roommateListing.create.mockResolvedValue({
    id: 1,
    area: "Board Bazar",
    rent: 5000,
    postedBy: 7,
  });

  const req = {
    verifiedUser: { user_id: 7 },
    body: {
      area: "Board Bazar",
      fullAddress: "House 12, Road 3",
      floor: "3rd",
      currentStudents: "1",
      studentsInfo: "1 student currently",
      rent: "5000",
      facilities: "Wifi, Water",
      phone_number: "0123456789",
      isGirlsOnly: false,
      whatsappAvailable: true,
    },
  };
  const res = mockRes();

  await createListing(req, res);

  expect(prisma.roommateListing.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ postedBy: 7, area: "Board Bazar" }),
    })
  );
  expect(res.status).toHaveBeenCalledWith(201);
});

test("should convert numeric string fields before saving the listing", async () => {
  prisma.roommateListing.create.mockResolvedValue({ id: 2 });

  const req = {
    verifiedUser: { user_id: 3 },
    body: {
      area: "Uttara",
      currentStudents: "2",
      rent: "8000",
      isGirlsOnly: true,
      whatsappAvailable: false,
    },
  };
  const res = mockRes();

  await createListing(req, res);

  const savedData = prisma.roommateListing.create.mock.calls[0][0].data;
  expect(savedData.currentStudents).toBe(2);
  expect(savedData.rent).toBe(8000);
});
