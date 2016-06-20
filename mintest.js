// # mintest
//
// Tiny microlibrary for ad-hoc unit testing in a scratch file
// and for beginning practice or teaching of test-driven
// development (TDD) techniques.
//
// ![mintest in Sublime Text](mintest.gif "mintest demo")
//
// Provides strict equality comparison of boolean, numeric, and string
// values or objects containing those value types (shallow comparison).
// Logs results to the browser or Node console in terse or verbose form,
// depending on whether `test()` is passed a tests object as its second
// argument.
//
// GitHub: [https://bitfragment.github.io/mintest](https://bitfragment.github.io/mintest)
//
//
// ## Usage
//
// ```javascript
// const mintest = require('mintest.js');
// ```
//
// ### Terse results
//
// For multiple tests.
//
// ```javascript
// mintest.test(testFunction, tests);
// ```
//
// `tests` is any object with the property `tests`. The value of
// `tests` is an array of individual test objects containing input
// parameters and expected return values:
//
// ```javascript
// let myTests = {
//     tests: [
//         {i: -1, o: 0},
//         {i:  0, o: 1}
//     ]
// };
// ```
//
// ### Verbose results
//
// For single tests.
//
// `expected` is the expected value returned by the function invocation
// passed as the first argument. The third and fourth arguments,
// `message` (a custom failure message) and `name` (a custom test
// name), are optional.
//
// ```javascript
// mintest.test(testFunction([param, [param]...]]), expected, message, name);
// ```
//
//
// ## Console output
//
// Logs the test function's name if its `name` property can be
// accessed (this is not possible with anonymous functions).
//
// ```
// testFunction:✅✅✅
// testFunction:❌❌❌
// ```
//
// For more example testing code and console output, see the bottom of
// this file following the source.
//
//
//
// ## Annotated source
//
// Begin module.
const mintest = (function() {

    // Mark to represent test success.
    const successMark = () => String.fromCharCode(9989); // ✅

    // Mark to represent test failure.
    const failMark = () => String.fromCharCode(10060); // ❌

    // Default test failure message.
    const failMessage = () => 'Actual and expected values do not match.';

    // Verbose message for test success.
    const verboseSuccess = (successMark, name) =>
        `${successMark} ${name} succeeded.`;

    // Verbose message for test failure.
    const verboseFailure = (failMark, actual, expected, message, name) =>
        `${failMark} ${name} FAILED: ${message}\n` +
        `   [Actual: ${actual} Expected: ${expected}]`;

    // Strict equality comparison.
    const isEqual = (a, b) =>
        (typeof a === 'object' &&
         typeof b === 'object')
            ? isEqualObj(a, b)
            : a === b;

    // Shallow comparison of objects whose properties are boolean,
    // numeric or string values.
    const isEqualObj = (a, b) => {
        for (let prop in a) {
            if (b[prop] === undefined) return false;
            if (a[prop] !== b[prop]) return false;
        }
        return true;
    };

    // Return a terse evaluation. Expects left and right values
    // to be compared, plus success and failure marks.
    const terseEval = (left, right, successMark, failMark) =>
        isEqual(left, right) ? successMark : failMark;

    // Return a verbose evaluation. Receives its parameters from
    // `verboseTest()` and returns a string verbosely summarizing test
    // results.
    const verboseEval = (successMark, failMark, actual, expected, message, name) =>
        isEqual(actual, expected)
            ? verboseSuccess(successMark, name)
            : verboseFailure(failMark, actual, expected, message, name);

    // Return the result of a single terse test.
    const terseTest = (test, testFunction, evalFunction, successMark, failMark) => {
        let keys = Object.keys(test),
            input = test[keys[0]], output = test[keys[1]],
            left = testFunction(input), right = output,
            result = evalFunction(left, right, successMark, failMark);
        return result;
    }

    // Log all terse test results to the console. Expects a string
    // representing the name of the tested function, along with
    // a tests object.
    const terseTests = (testFunction, tests) => {

        // TODO: the property `name` of an anonymous function cannot be
        // accessed, but named arrow functions are being considered
        // for a future edition of ECMAScript?
        let fName = testFunction.name || 'Anonymous function';
        let results = fName + ': ';

        tests.tests.forEach(test => results += terseTest(
            test, testFunction, terseEval, successMark(), failMark())
        );

        return console.log(results);
    };

    // Log verbose test results to the console. Expects two required
    // parameters: `actual`, a value representing the actually
    // evaluated return of the tested function, and `expected`, a value
    // representing the expected return value of the tested
    // function. Takes two additional optional parameters:
    // `message`, a custom failure message, and `name`, a custom test
    // name.
    const verboseTest = (actual, expected, message, name) => {
        name = name || 'Unnamed test';
        message = message || failMessage();

        let result = verboseEval(successMark(), failMark(),
                                 actual, expected, message, name);

        return console.log(result);
    };

    // Return an object containing the following methods.
    return {

        // Main test method. If second argument is an object that has
        // the property `tests`, call `terseTests`; else, call
        // `verboseTest`.
        test: function() {
            let argsArr = [].slice.apply(arguments);

            (typeof argsArr[1] === 'object' &&
             argsArr[1].tests !== undefined)
                ? terseTests.apply(this, argsArr)
                : verboseTest.apply(this, argsArr);
        }

    };

// End module.
}());


