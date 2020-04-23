// Top level file is just a mixin of submodules & constants
'use strict';

import { assign } from "./lib/utils/common.js";
import * as deflate from "./lib/deflate.js";
import * as inflate from "./lib/inflate.js";
import constants from "./lib/zlib/constants.js";

var pako = {};

assign(pako, deflate, inflate, constants);

export default pako;
