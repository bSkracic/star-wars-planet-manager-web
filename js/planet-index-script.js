"use strict";

$(document).ready(onDocumentReady);

let regions = [];
var reqReg = [];    
var reqGov = [];

function onDocumentReady() {
    //set regions and display all planets when page is loaded
    getRegionList();
    getPlanets();
    
    $('#search-button').bind('click', function (e) {    
        const searchterm = $('#planet-searchterm').val();

        regions.forEach(function (item) {
            if ($('#reg-' + item.id).prop('checked')) {
                reqReg.push(item.id);
            }
        });

        if ($('#Con').prop('checked')) {
            reqGov.push('Confederates');
        }

        if ($('#Gal').prop('checked')) {
            reqGov.push('Galactic Republic');
        }

        getPlanets();

    });

    window.onbeforeunload = function () {
        $('#planet-searchterm').val("");
        $('#Con').prop('checked', false);
        $('#Gal').prop('checked', false);
    };
}

function getRegionList() {
    $.get('https://hk-iot-team-02.azurewebsites.net/api/Regions/', function (data) {
        var validList = [];
        data.forEach(function (item) {
            validList.push({ id: item.IDRegion, name: item.Name });
        });
        regions = validList;
        setSearchFilters(validList);
    });
}

function getPlanets() {
    $.get('https://hk-iot-team-02.azurewebsites.net/api/Planets/', function (data) {
        var validList = [];
        data.forEach(function (item) {
            validList.push({ id: item.IDPlanet, name: item.Name, government: item.Government, regionID: item.RegionID }); 
        });
        populateList(validList);
    });
}

function setSearchFilters(regions) {
    //regions item: {id, name}
    var regFilter = $("#reg-filter-search");
    for (var i = 0; i < regions.length; i++) {
        var id = "reg-" + regions[i].id;
        var checkbox = '<input type="checkbox" id="' + id + '">';
        var label = '<label for="' + id + '">' + regions[i].name + '</label><br />';
        regFilter.append(checkbox);
        regFilter.append(label);
    }
}

function populateList(list) {

    $('#results').empty();

   //filter list by search requirements
    let filteredList = [];
    list.forEach(function (item) {
        var filterGov = !reqGov.length || reqGov.includes(item.government);
        var filterReg = !reqReg.length || reqReg.includes(item.regionID);
        const kyWrd = $('#planet-searchterm').val();
        var filterKyWrd = !kyWrd.length || item.name.includes(kyWrd);

        if (filterGov && filterReg && filterKyWrd) {
            filteredList.push(item);
        }
    });

    var listView = $('#results');

    //check if list is empty
    if (!filteredList.length) {
        listView.append('<p>No results matches your search requirements.</p>');
        reqReg = [];
        reqGov = [];
        return;
    }

    //DEBUG   
    filteredList.forEach(function (item) {
        console.log({ id: item.id, name: item.name, reg: item.regionID, gov: item.government});
    });

    //populate div with list items
    filteredList.forEach(function (item) {
        //list item = {id, name, regionID, government}
        var button = '<button type="button" id="' + item.id + '" class="list-group-item list-group-item-action">' + item.name + '</button>';
        listView.append(button);
        $('#' + item.id).bind('click', function (e) {
            //open new page with ID being sent as extra data openPage(id);
            window.open("planet-view.html?id="+item.id, "_self");
        });
    });

    $('#temp').hide();

    //reset the requirements for the next search
    reqReg = [];
    reqGov = [];
}