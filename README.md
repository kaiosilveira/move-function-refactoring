[![Continuous Integration](https://github.com/kaiosilveira/move-function-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/move-function-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Move function

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
class Account {
  get overdraftCharge() {
    // ...
  }
}
```

</td>

<td>

```javascript
class AccountType {
  overdraftCharge(account) {
    // ...
  }
}
```

</td>
</tr>
</tbody>
</table>

Good software is modular, but modularization isn't by itself static. Finding the right place for functionality is a process of trial and error that involves previous experiences, knowledge depth and, sometimes, gut instinct. This refactoring helps with the cases where we have changed our minds about where to place a function.

## Working examples

For this refactoring, we have two working examples: the first one explores a case of moving an originally nested function to the top level of a module, whereas the second one explores a case of moving one function from one class to the other.

### Moving a nested function to the top-level

In this example, we have the `trackSummary` function, which calculates some metrics about a run. This function has many nested functions inside it, such as the `calculateDistance` function, which calculates the total distance between all tracked geolocation points, and the lower level functions `distance` and `radians`. The `distance` function applies the [Haversine formula](https://en.wikibooks.org/wiki/LaTeX/Mathematics#Operators), which, given two points, allows us to measure the great-circle distance between them on the surface of a sphere. The formula is:

$$hav(\theta) = \sin^2(\frac{\theta}{2}) = \frac{1 - \cos(\theta)}{2}$$

The radians function simply performs the conversion between degrees and radians.

Our goal here is to extract `calculateDistance` from the body of `trackSummary` and move it to the top level since it's a highly useful function that could potentially be re-utilized.

#### Test suite

Our supporting test suite contains the calculation of the distance between Lisbon and Porto, which is approximately 274km.

```javascript
describe('trackSummary', () => {
  it('should return data containing the total time, distance, and pace', () => {
    // Lisbon 38.7223° N, 9.1393° W
    // Porto 41.1579° N, 8.6291° W

    const points = [
      { time: 0, lat: 38.7223, lon: 9.1393 },
      { time: 10800, lat: 41.1579, lon: 8.6291 },
    ];

    const result = trackSummary(points);

    expect(result.time).toEqual(10800);
    expect(result.distance).toEqual(274.3);
    expect(result.pace).toEqual(0.66);
  });
});
```

With this initial understanding of the problem space and a supporting test suite, we're good to get started.

#### Steps

As is often the case with nested functions, `calculateDistance` contains inherited dependencies inside of its implementation body, so moving it directly to the top would cause the program to stop working. To keep things as is, for now, we can start slowly, by copying the function to the top level of the module and relying on static analysis to tell us what/where the problems are:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -1,3 +1,11 @@
+function top_calculateDistance() {
+  let result = 0;
+  for (let i = 1; i < points.length; i += 1) {
+    result += distance(points[i - 1], points[i]);
+  }
+  return result;
+}
+
 export default function trackSummary(points) {
   function calculateTime() {
     return points.map(p => p.time).reduce((t, p) => t + p, 0);
```

After doing that, the lint is quick to tell us that neither `points` nor `distance` are valid tokens:

```zsh
src/examples/nested-fn-to-top-level/index.js
   3:23  error  'points' is not defined                                  no-undef
   4:15  error  'distance' is not defined                                no-undef
   4:24  error  'points' is not defined                                  no-undef
   4:39  error  'points' is not defined                                  no-undef
```

We can first solve `points`, by passing its value as a parameter:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -1,4 +1,4 @@
-function top_calculateDistance() {
+function top_calculateDistance(points) {
   let result = 0;
   for (let i = 1; i < points.length; i += 1) {
     result += distance(points[i - 1], points[i]);
```

And then the natural step would be to move `distance`, but there's a problem: distance relies on `radius`. To avoid problems and be completely safe, we can copy `distance` and `radius` to inside `calculateDistance` and make sure it still runs:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -11,25 +11,25 @@
export default function trackSummary(points) {
     return points.map(p => p.time).reduce((t, p) => t + p, 0);
   }

-  function radians(degrees) {
-    return (degrees * Math.PI) / 180;
-  }
+  function calculateDistance() {
+    function radians(degrees) {
+      return (degrees * Math.PI) / 180;
+    }

-  function distance(p1, p2) {
-    // haversine formula, see https://en.wikipedia.org/wiki/Haversine_formula
-    const EARTH_RADIUS_IN_KM = 6371;
-    const dLat = radians(p2.lat) - radians(p1.lat);
-    const dLon = radians(p2.lon) - radians(p1.lon);
-    const a =
-      Math.sin(dLat / 2) ** 2 +
-      Math.cos(radians(p2.lat)) * Math.cos(radians(p1.lat)) * Math.sin(dLon / 2) ** 2;
+    function distance(p1, p2) {
+      // haversine formula, see https://en.wikipedia.org/wiki/Haversine_formula
+      const EARTH_RADIUS_IN_KM = 6371;
+      const dLat = radians(p2.lat) - radians(p1.lat);
+      const dLon = radians(p2.lon) - radians(p1.lon);
+      const a =
+        Math.sin(dLat / 2) ** 2 +
+        Math.cos(radians(p2.lat)) * Math.cos(radians(p1.lat)) * Math.sin(dLon / 2) ** 2;

-    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
+      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

-    return Number((EARTH_RADIUS_IN_KM * c).toFixed(2));
-  }
+      return Number((EARTH_RADIUS_IN_KM * c).toFixed(2));
+    }

-  function calculateDistance() {
     let result = 0;
     for (let i = 1; i < points.length; i += 1) {
       result += distance(points[i - 1], points[i]);
```

Then, we can do the same thing at the top level:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -1,4 +1,22 @@
 function top_calculateDistance(points) {
+  function radians(degrees) {
+    return (degrees * Math.PI) / 180;
+  }
+
+  function distance(p1, p2) {
+    // haversine formula, see https://en.wikipedia.org/wiki/Haversine_formula
+    const EARTH_RADIUS_IN_KM = 6371;
+    const dLat = radians(p2.lat) - radians(p1.lat);
+    const dLon = radians(p2.lon) - radians(p1.lon);
+    const a =
+      Math.sin(dLat / 2) ** 2 +
+      Math.cos(radians(p2.lat)) * Math.cos(radians(p1.lat)) * Math.sin(dLon / 2) ** 2;
+
+    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
+
+    return Number((EARTH_RADIUS_IN_KM * c).toFixed(2));
+  }
+
   let result = 0;
   for (let i = 1; i < points.length; i += 1) {
     result += distance(points[i - 1], points[i]);
```

Now, the stage is set for the most important step of this refactoring: calling `top_calculateDistance` from the inner `calculateDistance`:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -30,29 +30,7 @@
export default function trackSummary(points) {
   }

   function calculateDistance() {
-    function radians(degrees) {
-      return (degrees * Math.PI) / 180;
-    }
-
-    function distance(p1, p2) {
-      // haversine formula, see https://en.wikipedia.org/wiki/Haversine_formula
-      const EARTH_RADIUS_IN_KM = 6371;
-      const dLat = radians(p2.lat) - radians(p1.lat);
-      const dLon = radians(p2.lon) - radians(p1.lon);
-      const a =
-        Math.sin(dLat / 2) ** 2 +
-        Math.cos(radians(p2.lat)) * Math.cos(radians(p1.lat)) * Math.sin(dLon / 2) ** 2;
-
-      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
-
-      return Number((EARTH_RADIUS_IN_KM * c).toFixed(2));
-    }
-
-    let result = 0;
-    for (let i = 1; i < points.length; i += 1) {
-      result += distance(points[i - 1], points[i]);
-    }
-    return result;
+    return top_calculateDistance(points);
   }

   const totalTime = calculateTime();
```

The tests still pass, so all our work so far is validated.

Now, we can safely inline `calculateDistance`:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -34,7 +34,7 @@
export default function trackSummary(points) {
   }

   const totalTime = calculateTime();
-  const totalDistance = calculateDistance();
+  const totalDistance = top_calculateDistance(points);
   const pace = Number((totalTime / 60 / totalDistance).toFixed(2));

   return { pace, time: totalTime, distance: totalDistance };
```

And then remove it altogether:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -29,10 +29,6 @@
export default function trackSummary(points) {
     return points.map(p => p.time).reduce((t, p) => t + p, 0);
   }

-  function calculateDistance() {
-    return top_calculateDistance(points);
-  }
-
   const totalTime = calculateTime();
   const totalDistance = top_calculateDistance(points);
   const pace = Number((totalTime / 60 / totalDistance).toFixed(2));
```

We need to think of a better name for `top_calculateDistance`, though, and `totalDistance` seems reasonable, but this name is already taken by a variable. After taking a look at this variable, though, we notice that we can easily remove it by inlining the calls to `top_calculateDistance`:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -30,8 +30,7 @@
export default function trackSummary(points) {
   }

   const totalTime = calculateTime();
-  const totalDistance = top_calculateDistance(points);
-  const pace = Number((totalTime / 60 / totalDistance).toFixed(2));
+  const pace = Number((totalTime / 60 / top_calculateDistance(points)).toFixed(2));

-  return { pace, time: totalTime, distance: totalDistance };
+  return { pace, time: totalTime, distance: top_calculateDistance(points) };
 }
```

Finally, we can rename `top_calculateDistance` to `totalDistance`:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -1,4 +1,4 @@
-function top_calculateDistance(points) {
+function totalDistance(points) {
   function radians(degrees) {
     return (degrees * Math.PI) / 180;
   }
@@ -30,7 +30,7 @@ export default function trackSummary(points) {
   }

   const totalTime = calculateTime();
-  const pace = Number((totalTime / 60 / top_calculateDistance(points)).toFixed(2));
+  const pace = Number((totalTime / 60 / totalDistance(points)).toFixed(2));

-  return { pace, time: totalTime, distance: top_calculateDistance(points) };
+  return { pace, time: totalTime, distance: totalDistance(points) };
 }
```

We still need to figure out the destines of `radians` and `distance`, that are currently nested inside `totalDistance`. As a file is a good boundary for a module in javascript, we can safely move them to the top level as well while keeping them private:

```diff
diff --git a/src/examples/nested-fn-to-top-level/index.js b/src/examples/nested-fn-to-top-level/index.js
@@ -1,22 +1,22 @@
-function totalDistance(points) {
-  function radians(degrees) {
-    return (degrees * Math.PI) / 180;
-  }
+function radians(degrees) {
+  return (degrees * Math.PI) / 180;
+}

-  function distance(p1, p2) {
-    // haversine formula, see https://en.wikipedia.org/wiki/Haversine_formula
-    const EARTH_RADIUS_IN_KM = 6371;
-    const dLat = radians(p2.lat) - radians(p1.lat);
-    const dLon = radians(p2.lon) - radians(p1.lon);
-    const a =
-      Math.sin(dLat / 2) ** 2 +
-      Math.cos(radians(p2.lat)) * Math.cos(radians(p1.lat)) * Math.sin(dLon / 2) ** 2;
+function distance(p1, p2) {
+  // haversine formula, see https://en.wikipedia.org/wiki/Haversine_formula
+  const EARTH_RADIUS_IN_KM = 6371;
+  const dLat = radians(p2.lat) - radians(p1.lat);
+  const dLon = radians(p2.lon) - radians(p1.lon);
+  const a =
+    Math.sin(dLat / 2) ** 2 +
+    Math.cos(radians(p2.lat)) * Math.cos(radians(p1.lat)) * Math.sin(dLon / 2) ** 2;

-    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
+  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

-    return Number((EARTH_RADIUS_IN_KM * c).toFixed(2));
-  }
+  return Number((EARTH_RADIUS_IN_KM * c).toFixed(2));
+}

+function totalDistance(points) {
   let result = 0;
   for (let i = 1; i < points.length; i += 1) {
     result += distance(points[i - 1], points[i]);
```

And that's it! Now we have four functions at the top level, with only the main one being exported to the outside world.

#### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                           | Message                                                      |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [9ff3855](https://github.com/kaiosilveira/move-function-refactoring/commit/9ff3855cbb43b8753f9d6cb934b2e5385c4947c9) | copy `calculateDistance` top top-level                       |
| [9b1ad1d](https://github.com/kaiosilveira/move-function-refactoring/commit/9b1ad1db6fa72ce792d517d71b76ae99d920cfde) | pass `points` as a parameter to `top_calculateDistance`      |
| [6b18204](https://github.com/kaiosilveira/move-function-refactoring/commit/6b1820440ca0b5208d95b9185e13a85925daaff8) | move `radians` and `distance` fns to `calculateDistance`     |
| [bf4931e](https://github.com/kaiosilveira/move-function-refactoring/commit/bf4931ebc80566fe03b561ba4f0f2ab1c0903716) | copy `radians` and `distance` fns to `top_calculateDistance` |
| [75e461e](https://github.com/kaiosilveira/move-function-refactoring/commit/75e461e4f83ee725202ce5fc17102f21f0c2d1ed) | call `top_calculateDistance` from inner `calculateDistance`  |
| [c766675](https://github.com/kaiosilveira/move-function-refactoring/commit/c766675611cd4b3dd9b09bcc4a110fb7ee56b5f2) | inline `calculateDistance`                                   |
| [ae031d2](https://github.com/kaiosilveira/move-function-refactoring/commit/ae031d2dc3505bdd4dbc565511cdd1eecaddf9f8) | delete inner `calculateDistance`                             |
| [dc57eb8](https://github.com/kaiosilveira/move-function-refactoring/commit/dc57eb86114344312ebe3a8d86c2dde5a696ba0a) | inline `totalDistance`                                       |
| [62c0220](https://github.com/kaiosilveira/move-function-refactoring/commit/62c0220c8fdaa9c032adb85570e1f1561f8f780e) | rename `top_calculateDistance` to `totalDistance`            |
| [4faff9c](https://github.com/kaiosilveira/move-function-refactoring/commit/4faff9c128007c47a3dab4de24e1b73559a7e957) | move `radians` and `distance` fns to top-level               |

For the full commit history for this example, check the [Commit History tab](https://github.com/kaiosilveira/move-function-refactoring/commits/main) for commits with the `nested-fn-to-top-level` prefix.

### Moving between classes

In this second example, we have a small banking application, with an `Account`, which contains an `AccountType`. Currently, `Account` has a getter for `overdraftCharge`, which, as the name suggests, calculates the amount to be charged for the period that the account is in overdraft. An upcoming requirement will force the rules inside this function to become more complex, though, varying the calculation based on the type of the account. Therefore, it would be great to free `Account` of this responsibility and potential complexity by moving the specifics to the `AccountType` class.

#### Test suite

Our supporting test suite covers the getters of account:

```javascript
describe('Account', () => {
  const accountNumber = 123;
  const premiumAccountType = new AccountType(true);
  const regularAccountType = new AccountType(false);

  describe('bankCharge', () => {
    it('should return the base charge if account is not on overdraft', () => {
      const daysOverdrawn = 0;
      const account = new Account(premiumAccountType, regularAccountType, daysOverdrawn);
      expect(account.bankCharge).toEqual(4.5);
    });

    it('should return the base charge plus the overdraft charge if account is on overdraft', () => {
      const daysOverdrawn = 1;
      const account = new Account(accountNumber, regularAccountType, daysOverdrawn);
      expect(account.bankCharge).toEqual(6.25);
    });
  });
});
```

And the behavior of `AccountType`:

```javascript
describe('AccountType', () => {
  const accountNumber = 123;
  const regularAccountType = new AccountType('regular');
  const premiumAccountType = new AccountType('premium');

  describe('isPremium', () => {
    it('should return true if account name is "premium"', () => {
      expect(premiumAccountType.isPremium).toEqual(true);
    });

    it('should return false if account name is not "premium"', () => {
      expect(regularAccountType.isPremium).toEqual(false);
    });
  });
});
```

With these tests in place and an initial understanding of the problem, we're good to go.

#### Steps

Our first step is to copy the `overdraftCharge` method to `AccountType`, so we can implement it at our pace without breaking `Account`:

```diff
diff --git a/src/examples/moving-between-classes/account-type/index.js b/src/examples/moving-between-classes/account-type/index.js
@@ -6,4 +6,14 @@
export default class AccountType {
   get isPremium() {
     return this.name === 'premium';
   }
+
+  overdraftCharge(daysOverdrawn) {
+    if (this.isPremium) {
+      const baseCharge = 10;
+      if (daysOverdrawn <= 7) return baseCharge;
+      return baseCharge + (daysOverdrawn - 7) * 0.85;
+    }
+
+    return daysOverdrawn * 1.75;
+  }
 }

diff --git a/src/examples/moving-between-classes/account-type/index.test.js b/src/examples/moving-between-classes/account-type/index.test.js
@@ -12,4 +12,25 @@
describe('AccountType', () => {
       expect(type.isPremium).toEqual(false);
     });
   });
+
+  describe('overdraftCharge', () => {
+    describe('prmium accounts', () => {
+      it('should not charge for the first seven days on overdraft if it is a premium account', () => {
+        const accountType = new AccountType('premium');
+        expect(accountType.overdraftCharge(7)).toEqual(10);
+      });
+
+      it('should charge a daily amount after the seven initial days on overdraft', () => {
+        const accountType = new AccountType('premium');
+        expect(accountType.overdraftCharge(8)).toEqual(10.85);
+      });
+    });
+
+    describe('regular accounts', () => {
+      it('should charge the base overdraft charge plus a daily amount for each day in overdraft', () => {
+        const accountType = new AccountType('regular');
+        expect(accountType.overdraftCharge(1)).toEqual(1.75);
+      });
+    });
+  });
 });
```

Then, we can start delegating calls to `Account.overdraftCharge` to `accountType`:

```diff
diff --git a/src/examples/moving-between-classes/account/index.js b/src/examples/moving-between-classes/account/index.js
@@ -12,12 +12,6 @@
export default class Account {
   }

   get overdraftCharge() {
-    if (this.type.isPremium) {
-      const baseCharge = 10;
-      if (this.daysOverdrawn <= 7) return baseCharge;
-      return baseCharge + (this.daysOverdrawn - 7) * 0.85;
-    }
-
-    return this.daysOverdrawn * 1.75;
+    return this.type.overdraftCharge(this.daysOverdrawn);
   }
 }
```

Then, we can simply inline the `overdraftCharge` call at `Account` (and get rid of its tests, since they've already been transported to `AccountType`'s test suite):

```diff
diff --git a/src/examples/moving-between-classes/account/index.js b/src/examples/moving-between-classes/account/index.js
@@ -7,11 +7,7 @@
export default class Account {

   get bankCharge() {
     let result = 4.5;
-    if (this.daysOverdrawn > 0) result += this.overdraftCharge;
+    if (this.daysOverdrawn > 0) result += this.type.overdraftCharge(this.daysOverdrawn);
     return result;
   }
-
-  get overdraftCharge() {
-    return this.type.overdraftCharge(this.daysOverdrawn);
-  }
 }

diff --git a/src/examples/moving-between-classes/account/index.test.js b/src/examples/moving-between-classes/account/index.test.js
@@ -2,27 +2,6 @@
import Account from '.';
 import AccountType from '../account-type';

 describe('Account', () => {
-  describe('overdraftCharge', () => {
-    describe('prmium accounts', () => {
-      it('should not charge for the first seven days on overdraft if it is a premium account', () => {
-        const account = new Account(123, new AccountType('premium'), 7);
-        expect(account.overdraftCharge).toEqual(10);
-      });
-
-      it('should charge a daily amount after the seven initial days on overdraft', () => {
-        const account = new Account(123, new AccountType('premium'), 8);
-        expect(account.overdraftCharge).toEqual(10.85);
-      });
-    });
-
-    describe('regular accounts', () => {
-      it('should charge the base overdraft charge plus a daily amount for each day in overdraft', () => {
-        const account = new Account(123, new AccountType('regular'), 1);
-        expect(account.overdraftCharge).toEqual(1.75);
-      });
-    });
-  });
-
   describe('bankCharge', () => {
     it('should return the base charge if account is not on overdraft', () => {
       const account = new Account(123, new AccountType('regular'), 0);
```

And that's it!

In a more realistic example, though, we would probably need more information about the `account` in context, so we can preserve the whole object here:

```diff
diff --git a/src/examples/moving-between-classes/account-type/index.js b/src/examples/moving-between-classes/account-type/index.js
@@ -7,7 +7,8 @@
export default class AccountType {
     return this.name === 'premium';
   }

-  overdraftCharge(daysOverdrawn) {
+  overdraftCharge(account) {
+    const { daysOverdrawn } = account;
     if (this.isPremium) {
       const baseCharge = 10;
       if (daysOverdrawn <= 7) return baseCharge;

diff --git a/src/examples/moving-between-classes/account-type/index.test.js b/src/examples/moving-between-classes/account-type/index.test.js
@@ -1,4 +1,5 @@
 import AccountType from '.';
+import Account from '../account';

 describe('AccountType', () => {
   describe('isPremium', () => {
@@ -17,19 +18,22 @@ describe('AccountType', () => {
     describe('prmium accounts', () => {
       it('should not charge for the first seven days on overdraft if it is a premium account', () => {
         const accountType = new AccountType('premium');
-        expect(accountType.overdraftCharge(7)).toEqual(10);
+        const account = new Account(123, accountType, 7);
+        expect(accountType.overdraftCharge(account)).toEqual(10);
       });

       it('should charge a daily amount after the seven initial days on overdraft', () => {
         const accountType = new AccountType('premium');
-        expect(accountType.overdraftCharge(8)).toEqual(10.85);
+        const account = new Account(123, accountType, 8);
+        expect(accountType.overdraftCharge(account)).toEqual(10.85);
       });
     });

     describe('regular accounts', () => {
       it('should charge the base overdraft charge plus a daily amount for each day in overdraft', () => {
         const accountType = new AccountType('regular');
-        expect(accountType.overdraftCharge(1)).toEqual(1.75);
+        const account = new Account(123, accountType, 1);
+        expect(accountType.overdraftCharge(account)).toEqual(1.75);
       });
     });
   });

diff --git a/src/examples/moving-between-classes/account/index.js b/src/examples/moving-between-classes/account/index.js
@@ -7,7 +7,7 @@
export default class Account {

   get bankCharge() {
     let result = 4.5;
-    if (this.daysOverdrawn > 0) result += this.type.overdraftCharge(this.daysOverdrawn);
+    if (this.daysOverdrawn > 0) result += this.type.overdraftCharge(this);
     return result;
   }
 }
```

And we're done! Now, `AccountType` has all the responsibility for the calculation of an overdraft charge.

#### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                           | Message                                                            |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [1561f6b](https://github.com/kaiosilveira/move-function-refactoring/commit/1561f6b2c3f5f95acb7376ea9b1f371a2354f474) | copy `overdraftCharge` to `AccountType`                            |
| [cba92da](https://github.com/kaiosilveira/move-function-refactoring/commit/cba92da5c600d57686e911631be5fd22a557c3bb) | delegate `overdraftCharge` calculation to `accountType`            |
| [348fc43](https://github.com/kaiosilveira/move-function-refactoring/commit/348fc4324c4028efd986a376392aca0ae382e365) | inline `overdraftCharge` call at `Account`                         |
| [9840cf9](https://github.com/kaiosilveira/move-function-refactoring/commit/9840cf9f1b45facf9c6cd90f081050fdbad7f436) | pass the whole `account` instance to `accountType.overdraftCharge` |

For the full commit history for this example, check the [Commit History tab](https://github.com/kaiosilveira/move-function-refactoring/commits/main) for commits with the `moving-between-classes` prefix.
