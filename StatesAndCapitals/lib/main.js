var fileName;
var action;

function generateColor(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var color = "#";
    for (var i = 0; i < 3; i++) {
        var val = (hash >> (i * 8)) & 0xFF;
        color += ("00" + val.toString(16)).substr(-2);
    }
    return color;
}

function tapState(p) {
    if (action) {
        alert("State: " + p.id.replace(new RegExp("_", "g"), " ") + "\nCapital: " + p.getAttribute("name").replace(new RegExp("_", "g"), " "));
    } else {
        alert("State: " + p.id.replace(new RegExp("_", "g"), " ") + "\nCapital: " + p.getAttribute("name").replace(new RegExp("_", "g"), " "));
    }
}

$(document).ready(function() {
    action = window.location.pathname == "/test.html";
    fileName = window.location.search.replace("?", "");
    document.title = fileName.split("_")[0].charAt(0).toUpperCase() + fileName.split("_")[0].slice(1);
    document.getElementById("svg").setAttribute("data", fileName);

    document.getElementById("svg").addEventListener("load", function() {
        var svgDoc = document.getElementById("svg").contentDocument;
        var states = svgDoc.querySelectorAll("path, polygon");
        for (var i = 0; i < states.length; i++) {
            (action) ? states[i].style.fill = generateColor(states[i].getAttribute("name") + states[i].id):
                states[i].style.fill = generateColor(states[i].id + states[i].getAttribute("name"));
            states[i].addEventListener("contextmenu", function(event) {
                event.preventDefault();
                tapState(this);
                return false;
            });
        }

        var panZoomSvg = svgPanZoom("#svg", {
            viewportSelector: "#India_with_States",
            panEnabled: true,
            controllIconsEnabled: false,
            zoomEnabled: true,
            dblClickZoomEnabled: true,
            mouseWheelZoomEnabled: true,
            preventMouseEventsEnabled: false,
            preventMouseEventsDefault: false,
            mouseScaleSensitivity: 0.5,
            minZoom: 1.3,
            maxZoom: 50,
            fit: false,
            center: false,
            refreshRate: "auto",
            beforePan: function(oldPan, newPan) {
                var stopHorizontal = true
                stopVertical = true,
                    gutterWidth = this.getSizes().viewBox.width * this.getSizes().realZoom * 0,
                    gutterHeight = this.getSizes().viewBox.height * this.getSizes().realZoom * 0,
                    // Computed variables
                    sizes = this.getSizes(),
                    leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth,
                    rightLimit = sizes.width - gutterWidth - (sizes.viewBox.x * sizes.realZoom),
                    topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight,
                    bottomLimit = sizes.height - gutterHeight - (sizes.viewBox.y * sizes.realZoom);

                customPan = {};
                customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
                customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));

                return customPan;
            },
            customEventsHandler: {
                haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
                init: function(options) {
                    var instance = options.instance,
                        initialScale = 1,
                        pannedX = 0,
                        pannedY = 0

                    // Init Hammer
                    // Listen only for pointer and touch events
                    this.hammer = Hammer(options.svgElement, {
                        inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
                    })

                    // Enable pinch and press
                    this.hammer.get('pinch').set({ enable: true })
                    this.hammer.get('press').set({ enable: true })
                        // Handle double tap
                    this.hammer.on('doubletap', function(ev) {
                        instance.zoomIn()
                    })

                    // Handle pan
                    this.hammer.on('panstart panmove', function(ev) {
                        // On pan start reset panned variables
                        if (ev.type === 'panstart') {
                            pannedX = 0
                            pannedY = 0
                        }

                        // Pan only the difference
                        instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY })
                        pannedX = ev.deltaX
                        pannedY = ev.deltaY
                    })

                    // Handle pinch
                    this.hammer.on('pinchstart pinchmove', function(ev) {
                        // On pinch start remember initial zoom
                        if (ev.type === 'pinchstart') {
                            initialScale = instance.getZoom()
                            instance.zoom(initialScale * ev.scale)
                        }

                        instance.zoom(initialScale * ev.scale)

                    })

                    // Handle press
                    this.hammer.on('press', function(ev) {
                        tapState(ev.target)
                    })

                    // Prevent moving the page on some devices when panning over SVG
                    options.svgElement.addEventListener('touchmove', function(e) { e.preventDefault(); });
                }

                ,
                destroy: function() {
                    this.hammer.destroy()
                }
            }
        });
        panZoomSvg.setZoomScaleSensitivity(0.);
    });
});
