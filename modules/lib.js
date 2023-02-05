function el(css){
	return document.querySelector(css);
};

function group(css){
	return document.querySelectorAll(css);
};

function create(html){
	return document.createElement(html);
};

function openFullscreen(elem) {
	console.log('fullscreen')
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
};

function closeFullscreen() {

  if ( document.fullscreenElement  ||  
	document.webkitFullscreenElement  ||  
	document.mozFullScreenElement ) {
	 document.exitFullscreen();
	 return;
  }
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
};

export { closeFullscreen, openFullscreen, create, group, el };