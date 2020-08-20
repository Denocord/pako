/*global describe, it*/


'use strict';


const zlib        = {};
import * as assert from "https://deno.land/std@0.65.0/testing/asserts.ts";
import pako from "../mod.js";
import * as helpers from "./helpers.js";
import * as path from "https://deno.land/std@0.65.0/path/mod.ts";
const { testInflate, dirname } = helpers;

const { __dirname } = dirname(import.meta);

const samples = helpers.loadSamples();
const describe = (name, func) => func((_name, fn) => Deno.test({
  name: `${name}: ${_name}`,
  fn
}));

describe('Inflate defaults', function (it) {

  it('inflate, no options', function () {
    testInflate(samples, {}, {});
  });

  it('inflate raw, no options', function () {
    testInflate(samples, { raw: true }, { raw: true });
  });

  it('inflate raw from compressed samples', function () {
    const compressed_samples = helpers.loadSamples('samples_deflated_raw');
    helpers.testSamples(zlib.inflateRawSync, pako.inflateRaw, compressed_samples, {});
  });
});


describe('Inflate ungzip', function (it) {
  it('with autodetect', function () {
    testInflate(samples, {}, { gzip: true });
  });

  it('with method set directly', function () {
    testInflate(samples, { windowBits: 16 }, { gzip: true });
  });
});


describe('Inflate levels', function (it) {

  it('level 9', function () {
    testInflate(samples, {}, { level: 9 });
  });
  it('level 8', function () {
    testInflate(samples, {}, { level: 8 });
  });
  it('level 7', function () {
    testInflate(samples, {}, { level: 7 });
  });
  it('level 6', function () {
    testInflate(samples, {}, { level: 6 });
  });
  it('level 5', function () {
    testInflate(samples, {}, { level: 5 });
  });
  it('level 4', function () {
    testInflate(samples, {}, { level: 4 });
  });
  it('level 3', function () {
    testInflate(samples, {}, { level: 3 });
  });
  it('level 2', function () {
    testInflate(samples, {}, { level: 2 });
  });
  it('level 1', function () {
    testInflate(samples, {}, { level: 1 });
  });
  it('level 0', function () {
    testInflate(samples, {}, { level: 0 });
  });
});


describe('Inflate windowBits', function (it) {

  it('windowBits 15', function () {
    testInflate(samples, {}, { windowBits: 15 });
  });
  it('windowBits 14', function () {
    testInflate(samples, {}, { windowBits: 14 });
  });
  it('windowBits 13', function () {
    testInflate(samples, {}, { windowBits: 13 });
  });
  it('windowBits 12', function () {
    testInflate(samples, {}, { windowBits: 12 });
  });
  it('windowBits 11', function () {
    testInflate(samples, {}, { windowBits: 11 });
  });
  it('windowBits 10', function () {
    testInflate(samples, {}, { windowBits: 10 });
  });
  it('windowBits 9', function () {
    testInflate(samples, {}, { windowBits: 9 });
  });
  it('windowBits 8', function () {
    testInflate(samples, {}, { windowBits: 8 });
  });
});

describe('Inflate strategy', function (it) {

  it('Z_DEFAULT_STRATEGY', function () {
    testInflate(samples, {}, { strategy: 0 });
  });
  it('Z_FILTERED', function () {
    testInflate(samples, {}, { strategy: 1 });
  });
  it('Z_HUFFMAN_ONLY', function () {
    testInflate(samples, {}, { strategy: 2 });
  });
  it('Z_RLE', function () {
    testInflate(samples, {}, { strategy: 3 });
  });
  it('Z_FIXED', function () {
    testInflate(samples, {}, { strategy: 4 });
  });
});


describe('Inflate RAW', function (it) {
  // Since difference is only in rwapper, test for store/fast/slow methods are enough
  it('level 9', function () {
    testInflate(samples, { raw: true }, { level: 9, raw: true });
  });
  it('level 8', function () {
    testInflate(samples, { raw: true }, { level: 8, raw: true });
  });
  it('level 7', function () {
    testInflate(samples, { raw: true }, { level: 7, raw: true });
  });
  it('level 6', function () {
    testInflate(samples, { raw: true }, { level: 6, raw: true });
  });
  it('level 5', function () {
    testInflate(samples, { raw: true }, { level: 5, raw: true });
  });
  it('level 4', function () {
    testInflate(samples, { raw: true }, { level: 4, raw: true });
  });
  it('level 3', function () {
    testInflate(samples, { raw: true }, { level: 3, raw: true });
  });
  it('level 2', function () {
    testInflate(samples, { raw: true }, { level: 2, raw: true });
  });
  it('level 1', function () {
    testInflate(samples, { raw: true }, { level: 1, raw: true });
  });
  it('level 0', function () {
    testInflate(samples, { raw: true }, { level: 0, raw: true });
  });
});


describe('Inflate with dictionary', function (it) {

  it('should throw on the wrong dictionary', function () {
    // var zCompressed = helpers.deflateSync('world', { dictionary: b('hello') });
    const zCompressed = new Uint8Array([ 120, 187, 6, 44, 2, 21, 43, 207, 47, 202, 73, 1, 0, 6, 166, 2, 41 ]);

    assert.assertThrows(function () {
      pako.inflate(zCompressed, { dictionary: 'world' });
    }, Error, "data error");
  });

  it('trivial dictionary', function () {
    const dict = 'abcdefghijklmnoprstuvwxyz';
    testInflate(samples, { dictionary: dict }, { dictionary: dict });
  });

  it('spdy dictionary', function () {
    const spdyDict = Deno.readFileSync(path.join(__dirname, 'fixtures', 'spdy_dict.txt'));
    testInflate(samples, { dictionary: spdyDict }, { dictionary: spdyDict });
  });

  it('should throw if directory is not supplied to raw inflate', function () {
    const dict = 'abcdefghijklmnoprstuvwxyz';
    assert.assertThrows(function () {
      testInflate(samples, { raw: true }, { raw: true, dictionary: dict });
    });
  });

  it('tests raw inflate with spdy dictionary', function () {
    const spdyDict = Deno.readFileSync(path.join(__dirname, 'fixtures', 'spdy_dict.txt'));
    testInflate(samples, { raw: true, dictionary: spdyDict }, { raw: true, dictionary: spdyDict });
  });

  it('tests dictionary as Uint8Array', function () {
    const dict = new Uint8Array(100);
    for (let i = 0; i < 100; i++) dict[i] = Math.random() * 256;
    testInflate(samples, { dictionary: dict }, { dictionary: dict });
  });

  it('tests dictionary as ArrayBuffer', function () {
    const dict = new Uint8Array(100);
    for (let i = 0; i < 100; i++) dict[i] = Math.random() * 256;
    testInflate(samples, { dictionary: dict.buffer }, { dictionary: dict });
  });
});
