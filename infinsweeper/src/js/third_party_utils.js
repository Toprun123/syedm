/**
 *  @name SipHash
 *  @IMPORTANT - Siphash implementation taken from https://github.com/jedisct1/siphash-js (minified browser version)
 *  @author Frank Denis
 *  @access package
 *  @exports SipHash
 */
export const SipHash = (function () {
  "use strict";
  function r(r, n) {
    var t = r.l + n.l,
      h = { h: (r.h + n.h + ((t / 2) >>> 31)) >>> 0, l: t >>> 0 };
    (r.h = h.h), (r.l = h.l);
  }
  function n(r, n) {
    (r.h ^= n.h), (r.h >>>= 0), (r.l ^= n.l), (r.l >>>= 0);
  }
  function t(r, n) {
    var t = {
      h: (r.h << n) | (r.l >>> (32 - n)),
      l: (r.l << n) | (r.h >>> (32 - n)),
    };
    (r.h = t.h), (r.l = t.l);
  }
  function h(r) {
    var n = r.l;
    (r.l = r.h), (r.h = n);
  }
  function e(e, l, o, u) {
    r(e, l),
      r(o, u),
      t(l, 13),
      t(u, 16),
      n(l, e),
      n(u, o),
      h(e),
      r(o, l),
      r(e, u),
      t(l, 17),
      t(u, 21),
      n(l, o),
      n(u, e),
      h(o);
  }
  function l(r, n) {
    return (r[n + 3] << 24) | (r[n + 2] << 16) | (r[n + 1] << 8) | r[n];
  }
  function o(r, t) {
    "string" == typeof t && (t = u(t));
    var h = { h: r[1] >>> 0, l: r[0] >>> 0 },
      o = { h: r[3] >>> 0, l: r[2] >>> 0 },
      i = { h: h.h, l: h.l },
      a = h,
      f = { h: o.h, l: o.l },
      c = o,
      s = t.length,
      v = s - 7,
      g = new Uint8Array(new ArrayBuffer(8));
    n(i, { h: 1936682341, l: 1886610805 }),
      n(f, { h: 1685025377, l: 1852075885 }),
      n(a, { h: 1819895653, l: 1852142177 }),
      n(c, { h: 1952801890, l: 2037671283 });
    for (var y = 0; y < v; ) {
      var d = { h: l(t, y + 4), l: l(t, y) };
      n(c, d), e(i, f, a, c), e(i, f, a, c), n(i, d), (y += 8);
    }
    g[7] = s;
    for (var p = 0; y < s; ) g[p++] = t[y++];
    for (; p < 7; ) g[p++] = 0;
    var w = {
      h: (g[7] << 24) | (g[6] << 16) | (g[5] << 8) | g[4],
      l: (g[3] << 24) | (g[2] << 16) | (g[1] << 8) | g[0],
    };
    n(c, w),
      e(i, f, a, c),
      e(i, f, a, c),
      n(i, w),
      n(a, { h: 0, l: 255 }),
      e(i, f, a, c),
      e(i, f, a, c),
      e(i, f, a, c),
      e(i, f, a, c);
    var _ = i;
    return n(_, f), n(_, a), n(_, c), _;
  }
  function u(r) {
    if ("function" == typeof TextEncoder) return new TextEncoder().encode(r);
    r = unescape(encodeURIComponent(r));
    for (var n = new Uint8Array(r.length), t = 0, h = r.length; t < h; t++)
      n[t] = r.charCodeAt(t);
    return n;
  }
  return {
    hash: o,
    hash_hex: function (r, n) {
      var t = o(r, n);
      return (
        ("0000000" + t.h.toString(16)).substr(-8) +
        ("0000000" + t.l.toString(16)).substr(-8)
      );
    },
    hash_uint: function (r, n) {
      var t = o(r, n);
      return 4294967296 * (2097151 & t.h) + t.l;
    },
    string16_to_key: function (r) {
      var n = u(r);
      if (16 !== n.length) throw Error("Key length must be 16 bytes");
      var t = new Uint32Array(4);
      return (
        (t[0] = l(n, 0)),
        (t[1] = l(n, 4)),
        (t[2] = l(n, 8)),
        (t[3] = l(n, 12)),
        t
      );
    },
    string_to_u8: u,
  };
})();

/**
 * @name LZW
 * @access package
 * @exports LZW
 */
export const LZW = {
  compress: (uncompressed) => {
    const dict = {};
    const data = (uncompressed + "").split("");
    const out = [];
    let dictSize = 256;
    for (let i = 0; i < 256; i++) {
      dict[String.fromCharCode(i)] = i;
    }
    let w = "";
    for (let i = 0; i < data.length; i++) {
      const c = data[i];
      const wc = w + c;
      if (dict.hasOwnProperty(wc)) {
        w = wc;
      } else {
        out.push(dict[w]);
        dict[wc] = dictSize++;
        w = c;
      }
    }
    if (w !== "") out.push(dict[w]);
    return out;
  },
  uncompress: (compressed) => {
    const dict = [];
    let dictSize = 256;
    for (let i = 0; i < 256; i++) {
      dict[i] = String.fromCharCode(i);
    }
    let w = String.fromCharCode(compressed[0]);
    let result = w;
    for (let i = 1; i < compressed.length; i++) {
      const k = compressed[i];
      let entry;
      if (dict[k]) {
        entry = dict[k];
      } else if (k === dictSize) {
        entry = w + w[0];
      } else {
        throw new Error("Bad compressed k: " + k);
      }
      result += entry;
      dict[dictSize++] = w + entry[0];
      w = entry;
    }
    return result;
  },
};
