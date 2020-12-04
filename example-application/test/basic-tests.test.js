const request = require("supertest");
const sinon = require("sinon");
const nock = require("nock");
const { initializeWebServer, stopWebServer } = require("../api-under-test");
const mailer = require("../libraries/mailer");
const OrderRepository = require("../data-access/order-repository");

let expressApp;
let sinonSandbox;

beforeAll(async (done) => {
  // ️️️✅ Best Practice: Place the backend under test within the same process
  expressApp = await initializeWebServer();

  // ️️️✅ Best Practice: use a sandbox for test doubles for proper clean-up between tests
  sinonSandbox = sinon.createSandbox();

  // ️️️✅ Best Practice: Ensure that this component is isolated by preventing unknown calls
  nock.disableNetConnect();

  done();
});

afterAll(async (done) => {
  // ️️️✅ Best Practice: Clean-up resources after each run
  await stopWebServer();
  done();
});

beforeEach(() => {
  nock.cleanAll();
  nock("http://localhost/user/").get(`/1`).reply(200, {
    id: 1,
    name: "John",
  });

  if (sinonSandbox) {
    sinonSandbox.restore();
  }
});

// ️️️✅ Best Practice: Structure tests
describe("/api", () => {
  describe("POST /orders", () => {
    test.todo("When adding order without product, return 400");

    test("When adding an order without specifying product, stop and return 400", async () => {
      //Arrange
      nock("http://localhost/user/").get(`/1`).reply(200, {
        id: 1,
        name: "John",
      });
      const orderToAdd = {
        userId: 1,
        mode: "draft",
      };

      //Act
      const orderAddResult = await request(expressApp).post("/order").send(orderToAdd);

      //Assert
      expect(orderAddResult.status).toBe(400);
    });

    test("When adding  a new valid order , Then should get back 200 response", async () => {
      //Arrange
      const orderToAdd = {
        userId: 1,
        productId: 2,
        mode: "approved",
      };
      nock("http://localhost/user/").get(`/1`).reply(200, {
        id: 1,
        name: "John",
      });

      //Act
      const receivedAPIResponse = await request(expressApp).post("/order").send(orderToAdd);

      //Assert
      const { status, body } = receivedAPIResponse;

      expect({
        status,
        body,
      }).toMatchObject({
        status: 200,
        body: {
          mode: "approved",
        },
      });
    });

    test("When order failed, send mail to admin", async () => {
      //Arrange
      process.env.SEND_MAILS = "true";
      nock("http://localhost/user/").get(`/1`).reply(200, {
        id: 1,
        name: "John",
      });
      nock("http://localhost/").post(`/mailer`).reply(202);
      sinonSandbox.stub(OrderRepository.prototype, "addOrder").throws(new Error("Unknown error"));
      const spyOnMailer = sinon.spy(mailer, "send");
      const orderToAdd = {
        userId: 1,
        productId: 2,
        mode: "approved",
      };

      //Act
      await request(expressApp).post("/order").send(orderToAdd);

      //Assert
      expect(spyOnMailer.called).toBe(true);
    });

    test("When the user does not exist, return http 404", async () => {
      //Arrange
      nock("http://localhost/user/").get(`/7`).reply(404, {
        message: "User does not exist",
        code: "nonExisting",
      });
      const orderToAdd = {
        userId: 7,
        productId: 2,
        mode: "draft",
      };

      //Act
      const orderAddResult = await request(expressApp).post("/order").send(orderToAdd);

      //Assert
      expect(orderAddResult.status).toBe(404);
    });
  });

  describe("GET /orders", () => {
    test("When filtering for canceled orders, should show only relevant items", () => {
      expect(true).toBe(true);
    });
  });
});
