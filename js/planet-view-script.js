"use strict";

var planet;
var governor;
var army;

let regions = [];
let previousGov;
$(document).ready(onDocumentReady);

class Planet {
    constructor(jsonPlanet) {
        this.IDPlanet = jsonPlanet.IDPlanet;
        this.Name = jsonPlanet.Name;
        this.Government = jsonPlanet.Government;
        this.Type = jsonPlanet.Type;
        this.RegionID = jsonPlanet.RegionID;
        this.Region = regions.find(obj => obj.id == jsonPlanet.RegionID).name;
        this.Image = jsonPlanet.Image;
        this.ArmyID = jsonPlanet.ArmyTypeID;
        this.GovernorID = jsonPlanet.GovernorID;
    }
}

class Governor {
    constructor(jsonGovernor) {
        this.IDPlanet = jsonGovernor.IDPlanet;
        this.Image = jsonGovernor.Image;
        this.Name = jsonGovernor.Name;
        this.Surname = jsonGovernor.Surname;
    }
}

class Army {
    constructor(jsonArmy) {
        this.IDPlanet = jsonArmy.IDPlanet
        this.B1 = jsonArmy.B1;
        this.B2 = jsonArmy.B2;
        this.B3 = jsonArmy.B3;
        this.BX = jsonArmy.BX;
        this.BL = jsonArmy.BL;
        this.D1S1 = jsonArmy.D1S1;
        this.HKB3 = jsonArmy.HKB3;
        this.IG110 = jsonArmy.IG110;
        this.OG9 = jsonArmy.OG9;
        this.T4 = jsonArmy.T4;    
    }
}

function onDocumentReady() {
    $('#edit-planet-modal').on('show.bs.modal', function () {
        startPlanetModal();
    })

    $('#edit-governor').bind('click', function (e) {
        startGovernorModal();
    });
    $('#edit-army').bind('click', function (e) {
        startArmyModal();
    });
    const url = window.location.href;
    const id = url.split('?')[1].split('=')[1];
    getPlanet(id);
}

function getPlanet(id) {
    if (!regions.length) {
        $.get('https://hk-iot-team-02.azurewebsites.net/api/Regions', function (data) {
            data.forEach((item) => {
                regions.push({ id: item.IDRegion, name: item.Name });
            });
            sendGET(id);
        });
    } else {
        sendGET(id);
    }  
}

function sendGET(id) {
    $.get('https://hk-iot-team-02.azurewebsites.net/api/Planets/' + id, function (data) {
        planet = new Planet(data);
        if (planet.Government == 'Confederates') {
            $.get('https://hk-iot-team-02.azurewebsites.net/api/Governors/' + id, function (data) {
                governor = new Governor(data);
                $.get('https://hk-iot-team-02.azurewebsites.net/api/ArmyTypes/' + id, function (data) {
                    army = new Army(data);

                    populateContainers();
                });
            });
        } else {
            $('#governor-container').css('display', 'none');
            $('#army-container').css('display', 'none');
            populateContainers();
        }
    });
}

function populateContainers() {
    $('#planet-name').html(planet.Name);
    $('#title').html(planet.Name)
    $('#planet-region').html(planet.Region);
    $('#planet-type').html(planet.Type);
    $('#planet-government').html(planet.Government);
    if (planet.government === "Confederates") {
        $('#gov-icon').attr('src', 'res/gov-icons/confederacy-playstore.png');
    } else {
        $('#gov-icon').attr('src', 'res/gov-icons/galactic_republic-playstore.png');
    }
    previousGov = planet.Government;
    if (planet.Image === null) {
        $('#planet-image').attr('src', 'res/blank_planet.png');
    } else {
        const planetSRC = 'data: image/png;base64, ' + planet.Image;
        $('#planet-image').attr('src', planetSRC);
    }

    if (planet.Government === 'Confederates') {
        $('#governor-name').html(governor.Name);
        $('#governor-surname').html(governor.Surname);
        if (governor.Image === null) {
            $('#governor-image').attr('src', 'res/blank_planet.png');
        } else {
            const governorSRC = 'data: image/png;base64, ' + governor.Image;
            $('#governor-image').attr('src', governorSRC);
        }
        $('#B1').html(army.B1);
        $('#B2').html(army.B2);
        $('#B3').html(army.B3);
        $('#BX').html(army.BX);
        $('#BL').html(army.BL);
        $('#D1S1').html(army.D1S1);
        $('#HKB3').html(army.HKB3);
        $('#IG110').html(army.IG110);
        $('#OG9').html(army.OG9);
        $('#T4').html(army.T4);
    }
}

