jest.mock("../src/services/bloodNotificationTransformer", () => ({
  transformBloodRequestToNotification: jest.fn(),
}));
jest.mock("../utils/notificationHelper", () => ({
  createNotification: jest.fn(),
}));
jest.mock("../src/config/prisma", () => ({
  bloodRequest: { create: jest.fn() },
}));

const prisma = require("../src/config/prisma");
const { createBloodRequest } = require("../controllers/request.controller");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function flushPendingNotifications() {
  return new Promise((resolve) => setImmediate(resolve));
}

test("should reject a blood request that is missing required fields", async () => {
  const req = { verifiedUser: { user_id: 1 }, body: { blood_group: "O+" } };
  const res = mockRes();

  await createBloodRequest(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
});

test("should create a blood request when all required fields are valid", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  prisma.bloodRequest.create.mockResolvedValue({
    request_id: 10,
    blood_group: "O+",
    location: "IUT Hall",
    deadline: tomorrow,
    requester: { user_name: "Test Student", phone_number: "0123456789" },
  });

  const req = {
    verifiedUser: { user_id: 1 },
    body: {
      blood_group: "O+",
      location: "IUT Hall",
      deadline: tomorrow.toISOString(),
    },
  };
  const res = mockRes();

  await createBloodRequest(req, res);
  await flushPendingNotifications();

  expect(prisma.bloodRequest.create).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(201);
});
