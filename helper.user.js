// ==UserScript==
// @name        Sync-Video YT Helper
// @namespace   https://tandashi.de
// @author      Tandashi
// @version     0.4
// @description This userscript assists sync-video from Youtube.
// @match       *://www.youtube.com/*
// @match       *://sync-video.com/r/*

// @icon        http://www.genyoutube.net/helper/favicon.png
// @icon64      http://www.genyoutube.net/helper/favicon.png
// @homepage    https://tandashi.de/
// @downloadURL https://tandashi.de/helper.user.js
// @updateURL   https://tandashi.de/helper.user.js


// @run-at      document-end
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// ==/UserScript==

// ==Config==
var show_on_results = true;
// ==/Config==

if(window.location.href.indexOf("youtube.com") > -1){
    if(document.getElementById("polymer-app") || document.getElementById("masthead") || window.Polymer){
        setInterval(function(){
            if(window.location.href.indexOf("watch?v=") < 0){return false;}

            if(document.getElementById("count") && document.getElementById("syncvideo") === null){
                polymerInject();
            }
        }, 100);
    }
    else {
        setInterval(function(){
            if(window.location.href.indexOf("watch?v=") < 0){return false;}

            if(document.getElementById("watch7-subscription-container") && document.getElementById("syncvideo") === null){
                htmlInject();
            }
        }, 100);
    }

    if(show_on_results){
        setInterval(function(){
            if(window.location.href.indexOf("results?search_query=") < 0){return false;}

            var page_manager = document.querySelector("ytd-search.ytd-page-manager");
            var results;

            if(page_manager == null || page_manager == undefined){
                results = document.querySelector("div#contents.ytd-item-section-renderer");
            }
            else{
                results = page_manager.querySelector("div#contents.ytd-item-section-renderer");
            }

            if(results == null || results == undefined){
                return;
            }

            Array.from(results.children).forEach(function(element){
                if(element.classList.contains("sync_added")){
                    return;
                }

                var text_wrap = element.querySelector("div.text-wrapper");

                if(text_wrap == null || text_wrap == undefined){
                    return;
                }

                var syncButton = document.createElement("a");
                syncButton.appendChild(document.createTextNode("Sync"));
                syncButton.style.width = "6%";
                syncButton.style.backgroundColor = "#b27900";
                syncButton.style.color = "white";
                syncButton.style.textAlign = "center";
                syncButton.style.padding = "2px 5px";
                syncButton.style.margin = "1% 0px 0px 0px";
                syncButton.style.fontSize = "12px";
                syncButton.style.border = "0";
                syncButton.style.cursor = "pointer";
                syncButton.style.fontFamily = "Roboto, Arial, sans-serif";
                syncButton.style.textDecoration = "none";

                syncButton.addEventListener("mouseover", function(event){
                    event.target.style.backgroundColor = "#cfc800";
                }, false);

                syncButton.addEventListener("mouseleave", function(event){
                    event.target.style.backgroundColor = "#b27900";
                }, false);

                syncButton.onclick = function(){
                    GM_setValue("sync-video_add", element.querySelector("a#thumbnail").href);
                }

                text_wrap.insertBefore(syncButton, text_wrap.children[1]);
                element.classList.add("sync_added");
            });
        }, 100);
    }
}

if(window.location.href.indexOf("sync-video.com") > -1){
    setInterval(function() {
        var video_link = GM_getValue("sync-video_add", -1);
        if(video_link != -1){
            playlistAddInput.value = video_link;
            addToPlaylist();
            GM_deleteValue("sync-video_add");
        }
    }, 1000);
}

