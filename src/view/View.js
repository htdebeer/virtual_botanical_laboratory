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
import {Spacer} from "./Spacer.js";

const _config = new WeakMap();
const _element = new WeakMap();

const _actions = new WeakMap();
const _actionBar = new WeakMap();

const createAction = function (view, action) {
    const element = document.createElement("li");

    if (action instanceof Spacer) {
        element.classList.add("spacer");
        element.innerHTML = action.icon;
    } else {
        const button = document.createElement("button");
        button.dataset.action = action.name;
        button.setAttribute("type", "button");
        button.setAttribute("title", action.tooltip);
        button.innerHTML = action.icon;

        if (action.isEnabled()) {
            button.setAttribute("disabled", "disabled");
        }

        button.addEventListener("click", () => action.execute());

        element.appendChild(button);
    }
    
    _actionBar.get(view).appendChild(element);
    action.element = element;
    _actions.get(view).push(action);
};

const createView = function (view, name, header, parentElt) {
    const contents = document.createElement("div");
    contents.classList.add("contents");
    contents.dataset.name = name;
    parentElt.appendChild(contents);

    if (header) {
        const headerElt = document.createElement("h1");
        headerElt.innerHTML = header;
        contents.appendChild(headerElt);
    }

    const actionBar = document.createElement("ul");
    actionBar.classList.add("actions");
    contents.appendChild(actionBar);
    _actionBar.set(view, actionBar);

    _element.set(view, contents);
};

/**
 * View represents a tab in the LabView.
 *
 * @property {HTMLElement} element
 */
class View {

    constructor(parentElt, name, config = {}) {
        _actions.set(this, []);
        createView(this, name, config.header, parentElt);
        this.configure(config);
    }

    get element() {
        return _element.get(this);
    }

    /**
     * Get action by name
     * 
     * @param {String} name - the name of the action to get.
     * @return {Action} the action or undefined if it cannot be found
     */
    action(name) {
        const foundActions = _actions.get(this).filter((a) => a.name === name);
        if (0 < foundActions.length) {
            return foundActions[0];
        } else {
            return undefined;
        }
    }

    addAction(action) {
        createAction(this, action)
    }

    removeAction(name) {
        const action = this.action(name)
        if (undefined !== action) {
            _actionBar.get(this).removeChild(action.element);
            const actionIndex = _actions.get(this).indexOf(action);
            _actions.get(this).splice(actionIndex, 1);
        }
    }

    configure(config = {}) {
        _config.set(this, config);
    }
};

export {
    View
};
