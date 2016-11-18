'use strict';

(function() {

  const template =
    `<div class="ngdp" style="top: {{ui.pos.top}}px; left: {{ui.pos.left}}px" 
      ng-class="{'ngdp-visible': ui.visible, 'ngdp-open': ui.open, 'ngdp-dirty': ui.dirty}">

        <div class="ngdp-content">
          <div class="ngdp-top">
            <div class="ngdp-change">
              <a href="#" ng-click="changeCategory(next, $event)" 
                 ng-class="{'text-muted': next.indexOf('limit') !== -1}"> {{next}} </a>
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
              <div class="col-xs-7 text-center">
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
              <a href="#" ng-click="changeCategory(previous, $event)"
                 ng-class="{'text-muted': previous.indexOf('limit') !== -1}"> {{previous}}</a>
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
          <h4>Select a category </h4>
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
      height, width, top, left
    } = element.getBoundingClientRect();

    // Check if the element in which the directive was used
    // it's above the center of the screen
    let visibleHeight = window.innerHeight;
    let up = top > (visibleHeight / 2);

    // Change the top offset to stick the UI to the element
    top = up ? -(padding + ngdpHeight) : (padding + height);

    let middle = left + width / 2;

    let inTheMiddle = middle  > ngdpWidth / 2 && 
                      middle <= document.body.clientWidth - ngdpWidth / 2;

    let rightSide = middle > document.body.clientWidth - ngdpWidth / 2;

    if (inTheMiddle)
      left = width / 2 - ngdpWidth / 2;
    else if (rightSide)
      left = width - ngdpWidth;
    else
      left = 0;

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
        scope.lazy = attrs.hasOwnProperty('lazy');
        angular.element(element).wrap('<div class="ngdp-wrapper"></div>')

        // TODO add handler to hide if clicked outside
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
      controller: ['$scope', '$compile', function($scope, $compile) {

        $scope.ui = {
          visible: false,            // ui is visible
          open: true,                // open navigation
          dirty: false,              // first time selected category
          error: false,              // input is a wrong number
          pos: {top: 0, left: 0},    // position of the directive
          lang: $scope.lang || 'es', // i18n
        };

        $scope.insertPicker = () => {
          let picker = $compile(template)($scope);
          let DOMWrapper = document.getElementsByClassName('ngdp-wrapper');
          angular.element(DOMWrapper).prepend(picker);
        };

        $scope.toggleNav = $event => {
          if ($scope.ui.error) return;
          $scope.ui.open = !$scope.ui.open;
          $event.preventDefault();
        };

        $scope.category = 'minutes';
        $scope.categories = [
          'milliseconds', 'seconds', 'minutes', 'hours',
          'days', 'weeks', 'months', 'years'
        ];
        $scope.log = {};
        $scope.categories.forEach(cat => $scope.log[cat] = 0);
        $scope.preview = {result: 0, human: 'nothing selected yet ...'}

        if (!$scope.output)
          $scope.customOutput = 'minutes';
        else 
          $scope.customOutput = $scope.categories.indexOf($scope.output) === -1 ? 
            'minutes' : $scope.output;

        $scope.changeCategory = (category, $event) => {
          $event && $event.preventDefault();
          if ($scope.ui.error) return;

          if (category.indexOf('limit') !== -1)
            return false;

          $scope.category = category;
          $scope.value = $scope.log[category];
          $scope.ui.open = false;
          $scope.ui.dirty = true;

          let current = $scope.categories.indexOf(category);
          $scope.next = $scope.categories[current + 1] || 'reached limit';
          $scope.previous = $scope.categories[current - 1] || 'reached limit';
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

          if (!$scope.preview.human)
            $scope.preview.human = 'nothing selected yet ...'
          $scope.preview.result = duration.as($scope.customOutput);
        }

        $scope.updateValue = (add, $event) => {
          $event && $event.preventDefault();
          if ($scope.ui.error) return;
          $scope.value = add ? ++$scope.log[$scope.category] :
               $scope.value && --$scope.log[$scope.category];

          $scope.updatePreview();
        };

        $scope.changeInput = () => {
          let val = Number($scope.value);
          if (Number.isNaN(val) || val < 0) {
            $scope.ui.error = true;
            $scope.preview.human = 'wrong input';
            return;
          }

          $scope.ui.error = false;

          $scope.log[$scope.category] = $scope.value;
          $scope.updatePreview();
        };

        $scope.bindToExternalModel = () => {
          if ($scope.ui.error) return;
          $scope.human = $scope.preview.human;
          $scope.result = $scope.preview.result;
          $scope.ui.visible = false;
        };
      }]
    };

    return Factory;
  }

  angular.module('ngDurationPicker', [])
    .directive('ngDurationPicker', durationPicker);

})();