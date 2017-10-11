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
const _name = new WeakMap();
const _icon = new WeakMap();
const _tooltip = new WeakMap();
const _callback = new WeakMap();
const _enabled = new WeakMap();

const _element = new WeakMap();

/**
 * Action
 *
 * @property {String} name - this Action's name
 * @property {String} icon - this Action's icon, which is just a unicode
 * character
 * @property {String} tooltip - this Action's tooltip
 * @property {Boolean} enabled - is this Action enabled?
 * @property {HTMLElement} element - the HTML element related to this Action.
 */
class Action {

    /**
     * Create a new Action
     *
     * @param {String} name
     * @param {String} icon
     * @param {String} tooltip
     * @param {Function} callback that is executed when this Action is run
     * @param {Boolean} [enabled = true]
     */
    constructor(name, icon, tooltip, callback, enabled = true) {
        _name.set(this, name);
        _icon.set(this, icon);
        _tooltip.set(this, tooltip);
        _callback.set(this, callback);
        _enabled.set(this, enabled);
    }

    get name() {
        return _name.get(this);
    }

    get icon() {
        return _icon.get(this);
    }

    get tooltip() {
        return _tooltip.get(this);
    }

    /**
     * Is this action enabled?
     *
     * @returns {Boolean} True if this action is enabled, false otherwise
     */
    isEnabled() {
        return true === _enabled.get(this);
    }

    /**
     * Enable this action.
     */
    enable() {
        _enabled.set(this, true);
    }

    /**
     * Disable this action
     */
    disable() {
        _enabled.set(this, false);
    }

    /**
     * Execute this action.
     */
    execute() {
        _callback.get(this).call(null);
    }

    set element(elt) {
        _element.set(this, elt);
    }

    get element() {
        return _element.get(this);
    }

}

export {
    Action
};
