$(function(){
	'use strict';
		
	var $main = $('#main');
	var settings = {
		tomatoMCount: 0.1,
		restMCount: 0.05
	};
	var defaultTask = {
		"id": -1,
		"title":"task title",
		"status": "open",
		"goaltive":true,
		"tomatoNeed": 0,
		"tomatoInvest": 0,
		"priority": "3",
		"breakTimes":0,
		"comment":"task comment"
	};
	var localStorage = new window.goalist.Store('Goallist');
	var tasks = [];
	var clockSeconds = 10000;
	var intervalId = -1;
	var currentTask = null;
	var inRest = false;
	var goalistTemplate =  doT.template($('#goalist-table-template').html(), undefined, {});
	var STATUS_OPEN = 'open',
		STATUS_PENDING = 'pending',
		STATUS_COMPLETED = 'completed',
		STATUS_DISCARD = 'discard';

	var bindEvents = function() {
		$('body').on('click', '.toggleBtn', function() {
			var id = $(event.target).parents('tr').data('id');
			toggleTaskExecute(id);
		}).on('click', '.discardBtn', function() {
			var id = $(event.target).parents('tr').data('id');
			var task = _.find(tasks, function(data) {
				return data['id'] == id;
			});
			// $tr.addClass('active').find('td:first>span').addClass('glyphicon-remove');
			task.status = STATUS_DISCARD;
			localStorage.save(tasks);
			render(false);
		}).on('click', '.markBtn', function() {
			if(confirm("Are you sure to mark this task as COMPELTED?")) {
				var $tr = $(event.target).parents('tr');
				var id = $tr.data('id');
				var task = _.find(tasks, function(data) {
					return data['id'] == id;
				});
				// $tr.addClass('success').find('td:first>span').addClass('glyphicon-ok');
				task.status = STATUS_COMPLETED;
				localStorage.save(tasks);
				render(false);
			}
		}).on('click', '#main table tr td:last-child', function() {
			var comment = window.prompt('Add comment here:');
			var id = $(event.target).parents('tr').data('id');
			var task = _.find(tasks, function(data) {
				return data['id'] == id;
			});
			task.comment = comment;
			localStorage.save(false);
			render(false);
		}).on('click', '#addBtn', function() {
			var $clock = $('#clock');
			var $title = $('#title');
			var $goaltive = $('#goaltive');
			var $tomatoNeed = $('#tomatoNeed');
			var $priority = $('#priority');
			var newTask = {
				title: $title.val(),	
				goaltive: $goaltive.val(),
				tomatoNeed: parseInt($tomatoNeed.val()),
				priority: parseInt($priority.val())
			};
			var o = $.extend({}, defaultTask, newTask);
			tasks.push(o);
			localStorage.save(tasks);
			render(false);
		});
	};

	var toggleTaskExecute = function(id) {
		currentTask = _.find(tasks, function(data) {
			return data['id'] == id;
		});

		if(currentTask.status == STATUS_OPEN) {
			startTask();
		}
		else if(currentTask.status == STATUS_PENDING) {
			breakTask();
		}
	};

	var startTask = function() {
		resetClock(settings.tomatoMCount);
		currentTask.status = STATUS_PENDING;
		localStorage.save(tasks);	
		intervalId = window.setInterval(subtractSeconds, 1000);
	};

	var resetClock = function(minutes) {
		clockSeconds = minutes * 60;
		upateClockView();
	};

	var subtractSeconds = function() {
		clockSeconds --;
		upateClockView();

		if(clockSeconds == 0 ) {
			window.clearInterval(intervalId);
			if(!inRest) { // worktime over
				currentTask.tomatoInvest ++;
				render(false);
				currentTask.status = (currentTask.tomatoInvest == currentTask.tomatoNeed ? STATUS_COMPLETED : STATUS_OPEN);
				localStorage.save(tasks);
				alert(':) lovely pls rest a while for better profency !');
				resetClock(settings.restMCount);
				intervalId = window.setInterval(subtractSeconds, 1000);
			}
			else {
				resetClock(settings.tomatoMCount);
				alert(':) rest over time to work !');
			}
			inRest = !inRest;
		} 
	};

	var breakTask = function() {
		currentTask.status = STATUS_OPEN;
		currentTask.breakTimes ++;
		localStorage.save(tasks);
		render();
		window.clearInterval(intervalId);
		resetClock(settings.tomatoMCount);
	};

	var upateClockView = function() {
		var minutes = parseInt(clockSeconds / 60);
		var seconds = clockSeconds % 60;
		minutes = (minutes < 10 ? ('0' + minutes) : minutes);
		seconds = (seconds < 10 ? ('0' + seconds) : seconds);
		$clock.html(minutes + ':' + seconds);
	};

	var render = function(needRequest) {
		if(needRequest) {
			// $.getJSON("mock/2014-08-27.json", function(datas) {});
			localStorage.findAll(function(datas) {
				tasks = datas;
				$main.html(goalistTemplate(
					{
						datas: tasks,
					  	status_discard: STATUS_DISCARD,
						status_completed: STATUS_COMPLETED
					}
				));
			});
		}
		else {
			$main.html(goalistTemplate(
				{
					datas: tasks,
				  	status_discard: STATUS_DISCARD,
					status_completed: STATUS_COMPLETED
				}
			));
		}
	};
	
	var init = function() {
		render(true);
		bindEvents();
	};

	init();
});