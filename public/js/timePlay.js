/* jshint esversion: 6 */
// 当前年月日
function getNowTime(){
	var time = new Date();
	var year = time.getFullYear();
	var month = time.getMonth() + 1;
	var newMonth = month > 9 ? month : "0" + month; 
	var date = time.getDate();
	var newDate = date > 9 ? date : '0' + date; 
	var hour = time.getHours()>9?time.getHours():'0'+time.getHours();
	var min = time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes();
	// 把年月日小时放在数组中返回
	return [year, newMonth, newDate, hour, min];
}

// 前三天   基于当前时间决定其实时间与结束时间
function halfMonth(time) {
	var beforeTime = new Date(time);
	// 之前多少天
	beforeTime.setDate(beforeTime.getDate() -3); 
	var befDate = beforeTime.getDate(); 
	var beforeDate = befDate > 9 ? befDate : '0' + befDate;
	beforeDate = beforeDate + '';
	var month2 = beforeTime.getMonth() + 1;
	var beforeMonth = month2 > 9 ? month2 : "0" + month2; 
	beforeMonth = beforeMonth + '';
	var beforeYear = beforeTime.getFullYear(); 
	beforeYear = beforeYear +'';
	return  Number(beforeYear + beforeMonth + beforeDate);
}

// 后3天
function lastDay(etime) {
	var endTime = new Date(etime);
	if (etime.length !== 19) {
		endTime.setDate(endTime.getDate() + 3);
	} else { 
		endTime.setDate(endTime.getDate() + 0);
	}
	// var endTime = new Date(etime);
	// endTime.setDate(endTime.getDate() + 3);
	var edDate = endTime.getDate();
	var endDate = edDate > 9 ? edDate : '0' + edDate;
	endDate = endDate + '';
	var lastMonth = endTime.getMonth() + 1;
	var endMonth = lastMonth > 9 ? lastMonth : "0" + lastMonth; //月
	endMonth = endMonth + '';
	var endYear = endTime.getFullYear(); //年
	endYear = endYear + '';
	return Number(endYear + endMonth + endDate);
}


function TimePlay(options) {
	var timePlay = this;
	timePlay.default_option = {
		speed: 1000,
		startDate:options.startDate,
		endDate: options.endDate,
		timeUnitControl: true,
		container: '#timePlay',
		onClickChangeEnd: function(timePlay) {},
		onAnimateEnd: function(timePlay) {}
	};
	
	timePlay.options = jQuery.extend(true, timePlay.default_option, options); //基本配置

	timePlay.initDoms(); //初始化结构

	timePlay.timer = null; //动画定时器
	timePlay.translate = 0; //时间轴位移
	timePlay.width = 0; //时间轴长度
	timePlay.timeUnit = '1min';  //单位
	timePlay.timeUnits = '1min';  //单位

	timePlay.left = $(".timeProgress-box").offset().left; //匹配元素相对于文档的左偏移
	timePlay.right = $(window).width() - timePlay.left - $(".timeProgress-box").width(); //timeProgress-box距离浏览器窗口右侧的距离

	timePlay.dis = $('.timeProgress-inner li').outerWidth(); //运动每格长度  
	timePlay.dis_hour = timePlay.dis / 24; //小时单位移动距离   分钟单位移动的距离
	timePlay.dis_min = timePlay.dis / 24 / 60;
	timePlay.curr_x = 0; //临时记录X轴位移
	timePlay.temp_day = {}; //临时记录时间
	timePlay.curr_day = {}; //进度条时间
	timePlay.index_hover = 0; //临时索引
	timePlay.hover = 0; //当前索引
	timePlay.delay = false; //是否延迟
	timePlay.init(); //初始化
}

