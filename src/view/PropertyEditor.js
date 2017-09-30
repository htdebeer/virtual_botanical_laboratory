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

const ROWS = 10;

const _element = new WeakMap();
const _propertySpecifications = new WeakMap();
const _properties = new WeakMap();
const _propertyElements = new WeakMap();

const _addSelect = new WeakMap();
const _propertyTable = new WeakMap();

const restOfProperties = function (editor) {
    return editor
        .propertySpecifications
        .filter(p => {
            return !editor.hasProperty(p.name);
        })
    ;
};

const createTableHead = function (keyLabel = "key", valueLabel = "value") {
    const tableHead = document.createElement("thead");
    
    const headRow = document.createElement("tr");

    const keyHeadCell = document.createElement("th");
    keyHeadCell.textContent = keyLabel;
    
    const valueHeadCell = document.createElement("th");
    valueHeadCell.textContent = valueLabel;
    
    headRow.appendChild(keyHeadCell);
    headRow.appendChild(valueHeadCell);
    headRow.appendChild(document.createElement("th"));
    
    tableHead.appendChild(headRow);

    return tableHead;
};

const createOption = function (name) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    return option;
};

const createRow = function (editor, propertyName) {
    const propertySpecification = editor.getPropertySpecification(propertyName);
    let propertyValue = editor.getProperty(propertyName);
       
    if (undefined === propertyValue) {
        propertyValue = propertySpecification.default;
    }
       
    if (undefined === propertyValue) {
        propertyValue = "";
    }

    editor.setProperty(propertyName, propertyValue);

    const row = document.createElement("tr");
    const keyCell = document.createElement("th");
    keyCell.textContent = propertyName;
    row.appendChild(keyCell);

    const valueCell = document.createElement("td");
    valueCell.classList.add("value");
    let valueEditor;
    if ("textarea" === propertySpecification.type) {
        valueEditor = document.createElement("textarea");
        valueEditor.setAttribute("rows", ROWS);
    } else {
        valueEditor = document.createElement("input");
        valueEditor.setAttribute("type", propertySpecification.type);

        if ("number" === propertySpecification.type) {
            valueEditor.setAttribute("step", "any");
        }
    }
    valueEditor.value = propertyValue;
    valueCell.appendChild(valueEditor);
    _propertyElements.get(editor)[propertyName] = valueEditor;
    row.appendChild(valueCell);

    const deleteCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("action");
    deleteButton.classList.add("delete");
    deleteButton.setAttribute("type", "button");
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => {
        editor.deleteProperty(propertyName);
        row.parentNode.removeChild(row);
        _addSelect.get(editor).appendChild(createOption(propertyName));
    });
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);

    return row;
};

const createAddRow = function (editor, addLabel) {
    const row = document.createElement("tr");
    const addCell = document.createElement("td");
    addCell.setAttribute("colspan", 3);
    const select = document.createElement("select");
    
    const label = document.createElement("option");
    label.textContent = addLabel;
    select.appendChild(label);

    restOfProperties(editor).forEach((p) => select.appendChild(createOption(p.name)));

    select.addEventListener("change", () => {
        if (1 <= select.selectedIndex) {
            const selectedOption = select.options[select.selectedIndex];
            const name = selectedOption.value;
            _propertyTable.get(editor).insertBefore(createRow(editor, name), row); 
            select.removeChild(selectedOption);
        }

        select.selectedIndex = 0;
    });

    _addSelect.set(editor, select);

    addCell.appendChild(select);

    row.appendChild(addCell);
    return row;
};

const createTableBody = function (editor, config = {}) {
    const tableBody = document.createElement("tbody");
    Object.keys(editor.properties).forEach(property => {
        tableBody.appendChild(createRow(editor, property));
    });
    tableBody.appendChild(createAddRow(editor, config.addLabel || "Add property…"));

    _propertyTable.set(editor, tableBody);

    return tableBody;
};

const createPropertyEditor = function (editor, config) {
    const editorElement = document.createElement("div");
    editorElement.classList.add("property-editor");

    if (undefined !== config.header) {
        const header = document.createElement("h2");
        header.textContent = config.header;
        editorElement.appendChild(header);
    }

    const table = document.createElement("table");
    table.appendChild(createTableHead(config.keyLabel, config.valueLabel));
    table.appendChild(createTableBody(editor, config));
    editorElement.appendChild(table);
    
    _element.set(editor, editorElement);
};

/**
 * A PropertyEditor is an editor for key-value pairs, for a finite set of
 * keys.
 *
 */
class PropertyEditor {
    constructor(propertySpecifications, properties = {}, config = {}) {
        _propertySpecifications.set(this, propertySpecifications);
        _properties.set(this, properties);
        _propertyElements.set(this, {});

        createPropertyEditor(this, config);
    }

    get element() {
        return _element.get(this);
    }

    get propertySpecifications() {
        return _propertySpecifications.get(this);
    }

    get properties() {
        return _properties.get(this);
    }

    get propertyValues() {
        const props = {};
        Object.keys(_properties.get(this)).forEach((name) => {
            props[name] = _propertyElements.get(this)[name].value;
        });
        return props;
    }

    hasProperty(name) {
        return name in this.properties;
    }

    getProperty(name) {
        return _properties.get(this)[name];
    }

    setProperty(name, value) {
        if (this.isAllowedProperty(name)) {
            this.properties[name] = value;
            // update editor
        } else {
            console.error(`Setting property '${name}' is not allowed. Expected property to be one of {${this.propertySpecifications.map(p => p.name).join(", ")}}.`);
        }
    }

    deleteProperty(name) {
        if (this.hasProperty(name)) {
            delete this.properties[name];
        }
    }

    getPropertySpecification(name) {
        return this.propertySpecifications.find((p) => name === p.name);
    }

    isAllowedProperty(name) {
        return undefined !== this.getPropertySpecification(name);
    }


}

export {
    PropertyEditor
};
