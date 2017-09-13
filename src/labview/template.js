export default `<ul class="tab-group">
    <li class="tab" data-section="view">
        <input  id="labview-view" type="radio" name="sections" checked="checked" />
        <label 
            for="labview-view" 
            title="View interpreted L-System"
            >
            ♣
        </label>
        <div class="contents">
            <ul class="actions">
                <li><button data-action="create" type="button"
                        title="Create a new L-System">★</button></li>
                <li><button data-action="open" type="button"
                        title="Open a L-System from the file
                        system">▲</button></li>
                <li><button data-action="save" type="button"
                        title="Save this L-System to your file
                        system">▼</button></li>
                <li class="spacer">|</li>
                <li><button data-action="exportToPng"
                        type="button" title="Export this
                        interpretation to PNG">▼ PNG</button></li>
                <!--<li><button data-action="exportToSvg"
                        type="button">▼ SVG</button></li>-->
                <!--<li><button data-action="exportToHtml"
                        type="button">▼ HTML</button></li>-->
                <li class="spacer">|</li>
                <li><button data-action="run" type="button"
                        title="Run the interpretation">▶️</button></li>
                <li><button data-action="pause" type="button"
                        title="Pause the interpretation">⏸</button></li>
                <li><button data-action="step" type="button"
                        title="Derive and interpret the next
                        successor">1</button></li>
                <li><button data-action="reset" type="button"
                        title="Reset the interpretation">⏮</button></li>
            </ul>
            <div class="canvas"></div>
        </div>
    </li>
    <li class="tab" data-section="lsystem">
        <input  id="labview-lsystem" type="radio" name="sections" />
        <label 
            for="labview-lsystem" 
            title="L-System definition"
            >
            L-System
        </label>
        <div class="contents">
            <h1>L-System definition</h1>
            <textarea name="labview-lsystem-editor" class="editor"></textarea>
        </div>
    </li>
    <li class="tab" data-section="interpretation">
        <input  id="labview-interpretation" type="radio" name="sections" />
        <label 
            for="labview-interpretation"
            title="Configure interpretation"
            >
            Interpretation
        </label>
        <div class="contents">
            <h1>Configure interpretation</h1>
            <h2>Global options</h2>
            <table>
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Value</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <select
                                name="interpretation-properties"
                                >
                                <option value="placeholder">
                                    Add property
                                </option>
                            </select>
                        </td>
                        <td>
                            <input type="text" />
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <h2>Commands</h2>
            <table>
                <thead>
                    <tr>
                        <th>Command</th>
                        <th>Definition</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <select
                                name="interpretation-commands"
                                >
                                <option value="placeholder">
                                    Add command
                                </option>
                            </select>
                        </td>
                        <td>
                            <textarea></textarea>
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </li>
    <li class="tab right" data-section="help">
        <input  id="labview-help" type="radio" name="sections" />
        <label 
            for="labview-help"
            title="Show help about the virtual botanical laboratory"
            >
            ?
        </label>
        <div class="contents">
            <h1>Help</h1>
        </div>
    </li>
    <li class="tab right" data-section="about">
        <input  id="labview-about" type="radio" name="sections" />
        <label 
            for="labview-about"
            title="About virtual botanical laboratory"
            >
            i
        </label>
        <div class="contents">
            <h1>About</h1>
        </div>
    </li>
</ul>`;
