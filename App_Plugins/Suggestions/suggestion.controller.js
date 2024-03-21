angular.module("umbraco")
    .controller("SuggestionPluginController",
        // Scope object is the main object which is used to pass information from the controller to the view.
        function ($scope) {

            // SuggestionPluginController assigns the suggestions list to the aSuggestions property of the scope
            $scope.aSuggestions = ["You should take a break", "I suggest that you visit the Eiffel Tower", "How about starting a book club today or this week?", "Are you hungry?"];

            // The controller assigns the behavior to scope as defined by the getSuggestion method, which is invoked when the user clicks on the 'Give me Suggestions!' button.
            $scope.getSuggestion = function () {
                debugger;
                // The getSuggestion method reads a random value from an array and provides a Suggestion. 
                $scope.model.value = $scope.aSuggestions[$scope.aSuggestions.length * Math.random() | 0];

            }

        });