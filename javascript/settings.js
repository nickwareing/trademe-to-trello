function loadHiddenBoards() {
	var hidden = JSON.parse(localStorage.trello_hidden || "[]");
	if(!hidden.length) {
		return [];
	}

	var i, l, board;
	var boards = JSON.parse(localStorage.trello_boards || "[]");
	var hidden_boards = [];

	for(i = 0, l = boards.length; i < l; ++i) {
		board = boards[i];
		if(hidden.indexOf(board.id) > -1) {
			hidden_boards.push(board);
		}
	}

	return hidden_boards;
}

/**
 * Settings Angular JS controller
 *
 * @param $scope
 * @constructor
 */
function SettingsCtl($scope) {
	// Setup close action
	$scope.unhideBoard = function($event, board_id) {
		$event.preventDefault();
		toggleHidden(board_id);
		$scope.hidden_boards = loadHiddenBoards();
	};

	$scope.hidden_boards = loadHiddenBoards();
}

function OptionsCtl($scope) {
	// Save option
	$scope.saveOption = function($event) {
		var $el = $($event.target), option = $el.attr('name'), val;

		// Set the val conditionally if the input is a checkbox
		val = ($el.is(':checkbox') && !$event.target.checked) ? '' : val = $el.val();

		// Update the scope
		$scope[option] = val;

		// Store the result in local storage
		localStorage['trello_options_' + $el.attr('name')] = val;
	};

	// Setup default values
	$.each(['notif_count'], function(_, option) {
		$scope[option] = localStorage['trello_options_' + option];
	});
}

function init() {
	Trello.authorize({
		'name':	"TradeMe to Trello",
        'scope': { read: true, write: true },
		'expiration': "never",
		'success': function() {
			// Close this window and open the popup
			$('#auth').hide();
			$('#success').show();
		},
		'error': function () {
			$('#auth').hide();
			$('#error').show();
		}
	});

	// show the hidden areas
	$('.loading_wrapper').show();
}
$onload(init);
