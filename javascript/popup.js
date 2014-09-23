var TB_APP_KEY = '3cc330cd1b37a723326f0973a674a989';

function apiError(data, status, headers, config) {
    console.log("Trello API Error", data, status, headers);
}

function showSettings() {
    // Close popup and open auth tab
    chrome.tabs.create({url: chrome.extension.getURL('settings.html')});
}

function trelloApiUrl(path) {
    return 'https://api.trello.com/1' + path + '?key=' + TB_APP_KEY + '&token=' + localStorage.trello_token;
}

function createLists($http, boardId) {
    $http
        .post(trelloApiUrl('/boards/' + boardId + '/lists/') + '&name=Had Response');
    $http
        .post(trelloApiUrl('/boards/' + boardId + '/lists/') + '&name=Viewed');
    $http
        .post(trelloApiUrl('/boards/' + boardId + '/lists/') + '&name=Viewing Arranged');
    $http
        .post(trelloApiUrl('/boards/' + boardId + '/lists/') + '&name=Messaged');
    $http
        .post(trelloApiUrl('/boards/' + boardId + '/lists/') + '&name=Found')
        .error(apiError)
        .success(function (response) {
            localStorage.trademe_board_found_list = JSON.stringify(response);
        });
}

function createTradeMeBoard($http) {
    $http
        .post(trelloApiUrl('/boards/') + '&name=TradeMe Listings')
        .error(apiError)
        .success(function (response) {
            localStorage.trademe_board = JSON.stringify(response);
            createLists($http, response.id)
        });
}

/**
 * Boards List Angular JS controller
 *
 * @param $scope
 * @param $http
 * @constructor
 */
function BoardsCtl($scope, $http) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        if (!localStorage.trademe_board) {
            createTradeMeBoard($http);
        }

        if (getHostname(tabs[0].url) !== 'www.trademe.co.nz') {
            return;
        }

        var links = JSON.parse(localStorage.trademe_board_links || "[]");
        if (links.indexOf(tabs[0].url) !== -1) {
            $scope.$apply(function () {
                $scope.seen = "true";
            });
            return;
        }

        var listId = JSON.parse(localStorage.trademe_board_found_list).id;
        $http
            .post(trelloApiUrl('/cards/') + '&idList=' + listId + '&due=null&urlSource=' + tabs[0].url)
            .error(apiError)
            .success(function (response) {
                $scope.seen = "false";
                $scope.response = response;
                links.push(tabs[0].url);
                localStorage.trademe_board_links = JSON.stringify(links)
            });
    });
}


// Setup form elements
$click('close', function (ev) {
    ev.stopPropagation();
    window.close();
});

// Logout link
$click('logout', function () {
    clearData();
    showSettings();
});

// Settings link
$click('settings', function () {
    showSettings();
});

// Initialise the extension!
function init() {
    if (!localStorage.trello_token) {
        showSettings();
        return;
    }

    // show the boards list.
    $show('loading_wrapper');
}

$onload(init);
