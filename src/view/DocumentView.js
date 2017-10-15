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

const _contents = new WeakMap();

/**
 * DocumentView represents a tab with textual contents only.
 *
 * @property {String} contents, a HTML String detailing the contents of this
 * DocumentView.
 */
class DocumentView extends View {

    /**
     * Create a new DocumentView.
     *
     * @param {HTMLElement} elt
     * @param {String} name
     * @param {Object} config. If config contains a String property
     * 'contents', that is used as this DocumentView's contents.
     */
    constructor(elt, name, config = {}) {
        super(elt, name, config);
        this.contents = config.contents || "";
    }

    get contents() {
        return _contents.get(this);
    }

    set contents(str) {
        let contentsEl = this.element.querySelector(".document-contents");
        if (null === contentsEl) {
            contentsEl = document.createElement("div");
            contentsEl.classList.add("document-contents");
            this.element.appendChild(contentsEl);
        }
        contentsEl.innerHTML = str;
        _contents.set(this, str);
    }

}

export {
    DocumentView
};
