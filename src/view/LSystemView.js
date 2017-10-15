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


const TAB = 9;
const INDENT = "  ";
const _originalLSystem = new WeakMap();

/**
 * The LSystemView offers an editor to edit the LSystem definition.
 *
 * @property {String} originalLSystem - the initial LSystem definition
 * @property {String} lsystem -  the current LSystem definition
 */
class LSystemView extends View {

    /**
     * Create a new LSystemView
     *
     * @param {HTMLElement} element
     * @param {LSystem} lsystem
     * @param {Object} [config = {}]
     */
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
        let textarea = this.element.querySelector("textarea");
        if (null === textarea) {
            return "";
        } else {
            return textarea.value;
        }
    }

    set lsystem(str) {
        let textarea = this.element.querySelector("textarea");

        if (null === textarea) {
            const editorElement = document.createElement("div");
            editorElement.classList.add("editor");
            textarea = document.createElement("textarea");

            // allow for tab key
            textarea.addEventListener("keydown", (event) => {
                if (TAB === event.which) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    textarea.value = 
                        `${textarea.value.substr(0, start)}${INDENT}${textarea.value.substr(end)}`;
                    textarea.selectionStart = textarea.selectionEnd = start + INDENT.length;
                    event.preventDefault();
                    return false;
                }
            });

            editorElement.appendChild(textarea);
            this.element.appendChild(editorElement);
        }

        textarea.value = str;
    }
}

export {
    LSystemView
};

