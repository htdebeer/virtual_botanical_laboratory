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

import {LSystem} from "./lsystem/LSystem.js";
import {CanvasTurtleInterpretation} from "./interpretation/CanvasTurtleInterpretation.js";

const CANVAS = new Symbol();
const SVG = new Symbol();

const _element = new WeakMap();
const _lsystem = new WeakMap();
const _interpretation = new WeakMap();

class Lab {
    constructor(config = {}) {

    }

    get element() {
        return _element.get(this);
    }

    // actions
    // control rendering
    run() {}
    stop() {}
    step() {}
    pause() {}
    reset() {}

    // LSystem
    setLSystem(lsystem) {}
    getLSystem() {}

    // Properties
    setProperty(name, value) {}
    getProperty(name) {}
    eachProperty*() {}

    // Commands
    setCommand(name, command) {}
    getCommand(name) {}
    eachCommand*() {}

    // New/open/save
    new() {}
    open(file) {}
    save(file) {}

    //Export
    toPNG() {}
    toSVG() {}
    toHTML() {}
    
    // Information
    getDescription() {}
    setDescription(description) {}
    about() {}
    help() {}
}

export {
    Lab
}
