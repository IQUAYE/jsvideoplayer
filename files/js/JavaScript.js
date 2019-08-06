function runPlayer() {

	barSize 		= 720;
	volumeBarSize 	= 100;
	videoList 		= new Array();
	currentTrack	= 0;

	player 			= document.getElementById("myMovie");
	playerBtn 		= document.getElementById("playButton");
	fullscreenBtn 	= document.getElementById("fullscreenButton");
	nextButton 		= document.getElementById("nextButton");
	prevButton 		= document.getElementById("previousButton");
	loopButton		= document.getElementById("loopButton");

	bar 			= document.getElementById("defaultbar");
	disc 			= document.getElementById("disc");
	progressbar 	= document.getElementById("progressbar");

	volumeBar 		= document.getElementById("volume_bar");
	volumeDisc 		= document.getElementById("volume_slider");

	leftTimer 		= document.getElementById("leftDash");
	rightTimer		= document.getElementById("rightDash");

	document.addEventListener("keydown", getSpacebarAction, false);
	player.addEventListener("seeking", movieTimeUpdate, false);
	player.addEventListener("seeking", movieTimeUpdate, false);
	player.addEventListener("play", function(){updatePauseOrPlayUI(true);}, false);
	player.addEventListener("pause", function(){updatePauseOrPlayUI(false);}, false);
	player.addEventListener("volumechange", volumeUpdate, false);
	player.addEventListener("ended", movieEnded, false);
	

	playerBtn.addEventListener('click', playOrPauseMovie, false);
	nextButton.addEventListener('click', function(){playTrack(1)}, false);
	prevButton.addEventListener('click', function(){playTrack(-1)}, false);
	fullscreenButton.addEventListener('click', goScreens, false);
	loopButton.addEventListener('click', loopMovie, false);
	rightTimer.innerHTML = getTimeString(player.duration);

	const propsMovieSeekBar =  {
		xAxis: true,
		xBoundaryElement: bar,
		ondrop: function() {  },
		ondrag: function() { movieTimeUpdate(this, event) },
		onstart: function() { movieTimeUpdate(this, event); }
	};

	const propsVolumeSeekBar = {
		xAxis: true,
		xBoundaryElement : volumeBar,
		ondrop: function() {  },
		ondrag: function() { volumeUpdate(this, event); },
		onstart: function() { volumeUpdate(this, event); }
	};

	Draggable.draggify(disc, propsMovieSeekBar);
	Draggable.draggify(volumeDisc, propsVolumeSeekBar);
	volumeUpdate();
	initTracks();
}

function displayDisc(){
	disc.style.display = "inline-block";
}

function hideDisc(){
	disc.style.display = "none";
}

function goScreens(){
	if (!player.ended) {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		}
		player.requestFullscreen();
	}
}

function loopMovie(){
	player.loop = !player.loop;
	loopButton.firstChild.className = (player.loop)? "entypo-cancel-circled" : "entypo-loop";
}


function getSpacebarAction(e){
    if ((/button|a/i.test(e.target.tagName))) return;
    switch(e.which){
    	case 32:
    		e.preventDefault();
	    	playOrPauseMovie();
	    	break;
	    case 37:
	    	e.preventDefault();
	    	movieFastSeeker(-1);
	    	break;
	    case 39:
	    	e.preventDefault();
	    	movieFastSeeker(1);
	    	break;
	    case 78:
	    	e.preventDefault();
	    	playTrack(1);
	    	break;
	    case 80:
	    	e.preventDefault();
	    	playTrack(-1);
	    	break;
	    default:
	    	return;
    }
}

function playOrPauseMovie() {
	if(!player.paused && !player.ended)
		player.pause();
	else player.play();
}

function updatePauseOrPlayUI(shouldShowPlay){
	playerBtn.firstChild.className = shouldShowPlay? "entypo-pause" : "entypo-play";
	if(shouldShowPlay)
		updateBar = setInterval(movieTimeUpdate, 500);
	else window.clearInterval(updateBar);
}

