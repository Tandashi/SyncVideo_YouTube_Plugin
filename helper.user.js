// ==UserScript==
// @name        YouTube Sync-Video Extension
// @namespace   https://tandashi.de
// @author      Tandashi
// @version     0.5
// @description This userscript assists sync-video from Youtube.
// @match       *://www.youtube.com/*
// @match       *://youtube.com/*
// @match       *://www.sync-video.com/r/*
// @match       *://sync-video.com/r/*

// @icon        http://www.genyoutube.net/helper/favicon.png
// @icon64      http://www.genyoutube.net/helper/favicon.png
// @homepage    https://tandashi.de/
// @downloadURL https://github.com/Tandashi/SyncVideo_YouTube_Plugin/raw/master/helper.user.js
// @updateURL   https://github.com/Tandashi/SyncVideo_YouTube_Plugin/raw/master/helper.user.js

// @run-at      document-end
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// ==/UserScript==

// ==Config==
const showAt = {
	'home': true,
	'watch': true,
	'results': true
}

const roomId = ""; // Leave empty if it should be randomly generated
const randomRoomIdLength = 5; // The length of the random generated id of 'roomId' is empty
// ==/Config==

const buttonStyles = {
  'home' : {
    'width': '50%',
    'background-color': '#b27900',
    'color': 'white',
    'text-align': 'center',
    'padding': '1px 4px 1px 4px',
    'margin': '10px 10px 10px 0px',
    'font-size': '14px',
    'border': '0',
    'cursor': 'pointer',
    'border-radius': '2px',
    'font-family': 'Roboto, Arial, sans-serif',
    'text-decoration': 'none'
	},
	'watch' : {
		'width': '100%',
    'background-color': '#b27900',
    'color': 'white',
    'text-align': 'center',
    'padding': '3px 6px 3px 6px',
    'margin': '10px 10px 10px 0px',
    'font-size': '14px',
    'border': '0',
    'cursor': 'pointer',
    'border-radius': '2px',
    'font-family': 'Roboto, Arial, sans-serif',
    'text-decoration': 'none'
	},
	'results' : {
    'width': '50%',
    'background-color': '#b27900',
    'color': 'white',
    'text-align': 'center',
    'padding': '1px 4px 1px 4px',
    'margin': '10px 10px 10px 0px',
    'font-size': '14px',
    'border': '0',
    'cursor': 'pointer',
    'border-radius': '2px',
    'font-family': 'Roboto, Arial, sans-serif',
    'text-decoration': 'none'
	},
}

const intervals = {};
const STORAGE_VALUE = 'syncyt';

window.onload = () => {
	var oldLocation = undefined;

	// Set an Interval to check if the path location has changed
	// The only way I found to determin if something changed
	// e.g. If the user clicked on a Video or something like that
	// since the window will not be loaded again. The hasChanged Listener
	// also did'nt work for me
	intervals.main = setInterval(() => {
		if(oldLocation === window.location.pathname)
			return false;

		// Check which site we are on
		switch(window.location.hostname) {
			case 'www.youtube.com':
			case 'youtube.com':
				injectYoutTube();
				break;

			case 'www.sync-video.com':
			case 'sync-video.com':
				injectSyncVideo();
				break;
		}

		oldLocation = window.location.pathname;
	}, 100);
}

/**
 * Inject SyncVideo Buttons to YouTube.
 * Will automatically determin which inject-Methods should be called.
 * You do not need to call any other inject Methods
 */
function injectYoutTube() {
	if(intervals.grid !== undefined) {
		clearInterval(intervals.grid);
		delete intervals.grid;
	}

  switch(window.location.pathname) {
    case '/':
			if(showAt.home)
				injectYouTubeGrid(buttonStyles.home);
			break;

		case '/results':
			if(showAt.results)
			injectYouTubeGrid(buttonStyles.results);
			break;

		case '/watch':
			if(showAt.watch)
				injectYouTubeWatch();
			break;
	}
}

/**
 * Inject SyncVideo Buttons to YouTube when grid-video-renderer/video-rederen are used
 *
 * @param {Object} style The Button Style
 */
function injectYouTubeGrid(style) {
	var oldCount = 0;

	intervals.grid = setInterval(() => {
		const grid_videos = document.getElementsByTagName('ytd-grid-video-renderer');
		const solo_videos = document.getElementsByTagName('ytd-video-renderer');

		var videos = [];
		videos = Array.prototype.concat.apply(videos, grid_videos);
		videos = Array.prototype.concat.apply(videos, solo_videos);

		if(oldCount === videos.length)
			return false;

		// Loop through all Grid Videos
		for(var vi = 0; vi < videos.length; vi++) {
			const video = videos[vi];
			const buttons = video.querySelector('#buttons');

			if(buttons !== null && buttons !== undefined && buttons.children.length === 0) {
				const video_link = video.querySelector('a#video-title').href;
				buttons.appendChild(getSyncButtonBarInject(style, video_link, video_link));
				buttons.style.margin = '10px 0px 0px 0px';
			}
		}

		oldCount = videos.length;
	}, 1000);
}

