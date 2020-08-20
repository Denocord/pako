pako
==========================================

[![test](https://github.com/Denocord/pako/workflows/test/badge.svg)](https://github.com/Denocord/pako/actions)

> zlib port to javascript, very fast!

__Why pako is cool:__

- Results are binary equal to well known [zlib](http://www.zlib.net/) (now contains ported zlib v1.2.8).
- Almost as fast in modern JS engines as C implementation (see benchmarks).
- Works in browsers, you can browserify any separate component.

This project was done to understand how fast JS can be and is it necessary to
develop native C modules for CPU-intensive tasks. Enjoy the result!

zlib's test is partially affected by marshalling (that make sense for inflate only).
You can change deflate level to 0 in benchmark source, to investigate details.
For deflate level 6 results can be considered as correct.

Example & API
-------------

Full docs - http://nodeca.github.io/pako/

```javascript
import pako from "https://raw.githubusercontent.com/Denocord/pako/master/mod.js";
// or
import { deflate, inflate, Inflate } from "https://raw.githubusercontent.com/Denocord/pako/master/mod.js";

// Deflate
//
var input = new Uint8Array();
//... fill input data here
var output = pako.deflate(input);

// Inflate (simple wrapper can throw exception on broken stream)
//
var compressed = new Uint8Array();
//... fill data to uncompress here
try {
  var result = pako.inflate(compressed);
} catch (err) {
  console.log(err);
}

//
// Alternate interface for chunking & without exceptions
//

var inflator = new pako.Inflate();

inflator.push(chunk1, false);
inflator.push(chunk2, false);
...
inflator.push(chunkN, true); // true -> last chunk

if (inflator.err) {
  console.log(inflator.msg);
}

var output = inflator.result;

```

Sometime you can wish to work with strings. For example, to send
big objects as json to server. Pako detects input data type.

```javascript
import pako from "https://raw.githubusercontent.com/Denocord/pako/master/mod.js";

var test = { my: 'super', puper: [456, 567], awesome: 'pako' };

var data = pako.deflate(JSON.stringify(test));

//
// Here you can do base64 encode, make xhr requests and so on.
//

var restored = JSON.parse(new TextDecoder().decode(pako.inflate(data)));
```


Notes
-----

Pako does not contain some specific zlib functions:

- __deflate__ -  methods `deflateCopy`, `deflateBound`, `deflateParams`,
  `deflatePending`, `deflatePrime`, `deflateTune`.
- __inflate__ - methods `inflateCopy`, `inflateMark`,
  `inflatePrime`, `inflateGetDictionary`, `inflateSync`, `inflateSyncPoint`, `inflateUndermine`.
- High level inflate/deflate wrappers (classes) may not support some flush
  modes. Those should work: Z_NO_FLUSH, Z_FINISH, Z_SYNC_FLUSH.


Authors
-------

- TTtie [@TTtie](https://github.com/TTtie) - Deno port
- Andrey Tupitsin [@anrd83](https://github.com/andr83)
- Vitaly Puzrin [@puzrin](https://github.com/puzrin)

Personal thanks to:

- Vyacheslav Egorov ([@mraleph](https://github.com/mraleph)) for his awesome
  tutorials about optimising JS code for v8, [IRHydra](http://mrale.ph/irhydra/)
  tool and his advices.
- David Duponchel ([@dduponchel](https://github.com/dduponchel)) for help with
  testing.

Original implementation (in C):

- [zlib](http://zlib.net/) by Jean-loup Gailly and Mark Adler.


License
-------

- MIT - all files, except `/lib/zlib` folder
- ZLIB - `/lib/zlib` content
