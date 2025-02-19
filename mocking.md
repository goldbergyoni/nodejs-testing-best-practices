## \*_Mocking_

<br/>

### ⚪️ 1. Spot the Good Mocks from the Evil Ones

🏷&nbsp; **Tags:** `#basic, #strategic`

:white*check_mark: &nbsp; **Do:** Mocking is a necessary evil—sometimes it saves us, and sometimes it drags us straight into testing hell. While often treated as a single tool, mocks come in different flavors, and understanding them makes all the difference. Let’s break it down into \_three types* based on their purpose:

**Isolation mocks - Keeping the Outside World Outside** – Preventing access to out-of-scope units (e.g., third-party services, email providers) and ensuring proper interaction with these external units. This is done by stubbing a function that lives at our code’s boundaries and makes external calls. Alternatively, for network calls, we might intercept the request instead of stubbing the function itself.

This style of mocking serves two main purposes:

1.  **Prevent unwanted side effects** – Avoid hitting external systems.
2.  **Verify external interactions** – Ensure _our_ code is making the right calls in the right way.

Note: Calls to an _external_ system are an _effect_, an outcome of our code. We should test them just as we test function outputs.

**Simulation mocks** – Forcing a specific scenario that can't be triggered using external inputs. For example, simulating an internal error or advancing time in a test. Practically, this means stubbing an _internal_ function.

While coupling tests to internal mechanisms isn’t ideal, sometimes it’s necessary. If a scenario could realistically happen in production but is impossible to trigger naturally in a test, then a simulation mock might be justified.

**Implementation mocks** – Checking that the code _internally_ worked as expected. For example, asserting that an in-scope function was invoked or verifying a component's internal state.

The fundamental difference between these three is that the first two check external effects—things visible to the outside world—while implementation mocks check _how_ the unit works rather than _what_ it produces.

This last type is the one you want to avoid at all costs. Why? Two reasons:

1.  **False Positives** – The test fails when refactoring, even if the behavior stays correct.
2.  **False Negatives** – The test passes when it should fail because it only checks implementation details, not the real outcome.

### The Formula for a Bad Mock

A mock is bad if it meets both of these conditions:

- It applies to _internal_ code.
- It appears in the test's _assert_ phase.
- <br/>

👀 &nbsp; **Alternatives:** One may minimize mocks by separating pure code from code that collaborates with externous units. This is always a welome approach, but inhertly some code must have effects

<br/><br/>

### ⚪️ 2. Avoid Hidden, Surprising Mocks

🏷&nbsp; **Tags:** #strategic

:white_check_mark: &nbsp; **Do:** Mocks obviously change both the code and test behavior, and whoever reads a failing test at midnight must be aware of these effects. "I love hidden things that mysteriously modify my code," said no one ever.

Consequently, mocks should always be defined inside the test file in one of two places:

If a mock directly affects the test outcome, it should be defined as part of the test itself, in the setup phase (i.e., the arrange phase).
If a mock isn't the direct cause of the test result, it still might implicitly affect debugging, so we don't want it hidden far away from the reader—place it in the beforeEach hook instead.
This doesn’t mean stuffing massive JSONs inside each test file. The call to the factory that generates mock data should be included in the test file, but the data itself can be kept in a dedicated file. (See the bullet about mocking factories.)

<br/>
👀 Alternatives: Some test runners, like Vitest and Jest, allow defining mocks in static files within dedicated folders. These mocks get picked up automatically, applied everywhere auto-magically, and leave the reader to figure out where these surprising effects are coming from ❌.

Similarly, defining mocks in an external hook file that the test runner calls before running a suite? Also a bad idea—same reason. ❌

<details><summary>✏ <b>Code Examples</b></summary>

```js
beforeEach(() => {
  // The email sender isn't directly related to the test's subject, so we put it in the
  // closest test hook instead of inside each test.
  sinon.restore();
  sinon.stub(emailService, 'send').returns({ succeeded: true });
});

test('When ordered by a premium user, Then 10% discount is applied', async () => {
  // This response from an external service directly affects the test result,
  // so we define the mock inside the test itself.
  sinon.stub(usersService, 'getUser').returns({ id: 1, status: 'premium' });
  //...
});
```

</details>

<br/><br/>

### ⚪️ 3. Be Mindful About Partial Mocks

🏷&nbsp; **Tags:** #advanced

:white_check_mark: &nbsp; **Do:** When mocking, you’re replacing functions. But if you have an object or class that needs to be mocked, should you replace all functions or just some?

Partial mocks are risky: They leave a zombie object—part real, part mocked. Will it always behave as expected?

As a rule of thumb, when mocking objects that interact with external systems (e.g., isolation mocks like a Mailer), it’s best to mock the entire object. This ensures no hidden calls slip through. Close the borders by giving all functions a safe default—either throwing an error or returning undefined. Once that’s locked down, you can specify valid responses for the functions you actually need.

Some mocking libraries, like Sinon, allow auto-mocking all functions with a single line, while others require you to define a response for every function.

There is, however, one valid case for partial mocks: Simulating a specific internal failure while letting the rest of the system run as usual. For example, testing what happens if a database connection fails. In this case, we need the entire production code to run normally, except for one function that we intentionally make fail. This is the only situation where a partial mock makes sense.

<br/>

👀 &nbsp; **Alternatives:** Replace the object with a fully fake implementation. This avoids a messy mix of real and fake but requires more effort.

<details><summary>✏ <b>Code Examples</b></summary>

