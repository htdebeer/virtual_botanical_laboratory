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

const SIZE = 400;

const _element = new WeakMap();
const _lsystem = new WeakMap();
const _interpretation = new WeakMap();
const _config = new WeakMap();
const _description = new WeakMap();

const createCanvas = function (lab) {
    const element = document.createElement("canvas");
    element.width = SIZE;
    element.height = SIZE;
    _element.set(lab, element);
};

class Lab {
    constructor(config = {}) {
        _config.set(this, config);
        createCanvas(this);
        _interpretation.set(this, new CanvasTurtleInterpretation(this.element.getContext("2d"), config.interpretation || {}));

        if (config.lsystem) {
            this.lsystem = config.lsystem;
        }
        if (config.run && Number.isInteger(config.run) && config.run >= 0) {
            this.run(config.run);
        }
    }

    get element() {
        return _element.get(this);
    }

    get config() {
        return _config.get(this);
    }

    get interpretation() {
        return _interpretation.get(this);
    }

    // LSystem
    set lsystem(lsystem) {
        _lsystem.set(this, LSystem.parse(lsystem));
    }

    get lsystem() {
        return _lsystem.get(this);
    }

    get description() {
        return _description.get(this);
    }

    set description(description) {
        _description.set(this, description);
    }


    // actions
    // control rendering
    run(steps = 1) {
        this.interpretation.render(this.lsystem.derive(steps))
    }

    stop() {}
    step() {}
    pause() {}

    reset() {
        
    }

    // Properties
    setProperty(name, value) {}
    getProperty(name) {}
    getAllProperties() {}

    // Commands
    setCommand(name, command) {}
    getCommand(name) {}
    getAllCommands() {}

    // New/open/save
    new() {}
    open(file) {}
    save(file) {}

    //Export
    toPNG() {}
    toSVG() {}
    toHTML() {}
    
    // Information
    about() {
        
        return `The virtual botanical library is a free software project to
        explore the ideas in the book Prusinkiewicz and Lindenmayer (1990) The
        algorithmic beauty of plants. You can find the project at
        https://github.com/htdebeer/virtual_botanical_laboratory.`;

    }

    help() {

        return `There is no help at the moment; the project is still under
        heavy development.`;

    }
}

export {
    Lab
}
