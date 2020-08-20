/*global describe, it*/

"use strict";

import * as assert from "https://deno.land/std@0.65.0/testing/asserts.ts";
import * as path from "https://deno.land/std@0.65.0/path/mod.ts";
import * as pako_utils from "../lib/utils/common.js";
import pako from "../mod.js";
import { cmpBuf as cmp, dirname } from "./helpers.js";

const { __dirname } = dirname(import.meta);

function a2s(array) {
  return String.fromCharCode.apply(null, array);
}

const describe = (name, func) =>
  func((_name, fn) =>
    Deno.test({
      name: `${name}: ${_name}`,
      fn,
    })
  );

describe("Gzip special cases", function (it) {
  it("Read custom headers", function () {
    const data = Deno.readFileSync(
      path.join(__dirname, "fixtures/gzip-headers.gz"),
    );
    const inflator = new pako.Inflate();
    inflator.push(data, true);

    assert.assertEquals(inflator.header.name, "test name");
    assert.assertEquals(inflator.header.comment, "test comment");
    assert.assertEquals(a2s(inflator.header.extra), "test extra");
  });

  it("Write custom headers", function () {
    const data = "           ";

    const deflator = new pako.Deflate({
      gzip: true,
      header: {
        hcrc: true,
        time: 1234567,
        os: 15,
        name: "test name",
        comment: "test comment",
        extra: [4, 5, 6],
      },
    });
    deflator.push(data, true);

    const inflator = new pako.Inflate();
    inflator.push(deflator.result, true);

    assert.assertEquals(inflator.err, 0);
    assert.assertEquals(inflator.result, new TextEncoder().encode(data));

    const { header } = inflator;
    assert.assertEquals(header.time, 1234567);
    assert.assertEquals(header.os, 15);
    assert.assertEquals(header.name, "test name");
    assert.assertEquals(header.comment, "test comment");
    assert.assert(cmp(header.extra, [4, 5, 6]));
  });

  it("Read stream with SYNC marks", function () {
    let inflator, strm, _in, len, pos = 0, i = 0;
    const data = Deno.readFileSync(
      path.join(__dirname, "fixtures/gzip-joined.gz"),
    );

    do {
      len = data.length - pos;
      _in = new pako_utils.Buf8(len);
      pako_utils.arraySet(_in, data, pos, len, 0);

      inflator = new pako.Inflate();
      strm = inflator.strm;
      inflator.push(_in, true);

      assert.assert(!inflator.err, inflator.msg);

      pos += strm.next_in;
      i++;
    } while (strm.avail_in);

    assert.assert(i === 2, "invalid blobs count");
  });
});
