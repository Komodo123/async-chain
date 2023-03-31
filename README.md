<p align="center">
  <h1 align="center" style="border-bottom: none">Async Chain</h1>
</p>

<p align="center">
   <img src="https://img.shields.io/github/license/Komodo123/async-chain" />
   <img src="https://img.shields.io/github/package-json/v/Komodo123/async-chain" />
   <img src="https://img.shields.io/github/languages/code-size/Komodo123/async-chain" />
   <img src="https://img.shields.io/github/issues/Komodo123/async-chain" />
   <img src="https://img.shields.io/github/issues-pr/Komodo123/async-chain" />
   <img src="https://img.shields.io/github/commit-activity/m/Komodo123/async-chain" />
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Motivation](#motivation)
- [Getting Started](#getting-started)
- [Reference](#reference)
- [Examples](#examples)
  - [Network Request](#network-request)
- [Credits](#credits)

## Motivation

In many programming languages, the builder pattern is a popular way to write expressive APIs that modify an internal state. For example, instead of writing raw SQL queries or using an ORM, the [KnexJS](https://knexjs.org/) allows you to chain together the pieces of the query:

    knex('users')
      .select('*')
      .where('id')
      .first();

Typically, patterns like this can be trivially implemented by returning `this` from the methods:

    class Builder {
      method1() {
        console.log("Method 1");
        return this;
      }

      method2() {
        console.log("Method 2");
        return this;
      }

      method3() {
        console.log("Method 3");
        return this;
      }
    }

    (new Builder())
      .method1()
      .method2()
      .method3();

Chains are also very common in functional constructs:

    [ ... Array(20) ]
      .map (x => Math.random())
      .sort()
      .reduce((x, y) => x + y)

The problem arises when any function in the chain is asynchronous and returns a promise. This will *not* work:

    class Builder {
      async method1() {
        console.log("Method 1");
        return this;
      }

      async method2() {
        console.log("Method 2");
        return this;
      }

      async method3() {
        console.log("Method 3");
        return this;
      }
    }

    // Throws: Uncaught TypeError: (intermediate value).method1(...).method2 is not a function
    await (new Builder())
      .method1()
      .method2()
      .method3();

To make this work you must add additional boilerplate:

    await (new Builder())
      .method1()
      .then((builder) => builder.method2())
      .then((builder) => builder.method3())

That's where `async-chain` comes in! You can either use the `chain` function to wrap an asynchronous object or function or you can extend the `Chainable` in your builder.

    // Works!
    await chain(new Builder())
      .method1()
      .method2()
      .method3();

It is worth noting that while there are many existing libraries that provide methods for chaining asynchronous operations, they arguably add even more boilerplate than just chaining a series of `.then` promises.

## Getting Started

To install the library, run `npm install --save @thrall/async-chain`.

There are two ways to use `async-chain`. If you are using ES6 classes, you can extend `Chainable`:

    import { Chainable } from "async-chain";

    class Builder extends Chainable {
      // ...
    }

or you can wrap an object or function with the `chain` method before your await call:

    import { chain } from "async-chain";

    await chain(object)
      .method1()
      .method2()
      .property
      .slice(1) [0].length;

You will notice in the example above that properties of an asynchronous result can also be chained, as well as synchronous methods, native prototypes and array accessors. If at any point in the chain there is an undefined property or an error occurs, the entire result will return false. If strict mode is enabled and an error occurs or a requested property does not exist, the entire chain will throw an error.

Like normal promises, you can use `.then`, `.catch`, and `.finally`:

    import { chain } from "async-chain";

    chain(object)
      .method1()
      .method2()
      .property
      .slice(1) [0].length
      .then((length) => length / 2)
      .then((length) => console.log(length))
      .catch((error) => console.error(error))
      .finally(() => console.log("Finished"));

## Reference

`function chain(target = global, strict = false): Chainable`

`class Chainable(target: object | function, strict = false)`

## Examples

### Network Request

Node v18 introduces a native implementation of the browser's fetch API:

    import { chain } from "async-chain";

    const ip = await chain()
      .fetch("https://httpbin.org/anything")
      .json()
      .origin;

## Credits

This library improves upon the proxy method established in [Awaitium](https://github.com/elemental-mind/Awaitium-js).