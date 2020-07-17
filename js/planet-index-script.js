"use strict";

$(document).ready(onDOMReady)

function onDOMReady() {
    var button = document.getElementById("search-button");
    var searchQuery = document.getElementById("planet-searchterm");
    button.onclick = function () {
        alert(searchQuery.value);
    }
}   

