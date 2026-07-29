#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
    "use strict";
  }
});

// node_modules/delayed-stream/lib/delayed_stream.js
var require_delayed_stream = __commonJS({
  "node_modules/delayed-stream/lib/delayed_stream.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var Stream = require("stream").Stream;
    var util = require("util");
    module2.exports = DelayedStream;
    function DelayedStream() {
      this.source = null;
      this.dataSize = 0;
      this.maxDataSize = 1024 * 1024;
      this.pauseStream = true;
      this._maxDataSizeExceeded = false;
      this._released = false;
      this._bufferedEvents = [];
    }
    util.inherits(DelayedStream, Stream);
    DelayedStream.create = function(source, options) {
      var delayedStream = new this();
      options = options || {};
      for (var option in options) {
        delayedStream[option] = options[option];
      }
      delayedStream.source = source;
      var realEmit = source.emit;
      source.emit = function() {
        delayedStream._handleEmit(arguments);
        return realEmit.apply(source, arguments);
      };
      source.on("error", function() {
      });
      if (delayedStream.pauseStream) {
        source.pause();
      }
      return delayedStream;
    };
    Object.defineProperty(DelayedStream.prototype, "readable", {
      configurable: true,
      enumerable: true,
      get: function() {
        return this.source.readable;
      }
    });
    DelayedStream.prototype.setEncoding = function() {
      return this.source.setEncoding.apply(this.source, arguments);
    };
    DelayedStream.prototype.resume = function() {
      if (!this._released) {
        this.release();
      }
      this.source.resume();
    };
    DelayedStream.prototype.pause = function() {
      this.source.pause();
    };
    DelayedStream.prototype.release = function() {
      this._released = true;
      this._bufferedEvents.forEach(function(args) {
        this.emit.apply(this, args);
      }.bind(this));
      this._bufferedEvents = [];
    };
    DelayedStream.prototype.pipe = function() {
      var r = Stream.prototype.pipe.apply(this, arguments);
      this.resume();
      return r;
    };
    DelayedStream.prototype._handleEmit = function(args) {
      if (this._released) {
        this.emit.apply(this, args);
        return;
      }
      if (args[0] === "data") {
        this.dataSize += args[1].length;
        this._checkIfMaxDataSizeExceeded();
      }
      this._bufferedEvents.push(args);
    };
    DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
      if (this._maxDataSizeExceeded) {
        return;
      }
      if (this.dataSize <= this.maxDataSize) {
        return;
      }
      this._maxDataSizeExceeded = true;
      var message2 = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
      this.emit("error", new Error(message2));
    };
  }
});

// node_modules/combined-stream/lib/combined_stream.js
var require_combined_stream = __commonJS({
  "node_modules/combined-stream/lib/combined_stream.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var util = require("util");
    var Stream = require("stream").Stream;
    var DelayedStream = require_delayed_stream();
    module2.exports = CombinedStream;
    function CombinedStream() {
      this.writable = false;
      this.readable = true;
      this.dataSize = 0;
      this.maxDataSize = 2 * 1024 * 1024;
      this.pauseStreams = true;
      this._released = false;
      this._streams = [];
      this._currentStream = null;
      this._insideLoop = false;
      this._pendingNext = false;
    }
    util.inherits(CombinedStream, Stream);
    CombinedStream.create = function(options) {
      var combinedStream = new this();
      options = options || {};
      for (var option in options) {
        combinedStream[option] = options[option];
      }
      return combinedStream;
    };
    CombinedStream.isStreamLike = function(stream) {
      return typeof stream !== "function" && typeof stream !== "string" && typeof stream !== "boolean" && typeof stream !== "number" && !Buffer.isBuffer(stream);
    };
    CombinedStream.prototype.append = function(stream) {
      var isStreamLike = CombinedStream.isStreamLike(stream);
      if (isStreamLike) {
        if (!(stream instanceof DelayedStream)) {
          var newStream = DelayedStream.create(stream, {
            maxDataSize: Infinity,
            pauseStream: this.pauseStreams
          });
          stream.on("data", this._checkDataSize.bind(this));
          stream = newStream;
        }
        this._handleErrors(stream);
        if (this.pauseStreams) {
          stream.pause();
        }
      }
      this._streams.push(stream);
      return this;
    };
    CombinedStream.prototype.pipe = function(dest, options) {
      Stream.prototype.pipe.call(this, dest, options);
      this.resume();
      return dest;
    };
    CombinedStream.prototype._getNext = function() {
      this._currentStream = null;
      if (this._insideLoop) {
        this._pendingNext = true;
        return;
      }
      this._insideLoop = true;
      try {
        do {
          this._pendingNext = false;
          this._realGetNext();
        } while (this._pendingNext);
      } finally {
        this._insideLoop = false;
      }
    };
    CombinedStream.prototype._realGetNext = function() {
      var stream = this._streams.shift();
      if (typeof stream == "undefined") {
        this.end();
        return;
      }
      if (typeof stream !== "function") {
        this._pipeNext(stream);
        return;
      }
      var getStream = stream;
      getStream(function(stream2) {
        var isStreamLike = CombinedStream.isStreamLike(stream2);
        if (isStreamLike) {
          stream2.on("data", this._checkDataSize.bind(this));
          this._handleErrors(stream2);
        }
        this._pipeNext(stream2);
      }.bind(this));
    };
    CombinedStream.prototype._pipeNext = function(stream) {
      this._currentStream = stream;
      var isStreamLike = CombinedStream.isStreamLike(stream);
      if (isStreamLike) {
        stream.on("end", this._getNext.bind(this));
        stream.pipe(this, { end: false });
        return;
      }
      var value = stream;
      this.write(value);
      this._getNext();
    };
    CombinedStream.prototype._handleErrors = function(stream) {
      var self = this;
      stream.on("error", function(err) {
        self._emitError(err);
      });
    };
    CombinedStream.prototype.write = function(data) {
      this.emit("data", data);
    };
    CombinedStream.prototype.pause = function() {
      if (!this.pauseStreams) {
        return;
      }
      if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function") this._currentStream.pause();
      this.emit("pause");
    };
    CombinedStream.prototype.resume = function() {
      if (!this._released) {
        this._released = true;
        this.writable = true;
        this._getNext();
      }
      if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function") this._currentStream.resume();
      this.emit("resume");
    };
    CombinedStream.prototype.end = function() {
      this._reset();
      this.emit("end");
    };
    CombinedStream.prototype.destroy = function() {
      this._reset();
      this.emit("close");
    };
    CombinedStream.prototype._reset = function() {
      this.writable = false;
      this._streams = [];
      this._currentStream = null;
    };
    CombinedStream.prototype._checkDataSize = function() {
      this._updateDataSize();
      if (this.dataSize <= this.maxDataSize) {
        return;
      }
      var message2 = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
      this._emitError(new Error(message2));
    };
    CombinedStream.prototype._updateDataSize = function() {
      this.dataSize = 0;
      var self = this;
      this._streams.forEach(function(stream) {
        if (!stream.dataSize) {
          return;
        }
        self.dataSize += stream.dataSize;
      });
      if (this._currentStream && this._currentStream.dataSize) {
        this.dataSize += this._currentStream.dataSize;
      }
    };
    CombinedStream.prototype._emitError = function(err) {
      this._reset();
      this.emit("error", err);
    };
  }
});

// node_modules/mime-db/db.json
var require_db = __commonJS({
  "node_modules/mime-db/db.json"(exports2, module2) {
    module2.exports = {
      "application/1d-interleaved-parityfec": {
        source: "iana"
      },
      "application/3gpdash-qoe-report+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/3gpp-ims+xml": {
        source: "iana",
        compressible: true
      },
      "application/3gpphal+json": {
        source: "iana",
        compressible: true
      },
      "application/3gpphalforms+json": {
        source: "iana",
        compressible: true
      },
      "application/a2l": {
        source: "iana"
      },
      "application/ace+cbor": {
        source: "iana"
      },
      "application/activemessage": {
        source: "iana"
      },
      "application/activity+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-directory+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcost+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcostparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointprop+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointpropparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-error+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamcontrol+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamparams+json": {
        source: "iana",
        compressible: true
      },
      "application/aml": {
        source: "iana"
      },
      "application/andrew-inset": {
        source: "iana",
        extensions: ["ez"]
      },
      "application/applefile": {
        source: "iana"
      },
      "application/applixware": {
        source: "apache",
        extensions: ["aw"]
      },
      "application/at+jwt": {
        source: "iana"
      },
      "application/atf": {
        source: "iana"
      },
      "application/atfx": {
        source: "iana"
      },
      "application/atom+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atom"]
      },
      "application/atomcat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomcat"]
      },
      "application/atomdeleted+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomdeleted"]
      },
      "application/atomicmail": {
        source: "iana"
      },
      "application/atomsvc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomsvc"]
      },
      "application/atsc-dwd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dwd"]
      },
      "application/atsc-dynamic-event-message": {
        source: "iana"
      },
      "application/atsc-held+xml": {
        source: "iana",
        compressible: true,
        extensions: ["held"]
      },
      "application/atsc-rdt+json": {
        source: "iana",
        compressible: true
      },
      "application/atsc-rsat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsat"]
      },
      "application/atxml": {
        source: "iana"
      },
      "application/auth-policy+xml": {
        source: "iana",
        compressible: true
      },
      "application/bacnet-xdd+zip": {
        source: "iana",
        compressible: false
      },
      "application/batch-smtp": {
        source: "iana"
      },
      "application/bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/beep+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/calendar+json": {
        source: "iana",
        compressible: true
      },
      "application/calendar+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xcs"]
      },
      "application/call-completion": {
        source: "iana"
      },
      "application/cals-1840": {
        source: "iana"
      },
      "application/captive+json": {
        source: "iana",
        compressible: true
      },
      "application/cbor": {
        source: "iana"
      },
      "application/cbor-seq": {
        source: "iana"
      },
      "application/cccex": {
        source: "iana"
      },
      "application/ccmp+xml": {
        source: "iana",
        compressible: true
      },
      "application/ccxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ccxml"]
      },
      "application/cdfx+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdfx"]
      },
      "application/cdmi-capability": {
        source: "iana",
        extensions: ["cdmia"]
      },
      "application/cdmi-container": {
        source: "iana",
        extensions: ["cdmic"]
      },
      "application/cdmi-domain": {
        source: "iana",
        extensions: ["cdmid"]
      },
      "application/cdmi-object": {
        source: "iana",
        extensions: ["cdmio"]
      },
      "application/cdmi-queue": {
        source: "iana",
        extensions: ["cdmiq"]
      },
      "application/cdni": {
        source: "iana"
      },
      "application/cea": {
        source: "iana"
      },
      "application/cea-2018+xml": {
        source: "iana",
        compressible: true
      },
      "application/cellml+xml": {
        source: "iana",
        compressible: true
      },
      "application/cfw": {
        source: "iana"
      },
      "application/city+json": {
        source: "iana",
        compressible: true
      },
      "application/clr": {
        source: "iana"
      },
      "application/clue+xml": {
        source: "iana",
        compressible: true
      },
      "application/clue_info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cms": {
        source: "iana"
      },
      "application/cnrp+xml": {
        source: "iana",
        compressible: true
      },
      "application/coap-group+json": {
        source: "iana",
        compressible: true
      },
      "application/coap-payload": {
        source: "iana"
      },
      "application/commonground": {
        source: "iana"
      },
      "application/conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cose": {
        source: "iana"
      },
      "application/cose-key": {
        source: "iana"
      },
      "application/cose-key-set": {
        source: "iana"
      },
      "application/cpl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cpl"]
      },
      "application/csrattrs": {
        source: "iana"
      },
      "application/csta+xml": {
        source: "iana",
        compressible: true
      },
      "application/cstadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/csvm+json": {
        source: "iana",
        compressible: true
      },
      "application/cu-seeme": {
        source: "apache",
        extensions: ["cu"]
      },
      "application/cwt": {
        source: "iana"
      },
      "application/cybercash": {
        source: "iana"
      },
      "application/dart": {
        compressible: true
      },
      "application/dash+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpd"]
      },
      "application/dash-patch+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpp"]
      },
      "application/dashdelta": {
        source: "iana"
      },
      "application/davmount+xml": {
        source: "iana",
        compressible: true,
        extensions: ["davmount"]
      },
      "application/dca-rft": {
        source: "iana"
      },
      "application/dcd": {
        source: "iana"
      },
      "application/dec-dx": {
        source: "iana"
      },
      "application/dialog-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/dicom": {
        source: "iana"
      },
      "application/dicom+json": {
        source: "iana",
        compressible: true
      },
      "application/dicom+xml": {
        source: "iana",
        compressible: true
      },
      "application/dii": {
        source: "iana"
      },
      "application/dit": {
        source: "iana"
      },
      "application/dns": {
        source: "iana"
      },
      "application/dns+json": {
        source: "iana",
        compressible: true
      },
      "application/dns-message": {
        source: "iana"
      },
      "application/docbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dbk"]
      },
      "application/dots+cbor": {
        source: "iana"
      },
      "application/dskpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/dssc+der": {
        source: "iana",
        extensions: ["dssc"]
      },
      "application/dssc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdssc"]
      },
      "application/dvcs": {
        source: "iana"
      },
      "application/ecmascript": {
        source: "iana",
        compressible: true,
        extensions: ["es", "ecma"]
      },
      "application/edi-consent": {
        source: "iana"
      },
      "application/edi-x12": {
        source: "iana",
        compressible: false
      },
      "application/edifact": {
        source: "iana",
        compressible: false
      },
      "application/efi": {
        source: "iana"
      },
      "application/elm+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/elm+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.cap+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/emergencycalldata.comment+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.control+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.deviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.ecall.msd": {
        source: "iana"
      },
      "application/emergencycalldata.providerinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.serviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.subscriberinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.veds+xml": {
        source: "iana",
        compressible: true
      },
      "application/emma+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emma"]
      },
      "application/emotionml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emotionml"]
      },
      "application/encaprtp": {
        source: "iana"
      },
      "application/epp+xml": {
        source: "iana",
        compressible: true
      },
      "application/epub+zip": {
        source: "iana",
        compressible: false,
        extensions: ["epub"]
      },
      "application/eshop": {
        source: "iana"
      },
      "application/exi": {
        source: "iana",
        extensions: ["exi"]
      },
      "application/expect-ct-report+json": {
        source: "iana",
        compressible: true
      },
      "application/express": {
        source: "iana",
        extensions: ["exp"]
      },
      "application/fastinfoset": {
        source: "iana"
      },
      "application/fastsoap": {
        source: "iana"
      },
      "application/fdt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fdt"]
      },
      "application/fhir+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fhir+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fido.trusted-apps+json": {
        compressible: true
      },
      "application/fits": {
        source: "iana"
      },
      "application/flexfec": {
        source: "iana"
      },
      "application/font-sfnt": {
        source: "iana"
      },
      "application/font-tdpfr": {
        source: "iana",
        extensions: ["pfr"]
      },
      "application/font-woff": {
        source: "iana",
        compressible: false
      },
      "application/framework-attributes+xml": {
        source: "iana",
        compressible: true
      },
      "application/geo+json": {
        source: "iana",
        compressible: true,
        extensions: ["geojson"]
      },
      "application/geo+json-seq": {
        source: "iana"
      },
      "application/geopackage+sqlite3": {
        source: "iana"
      },
      "application/geoxacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/gltf-buffer": {
        source: "iana"
      },
      "application/gml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["gml"]
      },
      "application/gpx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["gpx"]
      },
      "application/gxf": {
        source: "apache",
        extensions: ["gxf"]
      },
      "application/gzip": {
        source: "iana",
        compressible: false,
        extensions: ["gz"]
      },
      "application/h224": {
        source: "iana"
      },
      "application/held+xml": {
        source: "iana",
        compressible: true
      },
      "application/hjson": {
        extensions: ["hjson"]
      },
      "application/http": {
        source: "iana"
      },
      "application/hyperstudio": {
        source: "iana",
        extensions: ["stk"]
      },
      "application/ibe-key-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pkg-reply+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pp-data": {
        source: "iana"
      },
      "application/iges": {
        source: "iana"
      },
      "application/im-iscomposing+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/index": {
        source: "iana"
      },
      "application/index.cmd": {
        source: "iana"
      },
      "application/index.obj": {
        source: "iana"
      },
      "application/index.response": {
        source: "iana"
      },
      "application/index.vnd": {
        source: "iana"
      },
      "application/inkml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ink", "inkml"]
      },
      "application/iotp": {
        source: "iana"
      },
      "application/ipfix": {
        source: "iana",
        extensions: ["ipfix"]
      },
      "application/ipp": {
        source: "iana"
      },
      "application/isup": {
        source: "iana"
      },
      "application/its+xml": {
        source: "iana",
        compressible: true,
        extensions: ["its"]
      },
      "application/java-archive": {
        source: "apache",
        compressible: false,
        extensions: ["jar", "war", "ear"]
      },
      "application/java-serialized-object": {
        source: "apache",
        compressible: false,
        extensions: ["ser"]
      },
      "application/java-vm": {
        source: "apache",
        compressible: false,
        extensions: ["class"]
      },
      "application/javascript": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["js", "mjs"]
      },
      "application/jf2feed+json": {
        source: "iana",
        compressible: true
      },
      "application/jose": {
        source: "iana"
      },
      "application/jose+json": {
        source: "iana",
        compressible: true
      },
      "application/jrd+json": {
        source: "iana",
        compressible: true
      },
      "application/jscalendar+json": {
        source: "iana",
        compressible: true
      },
      "application/json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["json", "map"]
      },
      "application/json-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/json-seq": {
        source: "iana"
      },
      "application/json5": {
        extensions: ["json5"]
      },
      "application/jsonml+json": {
        source: "apache",
        compressible: true,
        extensions: ["jsonml"]
      },
      "application/jwk+json": {
        source: "iana",
        compressible: true
      },
      "application/jwk-set+json": {
        source: "iana",
        compressible: true
      },
      "application/jwt": {
        source: "iana"
      },
      "application/kpml-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/kpml-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/ld+json": {
        source: "iana",
        compressible: true,
        extensions: ["jsonld"]
      },
      "application/lgr+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lgr"]
      },
      "application/link-format": {
        source: "iana"
      },
      "application/load-control+xml": {
        source: "iana",
        compressible: true
      },
      "application/lost+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lostxml"]
      },
      "application/lostsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/lpf+zip": {
        source: "iana",
        compressible: false
      },
      "application/lxf": {
        source: "iana"
      },
      "application/mac-binhex40": {
        source: "iana",
        extensions: ["hqx"]
      },
      "application/mac-compactpro": {
        source: "apache",
        extensions: ["cpt"]
      },
      "application/macwriteii": {
        source: "iana"
      },
      "application/mads+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mads"]
      },
      "application/manifest+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["webmanifest"]
      },
      "application/marc": {
        source: "iana",
        extensions: ["mrc"]
      },
      "application/marcxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mrcx"]
      },
      "application/mathematica": {
        source: "iana",
        extensions: ["ma", "nb", "mb"]
      },
      "application/mathml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mathml"]
      },
      "application/mathml-content+xml": {
        source: "iana",
        compressible: true
      },
      "application/mathml-presentation+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-associated-procedure-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-deregister+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-envelope+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-protection-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-reception-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-schedule+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-user-service-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbox": {
        source: "iana",
        extensions: ["mbox"]
      },
      "application/media-policy-dataset+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpf"]
      },
      "application/media_control+xml": {
        source: "iana",
        compressible: true
      },
      "application/mediaservercontrol+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mscml"]
      },
      "application/merge-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/metalink+xml": {
        source: "apache",
        compressible: true,
        extensions: ["metalink"]
      },
      "application/metalink4+xml": {
        source: "iana",
        compressible: true,
        extensions: ["meta4"]
      },
      "application/mets+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mets"]
      },
      "application/mf4": {
        source: "iana"
      },
      "application/mikey": {
        source: "iana"
      },
      "application/mipc": {
        source: "iana"
      },
      "application/missing-blocks+cbor-seq": {
        source: "iana"
      },
      "application/mmt-aei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["maei"]
      },
      "application/mmt-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musd"]
      },
      "application/mods+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mods"]
      },
      "application/moss-keys": {
        source: "iana"
      },
      "application/moss-signature": {
        source: "iana"
      },
      "application/mosskey-data": {
        source: "iana"
      },
      "application/mosskey-request": {
        source: "iana"
      },
      "application/mp21": {
        source: "iana",
        extensions: ["m21", "mp21"]
      },
      "application/mp4": {
        source: "iana",
        extensions: ["mp4s", "m4p"]
      },
      "application/mpeg4-generic": {
        source: "iana"
      },
      "application/mpeg4-iod": {
        source: "iana"
      },
      "application/mpeg4-iod-xmt": {
        source: "iana"
      },
      "application/mrb-consumer+xml": {
        source: "iana",
        compressible: true
      },
      "application/mrb-publish+xml": {
        source: "iana",
        compressible: true
      },
      "application/msc-ivr+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msc-mixer+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msword": {
        source: "iana",
        compressible: false,
        extensions: ["doc", "dot"]
      },
      "application/mud+json": {
        source: "iana",
        compressible: true
      },
      "application/multipart-core": {
        source: "iana"
      },
      "application/mxf": {
        source: "iana",
        extensions: ["mxf"]
      },
      "application/n-quads": {
        source: "iana",
        extensions: ["nq"]
      },
      "application/n-triples": {
        source: "iana",
        extensions: ["nt"]
      },
      "application/nasdata": {
        source: "iana"
      },
      "application/news-checkgroups": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-groupinfo": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-transmission": {
        source: "iana"
      },
      "application/nlsml+xml": {
        source: "iana",
        compressible: true
      },
      "application/node": {
        source: "iana",
        extensions: ["cjs"]
      },
      "application/nss": {
        source: "iana"
      },
      "application/oauth-authz-req+jwt": {
        source: "iana"
      },
      "application/oblivious-dns-message": {
        source: "iana"
      },
      "application/ocsp-request": {
        source: "iana"
      },
      "application/ocsp-response": {
        source: "iana"
      },
      "application/octet-stream": {
        source: "iana",
        compressible: false,
        extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
      },
      "application/oda": {
        source: "iana",
        extensions: ["oda"]
      },
      "application/odm+xml": {
        source: "iana",
        compressible: true
      },
      "application/odx": {
        source: "iana"
      },
      "application/oebps-package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["opf"]
      },
      "application/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogx"]
      },
      "application/omdoc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["omdoc"]
      },
      "application/onenote": {
        source: "apache",
        extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
      },
      "application/opc-nodeset+xml": {
        source: "iana",
        compressible: true
      },
      "application/oscore": {
        source: "iana"
      },
      "application/oxps": {
        source: "iana",
        extensions: ["oxps"]
      },
      "application/p21": {
        source: "iana"
      },
      "application/p21+zip": {
        source: "iana",
        compressible: false
      },
      "application/p2p-overlay+xml": {
        source: "iana",
        compressible: true,
        extensions: ["relo"]
      },
      "application/parityfec": {
        source: "iana"
      },
      "application/passport": {
        source: "iana"
      },
      "application/patch-ops-error+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xer"]
      },
      "application/pdf": {
        source: "iana",
        compressible: false,
        extensions: ["pdf"]
      },
      "application/pdx": {
        source: "iana"
      },
      "application/pem-certificate-chain": {
        source: "iana"
      },
      "application/pgp-encrypted": {
        source: "iana",
        compressible: false,
        extensions: ["pgp"]
      },
      "application/pgp-keys": {
        source: "iana",
        extensions: ["asc"]
      },
      "application/pgp-signature": {
        source: "iana",
        extensions: ["asc", "sig"]
      },
      "application/pics-rules": {
        source: "apache",
        extensions: ["prf"]
      },
      "application/pidf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pidf-diff+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pkcs10": {
        source: "iana",
        extensions: ["p10"]
      },
      "application/pkcs12": {
        source: "iana"
      },
      "application/pkcs7-mime": {
        source: "iana",
        extensions: ["p7m", "p7c"]
      },
      "application/pkcs7-signature": {
        source: "iana",
        extensions: ["p7s"]
      },
      "application/pkcs8": {
        source: "iana",
        extensions: ["p8"]
      },
      "application/pkcs8-encrypted": {
        source: "iana"
      },
      "application/pkix-attr-cert": {
        source: "iana",
        extensions: ["ac"]
      },
      "application/pkix-cert": {
        source: "iana",
        extensions: ["cer"]
      },
      "application/pkix-crl": {
        source: "iana",
        extensions: ["crl"]
      },
      "application/pkix-pkipath": {
        source: "iana",
        extensions: ["pkipath"]
      },
      "application/pkixcmp": {
        source: "iana",
        extensions: ["pki"]
      },
      "application/pls+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pls"]
      },
      "application/poc-settings+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/postscript": {
        source: "iana",
        compressible: true,
        extensions: ["ai", "eps", "ps"]
      },
      "application/ppsp-tracker+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+xml": {
        source: "iana",
        compressible: true
      },
      "application/provenance+xml": {
        source: "iana",
        compressible: true,
        extensions: ["provx"]
      },
      "application/prs.alvestrand.titrax-sheet": {
        source: "iana"
      },
      "application/prs.cww": {
        source: "iana",
        extensions: ["cww"]
      },
      "application/prs.cyn": {
        source: "iana",
        charset: "7-BIT"
      },
      "application/prs.hpub+zip": {
        source: "iana",
        compressible: false
      },
      "application/prs.nprend": {
        source: "iana"
      },
      "application/prs.plucker": {
        source: "iana"
      },
      "application/prs.rdf-xml-crypt": {
        source: "iana"
      },
      "application/prs.xsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/pskc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pskcxml"]
      },
      "application/pvd+json": {
        source: "iana",
        compressible: true
      },
      "application/qsig": {
        source: "iana"
      },
      "application/raml+yaml": {
        compressible: true,
        extensions: ["raml"]
      },
      "application/raptorfec": {
        source: "iana"
      },
      "application/rdap+json": {
        source: "iana",
        compressible: true
      },
      "application/rdf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rdf", "owl"]
      },
      "application/reginfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rif"]
      },
      "application/relax-ng-compact-syntax": {
        source: "iana",
        extensions: ["rnc"]
      },
      "application/remote-printing": {
        source: "iana"
      },
      "application/reputon+json": {
        source: "iana",
        compressible: true
      },
      "application/resource-lists+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rl"]
      },
      "application/resource-lists-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rld"]
      },
      "application/rfc+xml": {
        source: "iana",
        compressible: true
      },
      "application/riscos": {
        source: "iana"
      },
      "application/rlmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/rls-services+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rs"]
      },
      "application/route-apd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rapd"]
      },
      "application/route-s-tsid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sls"]
      },
      "application/route-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rusd"]
      },
      "application/rpki-ghostbusters": {
        source: "iana",
        extensions: ["gbr"]
      },
      "application/rpki-manifest": {
        source: "iana",
        extensions: ["mft"]
      },
      "application/rpki-publication": {
        source: "iana"
      },
      "application/rpki-roa": {
        source: "iana",
        extensions: ["roa"]
      },
      "application/rpki-updown": {
        source: "iana"
      },
      "application/rsd+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rsd"]
      },
      "application/rss+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rss"]
      },
      "application/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "application/rtploopback": {
        source: "iana"
      },
      "application/rtx": {
        source: "iana"
      },
      "application/samlassertion+xml": {
        source: "iana",
        compressible: true
      },
      "application/samlmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/sarif+json": {
        source: "iana",
        compressible: true
      },
      "application/sarif-external-properties+json": {
        source: "iana",
        compressible: true
      },
      "application/sbe": {
        source: "iana"
      },
      "application/sbml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sbml"]
      },
      "application/scaip+xml": {
        source: "iana",
        compressible: true
      },
      "application/scim+json": {
        source: "iana",
        compressible: true
      },
      "application/scvp-cv-request": {
        source: "iana",
        extensions: ["scq"]
      },
      "application/scvp-cv-response": {
        source: "iana",
        extensions: ["scs"]
      },
      "application/scvp-vp-request": {
        source: "iana",
        extensions: ["spq"]
      },
      "application/scvp-vp-response": {
        source: "iana",
        extensions: ["spp"]
      },
      "application/sdp": {
        source: "iana",
        extensions: ["sdp"]
      },
      "application/secevent+jwt": {
        source: "iana"
      },
      "application/senml+cbor": {
        source: "iana"
      },
      "application/senml+json": {
        source: "iana",
        compressible: true
      },
      "application/senml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["senmlx"]
      },
      "application/senml-etch+cbor": {
        source: "iana"
      },
      "application/senml-etch+json": {
        source: "iana",
        compressible: true
      },
      "application/senml-exi": {
        source: "iana"
      },
      "application/sensml+cbor": {
        source: "iana"
      },
      "application/sensml+json": {
        source: "iana",
        compressible: true
      },
      "application/sensml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sensmlx"]
      },
      "application/sensml-exi": {
        source: "iana"
      },
      "application/sep+xml": {
        source: "iana",
        compressible: true
      },
      "application/sep-exi": {
        source: "iana"
      },
      "application/session-info": {
        source: "iana"
      },
      "application/set-payment": {
        source: "iana"
      },
      "application/set-payment-initiation": {
        source: "iana",
        extensions: ["setpay"]
      },
      "application/set-registration": {
        source: "iana"
      },
      "application/set-registration-initiation": {
        source: "iana",
        extensions: ["setreg"]
      },
      "application/sgml": {
        source: "iana"
      },
      "application/sgml-open-catalog": {
        source: "iana"
      },
      "application/shf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["shf"]
      },
      "application/sieve": {
        source: "iana",
        extensions: ["siv", "sieve"]
      },
      "application/simple-filter+xml": {
        source: "iana",
        compressible: true
      },
      "application/simple-message-summary": {
        source: "iana"
      },
      "application/simplesymbolcontainer": {
        source: "iana"
      },
      "application/sipc": {
        source: "iana"
      },
      "application/slate": {
        source: "iana"
      },
      "application/smil": {
        source: "iana"
      },
      "application/smil+xml": {
        source: "iana",
        compressible: true,
        extensions: ["smi", "smil"]
      },
      "application/smpte336m": {
        source: "iana"
      },
      "application/soap+fastinfoset": {
        source: "iana"
      },
      "application/soap+xml": {
        source: "iana",
        compressible: true
      },
      "application/sparql-query": {
        source: "iana",
        extensions: ["rq"]
      },
      "application/sparql-results+xml": {
        source: "iana",
        compressible: true,
        extensions: ["srx"]
      },
      "application/spdx+json": {
        source: "iana",
        compressible: true
      },
      "application/spirits-event+xml": {
        source: "iana",
        compressible: true
      },
      "application/sql": {
        source: "iana"
      },
      "application/srgs": {
        source: "iana",
        extensions: ["gram"]
      },
      "application/srgs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["grxml"]
      },
      "application/sru+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sru"]
      },
      "application/ssdl+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ssdl"]
      },
      "application/ssml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ssml"]
      },
      "application/stix+json": {
        source: "iana",
        compressible: true
      },
      "application/swid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["swidtag"]
      },
      "application/tamp-apex-update": {
        source: "iana"
      },
      "application/tamp-apex-update-confirm": {
        source: "iana"
      },
      "application/tamp-community-update": {
        source: "iana"
      },
      "application/tamp-community-update-confirm": {
        source: "iana"
      },
      "application/tamp-error": {
        source: "iana"
      },
      "application/tamp-sequence-adjust": {
        source: "iana"
      },
      "application/tamp-sequence-adjust-confirm": {
        source: "iana"
      },
      "application/tamp-status-query": {
        source: "iana"
      },
      "application/tamp-status-response": {
        source: "iana"
      },
      "application/tamp-update": {
        source: "iana"
      },
      "application/tamp-update-confirm": {
        source: "iana"
      },
      "application/tar": {
        compressible: true
      },
      "application/taxii+json": {
        source: "iana",
        compressible: true
      },
      "application/td+json": {
        source: "iana",
        compressible: true
      },
      "application/tei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tei", "teicorpus"]
      },
      "application/tetra_isi": {
        source: "iana"
      },
      "application/thraud+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tfi"]
      },
      "application/timestamp-query": {
        source: "iana"
      },
      "application/timestamp-reply": {
        source: "iana"
      },
      "application/timestamped-data": {
        source: "iana",
        extensions: ["tsd"]
      },
      "application/tlsrpt+gzip": {
        source: "iana"
      },
      "application/tlsrpt+json": {
        source: "iana",
        compressible: true
      },
      "application/tnauthlist": {
        source: "iana"
      },
      "application/token-introspection+jwt": {
        source: "iana"
      },
      "application/toml": {
        compressible: true,
        extensions: ["toml"]
      },
      "application/trickle-ice-sdpfrag": {
        source: "iana"
      },
      "application/trig": {
        source: "iana",
        extensions: ["trig"]
      },
      "application/ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ttml"]
      },
      "application/tve-trigger": {
        source: "iana"
      },
      "application/tzif": {
        source: "iana"
      },
      "application/tzif-leap": {
        source: "iana"
      },
      "application/ubjson": {
        compressible: false,
        extensions: ["ubj"]
      },
      "application/ulpfec": {
        source: "iana"
      },
      "application/urc-grpsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/urc-ressheet+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsheet"]
      },
      "application/urc-targetdesc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["td"]
      },
      "application/urc-uisocketdesc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vcard+json": {
        source: "iana",
        compressible: true
      },
      "application/vcard+xml": {
        source: "iana",
        compressible: true
      },
      "application/vemmi": {
        source: "iana"
      },
      "application/vividence.scriptfile": {
        source: "apache"
      },
      "application/vnd.1000minds.decision-model+xml": {
        source: "iana",
        compressible: true,
        extensions: ["1km"]
      },
      "application/vnd.3gpp-prose+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-prose-pc3ch+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-v2x-local-service-information": {
        source: "iana"
      },
      "application/vnd.3gpp.5gnas": {
        source: "iana"
      },
      "application/vnd.3gpp.access-transfer-events+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.bsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gmop+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gtpc": {
        source: "iana"
      },
      "application/vnd.3gpp.interworking-data": {
        source: "iana"
      },
      "application/vnd.3gpp.lpp": {
        source: "iana"
      },
      "application/vnd.3gpp.mc-signalling-ear": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-payload": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-signalling": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-floor-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-signed+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-init-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-transmission-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mid-call+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ngap": {
        source: "iana"
      },
      "application/vnd.3gpp.pfcp": {
        source: "iana"
      },
      "application/vnd.3gpp.pic-bw-large": {
        source: "iana",
        extensions: ["plb"]
      },
      "application/vnd.3gpp.pic-bw-small": {
        source: "iana",
        extensions: ["psb"]
      },
      "application/vnd.3gpp.pic-bw-var": {
        source: "iana",
        extensions: ["pvb"]
      },
      "application/vnd.3gpp.s1ap": {
        source: "iana"
      },
      "application/vnd.3gpp.sms": {
        source: "iana"
      },
      "application/vnd.3gpp.sms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-ext+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.state-and-event-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ussd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.bcmcsinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.sms": {
        source: "iana"
      },
      "application/vnd.3gpp2.tcap": {
        source: "iana",
        extensions: ["tcap"]
      },
      "application/vnd.3lightssoftware.imagescal": {
        source: "iana"
      },
      "application/vnd.3m.post-it-notes": {
        source: "iana",
        extensions: ["pwn"]
      },
      "application/vnd.accpac.simply.aso": {
        source: "iana",
        extensions: ["aso"]
      },
      "application/vnd.accpac.simply.imp": {
        source: "iana",
        extensions: ["imp"]
      },
      "application/vnd.acucobol": {
        source: "iana",
        extensions: ["acu"]
      },
      "application/vnd.acucorp": {
        source: "iana",
        extensions: ["atc", "acutc"]
      },
      "application/vnd.adobe.air-application-installer-package+zip": {
        source: "apache",
        compressible: false,
        extensions: ["air"]
      },
      "application/vnd.adobe.flash.movie": {
        source: "iana"
      },
      "application/vnd.adobe.formscentral.fcdt": {
        source: "iana",
        extensions: ["fcdt"]
      },
      "application/vnd.adobe.fxp": {
        source: "iana",
        extensions: ["fxp", "fxpl"]
      },
      "application/vnd.adobe.partial-upload": {
        source: "iana"
      },
      "application/vnd.adobe.xdp+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdp"]
      },
      "application/vnd.adobe.xfdf": {
        source: "iana",
        extensions: ["xfdf"]
      },
      "application/vnd.aether.imp": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata-pagedef": {
        source: "iana"
      },
      "application/vnd.afpc.cmoca-cmresource": {
        source: "iana"
      },
      "application/vnd.afpc.foca-charset": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codedfont": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codepage": {
        source: "iana"
      },
      "application/vnd.afpc.modca": {
        source: "iana"
      },
      "application/vnd.afpc.modca-cmtable": {
        source: "iana"
      },
      "application/vnd.afpc.modca-formdef": {
        source: "iana"
      },
      "application/vnd.afpc.modca-mediummap": {
        source: "iana"
      },
      "application/vnd.afpc.modca-objectcontainer": {
        source: "iana"
      },
      "application/vnd.afpc.modca-overlay": {
        source: "iana"
      },
      "application/vnd.afpc.modca-pagesegment": {
        source: "iana"
      },
      "application/vnd.age": {
        source: "iana",
        extensions: ["age"]
      },
      "application/vnd.ah-barcode": {
        source: "iana"
      },
      "application/vnd.ahead.space": {
        source: "iana",
        extensions: ["ahead"]
      },
      "application/vnd.airzip.filesecure.azf": {
        source: "iana",
        extensions: ["azf"]
      },
      "application/vnd.airzip.filesecure.azs": {
        source: "iana",
        extensions: ["azs"]
      },
      "application/vnd.amadeus+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.amazon.ebook": {
        source: "apache",
        extensions: ["azw"]
      },
      "application/vnd.amazon.mobi8-ebook": {
        source: "iana"
      },
      "application/vnd.americandynamics.acc": {
        source: "iana",
        extensions: ["acc"]
      },
      "application/vnd.amiga.ami": {
        source: "iana",
        extensions: ["ami"]
      },
      "application/vnd.amundsen.maze+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.android.ota": {
        source: "iana"
      },
      "application/vnd.android.package-archive": {
        source: "apache",
        compressible: false,
        extensions: ["apk"]
      },
      "application/vnd.anki": {
        source: "iana"
      },
      "application/vnd.anser-web-certificate-issue-initiation": {
        source: "iana",
        extensions: ["cii"]
      },
      "application/vnd.anser-web-funds-transfer-initiation": {
        source: "apache",
        extensions: ["fti"]
      },
      "application/vnd.antix.game-component": {
        source: "iana",
        extensions: ["atx"]
      },
      "application/vnd.apache.arrow.file": {
        source: "iana"
      },
      "application/vnd.apache.arrow.stream": {
        source: "iana"
      },
      "application/vnd.apache.thrift.binary": {
        source: "iana"
      },
      "application/vnd.apache.thrift.compact": {
        source: "iana"
      },
      "application/vnd.apache.thrift.json": {
        source: "iana"
      },
      "application/vnd.api+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.aplextor.warrp+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apothekende.reservation+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apple.installer+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpkg"]
      },
      "application/vnd.apple.keynote": {
        source: "iana",
        extensions: ["key"]
      },
      "application/vnd.apple.mpegurl": {
        source: "iana",
        extensions: ["m3u8"]
      },
      "application/vnd.apple.numbers": {
        source: "iana",
        extensions: ["numbers"]
      },
      "application/vnd.apple.pages": {
        source: "iana",
        extensions: ["pages"]
      },
      "application/vnd.apple.pkpass": {
        compressible: false,
        extensions: ["pkpass"]
      },
      "application/vnd.arastra.swi": {
        source: "iana"
      },
      "application/vnd.aristanetworks.swi": {
        source: "iana",
        extensions: ["swi"]
      },
      "application/vnd.artisan+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.artsquare": {
        source: "iana"
      },
      "application/vnd.astraea-software.iota": {
        source: "iana",
        extensions: ["iota"]
      },
      "application/vnd.audiograph": {
        source: "iana",
        extensions: ["aep"]
      },
      "application/vnd.autopackage": {
        source: "iana"
      },
      "application/vnd.avalon+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.avistar+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.balsamiq.bmml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["bmml"]
      },
      "application/vnd.balsamiq.bmpr": {
        source: "iana"
      },
      "application/vnd.banana-accounting": {
        source: "iana"
      },
      "application/vnd.bbf.usp.error": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bekitzur-stech+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bint.med-content": {
        source: "iana"
      },
      "application/vnd.biopax.rdf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.blink-idb-value-wrapper": {
        source: "iana"
      },
      "application/vnd.blueice.multipass": {
        source: "iana",
        extensions: ["mpm"]
      },
      "application/vnd.bluetooth.ep.oob": {
        source: "iana"
      },
      "application/vnd.bluetooth.le.oob": {
        source: "iana"
      },
      "application/vnd.bmi": {
        source: "iana",
        extensions: ["bmi"]
      },
      "application/vnd.bpf": {
        source: "iana"
      },
      "application/vnd.bpf3": {
        source: "iana"
      },
      "application/vnd.businessobjects": {
        source: "iana",
        extensions: ["rep"]
      },
      "application/vnd.byu.uapi+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cab-jscript": {
        source: "iana"
      },
      "application/vnd.canon-cpdl": {
        source: "iana"
      },
      "application/vnd.canon-lips": {
        source: "iana"
      },
      "application/vnd.capasystems-pg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cendio.thinlinc.clientconf": {
        source: "iana"
      },
      "application/vnd.century-systems.tcp_stream": {
        source: "iana"
      },
      "application/vnd.chemdraw+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdxml"]
      },
      "application/vnd.chess-pgn": {
        source: "iana"
      },
      "application/vnd.chipnuts.karaoke-mmd": {
        source: "iana",
        extensions: ["mmd"]
      },
      "application/vnd.ciedi": {
        source: "iana"
      },
      "application/vnd.cinderella": {
        source: "iana",
        extensions: ["cdy"]
      },
      "application/vnd.cirpack.isdn-ext": {
        source: "iana"
      },
      "application/vnd.citationstyles.style+xml": {
        source: "iana",
        compressible: true,
        extensions: ["csl"]
      },
      "application/vnd.claymore": {
        source: "iana",
        extensions: ["cla"]
      },
      "application/vnd.cloanto.rp9": {
        source: "iana",
        extensions: ["rp9"]
      },
      "application/vnd.clonk.c4group": {
        source: "iana",
        extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
      },
      "application/vnd.cluetrust.cartomobile-config": {
        source: "iana",
        extensions: ["c11amc"]
      },
      "application/vnd.cluetrust.cartomobile-config-pkg": {
        source: "iana",
        extensions: ["c11amz"]
      },
      "application/vnd.coffeescript": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet-template": {
        source: "iana"
      },
      "application/vnd.collection+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.doc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.next+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.comicbook+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.comicbook-rar": {
        source: "iana"
      },
      "application/vnd.commerce-battelle": {
        source: "iana"
      },
      "application/vnd.commonspace": {
        source: "iana",
        extensions: ["csp"]
      },
      "application/vnd.contact.cmsg": {
        source: "iana",
        extensions: ["cdbcmsg"]
      },
      "application/vnd.coreos.ignition+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cosmocaller": {
        source: "iana",
        extensions: ["cmc"]
      },
      "application/vnd.crick.clicker": {
        source: "iana",
        extensions: ["clkx"]
      },
      "application/vnd.crick.clicker.keyboard": {
        source: "iana",
        extensions: ["clkk"]
      },
      "application/vnd.crick.clicker.palette": {
        source: "iana",
        extensions: ["clkp"]
      },
      "application/vnd.crick.clicker.template": {
        source: "iana",
        extensions: ["clkt"]
      },
      "application/vnd.crick.clicker.wordbank": {
        source: "iana",
        extensions: ["clkw"]
      },
      "application/vnd.criticaltools.wbs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wbs"]
      },
      "application/vnd.cryptii.pipe+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.crypto-shade-file": {
        source: "iana"
      },
      "application/vnd.cryptomator.encrypted": {
        source: "iana"
      },
      "application/vnd.cryptomator.vault": {
        source: "iana"
      },
      "application/vnd.ctc-posml": {
        source: "iana",
        extensions: ["pml"]
      },
      "application/vnd.ctct.ws+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cups-pdf": {
        source: "iana"
      },
      "application/vnd.cups-postscript": {
        source: "iana"
      },
      "application/vnd.cups-ppd": {
        source: "iana",
        extensions: ["ppd"]
      },
      "application/vnd.cups-raster": {
        source: "iana"
      },
      "application/vnd.cups-raw": {
        source: "iana"
      },
      "application/vnd.curl": {
        source: "iana"
      },
      "application/vnd.curl.car": {
        source: "apache",
        extensions: ["car"]
      },
      "application/vnd.curl.pcurl": {
        source: "apache",
        extensions: ["pcurl"]
      },
      "application/vnd.cyan.dean.root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cybank": {
        source: "iana"
      },
      "application/vnd.cyclonedx+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cyclonedx+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.d2l.coursepackage1p0+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.d3m-dataset": {
        source: "iana"
      },
      "application/vnd.d3m-problem": {
        source: "iana"
      },
      "application/vnd.dart": {
        source: "iana",
        compressible: true,
        extensions: ["dart"]
      },
      "application/vnd.data-vision.rdz": {
        source: "iana",
        extensions: ["rdz"]
      },
      "application/vnd.datapackage+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dataresource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dbf": {
        source: "iana",
        extensions: ["dbf"]
      },
      "application/vnd.debian.binary-package": {
        source: "iana"
      },
      "application/vnd.dece.data": {
        source: "iana",
        extensions: ["uvf", "uvvf", "uvd", "uvvd"]
      },
      "application/vnd.dece.ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uvt", "uvvt"]
      },
      "application/vnd.dece.unspecified": {
        source: "iana",
        extensions: ["uvx", "uvvx"]
      },
      "application/vnd.dece.zip": {
        source: "iana",
        extensions: ["uvz", "uvvz"]
      },
      "application/vnd.denovo.fcselayout-link": {
        source: "iana",
        extensions: ["fe_launch"]
      },
      "application/vnd.desmume.movie": {
        source: "iana"
      },
      "application/vnd.dir-bi.plate-dl-nosuffix": {
        source: "iana"
      },
      "application/vnd.dm.delegation+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dna": {
        source: "iana",
        extensions: ["dna"]
      },
      "application/vnd.document+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dolby.mlp": {
        source: "apache",
        extensions: ["mlp"]
      },
      "application/vnd.dolby.mobile.1": {
        source: "iana"
      },
      "application/vnd.dolby.mobile.2": {
        source: "iana"
      },
      "application/vnd.doremir.scorecloud-binary-document": {
        source: "iana"
      },
      "application/vnd.dpgraph": {
        source: "iana",
        extensions: ["dpg"]
      },
      "application/vnd.dreamfactory": {
        source: "iana",
        extensions: ["dfac"]
      },
      "application/vnd.drive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ds-keypoint": {
        source: "apache",
        extensions: ["kpxx"]
      },
      "application/vnd.dtg.local": {
        source: "iana"
      },
      "application/vnd.dtg.local.flash": {
        source: "iana"
      },
      "application/vnd.dtg.local.html": {
        source: "iana"
      },
      "application/vnd.dvb.ait": {
        source: "iana",
        extensions: ["ait"]
      },
      "application/vnd.dvb.dvbisl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.dvbj": {
        source: "iana"
      },
      "application/vnd.dvb.esgcontainer": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcdftnotifaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess2": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgpdd": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcroaming": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-base": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-enhancement": {
        source: "iana"
      },
      "application/vnd.dvb.notif-aggregate-root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-container+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-generic+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-msglist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-init+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.pfr": {
        source: "iana"
      },
      "application/vnd.dvb.service": {
        source: "iana",
        extensions: ["svc"]
      },
      "application/vnd.dxr": {
        source: "iana"
      },
      "application/vnd.dynageo": {
        source: "iana",
        extensions: ["geo"]
      },
      "application/vnd.dzr": {
        source: "iana"
      },
      "application/vnd.easykaraoke.cdgdownload": {
        source: "iana"
      },
      "application/vnd.ecdis-update": {
        source: "iana"
      },
      "application/vnd.ecip.rlp": {
        source: "iana"
      },
      "application/vnd.eclipse.ditto+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ecowin.chart": {
        source: "iana",
        extensions: ["mag"]
      },
      "application/vnd.ecowin.filerequest": {
        source: "iana"
      },
      "application/vnd.ecowin.fileupdate": {
        source: "iana"
      },
      "application/vnd.ecowin.series": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesrequest": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesupdate": {
        source: "iana"
      },
      "application/vnd.efi.img": {
        source: "iana"
      },
      "application/vnd.efi.iso": {
        source: "iana"
      },
      "application/vnd.emclient.accessrequest+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.enliven": {
        source: "iana",
        extensions: ["nml"]
      },
      "application/vnd.enphase.envoy": {
        source: "iana"
      },
      "application/vnd.eprints.data+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.epson.esf": {
        source: "iana",
        extensions: ["esf"]
      },
      "application/vnd.epson.msf": {
        source: "iana",
        extensions: ["msf"]
      },
      "application/vnd.epson.quickanime": {
        source: "iana",
        extensions: ["qam"]
      },
      "application/vnd.epson.salt": {
        source: "iana",
        extensions: ["slt"]
      },
      "application/vnd.epson.ssf": {
        source: "iana",
        extensions: ["ssf"]
      },
      "application/vnd.ericsson.quickcall": {
        source: "iana"
      },
      "application/vnd.espass-espass+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.eszigno3+xml": {
        source: "iana",
        compressible: true,
        extensions: ["es3", "et3"]
      },
      "application/vnd.etsi.aoc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.asic-e+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.asic-s+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.cug+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvcommand+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-bc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-cod+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-npvr+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvservice+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mcid+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mheg5": {
        source: "iana"
      },
      "application/vnd.etsi.overload-control-policy-dataset+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.pstn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.sci+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.simservs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.timestamp-token": {
        source: "iana"
      },
      "application/vnd.etsi.tsl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.tsl.der": {
        source: "iana"
      },
      "application/vnd.eu.kasparian.car+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.eudora.data": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.profile": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.settings": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.theme": {
        source: "iana"
      },
      "application/vnd.exstream-empower+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.exstream-package": {
        source: "iana"
      },
      "application/vnd.ezpix-album": {
        source: "iana",
        extensions: ["ez2"]
      },
      "application/vnd.ezpix-package": {
        source: "iana",
        extensions: ["ez3"]
      },
      "application/vnd.f-secure.mobile": {
        source: "iana"
      },
      "application/vnd.familysearch.gedcom+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.fastcopy-disk-image": {
        source: "iana"
      },
      "application/vnd.fdf": {
        source: "iana",
        extensions: ["fdf"]
      },
      "application/vnd.fdsn.mseed": {
        source: "iana",
        extensions: ["mseed"]
      },
      "application/vnd.fdsn.seed": {
        source: "iana",
        extensions: ["seed", "dataless"]
      },
      "application/vnd.ffsns": {
        source: "iana"
      },
      "application/vnd.ficlab.flb+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.filmit.zfc": {
        source: "iana"
      },
      "application/vnd.fints": {
        source: "iana"
      },
      "application/vnd.firemonkeys.cloudcell": {
        source: "iana"
      },
      "application/vnd.flographit": {
        source: "iana",
        extensions: ["gph"]
      },
      "application/vnd.fluxtime.clip": {
        source: "iana",
        extensions: ["ftc"]
      },
      "application/vnd.font-fontforge-sfd": {
        source: "iana"
      },
      "application/vnd.framemaker": {
        source: "iana",
        extensions: ["fm", "frame", "maker", "book"]
      },
      "application/vnd.frogans.fnc": {
        source: "iana",
        extensions: ["fnc"]
      },
      "application/vnd.frogans.ltf": {
        source: "iana",
        extensions: ["ltf"]
      },
      "application/vnd.fsc.weblaunch": {
        source: "iana",
        extensions: ["fsc"]
      },
      "application/vnd.fujifilm.fb.docuworks": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.binder": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.jfi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fujitsu.oasys": {
        source: "iana",
        extensions: ["oas"]
      },
      "application/vnd.fujitsu.oasys2": {
        source: "iana",
        extensions: ["oa2"]
      },
      "application/vnd.fujitsu.oasys3": {
        source: "iana",
        extensions: ["oa3"]
      },
      "application/vnd.fujitsu.oasysgp": {
        source: "iana",
        extensions: ["fg5"]
      },
      "application/vnd.fujitsu.oasysprs": {
        source: "iana",
        extensions: ["bh2"]
      },
      "application/vnd.fujixerox.art-ex": {
        source: "iana"
      },
      "application/vnd.fujixerox.art4": {
        source: "iana"
      },
      "application/vnd.fujixerox.ddd": {
        source: "iana",
        extensions: ["ddd"]
      },
      "application/vnd.fujixerox.docuworks": {
        source: "iana",
        extensions: ["xdw"]
      },
      "application/vnd.fujixerox.docuworks.binder": {
        source: "iana",
        extensions: ["xbd"]
      },
      "application/vnd.fujixerox.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujixerox.hbpl": {
        source: "iana"
      },
      "application/vnd.fut-misnet": {
        source: "iana"
      },
      "application/vnd.futoin+cbor": {
        source: "iana"
      },
      "application/vnd.futoin+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fuzzysheet": {
        source: "iana",
        extensions: ["fzs"]
      },
      "application/vnd.genomatix.tuxedo": {
        source: "iana",
        extensions: ["txd"]
      },
      "application/vnd.gentics.grd+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geo+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geocube+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geogebra.file": {
        source: "iana",
        extensions: ["ggb"]
      },
      "application/vnd.geogebra.slides": {
        source: "iana"
      },
      "application/vnd.geogebra.tool": {
        source: "iana",
        extensions: ["ggt"]
      },
      "application/vnd.geometry-explorer": {
        source: "iana",
        extensions: ["gex", "gre"]
      },
      "application/vnd.geonext": {
        source: "iana",
        extensions: ["gxt"]
      },
      "application/vnd.geoplan": {
        source: "iana",
        extensions: ["g2w"]
      },
      "application/vnd.geospace": {
        source: "iana",
        extensions: ["g3w"]
      },
      "application/vnd.gerber": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt-response": {
        source: "iana"
      },
      "application/vnd.gmx": {
        source: "iana",
        extensions: ["gmx"]
      },
      "application/vnd.google-apps.document": {
        compressible: false,
        extensions: ["gdoc"]
      },
      "application/vnd.google-apps.presentation": {
        compressible: false,
        extensions: ["gslides"]
      },
      "application/vnd.google-apps.spreadsheet": {
        compressible: false,
        extensions: ["gsheet"]
      },
      "application/vnd.google-earth.kml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["kml"]
      },
      "application/vnd.google-earth.kmz": {
        source: "iana",
        compressible: false,
        extensions: ["kmz"]
      },
      "application/vnd.gov.sk.e-form+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.gov.sk.e-form+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.gov.sk.xmldatacontainer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.grafeq": {
        source: "iana",
        extensions: ["gqf", "gqs"]
      },
      "application/vnd.gridmp": {
        source: "iana"
      },
      "application/vnd.groove-account": {
        source: "iana",
        extensions: ["gac"]
      },
      "application/vnd.groove-help": {
        source: "iana",
        extensions: ["ghf"]
      },
      "application/vnd.groove-identity-message": {
        source: "iana",
        extensions: ["gim"]
      },
      "application/vnd.groove-injector": {
        source: "iana",
        extensions: ["grv"]
      },
      "application/vnd.groove-tool-message": {
        source: "iana",
        extensions: ["gtm"]
      },
      "application/vnd.groove-tool-template": {
        source: "iana",
        extensions: ["tpl"]
      },
      "application/vnd.groove-vcard": {
        source: "iana",
        extensions: ["vcg"]
      },
      "application/vnd.hal+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hal+xml": {
        source: "iana",
        compressible: true,
        extensions: ["hal"]
      },
      "application/vnd.handheld-entertainment+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zmm"]
      },
      "application/vnd.hbci": {
        source: "iana",
        extensions: ["hbci"]
      },
      "application/vnd.hc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hcl-bireports": {
        source: "iana"
      },
      "application/vnd.hdt": {
        source: "iana"
      },
      "application/vnd.heroku+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hhe.lesson-player": {
        source: "iana",
        extensions: ["les"]
      },
      "application/vnd.hl7cda+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hl7v2+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hp-hpgl": {
        source: "iana",
        extensions: ["hpgl"]
      },
      "application/vnd.hp-hpid": {
        source: "iana",
        extensions: ["hpid"]
      },
      "application/vnd.hp-hps": {
        source: "iana",
        extensions: ["hps"]
      },
      "application/vnd.hp-jlyt": {
        source: "iana",
        extensions: ["jlt"]
      },
      "application/vnd.hp-pcl": {
        source: "iana",
        extensions: ["pcl"]
      },
      "application/vnd.hp-pclxl": {
        source: "iana",
        extensions: ["pclxl"]
      },
      "application/vnd.httphone": {
        source: "iana"
      },
      "application/vnd.hydrostatix.sof-data": {
        source: "iana",
        extensions: ["sfd-hdstx"]
      },
      "application/vnd.hyper+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyper-item+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyperdrive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hzn-3d-crossword": {
        source: "iana"
      },
      "application/vnd.ibm.afplinedata": {
        source: "iana"
      },
      "application/vnd.ibm.electronic-media": {
        source: "iana"
      },
      "application/vnd.ibm.minipay": {
        source: "iana",
        extensions: ["mpy"]
      },
      "application/vnd.ibm.modcap": {
        source: "iana",
        extensions: ["afp", "listafp", "list3820"]
      },
      "application/vnd.ibm.rights-management": {
        source: "iana",
        extensions: ["irm"]
      },
      "application/vnd.ibm.secure-container": {
        source: "iana",
        extensions: ["sc"]
      },
      "application/vnd.iccprofile": {
        source: "iana",
        extensions: ["icc", "icm"]
      },
      "application/vnd.ieee.1905": {
        source: "iana"
      },
      "application/vnd.igloader": {
        source: "iana",
        extensions: ["igl"]
      },
      "application/vnd.imagemeter.folder+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.imagemeter.image+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.immervision-ivp": {
        source: "iana",
        extensions: ["ivp"]
      },
      "application/vnd.immervision-ivu": {
        source: "iana",
        extensions: ["ivu"]
      },
      "application/vnd.ims.imsccv1p1": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p2": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p3": {
        source: "iana"
      },
      "application/vnd.ims.lis.v2.result+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy.id+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings.simple+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informedcontrol.rms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informix-visionary": {
        source: "iana"
      },
      "application/vnd.infotech.project": {
        source: "iana"
      },
      "application/vnd.infotech.project+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.innopath.wamp.notification": {
        source: "iana"
      },
      "application/vnd.insors.igm": {
        source: "iana",
        extensions: ["igm"]
      },
      "application/vnd.intercon.formnet": {
        source: "iana",
        extensions: ["xpw", "xpx"]
      },
      "application/vnd.intergeo": {
        source: "iana",
        extensions: ["i2g"]
      },
      "application/vnd.intertrust.digibox": {
        source: "iana"
      },
      "application/vnd.intertrust.nncp": {
        source: "iana"
      },
      "application/vnd.intu.qbo": {
        source: "iana",
        extensions: ["qbo"]
      },
      "application/vnd.intu.qfx": {
        source: "iana",
        extensions: ["qfx"]
      },
      "application/vnd.iptc.g2.catalogitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.conceptitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.knowledgeitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.packageitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.planningitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ipunplugged.rcprofile": {
        source: "iana",
        extensions: ["rcprofile"]
      },
      "application/vnd.irepository.package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["irp"]
      },
      "application/vnd.is-xpr": {
        source: "iana",
        extensions: ["xpr"]
      },
      "application/vnd.isac.fcs": {
        source: "iana",
        extensions: ["fcs"]
      },
      "application/vnd.iso11783-10+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.jam": {
        source: "iana",
        extensions: ["jam"]
      },
      "application/vnd.japannet-directory-service": {
        source: "iana"
      },
      "application/vnd.japannet-jpnstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-payment-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-registration": {
        source: "iana"
      },
      "application/vnd.japannet-registration-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-setstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-verification": {
        source: "iana"
      },
      "application/vnd.japannet-verification-wakeup": {
        source: "iana"
      },
      "application/vnd.jcp.javame.midlet-rms": {
        source: "iana",
        extensions: ["rms"]
      },
      "application/vnd.jisp": {
        source: "iana",
        extensions: ["jisp"]
      },
      "application/vnd.joost.joda-archive": {
        source: "iana",
        extensions: ["joda"]
      },
      "application/vnd.jsk.isdn-ngn": {
        source: "iana"
      },
      "application/vnd.kahootz": {
        source: "iana",
        extensions: ["ktz", "ktr"]
      },
      "application/vnd.kde.karbon": {
        source: "iana",
        extensions: ["karbon"]
      },
      "application/vnd.kde.kchart": {
        source: "iana",
        extensions: ["chrt"]
      },
      "application/vnd.kde.kformula": {
        source: "iana",
        extensions: ["kfo"]
      },
      "application/vnd.kde.kivio": {
        source: "iana",
        extensions: ["flw"]
      },
      "application/vnd.kde.kontour": {
        source: "iana",
        extensions: ["kon"]
      },
      "application/vnd.kde.kpresenter": {
        source: "iana",
        extensions: ["kpr", "kpt"]
      },
      "application/vnd.kde.kspread": {
        source: "iana",
        extensions: ["ksp"]
      },
      "application/vnd.kde.kword": {
        source: "iana",
        extensions: ["kwd", "kwt"]
      },
      "application/vnd.kenameaapp": {
        source: "iana",
        extensions: ["htke"]
      },
      "application/vnd.kidspiration": {
        source: "iana",
        extensions: ["kia"]
      },
      "application/vnd.kinar": {
        source: "iana",
        extensions: ["kne", "knp"]
      },
      "application/vnd.koan": {
        source: "iana",
        extensions: ["skp", "skd", "skt", "skm"]
      },
      "application/vnd.kodak-descriptor": {
        source: "iana",
        extensions: ["sse"]
      },
      "application/vnd.las": {
        source: "iana"
      },
      "application/vnd.las.las+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.las.las+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lasxml"]
      },
      "application/vnd.laszip": {
        source: "iana"
      },
      "application/vnd.leap+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.liberty-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.llamagraphics.life-balance.desktop": {
        source: "iana",
        extensions: ["lbd"]
      },
      "application/vnd.llamagraphics.life-balance.exchange+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lbe"]
      },
      "application/vnd.logipipe.circuit+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.loom": {
        source: "iana"
      },
      "application/vnd.lotus-1-2-3": {
        source: "iana",
        extensions: ["123"]
      },
      "application/vnd.lotus-approach": {
        source: "iana",
        extensions: ["apr"]
      },
      "application/vnd.lotus-freelance": {
        source: "iana",
        extensions: ["pre"]
      },
      "application/vnd.lotus-notes": {
        source: "iana",
        extensions: ["nsf"]
      },
      "application/vnd.lotus-organizer": {
        source: "iana",
        extensions: ["org"]
      },
      "application/vnd.lotus-screencam": {
        source: "iana",
        extensions: ["scm"]
      },
      "application/vnd.lotus-wordpro": {
        source: "iana",
        extensions: ["lwp"]
      },
      "application/vnd.macports.portpkg": {
        source: "iana",
        extensions: ["portpkg"]
      },
      "application/vnd.mapbox-vector-tile": {
        source: "iana",
        extensions: ["mvt"]
      },
      "application/vnd.marlin.drm.actiontoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.conftoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.license+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.mdcf": {
        source: "iana"
      },
      "application/vnd.mason+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.maxar.archive.3tz+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.maxmind.maxmind-db": {
        source: "iana"
      },
      "application/vnd.mcd": {
        source: "iana",
        extensions: ["mcd"]
      },
      "application/vnd.medcalcdata": {
        source: "iana",
        extensions: ["mc1"]
      },
      "application/vnd.mediastation.cdkey": {
        source: "iana",
        extensions: ["cdkey"]
      },
      "application/vnd.meridian-slingshot": {
        source: "iana"
      },
      "application/vnd.mfer": {
        source: "iana",
        extensions: ["mwf"]
      },
      "application/vnd.mfmp": {
        source: "iana",
        extensions: ["mfm"]
      },
      "application/vnd.micro+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.micrografx.flo": {
        source: "iana",
        extensions: ["flo"]
      },
      "application/vnd.micrografx.igx": {
        source: "iana",
        extensions: ["igx"]
      },
      "application/vnd.microsoft.portable-executable": {
        source: "iana"
      },
      "application/vnd.microsoft.windows.thumbnail-cache": {
        source: "iana"
      },
      "application/vnd.miele+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.mif": {
        source: "iana",
        extensions: ["mif"]
      },
      "application/vnd.minisoft-hp3000-save": {
        source: "iana"
      },
      "application/vnd.mitsubishi.misty-guard.trustweb": {
        source: "iana"
      },
      "application/vnd.mobius.daf": {
        source: "iana",
        extensions: ["daf"]
      },
      "application/vnd.mobius.dis": {
        source: "iana",
        extensions: ["dis"]
      },
      "application/vnd.mobius.mbk": {
        source: "iana",
        extensions: ["mbk"]
      },
      "application/vnd.mobius.mqy": {
        source: "iana",
        extensions: ["mqy"]
      },
      "application/vnd.mobius.msl": {
        source: "iana",
        extensions: ["msl"]
      },
      "application/vnd.mobius.plc": {
        source: "iana",
        extensions: ["plc"]
      },
      "application/vnd.mobius.txf": {
        source: "iana",
        extensions: ["txf"]
      },
      "application/vnd.mophun.application": {
        source: "iana",
        extensions: ["mpn"]
      },
      "application/vnd.mophun.certificate": {
        source: "iana",
        extensions: ["mpc"]
      },
      "application/vnd.motorola.flexsuite": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.adsi": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.fis": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.gotap": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.kmr": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.ttc": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.wem": {
        source: "iana"
      },
      "application/vnd.motorola.iprm": {
        source: "iana"
      },
      "application/vnd.mozilla.xul+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xul"]
      },
      "application/vnd.ms-3mfdocument": {
        source: "iana"
      },
      "application/vnd.ms-artgalry": {
        source: "iana",
        extensions: ["cil"]
      },
      "application/vnd.ms-asf": {
        source: "iana"
      },
      "application/vnd.ms-cab-compressed": {
        source: "iana",
        extensions: ["cab"]
      },
      "application/vnd.ms-color.iccprofile": {
        source: "apache"
      },
      "application/vnd.ms-excel": {
        source: "iana",
        compressible: false,
        extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
      },
      "application/vnd.ms-excel.addin.macroenabled.12": {
        source: "iana",
        extensions: ["xlam"]
      },
      "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
        source: "iana",
        extensions: ["xlsb"]
      },
      "application/vnd.ms-excel.sheet.macroenabled.12": {
        source: "iana",
        extensions: ["xlsm"]
      },
      "application/vnd.ms-excel.template.macroenabled.12": {
        source: "iana",
        extensions: ["xltm"]
      },
      "application/vnd.ms-fontobject": {
        source: "iana",
        compressible: true,
        extensions: ["eot"]
      },
      "application/vnd.ms-htmlhelp": {
        source: "iana",
        extensions: ["chm"]
      },
      "application/vnd.ms-ims": {
        source: "iana",
        extensions: ["ims"]
      },
      "application/vnd.ms-lrm": {
        source: "iana",
        extensions: ["lrm"]
      },
      "application/vnd.ms-office.activex+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-officetheme": {
        source: "iana",
        extensions: ["thmx"]
      },
      "application/vnd.ms-opentype": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-outlook": {
        compressible: false,
        extensions: ["msg"]
      },
      "application/vnd.ms-package.obfuscated-opentype": {
        source: "apache"
      },
      "application/vnd.ms-pki.seccat": {
        source: "apache",
        extensions: ["cat"]
      },
      "application/vnd.ms-pki.stl": {
        source: "apache",
        extensions: ["stl"]
      },
      "application/vnd.ms-playready.initiator+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-powerpoint": {
        source: "iana",
        compressible: false,
        extensions: ["ppt", "pps", "pot"]
      },
      "application/vnd.ms-powerpoint.addin.macroenabled.12": {
        source: "iana",
        extensions: ["ppam"]
      },
      "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
        source: "iana",
        extensions: ["pptm"]
      },
      "application/vnd.ms-powerpoint.slide.macroenabled.12": {
        source: "iana",
        extensions: ["sldm"]
      },
      "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
        source: "iana",
        extensions: ["ppsm"]
      },
      "application/vnd.ms-powerpoint.template.macroenabled.12": {
        source: "iana",
        extensions: ["potm"]
      },
      "application/vnd.ms-printdevicecapabilities+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-printing.printticket+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-printschematicket+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-project": {
        source: "iana",
        extensions: ["mpp", "mpt"]
      },
      "application/vnd.ms-tnef": {
        source: "iana"
      },
      "application/vnd.ms-windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.nwprinting.oob": {
        source: "iana"
      },
      "application/vnd.ms-windows.printerpairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.wsd.oob": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-resp": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-resp": {
        source: "iana"
      },
      "application/vnd.ms-word.document.macroenabled.12": {
        source: "iana",
        extensions: ["docm"]
      },
      "application/vnd.ms-word.template.macroenabled.12": {
        source: "iana",
        extensions: ["dotm"]
      },
      "application/vnd.ms-works": {
        source: "iana",
        extensions: ["wps", "wks", "wcm", "wdb"]
      },
      "application/vnd.ms-wpl": {
        source: "iana",
        extensions: ["wpl"]
      },
      "application/vnd.ms-xpsdocument": {
        source: "iana",
        compressible: false,
        extensions: ["xps"]
      },
      "application/vnd.msa-disk-image": {
        source: "iana"
      },
      "application/vnd.mseq": {
        source: "iana",
        extensions: ["mseq"]
      },
      "application/vnd.msign": {
        source: "iana"
      },
      "application/vnd.multiad.creator": {
        source: "iana"
      },
      "application/vnd.multiad.creator.cif": {
        source: "iana"
      },
      "application/vnd.music-niff": {
        source: "iana"
      },
      "application/vnd.musician": {
        source: "iana",
        extensions: ["mus"]
      },
      "application/vnd.muvee.style": {
        source: "iana",
        extensions: ["msty"]
      },
      "application/vnd.mynfc": {
        source: "iana",
        extensions: ["taglet"]
      },
      "application/vnd.nacamar.ybrid+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ncd.control": {
        source: "iana"
      },
      "application/vnd.ncd.reference": {
        source: "iana"
      },
      "application/vnd.nearst.inv+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nebumind.line": {
        source: "iana"
      },
      "application/vnd.nervana": {
        source: "iana"
      },
      "application/vnd.netfpx": {
        source: "iana"
      },
      "application/vnd.neurolanguage.nlu": {
        source: "iana",
        extensions: ["nlu"]
      },
      "application/vnd.nimn": {
        source: "iana"
      },
      "application/vnd.nintendo.nitro.rom": {
        source: "iana"
      },
      "application/vnd.nintendo.snes.rom": {
        source: "iana"
      },
      "application/vnd.nitf": {
        source: "iana",
        extensions: ["ntf", "nitf"]
      },
      "application/vnd.noblenet-directory": {
        source: "iana",
        extensions: ["nnd"]
      },
      "application/vnd.noblenet-sealer": {
        source: "iana",
        extensions: ["nns"]
      },
      "application/vnd.noblenet-web": {
        source: "iana",
        extensions: ["nnw"]
      },
      "application/vnd.nokia.catalogs": {
        source: "iana"
      },
      "application/vnd.nokia.conml+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.conml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.iptv.config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.isds-radio-presets": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.landmarkcollection+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.n-gage.ac+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ac"]
      },
      "application/vnd.nokia.n-gage.data": {
        source: "iana",
        extensions: ["ngdat"]
      },
      "application/vnd.nokia.n-gage.symbian.install": {
        source: "iana",
        extensions: ["n-gage"]
      },
      "application/vnd.nokia.ncd": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.radio-preset": {
        source: "iana",
        extensions: ["rpst"]
      },
      "application/vnd.nokia.radio-presets": {
        source: "iana",
        extensions: ["rpss"]
      },
      "application/vnd.novadigm.edm": {
        source: "iana",
        extensions: ["edm"]
      },
      "application/vnd.novadigm.edx": {
        source: "iana",
        extensions: ["edx"]
      },
      "application/vnd.novadigm.ext": {
        source: "iana",
        extensions: ["ext"]
      },
      "application/vnd.ntt-local.content-share": {
        source: "iana"
      },
      "application/vnd.ntt-local.file-transfer": {
        source: "iana"
      },
      "application/vnd.ntt-local.ogw_remote-access": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_remote": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_tcp_stream": {
        source: "iana"
      },
      "application/vnd.oasis.opendocument.chart": {
        source: "iana",
        extensions: ["odc"]
      },
      "application/vnd.oasis.opendocument.chart-template": {
        source: "iana",
        extensions: ["otc"]
      },
      "application/vnd.oasis.opendocument.database": {
        source: "iana",
        extensions: ["odb"]
      },
      "application/vnd.oasis.opendocument.formula": {
        source: "iana",
        extensions: ["odf"]
      },
      "application/vnd.oasis.opendocument.formula-template": {
        source: "iana",
        extensions: ["odft"]
      },
      "application/vnd.oasis.opendocument.graphics": {
        source: "iana",
        compressible: false,
        extensions: ["odg"]
      },
      "application/vnd.oasis.opendocument.graphics-template": {
        source: "iana",
        extensions: ["otg"]
      },
      "application/vnd.oasis.opendocument.image": {
        source: "iana",
        extensions: ["odi"]
      },
      "application/vnd.oasis.opendocument.image-template": {
        source: "iana",
        extensions: ["oti"]
      },
      "application/vnd.oasis.opendocument.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["odp"]
      },
      "application/vnd.oasis.opendocument.presentation-template": {
        source: "iana",
        extensions: ["otp"]
      },
      "application/vnd.oasis.opendocument.spreadsheet": {
        source: "iana",
        compressible: false,
        extensions: ["ods"]
      },
      "application/vnd.oasis.opendocument.spreadsheet-template": {
        source: "iana",
        extensions: ["ots"]
      },
      "application/vnd.oasis.opendocument.text": {
        source: "iana",
        compressible: false,
        extensions: ["odt"]
      },
      "application/vnd.oasis.opendocument.text-master": {
        source: "iana",
        extensions: ["odm"]
      },
      "application/vnd.oasis.opendocument.text-template": {
        source: "iana",
        extensions: ["ott"]
      },
      "application/vnd.oasis.opendocument.text-web": {
        source: "iana",
        extensions: ["oth"]
      },
      "application/vnd.obn": {
        source: "iana"
      },
      "application/vnd.ocf+cbor": {
        source: "iana"
      },
      "application/vnd.oci.image.manifest.v1+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oftn.l10n+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessdownload+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessstreaming+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.cspg-hexbinary": {
        source: "iana"
      },
      "application/vnd.oipf.dae.svg+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.dae.xhtml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.mippvcontrolmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.pae.gem": {
        source: "iana"
      },
      "application/vnd.oipf.spdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.spdlist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.ueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.userprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.olpc-sugar": {
        source: "iana",
        extensions: ["xo"]
      },
      "application/vnd.oma-scws-config": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-request": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-response": {
        source: "iana"
      },
      "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.drm-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.imd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.ltkm": {
        source: "iana"
      },
      "application/vnd.oma.bcast.notification+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.provisioningtrigger": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgboot": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgdd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sgdu": {
        source: "iana"
      },
      "application/vnd.oma.bcast.simple-symbol-container": {
        source: "iana"
      },
      "application/vnd.oma.bcast.smartcard-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sprov+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.stkm": {
        source: "iana"
      },
      "application/vnd.oma.cab-address-book+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-feature-handler+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-pcc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-subs-invite+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-user-prefs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.dcd": {
        source: "iana"
      },
      "application/vnd.oma.dcdc": {
        source: "iana"
      },
      "application/vnd.oma.dd2+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dd2"]
      },
      "application/vnd.oma.drm.risd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.group-usage-list+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+cbor": {
        source: "iana"
      },
      "application/vnd.oma.lwm2m+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+tlv": {
        source: "iana"
      },
      "application/vnd.oma.pal+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.detailed-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.final-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.groups+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.invocation-descriptor+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.optimized-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.push": {
        source: "iana"
      },
      "application/vnd.oma.scidm.messages+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.xcap-directory+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.omads-email+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-file+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-folder+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omaloc-supl-init": {
        source: "iana"
      },
      "application/vnd.onepager": {
        source: "iana"
      },
      "application/vnd.onepagertamp": {
        source: "iana"
      },
      "application/vnd.onepagertamx": {
        source: "iana"
      },
      "application/vnd.onepagertat": {
        source: "iana"
      },
      "application/vnd.onepagertatp": {
        source: "iana"
      },
      "application/vnd.onepagertatx": {
        source: "iana"
      },
      "application/vnd.openblox.game+xml": {
        source: "iana",
        compressible: true,
        extensions: ["obgx"]
      },
      "application/vnd.openblox.game-binary": {
        source: "iana"
      },
      "application/vnd.openeye.oeb": {
        source: "iana"
      },
      "application/vnd.openofficeorg.extension": {
        source: "apache",
        extensions: ["oxt"]
      },
      "application/vnd.openstreetmap.data+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osm"]
      },
      "application/vnd.opentimestamps.ots": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawing+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["pptx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide": {
        source: "iana",
        extensions: ["sldx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
        source: "iana",
        extensions: ["ppsx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template": {
        source: "iana",
        extensions: ["potx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        source: "iana",
        compressible: false,
        extensions: ["xlsx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
        source: "iana",
        extensions: ["xltx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.theme+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.vmldrawing": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        source: "iana",
        compressible: false,
        extensions: ["docx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
        source: "iana",
        extensions: ["dotx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.core-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.relationships+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oracle.resource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.orange.indata": {
        source: "iana"
      },
      "application/vnd.osa.netdeploy": {
        source: "iana"
      },
      "application/vnd.osgeo.mapguide.package": {
        source: "iana",
        extensions: ["mgp"]
      },
      "application/vnd.osgi.bundle": {
        source: "iana"
      },
      "application/vnd.osgi.dp": {
        source: "iana",
        extensions: ["dp"]
      },
      "application/vnd.osgi.subsystem": {
        source: "iana",
        extensions: ["esa"]
      },
      "application/vnd.otps.ct-kip+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oxli.countgraph": {
        source: "iana"
      },
      "application/vnd.pagerduty+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.palm": {
        source: "iana",
        extensions: ["pdb", "pqa", "oprc"]
      },
      "application/vnd.panoply": {
        source: "iana"
      },
      "application/vnd.paos.xml": {
        source: "iana"
      },
      "application/vnd.patentdive": {
        source: "iana"
      },
      "application/vnd.patientecommsdoc": {
        source: "iana"
      },
      "application/vnd.pawaafile": {
        source: "iana",
        extensions: ["paw"]
      },
      "application/vnd.pcos": {
        source: "iana"
      },
      "application/vnd.pg.format": {
        source: "iana",
        extensions: ["str"]
      },
      "application/vnd.pg.osasli": {
        source: "iana",
        extensions: ["ei6"]
      },
      "application/vnd.piaccess.application-licence": {
        source: "iana"
      },
      "application/vnd.picsel": {
        source: "iana",
        extensions: ["efif"]
      },
      "application/vnd.pmi.widget": {
        source: "iana",
        extensions: ["wg"]
      },
      "application/vnd.poc.group-advertisement+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.pocketlearn": {
        source: "iana",
        extensions: ["plf"]
      },
      "application/vnd.powerbuilder6": {
        source: "iana",
        extensions: ["pbd"]
      },
      "application/vnd.powerbuilder6-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder7": {
        source: "iana"
      },
      "application/vnd.powerbuilder7-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder75": {
        source: "iana"
      },
      "application/vnd.powerbuilder75-s": {
        source: "iana"
      },
      "application/vnd.preminet": {
        source: "iana"
      },
      "application/vnd.previewsystems.box": {
        source: "iana",
        extensions: ["box"]
      },
      "application/vnd.proteus.magazine": {
        source: "iana",
        extensions: ["mgz"]
      },
      "application/vnd.psfs": {
        source: "iana"
      },
      "application/vnd.publishare-delta-tree": {
        source: "iana",
        extensions: ["qps"]
      },
      "application/vnd.pvi.ptid1": {
        source: "iana",
        extensions: ["ptid"]
      },
      "application/vnd.pwg-multiplexed": {
        source: "iana"
      },
      "application/vnd.pwg-xhtml-print+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.qualcomm.brew-app-res": {
        source: "iana"
      },
      "application/vnd.quarantainenet": {
        source: "iana"
      },
      "application/vnd.quark.quarkxpress": {
        source: "iana",
        extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
      },
      "application/vnd.quobject-quoxdocument": {
        source: "iana"
      },
      "application/vnd.radisys.moml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-stream+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-base+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-detect+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-group+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-speech+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-transform+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rainstor.data": {
        source: "iana"
      },
      "application/vnd.rapid": {
        source: "iana"
      },
      "application/vnd.rar": {
        source: "iana",
        extensions: ["rar"]
      },
      "application/vnd.realvnc.bed": {
        source: "iana",
        extensions: ["bed"]
      },
      "application/vnd.recordare.musicxml": {
        source: "iana",
        extensions: ["mxl"]
      },
      "application/vnd.recordare.musicxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musicxml"]
      },
      "application/vnd.renlearn.rlprint": {
        source: "iana"
      },
      "application/vnd.resilient.logic": {
        source: "iana"
      },
      "application/vnd.restful+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rig.cryptonote": {
        source: "iana",
        extensions: ["cryptonote"]
      },
      "application/vnd.rim.cod": {
        source: "apache",
        extensions: ["cod"]
      },
      "application/vnd.rn-realmedia": {
        source: "apache",
        extensions: ["rm"]
      },
      "application/vnd.rn-realmedia-vbr": {
        source: "apache",
        extensions: ["rmvb"]
      },
      "application/vnd.route66.link66+xml": {
        source: "iana",
        compressible: true,
        extensions: ["link66"]
      },
      "application/vnd.rs-274x": {
        source: "iana"
      },
      "application/vnd.ruckus.download": {
        source: "iana"
      },
      "application/vnd.s3sms": {
        source: "iana"
      },
      "application/vnd.sailingtracker.track": {
        source: "iana",
        extensions: ["st"]
      },
      "application/vnd.sar": {
        source: "iana"
      },
      "application/vnd.sbm.cid": {
        source: "iana"
      },
      "application/vnd.sbm.mid2": {
        source: "iana"
      },
      "application/vnd.scribus": {
        source: "iana"
      },
      "application/vnd.sealed.3df": {
        source: "iana"
      },
      "application/vnd.sealed.csf": {
        source: "iana"
      },
      "application/vnd.sealed.doc": {
        source: "iana"
      },
      "application/vnd.sealed.eml": {
        source: "iana"
      },
      "application/vnd.sealed.mht": {
        source: "iana"
      },
      "application/vnd.sealed.net": {
        source: "iana"
      },
      "application/vnd.sealed.ppt": {
        source: "iana"
      },
      "application/vnd.sealed.tiff": {
        source: "iana"
      },
      "application/vnd.sealed.xls": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.html": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.pdf": {
        source: "iana"
      },
      "application/vnd.seemail": {
        source: "iana",
        extensions: ["see"]
      },
      "application/vnd.seis+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.sema": {
        source: "iana",
        extensions: ["sema"]
      },
      "application/vnd.semd": {
        source: "iana",
        extensions: ["semd"]
      },
      "application/vnd.semf": {
        source: "iana",
        extensions: ["semf"]
      },
      "application/vnd.shade-save-file": {
        source: "iana"
      },
      "application/vnd.shana.informed.formdata": {
        source: "iana",
        extensions: ["ifm"]
      },
      "application/vnd.shana.informed.formtemplate": {
        source: "iana",
        extensions: ["itp"]
      },
      "application/vnd.shana.informed.interchange": {
        source: "iana",
        extensions: ["iif"]
      },
      "application/vnd.shana.informed.package": {
        source: "iana",
        extensions: ["ipk"]
      },
      "application/vnd.shootproof+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shopkick+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shp": {
        source: "iana"
      },
      "application/vnd.shx": {
        source: "iana"
      },
      "application/vnd.sigrok.session": {
        source: "iana"
      },
      "application/vnd.simtech-mindmapper": {
        source: "iana",
        extensions: ["twd", "twds"]
      },
      "application/vnd.siren+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.smaf": {
        source: "iana",
        extensions: ["mmf"]
      },
      "application/vnd.smart.notebook": {
        source: "iana"
      },
      "application/vnd.smart.teacher": {
        source: "iana",
        extensions: ["teacher"]
      },
      "application/vnd.snesdev-page-table": {
        source: "iana"
      },
      "application/vnd.software602.filler.form+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fo"]
      },
      "application/vnd.software602.filler.form-xml-zip": {
        source: "iana"
      },
      "application/vnd.solent.sdkm+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sdkm", "sdkd"]
      },
      "application/vnd.spotfire.dxp": {
        source: "iana",
        extensions: ["dxp"]
      },
      "application/vnd.spotfire.sfs": {
        source: "iana",
        extensions: ["sfs"]
      },
      "application/vnd.sqlite3": {
        source: "iana"
      },
      "application/vnd.sss-cod": {
        source: "iana"
      },
      "application/vnd.sss-dtf": {
        source: "iana"
      },
      "application/vnd.sss-ntf": {
        source: "iana"
      },
      "application/vnd.stardivision.calc": {
        source: "apache",
        extensions: ["sdc"]
      },
      "application/vnd.stardivision.draw": {
        source: "apache",
        extensions: ["sda"]
      },
      "application/vnd.stardivision.impress": {
        source: "apache",
        extensions: ["sdd"]
      },
      "application/vnd.stardivision.math": {
        source: "apache",
        extensions: ["smf"]
      },
      "application/vnd.stardivision.writer": {
        source: "apache",
        extensions: ["sdw", "vor"]
      },
      "application/vnd.stardivision.writer-global": {
        source: "apache",
        extensions: ["sgl"]
      },
      "application/vnd.stepmania.package": {
        source: "iana",
        extensions: ["smzip"]
      },
      "application/vnd.stepmania.stepchart": {
        source: "iana",
        extensions: ["sm"]
      },
      "application/vnd.street-stream": {
        source: "iana"
      },
      "application/vnd.sun.wadl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wadl"]
      },
      "application/vnd.sun.xml.calc": {
        source: "apache",
        extensions: ["sxc"]
      },
      "application/vnd.sun.xml.calc.template": {
        source: "apache",
        extensions: ["stc"]
      },
      "application/vnd.sun.xml.draw": {
        source: "apache",
        extensions: ["sxd"]
      },
      "application/vnd.sun.xml.draw.template": {
        source: "apache",
        extensions: ["std"]
      },
      "application/vnd.sun.xml.impress": {
        source: "apache",
        extensions: ["sxi"]
      },
      "application/vnd.sun.xml.impress.template": {
        source: "apache",
        extensions: ["sti"]
      },
      "application/vnd.sun.xml.math": {
        source: "apache",
        extensions: ["sxm"]
      },
      "application/vnd.sun.xml.writer": {
        source: "apache",
        extensions: ["sxw"]
      },
      "application/vnd.sun.xml.writer.global": {
        source: "apache",
        extensions: ["sxg"]
      },
      "application/vnd.sun.xml.writer.template": {
        source: "apache",
        extensions: ["stw"]
      },
      "application/vnd.sus-calendar": {
        source: "iana",
        extensions: ["sus", "susp"]
      },
      "application/vnd.svd": {
        source: "iana",
        extensions: ["svd"]
      },
      "application/vnd.swiftview-ics": {
        source: "iana"
      },
      "application/vnd.sycle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.syft+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.symbian.install": {
        source: "apache",
        extensions: ["sis", "sisx"]
      },
      "application/vnd.syncml+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xsm"]
      },
      "application/vnd.syncml.dm+wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["bdm"]
      },
      "application/vnd.syncml.dm+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xdm"]
      },
      "application/vnd.syncml.dm.notification": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["ddf"]
      },
      "application/vnd.syncml.dmtnds+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmtnds+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.syncml.ds.notification": {
        source: "iana"
      },
      "application/vnd.tableschema+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tao.intent-module-archive": {
        source: "iana",
        extensions: ["tao"]
      },
      "application/vnd.tcpdump.pcap": {
        source: "iana",
        extensions: ["pcap", "cap", "dmp"]
      },
      "application/vnd.think-cell.ppttc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tmd.mediaflex.api+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tml": {
        source: "iana"
      },
      "application/vnd.tmobile-livetv": {
        source: "iana",
        extensions: ["tmo"]
      },
      "application/vnd.tri.onesource": {
        source: "iana"
      },
      "application/vnd.trid.tpt": {
        source: "iana",
        extensions: ["tpt"]
      },
      "application/vnd.triscape.mxs": {
        source: "iana",
        extensions: ["mxs"]
      },
      "application/vnd.trueapp": {
        source: "iana",
        extensions: ["tra"]
      },
      "application/vnd.truedoc": {
        source: "iana"
      },
      "application/vnd.ubisoft.webplayer": {
        source: "iana"
      },
      "application/vnd.ufdl": {
        source: "iana",
        extensions: ["ufd", "ufdl"]
      },
      "application/vnd.uiq.theme": {
        source: "iana",
        extensions: ["utz"]
      },
      "application/vnd.umajin": {
        source: "iana",
        extensions: ["umj"]
      },
      "application/vnd.unity": {
        source: "iana",
        extensions: ["unityweb"]
      },
      "application/vnd.uoml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uoml"]
      },
      "application/vnd.uplanet.alert": {
        source: "iana"
      },
      "application/vnd.uplanet.alert-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.channel": {
        source: "iana"
      },
      "application/vnd.uplanet.channel-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.list": {
        source: "iana"
      },
      "application/vnd.uplanet.list-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.signal": {
        source: "iana"
      },
      "application/vnd.uri-map": {
        source: "iana"
      },
      "application/vnd.valve.source.material": {
        source: "iana"
      },
      "application/vnd.vcx": {
        source: "iana",
        extensions: ["vcx"]
      },
      "application/vnd.vd-study": {
        source: "iana"
      },
      "application/vnd.vectorworks": {
        source: "iana"
      },
      "application/vnd.vel+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.verimatrix.vcas": {
        source: "iana"
      },
      "application/vnd.veritone.aion+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.veryant.thin": {
        source: "iana"
      },
      "application/vnd.ves.encrypted": {
        source: "iana"
      },
      "application/vnd.vidsoft.vidconference": {
        source: "iana"
      },
      "application/vnd.visio": {
        source: "iana",
        extensions: ["vsd", "vst", "vss", "vsw"]
      },
      "application/vnd.visionary": {
        source: "iana",
        extensions: ["vis"]
      },
      "application/vnd.vividence.scriptfile": {
        source: "iana"
      },
      "application/vnd.vsf": {
        source: "iana",
        extensions: ["vsf"]
      },
      "application/vnd.wap.sic": {
        source: "iana"
      },
      "application/vnd.wap.slc": {
        source: "iana"
      },
      "application/vnd.wap.wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["wbxml"]
      },
      "application/vnd.wap.wmlc": {
        source: "iana",
        extensions: ["wmlc"]
      },
      "application/vnd.wap.wmlscriptc": {
        source: "iana",
        extensions: ["wmlsc"]
      },
      "application/vnd.webturbo": {
        source: "iana",
        extensions: ["wtb"]
      },
      "application/vnd.wfa.dpp": {
        source: "iana"
      },
      "application/vnd.wfa.p2p": {
        source: "iana"
      },
      "application/vnd.wfa.wsc": {
        source: "iana"
      },
      "application/vnd.windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.wmc": {
        source: "iana"
      },
      "application/vnd.wmf.bootstrap": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica.package": {
        source: "iana"
      },
      "application/vnd.wolfram.player": {
        source: "iana",
        extensions: ["nbp"]
      },
      "application/vnd.wordperfect": {
        source: "iana",
        extensions: ["wpd"]
      },
      "application/vnd.wqd": {
        source: "iana",
        extensions: ["wqd"]
      },
      "application/vnd.wrq-hp3000-labelled": {
        source: "iana"
      },
      "application/vnd.wt.stf": {
        source: "iana",
        extensions: ["stf"]
      },
      "application/vnd.wv.csp+wbxml": {
        source: "iana"
      },
      "application/vnd.wv.csp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.wv.ssp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xacml+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xara": {
        source: "iana",
        extensions: ["xar"]
      },
      "application/vnd.xfdl": {
        source: "iana",
        extensions: ["xfdl"]
      },
      "application/vnd.xfdl.webform": {
        source: "iana"
      },
      "application/vnd.xmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xmpie.cpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.dpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.plan": {
        source: "iana"
      },
      "application/vnd.xmpie.ppkg": {
        source: "iana"
      },
      "application/vnd.xmpie.xlim": {
        source: "iana"
      },
      "application/vnd.yamaha.hv-dic": {
        source: "iana",
        extensions: ["hvd"]
      },
      "application/vnd.yamaha.hv-script": {
        source: "iana",
        extensions: ["hvs"]
      },
      "application/vnd.yamaha.hv-voice": {
        source: "iana",
        extensions: ["hvp"]
      },
      "application/vnd.yamaha.openscoreformat": {
        source: "iana",
        extensions: ["osf"]
      },
      "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osfpvg"]
      },
      "application/vnd.yamaha.remote-setup": {
        source: "iana"
      },
      "application/vnd.yamaha.smaf-audio": {
        source: "iana",
        extensions: ["saf"]
      },
      "application/vnd.yamaha.smaf-phrase": {
        source: "iana",
        extensions: ["spf"]
      },
      "application/vnd.yamaha.through-ngn": {
        source: "iana"
      },
      "application/vnd.yamaha.tunnel-udpencap": {
        source: "iana"
      },
      "application/vnd.yaoweme": {
        source: "iana"
      },
      "application/vnd.yellowriver-custom-menu": {
        source: "iana",
        extensions: ["cmp"]
      },
      "application/vnd.youtube.yt": {
        source: "iana"
      },
      "application/vnd.zul": {
        source: "iana",
        extensions: ["zir", "zirz"]
      },
      "application/vnd.zzazz.deck+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zaz"]
      },
      "application/voicexml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["vxml"]
      },
      "application/voucher-cms+json": {
        source: "iana",
        compressible: true
      },
      "application/vq-rtcpxr": {
        source: "iana"
      },
      "application/wasm": {
        source: "iana",
        compressible: true,
        extensions: ["wasm"]
      },
      "application/watcherinfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wif"]
      },
      "application/webpush-options+json": {
        source: "iana",
        compressible: true
      },
      "application/whoispp-query": {
        source: "iana"
      },
      "application/whoispp-response": {
        source: "iana"
      },
      "application/widget": {
        source: "iana",
        extensions: ["wgt"]
      },
      "application/winhlp": {
        source: "apache",
        extensions: ["hlp"]
      },
      "application/wita": {
        source: "iana"
      },
      "application/wordperfect5.1": {
        source: "iana"
      },
      "application/wsdl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wsdl"]
      },
      "application/wspolicy+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wspolicy"]
      },
      "application/x-7z-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["7z"]
      },
      "application/x-abiword": {
        source: "apache",
        extensions: ["abw"]
      },
      "application/x-ace-compressed": {
        source: "apache",
        extensions: ["ace"]
      },
      "application/x-amf": {
        source: "apache"
      },
      "application/x-apple-diskimage": {
        source: "apache",
        extensions: ["dmg"]
      },
      "application/x-arj": {
        compressible: false,
        extensions: ["arj"]
      },
      "application/x-authorware-bin": {
        source: "apache",
        extensions: ["aab", "x32", "u32", "vox"]
      },
      "application/x-authorware-map": {
        source: "apache",
        extensions: ["aam"]
      },
      "application/x-authorware-seg": {
        source: "apache",
        extensions: ["aas"]
      },
      "application/x-bcpio": {
        source: "apache",
        extensions: ["bcpio"]
      },
      "application/x-bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/x-bittorrent": {
        source: "apache",
        extensions: ["torrent"]
      },
      "application/x-blorb": {
        source: "apache",
        extensions: ["blb", "blorb"]
      },
      "application/x-bzip": {
        source: "apache",
        compressible: false,
        extensions: ["bz"]
      },
      "application/x-bzip2": {
        source: "apache",
        compressible: false,
        extensions: ["bz2", "boz"]
      },
      "application/x-cbr": {
        source: "apache",
        extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
      },
      "application/x-cdlink": {
        source: "apache",
        extensions: ["vcd"]
      },
      "application/x-cfs-compressed": {
        source: "apache",
        extensions: ["cfs"]
      },
      "application/x-chat": {
        source: "apache",
        extensions: ["chat"]
      },
      "application/x-chess-pgn": {
        source: "apache",
        extensions: ["pgn"]
      },
      "application/x-chrome-extension": {
        extensions: ["crx"]
      },
      "application/x-cocoa": {
        source: "nginx",
        extensions: ["cco"]
      },
      "application/x-compress": {
        source: "apache"
      },
      "application/x-conference": {
        source: "apache",
        extensions: ["nsc"]
      },
      "application/x-cpio": {
        source: "apache",
        extensions: ["cpio"]
      },
      "application/x-csh": {
        source: "apache",
        extensions: ["csh"]
      },
      "application/x-deb": {
        compressible: false
      },
      "application/x-debian-package": {
        source: "apache",
        extensions: ["deb", "udeb"]
      },
      "application/x-dgc-compressed": {
        source: "apache",
        extensions: ["dgc"]
      },
      "application/x-director": {
        source: "apache",
        extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
      },
      "application/x-doom": {
        source: "apache",
        extensions: ["wad"]
      },
      "application/x-dtbncx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ncx"]
      },
      "application/x-dtbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dtb"]
      },
      "application/x-dtbresource+xml": {
        source: "apache",
        compressible: true,
        extensions: ["res"]
      },
      "application/x-dvi": {
        source: "apache",
        compressible: false,
        extensions: ["dvi"]
      },
      "application/x-envoy": {
        source: "apache",
        extensions: ["evy"]
      },
      "application/x-eva": {
        source: "apache",
        extensions: ["eva"]
      },
      "application/x-font-bdf": {
        source: "apache",
        extensions: ["bdf"]
      },
      "application/x-font-dos": {
        source: "apache"
      },
      "application/x-font-framemaker": {
        source: "apache"
      },
      "application/x-font-ghostscript": {
        source: "apache",
        extensions: ["gsf"]
      },
      "application/x-font-libgrx": {
        source: "apache"
      },
      "application/x-font-linux-psf": {
        source: "apache",
        extensions: ["psf"]
      },
      "application/x-font-pcf": {
        source: "apache",
        extensions: ["pcf"]
      },
      "application/x-font-snf": {
        source: "apache",
        extensions: ["snf"]
      },
      "application/x-font-speedo": {
        source: "apache"
      },
      "application/x-font-sunos-news": {
        source: "apache"
      },
      "application/x-font-type1": {
        source: "apache",
        extensions: ["pfa", "pfb", "pfm", "afm"]
      },
      "application/x-font-vfont": {
        source: "apache"
      },
      "application/x-freearc": {
        source: "apache",
        extensions: ["arc"]
      },
      "application/x-futuresplash": {
        source: "apache",
        extensions: ["spl"]
      },
      "application/x-gca-compressed": {
        source: "apache",
        extensions: ["gca"]
      },
      "application/x-glulx": {
        source: "apache",
        extensions: ["ulx"]
      },
      "application/x-gnumeric": {
        source: "apache",
        extensions: ["gnumeric"]
      },
      "application/x-gramps-xml": {
        source: "apache",
        extensions: ["gramps"]
      },
      "application/x-gtar": {
        source: "apache",
        extensions: ["gtar"]
      },
      "application/x-gzip": {
        source: "apache"
      },
      "application/x-hdf": {
        source: "apache",
        extensions: ["hdf"]
      },
      "application/x-httpd-php": {
        compressible: true,
        extensions: ["php"]
      },
      "application/x-install-instructions": {
        source: "apache",
        extensions: ["install"]
      },
      "application/x-iso9660-image": {
        source: "apache",
        extensions: ["iso"]
      },
      "application/x-iwork-keynote-sffkey": {
        extensions: ["key"]
      },
      "application/x-iwork-numbers-sffnumbers": {
        extensions: ["numbers"]
      },
      "application/x-iwork-pages-sffpages": {
        extensions: ["pages"]
      },
      "application/x-java-archive-diff": {
        source: "nginx",
        extensions: ["jardiff"]
      },
      "application/x-java-jnlp-file": {
        source: "apache",
        compressible: false,
        extensions: ["jnlp"]
      },
      "application/x-javascript": {
        compressible: true
      },
      "application/x-keepass2": {
        extensions: ["kdbx"]
      },
      "application/x-latex": {
        source: "apache",
        compressible: false,
        extensions: ["latex"]
      },
      "application/x-lua-bytecode": {
        extensions: ["luac"]
      },
      "application/x-lzh-compressed": {
        source: "apache",
        extensions: ["lzh", "lha"]
      },
      "application/x-makeself": {
        source: "nginx",
        extensions: ["run"]
      },
      "application/x-mie": {
        source: "apache",
        extensions: ["mie"]
      },
      "application/x-mobipocket-ebook": {
        source: "apache",
        extensions: ["prc", "mobi"]
      },
      "application/x-mpegurl": {
        compressible: false
      },
      "application/x-ms-application": {
        source: "apache",
        extensions: ["application"]
      },
      "application/x-ms-shortcut": {
        source: "apache",
        extensions: ["lnk"]
      },
      "application/x-ms-wmd": {
        source: "apache",
        extensions: ["wmd"]
      },
      "application/x-ms-wmz": {
        source: "apache",
        extensions: ["wmz"]
      },
      "application/x-ms-xbap": {
        source: "apache",
        extensions: ["xbap"]
      },
      "application/x-msaccess": {
        source: "apache",
        extensions: ["mdb"]
      },
      "application/x-msbinder": {
        source: "apache",
        extensions: ["obd"]
      },
      "application/x-mscardfile": {
        source: "apache",
        extensions: ["crd"]
      },
      "application/x-msclip": {
        source: "apache",
        extensions: ["clp"]
      },
      "application/x-msdos-program": {
        extensions: ["exe"]
      },
      "application/x-msdownload": {
        source: "apache",
        extensions: ["exe", "dll", "com", "bat", "msi"]
      },
      "application/x-msmediaview": {
        source: "apache",
        extensions: ["mvb", "m13", "m14"]
      },
      "application/x-msmetafile": {
        source: "apache",
        extensions: ["wmf", "wmz", "emf", "emz"]
      },
      "application/x-msmoney": {
        source: "apache",
        extensions: ["mny"]
      },
      "application/x-mspublisher": {
        source: "apache",
        extensions: ["pub"]
      },
      "application/x-msschedule": {
        source: "apache",
        extensions: ["scd"]
      },
      "application/x-msterminal": {
        source: "apache",
        extensions: ["trm"]
      },
      "application/x-mswrite": {
        source: "apache",
        extensions: ["wri"]
      },
      "application/x-netcdf": {
        source: "apache",
        extensions: ["nc", "cdf"]
      },
      "application/x-ns-proxy-autoconfig": {
        compressible: true,
        extensions: ["pac"]
      },
      "application/x-nzb": {
        source: "apache",
        extensions: ["nzb"]
      },
      "application/x-perl": {
        source: "nginx",
        extensions: ["pl", "pm"]
      },
      "application/x-pilot": {
        source: "nginx",
        extensions: ["prc", "pdb"]
      },
      "application/x-pkcs12": {
        source: "apache",
        compressible: false,
        extensions: ["p12", "pfx"]
      },
      "application/x-pkcs7-certificates": {
        source: "apache",
        extensions: ["p7b", "spc"]
      },
      "application/x-pkcs7-certreqresp": {
        source: "apache",
        extensions: ["p7r"]
      },
      "application/x-pki-message": {
        source: "iana"
      },
      "application/x-rar-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["rar"]
      },
      "application/x-redhat-package-manager": {
        source: "nginx",
        extensions: ["rpm"]
      },
      "application/x-research-info-systems": {
        source: "apache",
        extensions: ["ris"]
      },
      "application/x-sea": {
        source: "nginx",
        extensions: ["sea"]
      },
      "application/x-sh": {
        source: "apache",
        compressible: true,
        extensions: ["sh"]
      },
      "application/x-shar": {
        source: "apache",
        extensions: ["shar"]
      },
      "application/x-shockwave-flash": {
        source: "apache",
        compressible: false,
        extensions: ["swf"]
      },
      "application/x-silverlight-app": {
        source: "apache",
        extensions: ["xap"]
      },
      "application/x-sql": {
        source: "apache",
        extensions: ["sql"]
      },
      "application/x-stuffit": {
        source: "apache",
        compressible: false,
        extensions: ["sit"]
      },
      "application/x-stuffitx": {
        source: "apache",
        extensions: ["sitx"]
      },
      "application/x-subrip": {
        source: "apache",
        extensions: ["srt"]
      },
      "application/x-sv4cpio": {
        source: "apache",
        extensions: ["sv4cpio"]
      },
      "application/x-sv4crc": {
        source: "apache",
        extensions: ["sv4crc"]
      },
      "application/x-t3vm-image": {
        source: "apache",
        extensions: ["t3"]
      },
      "application/x-tads": {
        source: "apache",
        extensions: ["gam"]
      },
      "application/x-tar": {
        source: "apache",
        compressible: true,
        extensions: ["tar"]
      },
      "application/x-tcl": {
        source: "apache",
        extensions: ["tcl", "tk"]
      },
      "application/x-tex": {
        source: "apache",
        extensions: ["tex"]
      },
      "application/x-tex-tfm": {
        source: "apache",
        extensions: ["tfm"]
      },
      "application/x-texinfo": {
        source: "apache",
        extensions: ["texinfo", "texi"]
      },
      "application/x-tgif": {
        source: "apache",
        extensions: ["obj"]
      },
      "application/x-ustar": {
        source: "apache",
        extensions: ["ustar"]
      },
      "application/x-virtualbox-hdd": {
        compressible: true,
        extensions: ["hdd"]
      },
      "application/x-virtualbox-ova": {
        compressible: true,
        extensions: ["ova"]
      },
      "application/x-virtualbox-ovf": {
        compressible: true,
        extensions: ["ovf"]
      },
      "application/x-virtualbox-vbox": {
        compressible: true,
        extensions: ["vbox"]
      },
      "application/x-virtualbox-vbox-extpack": {
        compressible: false,
        extensions: ["vbox-extpack"]
      },
      "application/x-virtualbox-vdi": {
        compressible: true,
        extensions: ["vdi"]
      },
      "application/x-virtualbox-vhd": {
        compressible: true,
        extensions: ["vhd"]
      },
      "application/x-virtualbox-vmdk": {
        compressible: true,
        extensions: ["vmdk"]
      },
      "application/x-wais-source": {
        source: "apache",
        extensions: ["src"]
      },
      "application/x-web-app-manifest+json": {
        compressible: true,
        extensions: ["webapp"]
      },
      "application/x-www-form-urlencoded": {
        source: "iana",
        compressible: true
      },
      "application/x-x509-ca-cert": {
        source: "iana",
        extensions: ["der", "crt", "pem"]
      },
      "application/x-x509-ca-ra-cert": {
        source: "iana"
      },
      "application/x-x509-next-ca-cert": {
        source: "iana"
      },
      "application/x-xfig": {
        source: "apache",
        extensions: ["fig"]
      },
      "application/x-xliff+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/x-xpinstall": {
        source: "apache",
        compressible: false,
        extensions: ["xpi"]
      },
      "application/x-xz": {
        source: "apache",
        extensions: ["xz"]
      },
      "application/x-zmachine": {
        source: "apache",
        extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
      },
      "application/x400-bp": {
        source: "iana"
      },
      "application/xacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/xaml+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xaml"]
      },
      "application/xcap-att+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xav"]
      },
      "application/xcap-caps+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xca"]
      },
      "application/xcap-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdf"]
      },
      "application/xcap-el+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xel"]
      },
      "application/xcap-error+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcap-ns+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xns"]
      },
      "application/xcon-conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcon-conference-info-diff+xml": {
        source: "iana",
        compressible: true
      },
      "application/xenc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xenc"]
      },
      "application/xhtml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xhtml", "xht"]
      },
      "application/xhtml-voice+xml": {
        source: "apache",
        compressible: true
      },
      "application/xliff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml", "xsl", "xsd", "rng"]
      },
      "application/xml-dtd": {
        source: "iana",
        compressible: true,
        extensions: ["dtd"]
      },
      "application/xml-external-parsed-entity": {
        source: "iana"
      },
      "application/xml-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/xmpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/xop+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xop"]
      },
      "application/xproc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xpl"]
      },
      "application/xslt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xsl", "xslt"]
      },
      "application/xspf+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xspf"]
      },
      "application/xv+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mxml", "xhvml", "xvml", "xvm"]
      },
      "application/yang": {
        source: "iana",
        extensions: ["yang"]
      },
      "application/yang-data+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-data+xml": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/yin+xml": {
        source: "iana",
        compressible: true,
        extensions: ["yin"]
      },
      "application/zip": {
        source: "iana",
        compressible: false,
        extensions: ["zip"]
      },
      "application/zlib": {
        source: "iana"
      },
      "application/zstd": {
        source: "iana"
      },
      "audio/1d-interleaved-parityfec": {
        source: "iana"
      },
      "audio/32kadpcm": {
        source: "iana"
      },
      "audio/3gpp": {
        source: "iana",
        compressible: false,
        extensions: ["3gpp"]
      },
      "audio/3gpp2": {
        source: "iana"
      },
      "audio/aac": {
        source: "iana"
      },
      "audio/ac3": {
        source: "iana"
      },
      "audio/adpcm": {
        source: "apache",
        extensions: ["adp"]
      },
      "audio/amr": {
        source: "iana",
        extensions: ["amr"]
      },
      "audio/amr-wb": {
        source: "iana"
      },
      "audio/amr-wb+": {
        source: "iana"
      },
      "audio/aptx": {
        source: "iana"
      },
      "audio/asc": {
        source: "iana"
      },
      "audio/atrac-advanced-lossless": {
        source: "iana"
      },
      "audio/atrac-x": {
        source: "iana"
      },
      "audio/atrac3": {
        source: "iana"
      },
      "audio/basic": {
        source: "iana",
        compressible: false,
        extensions: ["au", "snd"]
      },
      "audio/bv16": {
        source: "iana"
      },
      "audio/bv32": {
        source: "iana"
      },
      "audio/clearmode": {
        source: "iana"
      },
      "audio/cn": {
        source: "iana"
      },
      "audio/dat12": {
        source: "iana"
      },
      "audio/dls": {
        source: "iana"
      },
      "audio/dsr-es201108": {
        source: "iana"
      },
      "audio/dsr-es202050": {
        source: "iana"
      },
      "audio/dsr-es202211": {
        source: "iana"
      },
      "audio/dsr-es202212": {
        source: "iana"
      },
      "audio/dv": {
        source: "iana"
      },
      "audio/dvi4": {
        source: "iana"
      },
      "audio/eac3": {
        source: "iana"
      },
      "audio/encaprtp": {
        source: "iana"
      },
      "audio/evrc": {
        source: "iana"
      },
      "audio/evrc-qcp": {
        source: "iana"
      },
      "audio/evrc0": {
        source: "iana"
      },
      "audio/evrc1": {
        source: "iana"
      },
      "audio/evrcb": {
        source: "iana"
      },
      "audio/evrcb0": {
        source: "iana"
      },
      "audio/evrcb1": {
        source: "iana"
      },
      "audio/evrcnw": {
        source: "iana"
      },
      "audio/evrcnw0": {
        source: "iana"
      },
      "audio/evrcnw1": {
        source: "iana"
      },
      "audio/evrcwb": {
        source: "iana"
      },
      "audio/evrcwb0": {
        source: "iana"
      },
      "audio/evrcwb1": {
        source: "iana"
      },
      "audio/evs": {
        source: "iana"
      },
      "audio/flexfec": {
        source: "iana"
      },
      "audio/fwdred": {
        source: "iana"
      },
      "audio/g711-0": {
        source: "iana"
      },
      "audio/g719": {
        source: "iana"
      },
      "audio/g722": {
        source: "iana"
      },
      "audio/g7221": {
        source: "iana"
      },
      "audio/g723": {
        source: "iana"
      },
      "audio/g726-16": {
        source: "iana"
      },
      "audio/g726-24": {
        source: "iana"
      },
      "audio/g726-32": {
        source: "iana"
      },
      "audio/g726-40": {
        source: "iana"
      },
      "audio/g728": {
        source: "iana"
      },
      "audio/g729": {
        source: "iana"
      },
      "audio/g7291": {
        source: "iana"
      },
      "audio/g729d": {
        source: "iana"
      },
      "audio/g729e": {
        source: "iana"
      },
      "audio/gsm": {
        source: "iana"
      },
      "audio/gsm-efr": {
        source: "iana"
      },
      "audio/gsm-hr-08": {
        source: "iana"
      },
      "audio/ilbc": {
        source: "iana"
      },
      "audio/ip-mr_v2.5": {
        source: "iana"
      },
      "audio/isac": {
        source: "apache"
      },
      "audio/l16": {
        source: "iana"
      },
      "audio/l20": {
        source: "iana"
      },
      "audio/l24": {
        source: "iana",
        compressible: false
      },
      "audio/l8": {
        source: "iana"
      },
      "audio/lpc": {
        source: "iana"
      },
      "audio/melp": {
        source: "iana"
      },
      "audio/melp1200": {
        source: "iana"
      },
      "audio/melp2400": {
        source: "iana"
      },
      "audio/melp600": {
        source: "iana"
      },
      "audio/mhas": {
        source: "iana"
      },
      "audio/midi": {
        source: "apache",
        extensions: ["mid", "midi", "kar", "rmi"]
      },
      "audio/mobile-xmf": {
        source: "iana",
        extensions: ["mxmf"]
      },
      "audio/mp3": {
        compressible: false,
        extensions: ["mp3"]
      },
      "audio/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["m4a", "mp4a"]
      },
      "audio/mp4a-latm": {
        source: "iana"
      },
      "audio/mpa": {
        source: "iana"
      },
      "audio/mpa-robust": {
        source: "iana"
      },
      "audio/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
      },
      "audio/mpeg4-generic": {
        source: "iana"
      },
      "audio/musepack": {
        source: "apache"
      },
      "audio/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["oga", "ogg", "spx", "opus"]
      },
      "audio/opus": {
        source: "iana"
      },
      "audio/parityfec": {
        source: "iana"
      },
      "audio/pcma": {
        source: "iana"
      },
      "audio/pcma-wb": {
        source: "iana"
      },
      "audio/pcmu": {
        source: "iana"
      },
      "audio/pcmu-wb": {
        source: "iana"
      },
      "audio/prs.sid": {
        source: "iana"
      },
      "audio/qcelp": {
        source: "iana"
      },
      "audio/raptorfec": {
        source: "iana"
      },
      "audio/red": {
        source: "iana"
      },
      "audio/rtp-enc-aescm128": {
        source: "iana"
      },
      "audio/rtp-midi": {
        source: "iana"
      },
      "audio/rtploopback": {
        source: "iana"
      },
      "audio/rtx": {
        source: "iana"
      },
      "audio/s3m": {
        source: "apache",
        extensions: ["s3m"]
      },
      "audio/scip": {
        source: "iana"
      },
      "audio/silk": {
        source: "apache",
        extensions: ["sil"]
      },
      "audio/smv": {
        source: "iana"
      },
      "audio/smv-qcp": {
        source: "iana"
      },
      "audio/smv0": {
        source: "iana"
      },
      "audio/sofa": {
        source: "iana"
      },
      "audio/sp-midi": {
        source: "iana"
      },
      "audio/speex": {
        source: "iana"
      },
      "audio/t140c": {
        source: "iana"
      },
      "audio/t38": {
        source: "iana"
      },
      "audio/telephone-event": {
        source: "iana"
      },
      "audio/tetra_acelp": {
        source: "iana"
      },
      "audio/tetra_acelp_bb": {
        source: "iana"
      },
      "audio/tone": {
        source: "iana"
      },
      "audio/tsvcis": {
        source: "iana"
      },
      "audio/uemclip": {
        source: "iana"
      },
      "audio/ulpfec": {
        source: "iana"
      },
      "audio/usac": {
        source: "iana"
      },
      "audio/vdvi": {
        source: "iana"
      },
      "audio/vmr-wb": {
        source: "iana"
      },
      "audio/vnd.3gpp.iufp": {
        source: "iana"
      },
      "audio/vnd.4sb": {
        source: "iana"
      },
      "audio/vnd.audiokoz": {
        source: "iana"
      },
      "audio/vnd.celp": {
        source: "iana"
      },
      "audio/vnd.cisco.nse": {
        source: "iana"
      },
      "audio/vnd.cmles.radio-events": {
        source: "iana"
      },
      "audio/vnd.cns.anp1": {
        source: "iana"
      },
      "audio/vnd.cns.inf1": {
        source: "iana"
      },
      "audio/vnd.dece.audio": {
        source: "iana",
        extensions: ["uva", "uvva"]
      },
      "audio/vnd.digital-winds": {
        source: "iana",
        extensions: ["eol"]
      },
      "audio/vnd.dlna.adts": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.1": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.2": {
        source: "iana"
      },
      "audio/vnd.dolby.mlp": {
        source: "iana"
      },
      "audio/vnd.dolby.mps": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2x": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2z": {
        source: "iana"
      },
      "audio/vnd.dolby.pulse.1": {
        source: "iana"
      },
      "audio/vnd.dra": {
        source: "iana",
        extensions: ["dra"]
      },
      "audio/vnd.dts": {
        source: "iana",
        extensions: ["dts"]
      },
      "audio/vnd.dts.hd": {
        source: "iana",
        extensions: ["dtshd"]
      },
      "audio/vnd.dts.uhd": {
        source: "iana"
      },
      "audio/vnd.dvb.file": {
        source: "iana"
      },
      "audio/vnd.everad.plj": {
        source: "iana"
      },
      "audio/vnd.hns.audio": {
        source: "iana"
      },
      "audio/vnd.lucent.voice": {
        source: "iana",
        extensions: ["lvp"]
      },
      "audio/vnd.ms-playready.media.pya": {
        source: "iana",
        extensions: ["pya"]
      },
      "audio/vnd.nokia.mobile-xmf": {
        source: "iana"
      },
      "audio/vnd.nortel.vbk": {
        source: "iana"
      },
      "audio/vnd.nuera.ecelp4800": {
        source: "iana",
        extensions: ["ecelp4800"]
      },
      "audio/vnd.nuera.ecelp7470": {
        source: "iana",
        extensions: ["ecelp7470"]
      },
      "audio/vnd.nuera.ecelp9600": {
        source: "iana",
        extensions: ["ecelp9600"]
      },
      "audio/vnd.octel.sbc": {
        source: "iana"
      },
      "audio/vnd.presonus.multitrack": {
        source: "iana"
      },
      "audio/vnd.qcelp": {
        source: "iana"
      },
      "audio/vnd.rhetorex.32kadpcm": {
        source: "iana"
      },
      "audio/vnd.rip": {
        source: "iana",
        extensions: ["rip"]
      },
      "audio/vnd.rn-realaudio": {
        compressible: false
      },
      "audio/vnd.sealedmedia.softseal.mpeg": {
        source: "iana"
      },
      "audio/vnd.vmx.cvsd": {
        source: "iana"
      },
      "audio/vnd.wave": {
        compressible: false
      },
      "audio/vorbis": {
        source: "iana",
        compressible: false
      },
      "audio/vorbis-config": {
        source: "iana"
      },
      "audio/wav": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/wave": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/webm": {
        source: "apache",
        compressible: false,
        extensions: ["weba"]
      },
      "audio/x-aac": {
        source: "apache",
        compressible: false,
        extensions: ["aac"]
      },
      "audio/x-aiff": {
        source: "apache",
        extensions: ["aif", "aiff", "aifc"]
      },
      "audio/x-caf": {
        source: "apache",
        compressible: false,
        extensions: ["caf"]
      },
      "audio/x-flac": {
        source: "apache",
        extensions: ["flac"]
      },
      "audio/x-m4a": {
        source: "nginx",
        extensions: ["m4a"]
      },
      "audio/x-matroska": {
        source: "apache",
        extensions: ["mka"]
      },
      "audio/x-mpegurl": {
        source: "apache",
        extensions: ["m3u"]
      },
      "audio/x-ms-wax": {
        source: "apache",
        extensions: ["wax"]
      },
      "audio/x-ms-wma": {
        source: "apache",
        extensions: ["wma"]
      },
      "audio/x-pn-realaudio": {
        source: "apache",
        extensions: ["ram", "ra"]
      },
      "audio/x-pn-realaudio-plugin": {
        source: "apache",
        extensions: ["rmp"]
      },
      "audio/x-realaudio": {
        source: "nginx",
        extensions: ["ra"]
      },
      "audio/x-tta": {
        source: "apache"
      },
      "audio/x-wav": {
        source: "apache",
        extensions: ["wav"]
      },
      "audio/xm": {
        source: "apache",
        extensions: ["xm"]
      },
      "chemical/x-cdx": {
        source: "apache",
        extensions: ["cdx"]
      },
      "chemical/x-cif": {
        source: "apache",
        extensions: ["cif"]
      },
      "chemical/x-cmdf": {
        source: "apache",
        extensions: ["cmdf"]
      },
      "chemical/x-cml": {
        source: "apache",
        extensions: ["cml"]
      },
      "chemical/x-csml": {
        source: "apache",
        extensions: ["csml"]
      },
      "chemical/x-pdb": {
        source: "apache"
      },
      "chemical/x-xyz": {
        source: "apache",
        extensions: ["xyz"]
      },
      "font/collection": {
        source: "iana",
        extensions: ["ttc"]
      },
      "font/otf": {
        source: "iana",
        compressible: true,
        extensions: ["otf"]
      },
      "font/sfnt": {
        source: "iana"
      },
      "font/ttf": {
        source: "iana",
        compressible: true,
        extensions: ["ttf"]
      },
      "font/woff": {
        source: "iana",
        extensions: ["woff"]
      },
      "font/woff2": {
        source: "iana",
        extensions: ["woff2"]
      },
      "image/aces": {
        source: "iana",
        extensions: ["exr"]
      },
      "image/apng": {
        compressible: false,
        extensions: ["apng"]
      },
      "image/avci": {
        source: "iana",
        extensions: ["avci"]
      },
      "image/avcs": {
        source: "iana",
        extensions: ["avcs"]
      },
      "image/avif": {
        source: "iana",
        compressible: false,
        extensions: ["avif"]
      },
      "image/bmp": {
        source: "iana",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/cgm": {
        source: "iana",
        extensions: ["cgm"]
      },
      "image/dicom-rle": {
        source: "iana",
        extensions: ["drle"]
      },
      "image/emf": {
        source: "iana",
        extensions: ["emf"]
      },
      "image/fits": {
        source: "iana",
        extensions: ["fits"]
      },
      "image/g3fax": {
        source: "iana",
        extensions: ["g3"]
      },
      "image/gif": {
        source: "iana",
        compressible: false,
        extensions: ["gif"]
      },
      "image/heic": {
        source: "iana",
        extensions: ["heic"]
      },
      "image/heic-sequence": {
        source: "iana",
        extensions: ["heics"]
      },
      "image/heif": {
        source: "iana",
        extensions: ["heif"]
      },
      "image/heif-sequence": {
        source: "iana",
        extensions: ["heifs"]
      },
      "image/hej2k": {
        source: "iana",
        extensions: ["hej2"]
      },
      "image/hsj2": {
        source: "iana",
        extensions: ["hsj2"]
      },
      "image/ief": {
        source: "iana",
        extensions: ["ief"]
      },
      "image/jls": {
        source: "iana",
        extensions: ["jls"]
      },
      "image/jp2": {
        source: "iana",
        compressible: false,
        extensions: ["jp2", "jpg2"]
      },
      "image/jpeg": {
        source: "iana",
        compressible: false,
        extensions: ["jpeg", "jpg", "jpe"]
      },
      "image/jph": {
        source: "iana",
        extensions: ["jph"]
      },
      "image/jphc": {
        source: "iana",
        extensions: ["jhc"]
      },
      "image/jpm": {
        source: "iana",
        compressible: false,
        extensions: ["jpm"]
      },
      "image/jpx": {
        source: "iana",
        compressible: false,
        extensions: ["jpx", "jpf"]
      },
      "image/jxr": {
        source: "iana",
        extensions: ["jxr"]
      },
      "image/jxra": {
        source: "iana",
        extensions: ["jxra"]
      },
      "image/jxrs": {
        source: "iana",
        extensions: ["jxrs"]
      },
      "image/jxs": {
        source: "iana",
        extensions: ["jxs"]
      },
      "image/jxsc": {
        source: "iana",
        extensions: ["jxsc"]
      },
      "image/jxsi": {
        source: "iana",
        extensions: ["jxsi"]
      },
      "image/jxss": {
        source: "iana",
        extensions: ["jxss"]
      },
      "image/ktx": {
        source: "iana",
        extensions: ["ktx"]
      },
      "image/ktx2": {
        source: "iana",
        extensions: ["ktx2"]
      },
      "image/naplps": {
        source: "iana"
      },
      "image/pjpeg": {
        compressible: false
      },
      "image/png": {
        source: "iana",
        compressible: false,
        extensions: ["png"]
      },
      "image/prs.btif": {
        source: "iana",
        extensions: ["btif"]
      },
      "image/prs.pti": {
        source: "iana",
        extensions: ["pti"]
      },
      "image/pwg-raster": {
        source: "iana"
      },
      "image/sgi": {
        source: "apache",
        extensions: ["sgi"]
      },
      "image/svg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["svg", "svgz"]
      },
      "image/t38": {
        source: "iana",
        extensions: ["t38"]
      },
      "image/tiff": {
        source: "iana",
        compressible: false,
        extensions: ["tif", "tiff"]
      },
      "image/tiff-fx": {
        source: "iana",
        extensions: ["tfx"]
      },
      "image/vnd.adobe.photoshop": {
        source: "iana",
        compressible: true,
        extensions: ["psd"]
      },
      "image/vnd.airzip.accelerator.azv": {
        source: "iana",
        extensions: ["azv"]
      },
      "image/vnd.cns.inf2": {
        source: "iana"
      },
      "image/vnd.dece.graphic": {
        source: "iana",
        extensions: ["uvi", "uvvi", "uvg", "uvvg"]
      },
      "image/vnd.djvu": {
        source: "iana",
        extensions: ["djvu", "djv"]
      },
      "image/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "image/vnd.dwg": {
        source: "iana",
        extensions: ["dwg"]
      },
      "image/vnd.dxf": {
        source: "iana",
        extensions: ["dxf"]
      },
      "image/vnd.fastbidsheet": {
        source: "iana",
        extensions: ["fbs"]
      },
      "image/vnd.fpx": {
        source: "iana",
        extensions: ["fpx"]
      },
      "image/vnd.fst": {
        source: "iana",
        extensions: ["fst"]
      },
      "image/vnd.fujixerox.edmics-mmr": {
        source: "iana",
        extensions: ["mmr"]
      },
      "image/vnd.fujixerox.edmics-rlc": {
        source: "iana",
        extensions: ["rlc"]
      },
      "image/vnd.globalgraphics.pgb": {
        source: "iana"
      },
      "image/vnd.microsoft.icon": {
        source: "iana",
        compressible: true,
        extensions: ["ico"]
      },
      "image/vnd.mix": {
        source: "iana"
      },
      "image/vnd.mozilla.apng": {
        source: "iana"
      },
      "image/vnd.ms-dds": {
        compressible: true,
        extensions: ["dds"]
      },
      "image/vnd.ms-modi": {
        source: "iana",
        extensions: ["mdi"]
      },
      "image/vnd.ms-photo": {
        source: "apache",
        extensions: ["wdp"]
      },
      "image/vnd.net-fpx": {
        source: "iana",
        extensions: ["npx"]
      },
      "image/vnd.pco.b16": {
        source: "iana",
        extensions: ["b16"]
      },
      "image/vnd.radiance": {
        source: "iana"
      },
      "image/vnd.sealed.png": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.gif": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.jpg": {
        source: "iana"
      },
      "image/vnd.svf": {
        source: "iana"
      },
      "image/vnd.tencent.tap": {
        source: "iana",
        extensions: ["tap"]
      },
      "image/vnd.valve.source.texture": {
        source: "iana",
        extensions: ["vtf"]
      },
      "image/vnd.wap.wbmp": {
        source: "iana",
        extensions: ["wbmp"]
      },
      "image/vnd.xiff": {
        source: "iana",
        extensions: ["xif"]
      },
      "image/vnd.zbrush.pcx": {
        source: "iana",
        extensions: ["pcx"]
      },
      "image/webp": {
        source: "apache",
        extensions: ["webp"]
      },
      "image/wmf": {
        source: "iana",
        extensions: ["wmf"]
      },
      "image/x-3ds": {
        source: "apache",
        extensions: ["3ds"]
      },
      "image/x-cmu-raster": {
        source: "apache",
        extensions: ["ras"]
      },
      "image/x-cmx": {
        source: "apache",
        extensions: ["cmx"]
      },
      "image/x-freehand": {
        source: "apache",
        extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
      },
      "image/x-icon": {
        source: "apache",
        compressible: true,
        extensions: ["ico"]
      },
      "image/x-jng": {
        source: "nginx",
        extensions: ["jng"]
      },
      "image/x-mrsid-image": {
        source: "apache",
        extensions: ["sid"]
      },
      "image/x-ms-bmp": {
        source: "nginx",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/x-pcx": {
        source: "apache",
        extensions: ["pcx"]
      },
      "image/x-pict": {
        source: "apache",
        extensions: ["pic", "pct"]
      },
      "image/x-portable-anymap": {
        source: "apache",
        extensions: ["pnm"]
      },
      "image/x-portable-bitmap": {
        source: "apache",
        extensions: ["pbm"]
      },
      "image/x-portable-graymap": {
        source: "apache",
        extensions: ["pgm"]
      },
      "image/x-portable-pixmap": {
        source: "apache",
        extensions: ["ppm"]
      },
      "image/x-rgb": {
        source: "apache",
        extensions: ["rgb"]
      },
      "image/x-tga": {
        source: "apache",
        extensions: ["tga"]
      },
      "image/x-xbitmap": {
        source: "apache",
        extensions: ["xbm"]
      },
      "image/x-xcf": {
        compressible: false
      },
      "image/x-xpixmap": {
        source: "apache",
        extensions: ["xpm"]
      },
      "image/x-xwindowdump": {
        source: "apache",
        extensions: ["xwd"]
      },
      "message/cpim": {
        source: "iana"
      },
      "message/delivery-status": {
        source: "iana"
      },
      "message/disposition-notification": {
        source: "iana",
        extensions: [
          "disposition-notification"
        ]
      },
      "message/external-body": {
        source: "iana"
      },
      "message/feedback-report": {
        source: "iana"
      },
      "message/global": {
        source: "iana",
        extensions: ["u8msg"]
      },
      "message/global-delivery-status": {
        source: "iana",
        extensions: ["u8dsn"]
      },
      "message/global-disposition-notification": {
        source: "iana",
        extensions: ["u8mdn"]
      },
      "message/global-headers": {
        source: "iana",
        extensions: ["u8hdr"]
      },
      "message/http": {
        source: "iana",
        compressible: false
      },
      "message/imdn+xml": {
        source: "iana",
        compressible: true
      },
      "message/news": {
        source: "iana"
      },
      "message/partial": {
        source: "iana",
        compressible: false
      },
      "message/rfc822": {
        source: "iana",
        compressible: true,
        extensions: ["eml", "mime"]
      },
      "message/s-http": {
        source: "iana"
      },
      "message/sip": {
        source: "iana"
      },
      "message/sipfrag": {
        source: "iana"
      },
      "message/tracking-status": {
        source: "iana"
      },
      "message/vnd.si.simp": {
        source: "iana"
      },
      "message/vnd.wfa.wsc": {
        source: "iana",
        extensions: ["wsc"]
      },
      "model/3mf": {
        source: "iana",
        extensions: ["3mf"]
      },
      "model/e57": {
        source: "iana"
      },
      "model/gltf+json": {
        source: "iana",
        compressible: true,
        extensions: ["gltf"]
      },
      "model/gltf-binary": {
        source: "iana",
        compressible: true,
        extensions: ["glb"]
      },
      "model/iges": {
        source: "iana",
        compressible: false,
        extensions: ["igs", "iges"]
      },
      "model/mesh": {
        source: "iana",
        compressible: false,
        extensions: ["msh", "mesh", "silo"]
      },
      "model/mtl": {
        source: "iana",
        extensions: ["mtl"]
      },
      "model/obj": {
        source: "iana",
        extensions: ["obj"]
      },
      "model/step": {
        source: "iana"
      },
      "model/step+xml": {
        source: "iana",
        compressible: true,
        extensions: ["stpx"]
      },
      "model/step+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpz"]
      },
      "model/step-xml+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpxz"]
      },
      "model/stl": {
        source: "iana",
        extensions: ["stl"]
      },
      "model/vnd.collada+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dae"]
      },
      "model/vnd.dwf": {
        source: "iana",
        extensions: ["dwf"]
      },
      "model/vnd.flatland.3dml": {
        source: "iana"
      },
      "model/vnd.gdl": {
        source: "iana",
        extensions: ["gdl"]
      },
      "model/vnd.gs-gdl": {
        source: "apache"
      },
      "model/vnd.gs.gdl": {
        source: "iana"
      },
      "model/vnd.gtw": {
        source: "iana",
        extensions: ["gtw"]
      },
      "model/vnd.moml+xml": {
        source: "iana",
        compressible: true
      },
      "model/vnd.mts": {
        source: "iana",
        extensions: ["mts"]
      },
      "model/vnd.opengex": {
        source: "iana",
        extensions: ["ogex"]
      },
      "model/vnd.parasolid.transmit.binary": {
        source: "iana",
        extensions: ["x_b"]
      },
      "model/vnd.parasolid.transmit.text": {
        source: "iana",
        extensions: ["x_t"]
      },
      "model/vnd.pytha.pyox": {
        source: "iana"
      },
      "model/vnd.rosette.annotated-data-model": {
        source: "iana"
      },
      "model/vnd.sap.vds": {
        source: "iana",
        extensions: ["vds"]
      },
      "model/vnd.usdz+zip": {
        source: "iana",
        compressible: false,
        extensions: ["usdz"]
      },
      "model/vnd.valve.source.compiled-map": {
        source: "iana",
        extensions: ["bsp"]
      },
      "model/vnd.vtu": {
        source: "iana",
        extensions: ["vtu"]
      },
      "model/vrml": {
        source: "iana",
        compressible: false,
        extensions: ["wrl", "vrml"]
      },
      "model/x3d+binary": {
        source: "apache",
        compressible: false,
        extensions: ["x3db", "x3dbz"]
      },
      "model/x3d+fastinfoset": {
        source: "iana",
        extensions: ["x3db"]
      },
      "model/x3d+vrml": {
        source: "apache",
        compressible: false,
        extensions: ["x3dv", "x3dvz"]
      },
      "model/x3d+xml": {
        source: "iana",
        compressible: true,
        extensions: ["x3d", "x3dz"]
      },
      "model/x3d-vrml": {
        source: "iana",
        extensions: ["x3dv"]
      },
      "multipart/alternative": {
        source: "iana",
        compressible: false
      },
      "multipart/appledouble": {
        source: "iana"
      },
      "multipart/byteranges": {
        source: "iana"
      },
      "multipart/digest": {
        source: "iana"
      },
      "multipart/encrypted": {
        source: "iana",
        compressible: false
      },
      "multipart/form-data": {
        source: "iana",
        compressible: false
      },
      "multipart/header-set": {
        source: "iana"
      },
      "multipart/mixed": {
        source: "iana"
      },
      "multipart/multilingual": {
        source: "iana"
      },
      "multipart/parallel": {
        source: "iana"
      },
      "multipart/related": {
        source: "iana",
        compressible: false
      },
      "multipart/report": {
        source: "iana"
      },
      "multipart/signed": {
        source: "iana",
        compressible: false
      },
      "multipart/vnd.bint.med-plus": {
        source: "iana"
      },
      "multipart/voice-message": {
        source: "iana"
      },
      "multipart/x-mixed-replace": {
        source: "iana"
      },
      "text/1d-interleaved-parityfec": {
        source: "iana"
      },
      "text/cache-manifest": {
        source: "iana",
        compressible: true,
        extensions: ["appcache", "manifest"]
      },
      "text/calendar": {
        source: "iana",
        extensions: ["ics", "ifb"]
      },
      "text/calender": {
        compressible: true
      },
      "text/cmd": {
        compressible: true
      },
      "text/coffeescript": {
        extensions: ["coffee", "litcoffee"]
      },
      "text/cql": {
        source: "iana"
      },
      "text/cql-expression": {
        source: "iana"
      },
      "text/cql-identifier": {
        source: "iana"
      },
      "text/css": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["css"]
      },
      "text/csv": {
        source: "iana",
        compressible: true,
        extensions: ["csv"]
      },
      "text/csv-schema": {
        source: "iana"
      },
      "text/directory": {
        source: "iana"
      },
      "text/dns": {
        source: "iana"
      },
      "text/ecmascript": {
        source: "iana"
      },
      "text/encaprtp": {
        source: "iana"
      },
      "text/enriched": {
        source: "iana"
      },
      "text/fhirpath": {
        source: "iana"
      },
      "text/flexfec": {
        source: "iana"
      },
      "text/fwdred": {
        source: "iana"
      },
      "text/gff3": {
        source: "iana"
      },
      "text/grammar-ref-list": {
        source: "iana"
      },
      "text/html": {
        source: "iana",
        compressible: true,
        extensions: ["html", "htm", "shtml"]
      },
      "text/jade": {
        extensions: ["jade"]
      },
      "text/javascript": {
        source: "iana",
        compressible: true
      },
      "text/jcr-cnd": {
        source: "iana"
      },
      "text/jsx": {
        compressible: true,
        extensions: ["jsx"]
      },
      "text/less": {
        compressible: true,
        extensions: ["less"]
      },
      "text/markdown": {
        source: "iana",
        compressible: true,
        extensions: ["markdown", "md"]
      },
      "text/mathml": {
        source: "nginx",
        extensions: ["mml"]
      },
      "text/mdx": {
        compressible: true,
        extensions: ["mdx"]
      },
      "text/mizar": {
        source: "iana"
      },
      "text/n3": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["n3"]
      },
      "text/parameters": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/parityfec": {
        source: "iana"
      },
      "text/plain": {
        source: "iana",
        compressible: true,
        extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
      },
      "text/provenance-notation": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/prs.fallenstein.rst": {
        source: "iana"
      },
      "text/prs.lines.tag": {
        source: "iana",
        extensions: ["dsc"]
      },
      "text/prs.prop.logic": {
        source: "iana"
      },
      "text/raptorfec": {
        source: "iana"
      },
      "text/red": {
        source: "iana"
      },
      "text/rfc822-headers": {
        source: "iana"
      },
      "text/richtext": {
        source: "iana",
        compressible: true,
        extensions: ["rtx"]
      },
      "text/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "text/rtp-enc-aescm128": {
        source: "iana"
      },
      "text/rtploopback": {
        source: "iana"
      },
      "text/rtx": {
        source: "iana"
      },
      "text/sgml": {
        source: "iana",
        extensions: ["sgml", "sgm"]
      },
      "text/shaclc": {
        source: "iana"
      },
      "text/shex": {
        source: "iana",
        extensions: ["shex"]
      },
      "text/slim": {
        extensions: ["slim", "slm"]
      },
      "text/spdx": {
        source: "iana",
        extensions: ["spdx"]
      },
      "text/strings": {
        source: "iana"
      },
      "text/stylus": {
        extensions: ["stylus", "styl"]
      },
      "text/t140": {
        source: "iana"
      },
      "text/tab-separated-values": {
        source: "iana",
        compressible: true,
        extensions: ["tsv"]
      },
      "text/troff": {
        source: "iana",
        extensions: ["t", "tr", "roff", "man", "me", "ms"]
      },
      "text/turtle": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["ttl"]
      },
      "text/ulpfec": {
        source: "iana"
      },
      "text/uri-list": {
        source: "iana",
        compressible: true,
        extensions: ["uri", "uris", "urls"]
      },
      "text/vcard": {
        source: "iana",
        compressible: true,
        extensions: ["vcard"]
      },
      "text/vnd.a": {
        source: "iana"
      },
      "text/vnd.abc": {
        source: "iana"
      },
      "text/vnd.ascii-art": {
        source: "iana"
      },
      "text/vnd.curl": {
        source: "iana",
        extensions: ["curl"]
      },
      "text/vnd.curl.dcurl": {
        source: "apache",
        extensions: ["dcurl"]
      },
      "text/vnd.curl.mcurl": {
        source: "apache",
        extensions: ["mcurl"]
      },
      "text/vnd.curl.scurl": {
        source: "apache",
        extensions: ["scurl"]
      },
      "text/vnd.debian.copyright": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.dmclientscript": {
        source: "iana"
      },
      "text/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "text/vnd.esmertec.theme-descriptor": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.familysearch.gedcom": {
        source: "iana",
        extensions: ["ged"]
      },
      "text/vnd.ficlab.flt": {
        source: "iana"
      },
      "text/vnd.fly": {
        source: "iana",
        extensions: ["fly"]
      },
      "text/vnd.fmi.flexstor": {
        source: "iana",
        extensions: ["flx"]
      },
      "text/vnd.gml": {
        source: "iana"
      },
      "text/vnd.graphviz": {
        source: "iana",
        extensions: ["gv"]
      },
      "text/vnd.hans": {
        source: "iana"
      },
      "text/vnd.hgl": {
        source: "iana"
      },
      "text/vnd.in3d.3dml": {
        source: "iana",
        extensions: ["3dml"]
      },
      "text/vnd.in3d.spot": {
        source: "iana",
        extensions: ["spot"]
      },
      "text/vnd.iptc.newsml": {
        source: "iana"
      },
      "text/vnd.iptc.nitf": {
        source: "iana"
      },
      "text/vnd.latex-z": {
        source: "iana"
      },
      "text/vnd.motorola.reflex": {
        source: "iana"
      },
      "text/vnd.ms-mediapackage": {
        source: "iana"
      },
      "text/vnd.net2phone.commcenter.command": {
        source: "iana"
      },
      "text/vnd.radisys.msml-basic-layout": {
        source: "iana"
      },
      "text/vnd.senx.warpscript": {
        source: "iana"
      },
      "text/vnd.si.uricatalogue": {
        source: "iana"
      },
      "text/vnd.sosi": {
        source: "iana"
      },
      "text/vnd.sun.j2me.app-descriptor": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["jad"]
      },
      "text/vnd.trolltech.linguist": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.wap.si": {
        source: "iana"
      },
      "text/vnd.wap.sl": {
        source: "iana"
      },
      "text/vnd.wap.wml": {
        source: "iana",
        extensions: ["wml"]
      },
      "text/vnd.wap.wmlscript": {
        source: "iana",
        extensions: ["wmls"]
      },
      "text/vtt": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["vtt"]
      },
      "text/x-asm": {
        source: "apache",
        extensions: ["s", "asm"]
      },
      "text/x-c": {
        source: "apache",
        extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
      },
      "text/x-component": {
        source: "nginx",
        extensions: ["htc"]
      },
      "text/x-fortran": {
        source: "apache",
        extensions: ["f", "for", "f77", "f90"]
      },
      "text/x-gwt-rpc": {
        compressible: true
      },
      "text/x-handlebars-template": {
        extensions: ["hbs"]
      },
      "text/x-java-source": {
        source: "apache",
        extensions: ["java"]
      },
      "text/x-jquery-tmpl": {
        compressible: true
      },
      "text/x-lua": {
        extensions: ["lua"]
      },
      "text/x-markdown": {
        compressible: true,
        extensions: ["mkd"]
      },
      "text/x-nfo": {
        source: "apache",
        extensions: ["nfo"]
      },
      "text/x-opml": {
        source: "apache",
        extensions: ["opml"]
      },
      "text/x-org": {
        compressible: true,
        extensions: ["org"]
      },
      "text/x-pascal": {
        source: "apache",
        extensions: ["p", "pas"]
      },
      "text/x-processing": {
        compressible: true,
        extensions: ["pde"]
      },
      "text/x-sass": {
        extensions: ["sass"]
      },
      "text/x-scss": {
        extensions: ["scss"]
      },
      "text/x-setext": {
        source: "apache",
        extensions: ["etx"]
      },
      "text/x-sfv": {
        source: "apache",
        extensions: ["sfv"]
      },
      "text/x-suse-ymp": {
        compressible: true,
        extensions: ["ymp"]
      },
      "text/x-uuencode": {
        source: "apache",
        extensions: ["uu"]
      },
      "text/x-vcalendar": {
        source: "apache",
        extensions: ["vcs"]
      },
      "text/x-vcard": {
        source: "apache",
        extensions: ["vcf"]
      },
      "text/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml"]
      },
      "text/xml-external-parsed-entity": {
        source: "iana"
      },
      "text/yaml": {
        compressible: true,
        extensions: ["yaml", "yml"]
      },
      "video/1d-interleaved-parityfec": {
        source: "iana"
      },
      "video/3gpp": {
        source: "iana",
        extensions: ["3gp", "3gpp"]
      },
      "video/3gpp-tt": {
        source: "iana"
      },
      "video/3gpp2": {
        source: "iana",
        extensions: ["3g2"]
      },
      "video/av1": {
        source: "iana"
      },
      "video/bmpeg": {
        source: "iana"
      },
      "video/bt656": {
        source: "iana"
      },
      "video/celb": {
        source: "iana"
      },
      "video/dv": {
        source: "iana"
      },
      "video/encaprtp": {
        source: "iana"
      },
      "video/ffv1": {
        source: "iana"
      },
      "video/flexfec": {
        source: "iana"
      },
      "video/h261": {
        source: "iana",
        extensions: ["h261"]
      },
      "video/h263": {
        source: "iana",
        extensions: ["h263"]
      },
      "video/h263-1998": {
        source: "iana"
      },
      "video/h263-2000": {
        source: "iana"
      },
      "video/h264": {
        source: "iana",
        extensions: ["h264"]
      },
      "video/h264-rcdo": {
        source: "iana"
      },
      "video/h264-svc": {
        source: "iana"
      },
      "video/h265": {
        source: "iana"
      },
      "video/iso.segment": {
        source: "iana",
        extensions: ["m4s"]
      },
      "video/jpeg": {
        source: "iana",
        extensions: ["jpgv"]
      },
      "video/jpeg2000": {
        source: "iana"
      },
      "video/jpm": {
        source: "apache",
        extensions: ["jpm", "jpgm"]
      },
      "video/jxsv": {
        source: "iana"
      },
      "video/mj2": {
        source: "iana",
        extensions: ["mj2", "mjp2"]
      },
      "video/mp1s": {
        source: "iana"
      },
      "video/mp2p": {
        source: "iana"
      },
      "video/mp2t": {
        source: "iana",
        extensions: ["ts"]
      },
      "video/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["mp4", "mp4v", "mpg4"]
      },
      "video/mp4v-es": {
        source: "iana"
      },
      "video/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
      },
      "video/mpeg4-generic": {
        source: "iana"
      },
      "video/mpv": {
        source: "iana"
      },
      "video/nv": {
        source: "iana"
      },
      "video/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogv"]
      },
      "video/parityfec": {
        source: "iana"
      },
      "video/pointer": {
        source: "iana"
      },
      "video/quicktime": {
        source: "iana",
        compressible: false,
        extensions: ["qt", "mov"]
      },
      "video/raptorfec": {
        source: "iana"
      },
      "video/raw": {
        source: "iana"
      },
      "video/rtp-enc-aescm128": {
        source: "iana"
      },
      "video/rtploopback": {
        source: "iana"
      },
      "video/rtx": {
        source: "iana"
      },
      "video/scip": {
        source: "iana"
      },
      "video/smpte291": {
        source: "iana"
      },
      "video/smpte292m": {
        source: "iana"
      },
      "video/ulpfec": {
        source: "iana"
      },
      "video/vc1": {
        source: "iana"
      },
      "video/vc2": {
        source: "iana"
      },
      "video/vnd.cctv": {
        source: "iana"
      },
      "video/vnd.dece.hd": {
        source: "iana",
        extensions: ["uvh", "uvvh"]
      },
      "video/vnd.dece.mobile": {
        source: "iana",
        extensions: ["uvm", "uvvm"]
      },
      "video/vnd.dece.mp4": {
        source: "iana"
      },
      "video/vnd.dece.pd": {
        source: "iana",
        extensions: ["uvp", "uvvp"]
      },
      "video/vnd.dece.sd": {
        source: "iana",
        extensions: ["uvs", "uvvs"]
      },
      "video/vnd.dece.video": {
        source: "iana",
        extensions: ["uvv", "uvvv"]
      },
      "video/vnd.directv.mpeg": {
        source: "iana"
      },
      "video/vnd.directv.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dlna.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dvb.file": {
        source: "iana",
        extensions: ["dvb"]
      },
      "video/vnd.fvt": {
        source: "iana",
        extensions: ["fvt"]
      },
      "video/vnd.hns.video": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsavc": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsmpeg2": {
        source: "iana"
      },
      "video/vnd.motorola.video": {
        source: "iana"
      },
      "video/vnd.motorola.videop": {
        source: "iana"
      },
      "video/vnd.mpegurl": {
        source: "iana",
        extensions: ["mxu", "m4u"]
      },
      "video/vnd.ms-playready.media.pyv": {
        source: "iana",
        extensions: ["pyv"]
      },
      "video/vnd.nokia.interleaved-multimedia": {
        source: "iana"
      },
      "video/vnd.nokia.mp4vr": {
        source: "iana"
      },
      "video/vnd.nokia.videovoip": {
        source: "iana"
      },
      "video/vnd.objectvideo": {
        source: "iana"
      },
      "video/vnd.radgamettools.bink": {
        source: "iana"
      },
      "video/vnd.radgamettools.smacker": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg1": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg4": {
        source: "iana"
      },
      "video/vnd.sealed.swf": {
        source: "iana"
      },
      "video/vnd.sealedmedia.softseal.mov": {
        source: "iana"
      },
      "video/vnd.uvvu.mp4": {
        source: "iana",
        extensions: ["uvu", "uvvu"]
      },
      "video/vnd.vivo": {
        source: "iana",
        extensions: ["viv"]
      },
      "video/vnd.youtube.yt": {
        source: "iana"
      },
      "video/vp8": {
        source: "iana"
      },
      "video/vp9": {
        source: "iana"
      },
      "video/webm": {
        source: "apache",
        compressible: false,
        extensions: ["webm"]
      },
      "video/x-f4v": {
        source: "apache",
        extensions: ["f4v"]
      },
      "video/x-fli": {
        source: "apache",
        extensions: ["fli"]
      },
      "video/x-flv": {
        source: "apache",
        compressible: false,
        extensions: ["flv"]
      },
      "video/x-m4v": {
        source: "apache",
        extensions: ["m4v"]
      },
      "video/x-matroska": {
        source: "apache",
        compressible: false,
        extensions: ["mkv", "mk3d", "mks"]
      },
      "video/x-mng": {
        source: "apache",
        extensions: ["mng"]
      },
      "video/x-ms-asf": {
        source: "apache",
        extensions: ["asf", "asx"]
      },
      "video/x-ms-vob": {
        source: "apache",
        extensions: ["vob"]
      },
      "video/x-ms-wm": {
        source: "apache",
        extensions: ["wm"]
      },
      "video/x-ms-wmv": {
        source: "apache",
        compressible: false,
        extensions: ["wmv"]
      },
      "video/x-ms-wmx": {
        source: "apache",
        extensions: ["wmx"]
      },
      "video/x-ms-wvx": {
        source: "apache",
        extensions: ["wvx"]
      },
      "video/x-msvideo": {
        source: "apache",
        extensions: ["avi"]
      },
      "video/x-sgi-movie": {
        source: "apache",
        extensions: ["movie"]
      },
      "video/x-smv": {
        source: "apache",
        extensions: ["smv"]
      },
      "x-conference/x-cooltalk": {
        source: "apache",
        extensions: ["ice"]
      },
      "x-shader/x-fragment": {
        compressible: true
      },
      "x-shader/x-vertex": {
        compressible: true
      }
    };
  }
});

// node_modules/mime-db/index.js
var require_mime_db = __commonJS({
  "node_modules/mime-db/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = require_db();
  }
});

// node_modules/mime-types/index.js
var require_mime_types = __commonJS({
  "node_modules/mime-types/index.js"(exports2) {
    "use strict";
    init_cjs_shims();
    var db = require_mime_db();
    var extname = require("path").extname;
    var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
    var TEXT_TYPE_REGEXP = /^text\//i;
    exports2.charset = charset;
    exports2.charsets = { lookup: charset };
    exports2.contentType = contentType;
    exports2.extension = extension;
    exports2.extensions = /* @__PURE__ */ Object.create(null);
    exports2.lookup = lookup;
    exports2.types = /* @__PURE__ */ Object.create(null);
    populateMaps(exports2.extensions, exports2.types);
    function charset(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var mime = match && db[match[1].toLowerCase()];
      if (mime && mime.charset) {
        return mime.charset;
      }
      if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return "UTF-8";
      }
      return false;
    }
    function contentType(str) {
      if (!str || typeof str !== "string") {
        return false;
      }
      var mime = str.indexOf("/") === -1 ? exports2.lookup(str) : str;
      if (!mime) {
        return false;
      }
      if (mime.indexOf("charset") === -1) {
        var charset2 = exports2.charset(mime);
        if (charset2) mime += "; charset=" + charset2.toLowerCase();
      }
      return mime;
    }
    function extension(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var exts = match && exports2.extensions[match[1].toLowerCase()];
      if (!exts || !exts.length) {
        return false;
      }
      return exts[0];
    }
    function lookup(path) {
      if (!path || typeof path !== "string") {
        return false;
      }
      var extension2 = extname("x." + path).toLowerCase().substr(1);
      if (!extension2) {
        return false;
      }
      return exports2.types[extension2] || false;
    }
    function populateMaps(extensions, types) {
      var preference = ["nginx", "apache", void 0, "iana"];
      Object.keys(db).forEach(function forEachMimeType(type) {
        var mime = db[type];
        var exts = mime.extensions;
        if (!exts || !exts.length) {
          return;
        }
        extensions[type] = exts;
        for (var i = 0; i < exts.length; i++) {
          var extension2 = exts[i];
          if (types[extension2]) {
            var from = preference.indexOf(db[types[extension2]].source);
            var to = preference.indexOf(mime.source);
            if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
              continue;
            }
          }
          types[extension2] = type;
        }
      });
    }
  }
});

// node_modules/asynckit/lib/defer.js
var require_defer = __commonJS({
  "node_modules/asynckit/lib/defer.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = defer;
    function defer(fn) {
      var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
      if (nextTick) {
        nextTick(fn);
      } else {
        setTimeout(fn, 0);
      }
    }
  }
});

// node_modules/asynckit/lib/async.js
var require_async = __commonJS({
  "node_modules/asynckit/lib/async.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var defer = require_defer();
    module2.exports = async;
    function async(callback) {
      var isAsync = false;
      defer(function() {
        isAsync = true;
      });
      return function async_callback(err, result) {
        if (isAsync) {
          callback(err, result);
        } else {
          defer(function nextTick_callback() {
            callback(err, result);
          });
        }
      };
    }
  }
});

// node_modules/asynckit/lib/abort.js
var require_abort = __commonJS({
  "node_modules/asynckit/lib/abort.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = abort;
    function abort(state) {
      Object.keys(state.jobs).forEach(clean.bind(state));
      state.jobs = {};
    }
    function clean(key) {
      if (typeof this.jobs[key] == "function") {
        this.jobs[key]();
      }
    }
  }
});

// node_modules/asynckit/lib/iterate.js
var require_iterate = __commonJS({
  "node_modules/asynckit/lib/iterate.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var async = require_async();
    var abort = require_abort();
    module2.exports = iterate;
    function iterate(list, iterator, state, callback) {
      var key = state["keyedList"] ? state["keyedList"][state.index] : state.index;
      state.jobs[key] = runJob(iterator, key, list[key], function(error, output) {
        if (!(key in state.jobs)) {
          return;
        }
        delete state.jobs[key];
        if (error) {
          abort(state);
        } else {
          state.results[key] = output;
        }
        callback(error, state.results);
      });
    }
    function runJob(iterator, key, item, callback) {
      var aborter;
      if (iterator.length == 2) {
        aborter = iterator(item, async(callback));
      } else {
        aborter = iterator(item, key, async(callback));
      }
      return aborter;
    }
  }
});

// node_modules/asynckit/lib/state.js
var require_state = __commonJS({
  "node_modules/asynckit/lib/state.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = state;
    function state(list, sortMethod) {
      var isNamedList = !Array.isArray(list), initState = {
        index: 0,
        keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
        jobs: {},
        results: isNamedList ? {} : [],
        size: isNamedList ? Object.keys(list).length : list.length
      };
      if (sortMethod) {
        initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
          return sortMethod(list[a], list[b]);
        });
      }
      return initState;
    }
  }
});

// node_modules/asynckit/lib/terminator.js
var require_terminator = __commonJS({
  "node_modules/asynckit/lib/terminator.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var abort = require_abort();
    var async = require_async();
    module2.exports = terminator;
    function terminator(callback) {
      if (!Object.keys(this.jobs).length) {
        return;
      }
      this.index = this.size;
      abort(this);
      async(callback)(null, this.results);
    }
  }
});

// node_modules/asynckit/parallel.js
var require_parallel = __commonJS({
  "node_modules/asynckit/parallel.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var iterate = require_iterate();
    var initState = require_state();
    var terminator = require_terminator();
    module2.exports = parallel;
    function parallel(list, iterator, callback) {
      var state = initState(list);
      while (state.index < (state["keyedList"] || list).length) {
        iterate(list, iterator, state, function(error, result) {
          if (error) {
            callback(error, result);
            return;
          }
          if (Object.keys(state.jobs).length === 0) {
            callback(null, state.results);
            return;
          }
        });
        state.index++;
      }
      return terminator.bind(state, callback);
    }
  }
});

// node_modules/asynckit/serialOrdered.js
var require_serialOrdered = __commonJS({
  "node_modules/asynckit/serialOrdered.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var iterate = require_iterate();
    var initState = require_state();
    var terminator = require_terminator();
    module2.exports = serialOrdered;
    module2.exports.ascending = ascending;
    module2.exports.descending = descending;
    function serialOrdered(list, iterator, sortMethod, callback) {
      var state = initState(list, sortMethod);
      iterate(list, iterator, state, function iteratorHandler(error, result) {
        if (error) {
          callback(error, result);
          return;
        }
        state.index++;
        if (state.index < (state["keyedList"] || list).length) {
          iterate(list, iterator, state, iteratorHandler);
          return;
        }
        callback(null, state.results);
      });
      return terminator.bind(state, callback);
    }
    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    function descending(a, b) {
      return -1 * ascending(a, b);
    }
  }
});

// node_modules/asynckit/serial.js
var require_serial = __commonJS({
  "node_modules/asynckit/serial.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var serialOrdered = require_serialOrdered();
    module2.exports = serial;
    function serial(list, iterator, callback) {
      return serialOrdered(list, iterator, null, callback);
    }
  }
});

// node_modules/asynckit/index.js
var require_asynckit = __commonJS({
  "node_modules/asynckit/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = {
      parallel: require_parallel(),
      serial: require_serial(),
      serialOrdered: require_serialOrdered()
    };
  }
});

// node_modules/es-object-atoms/index.js
var require_es_object_atoms = __commonJS({
  "node_modules/es-object-atoms/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Object;
  }
});

// node_modules/es-errors/index.js
var require_es_errors = __commonJS({
  "node_modules/es-errors/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Error;
  }
});

// node_modules/es-errors/eval.js
var require_eval = __commonJS({
  "node_modules/es-errors/eval.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = EvalError;
  }
});

// node_modules/es-errors/range.js
var require_range = __commonJS({
  "node_modules/es-errors/range.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = RangeError;
  }
});

// node_modules/es-errors/ref.js
var require_ref = __commonJS({
  "node_modules/es-errors/ref.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = ReferenceError;
  }
});

// node_modules/es-errors/syntax.js
var require_syntax = __commonJS({
  "node_modules/es-errors/syntax.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = SyntaxError;
  }
});

// node_modules/es-errors/type.js
var require_type = __commonJS({
  "node_modules/es-errors/type.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = TypeError;
  }
});

// node_modules/es-errors/uri.js
var require_uri = __commonJS({
  "node_modules/es-errors/uri.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = URIError;
  }
});

// node_modules/math-intrinsics/abs.js
var require_abs = __commonJS({
  "node_modules/math-intrinsics/abs.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Math.abs;
  }
});

// node_modules/math-intrinsics/floor.js
var require_floor = __commonJS({
  "node_modules/math-intrinsics/floor.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Math.floor;
  }
});

// node_modules/math-intrinsics/max.js
var require_max = __commonJS({
  "node_modules/math-intrinsics/max.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Math.max;
  }
});

// node_modules/math-intrinsics/min.js
var require_min = __commonJS({
  "node_modules/math-intrinsics/min.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Math.min;
  }
});

// node_modules/math-intrinsics/pow.js
var require_pow = __commonJS({
  "node_modules/math-intrinsics/pow.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Math.pow;
  }
});

// node_modules/math-intrinsics/round.js
var require_round = __commonJS({
  "node_modules/math-intrinsics/round.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Math.round;
  }
});

// node_modules/math-intrinsics/isNaN.js
var require_isNaN = __commonJS({
  "node_modules/math-intrinsics/isNaN.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Number.isNaN || function isNaN2(a) {
      return a !== a;
    };
  }
});

// node_modules/math-intrinsics/sign.js
var require_sign = __commonJS({
  "node_modules/math-intrinsics/sign.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var $isNaN = require_isNaN();
    module2.exports = function sign(number) {
      if ($isNaN(number) || number === 0) {
        return number;
      }
      return number < 0 ? -1 : 1;
    };
  }
});

// node_modules/gopd/gOPD.js
var require_gOPD = __commonJS({
  "node_modules/gopd/gOPD.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Object.getOwnPropertyDescriptor;
  }
});

// node_modules/gopd/index.js
var require_gopd = __commonJS({
  "node_modules/gopd/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var $gOPD = require_gOPD();
    if ($gOPD) {
      try {
        $gOPD([], "length");
      } catch (e) {
        $gOPD = null;
      }
    }
    module2.exports = $gOPD;
  }
});

// node_modules/es-define-property/index.js
var require_es_define_property = __commonJS({
  "node_modules/es-define-property/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var $defineProperty = Object.defineProperty || false;
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", { value: 1 });
      } catch (e) {
        $defineProperty = false;
      }
    }
    module2.exports = $defineProperty;
  }
});

// node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  "node_modules/has-symbols/shams.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = function hasSymbols() {
      if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = /* @__PURE__ */ Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (var _ in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = (
          /** @type {PropertyDescriptor} */
          Object.getOwnPropertyDescriptor(obj, sym)
        );
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS({
  "node_modules/has-symbols/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var origSymbol = typeof Symbol !== "undefined" && Symbol;
    var hasSymbolSham = require_shams();
    module2.exports = function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof /* @__PURE__ */ Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    };
  }
});

// node_modules/get-proto/Reflect.getPrototypeOf.js
var require_Reflect_getPrototypeOf = __commonJS({
  "node_modules/get-proto/Reflect.getPrototypeOf.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
  }
});

// node_modules/get-proto/Object.getPrototypeOf.js
var require_Object_getPrototypeOf = __commonJS({
  "node_modules/get-proto/Object.getPrototypeOf.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var $Object = require_es_object_atoms();
    module2.exports = $Object.getPrototypeOf || null;
  }
});

// node_modules/function-bind/implementation.js
var require_implementation = __commonJS({
  "node_modules/function-bind/implementation.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max = Math.max;
    var funcType = "[object Function]";
    var concatty = function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    };
    var slicy = function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    };
    var joiny = function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    };
    module2.exports = function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          var result = target.apply(
            this,
            concatty(args, arguments)
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target.apply(
          that,
          concatty(args, arguments)
        );
      };
      var boundLength = max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = function Empty2() {
        };
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
  }
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "node_modules/function-bind/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var implementation = require_implementation();
    module2.exports = Function.prototype.bind || implementation;
  }
});

// node_modules/call-bind-apply-helpers/functionCall.js
var require_functionCall = __commonJS({
  "node_modules/call-bind-apply-helpers/functionCall.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Function.prototype.call;
  }
});

// node_modules/call-bind-apply-helpers/functionApply.js
var require_functionApply = __commonJS({
  "node_modules/call-bind-apply-helpers/functionApply.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = Function.prototype.apply;
  }
});

// node_modules/call-bind-apply-helpers/reflectApply.js
var require_reflectApply = __commonJS({
  "node_modules/call-bind-apply-helpers/reflectApply.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
  }
});

// node_modules/call-bind-apply-helpers/actualApply.js
var require_actualApply = __commonJS({
  "node_modules/call-bind-apply-helpers/actualApply.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var bind = require_function_bind();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var $reflectApply = require_reflectApply();
    module2.exports = $reflectApply || bind.call($call, $apply);
  }
});

// node_modules/call-bind-apply-helpers/index.js
var require_call_bind_apply_helpers = __commonJS({
  "node_modules/call-bind-apply-helpers/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var bind = require_function_bind();
    var $TypeError = require_type();
    var $call = require_functionCall();
    var $actualApply = require_actualApply();
    module2.exports = function callBindBasic(args) {
      if (args.length < 1 || typeof args[0] !== "function") {
        throw new $TypeError("a function is required");
      }
      return $actualApply(bind, $call, args);
    };
  }
});

// node_modules/dunder-proto/get.js
var require_get = __commonJS({
  "node_modules/dunder-proto/get.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var callBind = require_call_bind_apply_helpers();
    var gOPD = require_gopd();
    var hasProtoAccessor;
    try {
      hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
      [].__proto__ === Array.prototype;
    } catch (e) {
      if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
        throw e;
      }
    }
    var desc = !!hasProtoAccessor && gOPD && gOPD(
      Object.prototype,
      /** @type {keyof typeof Object.prototype} */
      "__proto__"
    );
    var $Object = Object;
    var $getPrototypeOf = $Object.getPrototypeOf;
    module2.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
      /** @type {import('./get')} */
      function getDunder(value) {
        return $getPrototypeOf(value == null ? value : $Object(value));
      }
    ) : false;
  }
});

// node_modules/get-proto/index.js
var require_get_proto = __commonJS({
  "node_modules/get-proto/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var reflectGetProto = require_Reflect_getPrototypeOf();
    var originalGetProto = require_Object_getPrototypeOf();
    var getDunderProto = require_get();
    module2.exports = reflectGetProto ? function getProto(O) {
      return reflectGetProto(O);
    } : originalGetProto ? function getProto(O) {
      if (!O || typeof O !== "object" && typeof O !== "function") {
        throw new TypeError("getProto: not an object");
      }
      return originalGetProto(O);
    } : getDunderProto ? function getProto(O) {
      return getDunderProto(O);
    } : null;
  }
});

// node_modules/hasown/index.js
var require_hasown = __commonJS({
  "node_modules/hasown/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = require_function_bind();
    module2.exports = bind.call(call, $hasOwn);
  }
});

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS({
  "node_modules/get-intrinsic/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var undefined2;
    var $Object = require_es_object_atoms();
    var $Error = require_es_errors();
    var $EvalError = require_eval();
    var $RangeError = require_range();
    var $ReferenceError = require_ref();
    var $SyntaxError = require_syntax();
    var $TypeError = require_type();
    var $URIError = require_uri();
    var abs = require_abs();
    var floor = require_floor();
    var max = require_max();
    var min = require_min();
    var pow = require_pow();
    var round2 = require_round();
    var sign = require_sign();
    var $Function = Function;
    var getEvalledConstructor = function(expressionSyntax) {
      try {
        return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
      } catch (e) {
      }
    };
    var $gOPD = require_gopd();
    var $defineProperty = require_es_define_property();
    var throwTypeError = function() {
      throw new $TypeError();
    };
    var ThrowTypeError = $gOPD ? (function() {
      try {
        arguments.callee;
        return throwTypeError;
      } catch (calleeThrows) {
        try {
          return $gOPD(arguments, "callee").get;
        } catch (gOPDthrows) {
          return throwTypeError;
        }
      }
    })() : throwTypeError;
    var hasSymbols = require_has_symbols()();
    var getProto = require_get_proto();
    var $ObjectGPO = require_Object_getPrototypeOf();
    var $ReflectGPO = require_Reflect_getPrototypeOf();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var needsEval = {};
    var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
    var INTRINSICS = {
      __proto__: null,
      "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
      "%Array%": Array,
      "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
      "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
      "%AsyncFromSyncIteratorPrototype%": undefined2,
      "%AsyncFunction%": needsEval,
      "%AsyncGenerator%": needsEval,
      "%AsyncGeneratorFunction%": needsEval,
      "%AsyncIteratorPrototype%": needsEval,
      "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
      "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
      "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
      "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
      "%Boolean%": Boolean,
      "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
      "%Date%": Date,
      "%decodeURI%": decodeURI,
      "%decodeURIComponent%": decodeURIComponent,
      "%encodeURI%": encodeURI,
      "%encodeURIComponent%": encodeURIComponent,
      "%Error%": $Error,
      "%eval%": eval,
      // eslint-disable-line no-eval
      "%EvalError%": $EvalError,
      "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
      "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
      "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
      "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
      "%Function%": $Function,
      "%GeneratorFunction%": needsEval,
      "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
      "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
      "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
      "%isFinite%": isFinite,
      "%isNaN%": isNaN,
      "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
      "%JSON%": typeof JSON === "object" ? JSON : undefined2,
      "%Map%": typeof Map === "undefined" ? undefined2 : Map,
      "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
      "%Math%": Math,
      "%Number%": Number,
      "%Object%": $Object,
      "%Object.getOwnPropertyDescriptor%": $gOPD,
      "%parseFloat%": parseFloat,
      "%parseInt%": parseInt,
      "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
      "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
      "%RangeError%": $RangeError,
      "%ReferenceError%": $ReferenceError,
      "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
      "%RegExp%": RegExp,
      "%Set%": typeof Set === "undefined" ? undefined2 : Set,
      "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
      "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
      "%String%": String,
      "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
      "%Symbol%": hasSymbols ? Symbol : undefined2,
      "%SyntaxError%": $SyntaxError,
      "%ThrowTypeError%": ThrowTypeError,
      "%TypedArray%": TypedArray,
      "%TypeError%": $TypeError,
      "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
      "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
      "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
      "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
      "%URIError%": $URIError,
      "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
      "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
      "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
      "%Function.prototype.call%": $call,
      "%Function.prototype.apply%": $apply,
      "%Object.defineProperty%": $defineProperty,
      "%Object.getPrototypeOf%": $ObjectGPO,
      "%Math.abs%": abs,
      "%Math.floor%": floor,
      "%Math.max%": max,
      "%Math.min%": min,
      "%Math.pow%": pow,
      "%Math.round%": round2,
      "%Math.sign%": sign,
      "%Reflect.getPrototypeOf%": $ReflectGPO
    };
    if (getProto) {
      try {
        null.error;
      } catch (e) {
        errorProto = getProto(getProto(e));
        INTRINSICS["%Error.prototype%"] = errorProto;
      }
    }
    var errorProto;
    var doEval = function doEval2(name) {
      var value;
      if (name === "%AsyncFunction%") {
        value = getEvalledConstructor("async function () {}");
      } else if (name === "%GeneratorFunction%") {
        value = getEvalledConstructor("function* () {}");
      } else if (name === "%AsyncGeneratorFunction%") {
        value = getEvalledConstructor("async function* () {}");
      } else if (name === "%AsyncGenerator%") {
        var fn = doEval2("%AsyncGeneratorFunction%");
        if (fn) {
          value = fn.prototype;
        }
      } else if (name === "%AsyncIteratorPrototype%") {
        var gen = doEval2("%AsyncGenerator%");
        if (gen && getProto) {
          value = getProto(gen.prototype);
        }
      }
      INTRINSICS[name] = value;
      return value;
    };
    var LEGACY_ALIASES = {
      __proto__: null,
      "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
      "%ArrayPrototype%": ["Array", "prototype"],
      "%ArrayProto_entries%": ["Array", "prototype", "entries"],
      "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
      "%ArrayProto_keys%": ["Array", "prototype", "keys"],
      "%ArrayProto_values%": ["Array", "prototype", "values"],
      "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
      "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
      "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
      "%BooleanPrototype%": ["Boolean", "prototype"],
      "%DataViewPrototype%": ["DataView", "prototype"],
      "%DatePrototype%": ["Date", "prototype"],
      "%ErrorPrototype%": ["Error", "prototype"],
      "%EvalErrorPrototype%": ["EvalError", "prototype"],
      "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
      "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
      "%FunctionPrototype%": ["Function", "prototype"],
      "%Generator%": ["GeneratorFunction", "prototype"],
      "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
      "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
      "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
      "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
      "%JSONParse%": ["JSON", "parse"],
      "%JSONStringify%": ["JSON", "stringify"],
      "%MapPrototype%": ["Map", "prototype"],
      "%NumberPrototype%": ["Number", "prototype"],
      "%ObjectPrototype%": ["Object", "prototype"],
      "%ObjProto_toString%": ["Object", "prototype", "toString"],
      "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
      "%PromisePrototype%": ["Promise", "prototype"],
      "%PromiseProto_then%": ["Promise", "prototype", "then"],
      "%Promise_all%": ["Promise", "all"],
      "%Promise_reject%": ["Promise", "reject"],
      "%Promise_resolve%": ["Promise", "resolve"],
      "%RangeErrorPrototype%": ["RangeError", "prototype"],
      "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
      "%RegExpPrototype%": ["RegExp", "prototype"],
      "%SetPrototype%": ["Set", "prototype"],
      "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
      "%StringPrototype%": ["String", "prototype"],
      "%SymbolPrototype%": ["Symbol", "prototype"],
      "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
      "%TypedArrayPrototype%": ["TypedArray", "prototype"],
      "%TypeErrorPrototype%": ["TypeError", "prototype"],
      "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
      "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
      "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
      "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
      "%URIErrorPrototype%": ["URIError", "prototype"],
      "%WeakMapPrototype%": ["WeakMap", "prototype"],
      "%WeakSetPrototype%": ["WeakSet", "prototype"]
    };
    var bind = require_function_bind();
    var hasOwn = require_hasown();
    var $concat = bind.call($call, Array.prototype.concat);
    var $spliceApply = bind.call($apply, Array.prototype.splice);
    var $replace = bind.call($call, String.prototype.replace);
    var $strSlice = bind.call($call, String.prototype.slice);
    var $exec = bind.call($call, RegExp.prototype.exec);
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = function stringToPath2(string) {
      var first = $strSlice(string, 0, 1);
      var last = $strSlice(string, -1);
      if (first === "%" && last !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
      } else if (last === "%" && first !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
      }
      var result = [];
      $replace(string, rePropName, function(match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
      });
      return result;
    };
    var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name;
      var alias;
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = "%" + alias[0] + "%";
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
          value = doEval(intrinsicName);
        }
        if (typeof value === "undefined" && !allowMissing) {
          throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
        }
        return {
          alias,
          name: intrinsicName,
          value
        };
      }
      throw new $SyntaxError("intrinsic " + name + " does not exist!");
    };
    module2.exports = function GetIntrinsic(name, allowMissing) {
      if (typeof name !== "string" || name.length === 0) {
        throw new $TypeError("intrinsic name must be a non-empty string");
      }
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new $TypeError('"allowMissing" argument must be a boolean');
      }
      if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
      }
      var parts = stringToPath(name);
      var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
      var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
      var intrinsicRealName = intrinsic.name;
      var value = intrinsic.value;
      var skipFurtherCaching = false;
      var alias = intrinsic.alias;
      if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([0, 1], alias));
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
          throw new $SyntaxError("property names with quotes must have matching quotes");
        }
        if (part === "constructor" || !isOwn) {
          skipFurtherCaching = true;
        }
        intrinsicBaseName += "." + part;
        intrinsicRealName = "%" + intrinsicBaseName + "%";
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
            }
            return void undefined2;
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part);
            isOwn = !!desc;
            if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
              value = desc.get;
            } else {
              value = value[part];
            }
          } else {
            isOwn = hasOwn(value, part);
            value = value[part];
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value;
          }
        }
      }
      return value;
    };
  }
});

// node_modules/has-tostringtag/shams.js
var require_shams2 = __commonJS({
  "node_modules/has-tostringtag/shams.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var hasSymbols = require_shams();
    module2.exports = function hasToStringTagShams() {
      return hasSymbols() && !!Symbol.toStringTag;
    };
  }
});

// node_modules/es-set-tostringtag/index.js
var require_es_set_tostringtag = __commonJS({
  "node_modules/es-set-tostringtag/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var GetIntrinsic = require_get_intrinsic();
    var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
    var hasToStringTag = require_shams2()();
    var hasOwn = require_hasown();
    var $TypeError = require_type();
    var toStringTag = hasToStringTag ? Symbol.toStringTag : null;
    module2.exports = function setToStringTag(object, value) {
      var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
      var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
      if (typeof overrideIfSet !== "undefined" && typeof overrideIfSet !== "boolean" || typeof nonConfigurable !== "undefined" && typeof nonConfigurable !== "boolean") {
        throw new $TypeError("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
      }
      if (toStringTag && (overrideIfSet || !hasOwn(object, toStringTag))) {
        if ($defineProperty) {
          $defineProperty(object, toStringTag, {
            configurable: !nonConfigurable,
            enumerable: false,
            value,
            writable: false
          });
        } else {
          object[toStringTag] = value;
        }
      }
    };
  }
});

// node_modules/form-data/lib/populate.js
var require_populate = __commonJS({
  "node_modules/form-data/lib/populate.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = function(dst, src) {
      Object.keys(src).forEach(function(prop) {
        dst[prop] = dst[prop] || src[prop];
      });
      return dst;
    };
  }
});

// node_modules/form-data/lib/form_data.js
var require_form_data = __commonJS({
  "node_modules/form-data/lib/form_data.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    var CombinedStream = require_combined_stream();
    var util = require("util");
    var path = require("path");
    var http = require("http");
    var https = require("https");
    var parseUrl = require("url").parse;
    var fs = require("fs");
    var Stream = require("stream").Stream;
    var crypto = require("crypto");
    var mime = require_mime_types();
    var asynckit = require_asynckit();
    var setToStringTag = require_es_set_tostringtag();
    var hasOwn = require_hasown();
    var populate = require_populate();
    function FormData2(options) {
      if (!(this instanceof FormData2)) {
        return new FormData2(options);
      }
      this._overheadLength = 0;
      this._valueLength = 0;
      this._valuesToMeasure = [];
      CombinedStream.call(this);
      options = options || {};
      for (var option in options) {
        this[option] = options[option];
      }
    }
    util.inherits(FormData2, CombinedStream);
    FormData2.LINE_BREAK = "\r\n";
    FormData2.DEFAULT_CONTENT_TYPE = "application/octet-stream";
    FormData2.prototype.append = function(field, value, options) {
      options = options || {};
      if (typeof options === "string") {
        options = { filename: options };
      }
      var append = CombinedStream.prototype.append.bind(this);
      if (typeof value === "number" || value == null) {
        value = String(value);
      }
      if (Array.isArray(value)) {
        this._error(new Error("Arrays are not supported."));
        return;
      }
      var header = this._multiPartHeader(field, value, options);
      var footer = this._multiPartFooter();
      append(header);
      append(value);
      append(footer);
      this._trackLength(header, value, options);
    };
    FormData2.prototype._trackLength = function(header, value, options) {
      var valueLength = 0;
      if (options.knownLength != null) {
        valueLength += Number(options.knownLength);
      } else if (Buffer.isBuffer(value)) {
        valueLength = value.length;
      } else if (typeof value === "string") {
        valueLength = Buffer.byteLength(value);
      }
      this._valueLength += valueLength;
      this._overheadLength += Buffer.byteLength(header) + FormData2.LINE_BREAK.length;
      if (!value || !value.path && !(value.readable && hasOwn(value, "httpVersion")) && !(value instanceof Stream)) {
        return;
      }
      if (!options.knownLength) {
        this._valuesToMeasure.push(value);
      }
    };
    FormData2.prototype._lengthRetriever = function(value, callback) {
      if (hasOwn(value, "fd")) {
        if (value.end != void 0 && value.end != Infinity && value.start != void 0) {
          callback(null, value.end + 1 - (value.start ? value.start : 0));
        } else {
          fs.stat(value.path, function(err, stat) {
            if (err) {
              callback(err);
              return;
            }
            var fileSize = stat.size - (value.start ? value.start : 0);
            callback(null, fileSize);
          });
        }
      } else if (hasOwn(value, "httpVersion")) {
        callback(null, Number(value.headers["content-length"]));
      } else if (hasOwn(value, "httpModule")) {
        value.on("response", function(response) {
          value.pause();
          callback(null, Number(response.headers["content-length"]));
        });
        value.resume();
      } else {
        callback("Unknown stream");
      }
    };
    FormData2.prototype._multiPartHeader = function(field, value, options) {
      if (typeof options.header === "string") {
        return options.header;
      }
      var contentDisposition = this._getContentDisposition(value, options);
      var contentType = this._getContentType(value, options);
      var contents = "";
      var headers = {
        // add custom disposition as third element or keep it two elements if not
        "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
        // if no content type. allow it to be empty array
        "Content-Type": [].concat(contentType || [])
      };
      if (typeof options.header === "object") {
        populate(headers, options.header);
      }
      var header;
      for (var prop in headers) {
        if (hasOwn(headers, prop)) {
          header = headers[prop];
          if (header == null) {
            continue;
          }
          if (!Array.isArray(header)) {
            header = [header];
          }
          if (header.length) {
            contents += prop + ": " + header.join("; ") + FormData2.LINE_BREAK;
          }
        }
      }
      return "--" + this.getBoundary() + FormData2.LINE_BREAK + contents + FormData2.LINE_BREAK;
    };
    FormData2.prototype._getContentDisposition = function(value, options) {
      var filename;
      if (typeof options.filepath === "string") {
        filename = path.normalize(options.filepath).replace(/\\/g, "/");
      } else if (options.filename || value && (value.name || value.path)) {
        filename = path.basename(options.filename || value && (value.name || value.path));
      } else if (value && value.readable && hasOwn(value, "httpVersion")) {
        filename = path.basename(value.client._httpMessage.path || "");
      }
      if (filename) {
        return 'filename="' + filename + '"';
      }
    };
    FormData2.prototype._getContentType = function(value, options) {
      var contentType = options.contentType;
      if (!contentType && value && value.name) {
        contentType = mime.lookup(value.name);
      }
      if (!contentType && value && value.path) {
        contentType = mime.lookup(value.path);
      }
      if (!contentType && value && value.readable && hasOwn(value, "httpVersion")) {
        contentType = value.headers["content-type"];
      }
      if (!contentType && (options.filepath || options.filename)) {
        contentType = mime.lookup(options.filepath || options.filename);
      }
      if (!contentType && value && typeof value === "object") {
        contentType = FormData2.DEFAULT_CONTENT_TYPE;
      }
      return contentType;
    };
    FormData2.prototype._multiPartFooter = function() {
      return function(next) {
        var footer = FormData2.LINE_BREAK;
        var lastPart = this._streams.length === 0;
        if (lastPart) {
          footer += this._lastBoundary();
        }
        next(footer);
      }.bind(this);
    };
    FormData2.prototype._lastBoundary = function() {
      return "--" + this.getBoundary() + "--" + FormData2.LINE_BREAK;
    };
    FormData2.prototype.getHeaders = function(userHeaders) {
      var header;
      var formHeaders = {
        "content-type": "multipart/form-data; boundary=" + this.getBoundary()
      };
      for (header in userHeaders) {
        if (hasOwn(userHeaders, header)) {
          formHeaders[header.toLowerCase()] = userHeaders[header];
        }
      }
      return formHeaders;
    };
    FormData2.prototype.setBoundary = function(boundary) {
      if (typeof boundary !== "string") {
        throw new TypeError("FormData boundary must be a string");
      }
      this._boundary = boundary;
    };
    FormData2.prototype.getBoundary = function() {
      if (!this._boundary) {
        this._generateBoundary();
      }
      return this._boundary;
    };
    FormData2.prototype.getBuffer = function() {
      var dataBuffer = new Buffer.alloc(0);
      var boundary = this.getBoundary();
      for (var i = 0, len = this._streams.length; i < len; i++) {
        if (typeof this._streams[i] !== "function") {
          if (Buffer.isBuffer(this._streams[i])) {
            dataBuffer = Buffer.concat([dataBuffer, this._streams[i]]);
          } else {
            dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])]);
          }
          if (typeof this._streams[i] !== "string" || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
            dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData2.LINE_BREAK)]);
          }
        }
      }
      return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
    };
    FormData2.prototype._generateBoundary = function() {
      this._boundary = "--------------------------" + crypto.randomBytes(12).toString("hex");
    };
    FormData2.prototype.getLengthSync = function() {
      var knownLength = this._overheadLength + this._valueLength;
      if (this._streams.length) {
        knownLength += this._lastBoundary().length;
      }
      if (!this.hasKnownLength()) {
        this._error(new Error("Cannot calculate proper length in synchronous way."));
      }
      return knownLength;
    };
    FormData2.prototype.hasKnownLength = function() {
      var hasKnownLength = true;
      if (this._valuesToMeasure.length) {
        hasKnownLength = false;
      }
      return hasKnownLength;
    };
    FormData2.prototype.getLength = function(cb) {
      var knownLength = this._overheadLength + this._valueLength;
      if (this._streams.length) {
        knownLength += this._lastBoundary().length;
      }
      if (!this._valuesToMeasure.length) {
        process.nextTick(cb.bind(this, null, knownLength));
        return;
      }
      asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
        if (err) {
          cb(err);
          return;
        }
        values.forEach(function(length) {
          knownLength += length;
        });
        cb(null, knownLength);
      });
    };
    FormData2.prototype.submit = function(params, cb) {
      var request2;
      var options;
      var defaults = { method: "post" };
      if (typeof params === "string") {
        params = parseUrl(params);
        options = populate({
          port: params.port,
          path: params.pathname,
          host: params.hostname,
          protocol: params.protocol
        }, defaults);
      } else {
        options = populate(params, defaults);
        if (!options.port) {
          options.port = options.protocol === "https:" ? 443 : 80;
        }
      }
      options.headers = this.getHeaders(params.headers);
      if (options.protocol === "https:") {
        request2 = https.request(options);
      } else {
        request2 = http.request(options);
      }
      this.getLength(function(err, length) {
        if (err && err !== "Unknown stream") {
          this._error(err);
          return;
        }
        if (length) {
          request2.setHeader("Content-Length", length);
        }
        this.pipe(request2);
        if (cb) {
          var onResponse;
          var callback = function(error, responce) {
            request2.removeListener("error", callback);
            request2.removeListener("response", onResponse);
            return cb.call(this, error, responce);
          };
          onResponse = callback.bind(this, null);
          request2.on("error", callback);
          request2.on("response", onResponse);
        }
      }.bind(this));
      return request2;
    };
    FormData2.prototype._error = function(err) {
      if (!this.error) {
        this.error = err;
        this.pause();
        this.emit("error", err);
      }
    };
    FormData2.prototype.toString = function() {
      return "[object FormData]";
    };
    setToStringTag(FormData2.prototype, "FormData");
    module2.exports = FormData2;
  }
});

// src/bin/dhanhq-mcp.ts
init_cjs_shims();

// src/agent/ToolRegistry.ts
init_cjs_shims();

// src/errors/index.ts
init_cjs_shims();

// src/errors/ApiResponseError.ts
init_cjs_shims();

// src/errors/DhanError.ts
init_cjs_shims();
var DhanError = class extends Error {
  constructor(message2, options = {}) {
    super(message2);
    this.name = "DhanError";
    this.code = options.code ?? "DHAN_ERROR";
    this.status = options.status;
    this.details = options.details;
    this.cause = options.cause;
  }
};

// src/errors/ApiResponseError.ts
var ApiResponseError = class extends DhanError {
  constructor(message2, status, details, cause) {
    super(message2, {
      code: "API_RESPONSE_ERROR",
      status,
      details,
      cause
    });
    this.name = "ApiResponseError";
  }
};

// src/errors/LiveTradingDisabledError.ts
init_cjs_shims();
var LiveTradingDisabledError = class extends DhanError {
  constructor(message2 = "Write tools require DHANHQ_MCP_ENABLE_WRITES=true and LIVE_TRADING=true") {
    super(message2, { code: "LIVE_TRADING_DISABLED" });
    this.name = "LiveTradingDisabledError";
  }
};

// src/errors/NetworkError.ts
init_cjs_shims();
var NetworkError = class extends DhanError {
  constructor(message2, cause) {
    super(message2, {
      code: "NETWORK_ERROR",
      cause
    });
    this.name = "NetworkError";
  }
};

// src/errors/RateLimitError.ts
init_cjs_shims();
var RateLimitError = class extends DhanError {
  constructor(message2 = "Request rate limit exhausted", cause) {
    super(message2, {
      code: "RATE_LIMIT_ERROR",
      cause
    });
    this.name = "RateLimitError";
  }
};

// src/errors/RiskViolationError.ts
init_cjs_shims();
var RiskViolationError = class extends DhanError {
  constructor(check, message2, details) {
    super(message2, { code: "RISK_VIOLATION", details });
    this.name = "RiskViolationError";
    this.check = check;
  }
};

// src/errors/ValidationError.ts
init_cjs_shims();
var ValidationError = class extends DhanError {
  constructor(error) {
    super("Request validation failed", {
      code: "VALIDATION_ERROR",
      details: error.flatten(),
      cause: error
    });
    this.name = "ValidationError";
    this.issues = error.issues;
  }
};

// src/risk/Pipeline.ts
init_cjs_shims();

// src/risk/checks.ts
init_cjs_shims();

// src/constants.ts
init_cjs_shims();
var ExchangeSegment = {
  IDX_I: "IDX_I",
  NSE_EQ: "NSE_EQ",
  NSE_FNO: "NSE_FNO",
  NSE_CURRENCY: "NSE_CURRENCY",
  NSE_COMM: "NSE_COMM",
  BSE_EQ: "BSE_EQ",
  MCX_COMM: "MCX_COMM",
  BSE_CURRENCY: "BSE_CURRENCY",
  BSE_FNO: "BSE_FNO",
  /**
   * US / international equities, traded through the Global Stocks APIs
   * (`/v2/globalstocks/*`). Deliberately excluded from `ALL` so it can never
   * satisfy a domestic order contract.
   */
  INX_EQ: "INX_EQ"
};
var EXCHANGE_SEGMENTS = [
  ExchangeSegment.IDX_I,
  ExchangeSegment.NSE_EQ,
  ExchangeSegment.NSE_FNO,
  ExchangeSegment.NSE_CURRENCY,
  ExchangeSegment.NSE_COMM,
  ExchangeSegment.BSE_EQ,
  ExchangeSegment.MCX_COMM,
  ExchangeSegment.BSE_CURRENCY,
  ExchangeSegment.BSE_FNO
];
var GLOBAL_EXCHANGE_SEGMENTS = [ExchangeSegment.INX_EQ];
var MARGIN_CALC_SEGMENTS = [
  ExchangeSegment.NSE_EQ,
  ExchangeSegment.NSE_FNO,
  ExchangeSegment.BSE_EQ,
  ExchangeSegment.BSE_FNO,
  ExchangeSegment.MCX_COMM
];
var ALERT_CONDITION_SEGMENTS = [
  ExchangeSegment.NSE_EQ,
  ExchangeSegment.BSE_EQ,
  ExchangeSegment.IDX_I
];
var CHART_SEGMENTS = [
  ExchangeSegment.IDX_I,
  ExchangeSegment.NSE_EQ,
  ExchangeSegment.NSE_FNO,
  ExchangeSegment.NSE_CURRENCY,
  ExchangeSegment.BSE_EQ,
  ExchangeSegment.BSE_FNO,
  ExchangeSegment.BSE_CURRENCY,
  ExchangeSegment.MCX_COMM
];
var ProductType = {
  CNC: "CNC",
  INTRADAY: "INTRADAY",
  MARGIN: "MARGIN",
  MTF: "MTF",
  CO: "CO",
  BO: "BO"
};
var PRODUCT_TYPES = [
  ProductType.CNC,
  ProductType.INTRADAY,
  ProductType.MARGIN,
  ProductType.MTF,
  ProductType.CO,
  ProductType.BO
];
var MARGIN_CALC_PRODUCT_TYPES = [
  ProductType.CNC,
  ProductType.INTRADAY,
  ProductType.MARGIN,
  ProductType.MTF
];
var FOREVER_ORDER_PRODUCT_TYPES = [
  ProductType.CNC,
  ProductType.MTF
];
var TransactionType = {
  BUY: "BUY",
  SELL: "SELL"
};
var TRANSACTION_TYPES = [
  TransactionType.BUY,
  TransactionType.SELL
];
var OrderTypeEnum = {
  LIMIT: "LIMIT",
  MARKET: "MARKET",
  STOP_LOSS: "STOP_LOSS",
  STOP_LOSS_MARKET: "STOP_LOSS_MARKET"
};
var ORDER_TYPES = [
  OrderTypeEnum.LIMIT,
  OrderTypeEnum.MARKET,
  OrderTypeEnum.STOP_LOSS,
  OrderTypeEnum.STOP_LOSS_MARKET
];
var ValidityEnum = {
  DAY: "DAY",
  IOC: "IOC"
};
var VALIDITIES = [ValidityEnum.DAY, ValidityEnum.IOC];
var InstrumentType = {
  INDEX: "INDEX",
  FUTIDX: "FUTIDX",
  OPTIDX: "OPTIDX",
  EQUITY: "EQUITY",
  FUTSTK: "FUTSTK",
  OPTSTK: "OPTSTK",
  FUTCOM: "FUTCOM",
  OPTFUT: "OPTFUT",
  FUTCUR: "FUTCUR",
  OPTCUR: "OPTCUR"
};
var ChartInterval = {
  ONE: "1",
  FIVE: "5",
  FIFTEEN: "15",
  TWENTY_FIVE: "25",
  SIXTY: "60"
};
var CHART_INTERVALS = [
  ChartInterval.ONE,
  ChartInterval.FIVE,
  ChartInterval.FIFTEEN,
  ChartInterval.TWENTY_FIVE,
  ChartInterval.SIXTY
];
var GlobalStocks = {
  EXCHANGE_SEGMENT: ExchangeSegment.INX_EQ,
  EXCHANGE_SEGMENT_CODE: 14,
  MAX_INSTRUMENTS_PER_REQUEST: 100,
  MAX_SUBSCRIPTIONS_PER_CONNECTION: 5e3,
  MAX_CONNECTIONS_PER_CLIENT: 5,
  OrderType: {
    MARKET: "MARKET",
    LIMIT: "LIMIT",
    STOP_LOSS: "STOP_LOSS",
    STOP_LOSS_MARKET: "STOP_LOSS_MARKET",
    /** Notional / dollar-value orders — quantity is replaced by `amount`. */
    AMOUNT: "AMOUNT"
  },
  MarketStatus: {
    OPEN: "open",
    CLOSED: "closed"
  },
  MsgCode: {
    TRADE: 1,
    PREV_CLOSE: 32,
    CIRCUIT_LIMIT: 33,
    FIFTY_TWO_WEEK: 36
  }
};
var GLOBAL_ORDER_TYPES = [
  GlobalStocks.OrderType.MARKET,
  GlobalStocks.OrderType.LIMIT,
  GlobalStocks.OrderType.STOP_LOSS,
  GlobalStocks.OrderType.STOP_LOSS_MARKET,
  GlobalStocks.OrderType.AMOUNT
];
var RATE_LIMITS = {
  order_api: { perSecond: 10, perDay: 1e5 },
  data_api: { perSecond: 5, perDay: 7e3 },
  quote_api: { perSecond: 1, perDay: Infinity },
  option_chain: { perSecond: 1 / 3, perDay: 4800 },
  non_trading_api: { perSecond: 20, perDay: Infinity }
};
var MARKET_HOURS = {
  timezoneOffsetMinutes: 330,
  openHour: 9,
  openMinute: 15,
  closeHour: 15,
  closeMinute: 30,
  /** Minutes in a regular NSE trading session. */
  sessionMinutes: 375
};
var SEGMENT_MAP = {
  "NSE:E": ExchangeSegment.NSE_EQ,
  "BSE:E": ExchangeSegment.BSE_EQ,
  "NSE:D": ExchangeSegment.NSE_FNO,
  "BSE:D": ExchangeSegment.BSE_FNO,
  "NSE:C": ExchangeSegment.NSE_CURRENCY,
  "BSE:C": ExchangeSegment.BSE_CURRENCY,
  "MCX:M": ExchangeSegment.MCX_COMM,
  "NSE:I": ExchangeSegment.IDX_I,
  "BSE:I": ExchangeSegment.IDX_I
};

// src/risk/checks.ts
var tradingPermissionCheck = {
  name: "trading_permission",
  run({ instrument }) {
    if (!instrument) {
      return;
    }
    if (instrument.buySellIndicator !== "A") {
      throw new RiskViolationError(
        "trading_permission",
        `Trading disabled for instrument ${instrument.securityId}`
      );
    }
  }
};
var asmGsmCheck = {
  name: "asm_gsm",
  run({ instrument }) {
    if (instrument?.asmGsmFlag !== "Y") {
      return;
    }
    throw new RiskViolationError(
      "asm_gsm",
      `ASM/GSM restricted instrument (${instrument.asmGsmCategory ?? "unknown category"})`
    );
  }
};
var productSupportCheck = {
  name: "product_support",
  run({ args, instrument }) {
    const productType = args.productType;
    if (!productType || !instrument) {
      return;
    }
    if (productType === ProductType.BO && instrument.bracketFlag !== "Y") {
      throw new RiskViolationError(
        "product_support",
        "Bracket orders not supported for this instrument"
      );
    }
    if (productType === ProductType.CO && instrument.coverFlag !== "Y") {
      throw new RiskViolationError(
        "product_support",
        "Cover orders not supported for this instrument"
      );
    }
  }
};
var orderTypeCheck = {
  name: "order_type",
  run({ args, limits }) {
    const orderType = args.orderType;
    if (!orderType || limits.allowedOrderTypes.includes(orderType)) {
      return;
    }
    throw new RiskViolationError(
      "order_type",
      `Order type ${orderType} not allowed (permitted: ${limits.allowedOrderTypes.join(", ")})`
    );
  }
};
var quantityCheck = {
  name: "quantity",
  run({ args, limits }) {
    const quantity = Number(args.quantity ?? 0);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new RiskViolationError("quantity", "Quantity must be greater than 0");
    }
    if (quantity > limits.maxQuantity) {
      throw new RiskViolationError(
        "quantity",
        `Quantity ${quantity} exceeds limit of ${limits.maxQuantity}`
      );
    }
    if (args.price === void 0) {
      return;
    }
    const notional = quantity * Number(args.price);
    if (notional > limits.maxNotional) {
      throw new RiskViolationError(
        "quantity",
        `Notional ${notional} exceeds limit of ${limits.maxNotional}`
      );
    }
  }
};
var marketHoursCheck = {
  name: "market_hours",
  run({ now = /* @__PURE__ */ new Date() }) {
    const ist = new Date(
      now.getTime() + MARKET_HOURS.timezoneOffsetMinutes * 60 * 1e3
    );
    const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
    const open = MARKET_HOURS.openHour * 60 + MARKET_HOURS.openMinute;
    const close = MARKET_HOURS.closeHour * 60 + MARKET_HOURS.closeMinute;
    const day = ist.getUTCDay();
    if (day === 0 || day === 6 || minutes < open || minutes > close) {
      throw new RiskViolationError("market_hours", "Market is closed");
    }
  }
};
var positionLimitsCheck = {
  name: "position_limits",
  async run({ provider, limits }) {
    if (!provider) {
      return;
    }
    const positions = await provider.positions();
    const openCount = positions.filter(
      (position) => Number(position.netQty ?? 0) !== 0
    ).length;
    if (openCount >= limits.maxOpenPositions) {
      throw new RiskViolationError(
        "position_limits",
        `Maximum ${limits.maxOpenPositions} open positions exceeded (${openCount} open)`
      );
    }
  }
};
var concentrationCheck = {
  name: "concentration",
  async run({ args, provider, limits }) {
    const symbol = args.securityId;
    if (!provider || !symbol) {
      return;
    }
    const available = availableBalance(await provider.funds());
    if (available <= 0) {
      return;
    }
    const positions = await provider.positions();
    const exposure = positions.filter((position) => matchesSymbol(position, String(symbol))).reduce(
      (total, position) => total + Math.abs(Number(position.netQty ?? 0)) * Number(position.costPrice ?? 0),
      0
    );
    const concentration = exposure / available * 100;
    if (concentration > limits.maxConcentrationPct) {
      throw new RiskViolationError(
        "concentration",
        `Concentration ${concentration.toFixed(1)}% exceeds ${limits.maxConcentrationPct}% limit for ${symbol}`
      );
    }
  }
};
var maxLossCheck = {
  name: "max_loss",
  async run({ provider, limits }) {
    if (!provider) {
      return;
    }
    const positions = await provider.positions();
    const unrealized = positions.reduce(
      (total, position) => total + Number(position.unrealizedProfit ?? 0),
      0
    );
    if (unrealized < -limits.dailyMaxLoss) {
      throw new RiskViolationError(
        "max_loss",
        `Daily loss limit of ${limits.dailyMaxLoss} exceeded (current: ${unrealized.toFixed(0)})`
      );
    }
  }
};
var optionsCheck = {
  name: "options",
  run({ args, instrument, limits }) {
    if (limits.optionsIndexOnly && instrument?.instrumentType !== "INDEX") {
      throw new RiskViolationError(
        "options",
        "Options are only allowed on index underlyings"
      );
    }
    if (!limits.requireOptionsStops) {
      return;
    }
    if (args.stopLoss === void 0) {
      throw new RiskViolationError("options", "Stop loss required");
    }
    if (args.target === void 0) {
      throw new RiskViolationError("options", "Target required");
    }
    if (Number(args.target) <= Number(args.stopLoss)) {
      throw new RiskViolationError(
        "options",
        "Invalid risk-reward: target must exceed stop loss"
      );
    }
  }
};
function matchesSymbol(position, symbol) {
  return String(position.tradingSymbol ?? "") === symbol || String(position.securityId ?? "") === symbol;
}
function availableBalance(funds) {
  return Number(funds.availabelBalance ?? funds.availableBalance ?? 0);
}

// src/risk/types.ts
init_cjs_shims();
var DEFAULT_RISK_LIMITS = {
  maxQuantity: 10,
  maxNotional: 1e5,
  dailyMaxLoss: 5e4,
  maxOpenPositions: 20,
  maxConcentrationPct: 25,
  allowedOrderTypes: ["MARKET", "LIMIT"],
  optionsIndexOnly: true,
  requireOptionsStops: true
};

// src/risk/Pipeline.ts
var BASE_CHECKS = [
  tradingPermissionCheck,
  asmGsmCheck,
  productSupportCheck,
  orderTypeCheck,
  quantityCheck,
  marketHoursCheck,
  positionLimitsCheck,
  concentrationCheck
];
var OPTION_CHECKS = [optionsCheck];
var DAILY_CHECKS = [maxLossCheck];
var Pipeline = class {
  constructor(config = {}) {
    this.limits = { ...DEFAULT_RISK_LIMITS, ...config.limits };
    this.provider = config.provider;
    this.checks = config.checks ?? BASE_CHECKS;
  }
  /** Runs every applicable check. Throws on the first violation. */
  async run(options) {
    const context = {
      args: options.args,
      instrument: options.instrument,
      now: options.now ?? /* @__PURE__ */ new Date(),
      limits: this.limits,
      provider: this.provider
    };
    const applicable = [
      ...this.checks,
      ...options.type === "options" ? OPTION_CHECKS : [],
      ...DAILY_CHECKS
    ];
    for (const check of applicable) {
      await check.run(context);
    }
    return true;
  }
  /**
   * Runs every check and collects the failures instead of throwing — for
   * previews and dry runs, where the caller wants the full picture rather
   * than the first problem.
   */
  async report(options) {
    const context = {
      args: options.args,
      instrument: options.instrument,
      now: options.now ?? /* @__PURE__ */ new Date(),
      limits: this.limits,
      provider: this.provider
    };
    const applicable = [
      ...this.checks,
      ...options.type === "options" ? OPTION_CHECKS : [],
      ...DAILY_CHECKS
    ];
    const violations = [];
    for (const check of applicable) {
      try {
        await check.run(context);
      } catch (error) {
        violations.push({
          check: check.name,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }
    return { passed: violations.length === 0, violations };
  }
  getLimits() {
    return this.limits;
  }
};
function riskTypeFor(instrument) {
  return instrument?.instrumentType?.startsWith("OPT") ? "options" : "equity";
}

// src/skills/index.ts
init_cjs_shims();

// src/skills/builtin/index.ts
init_cjs_shims();

// src/skills/Registry.ts
init_cjs_shims();
var SkillRegistry = class {
  constructor() {
    this.skills = /* @__PURE__ */ new Map();
  }
  register(skill) {
    this.skills.set(skill.definition.name, skill);
    return this;
  }
  registerAll(skills) {
    for (const skill of skills) {
      this.register(skill);
    }
    return this;
  }
  has(name) {
    return this.skills.has(name);
  }
  find(name) {
    const skill = this.skills.get(name);
    if (!skill) {
      throw new DhanError(`Unknown skill: ${name}`, {
        code: "SKILL_NOT_FOUND",
        details: { name, available: this.names() }
      });
    }
    return skill;
  }
  names() {
    return [...this.skills.keys()].sort();
  }
  /** Every skill with its parameters and steps, for tool listings. */
  list() {
    return [...this.skills.values()].map((skill) => ({
      ...skill.definition,
      steps: skill.stepNames()
    }));
  }
  async call(name, args, client) {
    const result = await this.find(name).call(args, client);
    const { client: _client, ...rest } = result;
    return rest;
  }
  clear() {
    this.skills.clear();
  }
};

// src/skills/builtin/equityOverlays.ts
init_cjs_shims();

// src/resources/OptionChain.ts
init_cjs_shims();
var OptionChain = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Raw option chain payload, exactly as the API returns it. */
  async fetch(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/optionchain",
      data: request2,
      safeToRetry: true
    });
  }
  /** Available expiry dates for an underlying, ascending. */
  async expiryList(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/optionchain/expirylist",
      data: request2,
      safeToRetry: true
    });
  }
  /** Option chain with the strike map flattened and sorted ascending. */
  async fetchNormalized(request2) {
    return normalizeOptionChain(await this.fetch(request2));
  }
};
function normalizeOptionChain(response) {
  const oc = response.data?.oc ?? {};
  const strikes = Object.entries(oc).map(([strike, legs]) => ({
    strike: Number(strike),
    call: legs?.ce,
    put: legs?.pe
  })).filter((entry) => Number.isFinite(entry.strike)).sort((a, b) => a.strike - b.strike);
  return { lastPrice: response.data?.last_price, strikes };
}
function nearestStrike(chain, target) {
  if (chain.strikes.length === 0) {
    return void 0;
  }
  return chain.strikes.reduce(
    (best, entry) => Math.abs(entry.strike - target) < Math.abs(best.strike - target) ? entry : best
  );
}
function findStrike(chain, target, tolerance = 1e-3) {
  return chain.strikes.find(
    (entry) => Math.abs(entry.strike - target) < tolerance
  );
}

// src/skills/Skill.ts
init_cjs_shims();
var Skill = class {
  /** Runs every step in order and returns the final context. */
  async call(args, client) {
    let context = this.buildContext(args, client);
    this.validate(context);
    for (const step of this.steps()) {
      context = await step.run(context);
    }
    return context;
  }
  /** Step names in execution order, for tool listings and docs. */
  stepNames() {
    return this.steps().map((step) => step.name);
  }
  buildContext(args, client) {
    const context = { client };
    for (const [name, config] of Object.entries(this.definition.params)) {
      const value = args[name];
      context[name] = value === void 0 ? config.default : value;
    }
    return context;
  }
  validate(context) {
    for (const [name, config] of Object.entries(this.definition.params)) {
      if (config.required && context[name] === void 0) {
        throw new DhanError(`Missing required parameter: ${name}`, {
          code: "SKILL_PARAM_MISSING",
          details: { skill: this.definition.name, param: name }
        });
      }
    }
  }
};
function legSide(entry, optionType) {
  return optionType === "CE" ? entry.call : entry.put;
}
function legSecurityId(entry, optionType) {
  return legSide(entry, optionType)?.security_id;
}
function legPremium(entry, optionType) {
  return legSide(entry, optionType)?.last_price;
}
async function resolveChain(client, symbol, expiry, segment) {
  const instrument = await client.instruments.find(segment, symbol, {
    exactMatch: true
  });
  if (!instrument) {
    throw new DhanError(`Could not resolve symbol ${symbol} in ${segment}`, {
      code: "INSTRUMENT_NOT_FOUND",
      details: { symbol, segment }
    });
  }
  const chain = await client.optionChain.fetchNormalized({
    underlyingScrip: Number(instrument.securityId),
    underlyingSeg: segment,
    expiry
  });
  const spotPrice = chain.lastPrice ?? await client.marketFeed.ltpFor(segment, instrument.securityId);
  if (spotPrice === void 0) {
    throw new DhanError(`Could not resolve spot price for ${symbol}`, {
      code: "SPOT_PRICE_UNAVAILABLE",
      details: { symbol, segment }
    });
  }
  return { securityId: instrument.securityId, spotPrice, chain };
}
function resolveIndexChain(client, symbol, expiry) {
  return resolveChain(client, symbol, expiry, "IDX_I");
}
function resolveEquityChain(client, symbol, expiry) {
  return resolveChain(client, symbol, expiry, "NSE_EQ");
}

// src/skills/builtin/equityOverlays.ts
var equityParams = {
  symbol: {
    type: "string",
    required: true,
    description: "NSE equity symbol, e.g. RELIANCE"
  },
  expiry: {
    type: "string",
    required: true,
    description: "Option expiry date as YYYY-MM-DD"
  },
  quantity: { type: "integer", default: 100 },
  strikeOffset: {
    type: "number",
    default: 2,
    description: "Distance of the option strike from spot, in percent"
  }
};
var EquityOverlaySkill = class extends Skill {
  steps() {
    return [
      {
        name: "resolve_chain",
        run: async (context) => {
          const { securityId, spotPrice, chain } = await resolveEquityChain(
            context.client,
            context.symbol,
            context.expiry
          );
          return { ...context, equitySecurityId: securityId, spotPrice, chain };
        }
      },
      { name: "build_intent", run: (context) => this.buildIntent(context) }
    ];
  }
  requireChain(context) {
    if (!context.chain || context.spotPrice === void 0) {
      throw new DhanError("Option chain was not resolved", {
        code: "CHAIN_UNAVAILABLE"
      });
    }
    return { chain: context.chain, spot: context.spotPrice };
  }
};
var CoveredCallSkill = class extends EquityOverlaySkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "covered_call",
      description: "Build a covered call: buy the underlying equity, sell an OTM call against it.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: equityParams
    };
  }
  buildIntent(context) {
    const { chain, spot } = this.requireChain(context);
    const offset = Number(context.strikeOffset ?? 2) / 100;
    const targetStrike = spot * (1 + offset);
    const call = nearestStrike(chain, targetStrike);
    if (!call) {
      throw new DhanError(
        `Could not find an OTM call strike near ${targetStrike.toFixed(2)}`,
        { code: "STRIKE_NOT_FOUND" }
      );
    }
    const premium = legPremium(call, "CE");
    return {
      ...context,
      callStrike: call.strike,
      callPremium: premium,
      intent: {
        tradeType: "COVERED_CALL",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        spotPrice: spot,
        legs: [
          {
            action: TransactionType.BUY,
            instrumentType: InstrumentType.EQUITY,
            securityId: context.equitySecurityId,
            quantity: context.quantity
          },
          {
            action: TransactionType.SELL,
            optionType: "CE",
            strike: call.strike,
            securityId: legSecurityId(call, "CE"),
            quantity: context.quantity,
            premium
          }
        ],
        note: `Covered call prepared: buy ${context.quantity} ${context.symbol}, sell ${context.quantity} ${call.strike} CE. Await human confirmation.`
      }
    };
  }
};
var ProtectivePutSkill = class extends EquityOverlaySkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "protective_put",
      description: "Build a protective put: buy the underlying equity, buy an OTM put as downside insurance.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...equityParams,
        maxPremiumPct: {
          type: "number",
          default: 3,
          description: "Reject the structure if the put costs more than this share of spot"
        }
      }
    };
  }
  buildIntent(context) {
    const { chain, spot } = this.requireChain(context);
    const offset = Number(context.strikeOffset ?? 2) / 100;
    const maxPremiumPct = Number(context.maxPremiumPct ?? 3);
    const targetStrike = spot * (1 - offset);
    const put = nearestStrike(chain, targetStrike);
    if (!put) {
      throw new DhanError(
        `Could not find an OTM put strike near ${targetStrike.toFixed(2)}`,
        { code: "STRIKE_NOT_FOUND" }
      );
    }
    const premium = legPremium(put, "PE") ?? 0;
    const premiumPct = premium / spot * 100;
    if (premiumPct > maxPremiumPct) {
      throw new DhanError(
        `Put premium ${premiumPct.toFixed(2)}% exceeds max ${maxPremiumPct}%`,
        { code: "PREMIUM_TOO_HIGH", details: { premium, spot } }
      );
    }
    return {
      ...context,
      putStrike: put.strike,
      putPremium: premium,
      intent: {
        tradeType: "PROTECTIVE_PUT",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        spotPrice: spot,
        premiumPct: Number(premiumPct.toFixed(2)),
        legs: [
          {
            action: TransactionType.BUY,
            instrumentType: InstrumentType.EQUITY,
            securityId: context.equitySecurityId,
            quantity: context.quantity
          },
          {
            action: TransactionType.BUY,
            optionType: "PE",
            strike: put.strike,
            securityId: legSecurityId(put, "PE"),
            quantity: context.quantity,
            premium
          }
        ],
        note: `Protective put prepared: buy ${context.quantity} ${context.symbol}, buy ${context.quantity} ${put.strike} PE. Await human confirmation.`
      }
    };
  }
};

// src/skills/builtin/marketDataSummarizer.ts
init_cjs_shims();

// src/analytics/index.ts
init_cjs_shims();

// src/analytics/blackScholes.ts
init_cjs_shims();

// src/analytics/maxPain.ts
init_cjs_shims();
function maxPain(data) {
  return detailedMaxPain(data)?.maxPainStrike;
}
function detailedMaxPain(data) {
  if (data.length === 0) {
    return void 0;
  }
  const painDistribution = data.map((entry) => ({
    strike: entry.strike,
    pain: data.reduce(
      (total, row) => total + painAtStrike(row, entry.strike),
      0
    )
  }));
  const minimum = painDistribution.reduce(
    (best, entry) => entry.pain < best.pain ? entry : best
  );
  return {
    maxPainStrike: minimum.strike,
    totalPain: minimum.pain,
    painDistribution
  };
}
function painAtStrike(row, expiryStrike) {
  const callPain = expiryStrike > row.strike ? (expiryStrike - row.strike) * row.callOi : 0;
  const putPain = expiryStrike < row.strike ? (row.strike - expiryStrike) * row.putOi : 0;
  return callPain + putPain;
}
function putCallRatio(data) {
  const totalCallOi = data.reduce((total, entry) => total + entry.callOi, 0);
  const totalPutOi = data.reduce((total, entry) => total + entry.putOi, 0);
  return totalCallOi === 0 ? 0 : totalPutOi / totalCallOi;
}
function openInterestFromChain(chain) {
  return chain.strikes.map((entry) => ({
    strike: entry.strike,
    callOi: entry.call?.oi ?? 0,
    putOi: entry.put?.oi ?? 0
  }));
}
function highestCallOi(chain, count = 3) {
  return chain.strikes.map((entry) => ({ strike: entry.strike, oi: entry.call?.oi ?? 0 })).sort((a, b) => b.oi - a.oi).slice(0, count);
}
function highestPutOi(chain, count = 3) {
  return chain.strikes.map((entry) => ({ strike: entry.strike, oi: entry.put?.oi ?? 0 })).sort((a, b) => b.oi - a.oi).slice(0, count);
}

// src/ta/candles.ts
init_cjs_shims();
function parseTimestamp(value) {
  if (typeof value === "number") {
    return value;
  }
  if (/^\d+$/.test(value)) {
    const numeric = Number(value);
    return value.length >= 13 ? Math.floor(numeric / 1e3) : numeric;
  }
  return Math.floor(new Date(value).getTime() / 1e3);
}
function candlesFromSeries(series) {
  if (!series) {
    return [];
  }
  const { timestamp, open, high, low, close, volume, open_interest: oi } = series;
  if (!timestamp || !open || !high || !low || !close) {
    return [];
  }
  const candles = [];
  for (let index = 0; index < close.length; index += 1) {
    const candle = {
      timestamp: parseTimestamp(timestamp[index]),
      open: Number(open[index]),
      high: Number(high[index]),
      low: Number(low[index]),
      close: Number(close[index]),
      volume: Number(volume?.[index] ?? 0),
      openInterest: oi?.[index] === void 0 ? void 0 : Number(oi[index])
    };
    if (Number.isFinite(candle.open) && Number.isFinite(candle.high) && Number.isFinite(candle.low) && Number.isFinite(candle.close)) {
      candles.push(candle);
    }
  }
  return candles;
}
function resample(candles, minutes) {
  if (minutes <= 1) {
    return candles;
  }
  const bucketSeconds = minutes * 60;
  const buckets = /* @__PURE__ */ new Map();
  for (const candle of candles) {
    const key = Math.floor(candle.timestamp / bucketSeconds) * bucketSeconds;
    const bucket = buckets.get(key);
    if (!bucket) {
      buckets.set(key, { ...candle, timestamp: key });
      continue;
    }
    bucket.high = Math.max(bucket.high, candle.high);
    bucket.low = Math.min(bucket.low, candle.low);
    bucket.close = candle.close;
    bucket.volume += candle.volume;
    bucket.openInterest = candle.openInterest ?? bucket.openInterest;
  }
  return [...buckets.values()].sort((a, b) => a.timestamp - b.timestamp);
}
function closes(candles) {
  return candles.map((candle) => candle.close);
}

// src/ta/indicators.ts
init_cjs_shims();
function sma(data, period = 20) {
  if (data.length === 0 || period < 1) {
    return [];
  }
  return data.map((_, index) => {
    if (index < period - 1) {
      return null;
    }
    const window = data.slice(index - period + 1, index + 1);
    return window.reduce((total, value) => total + value, 0) / period;
  });
}
function ema(data, period = 20) {
  if (data.length === 0 || period < 1) {
    return [];
  }
  const multiplier = 2 / (period + 1);
  const values = [];
  data.forEach((price, index) => {
    if (index < period - 1) {
      values.push(null);
      return;
    }
    if (index === period - 1) {
      const window = data.slice(0, index + 1);
      values.push(window.reduce((total, value) => total + value, 0) / period);
      return;
    }
    const previous = values[index - 1];
    values.push((price - previous) * multiplier + previous);
  });
  return values;
}
function rsi(data, period = 14) {
  if (data.length < period + 1 || period < 1) {
    return [];
  }
  const changes = data.slice(1).map((value, index) => value - data[index]);
  const opening = changes.slice(0, period);
  let averageGain = opening.filter((change) => change > 0).reduce((a, b) => a + b, 0) / period;
  let averageLoss = opening.filter((change) => change < 0).reduce((a, b) => a + Math.abs(b), 0) / period;
  const values = new Array(period).fill(null);
  values.push(rsiFromAverages(averageGain, averageLoss));
  for (const change of changes.slice(period)) {
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;
    values.push(rsiFromAverages(averageGain, averageLoss));
  }
  return values;
}
function rsiFromAverages(averageGain, averageLoss) {
  if (averageLoss === 0) {
    return 100;
  }
  if (averageGain === 0) {
    return 0;
  }
  return 100 - 100 / (1 + averageGain / averageLoss);
}
function macd(data, { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = {}) {
  if (data.length === 0) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }
  const fast = ema(data, fastPeriod);
  const slow = ema(data, slowPeriod);
  const macdLine = data.map((_, index) => {
    const fastValue = fast[index];
    const slowValue = slow[index];
    return fastValue === null || slowValue === null ? null : fastValue - slowValue;
  });
  const defined = macdLine.filter((value) => value !== null);
  const signalRaw = defined.length === 0 ? [] : ema(defined, signalPeriod);
  const signalLine = [
    ...new Array(macdLine.length - signalRaw.length).fill(null),
    ...signalRaw
  ];
  const histogram = macdLine.map((value, index) => {
    const signal = signalLine[index];
    return value === null || signal === null || signal === void 0 ? null : value - signal;
  });
  return { macdLine, signalLine, histogram };
}
function bollingerBands(data, { period = 20, standardDeviations = 2 } = {}) {
  if (data.length === 0) {
    return { upper: [], middle: [], lower: [] };
  }
  const middle = sma(data, period);
  const upper = [];
  const lower = [];
  data.forEach((_, index) => {
    const mean = middle[index];
    if (mean === null || mean === void 0) {
      upper.push(null);
      lower.push(null);
      return;
    }
    const window = data.slice(index - period + 1, index + 1);
    const variance = window.reduce((total, value) => total + (value - mean) ** 2, 0) / period;
    const deviation = Math.sqrt(variance);
    upper.push(mean + standardDeviations * deviation);
    lower.push(mean - standardDeviations * deviation);
  });
  return { upper, middle, lower };
}
function trueRanges(bars) {
  return bars.map((bar, index) => {
    if (index === 0) {
      return Math.abs(bar.high - bar.low);
    }
    const previousClose = bars[index - 1].close;
    return Math.max(
      bar.high - bar.low,
      Math.abs(bar.high - previousClose),
      Math.abs(bar.low - previousClose)
    );
  });
}
function atr(bars, period = 14) {
  if (bars.length < 2 || period < 1) {
    return [];
  }
  const ranges = trueRanges(bars);
  const values = new Array(bars.length).fill(null);
  if (ranges.length <= period) {
    return values;
  }
  let current = ranges.slice(1, period + 1).reduce((total, value) => total + value, 0) / period;
  values[period] = current;
  for (let index = period + 1; index < ranges.length; index += 1) {
    current = (current * (period - 1) + ranges[index]) / period;
    values[index] = current;
  }
  return values;
}
function adx(bars, period = 14) {
  const empty = { adx: [], plusDi: [], minusDi: [] };
  if (bars.length < period * 2) {
    return empty;
  }
  const plusDm = [0];
  const minusDm = [0];
  for (let index = 1; index < bars.length; index += 1) {
    const upMove = bars[index].high - bars[index - 1].high;
    const downMove = bars[index - 1].low - bars[index].low;
    plusDm.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDm.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }
  const ranges = trueRanges(bars);
  let smoothTr = ranges.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothPlusDm = plusDm.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothMinusDm = minusDm.slice(0, period).reduce((a, b) => a + b, 0);
  const adxValues = new Array(bars.length).fill(null);
  const plusDiValues = new Array(bars.length).fill(null);
  const minusDiValues = new Array(bars.length).fill(null);
  const dxValues = [];
  for (let index = period; index < bars.length; index += 1) {
    smoothTr = smoothTr - smoothTr / period + ranges[index];
    smoothPlusDm = smoothPlusDm - smoothPlusDm / period + plusDm[index];
    smoothMinusDm = smoothMinusDm - smoothMinusDm / period + minusDm[index];
    if (smoothTr === 0) {
      continue;
    }
    const plusDi = 100 * (smoothPlusDm / smoothTr);
    const minusDi = 100 * (smoothMinusDm / smoothTr);
    plusDiValues[index] = plusDi;
    minusDiValues[index] = minusDi;
    const diSum = plusDi + minusDi;
    dxValues.push(diSum === 0 ? 0 : 100 * (Math.abs(plusDi - minusDi) / diSum));
    if (dxValues.length >= period) {
      adxValues[index] = dxValues.slice(-period).reduce((a, b) => a + b, 0) / period;
    }
  }
  return { adx: adxValues, plusDi: plusDiValues, minusDi: minusDiValues };
}
function stochastic(bars, { period = 14, signalPeriod = 3 } = {}) {
  if (bars.length === 0) {
    return { k: [], d: [] };
  }
  const k = bars.map((bar, index) => {
    if (index < period - 1) {
      return null;
    }
    const window = bars.slice(index - period + 1, index + 1);
    const highest = Math.max(...window.map((entry) => entry.high));
    const lowest = Math.min(...window.map((entry) => entry.low));
    const range = highest - lowest;
    return range === 0 ? 100 : (bar.close - lowest) / range * 100;
  });
  const defined = k.filter((value) => value !== null);
  const dRaw = defined.length === 0 ? [] : sma(defined, signalPeriod);
  const d = [
    ...new Array(k.length - dRaw.length).fill(null),
    ...dRaw
  ];
  return { k, d };
}
function supertrend(bars, { period = 10, multiplier = 3 } = {}) {
  const atrValues = atr(bars, period);
  const trend = new Array(bars.length).fill(null);
  const direction = new Array(bars.length).fill(null);
  let upperBand = 0;
  let lowerBand = 0;
  let currentDirection = 1;
  bars.forEach((bar, index) => {
    const atrValue = atrValues[index];
    if (atrValue === null || atrValue === void 0) {
      return;
    }
    const mid = (bar.high + bar.low) / 2;
    const rawUpper = mid + multiplier * atrValue;
    const rawLower = mid - multiplier * atrValue;
    const previousClose = bars[index - 1]?.close ?? bar.close;
    upperBand = rawUpper < upperBand || previousClose > upperBand ? rawUpper : upperBand;
    lowerBand = rawLower > lowerBand || previousClose < lowerBand ? rawLower : lowerBand;
    if (bar.close > upperBand) {
      currentDirection = 1;
    } else if (bar.close < lowerBand) {
      currentDirection = -1;
    }
    direction[index] = currentDirection;
    trend[index] = currentDirection === 1 ? lowerBand : upperBand;
  });
  return { trend, direction };
}
function vwap(bars) {
  let cumulativeVolume = 0;
  let cumulativeNotional = 0;
  return bars.map((bar) => {
    const volume = bar.volume ?? 0;
    const typical = (bar.high + bar.low + bar.close) / 3;
    cumulativeVolume += volume;
    cumulativeNotional += typical * volume;
    return cumulativeVolume === 0 ? null : cumulativeNotional / cumulativeVolume;
  });
}
function latest(series) {
  for (let index = series.length - 1; index >= 0; index -= 1) {
    const value = series[index];
    if (value !== null && value !== void 0) {
      return value;
    }
  }
  return null;
}

// src/ta/marketCalendar.ts
init_cjs_shims();
var IST_OFFSET_MINUTES = 330;
var MS_PER_DAY = 24 * 60 * 60 * 1e3;
var MARKET_HOLIDAYS = /* @__PURE__ */ new Set([
  // 2025
  "2025-02-26",
  "2025-03-14",
  "2025-03-31",
  "2025-04-10",
  "2025-04-14",
  "2025-04-18",
  "2025-05-01",
  "2025-08-15",
  "2025-08-27",
  "2025-10-02",
  "2025-10-21",
  "2025-10-22",
  "2025-11-05",
  "2025-12-25",
  // 2026
  "2026-01-26",
  "2026-03-04",
  "2026-04-01",
  "2026-04-03",
  "2026-04-14",
  "2026-05-01",
  "2026-08-15",
  "2026-10-02",
  "2026-12-25"
]);
function toIstDateString(date = /* @__PURE__ */ new Date()) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1e3);
  return shifted.toISOString().slice(0, 10);
}
function fromDateString(value) {
  return /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
}
function addDays(value, days) {
  return new Date(fromDateString(value).getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}
function isWeekday(value) {
  const day = fromDateString(value).getUTCDay();
  return day >= 1 && day <= 5;
}
function isTradingDay(value) {
  return isWeekday(value) && !MARKET_HOLIDAYS.has(value);
}
function lastTradingDay(from = toIstDateString()) {
  let cursor = from;
  while (!isTradingDay(cursor)) {
    cursor = addDays(cursor, -1);
  }
  return cursor;
}
function previousTradingDay(from = toIstDateString()) {
  return lastTradingDay(addDays(from, -1));
}
function todayOrLastTradingDay() {
  return lastTradingDay(toIstDateString());
}
function tradingDaysAgo(date, days) {
  if (days < 0) {
    throw new RangeError("days must be >= 0");
  }
  let cursor = isTradingDay(date) ? date : todayOrLastTradingDay();
  for (let count = 0; count < days; count += 1) {
    cursor = previousTradingDay(cursor);
  }
  return cursor;
}

// src/skills/builtin/marketDataSummarizer.ts
var MarketDataSummarizerSkill = class extends Skill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "market_data_summarizer",
      description: "Summarize technicals and/or option chain (PCR, OI walls, max pain, ATM strikes) for a symbol.",
      risk: "read_only",
      scope: "market:read",
      params: {
        underlyingSymbol: {
          type: "string",
          required: true,
          description: "Underlying ticker symbol, e.g. NIFTY or RELIANCE"
        },
        mode: {
          type: "string",
          default: "both",
          description: "One of: both, technicals, option_chain"
        },
        rangeDays: {
          type: "integer",
          default: 60,
          description: "Trading days of daily candles to analyze"
        },
        expiry: {
          type: "string",
          default: "nearest",
          description: "Expiry date as YYYY-MM-DD, or 'nearest'"
        },
        strikeRange: {
          type: "integer",
          default: 5,
          description: "Strikes to include either side of ATM"
        }
      }
    };
  }
  steps() {
    return [
      { name: "resolve_instrument", run: (context) => this.resolve(context) },
      { name: "fetch_technicals", run: (context) => this.technicals(context) },
      { name: "fetch_option_chain", run: (context) => this.optionChain(context) },
      {
        name: "prepare_summary",
        run: (context) => ({
          ...context,
          summary: {
            symbol: context.underlyingSymbol,
            securityId: context.instrument?.securityId,
            exchangeSegment: context.instrument?.exchangeSegment,
            technicals: context.technicalSummary,
            optionChain: context.optionChainSummary
          }
        })
      }
    ];
  }
  /** Indices first, then cash equity, then a broad search. */
  async resolve(context) {
    const symbol = String(context.underlyingSymbol).trim().toUpperCase();
    const instrument = await context.client.instruments.find("IDX_I", symbol, {
      exactMatch: true
    }) ?? await context.client.instruments.find("NSE_EQ", symbol, {
      exactMatch: true
    }) ?? await context.client.instruments.findAnywhere(symbol);
    if (!instrument) {
      throw new DhanError(`Underlying symbol not found: ${symbol}`, {
        code: "INSTRUMENT_NOT_FOUND",
        details: { symbol }
      });
    }
    return { ...context, instrument };
  }
  async technicals(context) {
    if (context.mode !== "both" && context.mode !== "technicals") {
      return context;
    }
    const instrument = context.instrument;
    if (!instrument) {
      return context;
    }
    const toDate = todayOrLastTradingDay();
    const rangeDays = Number(context.rangeDays ?? 60);
    const fromDate = tradingDaysAgo(toDate, Math.max(rangeDays, 60));
    const response = await context.client.charts.historical({
      securityId: instrument.securityId,
      exchangeSegment: instrument.exchangeSegment,
      instrument: instrument.instrument,
      fromDate,
      toDate
    });
    const candles = candlesFromSeries(response);
    if (candles.length === 0) {
      const ltp = await context.client.marketFeed.ltpFor(
        instrument.exchangeSegment ?? "NSE_EQ",
        instrument.securityId
      );
      return {
        ...context,
        technicalSummary: {
          ltp: ltp ?? null,
          note: "No historical candles available; using a quote snapshot instead."
        }
      };
    }
    const closeSeries = closes(candles);
    const previous = closeSeries[closeSeries.length - 6];
    const last = closeSeries[closeSeries.length - 1];
    return {
      ...context,
      technicalSummary: {
        ltp: last,
        sma20: round(latest(sma(closeSeries, 20))),
        sma50: round(latest(sma(closeSeries, 50))),
        rsi14: round(latest(rsi(closeSeries, 14))),
        return5dPct: previous ? round((last / previous - 1) * 100) : null,
        dataPointsAnalyzed: closeSeries.length,
        from: fromDate,
        to: toDate
      }
    };
  }
  async optionChain(context) {
    if (context.mode !== "both" && context.mode !== "option_chain") {
      return context;
    }
    const instrument = context.instrument;
    if (!instrument) {
      return context;
    }
    const underlyingSeg = instrument.exchangeSegment === "IDX_I" ? "IDX_I" : "NSE_EQ";
    const underlyingScrip = Number(instrument.securityId);
    let expiry = String(context.expiry ?? "nearest");
    if (expiry === "" || expiry === "nearest") {
      const expiries = await context.client.optionChain.expiryList({
        underlyingScrip,
        underlyingSeg
      });
      const nearest = expiries.data?.[0];
      if (!nearest) {
        return context;
      }
      expiry = nearest;
    }
    const chain = await context.client.optionChain.fetchNormalized({
      underlyingScrip,
      underlyingSeg,
      expiry
    });
    return {
      ...context,
      optionChainSummary: summarizeChain(
        chain,
        expiry,
        Number(context.strikeRange ?? 5)
      )
    };
  }
};
function summarizeChain(chain, expiry, strikeRange) {
  const spot = chain.lastPrice ?? 0;
  const atm = nearestStrike(chain, spot);
  const atmIndex = atm ? chain.strikes.findIndex((entry) => entry.strike === atm.strike) : 0;
  const start = Math.max(0, atmIndex - strikeRange);
  const end = Math.min(chain.strikes.length, atmIndex + strikeRange + 1);
  const openInterest = openInterestFromChain(chain);
  return {
    expiry,
    spot,
    atmStrike: atm?.strike ?? null,
    pcr: round(putCallRatio(openInterest), 3),
    maxPain: maxPain(openInterest) ?? null,
    resistanceWalls: highestCallOi(chain, 3),
    supportWalls: highestPutOi(chain, 3),
    strikes: chain.strikes.slice(start, end).map((entry) => ({
      strike: entry.strike,
      ce: entry.call ? {
        securityId: entry.call.security_id,
        ltp: entry.call.last_price,
        oi: entry.call.oi,
        iv: entry.call.implied_volatility
      } : null,
      pe: entry.put ? {
        securityId: entry.put.security_id,
        ltp: entry.put.last_price,
        oi: entry.put.oi,
        iv: entry.put.implied_volatility
      } : null
    }))
  };
}
function round(value, digits = 2) {
  return value === null ? null : Number(value.toFixed(digits));
}

// src/skills/builtin/optionStructures.ts
init_cjs_shims();
var OptionStructureSkill = class extends Skill {
  steps() {
    return [
      {
        name: "resolve_chain",
        run: async (context) => {
          const { spotPrice, chain } = await resolveIndexChain(
            context.client,
            context.symbol,
            context.expiry
          );
          return { ...context, spotPrice, chain };
        }
      },
      { name: "select_legs", run: (context) => this.selectLegs(context) },
      { name: "build_intent", run: (context) => this.buildIntent(context) }
    ];
  }
  requireChain(context) {
    if (!context.chain || context.spotPrice === void 0) {
      throw new DhanError("Option chain was not resolved", {
        code: "CHAIN_UNAVAILABLE"
      });
    }
    return { chain: context.chain, spot: context.spotPrice };
  }
  leg(entry, optionType, action) {
    if (!entry) {
      throw new DhanError("Strike not present in option chain", {
        code: "STRIKE_NOT_FOUND"
      });
    }
    return {
      action,
      optionType,
      strike: entry.strike,
      securityId: legSecurityId(entry, optionType),
      premium: legPremium(entry, optionType)
    };
  }
};
var indexParams = {
  symbol: {
    type: "string",
    required: true,
    description: "Index symbol, e.g. NIFTY or BANKNIFTY"
  },
  expiry: {
    type: "string",
    required: true,
    description: "Option expiry date as YYYY-MM-DD"
  }
};
var BuyAtmCallSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "buy_atm_call",
      description: "Buy an at-the-money call option on an index (e.g. NIFTY).",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        stopLoss: { type: "number", default: 100 },
        target: { type: "number", default: 200 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const atm = nearestStrike(chain, spot);
    return {
      ...context,
      legs: [this.leg(atm, "CE", TransactionType.BUY)]
    };
  }
  buildIntent(context) {
    const leg = context.legs?.[0];
    return {
      ...context,
      intent: {
        tradeType: "OPTIONS_BUY",
        symbol: context.symbol,
        expiry: context.expiry,
        instrument: `${context.symbol} ${leg?.strike} CE`,
        securityId: leg?.securityId,
        strike: leg?.strike,
        optionType: "CE",
        quantity: context.quantity,
        premium: leg?.premium,
        stopLoss: context.stopLoss,
        target: context.target,
        note: "Prepared ATM call buy. Await human confirmation."
      }
    };
  }
};
var StraddleSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "straddle",
      description: "Build a long straddle: buy ATM call + buy ATM put at the same strike.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 25 },
        stopLoss: { type: "number", default: 300 },
        target: { type: "number", default: 600 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const atm = nearestStrike(chain, spot);
    return {
      ...context,
      atmStrike: atm?.strike,
      legs: [
        this.leg(atm, "CE", TransactionType.BUY),
        this.leg(atm, "PE", TransactionType.BUY)
      ]
    };
  }
  buildIntent(context) {
    const legs = context.legs ?? [];
    const totalPremium = legs.reduce((total, leg) => total + (leg.premium ?? 0), 0);
    const strike = Number(context.atmStrike ?? 0);
    return {
      ...context,
      totalPremium,
      intent: {
        tradeType: "STRADDLE",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        legs,
        totalPremium,
        // Both breakevens sit one combined premium away from the strike.
        breakEvenUpside: strike + totalPremium,
        breakEvenDownside: strike - totalPremium,
        stopLoss: context.stopLoss,
        target: context.target,
        note: "Long straddle prepared. Await human confirmation."
      }
    };
  }
};
var StrangleSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "strangle",
      description: "Build a long strangle: buy OTM call + buy OTM put around the current spot price.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        offsetPct: {
          type: "number",
          default: 1,
          description: "Distance of each strike from spot, in percent"
        },
        stopLoss: { type: "number", default: 200 },
        target: { type: "number", default: 400 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const offset = Number(context.offsetPct ?? 1) / 100;
    return {
      ...context,
      legs: [
        this.leg(
          nearestStrike(chain, spot * (1 + offset)),
          "CE",
          TransactionType.BUY
        ),
        this.leg(
          nearestStrike(chain, spot * (1 - offset)),
          "PE",
          TransactionType.BUY
        )
      ]
    };
  }
  buildIntent(context) {
    return {
      ...context,
      intent: {
        tradeType: "STRANGLE",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        legs: context.legs,
        stopLoss: context.stopLoss,
        target: context.target,
        note: "Long strangle prepared. Await human confirmation."
      }
    };
  }
};
var IronCondorSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "iron_condor",
      description: "Build an iron condor: sell OTM call + sell OTM put, buy further OTM call + put for protection.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        wingWidth: {
          type: "number",
          default: 200,
          description: "Points between the short and long strike on each side"
        },
        maxLoss: { type: "number", default: 5e3 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const wing = Number(context.wingWidth ?? 200);
    const atm = nearestStrike(chain, spot);
    if (!atm) {
      throw new DhanError("Option chain is empty", { code: "CHAIN_EMPTY" });
    }
    const shortCall = findStrike(chain, atm.strike + wing);
    const longCall = findStrike(chain, atm.strike + wing * 2);
    const shortPut = findStrike(chain, atm.strike - wing);
    const longPut = findStrike(chain, atm.strike - wing * 2);
    if (!shortCall || !longCall || !shortPut || !longPut) {
      throw new DhanError(
        "Could not build iron condor \u2014 insufficient strikes in chain",
        { code: "STRIKE_NOT_FOUND", details: { atmStrike: atm.strike, wing } }
      );
    }
    return {
      ...context,
      atmStrike: atm.strike,
      legs: [
        this.leg(shortCall, "CE", TransactionType.SELL),
        this.leg(longCall, "CE", TransactionType.BUY),
        this.leg(shortPut, "PE", TransactionType.SELL),
        this.leg(longPut, "PE", TransactionType.BUY)
      ]
    };
  }
  buildIntent(context) {
    return {
      ...context,
      intent: {
        tradeType: "IRON_CONDOR",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        wingWidth: context.wingWidth,
        maxLoss: context.maxLoss,
        legs: context.legs,
        note: "Iron condor prepared. Await human confirmation before execution."
      }
    };
  }
};
var BullPutSpreadSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "bull_put_spread",
      description: "Build a bull put spread: sell an OTM put, buy a further OTM put for defined risk.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        spreadWidth: { type: "number", default: 200 },
        maxLoss: { type: "number", default: 5e3 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const spread = Number(context.spreadWidth ?? 200);
    const atm = nearestStrike(chain, spot);
    if (!atm) {
      throw new DhanError("Option chain is empty", { code: "CHAIN_EMPTY" });
    }
    const shortPut = findStrike(chain, atm.strike - spread);
    const longPut = findStrike(chain, atm.strike - spread * 2);
    if (!shortPut || !longPut) {
      throw new DhanError(
        "Could not build bull put spread \u2014 insufficient strikes in chain",
        { code: "STRIKE_NOT_FOUND" }
      );
    }
    return {
      ...context,
      legs: [
        this.leg(shortPut, "PE", TransactionType.SELL),
        this.leg(longPut, "PE", TransactionType.BUY)
      ]
    };
  }
  buildIntent(context) {
    return {
      ...context,
      intent: {
        tradeType: "BULL_PUT_SPREAD",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        spreadWidth: context.spreadWidth,
        maxLoss: context.maxLoss,
        legs: context.legs,
        note: "Bull put spread prepared. Await human confirmation before execution."
      }
    };
  }
};
var BearCallSpreadSkill = class extends OptionStructureSkill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "bear_call_spread",
      description: "Build a bear call spread: sell an OTM call, buy a further OTM call for defined risk.",
      risk: "trade_adjacent_read",
      scope: "orders:read",
      params: {
        ...indexParams,
        quantity: { type: "integer", default: 50 },
        spreadWidth: { type: "number", default: 200 },
        maxLoss: { type: "number", default: 5e3 }
      }
    };
  }
  selectLegs(context) {
    const { chain, spot } = this.requireChain(context);
    const spread = Number(context.spreadWidth ?? 200);
    const atm = nearestStrike(chain, spot);
    if (!atm) {
      throw new DhanError("Option chain is empty", { code: "CHAIN_EMPTY" });
    }
    const shortCall = findStrike(chain, atm.strike + spread);
    const longCall = findStrike(chain, atm.strike + spread * 2);
    if (!shortCall || !longCall) {
      throw new DhanError(
        "Could not build bear call spread \u2014 insufficient strikes in chain",
        { code: "STRIKE_NOT_FOUND" }
      );
    }
    return {
      ...context,
      legs: [
        this.leg(shortCall, "CE", TransactionType.SELL),
        this.leg(longCall, "CE", TransactionType.BUY)
      ]
    };
  }
  buildIntent(context) {
    return {
      ...context,
      intent: {
        tradeType: "BEAR_CALL_SPREAD",
        symbol: context.symbol,
        expiry: context.expiry,
        quantity: context.quantity,
        spreadWidth: context.spreadWidth,
        maxLoss: context.maxLoss,
        legs: context.legs,
        note: "Bear call spread prepared. Await human confirmation before execution."
      }
    };
  }
};

// src/skills/builtin/positionManagement.ts
init_cjs_shims();
var SquareOffAllSkill = class extends Skill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "square_off_all",
      description: "Exit all open positions at market price.",
      risk: "destructive_write",
      scope: "orders:write",
      params: {}
    };
  }
  steps() {
    return [
      {
        name: "fetch_positions",
        run: async (context) => {
          const positions = await context.client.positions.list();
          const open = positions.filter(
            (position) => Number(position.netQty ?? 0) !== 0
          );
          return { ...context, positions: open };
        }
      },
      {
        name: "exit_positions",
        run: async (context) => {
          const open = context.positions ?? [];
          if (open.length === 0) {
            return { ...context, exited: false, openCount: 0 };
          }
          const result = await context.client.positions.exitAll();
          return {
            ...context,
            exited: true,
            openCount: open.length,
            exitResult: result
          };
        }
      }
    ];
  }
};
var SquareOffPositionSkill = class extends Skill {
  constructor() {
    super(...arguments);
    this.definition = {
      name: "square_off_position",
      description: "Exit a specific open position by symbol and exchange segment.",
      risk: "destructive_write",
      scope: "orders:write",
      params: {
        symbol: { type: "string", required: true },
        exchangeSegment: { type: "string", required: true }
      }
    };
  }
  steps() {
    return [
      {
        name: "find_position",
        run: async (context) => {
          const symbol = String(context.symbol).toUpperCase();
          const segment = String(context.exchangeSegment);
          const positions = await context.client.positions.list();
          const target = positions.find(
            (position) => String(position.exchangeSegment ?? "") === segment && String(position.tradingSymbol ?? "").toUpperCase() === symbol && Number(position.netQty ?? 0) !== 0
          );
          if (!target) {
            throw new DhanError(
              `No open position found for ${symbol} on ${segment}`,
              { code: "POSITION_NOT_FOUND", details: { symbol, segment } }
            );
          }
          return {
            ...context,
            position: target,
            securityId: target.securityId,
            netQuantity: Number(target.netQty ?? 0)
          };
        }
      },
      {
        name: "exit_position",
        run: async (context) => {
          const position = context.position;
          const netQuantity = Number(context.netQuantity ?? 0);
          const result = await context.client.orders.place({
            transactionType: netQuantity > 0 ? "SELL" : "BUY",
            exchangeSegment: String(
              position.exchangeSegment
            ),
            productType: String(position.productType),
            orderType: "MARKET",
            validity: "DAY",
            quantity: Math.abs(netQuantity),
            securityId: String(position.securityId)
          });
          return { ...context, exited: true, exitResult: result };
        }
      }
    ];
  }
};

// src/skills/builtin/index.ts
function builtinSkills() {
  return [
    new BuyAtmCallSkill(),
    new StraddleSkill(),
    new StrangleSkill(),
    new IronCondorSkill(),
    new BullPutSpreadSkill(),
    new BearCallSpreadSkill(),
    new CoveredCallSkill(),
    new ProtectivePutSkill(),
    new SquareOffAllSkill(),
    new SquareOffPositionSkill(),
    new MarketDataSummarizerSkill()
  ];
}
function createSkillRegistry() {
  return new SkillRegistry().registerAll(builtinSkills());
}

// src/skills/Workflow.ts
init_cjs_shims();

// src/agent/catalogue.ts
init_cjs_shims();

// src/ta/TechnicalAnalysis.ts
init_cjs_shims();
var TIMEFRAMES = {
  1: "m1",
  5: "m5",
  15: "m15",
  25: "m25",
  60: "m60"
};
var DEFAULTS = {
  rsiPeriod: 14,
  atrPeriod: 14,
  adxPeriod: 14,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  smaPeriod: 20,
  emaPeriod: 20,
  bollingerPeriod: 20,
  throttleMs: 1e3
};
var TechnicalAnalysis = class {
  constructor(charts, options = {}) {
    this.charts = charts;
    this.options = { ...DEFAULTS, ...options };
  }
  /** Fetches candles per interval and computes indicators for each. */
  async compute(request2) {
    const intervals = request2.intervals ?? [1, 5, 15, 25, 60];
    const toDate = this.normalizeToDate(request2.toDate);
    const daysBack = request2.daysBack && request2.daysBack > 0 ? request2.daysBack : this.autoDaysNeeded(intervals);
    const fromDate = this.normalizeFromDate(request2.fromDate, toDate, daysBack);
    const indicators = {};
    for (const [index, interval] of intervals.entries()) {
      const key = TIMEFRAMES[interval];
      if (!key) {
        continue;
      }
      const response = await this.charts.intraday({
        securityId: request2.securityId,
        exchangeSegment: request2.exchangeSegment,
        instrument: request2.instrument,
        interval: String(interval),
        oi: request2.oi,
        fromDate,
        toDate
      });
      indicators[key] = this.computeFor(candlesFromSeries(response));
      if (index < intervals.length - 1) {
        await sleep(this.options.throttleMs);
      }
    }
    return {
      meta: {
        securityId: request2.securityId,
        exchangeSegment: request2.exchangeSegment,
        instrument: request2.instrument,
        fromDate,
        toDate
      },
      indicators
    };
  }
  /**
   * Computes the same multi-timeframe result from a single base series by
   * resampling, so one API call can cover every interval.
   */
  computeFromCandles(baseCandles, intervals = [1, 5, 15, 25, 60]) {
    const indicators = {};
    for (const interval of intervals) {
      const key = TIMEFRAMES[interval];
      if (!key) {
        continue;
      }
      indicators[key] = this.computeFor(resample(baseCandles, interval));
    }
    return indicators;
  }
  /** Every indicator for one timeframe, reduced to its latest value. */
  computeFor(candles) {
    if (candles.length === 0) {
      return emptyIndicators();
    }
    const closeSeries = closes(candles);
    const macdResult = macd(closeSeries, {
      fastPeriod: this.options.macdFast,
      slowPeriod: this.options.macdSlow,
      signalPeriod: this.options.macdSignal
    });
    const bands = bollingerBands(closeSeries, {
      period: this.options.bollingerPeriod
    });
    const stoch = stochastic(candles);
    const trend = supertrend(candles);
    return {
      rsi: latest(rsi(closeSeries, this.options.rsiPeriod)),
      adx: latest(adx(candles, this.options.adxPeriod).adx),
      atr: latest(atr(candles, this.options.atrPeriod)),
      sma: latest(sma(closeSeries, this.options.smaPeriod)),
      ema: latest(ema(closeSeries, this.options.emaPeriod)),
      vwap: latest(vwap(candles)),
      macd: {
        macd: latest(macdResult.macdLine),
        signal: latest(macdResult.signalLine),
        hist: latest(macdResult.histogram)
      },
      bollinger: {
        upper: latest(bands.upper),
        middle: latest(bands.middle),
        lower: latest(bands.lower)
      },
      stochastic: { k: latest(stoch.k), d: latest(stoch.d) },
      supertrend: {
        value: latest(trend.trend),
        direction: lastDirection(trend.direction)
      },
      lastClose: closeSeries[closeSeries.length - 1] ?? null,
      candleCount: candles.length
    };
  }
  /** Bars needed before the slowest configured indicator produces a value. */
  requiredBars() {
    return Math.max(
      this.options.rsiPeriod + 1,
      this.options.atrPeriod + 1,
      this.options.adxPeriod * 2,
      this.options.macdSlow,
      this.options.bollingerPeriod
    );
  }
  autoDaysNeeded(intervals) {
    const needed = this.requiredBars();
    return Math.max(
      ...intervals.map((interval) => {
        const barsPerDay = Math.max(
          Math.floor(MARKET_HOURS.sessionMinutes / Math.max(interval, 1)),
          1
        );
        return Math.ceil(needed / barsPerDay);
      }),
      1
    );
  }
  normalizeToDate(toDate) {
    if (!toDate) {
      return todayOrLastTradingDay();
    }
    return isTradingDay(toDate) ? toDate : lastTradingDay(toDate);
  }
  normalizeFromDate(fromDate, toDate, daysBack) {
    if (fromDate) {
      return isTradingDay(fromDate) ? fromDate : lastTradingDay(fromDate);
    }
    return tradingDaysAgo(toDate, daysBack);
  }
};
function lastDirection(directions) {
  for (let index = directions.length - 1; index >= 0; index -= 1) {
    const value = directions[index];
    if (value !== null) {
      return value;
    }
  }
  return null;
}
function emptyIndicators() {
  const empty = [];
  void empty;
  return {
    rsi: null,
    adx: null,
    atr: null,
    sma: null,
    ema: null,
    vwap: null,
    macd: { macd: null, signal: null, hist: null },
    bollinger: { upper: null, middle: null, lower: null },
    stochastic: { k: null, d: null },
    supertrend: { value: null, direction: null },
    lastClose: null,
    candleCount: 0
  };
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// src/ta/multiTimeframe.ts
init_cjs_shims();
var TIMEFRAME_WEIGHTS = {
  m1: 1,
  m5: 2,
  m15: 3,
  m25: 3,
  m60: 4
};
var BIAS_SCORES = {
  bullish: 1,
  neutral: 0.5,
  bearish: 0
};
var TIMEFRAME_ORDER = ["m1", "m5", "m15", "m25", "m60"];
function analyzeMultiTimeframe(data) {
  const perTimeframe = {};
  for (const key of TIMEFRAME_ORDER) {
    const indicators = data.indicators[key];
    if (indicators) {
      perTimeframe[key] = classify(indicators);
    }
  }
  const entries = Object.entries(perTimeframe);
  let totalWeight = 0;
  let accumulated = 0;
  for (const [key, classification] of entries) {
    const weight = TIMEFRAME_WEIGHTS[key] ?? 1;
    totalWeight += weight;
    accumulated += BIAS_SCORES[classification.bias] * weight;
  }
  const confidence = totalWeight === 0 ? 0.5 : accumulated / totalWeight;
  const bias = confidence >= 0.66 ? "bullish" : confidence <= 0.33 ? "bearish" : "neutral";
  const setup = bias === "bullish" ? "buy_on_dip" : bias === "bearish" ? "sell_on_rise" : "range_trade";
  const classifications = entries.map(([, value]) => value);
  return {
    meta: data.meta ?? {},
    perTimeframe,
    summary: {
      bias,
      setup,
      confidence: Number(confidence.toFixed(2)),
      rationale: {
        rsi: rsiRationale(classifications),
        macd: macdRationale(classifications),
        adx: adxRationale(classifications),
        atr: atrRationale(classifications)
      },
      trendStrength: aggregateTrendStrength(classifications)
    }
  };
}
function classify(indicators) {
  const momentum = classifyRsi(indicators.rsi);
  const macdSignal = classifyMacd(
    indicators.macd.macd,
    indicators.macd.signal,
    indicators.macd.hist
  );
  return {
    momentum,
    trend: classifyAdx(indicators.adx),
    macdSignal,
    volatility: classifyAtr(indicators.atr),
    bias: deriveBias(momentum, macdSignal)
  };
}
function classifyRsi(value) {
  if (value === null) return "unknown";
  if (value >= 70) return "overbought";
  if (value <= 30) return "oversold";
  if (value >= 55) return "bullish";
  if (value <= 45) return "bearish";
  return "neutral";
}
function classifyAdx(value) {
  if (value === null) return "unknown";
  if (value >= 25) return "strong";
  if (value <= 15) return "weak";
  return "moderate";
}
function classifyMacd(macdValue, signal, histogram) {
  if (macdValue === null || signal === null) return "unknown";
  if (macdValue > signal && (histogram === null || histogram >= 0)) {
    return "bullish";
  }
  if (macdValue < signal && (histogram === null || histogram <= 0)) {
    return "bearish";
  }
  return "neutral";
}
function classifyAtr(value) {
  if (value === null) return "unknown";
  return value > 0 ? "expanding" : "flat";
}
function deriveBias(momentum, macdSignal) {
  if (momentum === "bullish" && macdSignal === "bullish") return "bullish";
  if (momentum === "bearish" && macdSignal === "bearish") return "bearish";
  return "neutral";
}
function rsiRationale(entries) {
  const ups = entries.filter(
    (entry) => ["bullish", "overbought"].includes(entry.momentum)
  ).length;
  const downs = entries.filter(
    (entry) => ["bearish", "oversold"].includes(entry.momentum)
  ).length;
  if (ups > downs) return `Upward momentum across ${ups} timeframes`;
  if (downs > ups) return `Downward momentum across ${downs} timeframes`;
  return "Mixed RSI momentum";
}
function macdRationale(entries) {
  const ups = entries.filter((entry) => entry.macdSignal === "bullish").length;
  const downs = entries.filter((entry) => entry.macdSignal === "bearish").length;
  if (ups > downs) return "MACD bullish signals dominant";
  if (downs > ups) return "MACD bearish signals dominant";
  return "MACD mixed/neutral";
}
function adxRationale(entries) {
  const strong = entries.filter((entry) => entry.trend === "strong").length;
  if (strong >= 2) return "Strong higher timeframe trend";
  const moderate = entries.filter((entry) => entry.trend === "moderate").length;
  if (moderate >= 2) return "Moderate trend strength";
  return "Weak or undefined trend";
}
function atrRationale(entries) {
  const expanding = entries.filter(
    (entry) => entry.volatility === "expanding"
  ).length;
  return expanding >= entries.length / 2 ? "Volatility expanding" : "Volatility subdued";
}
function aggregateTrendStrength(entries) {
  if (entries.length === 0) return "unknown";
  const strong = entries.filter((entry) => entry.trend === "strong").length;
  const weak = entries.filter((entry) => entry.trend === "weak").length;
  if (strong >= entries.length / 2) return "strong";
  if (weak >= entries.length / 2) return "weak";
  return "moderate";
}

// src/agent/OrderPreview.ts
init_cjs_shims();
var import_zod2 = require("zod");

// src/contracts/order.schema.ts
init_cjs_shims();
var import_zod = require("zod");
var orderSchema = import_zod.z.object({
  dhanClientId: import_zod.z.string().min(1).optional(),
  correlationId: import_zod.z.string().min(1).max(128).optional(),
  transactionType: import_zod.z.enum(["BUY", "SELL"]),
  exchangeSegment: import_zod.z.enum([
    "NSE_EQ",
    "NSE_FNO",
    "NSE_COMM",
    "BSE_EQ",
    "BSE_FNO",
    "MCX_COMM"
  ]),
  productType: import_zod.z.enum(["CNC", "INTRADAY", "MARGIN", "MTF", "BO", "CO"]),
  orderType: import_zod.z.enum([
    "MARKET",
    "LIMIT",
    "STOP_LOSS",
    "STOP_LOSS_MARKET"
  ]),
  validity: import_zod.z.enum(["DAY", "IOC"]).optional(),
  quantity: import_zod.z.number().int().positive(),
  disclosedQuantity: import_zod.z.number().int().nonnegative().optional(),
  price: import_zod.z.number().nonnegative().optional(),
  triggerPrice: import_zod.z.number().nonnegative().optional(),
  afterMarketOrder: import_zod.z.boolean().optional(),
  amoTime: import_zod.z.string().min(1).optional(),
  securityId: import_zod.z.string().min(1),
  boProfitValue: import_zod.z.number().nonnegative().optional(),
  boStopLossValue: import_zod.z.number().nonnegative().optional()
}).superRefine((value, ctx) => {
  if ((value.orderType === "LIMIT" || value.orderType === "STOP_LOSS") && value.price === void 0) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "price is required for LIMIT and STOP_LOSS orders",
      path: ["price"]
    });
  }
  if ((value.orderType === "STOP_LOSS" || value.orderType === "STOP_LOSS_MARKET") && value.triggerPrice === void 0) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "triggerPrice is required for STOP_LOSS and STOP_LOSS_MARKET orders",
      path: ["triggerPrice"]
    });
  }
});

// src/agent/OrderPreview.ts
async function previewOrder(params, options = {}) {
  const errors = [];
  const warnings = [];
  try {
    orderSchema.parse(params);
  } catch (error) {
    if (error instanceof import_zod2.ZodError) {
      errors.push(
        ...error.issues.map(
          (issue) => `${issue.path.join(".") || "order"}: ${issue.message}`
        )
      );
    } else {
      throw error;
    }
  }
  if (!params.correlationId) {
    warnings.push("correlationId is recommended for agent-originated orders");
  }
  let riskChecks;
  if (options.pipeline) {
    const report = await options.pipeline.report({
      args: params,
      instrument: options.instrument,
      type: riskTypeFor(options.instrument)
    });
    riskChecks = report.violations;
    errors.push(...report.violations.map((v) => `${v.check}: ${v.message}`));
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    action: "place_order",
    risk: "live_order_requires_confirmation",
    requires: ["orders:write", "DHANHQ_MCP_ENABLE_WRITES", "LIVE_TRADING"],
    summary: summarize(params),
    riskChecks,
    order: params
  };
}
function summarize(params) {
  const price = params.price === void 0 ? "" : ` @ ${params.price}`;
  return `${params.transactionType} ${params.quantity} of ${params.exchangeSegment}:${params.securityId} as ${params.orderType}${price}`;
}

// src/agent/schemas.ts
init_cjs_shims();
var emptySchema = {
  type: "object",
  properties: {},
  additionalProperties: false
};
function enumOf(values) {
  return { type: "string", enum: [...values] };
}
var searchSchema = {
  type: "object",
  required: ["query"],
  properties: {
    query: { type: "string", description: "Symbol or partial symbol to resolve" },
    segments: {
      type: "array",
      items: enumOf(EXCHANGE_SEGMENTS),
      description: "Segments to search, in order"
    },
    limit: { type: "integer", minimum: 1, maximum: 100 },
    exactMatch: { type: "boolean" }
  },
  additionalProperties: false
};
var feedSchema = {
  type: "object",
  required: ["instruments"],
  properties: {
    instruments: {
      type: "object",
      description: 'Security ids keyed by exchange segment, e.g. { "NSE_EQ": [11536] }',
      additionalProperties: {
        type: "array",
        items: { type: ["integer", "string"] }
      }
    }
  },
  additionalProperties: false
};
var orderSchema2 = {
  type: "object",
  required: [
    "transactionType",
    "exchangeSegment",
    "productType",
    "orderType",
    "securityId",
    "quantity"
  ],
  properties: {
    transactionType: enumOf(TRANSACTION_TYPES),
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    productType: enumOf(PRODUCT_TYPES),
    orderType: enumOf(ORDER_TYPES),
    validity: enumOf(VALIDITIES),
    securityId: { type: "string" },
    quantity: { type: "integer", minimum: 1 },
    disclosedQuantity: { type: "integer", minimum: 0 },
    price: { type: "number", minimum: 0 },
    triggerPrice: { type: "number", minimum: 0 },
    correlationId: { type: "string" }
  },
  additionalProperties: true
};
var modifyOrderSchema = {
  type: "object",
  required: ["orderId"],
  properties: {
    orderId: { type: "string" },
    orderType: enumOf(ORDER_TYPES),
    validity: enumOf(VALIDITIES),
    quantity: { type: "integer", minimum: 1 },
    disclosedQuantity: { type: "integer", minimum: 0 },
    price: { type: "number", minimum: 0 },
    triggerPrice: { type: "number", minimum: 0 }
  },
  additionalProperties: false
};
var cancelSchema = {
  type: "object",
  required: ["orderId"],
  properties: { orderId: { type: "string" } },
  additionalProperties: false
};
var optionChainSchema = {
  type: "object",
  required: ["underlyingScrip", "underlyingSeg", "expiry"],
  properties: {
    underlyingScrip: { type: "integer" },
    underlyingSeg: enumOf(["IDX_I", "NSE_EQ", "NSE_FNO", "BSE_EQ"]),
    expiry: { type: "string", description: "Expiry date as YYYY-MM-DD" }
  },
  additionalProperties: false
};
var expiryListSchema = {
  type: "object",
  required: ["underlyingScrip", "underlyingSeg"],
  properties: {
    underlyingScrip: { type: "integer" },
    underlyingSeg: enumOf(["IDX_I", "NSE_EQ", "NSE_FNO", "BSE_EQ"])
  },
  additionalProperties: false
};
var historicalSchema = {
  type: "object",
  required: ["securityId", "exchangeSegment", "instrument"],
  properties: {
    securityId: { type: "string" },
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    instrument: { type: "string" },
    fromDate: { type: "string" },
    toDate: { type: "string" },
    oi: { type: "boolean" }
  },
  additionalProperties: false
};
var intradaySchema = {
  type: "object",
  required: ["securityId", "exchangeSegment", "instrument"],
  properties: {
    securityId: { type: "string" },
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    instrument: { type: "string" },
    interval: enumOf(CHART_INTERVALS),
    fromDate: { type: "string" },
    toDate: { type: "string" },
    oi: { type: "boolean" }
  },
  additionalProperties: false
};
var technicalsSchema = {
  type: "object",
  required: ["securityId", "exchangeSegment", "instrument"],
  properties: {
    securityId: { type: "string" },
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    instrument: { type: "string" },
    intervals: {
      type: "array",
      items: { type: "integer", enum: [1, 5, 15, 25, 60] }
    },
    daysBack: { type: "integer", minimum: 1 }
  },
  additionalProperties: false
};
var marginSchema = {
  type: "object",
  required: [
    "transactionType",
    "exchangeSegment",
    "productType",
    "securityId",
    "quantity"
  ],
  properties: {
    transactionType: enumOf(TRANSACTION_TYPES),
    exchangeSegment: enumOf(EXCHANGE_SEGMENTS),
    productType: enumOf(PRODUCT_TYPES),
    securityId: { type: "string" },
    quantity: { type: "integer", minimum: 1 },
    price: { type: "number", minimum: 0 },
    triggerPrice: { type: "number", minimum: 0 }
  },
  additionalProperties: true
};
var SKILL_PARAM_TYPES = {
  string: "string",
  integer: "integer",
  number: "number",
  boolean: "boolean"
};
function skillInputSchema(params) {
  const properties = {};
  const required = [];
  for (const [name, config] of Object.entries(params)) {
    properties[name] = { type: SKILL_PARAM_TYPES[config.type] ?? "string" };
    if (config.description) {
      properties[name].description = config.description;
    }
    if (config.default !== void 0) {
      properties[name].default = config.default;
    }
    if (config.required) {
      required.push(name);
    }
  }
  return { type: "object", properties, required, additionalProperties: false };
}

// src/agent/catalogue.ts
var DEFAULT_TOOL_VERSION = "1.0.0";
function tool(definition) {
  return { version: DEFAULT_TOOL_VERSION, ...definition };
}
function buildCatalogue(deps) {
  return [
    ...portfolioTools(deps),
    ...marketTools(deps),
    ...analysisTools(deps),
    ...orderTools(deps),
    ...skillTools(deps)
  ];
}
function portfolioTools({ client }) {
  return [
    tool({
      name: "dhan_profile",
      description: "Fetch the Dhan account profile",
      scope: "portfolio:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: {
        type: "object",
        properties: { dhanClientId: { type: "string" } }
      },
      handler: () => client.profile.get()
    }),
    tool({
      name: "dhan_funds",
      description: "Fetch fund limits and available balance",
      scope: "portfolio:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: {
        type: "object",
        properties: { availabelBalance: { type: "number" } }
      },
      handler: () => client.funds.getLimit()
    }),
    tool({
      name: "dhan_holdings",
      description: "List equity holdings",
      scope: "portfolio:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: { type: "array", items: { type: "object" } },
      handler: () => client.positions.listHoldings()
    }),
    tool({
      name: "dhan_positions",
      description: "List open positions",
      scope: "portfolio:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: { type: "array", items: { type: "object" } },
      handler: () => client.positions.list()
    }),
    tool({
      name: "dhan_orders",
      description: "List today's orders",
      scope: "orders:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: { type: "array", items: { type: "object" } },
      handler: () => client.orders.list()
    }),
    tool({
      name: "dhan_trades",
      description: "List today's trades",
      scope: "orders:read",
      risk: "read_only",
      inputSchema: emptySchema,
      outputSchema: { type: "array", items: { type: "object" } },
      handler: () => client.orders.listTrades()
    })
  ];
}
function marketTools({ client }) {
  return [
    tool({
      name: "dhan_search_instruments",
      description: "Resolve symbols to Dhan security ids",
      scope: "market:read",
      risk: "read_only",
      inputSchema: searchSchema,
      outputSchema: { type: "array", items: { type: "object" } },
      examples: [
        {
          input: { query: "RELIANCE" },
          output: '[{ "securityId": "2885", "symbolName": "RELIANCE" }]'
        }
      ],
      handler: (args) => client.instruments.search(String(args.query), {
        segments: args.segments,
        limit: args.limit,
        exactMatch: args.exactMatch
      })
    }),
    tool({
      name: "dhan_ltp",
      description: "Fetch last traded prices for up to 1000 instruments",
      scope: "market:read",
      risk: "read_only",
      inputSchema: feedSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.marketFeed.ltp(args.instruments)
    }),
    tool({
      name: "dhan_ohlc",
      description: "Fetch open/high/low/close for up to 1000 instruments",
      scope: "market:read",
      risk: "read_only",
      inputSchema: feedSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.marketFeed.ohlc(args.instruments)
    }),
    tool({
      name: "dhan_quote",
      description: "Fetch full quotes with market depth and open interest",
      scope: "market:read",
      risk: "read_only",
      inputSchema: feedSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.marketFeed.quote(args.instruments)
    }),
    tool({
      name: "dhan_option_chain",
      description: "Fetch the option chain for an underlying and expiry",
      scope: "market:read",
      risk: "read_only",
      inputSchema: optionChainSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.optionChain.fetchNormalized(args)
    }),
    tool({
      name: "dhan_option_expiries",
      description: "List available option expiry dates for an underlying",
      scope: "market:read",
      risk: "read_only",
      inputSchema: expiryListSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.optionChain.expiryList(args)
    }),
    tool({
      name: "dhan_historical_data",
      description: "Fetch daily historical candles",
      scope: "market:read",
      risk: "read_only",
      inputSchema: historicalSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.charts.historical(args)
    }),
    tool({
      name: "dhan_intraday_data",
      description: "Fetch intraday candles at a minute interval",
      scope: "market:read",
      risk: "read_only",
      inputSchema: intradaySchema,
      outputSchema: { type: "object" },
      handler: (args) => client.charts.intraday(args)
    })
  ];
}
function analysisTools({ client }) {
  return [
    tool({
      name: "dhan_technical_analysis",
      description: "Compute multi-timeframe indicators (RSI, MACD, ADX, ATR, Bollinger, Supertrend) for an instrument",
      scope: "market:read",
      risk: "read_only",
      inputSchema: technicalsSchema,
      outputSchema: { type: "object" },
      handler: async (args) => {
        const analysis = new TechnicalAnalysis(client.charts);
        return analysis.compute({
          securityId: String(args.securityId),
          exchangeSegment: String(args.exchangeSegment),
          instrument: String(args.instrument),
          intervals: args.intervals,
          daysBack: args.daysBack
        });
      }
    }),
    tool({
      name: "dhan_market_bias",
      description: "Blend multi-timeframe indicators into a single directional bias with rationale",
      scope: "market:read",
      risk: "read_only",
      inputSchema: technicalsSchema,
      outputSchema: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            properties: {
              bias: { type: "string" },
              confidence: { type: "number" }
            }
          }
        }
      },
      handler: async (args) => {
        const analysis = new TechnicalAnalysis(client.charts);
        const result = await analysis.compute({
          securityId: String(args.securityId),
          exchangeSegment: String(args.exchangeSegment),
          instrument: String(args.instrument),
          intervals: args.intervals,
          daysBack: args.daysBack
        });
        return analyzeMultiTimeframe(result);
      }
    }),
    tool({
      name: "dhan_margin_requirement",
      description: "Calculate the margin required for a prospective order",
      scope: "orders:read",
      risk: "trade_adjacent_read",
      inputSchema: marginSchema,
      outputSchema: { type: "object" },
      handler: (args) => client.funds.calculateMargin(args)
    })
  ];
}
function orderTools({ client, pipeline }) {
  return [
    tool({
      name: "dhan_order_preview",
      description: "Validate and summarize an order, including risk checks, without placing it",
      scope: "orders:read",
      risk: "trade_adjacent_read",
      inputSchema: orderSchema2,
      outputSchema: {
        type: "object",
        properties: {
          valid: { type: "boolean" },
          errors: { type: "array", items: { type: "string" } },
          summary: { type: "string" }
        }
      },
      handler: async (args) => {
        const instrument = await resolveInstrument(client, args);
        return previewOrder(args, { pipeline, instrument });
      }
    }),
    tool({
      name: "dhan_place_order",
      description: "Place an order after external confirmation",
      scope: "orders:write",
      risk: "live_write",
      inputSchema: orderSchema2,
      outputSchema: {
        type: "object",
        properties: { orderId: { type: "string" } }
      },
      handler: async (args) => {
        const instrument = await resolveInstrument(client, args);
        if (!instrument) {
          throw new RiskViolationError(
            "instrument_resolution",
            `Cannot verify risk for unknown instrument: ${args.exchangeSegment}:${args.securityId}`
          );
        }
        await pipeline.run({
          args,
          instrument,
          type: riskTypeFor(instrument)
        });
        return client.orders.place(args);
      }
    }),
    tool({
      name: "dhan_modify_order",
      description: "Modify a pending order",
      scope: "orders:write",
      risk: "live_write",
      inputSchema: modifyOrderSchema,
      outputSchema: {
        type: "object",
        properties: { orderId: { type: "string" } }
      },
      handler: (args) => client.orders.modify(args)
    }),
    tool({
      name: "dhan_cancel_order",
      description: "Cancel a pending order",
      scope: "orders:cancel",
      risk: "destructive_write",
      inputSchema: cancelSchema,
      outputSchema: {
        type: "object",
        properties: {
          orderId: { type: "string" },
          orderStatus: { type: "string" }
        }
      },
      handler: (args) => client.orders.cancel(String(args.orderId))
    })
  ];
}
function skillTools({ client, skills }) {
  return skills.list().map(
    (skill) => tool({
      name: `dhan_skill_${skill.name}`,
      description: skill.description,
      scope: skill.scope,
      risk: skill.risk,
      inputSchema: skillInputSchema(skill.params),
      handler: (args) => skills.call(skill.name, args, client)
    })
  );
}
async function resolveInstrument(client, args) {
  if (!args.exchangeSegment || !args.securityId) {
    return void 0;
  }
  return client.instruments.findBySecurityId(
    String(args.exchangeSegment),
    String(args.securityId)
  );
}

// src/agent/Policy.ts
init_cjs_shims();
var READ_SCOPES = [
  "portfolio:read",
  "market:read",
  "orders:read"
];
var WRITE_SCOPES = [
  "orders:write",
  "orders:cancel",
  "alerts:write",
  "risk:write"
];
var ALL_SCOPES = [...READ_SCOPES, ...WRITE_SCOPES];
var Policy = class _Policy {
  constructor(options = {}) {
    const scopes = options.scopes ?? [];
    const unknown = scopes.filter((scope) => !ALL_SCOPES.includes(scope));
    if (unknown.length > 0) {
      throw new DhanError(`Unknown agent scopes: ${unknown.join(", ")}`, {
        code: "INVALID_SCOPE"
      });
    }
    this.scopes = Object.freeze([...new Set(scopes)]);
    this.writesEnabledOverride = options.writesEnabled;
  }
  /** Read scopes only — the safe default for an unattended agent. */
  static readOnly() {
    return new _Policy({ scopes: [...READ_SCOPES] });
  }
  /** Every scope. Writes still require the live-trading gate. */
  static full() {
    return new _Policy({ scopes: ALL_SCOPES });
  }
  /**
   * Reads `DHANHQ_AGENT_SCOPES` (comma or space separated), defaulting to
   * read-only when unset.
   */
  static fromEnv(env = process.env) {
    const raw = env.DHANHQ_AGENT_SCOPES ?? READ_SCOPES.join(",");
    const scopes = raw.split(/[\s,]+/).filter((scope) => scope.length > 0);
    return new _Policy({ scopes });
  }
  allows(scope) {
    return this.scopes.includes(scope);
  }
  /** Throws unless the policy holds `scope`. */
  require(scope) {
    if (this.allows(scope)) {
      return true;
    }
    throw new DhanError(`Agent scope required: ${scope}`, {
      code: "SCOPE_REQUIRED",
      details: { required: scope, held: this.scopes }
    });
  }
  /** True only when both env flags are set, unless explicitly overridden. */
  writesEnabled(env = process.env) {
    if (this.writesEnabledOverride !== void 0) {
      return this.writesEnabledOverride;
    }
    return env.DHANHQ_MCP_ENABLE_WRITES === "true" && env.LIVE_TRADING === "true";
  }
  /** Throws unless the policy holds `scope` *and* writes are enabled. */
  requireWrite(scope, env = process.env) {
    this.require(scope);
    if (this.writesEnabled(env)) {
      return true;
    }
    throw new LiveTradingDisabledError();
  }
};

// src/agent/Tool.ts
init_cjs_shims();
function describeTool(tool2) {
  const { handler: _handler, ...descriptor } = tool2;
  return descriptor;
}
function isWriteTool(tool2) {
  return tool2.risk.endsWith("write");
}

// src/agent/ToolRegistry.ts
var AgentToolRegistry = class {
  constructor(options) {
    this.policy = options.policy ?? Policy.fromEnv();
    this.skills = options.skills ?? createSkillRegistry();
    const pipeline = options.pipeline ?? new Pipeline({
      limits: options.riskLimits,
      provider: riskProviderFor(options.client)
    });
    const catalogue = buildCatalogue({
      client: options.client,
      skills: this.skills,
      pipeline
    });
    this.tools = new Map(catalogue.map((entry) => [entry.name, entry]));
  }
  list() {
    return [...this.tools.values()].map(describeTool);
  }
  names() {
    return [...this.tools.keys()];
  }
  find(name) {
    const found = this.tools.get(name);
    if (!found) {
      throw new DhanError(`Unknown DhanHQ agent tool: ${name}`, {
        code: "TOOL_NOT_FOUND",
        details: { name }
      });
    }
    return found;
  }
  /** Checks policy, then dispatches to the tool's handler. */
  async execute(name, args = {}) {
    const found = this.find(name);
    if (isWriteTool(found)) {
      this.policy.requireWrite(found.scope);
    } else {
      this.policy.require(found.scope);
    }
    return found.handler(args);
  }
  /** Tools this policy may call right now, write gate included. */
  availableTools() {
    const writesEnabled = this.policy.writesEnabled();
    return this.list().filter((entry) => {
      if (!this.policy.allows(entry.scope)) {
        return false;
      }
      return isWriteTool(entry) ? writesEnabled : true;
    });
  }
  /** Capability manifest for an agent runtime. */
  capabilities() {
    const tools = this.list();
    return {
      toolCount: tools.length,
      tools,
      scopes: [...ALL_SCOPES],
      riskLevels: [...new Set(tools.map((entry) => entry.risk))].sort(),
      writeEnabled: this.policy.writesEnabled(),
      skills: this.skills.names()
    };
  }
  getPolicy() {
    return this.policy;
  }
  getSkills() {
    return this.skills;
  }
};
function riskProviderFor(client) {
  return {
    positions: async () => await client.positions.list(),
    funds: async () => await client.funds.getLimit()
  };
}

// src/client/DhanClient.ts
init_cjs_shims();
var import_axios4 = __toESM(require("axios"));

// src/auth/index.ts
init_cjs_shims();

// src/auth/AuthResolver.ts
init_cjs_shims();
var AuthResolver = class {
  constructor(config) {
    this.config = config;
  }
  async resolveAccessToken() {
    if (this.config.tokenProvider) {
      const token = await this.config.tokenProvider();
      if (!token || token.trim().length === 0) {
        throw new DhanError("tokenProvider returned an empty token", {
          code: "AUTHENTICATION_ERROR"
        });
      }
      return token;
    }
    if (!this.config.token || this.config.token.trim().length === 0) {
      throw new DhanError("Missing access token", {
        code: "AUTHENTICATION_ERROR"
      });
    }
    return this.config.token;
  }
  async handleTokenExpired(error) {
    await this.config.onTokenExpired?.(error);
  }
};

// src/auth/DhanAuth.ts
init_cjs_shims();
var import_crypto = require("crypto");
var import_axios = __toESM(require("axios"));
var DhanAuth = class {
  static generateTotp(secret, options = {}) {
    const digits = options.digits ?? 6;
    const period = options.period ?? 30;
    const timestamp = options.timestamp ?? Date.now();
    const counter = Math.floor(timestamp / 1e3 / period);
    const key = base32Decode(secret);
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(Math.floor(counter / 4294967296), 0);
    buffer.writeUInt32BE(counter % 4294967296, 4);
    const digest = (0, import_crypto.createHmac)("sha1", key).update(buffer).digest();
    const offset = digest[digest.length - 1] & 15;
    const code = (digest.readUInt32BE(offset) & 2147483647) % 10 ** digits;
    return code.toString().padStart(digits, "0");
  }
  static async generateAccessToken(request2, dependencies = {}) {
    const client = dependencies.axiosInstance ?? import_axios.default.create({
      baseURL: "https://auth.dhan.co",
      timeout: 5e3
    });
    const response = await client.post(
      "/app/generateAccessToken",
      void 0,
      {
        params: {
          dhanClientId: request2.clientId,
          pin: request2.pin,
          totp: request2.totp
        },
        headers: {
          Accept: "application/json"
        }
      }
    );
    return response.data;
  }
  static async renewWebToken(request2, dependencies = {}) {
    const client = dependencies.axiosInstance ?? import_axios.default.create({
      baseURL: request2.baseURL ?? "https://api.dhan.co/v2",
      timeout: 5e3
    });
    const response = await client.post(
      "/RenewToken",
      void 0,
      {
        headers: {
          "access-token": request2.token,
          dhanClientId: request2.clientId,
          Accept: "application/json"
        }
      }
    );
    return response.data;
  }
};
function base32Decode(input) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = input.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = "";
  for (const char of cleaned) {
    const index = alphabet.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base32 character: ${char}`);
    }
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }
  return Buffer.from(bytes);
}

// src/auth/TokenManager.ts
init_cjs_shims();
var TokenManager = class {
  constructor(config, options) {
    this.config = config;
    this.options = options;
    this.renewBeforeMs = options.renewBeforeMs ?? 5 * 60 * 1e3;
  }
  async ensureValidToken() {
    if (!this.token) {
      return this.generate();
    }
    if (!this.needsRefresh()) {
      return this.token;
    }
    return this.refresh();
  }
  async generate() {
    const totp = DhanAuth.generateTotp(this.options.totpSecret);
    const response = await DhanAuth.generateAccessToken({
      clientId: this.options.clientId,
      pin: this.options.pin,
      totp
    });
    return this.apply(response);
  }
  async refresh() {
    if (!this.token) {
      return this.generate();
    }
    try {
      const response = await DhanAuth.renewWebToken({
        token: this.token,
        clientId: this.options.clientId,
        baseURL: this.config.baseURL
      });
      return this.apply(response);
    } catch {
      return this.generate();
    }
  }
  apply(response) {
    const accessToken = typeof response.accessToken === "string" ? response.accessToken : typeof response.access_token === "string" ? response.access_token : void 0;
    if (!accessToken) {
      throw new Error("Token response did not contain accessToken");
    }
    this.token = accessToken;
    this.config.token = accessToken;
    const expiryTime = typeof response.expiryTime === "string" ? response.expiryTime : typeof response.expiry_time === "string" ? response.expiry_time : void 0;
    this.expiryAt = expiryTime ? Date.parse(expiryTime) : void 0;
    return accessToken;
  }
  needsRefresh() {
    if (!this.expiryAt) {
      return false;
    }
    return Date.now() >= this.expiryAt - this.renewBeforeMs;
  }
};

// src/client/GeneratedClient.ts
init_cjs_shims();

// src/generated/index.ts
init_cjs_shims();

// src/generated/core/ApiError.ts
init_cjs_shims();

// src/generated/core/CancelablePromise.ts
init_cjs_shims();

// src/generated/core/OpenAPI.ts
init_cjs_shims();
var OpenAPI = {
  BASE: "https://api.dhan.co/v2",
  VERSION: "1.0",
  WITH_CREDENTIALS: false,
  CREDENTIALS: "include",
  TOKEN: void 0,
  USERNAME: void 0,
  PASSWORD: void 0,
  HEADERS: void 0,
  ENCODE_PATH: void 0
};

// src/generated/models/AlertCondition.ts
init_cjs_shims();
var AlertCondition;
((AlertCondition2) => {
  let comparisonType;
  ((comparisonType2) => {
    comparisonType2["TECHNICAL_WITH_VALUE"] = "TECHNICAL_WITH_VALUE";
    comparisonType2["TECHNICAL_WITH_INDICATOR"] = "TECHNICAL_WITH_INDICATOR";
    comparisonType2["TECHNICAL_WITH_CLOSE"] = "TECHNICAL_WITH_CLOSE";
    comparisonType2["PRICE_WITH_VALUE"] = "PRICE_WITH_VALUE";
  })(comparisonType = AlertCondition2.comparisonType || (AlertCondition2.comparisonType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["IDX_I"] = "IDX_I";
  })(exchangeSegment = AlertCondition2.exchangeSegment || (AlertCondition2.exchangeSegment = {}));
  let indicatorName;
  ((indicatorName2) => {
    indicatorName2["SMA_5"] = "SMA_5";
    indicatorName2["SMA_10"] = "SMA_10";
    indicatorName2["SMA_20"] = "SMA_20";
    indicatorName2["SMA_50"] = "SMA_50";
    indicatorName2["SMA_100"] = "SMA_100";
    indicatorName2["SMA_200"] = "SMA_200";
    indicatorName2["EMA_5"] = "EMA_5";
    indicatorName2["EMA_10"] = "EMA_10";
    indicatorName2["EMA_20"] = "EMA_20";
    indicatorName2["EMA_50"] = "EMA_50";
    indicatorName2["EMA_100"] = "EMA_100";
    indicatorName2["EMA_200"] = "EMA_200";
    indicatorName2["BB_UPPER"] = "BB_UPPER";
    indicatorName2["BB_LOWER"] = "BB_LOWER";
    indicatorName2["RSI_14"] = "RSI_14";
    indicatorName2["ATR_14"] = "ATR_14";
    indicatorName2["STOCHASTIC"] = "STOCHASTIC";
    indicatorName2["STOCHRSI_14"] = "STOCHRSI_14";
    indicatorName2["MACD_26"] = "MACD_26";
    indicatorName2["MACD_12"] = "MACD_12";
    indicatorName2["MACD_HIST"] = "MACD_HIST";
  })(indicatorName = AlertCondition2.indicatorName || (AlertCondition2.indicatorName = {}));
  let timeFrame;
  ((timeFrame2) => {
    timeFrame2["DAY"] = "DAY";
    timeFrame2["ONE_MIN"] = "ONE_MIN";
    timeFrame2["FIVE_MIN"] = "FIVE_MIN";
    timeFrame2["FIFTEEN_MIN"] = "FIFTEEN_MIN";
  })(timeFrame = AlertCondition2.timeFrame || (AlertCondition2.timeFrame = {}));
  let operator;
  ((operator2) => {
    operator2["CROSSING_UP"] = "CROSSING_UP";
    operator2["CROSSING_DOWN"] = "CROSSING_DOWN";
    operator2["CROSSING_ANY_SIDE"] = "CROSSING_ANY_SIDE";
    operator2["GREATER_THAN"] = "GREATER_THAN";
    operator2["LESS_THAN"] = "LESS_THAN";
    operator2["GREATER_THAN_EQUAL"] = "GREATER_THAN_EQUAL";
    operator2["LESS_THAN_EQUAL"] = "LESS_THAN_EQUAL";
    operator2["EQUAL"] = "EQUAL";
    operator2["NOT_EQUAL"] = "NOT_EQUAL";
  })(operator = AlertCondition2.operator || (AlertCondition2.operator = {}));
  let comparingIndicatorName;
  ((comparingIndicatorName2) => {
    comparingIndicatorName2["SMA_5"] = "SMA_5";
    comparingIndicatorName2["SMA_10"] = "SMA_10";
    comparingIndicatorName2["SMA_20"] = "SMA_20";
    comparingIndicatorName2["SMA_50"] = "SMA_50";
    comparingIndicatorName2["SMA_100"] = "SMA_100";
    comparingIndicatorName2["SMA_200"] = "SMA_200";
    comparingIndicatorName2["EMA_5"] = "EMA_5";
    comparingIndicatorName2["EMA_10"] = "EMA_10";
    comparingIndicatorName2["EMA_20"] = "EMA_20";
    comparingIndicatorName2["EMA_50"] = "EMA_50";
    comparingIndicatorName2["EMA_100"] = "EMA_100";
    comparingIndicatorName2["EMA_200"] = "EMA_200";
    comparingIndicatorName2["BB_UPPER"] = "BB_UPPER";
    comparingIndicatorName2["BB_LOWER"] = "BB_LOWER";
    comparingIndicatorName2["RSI_14"] = "RSI_14";
    comparingIndicatorName2["ATR_14"] = "ATR_14";
    comparingIndicatorName2["STOCHASTIC"] = "STOCHASTIC";
    comparingIndicatorName2["STOCHRSI_14"] = "STOCHRSI_14";
    comparingIndicatorName2["MACD_26"] = "MACD_26";
    comparingIndicatorName2["MACD_12"] = "MACD_12";
    comparingIndicatorName2["MACD_HIST"] = "MACD_HIST";
  })(comparingIndicatorName = AlertCondition2.comparingIndicatorName || (AlertCondition2.comparingIndicatorName = {}));
  let frequency;
  ((frequency2) => {
    frequency2["ONCE"] = "ONCE";
  })(frequency = AlertCondition2.frequency || (AlertCondition2.frequency = {}));
})(AlertCondition || (AlertCondition = {}));

// src/generated/models/AlertOrder.ts
init_cjs_shims();
var AlertOrder;
((AlertOrder2) => {
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = AlertOrder2.transactionType || (AlertOrder2.transactionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["NSE_COMM"] = "NSE_COMM";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = AlertOrder2.exchangeSegment || (AlertOrder2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
    productType2["CO"] = "CO";
    productType2["BO"] = "BO";
  })(productType = AlertOrder2.productType || (AlertOrder2.productType = {}));
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
    orderType2["STOP_LOSS"] = "STOP_LOSS";
    orderType2["STOP_LOSS_MARKET"] = "STOP_LOSS_MARKET";
  })(orderType = AlertOrder2.orderType || (AlertOrder2.orderType = {}));
  let validity;
  ((validity2) => {
    validity2["DAY"] = "DAY";
    validity2["IOC"] = "IOC";
  })(validity = AlertOrder2.validity || (AlertOrder2.validity = {}));
})(AlertOrder || (AlertOrder = {}));

// src/generated/models/EdisBulkFormRequest.ts
init_cjs_shims();
var EdisBulkFormRequest;
((EdisBulkFormRequest2) => {
  let exchange;
  ((exchange2) => {
    exchange2["NSE"] = "NSE";
    exchange2["BSE"] = "BSE";
    exchange2["MCX"] = "MCX";
    exchange2["ALL"] = "ALL";
  })(exchange = EdisBulkFormRequest2.exchange || (EdisBulkFormRequest2.exchange = {}));
  let segment;
  ((segment2) => {
    segment2["EQ"] = "EQ";
    segment2["COMM"] = "COMM";
    segment2["FNO"] = "FNO";
  })(segment = EdisBulkFormRequest2.segment || (EdisBulkFormRequest2.segment = {}));
})(EdisBulkFormRequest || (EdisBulkFormRequest = {}));

// src/generated/models/EdisFormRequest.ts
init_cjs_shims();
var EdisFormRequest;
((EdisFormRequest2) => {
  let exchange;
  ((exchange2) => {
    exchange2["NSE"] = "NSE";
    exchange2["BSE"] = "BSE";
    exchange2["MCX"] = "MCX";
    exchange2["ALL"] = "ALL";
  })(exchange = EdisFormRequest2.exchange || (EdisFormRequest2.exchange = {}));
  let segment;
  ((segment2) => {
    segment2["EQ"] = "EQ";
    segment2["COMM"] = "COMM";
    segment2["FNO"] = "FNO";
  })(segment = EdisFormRequest2.segment || (EdisFormRequest2.segment = {}));
})(EdisFormRequest || (EdisFormRequest = {}));

// src/generated/models/GttModifyRequest.ts
init_cjs_shims();
var GttModifyRequest;
((GttModifyRequest2) => {
  let orderFlag;
  ((orderFlag2) => {
    orderFlag2["SINGLE"] = "SINGLE";
    orderFlag2["OCO"] = "OCO";
  })(orderFlag = GttModifyRequest2.orderFlag || (GttModifyRequest2.orderFlag = {}));
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
  })(orderType = GttModifyRequest2.orderType || (GttModifyRequest2.orderType = {}));
  let legName;
  ((legName2) => {
    legName2["TARGET_LEG"] = "TARGET_LEG";
    legName2["STOP_LOSS_LEG"] = "STOP_LOSS_LEG";
  })(legName = GttModifyRequest2.legName || (GttModifyRequest2.legName = {}));
})(GttModifyRequest || (GttModifyRequest = {}));

// src/generated/models/GTTOrderModel.ts
init_cjs_shims();
var GTTOrderModel;
((GTTOrderModel2) => {
  let orderFlag;
  ((orderFlag2) => {
    orderFlag2["SINGLE"] = "SINGLE";
    orderFlag2["OCO"] = "OCO";
  })(orderFlag = GTTOrderModel2.orderFlag || (GTTOrderModel2.orderFlag = {}));
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = GTTOrderModel2.transactionType || (GTTOrderModel2.transactionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
  })(exchangeSegment = GTTOrderModel2.exchangeSegment || (GTTOrderModel2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["MTF"] = "MTF";
    productType2["MARGIN"] = "MARGIN";
  })(productType = GTTOrderModel2.productType || (GTTOrderModel2.productType = {}));
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
  })(orderType = GTTOrderModel2.orderType || (GTTOrderModel2.orderType = {}));
})(GTTOrderModel || (GTTOrderModel = {}));

// src/generated/models/GttOrderResponse.ts
init_cjs_shims();
var GttOrderResponse;
((GttOrderResponse2) => {
  let orderStatus;
  ((orderStatus2) => {
    orderStatus2["PENDING"] = "PENDING";
    orderStatus2["REJECTED"] = "REJECTED";
    orderStatus2["CANCELLED"] = "CANCELLED";
    orderStatus2["EXPIRED"] = "EXPIRED";
  })(orderStatus = GttOrderResponse2.orderStatus || (GttOrderResponse2.orderStatus = {}));
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = GttOrderResponse2.transactionType || (GttOrderResponse2.transactionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = GttOrderResponse2.exchangeSegment || (GttOrderResponse2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
  })(productType = GttOrderResponse2.productType || (GttOrderResponse2.productType = {}));
  let orderType;
  ((orderType2) => {
    orderType2["SINGLE"] = "SINGLE";
    orderType2["OCO"] = "OCO";
  })(orderType = GttOrderResponse2.orderType || (GttOrderResponse2.orderType = {}));
  let legName;
  ((legName2) => {
    legName2["TARGET_LEG"] = "TARGET_LEG";
    legName2["STOP_LOSS_LEG"] = "STOP_LOSS_LEG";
  })(legName = GttOrderResponse2.legName || (GttOrderResponse2.legName = {}));
  let drvOptionType;
  ((drvOptionType2) => {
    drvOptionType2["CALL"] = "CALL";
    drvOptionType2["PUT"] = "PUT";
    drvOptionType2["NA"] = "NA";
  })(drvOptionType = GttOrderResponse2.drvOptionType || (GttOrderResponse2.drvOptionType = {}));
})(GttOrderResponse || (GttOrderResponse = {}));

// src/generated/models/GttOrderStatusResponse.ts
init_cjs_shims();
var GttOrderStatusResponse;
((GttOrderStatusResponse2) => {
  let orderStatus;
  ((orderStatus2) => {
    orderStatus2["PENDING"] = "PENDING";
    orderStatus2["REJECTED"] = "REJECTED";
    orderStatus2["CANCELLED"] = "CANCELLED";
    orderStatus2["EXPIRED"] = "EXPIRED";
  })(orderStatus = GttOrderStatusResponse2.orderStatus || (GttOrderStatusResponse2.orderStatus = {}));
})(GttOrderStatusResponse || (GttOrderStatusResponse = {}));

// src/generated/models/HistoricalChartsRequest.ts
init_cjs_shims();
var HistoricalChartsRequest;
((HistoricalChartsRequest2) => {
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
    exchangeSegment2["IDX_I"] = "IDX_I";
  })(exchangeSegment = HistoricalChartsRequest2.exchangeSegment || (HistoricalChartsRequest2.exchangeSegment = {}));
  let instrument;
  ((instrument2) => {
    instrument2["INDEX"] = "INDEX";
    instrument2["FUTIDX"] = "FUTIDX";
    instrument2["OPTIDX"] = "OPTIDX";
    instrument2["EQUITY"] = "EQUITY";
    instrument2["FUTSTK"] = "FUTSTK";
    instrument2["OPTSTK"] = "OPTSTK";
    instrument2["FUTCOM"] = "FUTCOM";
    instrument2["OPTFUT"] = "OPTFUT";
  })(instrument = HistoricalChartsRequest2.instrument || (HistoricalChartsRequest2.instrument = {}));
})(HistoricalChartsRequest || (HistoricalChartsRequest = {}));

// src/generated/models/HoldingResponse.ts
init_cjs_shims();
var HoldingResponse;
((HoldingResponse2) => {
  let exchange;
  ((exchange2) => {
    exchange2["NSE"] = "NSE";
    exchange2["BSE"] = "BSE";
    exchange2["MCX"] = "MCX";
    exchange2["ALL"] = "ALL";
  })(exchange = HoldingResponse2.exchange || (HoldingResponse2.exchange = {}));
})(HoldingResponse || (HoldingResponse = {}));

// src/generated/models/IntradayChartsRequest.ts
init_cjs_shims();
var IntradayChartsRequest;
((IntradayChartsRequest2) => {
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
    exchangeSegment2["IDX_I"] = "IDX_I";
  })(exchangeSegment = IntradayChartsRequest2.exchangeSegment || (IntradayChartsRequest2.exchangeSegment = {}));
  let instrument;
  ((instrument2) => {
    instrument2["INDEX"] = "INDEX";
    instrument2["FUTIDX"] = "FUTIDX";
    instrument2["OPTIDX"] = "OPTIDX";
    instrument2["EQUITY"] = "EQUITY";
    instrument2["FUTSTK"] = "FUTSTK";
    instrument2["OPTSTK"] = "OPTSTK";
    instrument2["FUTCOM"] = "FUTCOM";
    instrument2["OPTFUT"] = "OPTFUT";
  })(instrument = IntradayChartsRequest2.instrument || (IntradayChartsRequest2.instrument = {}));
  let interval;
  ((interval2) => {
    interval2["_1"] = "1";
    interval2["_5"] = "5";
    interval2["_15"] = "15";
    interval2["_25"] = "25";
    interval2["_60"] = "60";
  })(interval = IntradayChartsRequest2.interval || (IntradayChartsRequest2.interval = {}));
})(IntradayChartsRequest || (IntradayChartsRequest = {}));

// src/generated/models/KnowYourMarginReq.ts
init_cjs_shims();
var KnowYourMarginReq;
((KnowYourMarginReq2) => {
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = KnowYourMarginReq2.exchangeSegment || (KnowYourMarginReq2.exchangeSegment = {}));
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = KnowYourMarginReq2.transactionType || (KnowYourMarginReq2.transactionType = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
    productType2["CO"] = "CO";
    productType2["BO"] = "BO";
  })(productType = KnowYourMarginReq2.productType || (KnowYourMarginReq2.productType = {}));
})(KnowYourMarginReq || (KnowYourMarginReq = {}));

// src/generated/models/OptionChartRequest.ts
init_cjs_shims();
var OptionChartRequest;
((OptionChartRequest2) => {
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
    exchangeSegment2["IDX_I"] = "IDX_I";
  })(exchangeSegment = OptionChartRequest2.exchangeSegment || (OptionChartRequest2.exchangeSegment = {}));
  let interval;
  ((interval2) => {
    interval2["_1"] = "1";
    interval2["_5"] = "5";
    interval2["_15"] = "15";
    interval2["_25"] = "25";
    interval2["_60"] = "60";
  })(interval = OptionChartRequest2.interval || (OptionChartRequest2.interval = {}));
  let instrument;
  ((instrument2) => {
    instrument2["INDEX"] = "INDEX";
    instrument2["FUTIDX"] = "FUTIDX";
    instrument2["OPTIDX"] = "OPTIDX";
    instrument2["EQUITY"] = "EQUITY";
    instrument2["FUTSTK"] = "FUTSTK";
    instrument2["OPTSTK"] = "OPTSTK";
    instrument2["FUTCOM"] = "FUTCOM";
    instrument2["OPTFUT"] = "OPTFUT";
  })(instrument = OptionChartRequest2.instrument || (OptionChartRequest2.instrument = {}));
  let expiryFlag;
  ((expiryFlag2) => {
    expiryFlag2["MONTH"] = "MONTH";
    expiryFlag2["WEEK"] = "WEEK";
  })(expiryFlag = OptionChartRequest2.expiryFlag || (OptionChartRequest2.expiryFlag = {}));
  let expiryCode;
  ((expiryCode2) => {
    expiryCode2[expiryCode2["_1"] = 1] = "_1";
    expiryCode2[expiryCode2["_2"] = 2] = "_2";
    expiryCode2[expiryCode2["_3"] = 3] = "_3";
  })(expiryCode = OptionChartRequest2.expiryCode || (OptionChartRequest2.expiryCode = {}));
  let drvOptionType;
  ((drvOptionType2) => {
    drvOptionType2["CALL"] = "CALL";
    drvOptionType2["PUT"] = "PUT";
  })(drvOptionType = OptionChartRequest2.drvOptionType || (OptionChartRequest2.drvOptionType = {}));
  let requiredData;
  ((requiredData2) => {
    requiredData2["OPEN"] = "open";
    requiredData2["HIGH"] = "high";
    requiredData2["LOW"] = "low";
    requiredData2["CLOSE"] = "close";
    requiredData2["IV"] = "iv";
    requiredData2["VOLUME"] = "volume";
    requiredData2["STRIKE"] = "strike";
    requiredData2["OI"] = "oi";
    requiredData2["SPOT"] = "spot";
  })(requiredData = OptionChartRequest2.requiredData || (OptionChartRequest2.requiredData = {}));
})(OptionChartRequest || (OptionChartRequest = {}));

// src/generated/models/OrderModifyRequest.ts
init_cjs_shims();
var OrderModifyRequest;
((OrderModifyRequest2) => {
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
    orderType2["STOP_LOSS"] = "STOP_LOSS";
    orderType2["STOP_LOSS_MARKET"] = "STOP_LOSS_MARKET";
  })(orderType = OrderModifyRequest2.orderType || (OrderModifyRequest2.orderType = {}));
  let legName;
  ((legName2) => {
    legName2["ENTRY_LEG"] = "ENTRY_LEG";
    legName2["STOP_LOSS_LEG"] = "STOP_LOSS_LEG";
    legName2["TARGET_LEG"] = "TARGET_LEG";
    legName2["NA"] = "NA";
  })(legName = OrderModifyRequest2.legName || (OrderModifyRequest2.legName = {}));
  let validity;
  ((validity2) => {
    validity2["DAY"] = "DAY";
    validity2["IOC"] = "IOC";
  })(validity = OrderModifyRequest2.validity || (OrderModifyRequest2.validity = {}));
})(OrderModifyRequest || (OrderModifyRequest = {}));

// src/generated/models/OrderRequest.ts
init_cjs_shims();
var OrderRequest;
((OrderRequest2) => {
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = OrderRequest2.transactionType || (OrderRequest2.transactionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["NSE_COMM"] = "NSE_COMM";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = OrderRequest2.exchangeSegment || (OrderRequest2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
    productType2["CO"] = "CO";
    productType2["BO"] = "BO";
  })(productType = OrderRequest2.productType || (OrderRequest2.productType = {}));
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
    orderType2["STOP_LOSS"] = "STOP_LOSS";
    orderType2["STOP_LOSS_MARKET"] = "STOP_LOSS_MARKET";
  })(orderType = OrderRequest2.orderType || (OrderRequest2.orderType = {}));
  let validity;
  ((validity2) => {
    validity2["DAY"] = "DAY";
    validity2["IOC"] = "IOC";
  })(validity = OrderRequest2.validity || (OrderRequest2.validity = {}));
  let amoTime;
  ((amoTime2) => {
    amoTime2["OPEN"] = "OPEN";
    amoTime2["OPEN_30"] = "OPEN_30";
    amoTime2["OPEN_60"] = "OPEN_60";
    amoTime2["PRE_OPEN"] = "PRE_OPEN";
  })(amoTime = OrderRequest2.amoTime || (OrderRequest2.amoTime = {}));
})(OrderRequest || (OrderRequest = {}));

// src/generated/models/OrderResponse.ts
init_cjs_shims();
var OrderResponse;
((OrderResponse2) => {
  let orderStatus;
  ((orderStatus2) => {
    orderStatus2["TRANSIT"] = "TRANSIT";
    orderStatus2["PENDING"] = "PENDING";
    orderStatus2["REJECTED"] = "REJECTED";
    orderStatus2["CANCELLED"] = "CANCELLED";
    orderStatus2["PART_TRADED"] = "PART_TRADED";
    orderStatus2["TRADED"] = "TRADED";
    orderStatus2["EXPIRED"] = "EXPIRED";
  })(orderStatus = OrderResponse2.orderStatus || (OrderResponse2.orderStatus = {}));
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = OrderResponse2.transactionType || (OrderResponse2.transactionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = OrderResponse2.exchangeSegment || (OrderResponse2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
    productType2["CO"] = "CO";
    productType2["BO"] = "BO";
  })(productType = OrderResponse2.productType || (OrderResponse2.productType = {}));
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
    orderType2["STOP_LOSS"] = "STOP_LOSS";
    orderType2["STOP_LOSS_MARKET"] = "STOP_LOSS_MARKET";
  })(orderType = OrderResponse2.orderType || (OrderResponse2.orderType = {}));
  let validity;
  ((validity2) => {
    validity2["DAY"] = "DAY";
    validity2["IOC"] = "IOC";
  })(validity = OrderResponse2.validity || (OrderResponse2.validity = {}));
  let legName;
  ((legName2) => {
    legName2["ENTRY_LEG"] = "ENTRY_LEG";
    legName2["STOP_LOSS_LEG"] = "STOP_LOSS_LEG";
    legName2["TARGET_LEG"] = "TARGET_LEG";
    legName2["NA"] = "NA";
  })(legName = OrderResponse2.legName || (OrderResponse2.legName = {}));
  let drvOptionType;
  ((drvOptionType2) => {
    drvOptionType2["CALL"] = "CALL";
    drvOptionType2["PUT"] = "PUT";
    drvOptionType2["NA"] = "NA";
  })(drvOptionType = OrderResponse2.drvOptionType || (OrderResponse2.drvOptionType = {}));
})(OrderResponse || (OrderResponse = {}));

// src/generated/models/OrderStatusResponse.ts
init_cjs_shims();
var OrderStatusResponse;
((OrderStatusResponse2) => {
  let orderStatus;
  ((orderStatus2) => {
    orderStatus2["TRANSIT"] = "TRANSIT";
    orderStatus2["PENDING"] = "PENDING";
    orderStatus2["REJECTED"] = "REJECTED";
    orderStatus2["CANCELLED"] = "CANCELLED";
    orderStatus2["PART_TRADED"] = "PART_TRADED";
    orderStatus2["TRADED"] = "TRADED";
    orderStatus2["EXPIRED"] = "EXPIRED";
    orderStatus2["MODIFIED"] = "MODIFIED";
    orderStatus2["TRIGGERED"] = "TRIGGERED";
    orderStatus2["INACTIVE"] = "INACTIVE";
  })(orderStatus = OrderStatusResponse2.orderStatus || (OrderStatusResponse2.orderStatus = {}));
})(OrderStatusResponse || (OrderStatusResponse = {}));

// src/generated/models/PositionConversionRequest.ts
init_cjs_shims();
var PositionConversionRequest;
((PositionConversionRequest2) => {
  let fromProductType;
  ((fromProductType2) => {
    fromProductType2["CNC"] = "CNC";
    fromProductType2["INTRADAY"] = "INTRADAY";
    fromProductType2["MARGIN"] = "MARGIN";
    fromProductType2["MTF"] = "MTF";
    fromProductType2["CO"] = "CO";
    fromProductType2["BO"] = "BO";
  })(fromProductType = PositionConversionRequest2.fromProductType || (PositionConversionRequest2.fromProductType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = PositionConversionRequest2.exchangeSegment || (PositionConversionRequest2.exchangeSegment = {}));
  let positionType;
  ((positionType2) => {
    positionType2["LONG"] = "LONG";
    positionType2["SHORT"] = "SHORT";
    positionType2["CLOSED"] = "CLOSED";
  })(positionType = PositionConversionRequest2.positionType || (PositionConversionRequest2.positionType = {}));
  let toProductType;
  ((toProductType2) => {
    toProductType2["CNC"] = "CNC";
    toProductType2["INTRADAY"] = "INTRADAY";
    toProductType2["MARGIN"] = "MARGIN";
    toProductType2["MTF"] = "MTF";
    toProductType2["CO"] = "CO";
    toProductType2["BO"] = "BO";
  })(toProductType = PositionConversionRequest2.toProductType || (PositionConversionRequest2.toProductType = {}));
})(PositionConversionRequest || (PositionConversionRequest = {}));

// src/generated/models/PositionResponse.ts
init_cjs_shims();
var PositionResponse;
((PositionResponse2) => {
  let positionType;
  ((positionType2) => {
    positionType2["LONG"] = "LONG";
    positionType2["SHORT"] = "SHORT";
    positionType2["CLOSED"] = "CLOSED";
  })(positionType = PositionResponse2.positionType || (PositionResponse2.positionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = PositionResponse2.exchangeSegment || (PositionResponse2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
    productType2["CO"] = "CO";
    productType2["BO"] = "BO";
  })(productType = PositionResponse2.productType || (PositionResponse2.productType = {}));
  let drvOptionType;
  ((drvOptionType2) => {
    drvOptionType2["CALL"] = "CALL";
    drvOptionType2["PUT"] = "PUT";
    drvOptionType2["NA"] = "NA";
  })(drvOptionType = PositionResponse2.drvOptionType || (PositionResponse2.drvOptionType = {}));
})(PositionResponse || (PositionResponse = {}));

// src/generated/models/ScriptItem.ts
init_cjs_shims();
var ScriptItem;
((ScriptItem2) => {
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["NSE_COMM"] = "NSE_COMM";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = ScriptItem2.exchangeSegment || (ScriptItem2.exchangeSegment = {}));
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = ScriptItem2.transactionType || (ScriptItem2.transactionType = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
    productType2["CO"] = "CO";
    productType2["BO"] = "BO";
  })(productType = ScriptItem2.productType || (ScriptItem2.productType = {}));
})(ScriptItem || (ScriptItem = {}));

// src/generated/models/SuperModifyRequest.ts
init_cjs_shims();
var SuperModifyRequest;
((SuperModifyRequest2) => {
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
  })(orderType = SuperModifyRequest2.orderType || (SuperModifyRequest2.orderType = {}));
  let legName;
  ((legName2) => {
    legName2["ENTRY_LEG"] = "ENTRY_LEG";
    legName2["STOP_LOSS_LEG"] = "STOP_LOSS_LEG";
    legName2["TARGET_LEG"] = "TARGET_LEG";
  })(legName = SuperModifyRequest2.legName || (SuperModifyRequest2.legName = {}));
})(SuperModifyRequest || (SuperModifyRequest = {}));

// src/generated/models/SuperOrderLeg.ts
init_cjs_shims();
var SuperOrderLeg;
((SuperOrderLeg2) => {
  let legName;
  ((legName2) => {
    legName2["STOP_LOSS_LEG"] = "STOP_LOSS_LEG";
    legName2["TARGET_LEG"] = "TARGET_LEG";
  })(legName = SuperOrderLeg2.legName || (SuperOrderLeg2.legName = {}));
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = SuperOrderLeg2.transactionType || (SuperOrderLeg2.transactionType = {}));
  let orderStatus;
  ((orderStatus2) => {
    orderStatus2["PENDING"] = "PENDING";
    orderStatus2["PART_TRADED"] = "PART_TRADED";
    orderStatus2["TRIGGERED"] = "TRIGGERED";
    orderStatus2["CANCELLED"] = "CANCELLED";
    orderStatus2["EXPIRED"] = "EXPIRED";
  })(orderStatus = SuperOrderLeg2.orderStatus || (SuperOrderLeg2.orderStatus = {}));
})(SuperOrderLeg || (SuperOrderLeg = {}));

// src/generated/models/SuperOrderRequest.ts
init_cjs_shims();
var SuperOrderRequest;
((SuperOrderRequest2) => {
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = SuperOrderRequest2.transactionType || (SuperOrderRequest2.transactionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["NSE_COMM"] = "NSE_COMM";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = SuperOrderRequest2.exchangeSegment || (SuperOrderRequest2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
  })(productType = SuperOrderRequest2.productType || (SuperOrderRequest2.productType = {}));
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
  })(orderType = SuperOrderRequest2.orderType || (SuperOrderRequest2.orderType = {}));
})(SuperOrderRequest || (SuperOrderRequest = {}));

// src/generated/models/SuperOrderResponse.ts
init_cjs_shims();
var SuperOrderResponse;
((SuperOrderResponse2) => {
  let orderStatus;
  ((orderStatus2) => {
    orderStatus2["TRANSIT"] = "TRANSIT";
    orderStatus2["PENDING"] = "PENDING";
    orderStatus2["REJECTED"] = "REJECTED";
    orderStatus2["CANCELLED"] = "CANCELLED";
    orderStatus2["PART_TRADED"] = "PART_TRADED";
    orderStatus2["TRADED"] = "TRADED";
    orderStatus2["CLOSED"] = "CLOSED";
    orderStatus2["EXPIRED"] = "EXPIRED";
  })(orderStatus = SuperOrderResponse2.orderStatus || (SuperOrderResponse2.orderStatus = {}));
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = SuperOrderResponse2.transactionType || (SuperOrderResponse2.transactionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["NSE_COMM"] = "NSE_COMM";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = SuperOrderResponse2.exchangeSegment || (SuperOrderResponse2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
  })(productType = SuperOrderResponse2.productType || (SuperOrderResponse2.productType = {}));
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
  })(orderType = SuperOrderResponse2.orderType || (SuperOrderResponse2.orderType = {}));
  let validity;
  ((validity2) => {
    validity2["DAY"] = "DAY";
    validity2["IOC"] = "IOC";
  })(validity = SuperOrderResponse2.validity || (SuperOrderResponse2.validity = {}));
  let legName;
  ((legName2) => {
    legName2["ENTRY_LEG"] = "ENTRY_LEG";
  })(legName = SuperOrderResponse2.legName || (SuperOrderResponse2.legName = {}));
})(SuperOrderResponse || (SuperOrderResponse = {}));

// src/generated/models/TradeHistoryResponseModel.ts
init_cjs_shims();
var TradeHistoryResponseModel;
((TradeHistoryResponseModel2) => {
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = TradeHistoryResponseModel2.transactionType || (TradeHistoryResponseModel2.transactionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = TradeHistoryResponseModel2.exchangeSegment || (TradeHistoryResponseModel2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
    productType2["CO"] = "CO";
    productType2["BO"] = "BO";
  })(productType = TradeHistoryResponseModel2.productType || (TradeHistoryResponseModel2.productType = {}));
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
    orderType2["STOP_LOSS"] = "STOP_LOSS";
    orderType2["STOP_LOSS_MARKET"] = "STOP_LOSS_MARKET";
  })(orderType = TradeHistoryResponseModel2.orderType || (TradeHistoryResponseModel2.orderType = {}));
  let drvOptionType;
  ((drvOptionType2) => {
    drvOptionType2["CALL"] = "CALL";
    drvOptionType2["PUT"] = "PUT";
    drvOptionType2["NA"] = "NA";
  })(drvOptionType = TradeHistoryResponseModel2.drvOptionType || (TradeHistoryResponseModel2.drvOptionType = {}));
})(TradeHistoryResponseModel || (TradeHistoryResponseModel = {}));

// src/generated/models/TradeResponse.ts
init_cjs_shims();
var TradeResponse;
((TradeResponse2) => {
  let transactionType;
  ((transactionType2) => {
    transactionType2["BUY"] = "BUY";
    transactionType2["SELL"] = "SELL";
  })(transactionType = TradeResponse2.transactionType || (TradeResponse2.transactionType = {}));
  let exchangeSegment;
  ((exchangeSegment2) => {
    exchangeSegment2["NSE_EQ"] = "NSE_EQ";
    exchangeSegment2["NSE_FNO"] = "NSE_FNO";
    exchangeSegment2["BSE_EQ"] = "BSE_EQ";
    exchangeSegment2["BSE_FNO"] = "BSE_FNO";
    exchangeSegment2["MCX_COMM"] = "MCX_COMM";
  })(exchangeSegment = TradeResponse2.exchangeSegment || (TradeResponse2.exchangeSegment = {}));
  let productType;
  ((productType2) => {
    productType2["CNC"] = "CNC";
    productType2["INTRADAY"] = "INTRADAY";
    productType2["MARGIN"] = "MARGIN";
    productType2["MTF"] = "MTF";
    productType2["CO"] = "CO";
    productType2["BO"] = "BO";
  })(productType = TradeResponse2.productType || (TradeResponse2.productType = {}));
  let orderType;
  ((orderType2) => {
    orderType2["LIMIT"] = "LIMIT";
    orderType2["MARKET"] = "MARKET";
    orderType2["STOP_LOSS"] = "STOP_LOSS";
    orderType2["STOP_LOSS_MARKET"] = "STOP_LOSS_MARKET";
  })(orderType = TradeResponse2.orderType || (TradeResponse2.orderType = {}));
  let drvOptionType;
  ((drvOptionType2) => {
    drvOptionType2["CALL"] = "CALL";
    drvOptionType2["PUT"] = "PUT";
    drvOptionType2["NA"] = "NA";
  })(drvOptionType = TradeResponse2.drvOptionType || (TradeResponse2.drvOptionType = {}));
})(TradeResponse || (TradeResponse = {}));

// src/generated/services/ConditionalTriggersService.ts
init_cjs_shims();

// src/generated/core/request.ts
init_cjs_shims();
var import_axios2 = __toESM(require("axios"));
var import_form_data = __toESM(require_form_data());

// src/generated/services/DataApiSService.ts
init_cjs_shims();

// src/generated/services/EdisService.ts
init_cjs_shims();

// src/generated/services/ForeverOrderService.ts
init_cjs_shims();

// src/generated/services/FundsMarginService.ts
init_cjs_shims();

// src/generated/services/IpSetupService.ts
init_cjs_shims();

// src/generated/services/OrdersService.ts
init_cjs_shims();

// src/generated/services/PositionsPortfolioService.ts
init_cjs_shims();

// src/generated/services/StatementsService.ts
init_cjs_shims();

// src/generated/services/SuperOrderService.ts
init_cjs_shims();

// src/generated/services/TraderSControlService.ts
init_cjs_shims();

// src/client/GeneratedClient.ts
var GeneratedClient = class {
  constructor(config) {
    OpenAPI.BASE = config.baseURL ?? "https://api.dhan.co/v2";
    OpenAPI.TOKEN = void 0;
    OpenAPI.HEADERS = config.token ? {
      "access-token": config.token
    } : void 0;
  }
};

// src/client/HttpClient.ts
init_cjs_shims();
var import_axios3 = __toESM(require("axios"));

// src/client/RateLimiter.ts
init_cjs_shims();
var import_bottleneck = __toESM(require("bottleneck"));
var RateLimiter = class {
  constructor(config = {}) {
    const minTime = config.minTime ?? 120;
    this.readLimiter = new import_bottleneck.default({ minTime });
    this.writeLimiter = new import_bottleneck.default({ minTime });
  }
  scheduleRead(task) {
    return this.readLimiter.schedule(task);
  }
  scheduleWrite(task) {
    return this.writeLimiter.schedule(task);
  }
};

// src/client/HttpClient.ts
var HttpClient = class {
  constructor(config, dependencies = {}) {
    this.authResolver = new AuthResolver(config);
    this.clientId = config.clientId;
    this.rateLimiter = dependencies.rateLimiter ?? new RateLimiter({ minTime: config.rateLimitMinTimeMs });
    this.axiosInstance = dependencies.axiosInstance ?? import_axios3.default.create({
      baseURL: config.baseURL ?? "https://api.dhan.co/v2",
      timeout: config.timeoutMs ?? 5e3,
      headers: {
        Accept: "application/json"
      }
    });
  }
  async request(options) {
    const execute = () => this.execute(options);
    try {
      if (options.method === "GET") {
        return await this.rateLimiter.scheduleRead(execute);
      }
      return await this.rateLimiter.scheduleWrite(execute);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }
  getClientId() {
    return this.clientId;
  }
  async getAccessToken() {
    return this.authResolver.resolveAccessToken();
  }
  async execute(options) {
    try {
      const response = await this.axiosInstance.request(
        await this.toAxiosConfig(options)
      );
      return response.data;
    } catch (error) {
      const normalized = this.normalizeError(error);
      if (this.isAuthenticationFailure(normalized)) {
        await this.authResolver.handleTokenExpired(normalized);
        const response = await this.axiosInstance.request(
          await this.toAxiosConfig(options)
        );
        return response.data;
      }
      if (options.safeToRetry && this.shouldRetry(normalized) && options.method === "GET") {
        const response = await this.axiosInstance.request(
          await this.toAxiosConfig(options)
        );
        return response.data;
      }
      throw normalized;
    }
  }
  async toAxiosConfig(options) {
    const token = await this.authResolver.resolveAccessToken();
    return {
      method: options.method,
      url: options.url,
      data: options.data,
      params: options.params,
      headers: {
        "access-token": token,
        ...options.headers
      }
    };
  }
  shouldRetry(error) {
    return error instanceof NetworkError || error instanceof ApiResponseError && error.status !== void 0 && error.status >= 500;
  }
  isAuthenticationFailure(error) {
    return error instanceof ApiResponseError && error.status !== void 0 && error.status === 401;
  }
  normalizeError(error) {
    if (error instanceof Error && !(error instanceof import_axios3.AxiosError)) {
      return error;
    }
    if (error instanceof import_axios3.AxiosError || isAxiosLikeError(error)) {
      const axiosError = error;
      if (axiosError.response) {
        return new ApiResponseError(
          `Dhan API request failed with status ${axiosError.response.status}`,
          axiosError.response.status,
          this.extractErrorPayload(axiosError.response),
          error
        );
      }
      if (axiosError.request) {
        return new NetworkError(
          `Network request failed: ${axiosError.message}`,
          error
        );
      }
    }
    if (error instanceof BottleneckError) {
      return new RateLimitError(error.message, error);
    }
    return new NetworkError("Unexpected request failure", error);
  }
  extractErrorPayload(response) {
    if (response.data === void 0) {
      return {
        status: response.status,
        statusText: response.statusText
      };
    }
    return response.data;
  }
};
var BottleneckError = class extends Error {
};
function isAxiosLikeError(error) {
  return typeof error === "object" && error !== null && "isAxiosError" in error;
}

// src/resources/index.ts
init_cjs_shims();

// src/resources/Alerts.ts
init_cjs_shims();
var Alerts = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async list() {
    return this.httpClient.request({
      method: "GET",
      url: "/alerts/orders",
      safeToRetry: true
    });
  }
  async getById(alertId) {
    return this.httpClient.request({
      method: "GET",
      url: `/alerts/orders/${encodeURIComponent(alertId)}`,
      safeToRetry: true
    });
  }
  async place(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/alerts/orders",
      data: request2,
      safeToRetry: false
    });
  }
  async modify(alertId, request2) {
    return this.httpClient.request({
      method: "PUT",
      url: `/alerts/orders/${encodeURIComponent(alertId)}`,
      data: request2,
      safeToRetry: false
    });
  }
  async delete(alertId) {
    return this.httpClient.request({
      method: "DELETE",
      url: `/alerts/orders/${encodeURIComponent(alertId)}`,
      safeToRetry: false
    });
  }
};

// src/resources/Charts.ts
init_cjs_shims();
var Charts = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async option(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/charts/rollingoption",
      data: request2,
      safeToRetry: false
    });
  }
  async intraday(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/charts/intraday",
      data: request2,
      safeToRetry: false
    });
  }
  async historical(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/charts/historical",
      data: request2,
      safeToRetry: false
    });
  }
};

// src/resources/Edis.ts
init_cjs_shims();
var Edis = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async form(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/edis/form",
      data: request2,
      safeToRetry: false
    });
  }
  async bulkForm(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/edis/bulkform",
      data: request2,
      safeToRetry: false
    });
  }
  async requestTpin() {
    return this.httpClient.request({
      method: "GET",
      url: "/edis/tpin",
      safeToRetry: true
    });
  }
  async getQuantityStatus(isin) {
    return this.httpClient.request({
      method: "GET",
      url: `/edis/inquire/${encodeURIComponent(isin)}`,
      safeToRetry: true
    });
  }
};

// src/resources/ForeverOrders.ts
init_cjs_shims();
var ForeverOrders = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async list() {
    return this.httpClient.request({
      method: "GET",
      url: "/forever/orders",
      safeToRetry: true
    });
  }
  async place(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/forever/orders",
      data: request2,
      safeToRetry: false
    });
  }
  async modify(orderId, request2) {
    return this.httpClient.request({
      method: "PUT",
      url: `/forever/orders/${encodeURIComponent(orderId)}`,
      data: request2,
      safeToRetry: false
    });
  }
  async cancel(orderId) {
    return this.httpClient.request({
      method: "DELETE",
      url: `/forever/orders/${encodeURIComponent(orderId)}`,
      safeToRetry: false
    });
  }
};

// src/resources/Funds.ts
init_cjs_shims();
var Funds = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async getLimit() {
    return this.httpClient.request({
      method: "GET",
      url: "/fundlimit",
      safeToRetry: true
    });
  }
  async calculateMargin(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/margincalculator",
      data: request2,
      safeToRetry: false
    });
  }
  async calculateMultiMargin(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/margincalculator/multi",
      data: request2,
      safeToRetry: false
    });
  }
};

// src/resources/Instruments.ts
init_cjs_shims();
var DEFAULT_CACHE_TTL_MS = 60 * 60 * 1e3;
var DEFAULT_SEARCH_SEGMENTS = [
  "NSE_EQ",
  "BSE_EQ",
  "IDX_I",
  "NSE_FNO",
  "NSE_CURRENCY"
];
var Instruments = class {
  constructor(httpClient, config = {}) {
    this.httpClient = httpClient;
    this.cache = /* @__PURE__ */ new Map();
    this.inFlight = /* @__PURE__ */ new Map();
    this.cacheTtlMs = config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
  }
  /** Every instrument in a segment, cached for {@link InstrumentsConfig.cacheTtlMs}. */
  async bySegment(exchangeSegment) {
    const cached = this.cache.get(exchangeSegment);
    if (cached && Date.now() - cached.fetchedAt < this.cacheTtlMs) {
      return cached.instruments;
    }
    const existing = this.inFlight.get(exchangeSegment);
    if (existing) {
      return existing;
    }
    const request2 = this.fetchSegment(exchangeSegment).then((instruments) => {
      this.cache.set(exchangeSegment, { instruments, fetchedAt: Date.now() });
      return instruments;
    }).finally(() => {
      this.inFlight.delete(exchangeSegment);
    });
    this.inFlight.set(exchangeSegment, request2);
    return request2;
  }
  /** Drops cached segments so the next lookup re-downloads. */
  clearCache(exchangeSegment) {
    if (exchangeSegment) {
      this.cache.delete(exchangeSegment);
      return;
    }
    this.cache.clear();
  }
  /**
   * First instrument in a segment matching `symbol`.
   *
   * Equities are matched on `UNDERLYING_SYMBOL` when present, indices and
   * derivatives on `SYMBOL_NAME`, which is what makes `find("IDX_I", "NIFTY")`
   * and `find("NSE_EQ", "RELIANCE")` both resolve.
   */
  async find(exchangeSegment, symbol, options = { exactMatch: true }) {
    const instruments = await this.bySegment(exchangeSegment);
    const matches = matchSymbol(instruments, symbol, options);
    return matches[0];
  }
  /** Instrument with this security id inside a segment. */
  async findBySecurityId(exchangeSegment, securityId) {
    const instruments = await this.bySegment(exchangeSegment);
    return instruments.find(
      (instrument) => instrument.securityId === String(securityId)
    );
  }
  /**
   * Search across several segments at once, returning up to `limit` matches.
   * Used by the `dhan_search_instruments` agent tool to resolve a free-text
   * symbol to a security id.
   */
  async search(query, options = {}) {
    const segments = options.segments ?? DEFAULT_SEARCH_SEGMENTS;
    const limit = options.limit ?? 25;
    const results = [];
    for (const segment of segments) {
      if (results.length >= limit) {
        break;
      }
      const instruments = await this.bySegment(segment);
      results.push(
        ...matchSymbol(instruments, query, {
          ...options,
          limit: limit - results.length
        })
      );
    }
    return results.slice(0, limit);
  }
  /** First match for `symbol` across `segments`, in the order given. */
  async findAnywhere(symbol, options = {}) {
    const results = await this.search(symbol, { ...options, limit: 1 });
    return results[0];
  }
  async fetchSegment(exchangeSegment) {
    const csv = await this.httpClient.request({
      method: "GET",
      url: `/instrument/${encodeURIComponent(exchangeSegment)}`,
      headers: { Accept: "text/csv" },
      safeToRetry: true
    });
    if (typeof csv !== "string" || csv.length === 0) {
      return [];
    }
    return parseCsv(csv).map(normalizeRow);
  }
};
function matchSymbol(instruments, symbol, options) {
  const exactMatch = options.exactMatch ?? false;
  const caseSensitive = options.caseSensitive ?? false;
  const limit = options.limit ?? Infinity;
  const needle = caseSensitive ? symbol : symbol.toUpperCase();
  const matches = [];
  for (const instrument of instruments) {
    if (matches.length >= limit) {
      break;
    }
    const raw = comparableSymbol(instrument);
    if (raw === void 0) {
      continue;
    }
    const candidate = caseSensitive ? raw : raw.toUpperCase();
    if (exactMatch ? candidate === needle : candidate.includes(needle)) {
      matches.push(instrument);
    }
  }
  return matches;
}
function comparableSymbol(instrument) {
  if (instrument.instrument === InstrumentType.EQUITY && instrument.underlyingSymbol) {
    return instrument.underlyingSymbol;
  }
  return instrument.symbolName;
}
function normalizeRow(row) {
  const exchange = row.EXCH_ID || row.EXCHANGE;
  const segment = row.SEGMENT;
  const exchangeSegment = exchange && segment ? SEGMENT_MAP[`${exchange}:${segment}`] : exchange;
  return {
    securityId: String(row.SECURITY_ID ?? ""),
    symbolName: emptyToUndefined(row.SYMBOL_NAME),
    displayName: emptyToUndefined(row.DISPLAY_NAME),
    exchange: emptyToUndefined(exchange),
    segment: emptyToUndefined(segment),
    exchangeSegment: emptyToUndefined(exchangeSegment),
    instrument: emptyToUndefined(row.INSTRUMENT),
    series: emptyToUndefined(row.SERIES),
    lotSize: toNumber(row.LOT_SIZE),
    tickSize: toNumber(row.TICK_SIZE),
    expiryDate: emptyToUndefined(row.SM_EXPIRY_DATE),
    strikePrice: toNumber(row.STRIKE_PRICE),
    optionType: emptyToUndefined(row.OPTION_TYPE),
    underlyingSymbol: emptyToUndefined(row.UNDERLYING_SYMBOL),
    isin: emptyToUndefined(row.ISIN),
    instrumentType: emptyToUndefined(row.INSTRUMENT_TYPE),
    expiryFlag: emptyToUndefined(row.EXPIRY_FLAG),
    bracketFlag: emptyToUndefined(row.BRACKET_FLAG),
    coverFlag: emptyToUndefined(row.COVER_FLAG),
    asmGsmFlag: emptyToUndefined(row.ASM_GSM_FLAG),
    asmGsmCategory: emptyToUndefined(row.ASM_GSM_CATEGORY),
    buySellIndicator: emptyToUndefined(row.BUY_SELL_INDICATOR),
    buyCoMinMarginPer: toNumber(row.BUY_CO_MIN_MARGIN_PER),
    sellCoMinMarginPer: toNumber(row.SELL_CO_MIN_MARGIN_PER),
    mtfLeverage: toNumber(row.MTF_LEVERAGE)
  };
}
function emptyToUndefined(value) {
  return value === void 0 || value === "" ? void 0 : value;
}
function toNumber(value) {
  if (value === void 0 || value === "") {
    return void 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : void 0;
}
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const header = rows.shift();
  if (!header) {
    return [];
  }
  return rows.filter((entry) => entry.length > 1 || entry[0] !== "").map((entry) => {
    const record = {};
    header.forEach((key, position) => {
      record[key.trim()] = entry[position] ?? "";
    });
    return record;
  });
}

// src/resources/IpSetup.ts
init_cjs_shims();
var IpSetup = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async get() {
    return this.httpClient.request({
      method: "GET",
      url: "/ip/getIP",
      safeToRetry: true
    });
  }
  async set(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/ip/setIP",
      data: request2,
      safeToRetry: false
    });
  }
  async modify(request2) {
    return this.httpClient.request({
      method: "PUT",
      url: "/ip/modifyIP",
      data: request2,
      safeToRetry: false
    });
  }
};

// src/resources/MarketFeed.ts
init_cjs_shims();
var MarketFeed = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /** Last traded price for up to 1000 instruments. */
  async ltp(instruments) {
    return this.httpClient.request({
      method: "POST",
      url: "/marketfeed/ltp",
      data: instruments,
      safeToRetry: true
    });
  }
  /** Open/high/low/close for up to 1000 instruments. */
  async ohlc(instruments) {
    return this.httpClient.request({
      method: "POST",
      url: "/marketfeed/ohlc",
      data: instruments,
      safeToRetry: true
    });
  }
  /** Full quote with market depth and open interest. */
  async quote(instruments) {
    return this.httpClient.request({
      method: "POST",
      url: "/marketfeed/quote",
      data: instruments,
      safeToRetry: true
    });
  }
  /**
   * Last traded price for a single instrument, or `undefined` when the feed has
   * no entry for it.
   */
  async ltpFor(exchangeSegment, securityId) {
    const response = await this.ltp({ [exchangeSegment]: [securityId] });
    return response.data?.[exchangeSegment]?.[String(securityId)]?.last_price;
  }
};

// src/resources/Orders.ts
init_cjs_shims();
var import_crypto2 = require("crypto");
var import_zod3 = require("zod");
var Orders = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async place(request2) {
    const payload = this.parsePlaceRequest(request2);
    const data = await this.httpClient.request({
      method: "POST",
      url: "/orders",
      data: payload,
      safeToRetry: false
    });
    return {
      correlationId: payload.correlationId,
      data: {
        ...data,
        correlationId: data.correlationId ?? payload.correlationId
      }
    };
  }
  async list() {
    return this.httpClient.request({
      method: "GET",
      url: "/orders",
      safeToRetry: true
    });
  }
  async getById(orderId) {
    return this.httpClient.request({
      method: "GET",
      url: `/orders/${encodeURIComponent(orderId)}`,
      safeToRetry: true
    });
  }
  async getByCorrelationId(correlationId) {
    return this.httpClient.request({
      method: "GET",
      url: `/orders/external/${encodeURIComponent(correlationId)}`,
      safeToRetry: true
    });
  }
  async getTrades(orderId) {
    return this.httpClient.request({
      method: "GET",
      url: `/trades/${encodeURIComponent(orderId)}`,
      safeToRetry: true
    });
  }
  async listTrades() {
    return this.httpClient.request({
      method: "GET",
      url: "/trades",
      safeToRetry: true
    });
  }
  async getTradeHistory(request2) {
    return this.httpClient.request({
      method: "GET",
      url: `/trades/${encodeURIComponent(request2.fromDate)}/${encodeURIComponent(
        request2.toDate
      )}/${encodeURIComponent(request2.pageNumber ?? "0")}`,
      safeToRetry: true
    });
  }
  async placeSlice(request2) {
    const payload = this.parsePlaceRequest(request2);
    return this.httpClient.request({
      method: "POST",
      url: "/orders/slicing",
      data: payload,
      safeToRetry: false
    });
  }
  async modify(request2) {
    return this.httpClient.request(
      {
        method: "PUT",
        url: `/orders/${encodeURIComponent(request2.orderId)}`,
        data: {
          orderType: request2.orderType,
          validity: request2.validity,
          quantity: request2.quantity,
          disclosedQuantity: request2.disclosedQuantity,
          price: request2.price,
          triggerPrice: request2.triggerPrice
        },
        safeToRetry: false
      }
    );
  }
  async cancel(orderId) {
    return this.httpClient.request({
      method: "DELETE",
      url: `/orders/${encodeURIComponent(orderId)}`,
      safeToRetry: false
    });
  }
  parsePlaceRequest(request2) {
    const payload = {
      ...request2,
      correlationId: request2.correlationId ?? (0, import_crypto2.randomUUID)(),
      dhanClientId: request2.dhanClientId ?? this.httpClient.getClientId()
    };
    try {
      return orderSchema.parse(payload);
    } catch (error) {
      if (error instanceof import_zod3.ZodError) {
        throw new ValidationError(error);
      }
      throw error;
    }
  }
};

// src/resources/Positions.ts
init_cjs_shims();
var Positions = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async list() {
    return this.httpClient.request({
      method: "GET",
      url: "/positions",
      safeToRetry: true
    });
  }
  async listHoldings() {
    return this.httpClient.request({
      method: "GET",
      url: "/holdings",
      safeToRetry: true
    });
  }
  async convert(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/positions/convert",
      data: request2,
      safeToRetry: false
    });
  }
  async exitAll() {
    return this.httpClient.request({
      method: "DELETE",
      url: "/positions",
      safeToRetry: false
    });
  }
};

// src/resources/Profile.ts
init_cjs_shims();
var Profile = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async get() {
    return this.httpClient.request({
      method: "GET",
      url: "/profile",
      safeToRetry: true
    });
  }
};

// src/resources/Statements.ts
init_cjs_shims();
var Statements = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async ledger(request2 = {}) {
    return this.httpClient.request({
      method: "GET",
      url: "/ledger",
      params: {
        "from-date": request2.fromDate,
        "to-date": request2.toDate
      },
      safeToRetry: true
    });
  }
};

// src/resources/SuperOrders.ts
init_cjs_shims();
var import_crypto3 = require("crypto");
var import_zod5 = require("zod");

// src/contracts/super-order.schema.ts
init_cjs_shims();
var import_zod4 = require("zod");
var superOrderSchema = import_zod4.z.object({
  dhanClientId: import_zod4.z.string().min(1).optional(),
  correlationId: import_zod4.z.string().min(1).max(128).optional(),
  transactionType: import_zod4.z.enum(["BUY", "SELL"]),
  exchangeSegment: import_zod4.z.enum([
    "NSE_EQ",
    "NSE_FNO",
    "NSE_COMM",
    "BSE_EQ",
    "BSE_FNO",
    "MCX_COMM"
  ]),
  productType: import_zod4.z.enum(["CNC", "INTRADAY", "MARGIN", "MTF"]),
  orderType: import_zod4.z.enum(["MARKET", "LIMIT"]),
  quantity: import_zod4.z.number().int().positive(),
  price: import_zod4.z.number().nonnegative().optional(),
  targetPrice: import_zod4.z.number().nonnegative().optional(),
  stopLossPrice: import_zod4.z.number().nonnegative().optional(),
  trailingJump: import_zod4.z.number().nonnegative().optional(),
  securityId: import_zod4.z.string().min(1)
}).superRefine((value, ctx) => {
  if (value.orderType === "LIMIT" && value.price === void 0) {
    ctx.addIssue({
      code: import_zod4.z.ZodIssueCode.custom,
      message: "price is required for LIMIT super orders",
      path: ["price"]
    });
  }
  if (value.targetPrice === void 0) {
    ctx.addIssue({
      code: import_zod4.z.ZodIssueCode.custom,
      message: "targetPrice is required for super orders",
      path: ["targetPrice"]
    });
  }
  if (value.stopLossPrice === void 0) {
    ctx.addIssue({
      code: import_zod4.z.ZodIssueCode.custom,
      message: "stopLossPrice is required for super orders",
      path: ["stopLossPrice"]
    });
  }
});

// src/resources/SuperOrders.ts
var SuperOrders = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async place(request2) {
    const payload = this.parsePlaceRequest(request2);
    const data = await this.httpClient.request({
      method: "POST",
      url: "/super/orders",
      data: payload,
      safeToRetry: false
    });
    return {
      correlationId: payload.correlationId,
      data: {
        ...data,
        correlationId: data.correlationId ?? payload.correlationId
      }
    };
  }
  async list() {
    return this.httpClient.request({
      method: "GET",
      url: "/super/orders",
      safeToRetry: true
    });
  }
  async modify(request2) {
    return this.httpClient.request({
      method: "PUT",
      url: `/super/orders/${encodeURIComponent(request2.orderId)}`,
      data: {
        price: request2.price,
        targetPrice: request2.targetPrice,
        stopLossPrice: request2.stopLossPrice,
        quantity: request2.quantity
      },
      safeToRetry: false
    });
  }
  async cancel(request2) {
    return this.httpClient.request({
      method: "DELETE",
      url: `/super/orders/${encodeURIComponent(request2.orderId)}/${encodeURIComponent(
        request2.orderLeg
      )}`,
      safeToRetry: false
    });
  }
  parsePlaceRequest(request2) {
    const payload = {
      ...request2,
      correlationId: request2.correlationId ?? (0, import_crypto3.randomUUID)(),
      dhanClientId: request2.dhanClientId ?? this.httpClient.getClientId()
    };
    try {
      return superOrderSchema.parse(payload);
    } catch (error) {
      if (error instanceof import_zod5.ZodError) {
        throw new ValidationError(error);
      }
      throw error;
    }
  }
};

// src/resources/TraderControls.ts
init_cjs_shims();
var TraderControls = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async getPnlExit() {
    return this.httpClient.request({
      method: "GET",
      url: "/pnlExit",
      safeToRetry: true
    });
  }
  async setPnlExit(request2) {
    return this.httpClient.request({
      method: "POST",
      url: "/pnlExit",
      data: request2,
      safeToRetry: false
    });
  }
  async stopPnlExit() {
    return this.httpClient.request({
      method: "DELETE",
      url: "/pnlExit",
      safeToRetry: false
    });
  }
  async getKillSwitchStatus() {
    return this.httpClient.request({
      method: "GET",
      url: "/killswitch",
      safeToRetry: true
    });
  }
  async setKillSwitch(killSwitchStatus) {
    return this.httpClient.request({
      method: "POST",
      url: "/killswitch",
      params: {
        killSwitchStatus
      },
      safeToRetry: false
    });
  }
};

// src/ws/index.ts
init_cjs_shims();

// src/ws/BaseWS.ts
init_cjs_shims();
var import_events = require("events");
var BaseWS = class extends import_events.EventEmitter {
  constructor(urlFactory, reconnectDelayMs, webSocketFactory) {
    super();
    this.urlFactory = urlFactory;
    this.reconnectDelayMs = reconnectDelayMs;
    this.webSocketFactory = webSocketFactory;
    this.manuallyClosed = false;
    this.reconnectAttempts = 0;
    this.isConnected = false;
  }
  async connect() {
    this.manuallyClosed = false;
    const url = await this.urlFactory();
    this.connection = this.webSocketFactory(url);
    this.bindConnection(this.connection);
  }
  disconnect() {
    this.manuallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = void 0;
    }
    this.connection?.close();
  }
  send(payload) {
    this.connection?.send(payload);
  }
  bindConnection(connection) {
    connection.on("open", () => {
      this.reconnectAttempts = 0;
      this.isConnected = true;
      void this.onOpen();
    });
    connection.on("message", (data) => {
      this.onMessage(data);
    });
    connection.on("error", (error) => {
      this.emit("error", error);
    });
    connection.on("close", () => {
      this.isConnected = false;
      this.onClose();
      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    });
  }
  scheduleReconnect() {
    const delay = Math.min(
      5e3,
      this.reconnectDelayMs * Math.max(1, this.reconnectAttempts + 1)
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      void this.connect();
    }, delay);
  }
};

// src/ws/DhanWS.ts
init_cjs_shims();

// src/ws/MarketFeedWS.ts
init_cjs_shims();
var import_ws = __toESM(require("ws"));

// src/ws/parsers/marketFeed.ts
init_cjs_shims();
function parseMarketFeedPacket(packet, subscriptions) {
  if (packet.length < 8) {
    return null;
  }
  const header = parseHeader(packet, subscriptions);
  switch (header.responseCode) {
    case 2:
      return parseTicker(packet, header);
    case 4:
      return parseQuote(packet, header);
    case 5:
      return parseOi(packet, header);
    case 6:
      return parsePrevClose(packet, header);
    case 8:
      return parseFull(packet, header);
    case 50:
      return parseDisconnect(packet, header);
    default:
      return null;
  }
}
function parseHeader(packet, subscriptions) {
  const responseCode = packet.readUInt8(0);
  const messageLength = packet.readInt16LE(1);
  const exchangeSegmentCode = packet.readUInt8(3);
  const securityId = String(packet.readInt32LE(4));
  const exchangeSegment = resolveExchangeSegment(
    securityId,
    exchangeSegmentCode,
    subscriptions
  );
  return {
    responseCode,
    messageLength,
    exchangeSegmentCode,
    exchangeSegment,
    securityId
  };
}
function parseTicker(packet, header) {
  if (packet.length < 16) {
    return null;
  }
  return {
    ...header,
    type: "ticker",
    ltp: packet.readFloatLE(8),
    ltt: packet.readInt32LE(12),
    raw: packet
  };
}
function parsePrevClose(packet, header) {
  if (packet.length < 16) {
    return null;
  }
  return {
    ...header,
    type: "prev-close",
    previousClose: packet.readFloatLE(8),
    previousOpenInterest: packet.readInt32LE(12),
    raw: packet
  };
}
function parseQuote(packet, header) {
  if (packet.length < 50) {
    return null;
  }
  return {
    ...header,
    type: "quote",
    ltp: packet.readFloatLE(8),
    ltq: packet.readInt16LE(12),
    ltt: packet.readInt32LE(14),
    atp: packet.readFloatLE(18),
    volume: packet.readInt32LE(22),
    totalSellQuantity: packet.readInt32LE(26),
    totalBuyQuantity: packet.readInt32LE(30),
    dayOpen: packet.readFloatLE(34),
    dayClose: packet.readFloatLE(38),
    dayHigh: packet.readFloatLE(42),
    dayLow: packet.readFloatLE(46),
    raw: packet
  };
}
function parseOi(packet, header) {
  if (packet.length < 12) {
    return null;
  }
  return {
    ...header,
    type: "oi",
    openInterest: packet.readInt32LE(8),
    raw: packet
  };
}
function parseFull(packet, header) {
  if (packet.length < 162) {
    return null;
  }
  return {
    ...header,
    type: "full",
    ltp: packet.readFloatLE(8),
    ltq: packet.readInt16LE(12),
    ltt: packet.readInt32LE(14),
    atp: packet.readFloatLE(18),
    volume: packet.readInt32LE(22),
    totalSellQuantity: packet.readInt32LE(26),
    totalBuyQuantity: packet.readInt32LE(30),
    openInterest: packet.readInt32LE(34),
    highestOpenInterest: packet.readInt32LE(38),
    lowestOpenInterest: packet.readInt32LE(42),
    dayOpen: packet.readFloatLE(46),
    dayClose: packet.readFloatLE(50),
    dayHigh: packet.readFloatLE(54),
    dayLow: packet.readFloatLE(58),
    depth: parseDepth(packet, 62),
    raw: packet
  };
}
function parseDisconnect(packet, header) {
  if (packet.length < 10) {
    return null;
  }
  return {
    ...header,
    type: "disconnect",
    reasonCode: packet.readInt16LE(8),
    raw: packet
  };
}
function parseDepth(packet, offset) {
  const levels = [];
  for (let index = 0; index < 5; index += 1) {
    const start = offset + index * 20;
    levels.push({
      bidQuantity: packet.readInt32LE(start),
      askQuantity: packet.readInt32LE(start + 4),
      bidOrders: packet.readInt16LE(start + 8),
      askOrders: packet.readInt16LE(start + 10),
      bidPrice: packet.readFloatLE(start + 12),
      askPrice: packet.readFloatLE(start + 16)
    });
  }
  return levels;
}
function resolveExchangeSegment(securityId, exchangeSegmentCode, subscriptions) {
  const matches = subscriptions.filter(
    (subscription) => subscription.securityId === securityId
  );
  if (matches.length === 1) {
    return matches[0].exchangeSegment;
  }
  return `SEGMENT_${exchangeSegmentCode}`;
}

// src/ws/parsers/packetSplitter.ts
init_cjs_shims();
function splitPackets(buffer) {
  const packets = [];
  let offset = 0;
  while (offset + 3 <= buffer.length) {
    const messageLength = buffer.readInt16LE(offset + 1);
    if (messageLength <= 0 || offset + messageLength > buffer.length) {
      break;
    }
    packets.push(buffer.subarray(offset, offset + messageLength));
    offset += messageLength;
  }
  return packets;
}

// src/ws/MarketFeedWS.ts
var REQUEST_CODE_BY_MODE = {
  ticker: 15,
  quote: 17,
  full: 21
};
var MarketFeedWS = class extends BaseWS {
  constructor(options, ltpStore) {
    const authResolver = new AuthResolver({
      token: options.token,
      tokenProvider: options.tokenProvider,
      clientId: options.clientId
    });
    super(
      async () => options.url ?? buildMarketFeedUrl(
        await authResolver.resolveAccessToken(),
        options.clientId
      ),
      options.reconnectDelayMs ?? 1e3,
      options.webSocketFactory ?? defaultFactory
    );
    this.subscriptions = /* @__PURE__ */ new Map();
    this.ltpStore = ltpStore;
    this.mode = options.mode ?? "full";
  }
  subscribe(instruments) {
    for (const instrument of instruments) {
      this.subscriptions.set(this.subscriptionKey(instrument), {
        ...instrument,
        mode: this.mode
      });
    }
    if (this.isConnected) {
      this.sendSubscription(instruments);
    }
  }
  unsubscribe(instruments) {
    for (const instrument of instruments) {
      this.subscriptions.delete(this.subscriptionKey(instrument));
      this.ltpStore.delete(this.subscriptionKey(instrument));
    }
  }
  getSubscriptions() {
    return Array.from(this.subscriptions.values());
  }
  onOpen() {
    this.emit("open");
    const subscriptions = this.getSubscriptions();
    if (subscriptions.length > 0) {
      this.sendSubscription(subscriptions);
    }
  }
  onMessage(data) {
    const buffer = toBuffer(data);
    if (!buffer) {
      return;
    }
    const packets = splitPackets(buffer);
    for (const packet of packets) {
      const parsed = parseMarketFeedPacket(packet, this.getSubscriptions());
      if (!parsed) {
        continue;
      }
      if ("ltp" in parsed && typeof parsed.ltp === "number") {
        this.ltpStore.set(
          this.subscriptionKey({
            securityId: parsed.securityId,
            exchangeSegment: parsed.exchangeSegment
          }),
          parsed.ltp
        );
      }
      if (parsed.type === "disconnect") {
        this.emit("disconnect", parsed);
      }
      this.emit("tick", parsed);
    }
  }
  onClose() {
    this.emit("close");
  }
  sendSubscription(instruments) {
    const batchSize = 100;
    for (let index = 0; index < instruments.length; index += batchSize) {
      const batch = instruments.slice(index, index + batchSize);
      this.send(
        JSON.stringify({
          RequestCode: REQUEST_CODE_BY_MODE[this.mode],
          InstrumentCount: batch.length,
          InstrumentList: batch.map((instrument) => ({
            ExchangeSegment: instrument.exchangeSegment,
            SecurityId: instrument.securityId
          }))
        })
      );
    }
  }
  subscriptionKey(instrument) {
    return `${instrument.exchangeSegment}:${instrument.securityId}`;
  }
};
function buildMarketFeedUrl(token, clientId) {
  return `wss://api-feed.dhan.co?version=2&token=${encodeURIComponent(
    token
  )}&clientId=${encodeURIComponent(clientId)}&authType=2`;
}
function defaultFactory(url) {
  return new import_ws.default(url);
}
function toBuffer(data) {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (typeof data === "string") {
    return Buffer.from(data);
  }
  if (Array.isArray(data) && data.every((item) => Buffer.isBuffer(item))) {
    return Buffer.concat(data);
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }
  return null;
}

// src/ws/OrderUpdateWS.ts
init_cjs_shims();
var import_ws2 = __toESM(require("ws"));
var OrderUpdateWS = class extends BaseWS {
  constructor(options, orderStore) {
    const authResolver = new AuthResolver({
      token: options.token,
      tokenProvider: options.tokenProvider,
      clientId: options.clientId
    });
    super(
      () => options.url ?? "wss://api-order-update.dhan.co",
      options.reconnectDelayMs ?? 1e3,
      options.webSocketFactory ?? defaultFactory2
    );
    this.authResolver = authResolver;
    this.clientId = options.clientId;
    this.orderStore = orderStore;
    this.userType = options.userType ?? "SELF";
    this.partnerId = options.partnerId;
    this.partnerSecret = options.partnerSecret;
  }
  async onOpen() {
    if (this.userType === "PARTNER") {
      this.send(
        JSON.stringify({
          LoginReq: {
            MsgCode: 42,
            ClientId: this.partnerId
          },
          UserType: "PARTNER",
          Secret: this.partnerSecret
        })
      );
      this.emit("open");
      return;
    }
    const token = await this.authResolver.resolveAccessToken();
    this.send(
      JSON.stringify({
        LoginReq: {
          MsgCode: 42,
          ClientId: this.clientId,
          Token: token
        },
        UserType: "SELF"
      })
    );
    this.emit("open");
  }
  onMessage(data) {
    const raw = toText(data);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed.Type === "order_alert" && parsed.Data) {
      const state = toOrderState(parsed.Data);
      this.orderStore.upsert(state);
      this.emit("order", state);
    }
  }
  onClose() {
    this.emit("close");
  }
};
function defaultFactory2(url) {
  return new import_ws2.default(url);
}
function toText(data) {
  if (typeof data === "string") {
    return data;
  }
  if (Buffer.isBuffer(data)) {
    return data.toString("utf8");
  }
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString(
      "utf8"
    );
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString("utf8");
  }
  return null;
}
function toOrderState(data) {
  return {
    orderId: typeof data.OrderNo === "string" ? data.OrderNo : void 0,
    correlationId: typeof data.CorrelationId === "string" && data.CorrelationId.length > 0 ? data.CorrelationId : void 0,
    status: typeof data.Status === "string" ? data.Status : void 0,
    tradedQty: typeof data.TradedQty === "number" ? data.TradedQty : void 0,
    averageTradedPrice: typeof data.AvgTradedPrice === "number" ? data.AvgTradedPrice : void 0,
    securityId: typeof data.SecurityId === "string" ? data.SecurityId : void 0,
    raw: data
  };
}

// src/ws/store/LTPStore.ts
init_cjs_shims();
var LTPStore = class {
  constructor() {
    this.values = /* @__PURE__ */ new Map();
  }
  get(key) {
    return this.values.get(key);
  }
  set(key, value) {
    this.values.set(key, value);
  }
  delete(key) {
    this.values.delete(key);
  }
  clear() {
    this.values.clear();
  }
};

// src/ws/store/OrderStore.ts
init_cjs_shims();
var OrderStore = class {
  constructor() {
    this.byOrderId = /* @__PURE__ */ new Map();
    this.byCorrelationId = /* @__PURE__ */ new Map();
  }
  upsert(state) {
    if (state.orderId) {
      this.byOrderId.set(state.orderId, state);
    }
    if (state.correlationId) {
      this.byCorrelationId.set(state.correlationId, state);
    }
  }
  getByOrderId(orderId) {
    return this.byOrderId.get(orderId);
  }
  getByCorrelationId(correlationId) {
    return this.byCorrelationId.get(correlationId);
  }
  clear() {
    this.byOrderId.clear();
    this.byCorrelationId.clear();
  }
};

// src/ws/DhanWS.ts
var DhanWS = class {
  constructor(options) {
    this.ltpStore = new LTPStore();
    this.orderStore = new OrderStore();
    this.market = new MarketFeedWS(
      {
        token: options.token,
        tokenProvider: options.tokenProvider,
        clientId: options.clientId,
        url: options.marketFeedUrl,
        reconnectDelayMs: options.reconnectDelayMs,
        webSocketFactory: options.marketSocketFactory
      },
      this.ltpStore
    );
    this.orders = new OrderUpdateWS(
      {
        token: options.token,
        tokenProvider: options.tokenProvider,
        clientId: options.clientId,
        url: options.orderUpdateUrl,
        reconnectDelayMs: options.reconnectDelayMs,
        webSocketFactory: options.orderSocketFactory,
        userType: options.orderUserType,
        partnerId: options.partnerId,
        partnerSecret: options.partnerSecret
      },
      this.orderStore
    );
  }
  async connect() {
    await Promise.all([this.market.connect(), this.orders.connect()]);
  }
  disconnect() {
    this.market.disconnect();
    this.orders.disconnect();
  }
  subscribe(instruments) {
    this.market.subscribe(instruments);
  }
};

// src/client/DhanClient.ts
var DhanClient = class _DhanClient {
  constructor(config, dependencies = {}) {
    this.config = config;
    const httpClient = new HttpClient(config, dependencies);
    this.generated = new GeneratedClient(config);
    this.orders = new Orders(httpClient);
    this.superOrders = new SuperOrders(httpClient);
    this.positions = new Positions(httpClient);
    this.alerts = new Alerts(httpClient);
    this.foreverOrders = new ForeverOrders(httpClient);
    this.funds = new Funds(httpClient);
    this.charts = new Charts(httpClient);
    this.edis = new Edis(httpClient);
    this.statements = new Statements(httpClient);
    this.traderControls = new TraderControls(httpClient);
    this.ipSetup = new IpSetup(httpClient);
    this.profile = new Profile(httpClient);
    this.marketFeed = new MarketFeed(httpClient);
    this.optionChain = new OptionChain(httpClient);
    this.instruments = new Instruments(httpClient, {
      cacheTtlMs: config.instrumentCacheTtlMs
    });
    this.ws = new DhanWS({
      token: config.token,
      tokenProvider: config.tokenProvider,
      clientId: config.clientId,
      marketFeedUrl: config.marketFeedUrl ?? config.wsUrl,
      orderUpdateUrl: config.orderUpdateUrl,
      reconnectDelayMs: config.wsReconnectDelayMs,
      orderUserType: config.wsOrderUserType,
      partnerId: config.partnerId,
      partnerSecret: config.partnerSecret
    });
    this.auth = {
      generateAccessToken: DhanAuth.generateAccessToken,
      generateTotp: DhanAuth.generateTotp,
      renewWebToken: DhanAuth.renewWebToken,
      enableAutoTokenManagement: (options) => {
        this.tokenManager = new TokenManager(this.config, options);
        this.config.tokenProvider = () => {
          if (!this.tokenManager) {
            throw new Error("Token manager is not initialized");
          }
          return this.tokenManager.ensureValidToken();
        };
        return this.tokenManager;
      }
    };
  }
  getConfig() {
    return this.config;
  }
  static async fromTokenEndpoint(options) {
    const client = options.axiosInstance ?? import_axios4.default.create({
      baseURL: options.endpointBaseUrl,
      timeout: 5e3
    });
    const response = await client.get("/auth/dhan/token", {
      headers: {
        Authorization: `Bearer ${options.bearerToken}`,
        Accept: "application/json"
      }
    });
    return new _DhanClient({
      token: response.data.access_token,
      clientId: response.data.client_id ?? "",
      baseURL: response.data.base_url
    });
  }
};

// src/mcp/Server.ts
init_cjs_shims();
var import_readline = require("readline");

// src/ai/promptHelpers.ts
init_cjs_shims();
function systemPrompt(capabilities = []) {
  const extra = capabilities.length === 0 ? "" : `
Additional capabilities:
${capabilities.map((entry) => `- ${entry}`).join("\n")}
`;
  return `You are an AI trading assistant for Indian stock markets (NSE, BSE, MCX).

Your capabilities:
- Fetch market data (LTP, OHLC, quotes, option chains)
- Place, modify, and cancel orders
- View portfolio holdings, positions, and orders
- Calculate option Greeks and implied volatility
- Analyze option chains, max pain and put-call ratios
- Compute multi-timeframe technical indicators
- Apply risk management rules
${extra}
Rules:
- Always confirm before placing live orders
- Use correlationId for all agent-originated orders
- Never expose access tokens or secrets
- Prefer read-only operations unless explicitly asked to trade
- Validate instruments with a search before trading them`;
}
function portfolioSummary(input) {
  const holdings = input.holdings ?? [];
  const positions = input.positions ?? [];
  const open = positions.filter((position) => Number(position.netQty ?? 0) !== 0);
  const lines = ["=== Portfolio Summary ==="];
  if (input.funds) {
    lines.push(`Funds: ${describeFunds(input.funds)}`);
  }
  lines.push("", `Holdings (${holdings.length}):`);
  for (const holding of holdings) {
    lines.push(`  ${describeHolding(holding)}`);
  }
  lines.push("", `Open Positions (${open.length}):`);
  for (const position of open) {
    lines.push(`  ${describePosition(position)}`);
  }
  return lines.join("\n");
}
function riskReport(input) {
  const positions = input.positions ?? [];
  const unrealized = positions.reduce(
    (total, position) => total + Number(position.unrealizedProfit ?? 0),
    0
  );
  const realized = positions.reduce(
    (total, position) => total + Number(position.realizedProfit ?? 0),
    0
  );
  const open = positions.filter(
    (position) => Number(position.netQty ?? 0) !== 0
  ).length;
  const lines = [
    "=== Risk Report ===",
    `Total Unrealized P&L: \u20B9${unrealized.toFixed(2)}`,
    `Total Realized P&L: \u20B9${realized.toFixed(2)}`,
    `Open Positions: ${open}`
  ];
  if (input.maxDrawdownPct !== void 0) {
    lines.push(`Max Drawdown: ${input.maxDrawdownPct}%`);
  }
  if (input.dailyLossLimit !== void 0) {
    lines.push(`Daily Loss Limit: \u20B9${input.dailyLossLimit}`);
  }
  return lines.join("\n");
}
function marketAnalysis(summary) {
  const { bias, setup, confidence, rationale, trendStrength } = summary.summary;
  return [
    "=== Market Analysis ===",
    `Bias: ${bias} (confidence ${confidence})`,
    `Suggested setup: ${setup}`,
    `Trend strength: ${trendStrength}`,
    `RSI: ${rationale.rsi}`,
    `MACD: ${rationale.macd}`,
    `ADX: ${rationale.adx}`,
    `ATR: ${rationale.atr}`
  ].join("\n");
}
function describeFunds(funds) {
  const available = funds.availabelBalance ?? funds.availableBalance ?? 0;
  return `available \u20B9${Number(available).toFixed(2)}, utilized \u20B9${Number(funds.utilizedAmount ?? 0).toFixed(2)}, withdrawable \u20B9${Number(funds.withdrawableBalance ?? 0).toFixed(2)}`;
}
function describeHolding(holding) {
  const symbol = holding.tradingSymbol ?? holding.securityId ?? "unknown";
  return `${symbol}: ${holding.totalQty ?? 0} @ \u20B9${Number(holding.avgCostPrice ?? 0).toFixed(2)}`;
}
function describePosition(position) {
  const symbol = position.tradingSymbol ?? position.securityId ?? "unknown";
  const cost = position.buyAvg ?? position.costPrice ?? 0;
  return `${symbol} (${position.productType ?? "\u2014"}): ${position.netQty ?? 0} @ \u20B9${Number(cost).toFixed(2)}, unrealized \u20B9${Number(position.unrealizedProfit ?? 0).toFixed(2)}`;
}

// src/mcp/Server.ts
var SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2024-11-05"];
var DEFAULT_TOOL_CALL_TIMEOUT_MS = 15e3;
var ErrorCode = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603
};
var InvalidParamsError = class extends Error {
};
var UnknownMethodError = class extends Error {
};
var RESOURCES = [
  {
    uri: "dhanhq://account/profile",
    name: "Dhan Profile",
    description: "Account profile including client id, token validity and active segments",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://account/funds",
    name: "Fund Limits",
    description: "Available balance, utilized margin and withdrawal capacity",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://account/holdings",
    name: "Portfolio Holdings",
    description: "Equity holdings with quantity, average price and P&L",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://account/positions",
    name: "Open Positions",
    description: "F&O and equity positions with net quantity and unrealized P&L",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://account/orders",
    name: "Recent Orders",
    description: "Order history with status, quantity and fill details",
    mimeType: "application/json"
  },
  {
    uri: "dhanhq://market/capabilities",
    name: "Agent Capabilities",
    description: "Available tools, scopes, risk levels and the write gate state",
    mimeType: "application/json"
  }
];
var PROMPTS = [
  {
    name: "system_prompt",
    description: "Base system prompt for a DhanHQ trading assistant",
    arguments: []
  },
  {
    name: "portfolio_summary",
    description: "Human-readable summary of current holdings, positions and funds",
    arguments: []
  },
  {
    name: "market_analysis",
    description: "Multi-timeframe technical bias for a symbol, with supporting rationale",
    arguments: [
      {
        name: "symbol",
        description: "Ticker symbol, e.g. NIFTY or RELIANCE",
        required: false
      }
    ]
  },
  {
    name: "risk_report",
    description: "Current risk exposure: open positions, P&L and limits",
    arguments: []
  },
  {
    name: "order_preview",
    description: "Preview an order with contract and risk validation",
    arguments: [
      { name: "transactionType", description: "BUY or SELL", required: true },
      { name: "securityId", description: "Dhan security id", required: true },
      { name: "quantity", description: "Number of shares or lots", required: true },
      {
        name: "exchangeSegment",
        description: "NSE_EQ, NSE_FNO, etc.",
        required: true
      },
      {
        name: "productType",
        description: "CNC, INTRADAY, MARGIN, MTF, BO or CO",
        required: true
      },
      { name: "orderType", description: "MARKET or LIMIT", required: true },
      { name: "price", description: "Limit price", required: false }
    ]
  }
];
var McpServer = class {
  constructor(options) {
    this.client = options.client;
    this.registry = options.registry ?? new AgentToolRegistry({ client: options.client });
    this.input = options.input ?? process.stdin;
    this.output = options.output ?? process.stdout;
    this.toolCallTimeoutMs = options.toolCallTimeoutMs ?? DEFAULT_TOOL_CALL_TIMEOUT_MS;
    this.serverName = options.serverName ?? "dhanhq-ts";
    this.serverVersion = options.serverVersion ?? "0.2.0";
  }
  /** Reads newline-delimited JSON-RPC from stdin until the stream closes. */
  async run() {
    this.reader = (0, import_readline.createInterface)({ input: this.input, crlfDelay: Infinity });
    for await (const line of this.reader) {
      if (line.trim().length > 0) {
        await this.handleLine(line);
      }
    }
  }
  close() {
    this.reader?.close();
  }
  /** Handles one JSON-RPC line. Exposed for testing. */
  async handleLine(line) {
    let request2;
    try {
      request2 = JSON.parse(line);
    } catch (error) {
      this.respondError(null, ErrorCode.PARSE_ERROR, `Parse error: ${message(error)}`);
      return;
    }
    if (request2.id === void 0) {
      return;
    }
    try {
      this.respondResult(
        request2.id,
        await this.dispatch(request2.method ?? "", request2.params ?? {})
      );
    } catch (error) {
      this.respondError(request2.id, errorCodeFor(error), message(error));
    }
  }
  async dispatch(method, params) {
    switch (method) {
      case "initialize":
        return {
          protocolVersion: this.negotiateVersion(params.protocolVersion),
          serverInfo: { name: this.serverName, version: this.serverVersion },
          capabilities: { tools: {}, resources: {}, prompts: {} }
        };
      case "ping":
        return {};
      case "tools/list":
        return {
          tools: this.registry.list().map((entry) => ({
            name: entry.name,
            description: `[${entry.risk}] ${entry.description}`,
            inputSchema: entry.inputSchema
          }))
        };
      case "tools/call":
        return this.callTool(params);
      case "resources/list":
        return { resources: RESOURCES };
      case "resources/read":
        return { contents: [await this.readResource(String(params.uri))] };
      case "prompts/list":
        return { prompts: PROMPTS };
      case "prompts/get":
        return this.getPrompt(
          String(params.name),
          params.arguments ?? {}
        );
      default:
        throw new UnknownMethodError(`Unsupported MCP method: ${method}`);
    }
  }
  async callTool(params) {
    const name = params.name;
    if (typeof name !== "string") {
      throw new InvalidParamsError("tools/call requires a tool name");
    }
    const args = params.arguments ?? {};
    try {
      const result = await withTimeout(
        this.registry.execute(name, args),
        this.toolCallTimeoutMs,
        `Tool call '${name}' timed out after ${this.toolCallTimeoutMs}ms (likely blocked on rate-limit backoff) \u2014 retry shortly`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: message(error) }]
      };
    }
  }
  async readResource(uri) {
    const data = await this.resourceData(uri);
    return {
      uri,
      mimeType: "application/json",
      text: JSON.stringify(data, null, 2)
    };
  }
  async resourceData(uri) {
    switch (uri) {
      case "dhanhq://account/profile":
        return this.client.profile.get();
      case "dhanhq://account/funds":
        return this.client.funds.getLimit();
      case "dhanhq://account/holdings":
        return this.client.positions.listHoldings();
      case "dhanhq://account/positions":
        return this.client.positions.list();
      case "dhanhq://account/orders":
        return this.client.orders.list();
      case "dhanhq://market/capabilities":
        return this.registry.capabilities();
      default:
        throw new InvalidParamsError(`Unknown resource: ${uri}`);
    }
  }
  async getPrompt(name, args) {
    const text = await this.promptText(name, args);
    return {
      messages: [{ role: "user", content: { type: "text", text } }]
    };
  }
  async promptText(name, args) {
    switch (name) {
      case "system_prompt":
        return systemPrompt(this.registry.availableTools().map((t) => t.name));
      case "portfolio_summary": {
        const [holdings, positions, funds] = await Promise.all([
          this.client.positions.listHoldings(),
          this.client.positions.list(),
          this.client.funds.getLimit()
        ]);
        return portfolioSummary({ holdings, positions, funds });
      }
      case "risk_report":
        return riskReport({ positions: await this.client.positions.list() });
      case "market_analysis":
        return this.marketAnalysisPrompt(String(args.symbol ?? "NIFTY"));
      case "order_preview": {
        const preview = await previewOrder(args);
        return preview.valid ? `Order preview: ${preview.summary}` : `Validation errors: ${preview.errors.join(", ")}`;
      }
      default:
        throw new InvalidParamsError(`Unknown prompt: ${name}`);
    }
  }
  async marketAnalysisPrompt(symbol) {
    const instrument = await this.client.instruments.find("IDX_I", symbol, {
      exactMatch: true
    }) ?? await this.client.instruments.find("NSE_EQ", symbol, {
      exactMatch: true
    });
    if (!instrument) {
      return `Could not resolve symbol ${symbol} to a security id for market data.`;
    }
    const analysis = new TechnicalAnalysis(this.client.charts);
    const result = await analysis.compute({
      securityId: instrument.securityId,
      exchangeSegment: instrument.exchangeSegment ?? "NSE_EQ",
      instrument: instrument.instrument ?? "EQUITY",
      intervals: [15, 60]
    });
    return `${symbol}
${marketAnalysis(analyzeMultiTimeframe(result))}`;
  }
  negotiateVersion(requested) {
    return typeof requested === "string" && SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : SUPPORTED_PROTOCOL_VERSIONS[0];
  }
  respondResult(id, result) {
    this.write({ jsonrpc: "2.0", id, result });
  }
  respondError(id, code, text) {
    this.write({ jsonrpc: "2.0", id, error: { code, message: text } });
  }
  write(payload) {
    this.output.write(`${JSON.stringify(payload)}
`);
  }
};
function errorCodeFor(error) {
  if (error instanceof UnknownMethodError) return ErrorCode.METHOD_NOT_FOUND;
  if (error instanceof InvalidParamsError) return ErrorCode.INVALID_PARAMS;
  return ErrorCode.INTERNAL_ERROR;
}
function message(error) {
  return error instanceof Error ? error.message : String(error);
}
function withTimeout(promise, ms, timeoutMessage) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    promise.then((value) => {
      clearTimeout(timer);
      resolve(value);
    }).catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

// src/bin/dhanhq-mcp.ts
async function main() {
  const clientId = process.env.DHAN_CLIENT_ID;
  const token = process.env.DHAN_ACCESS_TOKEN;
  if (!clientId || !token) {
    process.stderr.write(
      "dhanhq-mcp: DHAN_CLIENT_ID and DHAN_ACCESS_TOKEN must be set\n"
    );
    process.exit(1);
    return;
  }
  const client = new DhanClient({
    clientId,
    token,
    baseURL: process.env.DHAN_BASE_URL
  });
  const server = new McpServer({
    client,
    registry: new AgentToolRegistry({ client, policy: Policy.fromEnv() })
  });
  await server.run();
}
main().catch((error) => {
  process.stderr.write(
    `dhanhq-mcp: ${error instanceof Error ? error.stack ?? error.message : String(error)}
`
  );
  process.exit(1);
});
/*! Bundled license information:

mime-db/index.js:
  (*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

mime-types/index.js:
  (*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
//# sourceMappingURL=dhanhq-mcp.cjs.map