TimePlay.prototype.init = function () {
	// console.log($('.every').length);
	var timePlay = this;
	timePlay.initDate(); //初始化日期

	$('.timeUnitBtn').on('click', function () { //切换显示单位
		var index = $(this).index();
		console.log(index,'查看切换单位后的index');   //  0 1 2 3
		timePlay.changeTimeUnit(index);
		$(this).siblings('div').removeClass('active'); // 删除其他兄弟元素的样式
		$(this).addClass('active');
		// 获取有active样式的内容
		timePlay.timeUnit = $('.timeUnitBtn.active').text();   // 左侧时间切换
		console.log(timePlay.timeUnit,'点击切换时间');
	});

	$('.timeControl').on('click', function () { //时间轴播放暂停
		timePlay.play();
	});


	$('.timeProgress').on('mouseover', function () {
		timePlay.hoverPopup();
	});
		
	// 时间进度条点击事件
	$('.timeProgress').on('click', function () {
		timePlay.clickPopup();
	});

	$(".next").on('click', function () {
		timePlay.pageNext();
	});

	$(".prev").on('click', function () {
		timePlay.pagePrev();
	});

	$(".backToday").on('click', function () {
		timePlay.stopPlay();
		timePlay.initDate();
	});


	$('#select').change(function () {
		timePlay.play($('#select').val());  // rate
	});
	
};

// 鼠标移入时间轴上事件
TimePlay.prototype.hoverPopup = function() {
	var timePlay = this;
	$(window).on('mousemove', function(event) {
		var e = event || window.event;
		// 鼠标移入显示的，距离浏览器窗口左侧的坐标距离
		var x = e.clientX;
		var day_index = Math.floor((x + timePlay.translate - timePlay.left) / timePlay.dis);
		// console.log(day_index);  //时期和进度条窗格对应的li下标
		timePlay.index_hover = day_index;
		timePlay.temp_day = {
			"year": parseInt($('.every:eq(' + day_index + ')').attr('data-year')),
			"mon": parseInt($('.every:eq(' + day_index + ')').find('.mon').text()),
			"day": parseInt($('.every:eq(' + day_index + ')').find('.day').text()),
			"hour": Math.floor(((x + timePlay.translate - timePlay.left) % timePlay.dis) / (timePlay.dis_hour)),
			"min": Math.floor(((x + timePlay.translate - timePlay.left) % timePlay.dis) / timePlay.dis_min)
		};
		// console.log();
		timePlay.curr_x = x + timePlay.translate - timePlay.left;
		if (timePlay.timeUnit == '24h') {
			var texts = timePlay.temp_day.mon + '月' + timePlay.temp_day.day + '日';
		} else {

			timePlay.temp_day.mon = timePlay.temp_day.mon > 9 ? timePlay.temp_day.mon : '0' + timePlay.temp_day.mon;
			timePlay.temp_day.day = timePlay.temp_day.day > 9 ? timePlay.temp_day.day : '0' + timePlay.temp_day.day;
			timePlay.temp_day.hour = timePlay.temp_day.hour > 9 ? timePlay.temp_day.hour : '0' + timePlay.temp_day.hour;
			timePlay.temp_day.min = timePlay.temp_day.min % 60 > 9 ? timePlay.temp_day.min% 60 : "0" + timePlay.temp_day.min% 60;
			var texts = timePlay.temp_day.mon + '-'+ timePlay.temp_day.day + ' ' + timePlay.temp_day.hour + ":" + timePlay.temp_day.min;
		}
		$(".hover-popup").show().css("left", x - timePlay.left).text(texts);  //  移入时间轴显示内容
	})
	// 当鼠标离开元素时素时，只能触发一次事件
	$('.timeProgress').one('mouseleave', function() {
		$(window).off('mousemove');
		$(".hover-popup").hide();
	})
}

// 时间进度条点击事件
TimePlay.prototype.clickPopup = function () {
	var timePlay = this;
	timePlay.stopPlay(); //点击时停止自动播放
	// 如果左侧选择的是天
	if (timePlay.timeUnit == '24h') {
		var texts = timePlay.temp_day.mon + '月' + timePlay.temp_day.day + '日';
	} else {
		var texts = timePlay.temp_day.hour + ":00";
	}

	$(".curr-popup").hide().text(texts);   // 鼠标点击时间轴时显示的内容
	// 时间进度条上方显示的时间距离浏览器左侧的距离
	$(".curr-popup.for-click").show().css('left', timePlay.curr_x - timePlay.translate);
	// 时间进度条的长度
	$(".timeProgress-bar").stop().css('width', timePlay.curr_x);
	timePlay.width = timePlay.curr_x;
	// 进度条时间
	timePlay.curr_day = timePlay.temp_day;
	// 点击的li对应的索引下标
	timePlay.index = timePlay.index_hover;
	// console.log(timePlay.index,'点击显示的索引下标');
	timePlay.options.onClickChangeEnd();
};

