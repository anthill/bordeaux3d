"use strict";

// City-core
var cityAPIOrigin = "https://city-api.ants.builders";
var bordeaux3dCore = require(cityAPIOrigin +'/front/index.js');

// City-blocks
var SkyViewControls = require('city-blocks/controls/SkyView_RTS.js');
var FirstPersonControls = require('city-blocks/controls/FirstPerson_PointerLock.js');
var SunPosition = require('city-blocks/utils/SunPosition.js');
var GeoConverter = require('city-blocks/utils/geoConverter.js');

var bordeaux3DP = bordeaux3dCore(document.querySelector('#view'), cityAPIOrigin);


function onMeshClicked(event){
    var detail = event.detail;
    console.log('Id', meshToBuilding.get(detail.mesh).id);
    console.log('Intersection point', detail.point.x, detail.point.y, detail.point.z); 

    ret.switchToFirstPersonView(detail.point.x, detail.point.y);
}

function onKeyPressFirstPerson(e){
    console.log('key press while first person', e.keyCode);
    if(e.keyCode === 27){ // escape
        e.preventDefault();
        ret.switchToSkyView(camera.position.x, camera.position.y);
    }
}

var activatedControl = "Sky";

var skyViewAltitude = 200;

bordeaux3DP.then(function(bordeaux3D){

    // initial position
    bordeaux3D.camera.position.x = 24341.22;
    bordeaux3D.camera.position.y = 10967.65;
    bordeaux3D.camera.position.z = skyViewAltitude;

    function toggleControls(){
        console.log('toggleControls', activatedControl);

        if(activatedControl === "Sky"){
            bordeaux3D.changeControls(SkyViewControls, { z: skyViewAltitude });
            //window.addEventListener('meshClicked', onMeshClicked);
            window.removeEventListener('keydown', onKeyPressFirstPerson);
            window.addEventListener('meshClicked', onMeshClicked);
            
            nextControls = "FirstPerson";
        }
        else{
            skyViewAltitude = bordeaux3D.camera.position.z;
            bordeaux3D.changeControls(FirstPersonControls);
            window.removeEventListener('meshClicked', onMeshClicked);
            window.addEventListener('keydown', onKeyPressFirstPerson);

            nextControls = "Sky";
        }
    }
    toggleControls();

});


