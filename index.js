"use strict";

// City-core
var bordeaux3dCore = require('city-core');
var MAX_Y = require('city-core/front/MAX_Y.js');
var meshColor = require('city-core/front/meshDefaultColor.js');
var infosFromMesh = require('city-core/front/infosFromMesh.js');
var meshFromId = require('city-core/front/meshFromId.js');

// City-blocks
var SkyViewControls = require('city-blocks/controls/SkyView_RTS.js');
var FirstPersonControls = require('city-blocks/controls/FirstPerson_PointerLock.js');
var SunPosition = require('city-blocks/utils/SunPosition.js');
var GeoConverter = require('city-blocks/utils/geo/geoConverter.js');
var GeoCode = require('city-blocks/utils/geo/geoCode.js');
var _createRay = require('city-blocks/utils/ray/createRay.js');
var GUI = require('city-blocks/gui/GUI_basic.js');

var THREE = require('three');

var guiControls = GUI.guiControls;

var cityAPIOrigin = "https://city-api.ants.builders";
// var cityAPIOrigin = "http://localhost:9000";

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
    console.log('light: ', lights);
    
    // Sun position changes only so that light.shadowCamera follows view
    bordeaux3D.camera.on('cameraviewchange', function(){ 
        var pos = bordeaux3D.camera.position;
        var sun = lights.sun;
        sun.position.x = pos.x;
        sun.position.y = pos.y;
        sun.position.z = SUN_ALTITUDE;
        var sunPos = SunPosition(guiControls.hour, sun, lights.ambient);
        sun.target.position.set(pos.x + sunPos[0], pos.y + sunPos[1], 0);
    });

    // activate raycasting
    var createRay = _createRay(bordeaux3D.camera);

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

        if(mode === "Sky"){
            // remove listeners
            window.removeEventListener('keydown', onKeyPressToggleSky);
            // add listeners
            view.addEventListener('click', onMeshClickedToggleFirstPerson);
            // view.addEventListener('click', removeBuilding);
            bordeaux3D.camera.off('cameraviewchange', onCameraViewChangeScan);

            // change controls
            bordeaux3D.changeControls(SkyViewControls, { z: currentAltitude });
        }
        else{
            // console.log('Switching to FPV: ', bordeaux3D.camera.position);
            // remove listeners
            bordeaux3D.camera.on('cameraviewchange', onCameraViewChangeScan);
            view.removeEventListener('click', onMeshClickedToggleFirstPerson);

            // add listeners
            window.addEventListener('keydown', onKeyPressToggleSky);

            // change controls
            currentAltitude = bordeaux3D.camera.position.z;
            bordeaux3D.changeControls(FirstPersonControls);
        }
    }

    // toggle initial controls
    toggleControls(currentControls);

    function removeBuilding (event){
        var ray = createRay.fromMouse(event);
        var mesh = bordeaux3D.getMeshFromRay(ray).object;
        bordeaux3D.removeMesh(mesh);
        bordeaux3D.render();
    }

    // functions to be activated while Sky view is on
    function onMeshClickedToggleFirstPerson(event){
        var ray = createRay.fromMouse(event.clientX, event.clientY);
        var point = bordeaux3D.getMeshFromRay(ray).point;

        console.log('RAY', ray, 'POINT', point);
        
        bordeaux3D.camera.position.x = point.x;
        bordeaux3D.camera.position.y = point.y;

        currentControls = "FirstPerson";
        toggleControls(currentControls);
    }


    // functions to be activated while First Person view is on
    function onKeyPressToggleSky(event){
        console.log('key press while first person', event.keyCode);
        if(event.keyCode === 27){ // escape
            event.preventDefault();
            currentControls = "Sky";
            toggleControls(currentControls);
        }
    }

    var old = undefined;
    function onCameraViewChangeScan(){
        var ray = createRay.fromView();
        var result = bordeaux3D.getMeshFromRay(ray);

        if (result && infosFromMesh.get(result.object).type === 'building'){
            var mesh = result.object;
            var infos = infosFromMesh.get(mesh);
            // console.log('Mesh color: ', meshColor[infos.type]);

            if (mesh !== old){
                if (old){
                    var oldType = infosFromMesh.get(old).type;
                    old.material.color.setHex(meshColor[oldType]);
                }
                    
                mesh.material.color.setHex(0xFF0000);
                old = mesh;
            }
        }   
    }

});


