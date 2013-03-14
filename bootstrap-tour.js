// Generated by CoffeeScript 1.6.1

/* ============================================================
# bootstrap-tour.js v0.1
# http://pushly.github.com/bootstrap-tour/
# ==============================================================
# Copyright 2012 Push.ly
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/


(function() {

  (function($, window) {
    var Tour, document;
    document = window.document;
    Tour = (function() {

      function Tour(options) {
        var _this = this;
        this._options = $.extend({
          name: 'tour',
          labels: {
            end: 'End tour',
            next: 'Next &raquo;',
            prev: '&laquo; Prev'
          },
          keyboard: true,
          useLocalStorage: false,
          afterSetState: function(key, value) {},
          afterGetState: function(key, value) {},
          afterRemoveState: function(key) {},
          onStart: function(tour) {},
          onEnd: function(tour) {},
          onShow: function(tour) {},
          onHide: function(tour) {},
          onShown: function(tour) {}
        }, options);
        this._steps = [];
        this.setCurrentStep();
        this._onresize(function() {
          if (!_this.ended) {
            return _this.showStep(_this._current);
          }
        });
      }

      Tour.prototype.setState = function(key, value) {
        key = "" + this._options.name + "_" + key;
        if (this._options.useLocalStorage) {
          window.localStorage.setItem(key, value);
        } else {
          $.cookie(key, value, {
            expires: 36500,
            path: '/'
          });
        }
        return this._options.afterSetState(key, value);
      };

      Tour.prototype.removeState = function(key) {
        key = "" + this._options.name + "_" + key;
        if (this._options.useLocalStorage) {
          window.localStorage.removeItem(key);
        } else {
          $.removeCookie(key, {
            path: '/'
          });
        }
        return this._options.afterRemoveState(key);
      };

      Tour.prototype.getState = function(key) {
        var value;
        if (this._options.useLocalStorage) {
          value = window.localStorage.getItem("" + this._options.name + "_" + key);
        } else {
          value = $.cookie("" + this._options.name + "_" + key);
        }
        if (value === void 0 || value === "null") {
          value = null;
        }
        this._options.afterGetState(key, value);
        return value;
      };

      Tour.prototype.addStep = function(step) {
        return this._steps.push(step);
      };

      Tour.prototype.getStep = function(i) {
        if (this._steps[i] != null) {
          return $.extend({
            path: "",
            placement: "right",
            title: "",
            content: "",
            next: i === this._steps.length - 1 ? -1 : i + 1,
            prev: i - 1,
            animation: true,
            onShow: this._options.onShow,
            onHide: this._options.onHide,
            onShown: this._options.onShown
          }, this._steps[i]);
        }
      };

      Tour.prototype.start = function(force) {
        var promise,
          _this = this;
        if (force == null) {
          force = false;
        }
        if (this.ended() && !force) {
          return;
        }
        $(document).off("click.bootstrap-tour", ".popover .next").on("click.bootstrap-tour", ".popover .next", function(e) {
          e.preventDefault();
          return _this.next();
        });
        $(document).off("click.bootstrap-tour", ".popover .prev").on("click.bootstrap-tour", ".popover .prev", function(e) {
          e.preventDefault();
          return _this.prev();
        });
        $(document).off("click.bootstrap-tour", ".popover .end").on("click.bootstrap-tour", ".popover .end", function(e) {
          e.preventDefault();
          return _this.end();
        });
        this._setupKeyboardNavigation();
        promise = this._makePromise(this._options.onStart != null ? this._options.onStart(this) : void 0);
        return this._callOnPromiseDone(promise, this.showStep, this._current);
      };

      Tour.prototype.next = function() {
        var promise;
        promise = this.hideStep(this._current);
        return this._callOnPromiseDone(promise, this.showNextStep);
      };

      Tour.prototype.prev = function() {
        var promise;
        return promise = this.hideStep(this._current);
      };

      Tour.prototype.end = function() {
        var endHelper, hidePromise,
          _this = this;
        endHelper = function(e) {
          $(document).off("click.bootstrap-tour");
          $(document).off("keyup.bootstrap-tour");
          _this.setState("end", "yes");
          if (_this._options.onEnd != null) {
            return _this._options.onEnd(_this);
          }
        };
        hidePromise = this.hideStep(this._current);
        return this._callOnPromiseDone(hidePromise, endHelper);
      };

      Tour.prototype.ended = function() {
        return !!this.getState("end");
      };

      Tour.prototype.restart = function() {
        this.removeState("current_step");
        this.removeState("end");
        this.setCurrentStep(0);
        return this.start();
      };

      Tour.prototype.hideStep = function(i) {
        var hideStepHelper, promise, step,
          _this = this;
        step = this.getStep(i);
        promise = this._makePromise((step.onHide != null ? step.onHide(this) : void 0));
        hideStepHelper = function(e) {
          return $(step.element).popover("hide");
        };
        this._callOnPromiseDone(promise, hideStepHelper);
        return promise;
      };

      Tour.prototype.showStep = function(i) {
        var promise, showStepHelper, step,
          _this = this;
        step = this.getStep(i);
        if (!step) {
          return;
        }
        promise = this._makePromise((step.onShow != null ? step.onShow(this) : void 0));
        showStepHelper = function(e) {
          var path;
          _this.setCurrentStep(i);
          path = typeof step.path === "function" ? step.path.call() : step.path;
          if (_this._redirect(path, document.location.pathname)) {
            document.location.href = path;
            return;
          }
          if (!((step.element != null) && $(step.element).length !== 0 && $(step.element).is(":visible"))) {
            _this.showNextStep();
            return;
          }
          _this._showPopover(step, i);
          if (step.onShown != null) {
            return step.onShown(_this);
          }
        };
        return this._callOnPromiseDone(promise, showStepHelper);
      };

      Tour.prototype.setCurrentStep = function(value) {
        if (value != null) {
          this._current = value;
          return this.setState("current_step", value);
        } else {
          this._current = this.getState("current_step");
          if (this._current === null) {
            return this._current = 0;
          } else {
            return this._current = parseInt(this._current);
          }
        }
      };

      Tour.prototype.showNextStep = function() {
        var step;
        step = this.getStep(this._current);
        return this.showStep(step.next);
      };

      Tour.prototype.showPrevStep = function() {
        var step;
        step = this.getStep(this._current);
        return this.showStep(step.prev);
      };

      Tour.prototype._redirect = function(path, currentPath) {
        return (path != null) && path !== "" && path.replace(/\?.*$/, "").replace(/\/?$/, "") !== currentPath.replace(/\/?$/, "");
      };

      Tour.prototype._showPopover = function(step, i) {
        var content, nav, options, tip,
          _this = this;
        content = "" + step.content + "<br /><p>";
        options = $.extend({}, this._options);
        if (step.options) {
          $.extend(options, step.options);
        }
        if (step.reflex) {
          $(step.element).css("cursor", "pointer");
          $(step.element).on("click", function(e) {
            $(step.element).css("cursor", "auto");
            return _this.next();
          });
        }
        nav = [];
        if (step.prev >= 0) {
          nav.push("<a href='#" + step.prev + "' class='prev'>" + options.labels.prev + "</a>");
        }
        if (step.next >= 0) {
          nav.push("<a href='#" + step.next + "' class='next'>" + options.labels.next + "</a>");
        }
        content += nav.join(" | ");
        content += "<a href='#' class='pull-right end'>" + options.labels.end + "</a>";
        $(step.element).popover('destroy').popover({
          placement: step.placement,
          trigger: "manual",
          title: step.title,
          content: content,
          html: true,
          animation: step.animation,
          container: "body"
        }).popover("show");
        tip = $(step.element).data("popover").tip();
        this._reposition(tip, step);
        return this._scrollIntoView(tip);
      };

      Tour.prototype._reposition = function(tip, step) {
        var offsetBottom, offsetRight, original_left, original_offsetHeight, original_offsetWidth, original_top, tipOffset;
        original_offsetWidth = tip[0].offsetWidth;
        original_offsetHeight = tip[0].offsetHeight;
        tipOffset = tip.offset();
        original_left = tipOffset.left;
        original_top = tipOffset.top;
        offsetBottom = $(document).outerHeight() - tipOffset.top - $(tip).outerHeight();
        if (offsetBottom < 0) {
          tipOffset.top = tipOffset.top + offsetBottom;
        }
        offsetRight = $("html").outerWidth() - tipOffset.left - $(tip).outerWidth();
        if (offsetRight < 0) {
          tipOffset.left = tipOffset.left + offsetRight;
        }
        if (tipOffset.top < 0) {
          tipOffset.top = 0;
        }
        if (tipOffset.left < 0) {
          tipOffset.left = 0;
        }
        tip.offset(tipOffset);
        if (step.placement === 'bottom' || step.placement === 'top') {
          if (original_left !== tipOffset.left) {
            return this._replaceArrow(tip, (tipOffset.left - original_left) * 2, original_offsetWidth, 'left');
          }
        } else {
          if (original_top !== tipOffset.top) {
            return this._replaceArrow(tip, (tipOffset.top - original_top) * 2, original_offsetHeight, 'top');
          }
        }
      };

      Tour.prototype._replaceArrow = function(tip, delta, dimension, position) {
        return tip.find(".arrow").css(position, delta ? 50 * (1 - delta / dimension) + "%" : '');
      };

      Tour.prototype._scrollIntoView = function(tip) {
        var tipRect;
        tipRect = tip.get(0).getBoundingClientRect();
        if (!(tipRect.top >= 0 && tipRect.bottom < $(window).height() && tipRect.left >= 0 && tipRect.right < $(window).width())) {
          return tip.get(0).scrollIntoView(true);
        }
      };

      Tour.prototype._onresize = function(cb, timeout) {
        return $(window).resize(function() {
          clearTimeout(timeout);
          return timeout = setTimeout(cb, 100);
        });
      };

      Tour.prototype._setupKeyboardNavigation = function() {
        var _this = this;
        if (this._options.keyboard) {
          return $(document).on("keyup.bootstrap-tour", function(e) {
            if (!e.which) {
              return;
            }
            switch (e.which) {
              case 39:
                e.preventDefault();
                if (_this._current < _this._steps.length - 1) {
                  return _this.next();
                }
                break;
              case 37:
                e.preventDefault();
                if (_this._current > 0) {
                  return _this.prev();
                }
            }
          });
        }
      };

      Tour.prototype._makePromise = function(result) {
        if (result && $.isFunction(result.then)) {
          return result;
        } else {
          return null;
        }
      };

      Tour.prototype._callOnPromiseDone = function(promise, cb, arg) {
        var _this = this;
        if (promise) {
          return promise.then(function(e) {
            return cb.call(_this, arg);
          });
        } else {
          return cb.call(this, arg);
        }
      };

      return Tour;

    })();
    return window.Tour = Tour;
  })(jQuery, window);

}).call(this);
