To run the `virtual_botanical_laboratory`, you need to:

-   include `dist/virtual_botanical_laboratory.js` in your HTML file. For
    example in the HEAD like:

    ```{.html}
    <!DOCTYPE html>
    <html>
        <head>
            <script src="dist/virtual_botanical_laboratory.js"></script>
    ```
-   create a LabView and configure it. For example:
    
    ```{.html}
    <figure id="lab"></figure>
    <script>
        new virtual_botanical_laboratory.LabView("#lab", {
            lsystem: `simple_tree = lsystem(
                description: "Simple growing tree",
                alphabet: {F, O, I, -, +},
                axiom: F I F I F I,
                productions: {
                    O < O > O -> I,
                    O < O > I -> I [ - F I F I ],
                    O < I > O -> I,
                    O < I > I -> I,
                    I < O > O -> O,
                    I < O > I -> I F I,
                    I < I > O -> I,
                    I < I > I -> O,
                    + -> -,
                    - -> +
                },
                ignore: {+, -, F}
            )`,
            interpretation: {
                config: {
                    x: 200,
                    y: 300,
                    width: 600,
                    height: 400,
                    d: 10,
                    delta: (-22.5 * Math.PI)/180,
                    alpha: (270 * Math.PI)/180,
                    close: false,
                    derivationLength: 10,
                    animate: false
                }
            }
        });
    </script>
    ```
-   and
    [open](https://heerdebeer.org/Software/virtual_botanical_laboratory/examples/example-labview.html) the HTML file in a modern web browser!

For more examples, please see the
[examples](https://heerdebeer.org/Software/virtual_botanical_laboratory/#reading).
