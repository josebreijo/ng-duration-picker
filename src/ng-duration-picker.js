'use strict';

(function() {

  console.log('here');

  angular.module('ngDurationPicker', [])
    .directive('ngDurationPicker', function() {

      let template =
        `<div class="ngdp" ng-style="pos" ng-show="active">
          la mierda !!! 
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
        scope: {},
        link(scope, element, attrs) {
          // used to position absolute near the element
          document.body.style.position = 'relative';

          scope.active = false;
          scope.insertPicker();

          angular.element(element)
            .on('click', ev =>
              scope.$apply(() => {
                scope.active = !scope.active;

                if (scope.active) {
                  let {top, left, up} = getPosition(element[0]);
                  scope.pos = {top, left};
                  console.log(scope.pos);
                  scope.up = up;
                }
              })
            );

        },
        controller($scope, $compile) {

          $scope.pos = {top: 0, left: 0};

          $scope.insertPicker = () => {
            var picker = $compile(template)($scope);
            angular.element(document.body).prepend(picker);
          }
        }
      }
    })


})();