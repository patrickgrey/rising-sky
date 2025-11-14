/**
 * @class NakedTableSort
 * @classdesc This component converts the text or an existing button in a table header cell into a button that will sort the contents of its column. Hidden caption text is added to the table to assist screen readers. The button will automatically sort table cells with plain text. The data-text-find attribute can be added to the component to alter the sorting. Sorting is based around aria-sort. If you set aria-sort on the <th> element, it will be reflected in the button. 
 * 
 * @version 3.0.0
 * @license https://patrickgrey.co.uk/projects/naked-web-components/LICENCE/
 * 
 * @property {string}  data-text-find - If the text you want to sort is nested in the table cell, tell the component where to find the text using a selector e.g. ":scope > div > span"
 * @property {string}  data-is-announce - turn on live region announcing for screen readers. Default is off as many screen readers announce changes to aria-sort.
 * 
 * @author Patrick Grey
 * @example <th><naked-table-sort>Column title text</naked-table-sort></th>
 * 
 * @see https://adrianroselli.com/2021/04/sortable-table-columns.html
 * 
 * TODO: allow pre-existing button with three icons
 * 
 */
export default class NakedTableSort extends HTMLElement {

    #SORT_A_Z = "ascending"
    #SORT_Z_A = "descending"
    #NONE = "none"
    #textFind = ""
    #conversion
    #th
    #button
    #buttonIconSortable
    #buttonIconSortAscending
    #buttonIconSortDescending
    #columnIndex
    #table
    #liveRegion
    #isAnnounce = "false"
    #tbody
    #isReady = false
    #controller // An abort controller to allow multiple listeners to be removed at once

    static register(tagName) {
        if ("customElements" in window) {
            customElements.define(tagName || "naked-table-sort", NakedTableSort);
        }
    }


    /**
     * @function emit Emit a custom event
     * @param  {String} type   The event name suffix
     * @param  {Object} detail Details to include with the event
     */
    #emit(type, detail = {}) {

        // Create a new event
        let event = new CustomEvent(`naked-table-sort:${type}`, {
            bubbles: true,
            cancelable: true,
            detail: detail
        });

