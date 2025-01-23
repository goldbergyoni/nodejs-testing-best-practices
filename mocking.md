## **Mocking & contracts**

<br/>

### ⚪️ 1. Identify good mocks from bad mocks

🏷&nbsp; **Tags:** `#basic, #strategic`

:white_check_mark: &nbsp; **Do:** Mocking is neccessary evil we live with, in some cases they are just evil that will... often spoken about as one piece, it's useful to identify 3 types of by their purpose:

isolation - prevent and check interactions with externous units like email send... This is done by stubbing a function that makes externous calls or by intercepting network requests. Isolation embodies two motivation: first avoid hitting external systems also for cost reasons - sending thousands emails a day will come with a bill. Second motivation is checking that our code is making the call in the right way. Calls to _external_ system is an effect, an outcome, of our code which should be tested for the same reason we test the code response. Inherently this mocks sit at the borders of the unit under test. This is not only legit but mandatory

simulation - triggering some specific scenario that demands more than just an input like forcing an error or moving the time forward; Practically this means stubbing some function and triggering it to throw. While coupling the test to some internal mechanism or function is undesirable, it worth the risk if this an important scenario that can happen in production

Implementation - This one is fundamentally different: It checks that that the code _internally_ worked as expected for example by checking that a in-scope function was invoked or a state is as expected. Practically this mocking style will spy-on or stub a function and assert that it was invoked as and when expected

The key difference is in both isolation and simulation what the test check is external effects, outcomes and not implemenation. Implementation mocks are the only to check HOW the unit work and not WHAT it produces. This is the one that you want to avoid at any cose, a pure evil: it will fail when refactoring work even when the code is correct (false-positive) and will not warn when it shoud (false-negative), example here

Note: It's not the mocking technique that tells a bad mock, both stubs and spies can be used for legit and mocking and also to assert on implemenation details

Diagram unit under test borders vs internals?, 2x2, mocks differs by their purpose

Grey black green,

<br/>

👀 &nbsp; **Alternatives:** one might spin the backend in Docker container or just a separate Node process. This configuration better resembles the production but it will lack critical testing features as mentioned above ❌; Some teams run integration tests against production-like cloud environment (see bullet 'Reuse tests against production-like environment), this is a valid technique for extra validation but will get too slow and limiting to rely on during development ❌;

<br/>

<details><summary>✏ <b>Code Examples</b></summary>

```js
const apiUnderTest = require('../api/start.js');

beforeAll(async () => {
  //Start the backend in the same process
```

➡️ [Full code here](https://github.com/testjavascript/integration-tests-a-z/blob/4c76cb2e2202e6c1184d1659bf1a2843db3044e4/example-application/entry-points/api-under-test.js#L10-L34)

</details>

<br/><br/>

### ⚪️ 2. Avoid hidden surprisng mocks

🏷&nbsp; **Tags:** `#strategic`

:white_check_mark: &nbsp; **Do:** Mocks change the code and test behaviour, reader must be aware of they do. Put the mocks definition inside the test if they directly affect the test outcome, otherwise define in beforeEach

About big JSON, the dynamic factory

<br/>

👀 &nbsp; **Alternatives:** Jest mocks library; vitest something

<br/>

<details><summary>✏ <b>Code Examples</b></summary>

```js
// dynamic factory
```

➡️ [Full code here](https://github.com/testjavascript/integration-tests-a-z/blob/4c76cb2e2202e6c1184d1659bf1a2843db3044e4/example-application/entry-points/api-under-test.js#L10-L34)

</details>

<br/><br/>

### ⚪️ 3. Prefer full-mocks over partial ones

🏷&nbsp; **Tags:** `#advanced`

:white_check_mark: &nbsp; **Do:** When mocking we replace functions, having an object or class, should you replace one or all? Replacing one dangerous, a partial object - some mocked, some real, surprising effects and stability at risk. Code may hit other function and trigger charges

Alertnativelly, we can truncate the mocked object, assign some safe default to all functions (like throw) and the desired behaviour to a single function

When doing isolation type of mock, full-mock is desirable. We ensure no interaction with the external.

When doing simulation this rule skipped, we are forced to change implementation of internal object - changing all functions to the right behaviour is hard. We better take the risk of changing the one we need

<br/>

👀 &nbsp; **Alternatives:** Mocking a specific function of a class that interacts and incur charges might miss some other calls and result with charges

<br/>

<details><summary>✏ <b>Code Examples</b></summary>

```js
// Set all functions to throw, change one function only
```

➡️ [Full code here](https://github.com/testjavascript/integration-tests-a-z/blob/4c76cb2e2202e6c1184d1659bf1a2843db3044e4/example-application/entry-points/api-under-test.js#L10-L34)

</details>

<br/><br/>

### ⚪️ 4. Clean-up all mocks BEFORE every test

🏷&nbsp; **Tags:** `#advanced`

:white_check_mark: &nbsp; **Do:**

<br/>

👀 &nbsp; **Alternatives:** After each...

<br/>

<details><summary>✏ <b>Code Examples</b></summary>

```js

```

➡️ [Full code here](https://github.com/testjavascript/integration-tests-a-z/blob/4c76cb2e2202e6c1184d1659bf1a2843db3044e4/example-application/entry-points/api-under-test.js#L10-L34)

</details>

<br/><br/>

### ⚪️ 5. Be mindful about the mocking mechanism

🏷&nbsp; **Tags:** `#advanced`

:white_check_mark: &nbsp; **Do:** There are signifcant differences between two main mocking techniques, each with its own consequences. Module based mocks like jest.mock works by changing the import/require behaviour while cache-based mocks just import an object and modify its behaviour relying on the fact that one single instance will exist

Module-based mocking comes with a price, it need to intercept the import so this must happen before the code and the test import the desired code. About bundling. It's path sensitive?

Cache-based mocking on the othr hand relies on another assumption - existence of object in-memory that both the test and sut act upon. What if the code under test destructures...

<br/>

👀 &nbsp; **Alternatives:** Mocking

<br/>

<details><summary>✏ <b>Code Examples</b></summary>

```js

```

➡️ [Full code here](https://github.com/testjavascript/integration-tests-a-z/blob/4c76cb2e2202e6c1184d1659bf1a2843db3044e4/example-application/entry-points/api-under-test.js#L10-L34)

</details>

<br/><br/>

### ⚪️ 6. Type your mocks

🏷&nbsp; **Tags:** `#advanced`

:white_check_mark: &nbsp; **Do:** There are signifcant differences between two main mocking techniques, each with its own consequences. Module based mocks like jest.mock works by changing the import/require behaviour while cache-based mocks just import an object and modify its behaviour relying on the fact that one single instance will exist

Module-based mocking comes with a price, it need to intercept the import so this must happen before the code and the test import the desired code. About bundling. It's path sensitive?

Cache-based mocking on the othr hand relies on another assumption - existence of object in-memory that both the test and sut act upon. What if the code under test destructures...

<br/>

👀 &nbsp; **Alternatives:** Mocking

<br/>

<details><summary>✏ <b>Code Examples</b></summary>

```js

```

➡️ [Full code here](https://github.com/testjavascript/integration-tests-a-z/blob/4c76cb2e2202e6c1184d1659bf1a2843db3044e4/example-application/entry-points/api-under-test.js#L10-L34)

</details>
