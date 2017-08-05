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
import {Interpretation} from "./Interpretation.js";
import {Command} from "./Command.js";

// Default values
const X = 0;
const Y = 0;
const D = 2;
const DELTA = Math.PI / 2;
const ALPHA = 0;

const _x = new WeakMap();
const _y = new WeakMap();
const _d = new WeakMap();
const _delta = new WeakMap();
const _alpha = new WeakMap();

class TurtleInterpretation extends Interpretation {
    constructor(initialState = {}) {
        super(initialState);

        this.setCommand("+", new Command(function () {
            this.alpha = this.alpha + this.delta;
        }));

        this.setCommand("-", new Command(function () {
            this.alpha = this.alpha - this.delta;
        }));

        this.setCommand("f", new Command(function () {
            this.x = this.x + this.d * Math.cos(this.alpha);
            this.y = this.y + this.d * Math.sin(this.alpha);

            this.moveTo(this.x, this.y);
        }));
        
        this.setCommand("F", new Command(function () {
            this.x = this.x + this.d * Math.cos(this.alpha);
            this.y = this.y + this.d * Math.sin(this.alpha);

            this.lineTo(this.x, this.y);
        }));

        this.setCommand("Fl", "F");
        this.setCommand("Fr", "F");
    }

    moveTo(x, y) {
        // to be implemented by a sub class 
    }

    lineTo(x, y) {
        // to be implemented by a sub class 
    }

    get x() {
        return this.getProperty("x", X);
    }

    set x(value = 0) {
        this.setProperty("x", value);
    }

    get y() {
        return this.getProperty("y", Y);
    }

    set y(value = 0) {
        this.setProperty("y", value);
    }

    get d() {
        return this.getProperty("d", D);
    }

    set d(value = 1) {
        this.setProperty("d", value);
    }

    get alpha() {
        return this.getProperty("alpha", ALPHA);
    }

    set alpha(value = 0) {
        this.setProperty("alpha", value);
    }

    get delta() {
        return this.getProperty("delta", DELTA);
    }

    set delta(value = 1) {
        this.setProperty("delta", value);
    }

}

export {
    TurtleInterpretation
}
