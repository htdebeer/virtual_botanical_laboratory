export default `
.lab-view {
    font-size: 12pt;
}

.lab-view .tabs {
    position: relative;
    min-height: 200px;
    height: 600px;
    clear: both;
    margin: 1px;
    padding: 0;
    
    background: Chartreuse;
    border: 1px solid dimgray;
    padding-top: 10px;
}

.lab-view .tab {
    list-style: none;
    float: left;
    height: 100%;
}

.lab-view .tab.right {
    float: right;
}

.lab-view .tab > label {
    padding: 10px;
    left: 1px;
}

.lab-view .tab > label:hover {
    background: GreenYellow;
}

.lab-view .tab > input[type="radio"] {
    display: none;
}

.lab-view .tab .contents {
    position: absolute;
    top: 38px;
    left: 0;
    background: white;
    right: 0;
    bottom: 0;
    padding: 5px;
    padding-bottom: 10px;
    border-top: 1px solid dimgray;
    overflow: auto;
}

.lab-view .tab > input[type=radio]:checked ~ label {
    background: dimgray;
    color: white;
    border-bottom: 1px white;
    z-index: 2;
}

.lab-view .tab > input[type=radio]:checked ~ label ~ .contents {
    z-index: 1;
}

.lab-view .tab > .contents h1 {
    font-size: 16pt;
    margin-top: 10px;
}

.lab-view .tab > .contents h2 {
    font-size: 14pt;
}

.lab-view .tab .actions {
    margin: 0;
    padding: 0;
    position: sticky;
    left: 0px;
    top: 0px;
}

.lab-view .tab .actions li {
    list-style: none;
    float: left;
}

.lab-view .tab .actions button {
    padding: 0px;
    margin: 1px;
    color: black;
}

.lab-view .tab .actions .spacer {
    padding-left: 5px;
    color: transparent;
}

.lab-view .editor {
    width: 100%;
    height: 90%;
}
`;