/**
 * Inject SyncVideo Buttons to YouTube when you watch a Video
 */
function injectYouTubeWatch() {
	const info = document.getElementsByTagName('ytd-video-primary-info-renderer')[0];
	const container = info.querySelector('#container');
	container.appendChild(getSyncButtonBarInject(buttonStyles.watch));
}

/**
 * Inject the SyncVideo part
 */
function injectSyncVideo() {
  setInterval(() => {
		// Check if user already joined a room
		const username_field = document.getElementById('current-username');
		if(username_field.childNodes.length === 0)
			return false;

    const video_link = getNextVideoInStorage();
    if(video_link !== null){
        // Change playListInput value to video link
        // Is defined in global scope of sync-video
        playlistAddInput.value = video_link;
        // Execute the addToPlaylist event from sync-video
        addToPlaylist();
    }
  }, 1000);
}

/**
 * Get SyncVideo Room ID
 */
function getRoomId() {
  if(roomId.length > 0)
    return roomId;

  var id = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < randomRoomIdLength; i++){
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
}

/**
 * Get the Add Button
 *
 * @param {Object} style The Button Style
 * @param {String} video_link Overwrite the Video link added to Storage
 */
function getSyncAddButtonInject(style, video_link = window.location.href) {
  const addButton = document.createElement("a");
  addButton.appendChild(document.createTextNode("Sync Add"));

  Object.keys(style).forEach((key) => {
    addButton.style.setProperty(key, style[key]);
  });

  addButton.onclick = () => {
  	addVideoToStorage(video_link);
  }

  return addButton;
}

/**
 * Get the Create Button
 *
 * @param {Object} style The Button Style
 * @param {String} video_link Overwrite the Video link added to Storage
 */
function getSyncCreateButtonInject(style, video_link = window.location.href) {
  const createButton = document.createElement("a");
  createButton.appendChild(document.createTextNode("Sync Create"));

  Object.keys(style).forEach((key) => {
    createButton.style.setProperty(key, style[key]);
  });

  createButton.href = "https://sync-video.com/r/" + getRoomId();
  createButton.target = "_blank";
  createButton.onclick = () => {
    addVideoToStorage(video_link);
	}

  return createButton;
}

/**
 * Get the Button Bar
 *
 * @param {Object} style The Button Style
 * @param {String} create_video_link Video link added to Storage if create button clicked. Null = default
 * @param {String} add_video_link Video link added to Storage if add button clicked. Null = default
 */
function getSyncButtonBarInject(style, create_video_link = null, add_video_link = null) {
  const buttonBar = document.createElement("span");
  buttonBar.style.width = "100%";
  buttonBar.id = "syncvideo";

  var createButton, addButton;

  if(create_video_link !== null)
    createButton = getSyncCreateButtonInject(style, create_video_link);
  else
    createButton = getSyncCreateButtonInject(style);

  buttonBar.appendChild(createButton);


  if(add_video_link !== null)
    addButton = getSyncAddButtonInject(style, add_video_link);
  else
    addButton = getSyncAddButtonInject(style);

  buttonBar.appendChild(addButton);
  return buttonBar;
}

/**
 * Get the next Video URL that is stored in Storage.
 * This Method will also delete the URL from Storage if 'should_delete' is not set to false
 *
 * @param {Boolean} should_delete If set to false URL will not be deleted from Storage
 *
 * @returns {String | null} Return the URL or Null if no URL was found
 */
function getNextVideoInStorage(should_delete = true) {
	const old = GM_getValue(STORAGE_VALUE, null);

	if(old === null || old === [])
		return null;

	const json = JSON.parse(old);
	const object = json.pop();

	if(should_delete)
		GM_setValue(STORAGE_VALUE, JSON.stringify(json));
	
	return object;
}

/**
 * Add a Video URL to the Storage to be added to SyncVideo
 *
 * @param {String} video_link The Video URL to store
 */
function addVideoToStorage(video_link) {
	const old = GM_getValue(STORAGE_VALUE, null);

	if(old === null) {
		GM_setValue(STORAGE_VALUE, JSON.stringify([video_link]));
		return;
	}

	const json = JSON.parse(old);
	json.push(video_link);
	GM_setValue(STORAGE_VALUE, JSON.stringify(json));
}
