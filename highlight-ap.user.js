// ==UserScript==
// @id             iitc-plugin-highlight-portals-by-ap-gains@lithium
// @name           IITC plugin: highlight portals by ap gains 
// @category       Highlighter
// @version        0.1.2.20170108.21732
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://static.iitc.me/build/release/plugins/portal-highlighter-portals-my-level.meta.js
// @downloadURL    https://static.iitc.me/build/release/plugins/portal-highlighter-portals-my-level.user.js
// @description    [iitc-2017-01-08-021732] Use the portal fill color to denote portal ap gains.
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};
// PLUGIN START ////////////////////////////////////////////////////////


function heatMapColorforValue(value){
  var h = (1.0 - value) * 240
  return "hsl(" + h + ", 100%, 50%)";
}


// use own namespace for plugin
window.plugin.portalHighlighterAp = function() {};



window.plugin.portalHighlighterAp.highlight = function(data) {

  var guid = data.portal.options.guid
  
  if (window.portals[guid]) {
    window.plugin.portalHighlighterAp.highlightGuid(data.portal)
  } else {
    window.plugin.portalHighlighterAp.queue.push(guid)
  }
}

window.plugin.portalHighlighterAp.highlightGuid = function(portal) {
  var portalTeam = portal.options.data.team
  var ourTeam = window.PLAYER.team[0]

  var linkCount = getPortalLinksCount(portal.options.guid);
  var fieldCount = getPortalFieldsCount(portal.options.guid);
  var ap_gain = linkCount*DESTROY_LINK + fieldCount*DESTROY_FIELD;

  var opacity = .6;
  var color;
  if (portalTeam === ourTeam) {
    color = "gray";
    opacity = 0.3;
  } else {
    var v = Math.min(Number(ap_gain/10000.0), 1.0)
    color = heatMapColorforValue(v)
  }

  portal.setStyle({
    color: color, 
    fillColor: color,
    fillOpacity: opacity
  })

}

window.plugin.portalHighlighterAp.processQueue = function() {
  window.plugin.portalHighlighterAp.queue.forEach(guid => {
    window.plugin.portalHighlighterAp.highlightGuid(window.portals[guid], getPortalApGain(guid))
  })
  window.plugin.portalHighlighterAp.queue = []
}

window.plugin.portalHighlighterAp.queue = []

var setup =  function() {
  window.addPortalHighlighter('AP Gain', window.plugin.portalHighlighterAp.highlight);
  window.addHook('mapDataRefreshEnd', window.plugin.portalHighlighterAp.processQueue);
}



// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