```js
import sinon from 'sinon';

const myObject = {
  methodA: () => 'some value',
  methodB: () => 42,
};

// Stub all functions to return undefined
const stubbedObject = sinon.stub(myObject);

console.log(stubbedObject.methodA()); // undefined
```

</details>

<br/><br/>

### ⚪️ 4. Clean Up All Mocks Before Every Test

🏷&nbsp; **Tags:** #strategic

:white_check_mark: &nbsp; **Do:** Every test must start from a clean slate—mocks from previous tests should never affect the next ones. Always clean up all mocks in the beforeEach hook.

What if you need the same common mocks across all tests? Define them inside the same beforeEach hook so they get reset and reapplied every time. This ensures that any modifications made in one test don’t leak into another.

Also, consider adding a cleanup step in afterAll—it’s just one line—to make sure the next test file starts with no leftovers.

<br/>
👀 &nbsp; **Alternatives:** Cleaning up in afterEach is also an option, but there’s a catch: If a test file fails to clean up properly, the first test in the next file could start in a dirty state.

<details><summary>✏ <b>Code Examples</b></summary>

```js
beforeEach(() => {
  sinon.restore();
  // Redefine all common mocks to reset them in case a test modified them
  sinon.stub(emailService, 'send').returns({ succeeded: true });
});

afterAll(() => {
  sinon.restore();
});
```

</details>

<br/><br/>

### ⚪️ 5. Be Mindful About the Mocking Mechanism

🏷 **Tags:** `#advanced`

✅ **Do:** There are **significant differences** between the two main mocking techniques, each with its own trade-offs:

1. **Module-based mocks** (e.g., `vitest.mock`, `jest.mock`) work by **intercepting module imports** and replacing them with mocked alternatives. These mocks hijack the module loading process and inject a test-defined version.
2. **Cache-based mocks** rely on the fact that **`require`-d modules share the same cache**, allowing tests to modify an imported object, affecting its behavior globally. Libraries like [Sinon](https://sinonjs.org/) and `jest.spyOn`/`vitest.spyOn` use this approach.

### **Understanding the Trade-offs**

- **Module-based mocking** works in all scenarios, including ESM, but it comes at a cost:
  - Mocks **must** be defined _before_ importing the module.
  - The test runner magically **hoists** the mock above imports, which involves tweaking the module system behind the scenes.
- **Cache-based mocking** is simpler—no magic under the hood, just regular object reference manipulation. But it has **strict limitations**:
  - It **fails** if the module isn’t exported as a plain JS object.
  - **ESM default exports can’t be modified** (due to [live bindings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)).
  - **CJS single-function exports don’t have an object to modify**, making this technique ineffective.

### **Which One Should You Use?**

- If your codebase uses **CJS (`require`)** or consistently exports **objects**, **cache-based mocking** is the simpler and preferred approach.
- In **all other cases**, **module-based mocking** is unavoidable.

<br/>

👀 **Alternatives:** A **dependency injection system** allows passing a mock instead of the real implementation. This sidesteps all these technical complexities but requires modifying the code structure.

<br/>

<details><summary>✏ <b>Code Examples</b></summary>

```js
// service2.js
export function service2Func() {
  console.log('the real service2');
}

// service1.js
import { service2Func } from './service2.js';

export function service1Func() {
  service2Func();
}

// test-with-object-caching.js
import * as s1 from './service1.js';
import * as s2 from './service2.js';

test('Check mocking', () => {
  sinon.stub(s2, 'service2Func').callsFake(() => {
    console.log('Service 2 mocked');
  });
  s1.service1Func();
});
// Prints "The real service2". Mocking failed ❌

// test-with-module-loading.js
import { test, vi } from 'vitest';
import * as s1 from './service1.js';
import * as s2 from './service2.js';

test('Check mocking', () => {
  vi.spyOn(s2, 'service2Func').mockImplementation(() => {
    console.log('Service 2 mocked');
  });
  s1.service1Func();
});
// Prints "Service 2 mocked". Mocking worked ✅
```

</details>
<br/><br/>

### ⚪️ 6. Type your mocks

🏷&nbsp; **Tags:** `#advanced`

:white_check_mark: &nbsp; **Do:** Type safety is always a precious asset, all the more with mocking: Once we create a 2nd instance of some code, a mock, we put ourselves at a risk of having a different signature, mostly when the code changes. When this happen, we have two versions of the truth: the reality and our false personal belief. When this happens, tests are likely to pass while production is troubled. A reputable mocking library provides type-safety support: should the defined mock isn't aligned with the code it mocks - a type error will be shown. With that, some of key mocking functions of the popular test runners are not type safe (e.g., Jest.mock, Vitest.mock) - ensure to use the ones that do support types

<br/>

👀 &nbsp; **Alternatives:** It's possible to occassionaly turn-off mocks and run the same tests against the real collaborators - type mismatch is will be discovered only for happy paths and too late ❌; One may explictly put a type definition for the defined mocks (e.g., use the TypeScript 'satisfy' keyword) - a viable option ✅

<br/>

<details><summary>✏ <b>Code Examples</b></summary>

```js
// calculate-price.ts
export function calculatePrice(): number {
  return 100;
}

// calculate-price.test.ts
vi.mocked(calculatePrice).mockImplementation(() => {
  // Vitest example. Works the same with Jest
  return { price: 500 }; // ❌ Type '{ price: number; }' is not assignable to type 'number'
});
```

➡️ [Full code here](https://github.com/testjavascript/integration-tests-a-z/blob/4c76cb2e2202e6c1184d1659bf1a2843db3044e4/example-application/entry-points/api-under-test.js#L10-L34)

</details>
````
