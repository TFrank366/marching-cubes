// view.js
// handles the creation of view objects, their management and deletion

import { Camera } from "./camera.js";
import { Data } from "./data.js";
import { Mesh } from "./mesh.js";
import { get, create, toRads } from "./utils.js";
import { generateMesh } from "./marching.js";
import { generateMeshWasm } from "./marchingWasm.js";
import { VecMath } from "./VecMath.js";
import {mat4} from 'https://cdn.skypack.dev/gl-matrix';
import {createBuffers, updateBuffers, deleteBuffers, clearScreen, renderView} from "./render.js";
import {march} from "./webGPU.js";

export {view};

var view = {
    maxViews: 30,
    // an object to hold all views that have been created
    views: {},
    initialThreshold: 10,
    moreViewsAllowed: function() {
        return Object.keys(this.views).length < this.maxViews;
    },
    newId: function() {
        var id = Object.keys(this.views).length;
        while (this.views.hasOwnProperty(String(id))) {
            id++;
        };
        return String(id);
    },
    createView: function(config) {
        // check if it is going to be linked with another view object
        // check what type of linking is required
    
        // FOR INITIAL IMPLEMENTATION: no linking is supported
    
        //check to see if there is already the max amount of views
        if (!this.moreViewsAllowed()) return false;
    
        // check if the mesh, data and camera objects are supplied
        var camera = config.camera;// || new Camera();
        var mesh = config.mesh;// || new Mesh();
        var data = config.data;// || new Data();

        const modelMat = mat4.create();
        mat4.rotateX(modelMat, modelMat, toRads(-90));
        mat4.translate(modelMat, modelMat, VecMath.scalMult(-1, data.midPoint));

        camera.setModelMat(modelMat);
        camera.setProjMat();

        // generate id
        const id = this.newId();
        var newView = new this.View(id, camera, data,  mesh, this.initialThreshold);
        this.createViewDOM(id, newView);
        this.views[id] = newView;
        newView.init();

        return id;
    },
    createViewDOM: function(id, view) {
        // create div element for frame
        var viewContainer = create("DIV");
        viewContainer.classList.add("view-container");
        viewContainer.id = id;
        var frame = create("DIV");
        frame.classList.add("view-frame");
        var slider = create("INPUT");
        slider.type = "range";
        slider.min = 0;
        slider.max = 255;
        slider.value = this.initialThreshold;
        slider.step = 0.05;
        var closeBtn = create("BUTTON");
        closeBtn.onclick = () => {
            this.deleteView(id);
        }
        closeBtn.innerHTML = "X";
        //var text = create("P");
        //text.innerHTML = id;
        viewContainer.appendChild(frame);
        viewContainer.appendChild(slider);
        viewContainer.appendChild(closeBtn)
        //viewContainer.appendChild(text);

        // set event listeners for the elements
        frame.onmousedown = function(e) {
            view.camera.startMove(e.clientX, e.clientY);
        };
        frame.onmousemove = function(e) {
            view.camera.move(e.clientX, e.clientY)
        };
        frame.onmouseup = function(e) {
            view.camera.endMove();
        };
        frame.onmouseleave = function(e) {
            view.camera.endMove();
        };
        frame.onwheel = function(e) {
            e.preventDefault();
            view.camera.changeDist(e.deltaY);
        };
        slider.oninput = function() {
            view.updateThreshold(parseFloat(this.value));
        };

        // might want another event listener for when the frame element is moved or resized 
        // to update view.box

        get("view-container-container").appendChild(viewContainer);

    }, 
    deleteView: function(id) {
        this.views?.[id].delete();
        delete this.views[id];
    },
    render: function(gl) {
        // call the render functions of all currently active views
        for (let key in this.views) {
            this.views[key].render(gl);
        }
        if (Object.keys(this.views).length == 0) {
            clearScreen(gl);
        }
    },
    View: function(id, camera, data, mesh, threshold) {
        this.id = id;
        this.bufferId;
        this.camera = camera;
        this.data = data;
        this.mesh = mesh;
        this.threshold = threshold;
        this.updating = false;
        this.box = {};
        this.init = function() {
            this.bufferId = createBuffers();
            this.updateThreshold(this.threshold);
        }
        this.updateThreshold = async function(val) {
            if (this.data.initialised){
                this.threshold
                if(!this.updating) {
                    this.updating = true;
                    this.threshold = val;
                    await this.generateMesh();
                    //this.updateBuffers();
                    this.updating = false;
                };
            };
        }
        this.generateMesh = async function() {
            //generateMeshWasm(this.data, this.mesh, this.threshold);
            await march(this.data, this.mesh, this.threshold, this.bufferId);
        }
        this.updateBuffers = function() {
            updateBuffers(this.mesh, this.bufferId);
        }
        this.getFrameElem = function() {
            return get(this.id).children[0];
        }
        this.getViewContainer = function() {
            return get(this.id);
        }
        this.getBox = function() {
            // find the box corresponding to the associated frame element
            var rect = this.getFrameElem().getBoundingClientRect();
            var canvasRect = get("c").getBoundingClientRect();
            this.box.left = rect.left - canvasRect.left// + window.scrollX;
            this.box.top = rect.top - canvasRect.top;
            this.box.bottom = window.innerHeight + canvasRect.top - rect.bottom// - window.scrollY;
            this.box.width = rect.width;
            this.box.height = rect.width;

            return this.box;
        }
        this.render = function(gl) {
            // call the function to render this view
            // find place for model mat
            // find place for indices length
            if (this.data.initialised) {
                renderView(gl, this.camera.projMat, this.camera.getModelViewMat(), this.getBox(), this.mesh.indicesNum, this.bufferId);
            };
        }
        this.delete = function() {
            this.getViewContainer().remove();
            deleteBuffers(this.bufferId);
            // delete associated buffers on gpu
            //    call renderer's delete associated buffers function
            // delete associated DOM elements using elem.remove();

        }
    }
}
