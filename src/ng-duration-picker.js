'use strict';

(function() {

  angular.module('ngDurationPicker', [])
    .directive('ngDurationPicker', function() {

      const template =
        `<div class="ngdp" style="top: {{pos.top}}px; left: {{pos.left}}px" ng-show="active">
          <div class="top">
            <code>{{value}} & {{category}} </code>
            <code>{{log}}</code>
          </div>
          <div class="middle">
            <button id="increment" ng-click="update(true)"> &uparrow; </button>
            <input type="number" min="0" placeholder="amount"
                   ng-model="value" ng-keypress="change($event)">
            <button id="decrement" ng-click="update(false)"> &downarrow; </button>
          </div>
          <div class="bottom">
            <button ng-click="done()">done</button>
          </div>
          <div class="nav">
            <ul>
              <li ng-repeat="category in categories">
                <button ng-click="setCategory(category)">{{category}}</button>
              </li>
            </ul>
          </div>
        </div>`;

      function getPosition(element) {

        const padding = 15;

        /**
         * Gives the size of the element and his position
         * @see https://javascript.info/tutorial/coordinates
         */
        let {
          bottom, height, left, right, top, width
        } = element.getBoundingClientRect();

        // TODO check in scroll
        let visibleHeight = document.body.getBoundingClientRect().height;
        let up = top < (visibleHeight / 2);

        // Element position plus padding to simulate popover
        top = top + padding;
        if (!up) top += element.clientHeight;

        left = left + width / 2;

        return {top, left, up};
      }

      return {
        restrict: 'A',
        scope: {
          result: '=',
          human: '=',
          output: '@'
        },
        link(scope, element, attrs) {
          document.body.style.position = 'relative';

          scope.lazy = attrs.hasOwnProperty('lazy');

          scope.active = false;
          scope.insertPicker();

          angular.element(element)
            .on('click', ev =>
              scope.$apply(() => {
                scope.active = !scope.active;
                if (scope.active) {
                  let {
                    top, left, up
                  } = getPosition(element[0]);
                  scope.pos = {top, left};
                  scope.up = up;
                }
              })
            );
        },
        controller($scope, $compile) {

          $scope.insertPicker = () => {
            var picker = $compile(template)($scope);
            angular.element(document.body).prepend(picker);
          };

          $scope.value = 0;
          $scope.category = 'minutes';
          $scope.duration = moment.duration();
          $scope.pos = {top: 0, left: 0};
          $scope.categories = [
            'milliseconds', 'seconds', 'minutes', 'hours',
            'days', 'weeks', 'months', 'years'
          ];
          $scope.log = {};
          $scope.categories.forEach(cat => $scope.log[cat] = 0);

          $scope.output = $scope.output || 'minutes';

          $scope.setCategory = category => {
            $scope.category = category;
            $scope.value = $scope.log[category];
          };

          $scope.update = add => {
            // TODO: refactor this
            $scope.value = add ? ++$scope.log[$scope.category] :
            $scope.value && --$scope.log[$scope.category];
          };

          $scope.done = () => {

            function buildString() {
              let customString = [];
              $scope.categories.forEach(category => {
                let value = $scope.log[category];
                if (!value) return;
                if (value === 1)
                  category = category.substring(0, category.length - 1);
                customString.push(`${value} ${category}`);
              });
              return customString.reverse().join(' ');
            }

            let duration = moment.duration($scope.log);
            $scope.human = $scope.lazy ? duration.humanize() : buildString();
            $scope.result = duration.as($scope.output);
          };


        }
      }
    })


})();