'use strict';

(function() {

  angular.module('ngDurationPicker', [])
    .directive('ngDurationPicker', function() {

      const template =
        `<div class="ngdp" style="top: {{pos.top}}px; left: {{pos.left}}px" ng-show="ui.active" ng-class="{open: ui.open, dirty: ui.dirty}">
  <div class="content">

    <div class="top">
      <div class="change">
        <a href="#" class=""> go up </a>
      </div>
      <div class="toggle" ng-click="toggleNav($event)">
        <i class="bar"> </i>
        <i class="bar"> </i>
        <i class="bar"> </i>
      </div>
    </div>
    
    <div class="middle">
      {{category}}
</div>
  </div>
  <div class="navigation">
    <div class="back" style="visibility: {{ui.dirty ? 'visible' : 'hidden'}}">
      <a href="#" ng-click="toggleNav($event)">
        <span class="glyphicon glyphicon-chevron-left"></span>
        <span>go back </span>
      </a>
    </div>
    <h4>Select a category to start </h4>
    <ul class="categories">
      <li class="category" ng-repeat="category in categories">
        <button type="button" class="btn btn-sm" ng-click="setCategory(category)">{{category}}</button>
      </li>
    </ul>
  </div>
</div>`;

      function getPosition(element) {

        const padding = 15;

        let {
          bottom, height, left, right, top, width
        } = element.getBoundingClientRect();

        // TODO check in scroll
        let visibleHeight = document.body.getBoundingClientRect().height;
        let up = top < (visibleHeight / 2);

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

          // TODO change to false to initialize hidden
          scope.active = true;
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

          $scope.ui = {
            active: true,
            open: true,
            dirty: false
          };

          $scope.toggleNav = $event => {
            $scope.ui.open = !$scope.ui.open;
            $event.preventDefault();
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
            $scope.ui.open = false;
            $scope.ui.dirty = true;
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