// ==UserScript==
// @name        YouTube Sync-Video Extension
// @namespace   https://tandashi.de
// @author      Tandashi
// @version     0.7
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
// @grant    		GM_setClipboard
// ==/UserScript==

// ==Config==
const show_at = {
	'home': true,
	'watch': true,
	'results': true,
	'library': true,
	'history': true,
	'playlist': true,
	'trending': true,
	'subscriptions': true,
	'channel' : true
}

const room_id = ""; // Leave empty if it should be randomly generated
const random_room_id_length = 5; // The length of the random generated id of 'roomId' is empty

// If true this will remove the playlist link in the video URL automatically.
// Meaning if you try to add a video in a playlist only the one Video will be added not the whole playlist
// Recommended: true
const strip_playlist = true;

// Copy link of SyncVideo Room automatically to clipboard 
// when you press the create button
const auto_copy = true;
// ==/Config==

// ==Advanced Config==
// Can be changed but you should know what you are doing. 
//Changing things in here could breake the look of YouTube for you.
const button_styles = {
  'base' : {
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
		'text-decoration': 'none',
		'z-index': '999'
	},
	'sidebar' : {
		'-webkit-appearance': 'listbox',
    'background-color': '#b27900',
    'color': 'white',
    'text-align': 'center',
    'padding': '3px 4px 3px 4px',
    'margin': '10px 10px 10px 10px',
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
	}
}
// ==/Advanced Config==




const intervals = {};
const STORAGE_VALUE = 'syncyt';

window.onload = () => {
	var old_location = undefined;

	// Set an Interval to check if the path location has changed
	// The only way I found to determin if something changed
	// e.g. If the user clicked on a Video or something like that
	// since the window will not be loaded again. The hasChanged Listener
	// also did'nt work for me
	intervals.main = setInterval(() => {
		if(old_location === window.location.pathname)
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

		old_location = window.location.pathname;
	}, 100);
}

/**
 * Inject SyncVideo Buttons to YouTube.
 * Will automatically determin which inject-Methods should be called.
 * You do not need to call any other inject Methods
 */
function injectYoutTube() {
	if(intervals.interval !== undefined) {
		clearInterval(intervals.interval);
		delete intervals.interval;
	}

  switch(window.location.pathname) {
    case '/':
			if(show_at.home)
				injectYouTubeRenderer(button_styles.base);
			break;

		case '/results':
			if(show_at.results)
				injectYouTubeRenderer(button_styles.base);
			break;

		case '/watch':
			if(show_at.watch)
				injectYouTubeWatch();
			break;

		case '/feed/history':
			if(show_at.history)
				injectYouTubeRenderer(button_styles.base);
			break;

		case '/feed/library':
			if(show_at.library)
				injectYouTubeRenderer(button_styles.base);
			break;

		case '/feed/trending':
			if(show_at.trending)
				injectYouTubeRenderer(button_styles.base);
			break;

		case '/feed/subscriptions':
			if(show_at.subscriptions)
				injectYouTubeRenderer(button_styles.base);
			break;
			
		case '/playlist':
			if(show_at.playlist)
				injectYouTubeRenderer(button_styles.base);
			break;

		// This should be used for everything that has a non-static pathname
		// such as channels since channels have /channel/[ID]
		default:
			if(window.location.pathname.match('/channel/*') && show_at.channel)
				injectYouTubeRenderer(button_styles.base);

			if(window.location.pathname.match('/user/*') && show_at.channel)
				injectYouTubeRenderer(button_styles.base);
			break;
	}
}

/**
 * Inject SyncVideo Buttons to YouTube in intervals
 * Use this for Home/Search/... everything that updates if you scroll basically
 *
 * @param {Object} style The Button Style
 */
