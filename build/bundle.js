
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('load-bmfont'), require('word-wrapper'), require('quad-indices'), require('three')) :
  typeof define === 'function' && define.amd ? define(['load-bmfont', 'word-wrapper', 'quad-indices', 'three'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bundle = factory(global.loadFont, global.wordWrap, global.createIndices, global.three));
})(this, (function (loadFont, wordWrap, createIndices, three) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var loadFont__default = /*#__PURE__*/_interopDefaultLegacy(loadFont);
  var wordWrap__default = /*#__PURE__*/_interopDefaultLegacy(wordWrap);
  var createIndices__default = /*#__PURE__*/_interopDefaultLegacy(createIndices);

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z'];
  var M_WIDTHS = ['m', 'w'];
  var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  var TAB_ID = '\t'.charCodeAt(0);
  var SPACE_ID = ' '.charCodeAt(0);
  var ALIGN_LEFT = 0;
  var ALIGN_CENTER = 1;
  var ALIGN_RIGHT = 2;

  var TextLayout = /*#__PURE__*/function () {
    function TextLayout() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, TextLayout);

      this.glyphs = [];
      this._measure = this.computeMetrics.bind(this);
      this.update(options);
    }
    /**
     * Getters
     */


    _createClass(TextLayout, [{
      key: "width",
      get: function get() {
        return this._width;
      }
    }, {
      key: "height",
      get: function get() {
        return this._height;
      }
    }, {
      key: "descender",
      get: function get() {
        return this._descender;
      }
    }, {
      key: "ascender",
      get: function get() {
        return this._ascender;
      }
    }, {
      key: "xHeight",
      get: function get() {
        return this._xHeight;
      }
    }, {
      key: "baseline",
      get: function get() {
        return this._baseline;
      }
    }, {
      key: "capHeight",
      get: function get() {
        return this._capHeight;
      }
    }, {
      key: "lineHeight",
      get: function get() {
        return this._lineHeight;
      }
    }, {
      key: "linesTotal",
      get: function get() {
        return this._linesTotal;
      }
    }, {
      key: "lettersTotal",
      get: function get() {
        return this._lettersTotal;
      }
    }, {
      key: "update",
      value: function update(options) {
        var _this = this;

        options = Object.assign({
          measure: this._measure
        }, options);
        this._options = options;
        this._options.tabSize = number(this._options.tabSize, 4);

        if (!options.font) {
          throw new Error('must provide a valid bitmap font');
        }

        var glyphs = this.glyphs;
        var text = options.text || '';
        var font = options.font;

        this._setupSpaceGlyphs(font);

        var lines = wordWrap__default["default"].lines(text, options);
        var minWidth = options.width || 0; // clear glyphs

        glyphs.length = 0; // get max line width

        var maxLineWidth = lines.reduce(function (prev, line) {
          return Math.max(prev, line.width, minWidth);
        }, 0); // the pen position

        var x = 0;
        var y = 0;
        var lineHeight = number(options.lineHeight, font.common.lineHeight);
        var baseline = font.common.base;
        var descender = lineHeight - baseline;
        var letterSpacing = options.letterSpacing || 0;
        var height = lineHeight * lines.length - descender;
        var align = getAlignType(this._options.align); // draw text along baseline

        y -= height; // the metrics for this text layout

        this._width = maxLineWidth;
        this._height = height;
        this._descender = lineHeight - baseline;
        this._baseline = baseline;
        this._xHeight = getXHeight(font);
        this._capHeight = getCapHeight(font);
        this._lineHeight = lineHeight;
        this._ascender = lineHeight - descender - this._xHeight; // layout each glyph

        lines.forEach(function (line, lineIndex) {
          var start = line.start;
          var end = line.end;
          var lineWidth = line.width;
          var lineLettersTotal = line.end - line.start;
          var lastGlyph; // for each glyph in that line...

          for (var i = start; i < end; i++) {
            var id = text.charCodeAt(i);

            var glyph = _this.getGlyph(font, id);

            if (glyph) {
              if (lastGlyph) {
                x += getKerning(font, lastGlyph.id, glyph.id);
              }

              var tx = x;

              if (align === ALIGN_CENTER) {
                tx += (maxLineWidth - lineWidth) / 2;
              } else if (align === ALIGN_RIGHT) {
                tx += maxLineWidth - lineWidth;
              } // first line indent


              if (_this._options.textIndent && lineIndex === 0) {
                tx += _this._options.textIndent;
              }

              glyphs.push({
                position: [tx, y],
                data: glyph,
                index: i,
                line: lineIndex,
                lineLettersTotal: lineLettersTotal
              }); // move pen forward

              x += glyph.xadvance + letterSpacing;
              lastGlyph = glyph;
            }
          } // next line down


          y += lineHeight;
          x = 0;
        });
        this._lettersTotal = glyphs.length;
        this._linesTotal = lines.length;
      }
    }, {
      key: "getGlyph",
      value: function getGlyph(font, id) {
        var glyph = getGlyphById(font, id);

        if (glyph) {
          return glyph;
        } else if (id === TAB_ID) {
          return this._fallbackTabGlyph;
        } else if (id === SPACE_ID) {
          return this._fallbackSpaceGlyph;
        }

        return null;
      }
    }, {
      key: "computeMetrics",
      value: function computeMetrics(text, start, end, width) {
        var letterSpacing = this._options.letterSpacing || 0;
        var font = this._options.font;
        var curPen = 0;
        var curWidth = 0;
        var count = 0;
        var glyph;
        var lastGlyph;

        if (!font.chars || font.chars.length === 0) {
          return {
            start: start,
            end: start,
            width: 0
          };
        }

        end = Math.min(text.length, end);

        for (var i = start; i < end; i++) {
          var id = text.charCodeAt(i);
          glyph = this.getGlyph(font, id);

          if (glyph) {
            glyph.char = text[i]; // move pen forward

            glyph.xoffset;
            var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;
            curPen += kern;
            var nextPen = curPen + glyph.xadvance + letterSpacing;
            var nextWidth = curPen + glyph.width; // we've hit our limit; we can't move onto the next glyph

            if (nextWidth >= width || nextPen >= width) {
              break;
            } // otherwise continue along our line


            curPen = nextPen;
            curWidth = nextWidth;
            lastGlyph = glyph;
          }

          count++;
        } // make sure rightmost edge lines up with rendered glyphs


        if (lastGlyph) {
          curWidth += lastGlyph.xoffset;
        }

        return {
          start: start,
          end: start + count,
          width: curWidth
        };
      }
      /**
       * Private
       */

    }, {
      key: "_setupSpaceGlyphs",
      value: function _setupSpaceGlyphs(font) {
        // These are fallbacks, when the font doesn't include
        // ' ' or '\t' glyphs
        this._fallbackSpaceGlyph = null;
        this._fallbackTabGlyph = null;
        if (!font.chars || font.chars.length === 0) return; // try to get space glyph
        // then fall back to the 'm' or 'w' glyphs
        // then fall back to the first glyph available

        var space = getGlyphById(font, SPACE_ID) || getMGlyph(font) || font.chars[0]; // and create a fallback for tab

        var tabWidth = this._options.tabSize * space.xadvance;
        this._fallbackSpaceGlyph = space;
        var spaceClone = Object.assign({}, space);
        this._fallbackTabGlyph = Object.assign(spaceClone, {
          x: 0,
          y: 0,
          xadvance: tabWidth,
          id: TAB_ID,
          xoffset: 0,
          yoffset: 0,
          width: 0,
          height: 0
        });
      }
    }]);

    return TextLayout;
  }();

  function createLayout(options) {
    return new TextLayout(options);
  }

  function getGlyphById(font, id) {
    if (!font.chars || font.chars.length === 0) {
      return null;
    }

    var glyphIdx = findChar(font.chars, id);

    if (glyphIdx >= 0) {
      var glyph = font.chars[glyphIdx];
      return glyph;
    }

    return null;
  }

  function getXHeight(font) {
    for (var i = 0; i < X_HEIGHTS.length; i++) {
      var id = X_HEIGHTS[i].charCodeAt(0);
      var idx = findChar(font.chars, id);

      if (idx >= 0) {
        return font.chars[idx].height;
      }
    }

    return 0;
  }

  function getMGlyph(font) {
    for (var i = 0; i < M_WIDTHS.length; i++) {
      var id = M_WIDTHS[i].charCodeAt(0);
      var idx = findChar(font.chars, id);

      if (idx >= 0) {
        return font.chars[idx];
      }
    }

    return 0;
  }

  function getCapHeight(font) {
    for (var i = 0; i < CAP_HEIGHTS.length; i++) {
      var id = CAP_HEIGHTS[i].charCodeAt(0);
      var idx = findChar(font.chars, id);

      if (idx >= 0) {
        return font.chars[idx].height;
      }
    }

    return 0;
  }

  function getKerning(font, left, right) {
    if (!font.kernings || font.kernings.length === 0) {
      return 0;
    }

    var table = font.kernings;

    for (var i = 0; i < table.length; i++) {
      var kern = table[i];

      if (kern.first === left && kern.second === right) {
        return kern.amount;
      }
    }

    return 0;
  }

  function getAlignType(align) {
    if (align === 'center') {
      return ALIGN_CENTER;
    } else if (align === 'right') {
      return ALIGN_RIGHT;
    }

    return ALIGN_LEFT;
  }

  function findChar(array, value, start) {
    start = start || 0;

    for (var i = start; i < array.length; i++) {
      if (array[i].id === value) {
        return i;
      }
    }

    return -1;
  }

  function number(num, def) {
    return typeof num === 'number' ? num : typeof def === 'number' ? def : 0;
  }

  var itemSize = 2;
  var box = {
    min: [0, 0],
    max: [0, 0]
  };

  function bounds(positions) {
    var count = positions.length / itemSize;
    box.min[0] = positions[0];
    box.min[1] = positions[1];
    box.max[0] = positions[0];
    box.max[1] = positions[1];

    for (var i = 0; i < count; i++) {
      var x = positions[i * itemSize + 0];
      var y = positions[i * itemSize + 1];
      box.min[0] = Math.min(x, box.min[0]);
      box.min[1] = Math.min(y, box.min[1]);
      box.max[0] = Math.max(x, box.max[0]);
      box.max[1] = Math.max(y, box.max[1]);
    }
  }

  function computeBox(positions, output) {
    bounds(positions);
    output.min.set(box.min[0], box.min[1], 0);
    output.max.set(box.max[0], box.max[1], 0);
    return output;
  }

  function computeSphere(positions, output) {
    bounds(positions);
    var minX = box.min[0];
    var minY = box.min[1];
    var maxX = box.max[0];
    var maxY = box.max[1];
    var width = maxX - minX;
    var height = maxY - minY;
    var length = Math.sqrt(width * width + height * height);
    output.center.set(minX + width / 2, minY + height / 2, 0);
    output.radius = length / 2;
  }
  var utils = {
    computeBox: computeBox,
    computeSphere: computeSphere
  };

  function pages(glyphs) {
    var pages = new Float32Array(glyphs.length * 4 * 1);
    var i = 0;
    glyphs.forEach(function (glyph) {
      var id = glyph.data.page || 0;
      pages[i++] = id;
      pages[i++] = id;
      pages[i++] = id;
      pages[i++] = id;
    });
    return pages;
  }

  function attributes(glyphs, texWidth, texHeight, flipY, layout) {
    var uvs = new Float32Array(glyphs.length * 4 * 2);
    var layoutUvs = new Float32Array(glyphs.length * 4 * 2);
    var positions = new Float32Array(glyphs.length * 4 * 2);
    var centers = new Float32Array(glyphs.length * 4 * 2);
    var i = 0;
    var j = 0;
    var k = 0;
    var l = 0;
    glyphs.forEach(function (glyph) {
      var bitmap = glyph.data; // UV

      var bw = bitmap.x + bitmap.width;
      var bh = bitmap.y + bitmap.height; // top left position

      var u0 = bitmap.x / texWidth;
      var v1 = bitmap.y / texHeight;
      var u1 = bw / texWidth;
      var v0 = bh / texHeight;

      if (flipY) {
        v1 = (texHeight - bitmap.y) / texHeight;
        v0 = (texHeight - bh) / texHeight;
      } // BL


      uvs[i++] = u0;
      uvs[i++] = v1; // TL

      uvs[i++] = u0;
      uvs[i++] = v0; // TR

      uvs[i++] = u1;
      uvs[i++] = v0; // BR

      uvs[i++] = u1;
      uvs[i++] = v1; // Layout UV: Text block UVS
      // BL

      layoutUvs[l++] = glyph.position[0] / layout.width;
      layoutUvs[l++] = (glyph.position[1] + layout.height) / layout.height; // TL

      layoutUvs[l++] = glyph.position[0] / layout.width;
      layoutUvs[l++] = (glyph.position[1] + layout.height + bitmap.height) / layout.height; // TR

      layoutUvs[l++] = (glyph.position[0] + bitmap.width) / layout.width;
      layoutUvs[l++] = (glyph.position[1] + layout.height + bitmap.height) / layout.height; // BR

      layoutUvs[l++] = (glyph.position[0] + bitmap.width) / layout.width;
      layoutUvs[l++] = (glyph.position[1] + layout.height) / layout.height; // Positions, Centers
      // bottom left position

      var x = glyph.position[0] + bitmap.xoffset;
      var y = glyph.position[1] + bitmap.yoffset; // quad size

      var w = bitmap.width;
      var h = bitmap.height; // Position
      // BL

      positions[j++] = x;
      positions[j++] = y; // TL

      positions[j++] = x;
      positions[j++] = y + h; // TR

      positions[j++] = x + w;
      positions[j++] = y + h; // BR

      positions[j++] = x + w;
      positions[j++] = y; // Center

      centers[k++] = x + w / 2;
      centers[k++] = y + h / 2;
      centers[k++] = x + w / 2;
      centers[k++] = y + h / 2;
      centers[k++] = x + w / 2;
      centers[k++] = y + h / 2;
      centers[k++] = x + w / 2;
      centers[k++] = y + h / 2;
    });
    return {
      uvs: uvs,
      layoutUvs: layoutUvs,
      positions: positions,
      centers: centers
    };
  }

  function infos(glyphs, layout) {
    var words = new Float32Array(glyphs.length * 4);
    var lines = new Float32Array(glyphs.length * 4);
    var letters = new Float32Array(glyphs.length * 4);
    var lineLetters = new Float32Array(glyphs.length * 4);
    var lineLettersTotal = new Float32Array(glyphs.length * 4);
    var i = 0;
    var j = 0;
    var k = 0;
    var l = 0;
    var m = 0;
    var lineLetterIndex = 0;
    var previousLineIndex = -1;

    for (var index = 0; index < glyphs.length; index++) {
      var glyph = glyphs[index];
      lines[i++] = glyph.line;
      lines[i++] = glyph.line;
      lines[i++] = glyph.line;
      lines[i++] = glyph.line;
      letters[j++] = glyph.index;
      letters[j++] = glyph.index;
      letters[j++] = glyph.index;
      letters[j++] = glyph.index;
      lineLettersTotal[l++] = glyph.lineLettersTotal;
      lineLettersTotal[l++] = glyph.lineLettersTotal;
      lineLettersTotal[l++] = glyph.lineLettersTotal;
      lineLettersTotal[l++] = glyph.lineLettersTotal;

      if (previousLineIndex === glyph.line) {
        lineLetterIndex++;
      } else {
        lineLetterIndex = 0;
      }

      previousLineIndex = glyph.line;
      lineLetters[k++] = lineLetterIndex;
      lineLetters[k++] = lineLetterIndex;
      lineLetters[k++] = lineLetterIndex;
      lineLetters[k++] = lineLetterIndex;
      words[m++] = glyph.wordIndex;
      words[m++] = glyph.wordIndex;
      words[m++] = glyph.wordIndex;
      words[m++] = glyph.wordIndex;
    }

    return {
      words: words,
      lines: lines,
      letters: letters,
      lineLetters: lineLetters,
      lineLettersTotal: lineLettersTotal
    };
  }

  var vertices = {
    pages: pages,
    attributes: attributes,
    infos: infos
  };

  var MSDFTextGeometry = /*#__PURE__*/function (_BufferGeometry) {
    _inherits(MSDFTextGeometry, _BufferGeometry);

    var _super = _createSuper(MSDFTextGeometry);

    function MSDFTextGeometry(options) {
      var _this;

      _classCallCheck(this, MSDFTextGeometry);

      _this = _super.call(this); // Set text as object property

      if (typeof options === 'string') options = {
        text: options
      }; // use these as default values for any subsequent
      // calls to update()

      _this._options = Object.assign({}, options);
      _this._layout = null;
      _this._visibleGlyphs = [];

      _this.update(_this._options);

      return _this;
    }
    /**
     * Getters
     */


    _createClass(MSDFTextGeometry, [{
      key: "layout",
      get: function get() {
        return this._layout;
      }
    }, {
      key: "visibleGlyphs",
      get: function get() {
        return this._visibleGlyphs;
      }
      /**
       * Public
       */

    }, {
      key: "update",
      value: function update(options) {
        options = this._validateOptions(options);
        if (!options) return;
        this._layout = createLayout(options); // get vec2 texcoords

        var flipY = options.flipY !== false; // the desired BMFont data

        var font = options.font; // determine texture size from font file

        var texWidth = font.common.scaleW;
        var texHeight = font.common.scaleH; // Get word index

        var wordIndex = 0;

        for (var i = 0; i < this._layout.glyphs.length; i++) {
          var bitmap = this._layout.glyphs[i].data;
          this._layout.glyphs[i].wordIndex = wordIndex;
          if (bitmap.char === ' ') wordIndex++;
        } // get visible glyphs


        var glyphs = this._layout.glyphs.filter(function (glyph) {
          var bitmap = glyph.data;
          return bitmap.width * bitmap.height > 0;
        }); // provide visible glyphs for convenience


        this._visibleGlyphs = glyphs; // get common vertex data

        var attributes = vertices.attributes(glyphs, texWidth, texHeight, flipY, this._layout);
        var infos = vertices.infos(glyphs, this._layout);
        var indices = createIndices__default["default"]([], {
          clockwise: true,
          type: 'uint16',
          count: glyphs.length
        }); // update vertex data

        this.setIndex(indices);
        this.setAttribute('position', new three.BufferAttribute(attributes.positions, 2));
        this.setAttribute('center', new three.BufferAttribute(attributes.centers, 2));
        this.setAttribute('uv', new three.BufferAttribute(attributes.uvs, 2));
        this.setAttribute('layoutUv', new three.BufferAttribute(attributes.layoutUvs, 2));
        this.setAttribute('word', new three.BufferAttribute(infos.words, 1)); // update multipage data

        if (!options.multipage && 'page' in this.attributes) {
          // disable multipage rendering
          this.deleteAttribute('page');
        } else if (options.multipage) {
          // enable multipage rendering
          var pages = vertices.pages(glyphs);
          this.setAttribute('page', new three.BufferAttribute(pages, 1));
        }
      }
    }, {
      key: "computeBoundingSphere",
      value: function computeBoundingSphere() {
        if (this.boundingSphere === null) this.boundingSphere = new three.Sphere();
        var positions = this.attributes.position.array;
        var itemSize = this.attributes.position.itemSize;

        if (!positions || !itemSize || positions.length < 2) {
          this.boundingSphere.radius = 0;
          this.boundingSphere.center.set(0, 0, 0);
          return;
        }

        utils.computeSphere(positions, this.boundingSphere);
        if (isNaN(this.boundingSphere.radius)) console.error('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.');
      }
    }, {
      key: "computeBoundingBox",
      value: function computeBoundingBox() {
        if (this.boundingBox === null) {
          this.boundingBox = new three.Box3();
        }

        var bbox = this.boundingBox;
        var positions = this.attributes.position.array;
        var itemSize = this.attributes.position.itemSize;

        if (!positions || !itemSize || positions.length < 2) {
          bbox.makeEmpty();
          return;
        }

        var box = utils.computeBox(positions, bbox);
        return box;
      }
      /**
       * Utils
       */

    }, {
      key: "_validateOptions",
      value: function _validateOptions(options) {
        // Set text as object property
        if (typeof options === 'string') options = {
          text: options
        }; // Use constructor defaults

        options = Object.assign({}, this._options, options); // Check for font property

        if (!options.font) throw new TypeError('must specify a { font } in options');
        return options;
      }
    }]);

    return MSDFTextGeometry;
  }(three.BufferGeometry);

  var vertexShader = "#define GLSLIFY 1\nattribute vec2 layoutUv;attribute float line;attribute float letter;attribute float lineLetters;attribute float lineLettersTotal;varying vec2 vUv;varying vec2 vLayoutUv;varying vec3 vViewPosition;varying vec3 vNormal;varying float vLineIndex;varying float vLetterIndex;varying float vLineLetterIndex;varying float vLineLettersTotal;void main(){vec4 mvPosition=vec4(position,1.0);mvPosition=modelViewMatrix*mvPosition;gl_Position=projectionMatrix*mvPosition;vUv=uv;vLayoutUv=layoutUv;vViewPosition=-mvPosition.xyz;vNormal=normal;vLineIndex=line;vLetterIndex=letter;vLineLetterIndex=lineLetters;vLineLettersTotal=lineLettersTotal;}"; // eslint-disable-line

  var fragmentShader = "#define GLSLIFY 1\nvarying vec2 vUv;uniform float uOpacity;uniform float uThreshold;uniform float uAlphaTest;uniform vec3 uColor;uniform sampler2D uMap;uniform vec3 uOutlineColor;uniform float uOutlineOutsetWidth;uniform float uOutlineInsetWidth;float median(float r,float g,float b){return max(min(r,g),min(max(r,g),b));}void main(){vec3 s=texture2D(uMap,vUv).rgb;float sigDist=median(s.r,s.g,s.b)-0.5;float sigDistOutset=sigDist+uOutlineOutsetWidth*0.5;float sigDistOutset2=sigDist+(0.5)*0.5;float sigDistInset=sigDist-uOutlineInsetWidth*0.5;\n#ifdef IS_SMALL\nfloat afwidth=1.4142135623730951/2.0;float alpha=smoothstep(uThreshold-afwidth,uThreshold+afwidth,sigDist);float outset=smoothstep(uThreshold-afwidth,uThreshold+afwidth,sigDistOutset);float outset2=smoothstep(uThreshold-afwidth,uThreshold+afwidth,sigDistOutset2);float inset=1.0-smoothstep(uThreshold-afwidth,uThreshold+afwidth,sigDistInset);\n#else\nfloat alpha=clamp(sigDist/fwidth(sigDist)+0.5,0.0,1.0);float outset=clamp(sigDistOutset/fwidth(sigDistOutset)+0.5,0.0,1.0);float outset2=clamp(sigDistOutset2/fwidth(sigDistOutset2)+0.5,0.0,1.0);float inset=1.0-clamp(sigDistInset/fwidth(sigDistInset)+0.5,0.0,1.0);\n#endif\nfloat border=outset*inset;if(alpha<uAlphaTest)discard;vec4 filledFragColor=vec4(uColor,uOpacity*alpha);vec4 strokedFragColor=vec4(uOutlineColor,uOpacity*border);gl_FragColor=filledFragColor;}"; // eslint-disable-line

  var defaultOptions = {
    side: three.FrontSide,
    transparent: true,
    defines: {
      IS_SMALL: false
    },
    extensions: {
      derivatives: true
    },
    uniforms: {
      uOpacity: {
        value: 1
      },
      uColor: {
        value: new three.Color('#ffffff')
      },
      uMap: {
        value: null
      },
      uThreshold: {
        value: 0
      },
      uAlphaTest: {
        value: 0
      },
      uOutlineColor: {
        value: new three.Color('#ffffff')
      },
      uOutlineOutsetWidth: {
        value: 0
      },
      uOutlineInsetWidth: {
        value: 0
      }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  };

  var MSDFTextMaterial = /*#__PURE__*/function (_ShaderMaterial) {
    _inherits(MSDFTextMaterial, _ShaderMaterial);

    var _super = _createSuper(MSDFTextMaterial);

    function MSDFTextMaterial() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, MSDFTextMaterial);

      options = Object.assign(defaultOptions, options);
      return _super.call(this, options);
    }

    return _createClass(MSDFTextMaterial);
  }(three.ShaderMaterial);

  // Vendor
  var index = {
    MSDFTextGeometry: MSDFTextGeometry,
    MSDFTextMaterial: MSDFTextMaterial,
    loadFont: loadFont__default["default"]
  };

  return index;

}));
