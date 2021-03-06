recipeBook.controller('recipesCtrl', ['$scope', '$state', '$window', 'Restangular', 'Auth', 'recipe', 'ModalService', function($scope, $state, $window, Restangular,  Auth, recipe, ModalService){

  $scope.recipe = recipe;
  $scope.scraperActive = false;


  Auth.currentUser().then( function(user) {
    $scope.currentUser = user;
    $scope.owner = $scope.checkOwner(user);
  })
/* need interceptor! */


  $scope.checkOwner = function(user) {
    return $scope.recipe.user_id === user.id;
  };


  $scope.toggleScraper = function() {
    $scope.scraperActive = !$scope.scraperActive;
  };


  $scope.submitScrape = function() {
    if ($scope.owner) {
      Restangular.one('recipes', $scope.recipe.id).patch($scope.scraper)
        .then(function(response){
          $scope.recipe = response;
          $scope.scraperActive = false;
          $scope.scraper.url = "";
      });
    }
  };


  $scope.updateRecipe = function() {
    if ($scope.owner) {
      var recipeNested = {};
      recipeNested['recipe'] = $scope.recipe;
      recipeNested['recipe']['ingredients_attributes'] = $scope.recipe.ingredients;
      recipeNested['recipe']['instructions_attributes'] = $scope.recipe.instructions;

      Restangular.one('recipes', $scope.recipe.id).patch(recipeNested);
    }
  };


  $scope.deleteRecipe = function() {
    if ($scope.owner && $window.confirm("Delete this recipe?")) {
      Restangular.one('recipes', $scope.recipe.id).remove()
        .then( function() {
          $state.go('users.show', {userId: $scope.currentUser.id});
        });
    }
  };


  $scope.printRecipe = function() {
    var printWindow = $window.open('/api/v1/recipes/'+$scope.recipe.id+'.pdf');
    printWindow.print();
  };


  $scope.copyRecipe = function() {
    Restangular.all('recipes').post($scope.recipe)
      .then( function(response) {
        $state.go('recipes.show', {id: response.id});
      })
  };


  $scope.addComponent = function(className) {
    Restangular.one('recipes', $scope.recipe.id).all(className).post()
      .then( function(response) {
        $scope.recipe[className].push(response);
      });
  };


  $scope.showAddNote = function(notable) {
    $scope.hovered = notable;
  };


  $scope.notesEmpty = function(notable) {
    return (notable.notes == undefined || notable.notes.length == 0);
  };

  $scope.isHovered = function(notable) {
    return (notable == $scope.hovered);
  };


  $scope.hideAddNotes = function() {
    $scope.hovered = {};
  }


  $scope.noteCount = function(notable) {
    var count = notable.notes.length;
    var text = "notes"
    if (count == 1) {
      var text = "note"
    };
    return count + " " + text;
  };


  $scope.shareRecipe = function() {
    ModalService.showModal({
      templateUrl: "templates/recipes/shareModal.html",
      controller: "ShareModalController",
      inputs: {
        recipe: $scope.recipe
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        //console.log(result);
      });
    });
  };


  $scope.openModal = function(notable, type) {
    ModalService.showModal({
      templateUrl: "templates/recipes/notesModal.html",
      controller: "NotesModalController",
      inputs: {
        notable: notable,
        notable_type: type,
        owner: $scope.owner
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        //console.log(result);
      });
    });
  };


}]);
