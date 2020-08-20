'use strict';

import * as assert from "https://deno.land/std@0.65.0/testing/asserts.ts";
import * as helpers from "./helpers.js";
import * as pako_utils from "../lib/utils/common.js";
import pako from "../mod.js";


var samples = helpers.loadSamples();


function randomBuf(size) {
  var buf = new pako_utils.Buf8(size);
  for (var i = 0; i < size; i++) {
    buf[i] = Math.round(Math.random() * 256);
  }
  return buf;
}

function testChunk(buf, expected, packer, chunkSize) {
  var i, _in, count, pos, size, expFlushCount;

  var onData = packer.onData;
  var flushCount = 0;

  packer.onData = function () {
    flushCount++;
    onData.apply(this, arguments);
  };

  count = Math.ceil(buf.length / chunkSize);
  pos = 0;
  for (i = 0; i < count; i++) {
    size = (buf.length - pos) < chunkSize ? buf.length - pos : chunkSize;
    _in = new pako_utils.Buf8(size);
    pako_utils.arraySet(_in, buf, pos, size, 0);
    packer.push(_in, i === count - 1);
    pos += chunkSize;
  }

  //expected count of onData calls. 16384 output chunk size
  expFlushCount = Math.ceil(packer.result.length / 16384);

  assert.assert(!packer.err, 'Packer error: ' + packer.err);
  assert.assert(helpers.cmpBuf(packer.result, expected), 'Result is different');
  assert.assertEquals(flushCount, expFlushCount, 'onData called ' + flushCount + 'times, expected: ' + expFlushCount);
}

const it = (name, fn) => Deno.test({
  name,
  fn
});


it('deflate 100b by 1b chunk', function () {
  var buf = randomBuf(100);
  var deflated = pako.deflate(buf);
  testChunk(buf, deflated, new pako.Deflate(), 1);
});

it('deflate 20000b by 10b chunk', function () {
  var buf = randomBuf(20000);
  var deflated = pako.deflate(buf);
  testChunk(buf, deflated, new pako.Deflate(), 10);
});

it('inflate 100b result by 1b chunk', function () {
  var buf = randomBuf(100);
  var deflated = pako.deflate(buf);
  testChunk(deflated, buf, new pako.Inflate(), 1);
});

it('inflate 20000b result by 10b chunk', function () {
  var buf = randomBuf(20000);
  var deflated = pako.deflate(buf);
  testChunk(deflated, buf, new pako.Inflate(), 10);
});
it('deflate end', function () {
  var data = samples.lorem_utf_100k;

  var deflator = new pako.Deflate();
  deflator.push(data);
  deflator.push([], true);

  assert.assert(helpers.cmpBuf(deflator.result, pako.deflate(data)));
});

it('inflate end', function () {
  var data = pako.deflate(samples.lorem_utf_100k);

  var inflator = new pako.Inflate();
  inflator.push(data);
  inflator.push([], true);

  assert.assert(helpers.cmpBuf(inflator.result, pako.inflate(data)));
});

it('should be ok on buffer border', function () {
  var i;
  var data = new Uint8Array(1024 * 16 + 1);

  for (i = 0; i < data.length; i++) {
    data[i] = Math.floor(Math.random() * 255.999);
  }

  var deflated = pako.deflate(data);

  var inflator = new pako.Inflate();

  for (i = 0; i < deflated.length; i++) {
    inflator.push(deflated.subarray(i, i + 1), false);
    assert.assert(!inflator.err, 'Inflate failed with status ' + inflator.err);
  }

  inflator.push(new Uint8Array(0), true);

  assert.assert(!inflator.err, 'Inflate failed with status ' + inflator.err);
  assert.assert(helpers.cmpBuf(data, inflator.result));
});
