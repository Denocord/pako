/*global describe, it*/

"use strict";

import pako from "../mod.js";
import * as assert from "https://deno.land/std@0.65.0/testing/asserts.ts";
import * as path from "https://deno.land/std@0.65.0/path/mod.ts";

import { dirname } from "./helpers.js";
const { __dirname } = dirname(import.meta);

const describe = (name, func) =>
  func((_name, fn) =>
    Deno.test({
      name: `${name}: ${_name}`,
      fn,
    })
  );

describe("ArrayBuffer", function (it) {
  const file = path.join(__dirname, "fixtures/samples/lorem_utf_100k.txt");
  const sample = Deno.readFileSync(file);
  const deflated = pako.deflate(sample);
  const buffer = sample.buffer.slice(sample.byteOffset, sample.byteLength);

  it("Deflate ArrayBuffer", function () {
    assert.assertEquals(deflated, pako.deflate(buffer));
  });

  it("Inflate ArrayBuffer", function () {
    assert.assertEquals(sample, pako.inflate(deflated.buffer));
  });

  // no minified version available
  /*it('Simplified minified version test', function () {
    // At some point minifier started to corrupt str2buf function
    // https://github.com/nodeca/pako/issues/161#issuecomment-468420555
    var minified = require('../dist/pako.min.js');

    assert.assert(cmp(minified.deflate('→'), pako.deflate('→')));
  });*/
});