function injectYouTubeRenderer(style) {
	var old_count = 0;

	intervals.interval = setInterval(() => {
		const grid_renderer = document.getElementsByTagName('ytd-grid-video-renderer');
		const video_renderer = document.getElementsByTagName('ytd-video-renderer');
		const playlist_renderer = document.getElementsByTagName('ytd-playlist-video-renderer');
		const sidebar_renderer = document.getElementsByTagName('ytd-playlist-sidebar-renderer');

		var renderer = [];
		renderer = Array.prototype.concat.apply(renderer, grid_renderer);
		renderer = Array.prototype.concat.apply(renderer, video_renderer);
		renderer = Array.prototype.concat.apply(renderer, playlist_renderer);
		renderer = Array.prototype.concat.apply(renderer, sidebar_renderer);

		if(old_count === renderer.length)
			return false;

		// Loop through all renderer
		for(var ri = 0; ri < renderer.length; ri++) {
			const renderer_obj = renderer[ri];

			switch(renderer_obj.tagName.toLowerCase()) {
				case 'ytd-grid-video-renderer':
				case 'ytd-video-renderer':
					addForDefaultRenderer(renderer_obj, style);
					break;

				case 'ytd-playlist-video-renderer':
					addForPlaylistRenderer(renderer_obj, style);
					break;

				case 'ytd-playlist-sidebar-renderer':
					addForPlaylistSidebarRenderer(renderer_obj, button_styles.sidebar);
					break;
			}
		}

		old_count = renderer.length;
	}, 1000);
}

/**
 * Add SyncVideo Button for ytd-grid-video-renderer and ytd-video-renderer
 * 
 * @param {HTMLAnchorElement} renderer The renderer object
 * @param {Object} style The Button style
 */
function addForDefaultRenderer(renderer, style) {
	const buttons = renderer.querySelector('#buttons');

	if(buttons !== null && buttons !== undefined && buttons.children.length === 0) {
		const video_link = renderer.querySelector('a#video-title').href;
		buttons.appendChild(getSyncButtonBarInject(style, video_link, video_link));
		buttons.style.margin = '10px 0px 0px 0px';
	}
}

/**
 * Add SyncVideo Button for ytd-playlist-video-renderer
 * 
 * @param {HTMLAnchorElement} renderer The renderer object
 * @param {Object} style The Button style
 */
function addForPlaylistRenderer(renderer, style) {
	const wrap = renderer.querySelector('#meta');

	// Check if we didn't already add the ButtonBar
	if(wrap !== null && wrap !== undefined && wrap.querySelector('#syncvideo') === null) {
		const video_link = renderer.querySelector('[href]').href;
		wrap.appendChild(getSyncButtonBarInject(style, video_link, video_link));
	}
}

/**
 * Add SyncVideo Button for ytd-playlist-sidebar-renderer
 * 
 * @param {HTMLAnchorElement} renderer The renderer object
 * @param {Object} style The Button style
 */
function addForPlaylistSidebarRenderer(renderer, style) {
	const primary = renderer.querySelector('ytd-playlist-sidebar-primary-info-renderer');

	if(primary === null || primary === undefined)
		return;

	// Check if already added.
	if(primary.querySelector('#syncvideo') !== null)
		return;

	const badge_renderer = renderer.querySelector('ytd-badge-supported-renderer');

	var playlist_private = false;

	if(badge_renderer !== null && badge_renderer !== undefined) {
		const badge = badge_renderer.querySelector('div.badge');
			
		if(badge !== null && badge !== undefined) 
			playlist_private = badge.querySelector('span').textContent.toLowerCase() === 'private'
	}
		
	if(!playlist_private) {
		const menu = primary.querySelector('ytd-menu-renderer');
		const top_level_buttons = menu.querySelector('#top-level-buttons');
	
		const video_link = primary.querySelector('[href]').href;
		top_level_buttons.appendChild(getSyncButtonBarInject(style, video_link, video_link, true));	
	}
}

/**
 * Inject SyncVideo Buttons to YouTube when you watch a Video
 */