function movieTimeUpdate(el, e){
	if(!player.ended){
		var size;
		if (el && e){
			size = e.pageX - bar.offsetLeft;
			var newTime = size * player.duration/ barSize;
			player.currentTime = newTime;
			if (e.target.id=="defaultbar" || e.target.id=="progressbar") {
				disc.style.left = (size - 8 > barSize)? barSize : (size - 8 < -8? - 8 : size - 8) +  'px';
			}
			progressbar.style.width = size + 'px';
		}
		else{
			size = parseInt(player.currentTime * barSize/player.duration);
			progressbar.style.width = size + 'px';
			size = (size - 8 > barSize)? barSize : (size - 8 < -8? - 8 : size - 8);
			disc.style.left = size +  'px';
		}
		leftTimer.innerHTML = getTimeString(player.currentTime);
		rightTimer.innerHTML = getTimeString(player.duration - player.currentTime);
	}
	else{
		progressbar.style.width = '0px';
		disc.style.left = '-8px';
		playerBtn.firstChild.className = "entypo-play";
		//window.clearInterval(updateBar);
	}
}


function volumeUpdate(el, e){
	var size;
	if(el && e){
		size = e.pageX - volumeBar.offsetLeft;
		var newVolume = size * 1/volumeBarSize;
		player.volume = (newVolume < 0? 0 : (newVolume > 1? 1: newVolume));
		player.muted = false;
		if (e.target.id=="volume_bar") {
			volumeDisc.style.left = ((size - 5) > volumeBarSize)? volumeBarSize : ((size - 5) < 0? 0 : size - 5) + 'px';
		}
	}
	else{
		size = parseInt(player.volume * volumeBarSize/1);
		size = ((size - 5) > volumeBarSize)? volumeBarSize : ((size - 5) < 0? 0 : size - 5);
		volumeDisc.style.left = size + 'px';
	}
	
	if (player.volume == 0 || player.muted) {
		document.getElementById("volume_icon").className = "entypo-mute";
	}
	else document.getElementById("volume_icon").className = "entypo-sound";
}

function getTimeString(time){
	var seconds = time * 1; //change time value to numeric by identity multiplication

	var hours 	= Math.floor(seconds / 3600);
	seconds -= hours * 3600;

	var minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	seconds = Math.round(seconds);

	var message	= "";
	hours = minutes == 60? hours + 1 : hours; //correct display of number "60" in minutes
	if (hours > 0)
		message += (hours > 9? hours : "0" + hours) + ":";
	//else message += "00:"

	minutes = seconds == 60? minutes + 1 : minutes; //correct display of number "60" in seconds
	if(minutes > 0)
		message += (minutes > 9? (minutes==60? "00" : minutes) : "0" + minutes)  + ":";
	else message += "00:";


	if (seconds > 0)
		message += (seconds > 9? (seconds==60? "00" : seconds) : "0" + seconds);
	else message += "00";

	return message;
}

function initTracks(){
	if(player.childNodes.length > 0){
		player.childNodes.forEach(function(node){
			if(node.nodeName==="SOURCE")
				videoList.push(node.src);
		});
	}

	if(!videoList.includes(player.currentSrc)){
		videoList.push(player.currentSrc);
	}

	currentTrack = videoList.indexOf(player.currentSrc)
}

function playTrack(dir){
	if (videoList.length > 1) {
		currentTrack = (dir == 1)? (currentTrack == videoList.length - 1? 0 : currentTrack + 1): (currentTrack == 0?videoList.length - 1: currentTrack - 1);
		player.src = videoList[currentTrack];
		player.play();
	}
}

function movieEnded(e){
	playTrack(1);
}

function movieFastSeeker(dir){
	if (!player.ended) {
		player.currentTime = (dir == 1)? (player.currentTime + 10 > player.duration? player.duration : player.currentTime + 10) :(player.currentTime - 10 < 0? 0 : player.currentTime - 10); 
	}
}