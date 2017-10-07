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
import {
    TurtleInterpretation,
    LINE_WIDTH,
    LINE_COLOR,
    LINE_JOIN,
    FILL_COLOR
} from "./TurtleInterpretation.js";

const _canvas = new WeakMap();

class CanvasTurtleInterpretation extends TurtleInterpretation {
    constructor(canvas, initialState = {}) {
        super(initialState);
        _canvas.set(this, canvas);
    }

    get canvas() {
        return _canvas.get(this);
    }

    get canvasElement() {
        return this.canvas.canvas;
    }

    initialize() {
        super.initialize();
        this.canvas.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvas.beginPath();
        this.canvas.moveTo(this.x, this.y);
    }

    finalize() {
        super.finalize();
        if (this.getProperty("close", false)) {
            this.canvas.closePath();
        }
        this.canvas.stroke();
    }

    applyProperties() {
        if (this.hasProperty(LINE_WIDTH)) {
            this.canvas.lineWidth = this.getProperty(LINE_WIDTH);
        }

        if (this.hasProperty(LINE_COLOR)) {
            this.canvas.strokeStyle = this.getProperty(LINE_COLOR);
        }

        if (this.hasProperty(LINE_JOIN)) {
            this.canvas.lineJoin = this.getProperty(LINE_JOIN);
        }

        if (this.hasProperty(FILL_COLOR)) {
            this.canvas.fillStyle = this.getProperty(FILL_COLOR);
        }
    }

    moveTo(x, y) {
        this.canvas.moveTo(x, y);
    }

    lineTo(x, y) {
        this.applyProperties();

        this.canvas.lineTo(x, y);
        this.canvas.stroke();
    }

    enter() {
        super.enter();

        this.canvas.beginPath();
        this.canvas.moveTo(this.x, this.y);
    }

    exit() {
        super.exit();

        if (this.getProperty("close", false)) {
            this.canvas.closePath();
        }
        this.canvas.stroke();
        this.canvas.moveTo(this.x, this.y);
    }
        
}

export {
    CanvasTurtleInterpretation
};