function injectYouTubeWatch() {
	const info = document.getElementsByTagName('ytd-video-primary-info-renderer')[0];
	const container = info.querySelector('#container');

	if(container.querySelector('#syncvideo') === null)
		container.appendChild(getSyncButtonBarInject(button_styles.watch));
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
  if(room_id.length > 0)
    return room_id;

  var id = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < random_room_id_length; i++){
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
}

/**
 * Get the Add Button
 *
 * @param {Object} style The Button Style
 * @param {String} video_link Overwrite the Video link added to Storage
 * @param {Boolean} force_nostrip Force no strip of playlist parameter
 */
function getSyncAddButtonInject(style, force_nostrip = false, video_link = window.location.href) {
  const add_button = document.createElement('a');
  add_button.appendChild(document.createTextNode("Sync Add"));

  Object.keys(style).forEach((key) => {
    add_button.style.setProperty(key, style[key]);
  });

  add_button.onclick = (e) => {
		e.cancelBubble = true;
		addVideoToStorage(video_link, force_nostrip);
		return false;
  }

  return add_button;
}

/**
 * Get the Create Button
 *
 * @param {Object} style The Button Style
 * @param {String} video_link Overwrite the Video link added to Storage
 * @param {Boolean} force_nostrip Force no strip of playlist parameter
 */
function getSyncCreateButtonInject(style, force_nostrip = false, video_link = window.location.href) {
  const create_button = document.createElement('a');
  create_button.appendChild(document.createTextNode("Sync Create"));

  Object.keys(style).forEach((key) => {
    create_button.style.setProperty(key, style[key]);
  });

  create_button.href = "https://sync-video.com/r/" + getRoomId();
  create_button.target = "_blank";
  create_button.onclick = (e) => {
		e.cancelBubble = true;
		addVideoToStorage(video_link, force_nostrip);

		if(auto_copy) {
			GM_setClipboard(create_button.href);
		}
	}

  return create_button;
}

/**
 * Get the Button Bar
 *
 * @param {Object} style The Button Style
 * @param {String} create_video_link Video link added to Storage if create button clicked. Null = default
 * @param {String} add_video_link Video link added to Storage if add button clicked. Null = default
 * @param {Boolean} force_nostrip Force no strip of playlist parameter
 */
function getSyncButtonBarInject(style, create_video_link = null, add_video_link = null, force_nostrip = false) {
  const buttonBar = document.createElement("span");
  buttonBar.style.width = "100%";
	buttonBar.id = "syncvideo";

  var create_button, add_button;

  if(create_video_link !== null)
    create_button = getSyncCreateButtonInject(style, force_nostrip, create_video_link);
  else
    create_button = getSyncCreateButtonInject(style, force_nostrip);
  buttonBar.appendChild(create_button);


  if(add_video_link !== null)
    add_button = getSyncAddButtonInject(style, force_nostrip, add_video_link);
  else
    add_button = getSyncAddButtonInject(style, force_nostrip);
	buttonBar.appendChild(add_button);
	
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
 * @param {Boolean} force_nostrip Force no strip of playlist parameter
 */
function addVideoToStorage(video_link, force_nostrip = false) {
	if(strip_playlist && !force_nostrip) {
		video_link = removeQueryParameter(video_link, 'list');
	}

	const old = GM_getValue(STORAGE_VALUE, null);

	if(old === null) {
		GM_setValue(STORAGE_VALUE, JSON.stringify([video_link]));
		return;
	}

	const json = JSON.parse(old);
	json.push(video_link);
	GM_setValue(STORAGE_VALUE, JSON.stringify(json));
}

/**
 * 
 * Credit: https://www.quora.com/How-do-I-remove-a-specific-key-value-pair-in-a-query-string-without-reloading-using-JavaScript
 * 
 * @param {String} url The URL
 * @param {String} parameter_name The parameter that should be removed
 */
function removeQueryParameter(url, parameter_name) {
	const [head, tail] = url.split('?');
	return head + '?' + tail.replace(new RegExp(`&${parameter_name}=[^&]*|${parameter_name}=[^&]*&`), '');
}
