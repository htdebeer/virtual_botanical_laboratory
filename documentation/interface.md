The `virtual_botanical_laboratory` has a very simple and bare-bones user
interface. It has been added more as an afterthought than that it has been
designed with user experience in mind. (Feel free to
create a better interface, `virtual_botanical_laboratory` is free software
after all.)

The interface is meant to show the generated images while giving the user
access to the underlying L-system and the configuration of the interpretation
of that L-system.

The user interface consists of five tab pages:

1.  On the *main* tab page, labeled with **♣**, you can see the rendered
    L-system (see figure below). It also has some buttons to control the
    L-system and export the rendering. 

    ![The *main* tab to view and control the
    L-system](https://heerdebeer.org/Software/virtual_botanical_laboratory/images/ui/main-tab.png)

    The following "file" actions are available:

    *   **★** (New): create a new empty virtual botanical laboratory in a new
        window.
    *   **▼ HTML** (Export to HTML): export the virtual
        botanical laboratory to a HTML file. By default, this file is named
        after the
        L-system.
    *   **▼ PNG** (Export to PNG): export the rendered L-system to a PNG file.
        By default, this file is named after the L-system.

    The following "control" actions are available:

    *   **▶️** (Run): derive new successors for the L-system until it has reached the derivation length set by property `derivationLength`. You can set that option on the *Interpretation* tab.
    *   **⏸** (Pause): stop deriving new successor.
    *   **1** (Step): derive the next successor for the L-system. Note. Due to
        the inefficiencies with respect to memory, this might crash your
        browser.
    *   **⏮** (Reset): reset the L-system to the axiom.
2.  You can view and edit the L-system definition on the *L-system* tab (see
    figure below).

    ![The *L-system* tab to view and change the L-system's
    definition](https://heerdebeer.org/Software/virtual_botanical_laboratory/images/ui/lsystem-tab.png)

    When you change the L-system, press the **Update** button to have the
    changes take effect. This will parse the L-system's definition. If you
    make an error, a warning is displayed. If everything is okay, a temporary
    information message to that effect is shown. Switch back to the *main* tab
    to see the changes in action.
3.  You can view and change the configuration of the interpretation on the
    *Interpretation* tab (see figure below).

    ![The *Interpretation* tab to view and change the L-system's
    interpretation](https://heerdebeer.org/Software/virtual_botanical_laboratory/images/ui/interpretation-tab.png)

    On this *Interpretation* tab, there are two sections:

    1.  **Properties**, which is an editable list of properties you can set,
        update, or remove. These properties include:
        
        -   the *width* and *height* of the canvas
        -   the start coordinates *x*, *y*
        -   the start angle *alpha*
        -   the distance to draw each `F` command, *d*
        -   the rotation to apply each `+` and `-` command, *delta*
        -   the *close* property to connect start and end points
        -   the *derivationLength* property to set the number or derivation
            steps to perform
        -   the *animate* property to indicate if each derivation step has to
            be shown or only the final result
        -   the *line-width*
        -   the *line-color*
    2.  **Commands**, which is a list of all commands defined in the L-system.
        You can edit their definitions. Note. the `this` refers to the
        `[Interpretation](https://heerdebeer.org/Software/virtual_botanical_laboratory/documentation/api/Interpretation.html)`.

        The commands `F`, `f`, `+`, and `-` are defined by default. If you
        want to change their behavior, you have to introduce a new symbol in
        the L-system and write its command's code. You can call the default
        implementation as follows:

        ```
        this.getCommand("F").execute(this);
        ```
4.  You can read a short manual on the *Help* tab (labeled *?*).
5.  You can read about the `virtual_botanical_laboratory` and its license on
    the *About* tab (labeled *i*).
