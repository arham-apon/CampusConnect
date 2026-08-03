jest.mock("../firebase.js", () => ({
  verifyIdToken: jest.fn(),
}));
jest.mock("../src/config/prisma", () => ({
  users: { upsert: jest.fn() },
}));

const adminAuth = require("../firebase.js");
const prisma = require("../src/config/prisma");
const { googleSignin } = require("../controllers/auth.controller");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

test("should log the user in and return a token when the Google ID token is valid", async () => {
  adminAuth.verifyIdToken.mockResolvedValue({
    email: "student@iut-dhaka.edu",
    uid: "firebase-uid-123",
    name: "Test Student",
  });

  prisma.users.upsert.mockResolvedValue({
    users_id: 1,
    email: "student@iut-dhaka.edu",
    user_name: "Test Student",
  });

  const req = { body: { token: "valid-firebase-token" } };
  const res = mockRes();

  await googleSignin(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const responseBody = res.json.mock.calls[0][0];
  expect(responseBody.user.email).toBe("student@iut-dhaka.edu");
  expect(typeof responseBody.user.token).toBe("string");
});