//初始化日期时间 
TimePlay.prototype.initDate = function () {
	var timePlay = this;
	var curr_date = new Date();
	var year = curr_date.getFullYear();
	var month = curr_date.getMonth() + 1;
	var day = curr_date.getDate();
	var hour = curr_date.getHours();
	var min = curr_date.getMinutes();
	let texts =  (month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' ' + (hour>9?hour:'0'+hour) + ':' + (min > 9 ? min : '0' + min);

	$(".curr-popup").hide();
	$(".for-animate").show();
	$(".for-animate").text(texts);
	timePlay.curr_day = {
		"year": year,
		"mon": month,
		"day": day,
		"hour": hour,
		"min": min
	};
	var len = $('.every').length;
	for (var i = 0; i < len; i++) {
		var m = parseInt($('.every:eq(' + i + ') .mon').text());
		var d = parseInt($('.every:eq(' + i + ') .day').text());
		if (month == m && day == d) {
			timePlay.index = i;
			timePlay.width = timePlay.dis * i + timePlay.dis / 24 * (hour) + (timePlay.dis / 24 / 60) *min;
			timePlay.progressAni();
			break;
		}
	}
};
// 初始化dom控件
TimePlay.prototype.initDoms = function () {
	var timePlay = this;
	// #timePlay元素
	$(timePlay.options.container).hide();

	var mainContainer = $('<div id="timeMain"></div>'),
		timeUnitControl =
			'<div class="timeUnit" id="timeWrap"><div class="inner"><div class="timeUnitBtn active">1min</div><div class="timeUnitBtn">5min</div><div class="timeUnitBtn">6min</div><div class="timeUnitBtn">10min</div></div></div>',
		playControl = '<div class="timeControl-box"><div class="timeControl play"></div></div>',
		pageControl =
			'<div class="prev-box"><div class="prev" title="上一周"></div></div><div class="next-box"><div class="next" title="下一周"></div></div><div class="backToday">回到今天</div>',
		timeAxis =
			'<div class="timeProgress-box"><div class="hover-popup"></div><div class="curr-popup for-click">17:00</div><div class="timeProgress-hide"><div class="timeProgress-inner"><div class="timeProgress"><div class="timeProgress-bar"><div class="curr-popup for-animate">17:00</div></div></div><ul></ul></div></div></div>';
	if (timePlay.options.timeUnitControl) {
		$(timePlay.options.container).append(timeUnitControl);
	}
	$(timePlay.options.container).append(mainContainer);
	// 将各个DOM元素添加到页面中	
	mainContainer.append(playControl).append(pageControl).append(timeAxis);
	timePlay.fillDate(timePlay.options.startDate, timePlay.options.endDate);
};
// 初始化dom时间
TimePlay.prototype.fillDate = function (start, end) {
	var timePlay = this;
	
	var startYear = Math.floor(start / 10000);
	var	startMonth = Math.floor((start % 10000) / 100),
		  startDay = Math.floor(start % 100),
		  endYear = Math.floor(end / 10000),
		  endMonth = Math.floor((end % 10000) / 100),
		  endDay = Math.floor(end % 100);
		
	var datelist = 
			`<li class="every" data-year="startYear">
				<span class="mon">${startMonth}</span>
				<span class="lines">/</span>
				<span class="day">${startDay}</span>
				<span class="hour">
					<span class="hourShow">${0}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${1}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${2}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${3}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${4}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${5}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${6}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${7}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${8}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${9}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow doubleHour">${10}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow doubleHour">${11}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow doubleHour">${12}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow doubleHour">${13}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow doubleHour">${14}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow doubleHour">${15}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow doubleHour">${16}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${17}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${18}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${19}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${20}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${21}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${22}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
				<span class="hour">
					<span class="hourShow">${23}</span>
					<span class="minWrap">
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>  
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min"></span>
							<span class="min fiveMin"></span>
					</span>
				</span>
			</li>
  `;
		// ;
	
	var mins = '<span class="minWrap"><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min"></span><span class="min fiveMin"></span></span>'; 

	while ((startDay != endDay) || (startMonth != endMonth) || (startYear != endYear)) {
		startDay++;
		
		if (startDay > timePlay.monthCount(startMonth)) {
			startDay = 1;
			startMonth++;
		}
		if (startMonth > 12) {
			startMonth = 1;
			startYear++;
		}
		// 将所有的li添加到页面中
		datelist += '<li class="every" data-year=' + startYear + '><span class="mon">' + startMonth + '</span><span class="lines">/</span>' + '</span><span class="day">' + startDay + '</span><span class="hour"><span class="hourShow">' + 0 + '</span>' + mins + '</span><span class="hour"><span class="hourShow">' + 1 +'</span>' + mins +  '</span><span class="hour"><span class="hourShow">' + 2 + '</span>' + mins +'</span><span class="hour"><span class="hourShow">' + 3 + '</span>' + mins +'</span><span class="hour"><span class="hourShow">' + 4 + '</span>' + mins +'</span><span class="hour"><span class="hourShow">' + 5 + '</span>' + mins +'</span><span class="hour"><span class="hourShow">' + 6 + '</span>' + mins +'</span><span class="hour"><span class="hourShow">' + 7 +'</span>' + mins + '</span><span class="hour"><span class="hourShow">' + 8 + '</span>' + mins +'</span><span class="hour"><span class="hourShow">' + 9 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 10 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 11 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 12 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 13 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 14 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 15 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 16 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 17 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 18 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 19 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 20 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 21 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 22 + '</span>' + mins +'</span><span class="hour"><span class="hourShow doubleHour">' + 23 + '</span>' + mins +'</span></li>';
	
	}
	$(timePlay.options.container).show().find('ul').append(datelist);
};

// 计算闰年事件
TimePlay.prototype.calcLeapYear = function (year) {
	var leap = false;
	if ((year % 4) == 0 && (year % 100) == 0) {
		if ((year % 400) == 0) {
			leap = true;
		} else {
			leap = false;
		}
	} else if ((year % 4) == 0 && (year % 100) != 0) {
		leap = true;
	} else if ((year % 4) != 0 && (year % 100) != 0) {
		leap = false;
	} else {
		leap = false;
	}
	return leap;
};

// 计算月数事件 判断月份应该有多少天
TimePlay.prototype.monthCount = function (month) {
	var timePlay = this;
	var num = 0;
	if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
		num = 31;
	} else if (month == 4 || month == 6 || month == 9 || month == 11) {
		num = 30;
	} else if (month == 2) {
		if (timePlay.calcLeapYear()) {
			num = 29;
		} else {
			num = 28;
		}
	}
	return num;
};

