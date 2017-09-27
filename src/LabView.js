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
import {Lab} from "./Lab.js";
import {LSystem} from "./lsystem/LSystem.js";

import STYLE from "./view/style.js";
import ABOUT from "./view/about.js";
import HELP from "./view/help.js";

import {RenderView} from "./view/RenderView.js";
import {DocumentView} from "./view/DocumentView.js";
import {LSystemView} from "./view/LSystemView.js";
import {InterpretationView} from "./view/InterpretationView.js";

import {Action} from "./view/Action.js";
import {Spacer} from "./view/Spacer.js";

const _lab = new WeakMap();
const _parentElement = new WeakMap();
const _element = new WeakMap();
const _config = new WeakMap();

const _tabs = new WeakMap();

const _paused = new WeakMap();


const tab = function (labview, name) {
    const tabs = _tabs.get(labview);
    if (undefined !== tabs && tabs.hasOwnProperty(name)) {
        return tabs[name];
    } else {
        return undefined;
    }
};

const generateId = function () {
    let randomId;
    do {
        randomId = Math.random().toString(16).slice(2);
    } while (null !== document.getElementById(randomId))

    return randomId;
};

const createTab = function (labview, name, text, tooltip, checked = false, right = false) {
    const tab = document.createElement("li");
    tab.classList.add("tab");
    if (right) {
        tab.classList.add("right");
    }
    tab.dataset.section = name;

    const id = generateId();
    const input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("name", "tabs");
    input.setAttribute("id", id);
    if (checked) {
        input.setAttribute("checked", "checked");
    }
    tab.appendChild(input);

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.setAttribute("title", tooltip);
    label.innerHTML = text;
    tab.appendChild(label);

    return tab;
};

const updateLSystem = function (labview, lsystemTab) {
    const lsystemString = lsystemTab.lsystem;
    console.log(lsystemString);
    // If the lsystem has been changed, try to parse it and update lsystem
    if (lsystemTab.originalLSystem !== lsystemString) {
        try {
            const lsystem = LSystem.parse(lsystemTab.lsystem);
            labview.reset();
            labview.lab.lsystem = lsystem;
            lsystemTab.originalLSystem = lsystemString;
            lsystemTab.showMessage("LSystem parsed and updated successfully.", "info", 2000);
        } catch (e) {
            lsystemTab.showMessage(`Error parsing LSystem: "${e}"`, "error");
        }
    }
};

const updateInterpretation = function (labview) {
};

const setupTabs = function (labview, element, tabConfig) {
    const tabsElement = document.createElement("ul")
    tabsElement.classList.add("tabs");
    element.appendChild(tabsElement)

    const tabs = {};

    // General 'render' tab to view and control L-System
    const renderTabElement = createTab(labview, "render", "♣", "View interpreted L-System", true);
    tabsElement.appendChild(renderTabElement);
    const renderTab = tabs['render'] = new RenderView(renderTabElement, {});

    //renderTab.addAction(new Action("create", "★", "Create a new L-System.", () => labview.create()));
    //renderTab.addAction(new Action("open", "▲", "Open a L-System from your computer.", () => labview.open()));
    //renderTab.addAction(new Action("save", "▼", "Save this L-System to your computer.", () => labview.save()));
    //renderTab.addAction(new Spacer());
    //renderTab.addAction(new Action("exportToPng", "▼ PNG", "Export this L-System to a PNG file.", () => labview.exportToPng()));
    renderTab.addAction(new Spacer());
    renderTab.addAction(new Action("run", "▶️", "Run this L-System.", () => labview.run()));
    renderTab.addAction(new Action("pause", "⏸", "Pause this L-System.", () => labview.pause()));
    renderTab.addAction(new Action("step", "1", "Derive the next succesor of this L-System.", () => labview.step()));
    renderTab.addAction(new Action("reset", "⏮", "Reset this L-System.", () => labview.reset()));

    // L-System tab to edit L-System definition
    const lsystemTabElement = createTab(labview, "lsystem", "L-System", "Edit L-System");
    tabsElement.appendChild(lsystemTabElement);
    tabs['lsystem'] = new LSystemView(lsystemTabElement, tabConfig.lsystem, {
        header: "L-System definition"
    });
    tabs['lsystem'].addAction(new Action("update", "update", "Update this L-System.", () => updateLSystem(labview, tabs['lsystem'])));
    
    // Interpretation tab to change properties in the interpretation
    const interpretationTabElement = createTab(labview, "interpretation", "Interpretation", "Edit interpretation");
    tabsElement.appendChild(interpretationTabElement);
    tabs['interpretation'] = new InterpretationView(interpretationTabElement, tabConfig.interpretation, {
        header: "Configure interpretation"
    });
    tabs['interpretation'].addAction(new Action("update", "update", "Update this L-System.", () => updateInterpretation(labview), false));
    
    // About tab with information about the virtual_botanical_lab
    const aboutTabElement = createTab(labview, "about", "i", "About", false, true);
    tabsElement.appendChild(aboutTabElement);
    tabs['about'] = new DocumentView(aboutTabElement, "about", {
        header: "About",
        contents: ABOUT
    });
    
    // Help tab with a manual for the virtual_botanical_lab
    const helpTabElement = createTab(labview, "help", "?", "help", false, true);
    tabsElement.appendChild(helpTabElement);
    tabs['help'] = new DocumentView(helpTabElement, "help", {
        header: "Help",
        contents: HELP
    });

    _tabs.set(labview, tabs);
};