function htmlInject(){
    if (document.getElementById("watch7-subscription-container")) {
        var wrap = document.getElementById('watch7-subscription-container');
        var button = "<div id='syncvideo' style='display: inline-block; margin-left: 10px; vertical-align: middle;'>";
        button += "<a href=\"https://sync-video.com/r/" + makeid() + "\" title=\"Sync this Video\" target=\"_blank\"" +
            "style=\"display: inline-block; font-size: inherit; height: 22px; border: 1px solid rgb(0, 183, 90); border-radius: 3px; padding-left: 28px; cursor: pointer; vertical-align: middle; position: relative; line-height: 22px; text-decoration: none; z-index: 1; color: rgb(255, 255, 255);\">";
        button += "<i style=\"position: absolute; display: inline-block; left: 6px; top: 3px; background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMTYgMTYiIGlkPSJzdmcyIiB4bWw6c3BhY2U9InByZXNlcnZlIj48cGF0aCBkPSJNIDQsMCA0LDggMCw4IDgsMTYgMTYsOCAxMiw4IDEyLDAgNCwwIHoiIGZpbGw9IiNmZmZmZmYiIC8+PC9zdmc+); background-size: 12px; background-repeat: no-repeat; background-position: center center; width: 16px; height: 16px;\"></i>";
        button += "<span style=\"padding-right: 12px;\">Sync</span></a></div>";
        var style = "<style>#syncvideo button::-moz-focus-inner{padding:0;margin:0}#syncvideo a{background-color:#00B75A}#syncvideo a:hover{background-color:rgb(0, 163, 80)}#syncvideo a:active{background-color:rgb(0, 151, 74)}</style>";
        var tmp = wrap.innerHTML;
        wrap.innerHTML = tmp + button + style;
    }
}

function polymerInject(){
    /* Create button */
    var buttonDiv = document.createElement("span");
    buttonDiv.style.width = "100%";
    buttonDiv.id = "syncvideo";

    var createButton = document.createElement("a");
    createButton.appendChild(document.createTextNode("Sync Create"));

    createButton.style.width = "100%";
    createButton.style.backgroundColor = "#b27900";
    createButton.style.color = "white";
    createButton.style.textAlign = "center";
    createButton.style.padding = "5px 10px";
    createButton.style.margin = "0px 10px";
    createButton.style.fontSize = "14px";
    createButton.style.border = "0";
    createButton.style.cursor = "pointer";
    createButton.style.borderRadius = "2px";
    createButton.style.fontFamily = "Roboto, Arial, sans-serif";
    createButton.style.textDecoration = "none";
    createButton.href = "https://sync-video.com/r/" + makeid();
    createButton.target = "_blank";

    createButton.addEventListener("mouseover", function(event){
        event.target.style.backgroundColor = "#cfc800";
    }, false);

    createButton.addEventListener("mouseleave", function(event){
        event.target.style.backgroundColor = "#b27900";
    }, false);

    createButton.onclick = function(){
        GM_setValue("sync-video_add", window.location.href);
    }

    var addButton = document.createElement("a");
    addButton.appendChild(document.createTextNode("Sync Add"));

    addButton.style.width = "100%";
    addButton.style.backgroundColor = "#b27900";
    addButton.style.color = "white";
    addButton.style.textAlign = "center";
    addButton.style.padding = "5px 10px";
    addButton.style.margin = "0px 10px";
    addButton.style.fontSize = "14px";
    addButton.style.border = "0";
    addButton.style.cursor = "pointer";
    addButton.style.borderRadius = "2px";
    addButton.style.fontFamily = "Roboto, Arial, sans-serif";
    addButton.style.textDecoration = "none";

    addButton.addEventListener("mouseover", function(event){
        event.target.style.backgroundColor = "#cfc800";
    }, false);

    addButton.addEventListener("mouseleave", function(event){
        event.target.style.backgroundColor = "#b27900";
    }, false);

    addButton.onclick = function(){
        GM_setValue("sync-video_add", window.location.href);
    }

    buttonDiv.appendChild(createButton);
    buttonDiv.appendChild(addButton);

    /* Find and add to target */
    var targetElement = document.querySelectorAll("[id='count']");
    for(var i = 0; i < targetElement.length; i++){
        if(targetElement[i].className.indexOf("ytd-video-primary-info-renderer") > -1){
            targetElement[i].appendChild(buttonDiv);
        }
    }
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < 5; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}