// 进度条动画事件
TimePlay.prototype.progressAni = function () { //进度条动画
	var timePlay = this,
		page_width = $('.timeProgress-box').width(), // 进度条可以在页面上显示的宽度  1399px
		con_width = $('.timeProgress-inner').width(), // 进度条总宽度   隐藏的 + 未显示的 + 页面可显示的
		page_num = Math.floor(timePlay.width / page_width), // 进度条走的长度/进度条可以在页面上显示的宽度   page_num： 已经走过的进度条宽度占据的页数(向下取整不包含本页显示的进度条)
		left_dis = page_num * page_width;  // 左侧被隐藏的已经走完的进度条占据的宽度


	if ((page_width + left_dis - timePlay.width) < timePlay.dis) { // timePlay.dis: 7200px   点击时才会执行  (page_width + left_dis - timePlay.width) < timePlay.dis
		left_dis = left_dis + (page_width / 2); // 让当前用户点击的显示日期显示在页面中央 
		page_num = page_num + 0.5; // 此时page_num 应该为原先隐藏的加上更改后的页数(以后用不到)
	}

	// 当进度条走到最后一个显示页面时
	if (left_dis + page_width > con_width) {   // 如果是最后一页点击最后一个li是,按前面代码走，那么页面上显示的后半截日期应该是空,所以此处应该阻止进度条移动到页面中央
		left_dis = $('.timeProgress-inner').width() - page_width; // 6240px - 1560px
		$(".prev").addClass('disable'); //下一页按钮阻止点击
	}

	if ((timePlay.width - left_dis) < 300) { // 如果用户点击的是当前页面的第一个li,那么让点击的li显示到页面中央
		left_dis = left_dis - (page_width / 2);     //  从隐藏的时间进度条中拿出一半显示在页面上
	}

	timePlay.translate = left_dis;
	$('.timeProgress-inner').css({
		'transform': "translateX(-" + left_dis + "px)"
	});

	// 已经运行的时间轴  控制运动的时间与运动效果
	$('.timeProgress-bar').animate({
		width: timePlay.width,
	}, 10, 'swing');
};