const createLabView = function (labview, parentElementOrSelector, config) {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    const template = document.createElement("div");
    template.classList.add("lab-view");

    let elt;
    if (parentElementOrSelector instanceof Node) {
        elt = parentElementOrSelector;
    } else {
        elt = document.querySelector(parentElementOrSelector);
    }

    elt.append(template);

    setupTabs(labview, template, config);

    return elt;
}

/**
 * A user interface for a Lab.
 *
 * @property {Lab} lab
 */
class LabView {

    /**
     * Create a new LabView.
     *
     * @param {HTMLElement|String} parentElementOrSelector - the parent
     * element, or a selector to the parent element, to which this LabView
     * will be appended.
     * @param {Object} [config = {}] - the initial configuration of this
     * LabView.
     */
    constructor(parentElementOrSelector, config = {}) {
        // TODO: It is probably a good idea to validate the config first, though.
        _config.set(this, Object.create(null, {}));
        Object.assign(_config.get(this), config);

        createLabView(this, parentElementOrSelector, config);
        this.lab = new Lab(config);
        _paused.set(this, false);
    }

    get lab() {
        return _lab.get(this);
    }

    set lab(newLab) {
        _lab.set(this, newLab);
        tab(this, 'render').canvas = this.lab.element;
    }

    // Control the lab view

    set(sectionName, key, value) {
        let section = _config.get(this)[sectionName];
        if (undefined === section) {
            section = Object.create(null);
            _config.get(this)[sectionName] = section;
        }
        section[key] = value;
    }

    get(sectionName, key) {
        const section = _config.get(this)[sectionName];
        return undefined === section ? section[key] : undefined;
    }

    // File and export actions

    create() {
        if (undefined !== this.lab) {
        }
    }

    save() {
        if (undefined !== this.lab) {
        }
    }

    open() {
    }

    exportToPNG() {
        if (undefined !== this.lab) {
        }
    }

    // Control a lab actions

    run() {
        if (undefined !== this.lab) {
            const derivationLength = _config.get(this).derivationLength || 1;

            const steps = derivationLength - this.lab.lsystem.derivationLength;
            this.lab.run(steps);

            _paused.set(this, false);
        }
    }

    step() {
        if (undefined !== this.lab) {
            this.lab.run(1);
        }
    }

    pause() {
        if (undefined !== this.lab) {
            this.lab.stop();
            _paused.set(this, true);
        }
    }

    isPaused() {
        return true === _paused.get(this);
    }

    reset() {
        if (undefined !== this.lab) {
            this.lab.reset();
            _paused.set(this, false);
        }
    }

}

export {
    LabView
}
