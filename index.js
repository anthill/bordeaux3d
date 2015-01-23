"use strict";

// City-core
var cityAPIOrigin = "http://localhost:9000";
// var cityAPIOrigin = "https://city-api.ants.builders";
var bordeaux3dCore = require('city-core');
var MAX_Y = require('city-core/front/MAX_Y.js');
var meshToBuilding = require('city-core/front/meshToBuilding.js');

// City-blocks
var SkyViewControls = require('city-blocks/controls/SkyView_RTS.js');
var FirstPersonControls = require('city-blocks/controls/FirstPerson_PointerLock.js');
// var SkyViewControls = require('city-blocks/controls/SkyView_Basic.js');
// var FirstPersonControls = require('city-blocks/controls/FirstPerson_Basic.js');
var SunPosition = require('city-blocks/utils/SunPosition.js');
var GeoConverter = require('city-blocks/utils/geo/geoConverter.js');
var GeoCode = require('city-blocks/utils/geo/geoCode.js');
var raycasting = require('city-blocks/utils/ray/raycasting.js');
var GUI = require('city-blocks/gui/GUI_basic.js');

var THREE = require('three');

var guiControls = GUI.guiControls;

var view = document.querySelector('#view');

var bordeaux3DP = bordeaux3dCore(view, cityAPIOrigin);

// initialise the geoconverter that will pass from a shifted lambert cc 45 to lon, lat and reverse
// the map is shifted
// -0.583232, 44.839270 corresponds to 1416800.1046884255, 4188402.562212417 in lambert 45
// and to (X=119) * 200 + (x=100), (MAX_Y-(Y=115))*200 + (y=100) in the map
var deltaX = 1416800.1046884255 - 119*200 - 100;
var deltaY = 4188402.562212417 - (MAX_Y-115)*200 - 100;
var geoConverter = new GeoConverter(45, deltaX, deltaY);


var currentControls = "Sky";

var INITIAL_ALTITUDE = 200;
var SUN_ALTITUDE = 300;

var sunLight = new THREE.DirectionalLight(0xffffff, 1);

sunLight.castShadow = true;
sunLight.shadowDarkness = 0.6;
sunLight.shadowMapWidth = 4096;
sunLight.shadowMapHeight = 4096;
sunLight.shadowCameraNear = 1;
sunLight.shadowCameraFar = 4000;

sunLight.shadowCameraRight = 200;
sunLight.shadowCameraLeft = -200;
sunLight.shadowCameraTop = 200;
sunLight.shadowCameraBottom = -200;

var ambientLight = new THREE.AmbientLight( "#333329" ); 

var lights = {
    sun: sunLight,
    ambient: ambientLight
};

var splashScreen = document.body.querySelector("#splash-screen");

splashScreen.addEventListener('click', function(){
    splashScreen.style.opacity = 0;
    console.log("click");
});
splashScreen.addEventListener('transitionend', function(){
    splashScreen.remove();
})

bordeaux3DP.then(function(bordeaux3D){

    // initial position
    bordeaux3D.camera.position.x = 24341.22;
    bordeaux3D.camera.position.y = 10967.65;
    bordeaux3D.camera.position.z = INITIAL_ALTITUDE;

    bordeaux3D.addLight(lights.sun);
    bordeaux3D.addLight(lights.ambient);
    
    // Sun position changes only so that light.shadowCamera follows view
    bordeaux3D.camera.on('cameraviewchange', function(){ 
        var pos = bordeaux3D.camera.position;
        var sun = lights.sun;
        sun.position.x = pos.x;
        sun.position.y = pos.y;
        sun.position.z = SUN_ALTITUDE;
        console.log('cameraViewChange');
        var sunPos = SunPosition(guiControls.hour, sun, lights.ambient);
        sun.target.position.set(pos.x + sunPos[0], pos.y + sunPos[1], 0);
    });

    // activate raycasting
    raycasting(bordeaux3D.camera, bordeaux3D.scene, view);

    var currentAltitude = INITIAL_ALTITUDE;

    function moveTo(place){
        GeoCode(place).then(function(coords) {
            var newPosition = geoConverter.toLambert(coords.lon, coords.lat);
            
            bordeaux3D.camera.position = new THREE.Vector3(newPosition.X, newPosition.Y, currentAltitude);
            bordeaux3D.camera.lookAt( new THREE.Vector3(newPosition.X, newPosition.Y, 0) );
            bordeaux3D.camera.up = new THREE.Vector3(0, 1, 0);

            currentControls = 'Sky';
            toggleControls(currentControls);

        });
    }

    // moveTo(guiControls.address);

    GUI.addressControler.onFinishChange(function(value) {
        moveTo(value);
    });

    GUI.hourControler.onChange(function(){
        SunPosition(guiControls.hour, lights.sun, lights.ambient);
        bordeaux3D.render();
    });

    function toggleControls(mode){
        console.log('toggleControls', mode);

        if(mode === "Sky"){
            bordeaux3D.changeControls(SkyViewControls, { z: currentAltitude });
            window.removeEventListener('keydown', onKeyPressFirstPerson);
            view.addEventListener('meshClicked', onMeshClicked);
        }
        else{
            console.log('Switching to FPV: ', bordeaux3D.camera.position);
            currentAltitude = bordeaux3D.camera.position.z;
            bordeaux3D.changeControls(FirstPersonControls);
            view.removeEventListener('meshClicked', onMeshClicked);
            window.addEventListener('keydown', onKeyPressFirstPerson);
        }
    }

    function onMeshClicked(event){
        var detail = event.detail;
        console.log('Id', meshToBuilding.get(detail.mesh).id);
        console.log('Intersection point', detail.point.x, detail.point.y, detail.point.z);
        
        bordeaux3D.camera.position.x = detail.point.x;
        bordeaux3D.camera.position.y = detail.point.y;

        console.log('camera position: ', bordeaux3D.camera.x, bordeaux3D.camera.y, bordeaux3D.camera.z);

        currentControls = "FirstPerson";
        toggleControls(currentControls);
    }

    function onKeyPressFirstPerson(e){
        console.log('key press while first person', e.keyCode);
        if(e.keyCode === 27){ // escape
            e.preventDefault();
            currentControls = "Sky";
            toggleControls(currentControls);
        }
    }

    // toggle initial controls
    toggleControls(currentControls);

});


