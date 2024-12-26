const path = require('path');
const nock = require('nock');
const jestOpenAPI = require('jest-openapi').default;
const {
  testSetup,
} = require('../../../example-application/test/setup/test-file-setup');

jestOpenAPI(path.join(__dirname, '../../../example-application/openapi.json'));
beforeAll(async () => {
  await testSetup.start({
    startAPI: true,
    disableNetConnect: true,
    includeTokenInHttpClient: true,
    mockGetUserCalls: true,
    mockMailerCalls: true,
  });
});

beforeEach(() => {
  testSetup.resetBeforeEach();
});

afterAll(async () => {
  // ️️️✅ Best Practice: Clean-up resources after each run
  testSetup.tearDownTestFile();
});

describe('Verify openApi (Swagger) spec', () => {
  // ️️️✅ Best Practice: When testing the API contract/doc, write a test against each route and potential HTTP status
  describe('POST /orders', () => {
    test('When added a valid order and 200 was expected', async () => {
      nock('http://localhost/user/').get(`/1`).reply(200, {
        id: 1,
        name: 'John',
      });
      const orderToAdd = {
        userId: 1,
        productId: 2,
        mode: 'approved',
      };

      const receivedResponse = await testSetup
        .getHTTPClient()
        .post('/order', orderToAdd);

      // ️️️✅ Best Practice: When testing the API contract/doc
      expect(receivedResponse).toSatisfyApiSpec();
    });

    test('When an invalid order was send, then error 400 is expected', async () => {
      // Arrange
      nock('http://localhost/user/').get(`/1`).reply(200, {
        id: 1,
        name: 'John',
      });
      const orderToAdd = {
        userId: 1,
        productId: undefined, //❌
        mode: 'approved',
      };

      // Act
      const receivedResponse = await testSetup
        .getHTTPClient()
        .post('/order', orderToAdd);

      // Assert
      expect(receivedResponse).toSatisfyApiSpec();
      expect(receivedResponse.status).toBe(400);
    });

    test('When a call to the users microservice fails, then get back 404 error', async () => {
      nock('http://localhost/user/').get(`/1`).reply(404);
      const orderToAdd = {
        userId: 1,
        productId: 2,
        mode: 'approved',
      };

      const res = await testSetup.getHTTPClient().post('/order', orderToAdd);

      expect(res).toSatisfyApiSpec();
    });
  });
});