        // Dispatch the event
        return this.dispatchEvent(event);
    }

    /**
     * @function setButtonState Toggle visibility of button icons
     */
    #setButtonState() {
        this.#buttonIconSortable.style.display = "none"
        this.#buttonIconSortAscending.style.display = "none"
        this.#buttonIconSortDescending.style.display = "none"
        const sort = this.#getSortOrder()
        if (sort === this.#NONE) {
            this.#buttonIconSortable.style.display = "inline-block"
        } else if (sort === this.#SORT_A_Z) {
            this.#buttonIconSortAscending.style.display = "inline-block"
        } else if (sort === this.#SORT_Z_A) {
            this.#buttonIconSortDescending.style.display = "inline-block"
        }
    }

    /**
    * @function init Initiate class properties and build component.
    */
    #init() {
        this.#controller = new AbortController();
        this.#isReady = true

        if (this.dataset.textFind) this.#textFind = this.dataset.textFind
        if (this.dataset.isAnnounce) this.#isAnnounce = this.dataset.isAnnounce

        this.#th = this.closest("th")
        if (!this.#th) return console.warn("A <th> element could not be found.")

        this.#columnIndex = this.#th.cellIndex + 1

        this.#table = this.closest("table")
        if (!this.#table) return console.warn("A <table> element could not be found.")

        this.#tbody = this.#table.querySelector("tbody")
        if (!this.#tbody) return console.warn("A <tbody> element could not be found.")

        this.#emit('get-conversion');

        // Look for existing button and use that if found
        if (this.querySelector(`button, a`)) {
            const existingElement = this.querySelector(`button, a`)
            this.#createButton(existingElement.textContent, existingElement)
        } else {
            this.#createButton(this.textContent)
        }

        this.#addCaption()
        if (this.#isAnnounce) this.#addLiveRegion()
        // Listen for other sort buttons and remove sort order attribute
        this.#table.addEventListener("naked-table-sort:sort-clicked", (event) => {
            if (event.target != this) {
                this.#setSortOrder()
                this.#setButtonState()
            }
        }, {
            signal: this.#controller.signal
        })

        this.#setButtonState()

        this.#emit('ready')
    }

    /**
     * @function connectedCallback Bulletproofing web component loading: https://gomakethings.com/bulletproof-web-component-loading/ Ensure component works even if script loaded in head without defer.
     */
    connectedCallback() {
        if (document.readyState !== 'loading') {
            this.#init();
            return;
        }
        document.addEventListener('DOMContentLoaded', () => { this.init() }, {
            signal: this.#controller.signal
        });
    }

    /**
    * @function disconnectedCallback Tidy up when component is removed
    */
    disconnectedCallback() {
        this.#controller.abort();
    }

    /**
     * @function visuallyHideElement Decorate the styles of an element to make it visually hidden.
     * @param  {element} element The element to be decorated
     */
    #visuallyHideElement(element) {
        element.style.position = "absolute"
        element.style.top = "auto"
        element.style.overflow = "hidden"
        element.style.clip = "rect(1px, 1px, 1px, 1px)"
        element.style.width = "1px"
        element.style.height = "1px"
        element.style.whiteSpace = "nowrap"
    }

    /**
    * @function isReady 'getter' provide a public ready property on the class for external checking.
    */
    get isReady() {
        return this.#isReady
    }

    /**
    * @function decorateSpan Utility class to create button icon containers. Background image is used so that icons can be replaced with CSS
    */
    #decorateSpan(_span, _class, _svg) {
        _span.classList.add(_class)
        _span.setAttribute("focusable", "false")
        _span.setAttribute("aria-hidden", "true")
        _span.style.backgroundImage = `url("data:image/svg+xml;utf8,${_svg}")`
        _span.style.backgroundRepeat = "no-repeat"
        _span.style.display = "none"
        _span.style.width = "1em"
        _span.style.height = "1em"
        _span.style.marginInlineStart = "0.5em"
    }

    /**
     * @function Create a button with the original cell text.
     * @param {String} text Text for the button.
     * @param {element} _button a button to be passed or if empty, one will be created.
     */
    #createButton(text, _button = null) {
        const button = _button ? _button : document.createElement("button")
        button.textContent = text
        button.style.fontSize = "initial"
        button.style.fontWeight = "bold"
        button.style.minHeight = "42px"

        // Use high contrast colour in high contrast mode
        let svgColour = "currentColor"
        const h = matchMedia('(forced-colors: active)');
        if (h.matches) {
            svgColour = "ButtonText"
        }

        const spanCanSort = document.createElement("span")
        this.#buttonIconSortable = spanCanSort
        this.#decorateSpan(spanCanSort, "icon-can-sort", `<svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 24 24' fill='none' stroke='${svgColour}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 9l4 -4l4 4m-4 -4v14' /><path d='M21 15l-4 4l-4 -4m4 4v-14' /> </svg>`)

        const spanSortAscending = document.createElement("span")
        this.#buttonIconSortAscending = spanSortAscending
        this.#decorateSpan(spanSortAscending, "icon-sort-ascending", `<svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 24 24' fill='none' stroke='${svgColour}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'             > <path d='M5 5m0 .5a.5 .5 0 0 1 .5 -.5h4a.5 .5 0 0 1 .5 .5v4a.5 .5 0 0 1 -.5 .5h-4a.5 .5 0 0 1 -.5 -.5z' /> <path d='M5 14m0 .5a.5 .5 0 0 1 .5 -.5h4a.5 .5 0 0 1 .5 .5v4a.5 .5 0 0 1 -.5 .5h-4a.5 .5 0 0 1 -.5 -.5z' /> <path d='M14 15l3 3l3 -3' /> <path d='M17 18v-12' /></svg > `)

        const spanSortDescending = document.createElement("span")
        this.#buttonIconSortDescending = spanSortDescending
        this.#decorateSpan(spanSortDescending, "icon-sort-descending", `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${svgColour}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'    > <path d='M14 9l3 -3l3 3' /> <path d='M5 5m0 .5a.5 .5 0 0 1 .5 -.5h4a.5 .5 0 0 1 .5 .5v4a.5 .5 0 0 1 -.5 .5h-4a.5 .5 0 0 1 -.5 -.5z' /> <path d='M5 14m0 .5a.5 .5 0 0 1 .5 -.5h4a.5 .5 0 0 1 .5 .5v4a.5 .5 0 0 1 -.5 .5h-4a.5 .5 0 0 1 -.5 -.5z' /> <path d='M17 6v12' /></svg > `)


        button.setAttribute("type", "button")
        button.append(spanCanSort)
        button.append(spanSortAscending)
        button.append(spanSortDescending)

        button.addEventListener("click", (event) => {
            event.preventDefault()
            this.#toggleSortOrder()
            this.#setButtonState()
            this.#sortTable()
            if (this.#isAnnounce) this.#announceSort()
            this.#emit('sort-clicked');
        }, {
            signal: this.#controller.signal
        });

        this.textContent = ""
        this.append(button)
        this.#button = button
    }

    /**
    * @function announceSort Screen readers announce which way sorting went. May not be needed. Test your screen reader audience.
    */
    #announceSort() {
        if (this.#getSortOrder() === this.#SORT_Z_A) {
            this.#liveRegion.textContent = "sorted down";
        } else if (this.#getSortOrder() === this.#SORT_A_Z) {
            this.#liveRegion.textContent = "sorted up";
        }

        setTimeout(() => {
            this.#liveRegion.textContent = "";
        }, 1000)
    }

    /**
    * @function getSortOrder Returns value of aria-sort or "none" if attribute not there.
    */
    #getSortOrder() {
        return this.#th.hasAttribute("aria-sort") ? this.#th.getAttribute("aria-sort") : this.#NONE
    }

    /**
    * @function setSortOrder Sets aria-sort.
    * @param {String} order value for aria-sort.
    */
    #setSortOrder(order) {
        order ? this.#th.setAttribute("aria-sort", order) : this.#th.removeAttribute("aria-sort")
    }

    /**
    * @function toggleSortOrder Sets aria-sort to ascending if set to descending OR attribute isn't on local <th>.
    */
    #toggleSortOrder() {
        if (this.#getSortOrder() === this.#NONE || this.#getSortOrder() === this.#SORT_Z_A) {
            this.#setSortOrder(this.#SORT_A_Z)
        } else {
            this.#setSortOrder(this.#SORT_Z_A)
        }
    }

    /**
    * @function addLiveRegion If required.
    */
    #addLiveRegion() {
        if (this.#table.querySelector("caption")) {
            if (this.#table.querySelector("caption > span[data-live-region]")) {
                this.#liveRegion = this.#table.querySelector("caption > span[data-live-region]")
            } else {
                const caption = this.#table.querySelector("caption")
                this.#liveRegion = document.createElement("span")
                this.#liveRegion.dataset.liveRegion = ""
                caption.append(this.#liveRegion)
            }
            this.#liveRegion.setAttribute("aria-live", "polite")
            this.#visuallyHideElement(this.#liveRegion)
        }
    }

    /**
     * @function Add a hidden table caption with screen reader guidance to the table. If a caption already exists, add hidden text within that caption.
     */
    #addCaption() {
        const captionText = "Use column header buttons to sort"

        if (!this.#table.querySelector("caption")) {
            const caption = document.createElement("caption")
            this.#visuallyHideElement(caption)
            caption.textContent = captionText
            caption.setAttribute("data-sort-caption-added", "")
            this.#table.prepend(caption)
        } else {
            const caption = this.#table.querySelector("caption")
            // check if span has already been added
            if (!caption.querySelector("span[data-sort-caption]") && !caption.hasAttribute("data-sort-caption-added")) {
                const span = document.createElement("span")
                span.setAttribute("data-sort-caption", "")
                this.#visuallyHideElement(span)
                span.textContent = captionText
                caption.append(span)
            }
        }
    }

    /**
     * @function setConversion connectedCallback #emits a custom event. When external code detects that event,
     * this function can be called to pass in a conversion function. The conversion function
     * will be applied to data before it is sorted. This allows for more flexible searching.
     * @param  {function} conversion a function used to prepare text before comparison for sorting
     * @see compare
    */
    setConversion(conversion) {
        this.#conversion = conversion
    }

    /**
     * @function compare Compare function to sort an array of rows.
     *
     */
    #compare() {
        return function (rowA, rowB) {

            let textA = rowA.querySelector(`td:nth-child(${this.#columnIndex}) ${this.#textFind}`)?.textContent || ""
            let textB = rowB.querySelector(`td:nth-child(${this.#columnIndex}) ${this.#textFind}`)?.textContent || ""

            if (this.#conversion) {
                const convertedText = this.#conversion(textA, textB);
                textA = convertedText.newA
                textB = convertedText.newB
            }

            textA = textA.replaceAll(" ", "")
            textB = textB.replaceAll(" ", "")


            if (textA === "" || textA === null) return 1;
            if (textB === "" || textB === null) return -1;
            // if (!textA) textA = "ZZZZZZZZ";
            // if (!textB) textB = "ZZZZZZZZ";

            // sort null last
            // if (textA === "" && textB !== "") {
            //     return -1
            // }
            // if (textB === "" && textA !== "") {
            //     return 1
            // }

            if (this.#getSortOrder() === this.#SORT_A_Z) {
                return textA.localeCompare(textB);
            }
            else {
                return textB.localeCompare(textA);
            }
        }
    }

    /**
     * @function sortTable table rows on given cell target and sort order.
     *
     */
    #sortTable() {
        const tbodyOriginal = this.#table.querySelector("tbody")
        const tbodyClone = document.createElement("tbody")
        const rows = Array.from(tbodyOriginal.rows)
        rows.sort(this.#compare().bind(this))
        tbodyClone.append(...rows)
        this.#table.replaceChild(tbodyClone, tbodyOriginal)
    }

    /**
     * Public getters and setters.
     */

    get button() {
        return this.#button
    }

}

NakedTableSort.register();