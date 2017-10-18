## Building

-   To build the `virtual_botanical_laboratory`, run

    ```{.bash}
    npm install
    npm run build
    ```

-   To generate the API documentation, run

    ```{.bash}
    npm run doc
    ```

-   To generate the manual you need
    [pandocomatic](https://heerdebeer.org/Software/markdown/pandocomatic/) and
    [Bash](https://www.gnu.org/software/bash/), run

    ```{.bash}
    ./generate_documentation.sh
    ```

## Todo {#todo}

The `virtual_botanical_laboratory` is still a work in progress. With the
current version you can explore much of the material in the book *The algorithmic
beauty of plants* [@Prusinkiewicz1990a]. Some more advanced features from
later in that book needs to be implemented still.

The following list of features and improvements are still to do:

-   **L-system language**:
    -   **Import**ing other l-systems
    -   **`&`** operator
    -   Other stuff from later in the book
-   **Interpretation**:
    -   Rendering **3D** interpretations
-   An **improved user interface**. The current interface is just a placeholder.
    Enough to configure and experiment with l-systems, but in not
    user-friendly. Feel free to replace it with something better, pull
    requests are welcome!