function imageToUrl(element, imageContainer) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        imageContainer.attr("src", reader.result);
    }
    reader.readAsDataURL(file);
}

function startPlanetModal() {
    //populate modal
    if (planet.Image != null) {
        const planetSRC = 'data:image/png;base64, ' + planet.Image;
        $('#temp-planet-image').attr('src', planetSRC);
    }
    $('#edit-planet-image').val("");
    $('#edit-planet-image').bind('change', function (event) {
        var tempImageContainer = $("#temp-planet-image");
        imageToUrl(this, tempImageContainer);
    });
    $('#edit-planet-name').val(planet.Name);
    $('#edit-planet-type').val(planet.Type);
    if ($('#regions-select').children().length === 0) {
        regions.forEach((item) => {
            $('#regions-select').append(
                $('<option></option>').val(item.id).html(item.name)
            );
        });
    }
    $('#regions-select').val(planet.RegionID);
    $('#government-select').val(planet.Government);

    $('#remove-planet-image').bind('click', function () {
        $('#temp-planet-image').attr('src', 'res/blank_planet.png');
    });

    $('#change-planet').bind('click', function (event) { 
        var body = constructPlanetBody();
        //PUT request
        $('#status-alert').empty();
        $.ajax({
            url: 'https://hk-iot-team-02.azurewebsites.net/api/Planets/' + planet.IDPlanet,
            type: 'PUT',
            contentType: 'application/json',
            data: body,
            success: function (data) {
                var newGov = $('#government-select').val();
                checkGovernment(newGov);
            },
            error: function (data) {
                $('#status-alert').append(
                    '<div class="alert alert-danger" role="alert">' +
                    'Failed to save changes.' +
                    '</div >');
            }
        });
    });
}

function constructPlanetBody() {
    var image = $('#temp-planet-image').attr('src').toString();
    var imageString = "";
    if (image === 'res/blank_planet.png') {
        imageString = null;
    } else {
        imageString = image.replace(/data:image\/(png|jpg|jpeg);base64,/, '');
    }
    var planetDTO = {
        IDPlanet: planet.IDPlanet,
        Name: $('#edit-planet-name').val(),
        Type: $('#edit-planet-type').val(),
        RegionID: $('#regions-select').val(),
        Government: $('#government-select').val(),
        Image: imageString
    };
    return JSON.stringify(planetDTO);
}

//used to check if api needs to create/delete army and governor tables
function checkGovernment(newGov) {
    if (newGov != previousGov) {
        if (newGov === 'Confederates') {
            //POST
            $('#status-alert').empty();
            $.ajax({
                url: 'https://hk-iot-team-02.azurewebsites.net/api/Governors/' + planet.IDPlanet,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({IDPlanet: planet.IDPlanet, Name: "Name", Surname: "Surname", Image: null}),
                success: function (data) {
                    $('#status-alert').empty();
                    $.ajax({
                        url: 'https://hk-iot-team-02.azurewebsites.net/api/ArmyTypes/' + planet.IDPlanet,
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            IDPlanet: planet.IDPlanet,
                            B1: 0,
                            B2: 0,
                            B3: 0,
                            BX: 0,
                            BL: 0,
                            D1S1: 0,
                            HKB3: 0,
                            IG110: 0,
                            OG9: 0,
                            T4: 0}),
                        success: function (data) {
                            $('#status-alert').append(
                                '<div class="alert alert-success" role="alert">' +
                                'Changes saved successfully' +
                                '</div >');
                            getPlanet(planet.IDPlanet);
                        },
                        error: function (data) {
                            $('#status-alert').append(
                                '<div class="alert alert-danger" role="alert">' +
                                'Failed to save changes.' +
                                '</div >');
                        }
                    });
                },
                error: function (data) {
                    $('#status-alert').append(
                        '<div class="alert alert-danger" role="alert">' +
                        'Failed to save changes.' +
                        '</div >');
                }
            });
        } else {
            //DELETE
            $('#status-alert').empty();
            console.log(JSON.stringify({ IDPlanet: planet.IDPlanet, Name: "Name", Surname: "Surname", Image: null }));
            $.ajax({
                url: 'https://hk-iot-team-02.azurewebsites.net/api/Governors/' + planet.IDPlanet,
                type: 'DELETE',
                success: function (data) {
                    $('#status-alert').empty();
                    $.ajax({
                        url: 'https://hk-iot-team-02.azurewebsites.net/api/ArmyTypes/' + planet.IDPlanet,
                        type: 'DELETE',
                        success: function (data) {
                            $('#status-alert').append(
                                '<div class="alert alert-success" role="alert">' +
                                'Changes saved successfully' +
                                '</div >');
                                getPlanet(planet.IDPlanet);
                        },
                        error: function (data) {
                            $('#status-alert').append(
                                '<div class="alert alert-danger" role="alert">' +
                                'Failed to save changes.' +
                                '</div >');
                        }
                    });
                },
                error: function (data) {
                    $('#status-alert').append(
                        '<div class="alert alert-danger" role="alert">' +
                        'Failed to save changes.' +
                        '</div >');
                }
            });
        }
    } else {
        $('#status-alert').empty();
        $('#status-alert').append(
            '<div class="alert alert-success" role="alert">' +
            'Changes saved succesfully.' +
            '</div >');
        getPlanet(planet.IDPlanet);
    }
}