// If we're using Node, export this module; else, make `mintest` a
// property of the browser `window` object.
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = mintest;
} else {
    window.mintest = mintest;
}

// ---
// ## Examples
//
// Uncomment the lines below, then execute this file.

/*
// ### Functions to test
function add1(n) {
    return n + 1;
}

function addFoo(x) {
    return x.concat('foo');
}

function getObj(x) {
    return {p: x};
}

// ### Tests objects
let add1Tests = {
    tests: [
        {i: -1, o: 0},
        {i:  0, o: 1}
    ]
};

let addFooTests = {
    tests: [
        {i: 'foo', o: 'foofoo'},
        {i: ['bar'], o: ['bar', 'foo']}
    ]
};

let getObjTests = {
    tests: [
        {i: 3, o: {p: 3}},
        {i: 'foo', o: {p: 'foo'}}
    ]
};

// ### Terse results: success
mintest.test(add1, add1Tests);
mintest.test(addFoo, addFooTests);
mintest.test(getObj, getObjTests);

// ```
// add1: ✅✅
// addFoo: ✅✅
// getObj: ✅✅
// ```

// ### Verbose results: success

// No test message or name:
mintest.test(add1(0), 1);
mintest.test(addFoo('foo'), 'foofoo');
mintest.test(addFoo(['bar']), ['bar', 'foo']);
mintest.test(getObj('foo'), {p: 'foo'});

//```
// ✅ Unnamed test succeeded.
// ✅ Unnamed test succeeded.
// ✅ Unnamed test succeeded.
// ✅ Unnamed test succeeded.
//```

// Test message, but no name:
mintest.test(addFoo('bar'), 'barfoo', 'Did not handle \"bar\" correctly.');
mintest.test(addFoo(['bar']), ['bar', 'foo'], 'Did not handle [\"bar\"] correctly.');

//```
// ✅ Unnamed test succeeded.
// ✅ Unnamed test succeeded.
//```

// Test message and name:
mintest.test(addFoo('bar'), 'barfoo', 'Did not handle \"bar\" correctly.', 'addFoo \"bar\" test');
mintest.test(addFoo(['bar']), ['bar', 'foo'], 'Did not handle [\"bar\"] correctly.', 'addFoo [\"bar\"] test');

// ```
// ✅ addFoo "bar" test succeeded.
// ✅ addFoo ["bar"] test succeeded.
// ```

// ### Verbose results: failure

mintest.test(addFoo('bar'), 'WRONG', 'Did not handle \"bar\" correctly.', 'addFoo \"bar\" test');
mintest.test(addFoo(['bar']), 'WRONG', 'Did not handle [\"bar\"] correctly.', 'addFoo [\"bar\"] test');

// ```
// ❌ addFoo "bar" test FAILED: Did not handle "bar" correctly.
//    [Actual: barfoo Expected: WRONG]
// ❌ addFoo ["bar"] test FAILED: Did not handle ["bar"] correctly.
//    [Actual: bar,foo Expected: WRONG]
// ```
*/
