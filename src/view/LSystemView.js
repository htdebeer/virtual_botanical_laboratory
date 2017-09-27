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

const _originalLSystem = new WeakMap();

/**
 * View represents a tab in the LabView.
 *
 * @property {String} lsystem
 */
class LSystemView extends View {

    constructor(elt, lsystem, config = {}) {
        super(elt, "lsystem", config);
        _originalLSystem.set(this, lsystem);
        this.lsystem = lsystem;
    }

    get originalLSystem() {
        return _originalLSystem.get(this);
    }

    set originalLSystem(lsystem) {
        _originalLSystem.set(this, lsystem);
    }

    get lsystem() {
        let pre = this.element.querySelector("pre");
        if (null === pre) {
            return "";
        } else {
            return pre.textContent.replace("<br>", "\n");
        }
    }

    set lsystem(str) {
        let pre = this.element.querySelector("pre");

        if (null === pre) {
            pre = document.createElement("pre");
            pre.contentEditable = true;
            this.element.appendChild(pre);
        }

        pre.innerHTML = str.split("\n").join("<br>");
    }
};

export {
    LSystemView
};

