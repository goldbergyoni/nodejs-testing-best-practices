// ️️️✅ Best Practice: Check monitoring metrics
test.todo(
  'When a new valid order was added, then order-added metric was fired',
);

// ️️️✅ Best Practice: Simulate external failures
test.todo(
  'When the user service is down, then order is still added successfully',
);

test('When the user does not exist, return 404 response', async () => {
  //Arrange
  testSetup.removeUserNock();
  nock('http://localhost').get('/user/1').reply(404, undefined);
  const orderToAdd = {
    userId: 1,
    productId: 2,
    mode: 'draft',
  };

  //Act
  const orderAddResult = await testSetup
    .getHTTPClient()
    .post('/order', orderToAdd);

  //Assert
  expect(orderAddResult.status).toBe(404);
});

test('When order failed, send mail to admin', async () => {
  //Arrange
  process.env.SEND_MAILS = 'true';
  // ️️️✅ Best Practice: Intercept requests for 3rd party services to eliminate undesired side effects like emails or SMS
  // ️️️✅ Best Practice: Specify the body when you need to make sure you call the 3rd party service as expected
  testSetup.removeMailNock();
  let emailPayload;
  nock('http://mailer.com')
    .post('/send', (payload) => ((emailPayload = payload), true))
    .reply(202);

  sinon
    .stub(OrderRepository.prototype, 'addOrder')
    .throws(new Error('Unknown error'));
  const orderToAdd = {
    userId: 1,
    productId: 2,
    mode: 'approved',
  };

  //Act
  await testSetup.getHTTPClient().post('/order', orderToAdd);

  //Assert
  // ️️️✅ Best Practice: Assert that the app called the mailer service appropriately
  expect(emailPayload).toMatchObject({
    subject: expect.any(String),
    body: expect.any(String),
    recipientAddress: expect.stringMatching(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
  });
});

// ️️️✅ Best Practice: Check external calls
test('When adding a new valid order, Then an email should be send to admin', async () => {
  //Arrange
  process.env.SEND_MAILS = 'true';

  // ️️️✅ Best Practice: Intercept requests for 3rd party services to eliminate undesired side effects like emails or SMS
  // ️️️✅ Best Practice: Specify the body when you need to make sure you call the 3rd party service as expected
  let emailPayload;
  testSetup.removeMailNock();
  nock('http://mailer.com')
    .post('/send', (payload) => ((emailPayload = payload), true))
    .reply(202);

  const orderToAdd = {
    userId: 1,
    productId: 2,
    mode: 'approved',
  };

  //Act
  await testSetup.getHTTPClient().post('/order', orderToAdd);

  //Assert
  // ️️️✅ Best Practice: Assert that the app called the mailer service appropriately
  expect(emailPayload).toMatchObject({
    subject: expect.any(String),
    body: expect.any(String),
    recipientAddress: expect.stringMatching(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
  });
});

// ️️️✅ Best Practice: Check error handling
test.todo('When a new order failed, an invalid-order error was handled');

// ️️️✅ Best Practice: Acknowledge that other unknown records might exist, find your expectations within
// the result
test.todo(
  'When adding 2 orders, then these orders exist in result when querying for all',
);
