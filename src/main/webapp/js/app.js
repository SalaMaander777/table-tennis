const HOST = '';

function initNewMatchPage() {
    $('#new-match-form').on('submit', function (e) {
        e.preventDefault();

        var playerOne = $('#playerOne').val().trim();
        var playerTwo = $('#playerTwo').val().trim();
        var format = $('#matchFormat').val();

        var requestData = {
            firstPlayerName: playerOne,
            secondPlayerName: playerTwo,
            matchFormat: format
        };

        $.ajax({
            method: 'POST',
            url: HOST + 'matches',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: function (data) {
                window.location.href = 'match-score.html?uuid=' + data.id;
            },
            error: function (xhr) {
                var message = xhr.responseJSON
                    ? xhr.responseJSON.message
                    : 'An error occurred. Please try again.';
                $('#error-message').text(message).show();
            }
        });
    });
}

function initMatchScorePage() {
    var matchUuid;

    $(function () {
        matchUuid = new URLSearchParams(window.location.search).get('uuid');
        if (!matchUuid) {
            $('#error-message').text('No match ID provided.').show();
            return;
        }

        loadMatch();

        $(document).on('click', '.point-btn', function () {
            var playerName = $(this).data('player-name');
            $.ajax({
                method: 'POST',
                url: HOST + 'matches/' + matchUuid + '/point',
                contentType: 'application/json',
                data: JSON.stringify({name: playerName}),
                success: function (match) {
                    renderMatch(match);
                },
                error: function (xhr) {
                    var message = xhr.responseJSON
                        ? xhr.responseJSON.message
                        : 'An error occurred.';
                    $('#error-message').text(message).show();
                }
            });
        });
    });

    function loadMatch() {
        $.get(HOST + 'matches/' + matchUuid, function (match) {
            renderMatch(match);
        }).fail(function (xhr) {
            var message = xhr.responseJSON
                ? xhr.responseJSON.message
                : 'Failed to load match.';
            $('#error-message').text(message).show();
        });
    }

    function renderMatch(match) {
        renderPlayer('#player1', match.firstPlayer);
        renderPlayer('#player2', match.secondPlayer);

        $('.point-btn').first().data('player-name', match.firstPlayer.name);
        $('.point-btn').last().data('player-name', match.secondPlayer.name);

        if (match.winnerName) {
            $('.point-btn').hide();
            $('#winner-message').show();
            $('#winner-text').text('Winner: ' + match.winnerName);
        } else {
            $('.point-btn').show();
            $('#winner-message').hide();
        }

        $('#error-message').hide();
    }

    function renderPlayer(prefix, player) {
        $(prefix + '-name').text(player.name);
        $(prefix + '-sets').text(player.sets);
        $(prefix + '-games').text(player.games);
        if (player.tieBreakPoints !== null) {
            $(prefix + '-points').text(player.tieBreakPoints);
        } else {
            $(prefix + '-points').text(player.points);
        }
    }
}

function initMatchesPage() {
    var currentFilter = '';
    var totalPages = 1;

    $(function () {
        loadMatches(1);

        $('#filter-form').on('submit', function (e) {
            e.preventDefault();
            currentFilter = $('#filter-input').val().trim();
            loadMatches(1);
        });

        $(document).on('click', '.page-link', function (e) {
            e.preventDefault();
            var page = parseInt($(this).data('page'));
            loadMatches(page);
        });

        $('#prev-page').on('click', function (e) {
            e.preventDefault();
            var currentPage = parseInt($('#pagination').data('current-page'));
            if (currentPage > 1) loadMatches(currentPage - 1);
        });

        $('#next-page').on('click', function (e) {
            e.preventDefault();
            var currentPage = parseInt($('#pagination').data('current-page'));
            if (currentPage < totalPages) loadMatches(currentPage + 1);
        });
    });

    function loadMatches(page) {
        var params = {page: page};
        if (currentFilter) {
            params.player_name = currentFilter;
        }

        $.get(HOST + 'matches', params, function (data) {
            renderMatches(data);
        }).fail(function (xhr) {
            var message = xhr.responseJSON
                ? xhr.responseJSON.message
                : 'Failed to load matches.';
            alert(message);
        });
    }

    function renderMatches(data) {
        var matches = data.matches;
        var currentPage = data.currentPage;
        totalPages = data.totalPages;

        $('#matches-body tr:not(#no-matches-row)').remove();

        if (!matches || matches.length === 0) {
            $('#no-matches-row').show();
            $('#pagination').hide();
            return;
        }

        $('#no-matches-row').hide();

        $.each(matches, function (_, match) {
            var row = '<tr>' +
                '<td>' + escapeHtml(match.firstPlayerName) + '</td>' +
                '<td>' + escapeHtml(match.secondPlayerName) + '</td>' +
                '<td><span class="winner-name-td">' + escapeHtml(match.winnerName) + '</span></td>' +
                '</tr>';
            $('#matches-body').append(row);
        });

        if (totalPages > 1) {
            $('#pagination').show().data('current-page', currentPage);
            renderPagination(currentPage);
        } else {
            $('#pagination').hide();
        }
    }

    function renderPagination(currentPage) {
        var range = 2;
        var start = Math.max(1, currentPage - range);
        var end = Math.min(totalPages, currentPage + range);

        var html = '';
        for (var i = start; i <= end; i++) {
            if (i === currentPage) {
                html += '<a class="num-page current" href="#">' + i + '</a>';
            } else {
                html += '<a class="num-page page-link" href="#" data-page="' + i + '">' + i + '</a>';
            }
        }
        $('#page-numbers').html(html);
    }

    function escapeHtml(str) {
        return $('<span>').text(str).html();
    }
}

$(function () {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });

    if ($('#new-match-form').length) {
        initNewMatchPage();
    }
    if ($('#score-body').length) {
        initMatchScorePage();
    }
    if ($('#matches-body').length) {
        initMatchesPage();
    }
});
