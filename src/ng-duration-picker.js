'use strict';

(function() {

  const template =
    `<div class="ngdp" style="top: {{ui.pos.top}}px; left: {{ui.pos.left}}px" 
      ng-class="{'ngdp-visible': ui.visible, 'ngdp-open': ui.open, 'ngdp-dirty': ui.dirty}">

        <div class="ngdp-content">
          <div class="ngdp-top">
            <div class="ngdp-change">
              <a href="#" ng-click="changeCategory(next, $event)"> {{next}} </a>
            </div>
            <div class="ngdp-toggle" ng-click="toggleNav($event)">
              <i class="ngdp-bar"> </i>
              <i class="ngdp-bar"> </i>
              <i class="ngdp-bar"> </i>
            </div>
          </div>    
          <div class="ngdp-middle">
            <div class="col-xs-12">
              <div class="ngdp-updown col-xs-5 text-center">
                <a href="#" ng-click="updateValue(true, $event)">
                  <span class="glyphicon glyphicon-plus"></span>
                </a>
                <input type="text" class="form-control" ng-model="value" 
                       ng-change="changeInput()" ng-class="{'ngdp-error': ui.error}">
                <a href="#" ng-click="updateValue(false, $event)">
                  <span class="glyphicon glyphicon-minus"></span>
                </a>
              </div>
              <div class="col-xs-7">
                <h4 class="text-muted">{{category}}</h4>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12 text-center">
                <small class="text-muted"> {{preview.human}} </small>
              </div>
            </div>
          </div>
          <div class="ngdp-bottom">
            <div class="ngdp-change">
              <a href="#" ng-click="changeCategory(previous, $event)"> {{previous}}</a>
            </div>
            <div class="ngdp-done" ng-click="bindToExternalModel($event)">
              <span class="ngdp-check"> </span>
            </div>
          </div>
        </div>

        <div class="ngdp-navigation">
          <div class="ngdp-back" style="visibility: {{ui.dirty ? 'visible' : 'hidden'}}">
            <a href="#" ng-click="toggleNav($event)">
              <span class="glyphicon glyphicon-chevron-left"></span>
              <span>go back </span>
            </a>
          </div>
          <h4>Select a category to start </h4>
          <ul class="ngdp-categories">
            <li class="ngdp-category" ng-repeat="category in categories">
              <button type="button" class="btn btn-sm" ng-click="changeCategory(category)">{{category}}</button>
            </li>
          </ul>
        </div>
      </div>`;

  function getPosition(element) {

    const padding = 15;
    const ngdpWidth = 230;
    const ngdpHeight = 200;

    // Gets the current position and size of the element
    // referent to the visible area of the browser
    let {
      height, width, top
    } = element.getBoundingClientRect();

    // Check if the element in which the directive was used
    // it's above the center of the screen
    let visibleHeight = window.innerHeight;
    let up = top > (visibleHeight / 2);

    // Change the top offset to stick the UI to the element
    top = element.offsetTop;

    if (up) {
      top -= padding + ngdpHeight;
    } else {
      top += padding + height;
    }

    let left = element.offsetLeft;
    let middle = left + width / 2;

    let inTheMiddle = middle  > ngdpWidth / 2 && 
                      middle <= document.body.clientWidth - ngdpWidth / 2;

    let rightSide = middle > document.body.clientWidth - ngdpWidth / 2;

    if (inTheMiddle) {
      left = middle - ngdpWidth / 2;
    } else if (rightSide) {
      left = left + width - ngdpWidth;
    }

    return {top, left};
  }

  /* @ngInject */
  function durationPicker() {
    
    const Factory = {
      restrict: 'A',
      scope: {
        result: '=',
        human: '=',
        output: '@',
        lang: '@'
      },
      link(scope, element, attrs) {
        document.body.style.position = 'relative';

        scope.lazy = attrs.hasOwnProperty('lazy');

        // TODO add handler to hide if clicked outside
        // TODO change to false to initialize hidden
        scope.insertPicker();

        function updateUI(ev) {
          scope.$apply(() => {
            if (ev.type === 'click') {
              scope.ui.visible = !scope.ui.visible;
            }

            if (scope.ui.visible) {
              let { top, left } = getPosition(element[0]);
              scope.ui.pos = {top, left};
            }
          });
        }

        angular.element(element).on('click', ev => updateUI(ev) );
        angular.element(window).on('scroll', ev => updateUI(ev) );
      },
      controller($scope, $compile) {

        $scope.ui = {
          visible: false,            // ui is visible
          open: true,                // open navigation
          dirty: false,              // first time selected category
          error: false,              // input is a wrong number
          pos: {top: 0, left: 0},    // position of the directive
          lang: $scope.lang || 'es', // i18n
        };

        $scope.insertPicker = () => {
          var picker = $compile(template)($scope);
          angular.element(document.body).prepend(picker);
        };

        $scope.toggleNav = $event => {
          $scope.ui.open = !$scope.ui.open;
          $event.preventDefault();
        };

        $scope.category = 'minutes';
        $scope.categories = [
          'milliseconds', 'seconds', 'minutes', 'hours',
          'days', 'weeks', 'months', 'years'
        ];
        $scope.log = $scope.preview = {};
        $scope.categories.forEach(cat => $scope.log[cat] = 0);

        $scope.output = $scope.output || 'minutes';

        $scope.changeCategory = (category, $event) => {
          let current;
          $event && $event.preventDefault();
          if (category.indexOf('limit') === -1) {
            $scope.category = category;
            $scope.value = $scope.log[category];
            $scope.ui.open = false;
            $scope.ui.dirty = true;

            current = $scope.categories.indexOf(category);
            $scope.next = $scope.categories[current + 1] || 'reached limit';
            $scope.previous = $scope.categories[current - 1] || 'reached limit';
          }
        };

        $scope.updatePreview = () => {
          function buildString() {
            let customString = [];
            $scope.categories.forEach(category => {
              const value = $scope.log[category];
              if (value){
                if (value === 1) {
                  category = category.substring(0, category.length - 1);
                }
                customString.push(`${value} ${category}`);
              }
            });
            return customString.reverse().join(' ');
          }

          let duration = moment.duration($scope.log);
          $scope.preview.human = $scope.lazy ? 
              duration.humanize() : buildString();
          $scope.preview.result = duration.as($scope.output);
        }

        $scope.updateValue = (add, $event) => {
          $event && $event.preventDefault();
          $scope.value = add ? ++$scope.log[$scope.category] :
               $scope.value && --$scope.log[$scope.category];

          $scope.updatePreview();
        };

        $scope.changeInput = () => {
          let val = Number($scope.value);
          if (Number.isNaN(val) || val < 0) {
            $scope.ui.error = true;
            return;
          }

          $scope.ui.error = false;

          $scope.log[$scope.category] = $scope.value;
          $scope.updatePreview();
        };

        $scope.bindToExternalModel = () => {
          $scope.human = $scope.preview.human;
          $scope.result = $scope.preview.result;
          $scope.ui.visible = false;
        };
      }
    };

    return Factory;
  }

  angular.module('ngDurationPicker', [])
    .directive('ngDurationPicker', durationPicker);

})();