function startGovernorModal() {
    //populate modal
    if (governor.Image != null) {
        const governorImageSRC = 'data:image/png;base64, ' + governor.Image;
        $('#temp-governor-image').attr('src', governorImageSRC);
    }
    $('#edit-governor-image').val("");
    $('#edit-governor-image').bind('change', function (event) {
        var tempImageContainer = $("#temp-governor-image");
        imageToUrl(this, tempImageContainer);
    });
    $('#edit-governor-name').val(governor.Name);
    $('#edit-governor-surname').val(governor.Surname);

    $('#remove-governor-image').bind('click', function () {
        $('#temp-governor-image').attr('src', 'res/blank_planet.png');
    });

    $('#change-governor').bind('click', function (event) {
        var image = $('#temp-governor-image').attr('src').toString();
        var imageString = "";
        if (image === 'res/blank_planet.png') {
            imageString = null;
        } else {
            imageString = image.replace(/data:image\/(png|jpg|jpeg);base64,/, '');
        }
        var body = JSON.stringify({
            IDPlanet: planet.IDPlanet,
            Name: $('#edit-governor-name').val(),
            Surname: $('#edit-governor-surname').val(),
            Image: imageString
        });
        //PUT request
        $('#status-alert').empty();
        $.ajax({
            url: 'https://hk-iot-team-02.azurewebsites.net/api/Governors/' + planet.IDPlanet,
            type: 'PUT',
            contentType: 'application/json',
            data: body,
            success: function (data) {
                $('#status-alert').append(
                    '<div class="alert alert-success" role="alert">' +
                    'Changes saved successfully' +
                    '</div >');
                getPlanet(planet.IDPlanet);
            },
            error: function (data) {
                $('#status-alert').append(
                    '<div class="alert alert-danger" role="alert">' +
                    'Failed to save changes.' +
                    '</div >');
            }
        });
    });
}

function startArmyModal() {
    //populate modal
    $('#edit-B1').val(army.B1);
    $('#edit-B2').val(army.B2);
    $('#edit-B3').val(army.B3);
    $('#edit-BX').val(army.BX);
    $('#edit-BL').val(army.BL);
    $('#edit-D1S1').val(army.D1S1);
    $('#edit-HKB3').val(army.HKB3);
    $('#edit-IG110').val(army.IG110);
    $('#edit-OG9').val(army.OG9);
    $('#edit-T4').val(army.T4);

    $('#change-army').bind('click', function (event) {
        var body = JSON.stringify({
            IDPlanet: planet.IDPlanet,
            B1: $('#edit-B1').val(),
            B2: $('#edit-B2').val(),
            B3: $('#edit-B3').val(),
            BX: $('#edit-BX').val(),
            BL: $('#edit-BL').val(),
            D1S1: $('#edit-D1S1').val(),
            HKB3: $('#edit-HKB3').val(),
            IG110: $('#edit-IG110').val(),
            OG9: $('#edit-OG9').val(),
            T4: $('#edit-T4').val()
        });
        //PUT request
        $('#status-alert').empty();
        $.ajax({
            url: 'https://hk-iot-team-02.azurewebsites.net/api/ArmyTypes/' + planet.IDPlanet,
            type: 'PUT',
            contentType: 'application/json',
            data: body,
            success: function (data) {
                $('#status-alert').append(
                    '<div class="alert alert-success" role="alert">' +
                    'Changes saved successfully' +
                    '</div >');
                getPlanet(planet.IDPlanet);
            },
            error: function (data) {
                $('#status-alert').append(
                    '<div class="alert alert-danger" role="alert">' +
                    'Failed to save changes.' +
                    '</div >');
            }
        });
    });
}