// 改变时间单位事件
TimePlay.prototype.changeTimeUnit = function (num) {
	var timePlay = this;
	// console.log($('.timeUnitBtn:eq(' + num + ')'), '审查'); // 点击的元素
	if (!$('.timeUnitBtn:eq(' + num + ')').hasClass('active')) {
		$('.timeUnitBtn:eq(' + num + ')').siblings('.timeUnitBtn').removeClass('active');
		$('.timeUnitBtn:eq(' + num + ')').addClass('active');
		timePlay.timeUnit = $('.timeUnitBtn:eq(' + num + ')').text();

		// ★★★★★★  到时候在用户选择不同资料时,自动给timePlay.timeUnit赋值(5min 6min 10min 30min)

	}
	if (timePlay.timeUnit == '24h') {
		var texts = timePlay.curr_day.mon + '月' + timePlay.curr_day.day + '日';
	} else {
		// var texts = timePlay.curr_day.hour + ":00";
		var month = Number(timePlay.curr_day.mon),
			day = Number(timePlay.curr_day.day),
			hour = Number(timePlay.curr_day.hour),
			min = Number(timePlay.curr_day.min);
		var texts =  (month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' ' + (hour>9?hour:'0'+hour) + ':' + (min > 9 ? min : '0' + min);
	}
	$(".curr-popup").text(texts);
	timePlay.stopPlay();
};


// 控制暂停与播放
TimePlay.prototype.play = function (rate) {
	var timePlay = this;
	if ($('.timeControl').hasClass('play')) {   //  如果按钮显示的是暂停状态
		var rate = $('#select').val();  // 获取选择器选中的值
		timePlay.startPlay(rate);
	} else {
		timePlay.stopPlay();
	}
};

//   开始运动事件
TimePlay.prototype.startPlay = function (rate) {
	var timePlay = this;
	$('.timeControl').toggleClass('play').toggleClass('pause');
	$(".curr-popup").hide();
	$(".curr-popup.for-animate").show();
	timePlay.progressAni();
	timePlay.timer = setInterval(function () {
		// 时间无误   现在的网络时间
		var temp_date = timePlay.curr_day;
		// 如果进度条走到最后
		if (timePlay.reachEnd()) {
			timePlay.halfPageNext();
		}
		if (timePlay.timeUnit == "1min") { // 当选择的是1h时
			var real_width = Math.floor(timePlay.width / timePlay.dis_min) * timePlay.dis_min; 
			//  timePlay.width: 时间轴已运行的总长度
			timePlay.width = real_width + (Number(timePlay.dis_min)); // 每当经过1min,时间进度条长度就 +5px
		
			if (timePlay.width > real_width) { //判断语句一定要加，不然会出现问题：时间先走1in,进度条不动，再走1min，进度条移动5px(可能)
				timePlay.curr_day.min = Number(timePlay.curr_day.min) + 1;
				if(timePlay.curr_day.min > 59){
					timePlay.curr_day.min = 0;
					timePlay.curr_day.hour = Number(timePlay.curr_day.hour) + 1;
				
				}
			}
			
			if (Number(timePlay.curr_day.hour) >= 24) { // 每当时间为24：00时
				timePlay.index++;
				timePlay.curr_day = {
					"year": parseInt($('.every:eq(' + timePlay.index + ')').attr('data-year')),
					"mon": parseInt($('.every:eq(' + timePlay.index + ')').find('.mon').text()),
					"day": parseInt($('.every:eq(' + timePlay.index + ')').find('.day').text()),
					"hour": 0,
					"min": 0
				}
			}

			let month = Number(timePlay.curr_day.mon),
					day = Number(timePlay.curr_day.day),
					hour = Number(timePlay.curr_day.hour),
					min = Number(timePlay.curr_day.min);
			let texts =  (month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' ' + (hour>9?hour:'0'+hour) + ':' + (min > 9 ? min : '0' + min);


			$(".curr-popup").text(texts);

			if (timePlay.curr_day.hour > 24) {
				$(".curr-popup").text((month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' '  + "00" + ":00");
			}

		} else if (timePlay.timeUnit == "5min") {
			// timePlay.index++;
			// var real_width = Math.floor(timePlay.width / timePlay.dis) * timePlay.dis;
			var real_width = Math.floor(timePlay.width / timePlay.dis_min) * timePlay.dis_min; 

			timePlay.width = real_width + (timePlay.dis_min) * 5; // 每当经过5min,时间进度条长度就 +25px

			if (timePlay.width > real_width) { //判断语句一定要加，不然会出现问题：时间先走1小时,进度条不动，再走一小时，进度条移动26px(可能)
				timePlay.curr_day.min = Number(timePlay.curr_day.min) + 5;
				if(timePlay.curr_day.min > 59){
					timePlay.curr_day.min = (Number(timePlay.curr_day.min)-60);
					timePlay.curr_day.hour = Number(timePlay.curr_day.hour) + 1;
				}
			}

			if (Number(timePlay.curr_day.hour) >= 24) { // 每当时间为24：00时
				timePlay.index++;
				timePlay.curr_day = {
					"year": parseInt($('.every:eq(' + timePlay.index + ')').attr('data-year')),
					"mon": parseInt($('.every:eq(' + timePlay.index + ')').find('.mon').text()),
					"day": parseInt($('.every:eq(' + timePlay.index + ')').find('.day').text()),
					"hour": 0,
					"min": 0
				};
				timePlay.width = timePlay.index * timePlay.dis;
			}

			let month = Number(timePlay.curr_day.mon),
					day = Number(timePlay.curr_day.day),
					hour = Number(timePlay.curr_day.hour),
					min = Number(timePlay.curr_day.min);
			let texts =  (month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' ' + (hour>9?hour:'0'+hour) + ':' + (min > 9 ? min : '0' + min);


			$(".curr-popup").text(texts);
			
			if (timePlay.curr_day.hour > 24) {
				$(".curr-popup").text((month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' '  + "00" + ":00");
			}


		} else if (timePlay.timeUnit == "6min") {
			var real_width = Math.floor(timePlay.width / timePlay.dis_min) * timePlay.dis_min; 

			timePlay.width = real_width + (timePlay.dis_min) * 6; // 每当经过5min,时间进度条长度就 +30px

			if (timePlay.width > real_width) { //判断语句一定要加，不然会出现问题：时间先走1小时,进度条不动，再走一小时，进度条移动26px(可能)
				timePlay.curr_day.min = Number(timePlay.curr_day.min) + 6;
				if(timePlay.curr_day.min > 59){
					timePlay.curr_day.min = (Number(timePlay.curr_day.min)-60);
					timePlay.curr_day.hour = Number(timePlay.curr_day.hour) + 1;
					console.log(timePlay.curr_day.hour, '5min时查看经过59min时的小时');
					
				}
			}

			if (Number(timePlay.curr_day.hour) >= 24) { // 每当时间为24：00时
				timePlay.index++;
				timePlay.curr_day = {
					"year": parseInt($('.every:eq(' + timePlay.index + ')').attr('data-year')),
					"mon": parseInt($('.every:eq(' + timePlay.index + ')').find('.mon').text()),
					"day": parseInt($('.every:eq(' + timePlay.index + ')').find('.day').text()),
					"hour": 0,
					"min": 0
				};
				timePlay.width = timePlay.index * timePlay.dis;
			}

			let month = Number(timePlay.curr_day.mon),
					day = Number(timePlay.curr_day.day),
					hour = Number(timePlay.curr_day.hour),
					min = Number(timePlay.curr_day.min);
			let texts =  (month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' ' + (hour>9?hour:'0'+hour) + ':' + (min > 9 ? min : '0' + min);


			$(".curr-popup").text(texts);
			
			if (timePlay.curr_day.hour > 24) {
				$(".curr-popup").text((month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' '  + "00" + ":00");
			}
		} else { // 用户选择10min
			var real_width = Math.floor(timePlay.width / timePlay.dis_min) * timePlay.dis_min; 

			timePlay.width = real_width + (timePlay.dis_min) * 10; // 每当经过5min,时间进度条长度就 +25px

			if (timePlay.width > real_width) { //判断语句一定要加，不然会出现问题：时间先走1小时,进度条不动，再走一小时，进度条移动26px(可能)
				timePlay.curr_day.min = Number(timePlay.curr_day.min) + 10;
				if(timePlay.curr_day.min > 59){
					timePlay.curr_day.min = (Number(timePlay.curr_day.min)-60);
					timePlay.curr_day.hour = Number(timePlay.curr_day.hour) + 1;
					console.log(timePlay.curr_day.hour, '5min时查看经过59min时的小时');
					
				}
			}

			if (Number(timePlay.curr_day.hour) >= 24) { // 每当时间为24：00时
				timePlay.index++;
				timePlay.curr_day = {
					"year": parseInt($('.every:eq(' + timePlay.index + ')').attr('data-year')),
					"mon": parseInt($('.every:eq(' + timePlay.index + ')').find('.mon').text()),
					"day": parseInt($('.every:eq(' + timePlay.index + ')').find('.day').text()),
					"hour": 0,
					"min": 0
				};
				timePlay.width = timePlay.index * timePlay.dis;
			}

			let month = Number(timePlay.curr_day.mon),
					day = Number(timePlay.curr_day.day),
					hour = Number(timePlay.curr_day.hour),
					min = Number(timePlay.curr_day.min);
			let texts =  (month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' ' + (hour>9?hour:'0'+hour) + ':' + (min > 9 ? min : '0' + min);


			$(".curr-popup").text(texts);
			
			if (timePlay.curr_day.hour > 24) {
				$(".curr-popup").text((month>9?month:'0'+month) + '-' + (day>9?day:'0'+day) + ' '  + "00" + ":00");
			}
		}
		// 当已经运行过的时间进度条长度大于等于总的进度条长度时   con_width=$('.timeProgress-inner').width()
		if (timePlay.width >= $('.timeProgress').width()) {
			timePlay.width = $('.timeProgress').width();
			timePlay.curr_day = temp_date;
			timePlay.stopPlay();
		}
		$(".timeProgress-bar").css({
			'width': timePlay.width
		});
		timePlay.options.onAnimateEnd();
	}, rate);
};
// 停止运动
TimePlay.prototype.stopPlay = function () {
	var timePlay = this;
	if ($('.timeControl').hasClass('pause')) {
		$('.timeControl').toggleClass('play').toggleClass('pause');
	}
	clearInterval(timePlay.timer);
};
// 进度条到达终点事件
TimePlay.prototype.reachEnd = function () {
	var timePlay = this;
	// $('.timeProgress-box').width(): 1560px
	// dis_right：右侧剩余未走的时间轴长度
	var dis_right = $('.timeProgress-box').width() - (timePlay.width - timePlay.translate);
	// console.log(dis_right,'抵达终点宽度');
	if (dis_right <= 180) {
		return true;
	} else {
		return false;
	}
};
// 点击下一页,移动半页或者一页
TimePlay.prototype.halfPageNext = function() {
	$(".curr-popup").hide();
	$(".curr-popup.for-animate").show();
	$(".prev").removeClass('disable');
	var timePlay = this,
		page_width = $('.timeProgress-box').width(), // 1560px
		con_width = $('.timeProgress-inner').width(); // 6240px 时间轴总长度
	timePlay.translate += ($('.timeProgress-box').width() / 2);
	if (timePlay.translate + page_width > con_width + 35) {
		timePlay.translate = $('.timeProgress-inner').width() - page_width + 35;
		$(".next").addClass('disable');
	}
	$('.timeProgress-inner').css({
		'transform': "translateX(-" + timePlay.translate + "px)"
	});
}
// 点击下一页   .timeProgress-box  存放时间轴和日期的容器
TimePlay.prototype.pageNext = function() {
	$(".curr-popup").hide();
	$(".curr-popup.for-animate").show();
	$(".prev").removeClass('disable');
	var timePlay = this,
		page_width = $('.timeProgress-box').width(), // 1560px
		con_width = $('.timeProgress-inner').width(); // 6240px
	timePlay.translate += $('.timeProgress-box').width();
	if (timePlay.translate + page_width > con_width + 35) {
		timePlay.translate = $('.timeProgress-inner').width() - page_width + 35;
		$(".next").addClass('disable');
	}
	$('.timeProgress-inner').css({
		'transform': "translateX(-" + timePlay.translate + "px)"
	});
}
// 点击前一页
TimePlay.prototype.pagePrev = function() {
	$(".next").removeClass('disable');
	$(".curr-popup").hide();
	$(".curr-popup.for-animate").show();
	var timePlay = this;
	timePlay.translate -= $('.timeProgress-box').width();
	if (timePlay.translate < 0) {
		timePlay.translate = 0;
		$(".prev").addClass('disable');
	}
	$('.timeProgress-inner').css({
		'transform': "translateX(-" + timePlay.translate + "px)"
	});
}
