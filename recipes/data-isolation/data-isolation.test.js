const axios = require('axios').default;
const sinon = require('sinon');
const nock = require('nock');
const { testSetup } = require('../../example-application/test/test-file-setup');
const OrderRepository = require('../../example-application/data-access/order-repository');
const { getShortUnique } = require('./test-helper');

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

describe('/api', () => {
  describe('POST /orders', () => {
    test('When adding a new valid order, Then should get back 200 response', async () => {
      //Arrange
      const orderToAdd = {
        userId: 1,
        productId: 2,
        mode: 'approved',
        // ️️️✅ Best Practice: Set unique value to unique fields so that tests writer wouldn't have to
        // read previous tests before adding a new one
        externalIdentifier: `100-${getShortUnique()}`, //unique value;
      };

      //Act
      const receivedAPIResponse = await testSetup
        .getHTTPClient()
        .post('/order', orderToAdd);

      //Assert
      expect(receivedAPIResponse.status).toBe(200);
    });

    test('When adding a new valid order, Then it should be approved', async () => {
      //Arrange
      const orderToAdd = {
        userId: 1,
        productId: 2,
        mode: 'approved',
        externalIdentifier: `100-${getShortUnique()}`, //unique value
      };

      //Act
      const receivedAPIResponse = await testSetup
        .getHTTPClient()
        .post('/order', orderToAdd);

      //Assert
      expect(receivedAPIResponse.data.mode).toBe('approved');
    });
  });
  describe('GET /order:/id', () => {
    test('When asked for an existing order, Then should retrieve it and receive 200 response', async () => {
      // Arrange
      const orderToAdd = {
        userId: 1,
        productId: 2,
        externalIdentifier: `id-${getShortUnique()}`, //unique value
      };
      const existingOrder = await testSetup
        .getHTTPClient()
        .post('/order', orderToAdd);

      // Act
      const receivedResponse = await testSetup
        .getHTTPClient()
        .get(`/order/${existingOrder.data.id}`);

      // Assert
      expect(receivedResponse.status).toBe(200);
    });
  });

  describe('Get /order', () => {
    // ️️️✅ Best Practice: Acknowledge that other unknown records might exist, find your expectations within
    // the result
    test.todo(
      'When adding 2 orders, then these orders exist in result when querying for all',
    );
  });
  describe('DELETE /order', () => {
    test.only('When deleting an existing order, Then it should NOT be retrievable', async () => {
      // Arrange
      const orderToDelete = {
        userId: 1,
        productId: 2,
        externalIdentifier: `id-${getShortUnique()}`,
      };
      const deletedOrder = (
        await testSetup.getHTTPClient().post('/order', orderToDelete)
      ).data.id;
      console.log('deletedOrder', deletedOrder);
      const orderNotToBeDeleted = orderToDelete;
      orderNotToBeDeleted.externalIdentifier = `id-${getShortUnique()}`;
      const notDeletedOrder = (
        await testSetup.getHTTPClient().post('/order', orderNotToBeDeleted)
      ).data.id;
      console.log('not deleted', notDeletedOrder);

      // Act
      const deleteRequestResponse = await testSetup
        .getHTTPClient()
        .delete(`/order/${deletedOrder}`);

      // Assert
      const getDeletedOrderStatus = (
        await testSetup.getHTTPClient().get(`/order/${deletedOrder}`)
      ).status;
      console.log('getDeletedOrderStatus', getDeletedOrderStatus);
      const getNotDeletedOrderStatus = (
        await testSetup.getHTTPClient().get(`/order/${notDeletedOrder}`)
      ).status;
      expect(getNotDeletedOrderStatus).toBe(200);
      expect(getDeletedOrderStatus).toBe(404);
      expect(deleteRequestResponse.status).toBe(204);
      console.log('not deleted response', getNotDeletedOrderStatus);
    });
  });
});
