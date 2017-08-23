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

    initialize() {
        super.initialize();
        const canvas = _canvas.get(this);
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        canvas.beginPath();
        canvas.moveTo(this.x, this.y);
    }

    finalize() {
        super.finalize();
        const canvas = _canvas.get(this);
        if (this.getProperty("close", false)) {
            canvas.closePath();
        }
        canvas.stroke();
    }

    applyProperties() {
        const canvas = _canvas.get(this);
        
        if (this.hasProperty(LINE_WIDTH)) {
            canvas.lineWidth = this.getProperty(LINE_WIDTH);
        }

        if (this.hasProperty(LINE_COLOR)) {
            canvas.strokeStyle = this.getProperty(LINE_COLOR);
        }

        if (this.hasProperty(LINE_JOIN)) {
            canvas.lineJoin = this.getProperty(LINE_JOIN);
        }

        if (this.hasProperty(FILL_COLOR)) {
            canvas.fillStyle = this.getProperty(FILL_COLOR);
        }
    }

    moveTo(x, y) {
        _canvas.get(this).moveTo(x, y);
    }

    lineTo(x, y) {
        const canvas = _canvas.get(this);
        canvas.save();
        this.applyProperties();
        canvas.lineTo(x, y);
        canvas.restore();
    }

    enter() {
        const canvas = _canvas.get(this);
        canvas.save();
        super.enter();
        if (this.getProperty("close", false)) {
            canvas.beginPath();
        }
    }

    exit() {
        const canvas = _canvas.get(this);
        if (this.getProperty("close", false)) {
            canvas.closePath();
        }
        canvas.restore();
        super.exit();
        canvas.moveTo(this.x, this.y);
    }
        
}

export {
    CanvasTurtleInterpretation
}
