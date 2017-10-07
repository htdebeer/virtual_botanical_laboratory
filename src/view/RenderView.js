/*
 * Copyright 2017 Huub de Beer <huub@heerdebeer.org>
 *
 * This file is part of virtual_botanical_laboratory.
 *
 * virtual_botanical_laboratory is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * virtual_botanical_laboratory is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General
 * Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with virtual_botanical_laboratory.  If not, see
 * <http://www.gnu.org/licenses/>.
 * 
 */

import {View} from "./View.js";


const _canvas = new WeakMap();

/**
 * View represents a tab in the LabView.
 *
 * @property {HTMLCanvasElement} canvas
 */
class RenderView extends View {

    constructor(elt, config = {}) {
        super(elt, "render", config);
    }

    get canvas() {
        return _canvas.get(this);
    }

    set canvas(canvasElement) {
        if (this.element.contains(this.canvas)) {
            this.element.removeChild(this.canvas);
        }
        _canvas.set(this, canvasElement);
        this.element.appendChild(this.canvas);
    }

}

export {
    RenderView
};

