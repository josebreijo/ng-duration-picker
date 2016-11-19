'use strict';

(function () {

  var template = '<div class="ngdp" style="top: {{ui.pos.top}}px; left: {{ui.pos.left}}px" \n      ng-class="{\'ngdp-visible\': ui.visible, \'ngdp-open\': ui.open, \'ngdp-dirty\': ui.dirty}">\n\n        <div class="ngdp-content">\n          <div class="ngdp-top">\n            <div class="ngdp-change">\n              <a href="#" ng-click="changeCategory(next, $event)" \n                 ng-class="{\'text-muted\': next.indexOf(\'limit\') !== -1}"> {{next}} </a>\n            </div>\n            <div class="ngdp-toggle" ng-click="toggleNav($event)">\n              <i class="ngdp-bar"> </i>\n              <i class="ngdp-bar"> </i>\n              <i class="ngdp-bar"> </i>\n            </div>\n          </div>    \n          <div class="ngdp-middle">\n            <div class="col-xs-12">\n              <div class="ngdp-updown col-xs-5 text-center">\n                <a href="#" ng-click="updateValue(true, $event)">\n                  <span class="glyphicon glyphicon-plus"></span>\n                </a>\n                <input type="text" class="form-control" ng-model="value" \n                       ng-change="changeInput()" ng-class="{\'ngdp-error\': ui.error}">\n                <a href="#" ng-click="updateValue(false, $event)">\n                  <span class="glyphicon glyphicon-minus"></span>\n                </a>\n              </div>\n              <div class="col-xs-7 text-center">\n                <h4 class="text-muted">{{category}}</h4>\n              </div>\n            </div>\n            <div class="row">\n              <div class="col-xs-12 text-center">\n                <small class="text-muted"> {{preview.human}} </small>\n              </div>\n            </div>\n          </div>\n          <div class="ngdp-bottom">\n            <div class="ngdp-change">\n              <a href="#" ng-click="changeCategory(previous, $event)"\n                 ng-class="{\'text-muted\': previous.indexOf(\'limit\') !== -1}"> {{previous}}</a>\n            </div>\n            <div class="ngdp-done" ng-click="bindToExternalModel($event)">\n              <span class="ngdp-check"> </span>\n            </div>\n          </div>\n        </div>\n\n        <div class="ngdp-navigation">\n          <div class="ngdp-back" style="visibility: {{ui.dirty ? \'visible\' : \'hidden\'}}">\n            <a href="#" ng-click="toggleNav($event)">\n              <span class="glyphicon glyphicon-chevron-left"></span>\n              <span>go back </span>\n            </a>\n          </div>\n          <h4>Select a category </h4>\n          <ul class="ngdp-categories">\n            <li class="ngdp-category" ng-repeat="category in categories">\n              <button type="button" class="btn btn-sm" ng-click="changeCategory(category)">{{category}}</button>\n            </li>\n          </ul>\n        </div>\n      </div>';

  function getPosition(element) {

    var padding = 15;
    var ngdpWidth = 230;
    var ngdpHeight = 200;

    // Gets the current position and size of the element
    // referent to the visible area of the browser

    var _element$getBoundingC = element.getBoundingClientRect(),
        height = _element$getBoundingC.height,
        width = _element$getBoundingC.width,
        top = _element$getBoundingC.top,
        left = _element$getBoundingC.left;

    // Check if the element in which the directive was used
    // it's above the center of the screen


    var visibleHeight = window.innerHeight;
    var up = top > visibleHeight / 2;

    // Change the top offset to stick the UI to the element
    top = up ? -(padding + ngdpHeight) : padding + height;

    var middle = left + width / 2;

    var inTheMiddle = middle > ngdpWidth / 2 && middle <= document.body.clientWidth - ngdpWidth / 2;

    var rightSide = middle > document.body.clientWidth - ngdpWidth / 2;

    if (inTheMiddle) {
      left = width / 2 - ngdpWidth / 2;
    } else if (rightSide) {
      left = width - ngdpWidth;
    } else {
      left = 0;
    }

    return { top: top, left: left };
  }

  /* @ngInject */
  function durationPicker() {

    var Factory = {
      restrict: 'A',
      scope: {
        result: '=',
        human: '=',
        output: '@',
        lang: '@'
      },
      link: function link(scope, element, attrs) {
        scope.lazy = attrs.hasOwnProperty('lazy');
        angular.element(element).wrap('<div class="ngdp-wrapper"></div>');

        // TODO add handler to hide if clicked outside
        scope.insertPicker();

        function updateUI(ev) {
          scope.$apply(function () {
            if (ev.type === 'click') {
              scope.ui.visible = !scope.ui.visible;
            }

            if (scope.ui.visible) {
              var _getPosition = getPosition(element[0]),
                  top = _getPosition.top,
                  left = _getPosition.left;

              scope.ui.pos = { top: top, left: left };
            }
          });
        }

        angular.element(element).on('click', function (ev) {
          return updateUI(ev);
        });
        angular.element(window).on('scroll', function (ev) {
          return updateUI(ev);
        });
      },

      controller: ['$scope', '$compile', function ($scope, $compile) {

        $scope.ui = {
          visible: false, // ui is visible
          open: true, // open navigation
          dirty: false, // first time selected category
          error: false, // input is a wrong number
          pos: { top: 0, left: 0 }, // position of the directive
          lang: $scope.lang || 'es' };

        $scope.insertPicker = function () {
          var picker = $compile(template)($scope);
          var DOMWrapper = document.getElementsByClassName('ngdp-wrapper');
          angular.element(DOMWrapper).prepend(picker);
        };

        $scope.toggleNav = function ($event) {
          if (!$scope.ui.error) {
            $scope.ui.open = !$scope.ui.open;
            $event.preventDefault();
          }
        };

        $scope.category = 'minutes';
        $scope.categories = ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
        $scope.log = {};
        $scope.categories.forEach(function (cat) {
          return $scope.log[cat] = 0;
        });
        $scope.preview = { result: 0, human: 'nothing selected yet ...' };

        if (!$scope.output) {
          $scope.customOutput = 'minutes';
        } else {
          $scope.customOutput = $scope.categories.indexOf($scope.output) === -1 ? 'minutes' : $scope.output;
        }

        $scope.changeCategory = function (category, $event) {
          if ($event) {
            $event.preventDefault();
          }

          if ($scope.ui.error) {
            return;
          }

          if (category.indexOf('limit') === -1) {
            $scope.category = category;
            $scope.value = $scope.log[category];
            $scope.ui.open = false;
            $scope.ui.dirty = true;

            var current = $scope.categories.indexOf(category);
            $scope.next = $scope.categories[current + 1] || 'reached limit';
            $scope.previous = $scope.categories[current - 1] || 'reached limit';
          } else {
            return false;
          }
        };

        $scope.updatePreview = function () {
          function buildString() {
            var customString = [];
            $scope.categories.forEach(function (category) {
              var value = $scope.log[category];
              if (value) {
                if (value === 1) {
                  category = category.substring(0, category.length - 1);
                }
                customString.push(value + ' ' + category);
              }
            });
            return customString.reverse().join(' ');
          }

          var duration = moment.duration($scope.log);
          $scope.preview.human = $scope.lazy ? duration.humanize() : buildString();

          if (!$scope.preview.human) {
            $scope.preview.human = 'nothing selected yet ...';
          }

          $scope.preview.result = duration.as($scope.customOutput);
        };

        $scope.updateValue = function (add, $event) {
          if ($event) {
            $event.preventDefault();
          }

          if (!$scope.ui.error) {
            $scope.value = add ? ++$scope.log[$scope.category] : $scope.value && --$scope.log[$scope.category];

            $scope.updatePreview();
          }
        };

        $scope.changeInput = function () {
          var val = Number($scope.value);
          if (Number.isNaN(val) || val < 0) {
            $scope.ui.error = true;
            $scope.preview.human = 'wrong input';
            return;
          }

          $scope.ui.error = false;

          $scope.log[$scope.category] = $scope.value;
          $scope.updatePreview();
        };

        $scope.bindToExternalModel = function () {
          if (!$scope.ui.error) {
            $scope.human = $scope.preview.human;
            $scope.result = $scope.preview.result;
            $scope.ui.visible = false;
          }
        };
      }]
    };

    return Factory;
  }

  angular.module('ngDurationPicker', []).directive('ngDurationPicker', durationPicker);
})();