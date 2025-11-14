/**
 * @class NakedXOfX
 * @classdesc Provides a count of visible items in the format: "[visible count] of [total count]". Items are selected using a selector. If an item's display = "none", it is part of the total but not part of the count. So, a table with 10 rows and 4 rows are display: "none", the output will be "<span data-x-count>6</span> of <span data-x-total>10</span>". If you want to use your own text, put text inside the component and use data attributes to place the numbers e.g.: "Showing <span data-x-count></span> of <span data-x-total></span> rows".
 * 
 * @version 3.0.0
 * @license https://patrickgrey.co.uk/projects/naked-web-components/LICENCE/
 * 
 * @property {string} data-item-selector - the items to count.
 * 
 * @author Patrick Grey
 * @example <p>Showing: <naked-x-of-x data-item-selector="table>tbody>tr"></naked-x-of-x> rows.</p>
 * 
 */

export default class NakedXOfX extends HTMLElement {

    #isReady = false
    #controller // An abort controller to allow multiple listeners to be removed at once
    #itemSelector
    #items
    #itemsTotal
    #hasText = true
    #itemsText
    #itemsTextTotal
    #observer

    static register(tagName) {
        if ("customElements" in window) {
            customElements.define(tagName || "naked-x-of-x", NakedXOfX)
        }
    }

    /**
    * @function countVisible Count visible items.
    */
    #countVisible() {
        let showingCount = 0;
        this.#items.forEach(item => {
            if (item.style.display != "none") showingCount++
        })
        if (this.#hasText) {
            this.#itemsText.textContent = showingCount
            this.#itemsTextTotal.textContent = this.#itemsTotal
        } else {
            this.innerHTML = `<span data-x-count>${showingCount}</span> of <span data-x-total>${this.#itemsTotal}</span>`
        }
    }

    #setTotal() {
        this.#items = Array.from(document.querySelectorAll(this.#itemSelector))
        this.#itemsTotal = this.#items.length
    }

    /**
    * @function mutationCallback React to observer changes.
    */
    #mutationCallback = (mutationList, observer) => {
        this.#countVisible()
    }

    /**
    * @function init Initiate class properties and build component.
    */
    #init() {
        this.#controller = new AbortController()
        this.#isReady = true

        // Validate setup
        if (!this.dataset.itemSelector) return console.warn("A data-item-selector attribute is required for the <naked-x-of-x> component.")

        if (this.textContent != "" && (!this.querySelector(`[data-x-count]`) || !this.querySelector(`[data-x-total]`))) {
            return console.warn("If you put text inside the <naked-x-of-x> component, it needs to have a <span> for each value: <span data-x-count> & <span data-x-total>.")
        }

        this.#itemSelector = this.dataset.itemSelector

        this.#setTotal()

        if (this.#itemsTotal === 0) {
            this.innerHTML = "No items found"
            return console.warn("<naked-x-of-x> component: no items were found.")
        }

        if (this.textContent === "") this.#hasText = false
        this.#itemsText = this.querySelector(`[data-x-count]`)
        this.#itemsTextTotal = this.querySelector(`[data-x-total]`)

        this.#observer = new MutationObserver(this.#mutationCallback)
        this.#items.forEach(item => {
            this.#observer.observe(item, { attributes: true });
        })

        this.#countVisible()

        this.#emit('ready')
    }

    /**
     * @function connectedCallback Bulletproofing web component loading: https://gomakethings.com/bulletproof-web-component-loading/ Ensure component works even if script loaded in head without defer.
     */
    connectedCallback() {
        if (document.readyState !== 'loading') {
            this.#init()
            return
        }
        document.addEventListener('DOMContentLoaded', () => { this.init() }, {
            signal: this.#controller.signal
        });
    }

    /**
    * @function disconnectedCallback Tidy up when component is removed
    */
    disconnectedCallback() {
        this.#controller.abort()
    }

    /*
    PUBLIC
    */
    refresh() {
        this.#setTotal()
        this.#countVisible()
    }
    /*
    PUBLIC END
    */

    /*
    GETS
    */

    /**
    * @function isReady 'getter' provide a public ready property on the class for external checking.
    */
    get isReady() {
        return this.#isReady
    }

    /**
    * @function total 'getter' provide a the total number of items.
    */
    get total() {
        return this.#itemsTotal
    }

    /*
    GETS END
    */

    /*
    UTILS
    */

    /**
     * @function emit Emit a custom event
     * @param  {String} type   The event name suffix
     * @param  {Object} detail Details to include with the event
     */
    #emit(type, detail = {}) {

        // Create a new event
        let event = new CustomEvent(`naked-x-of-x:${type}`, {
            bubbles: true,
            cancelable: true,
            detail: detail
        });

        // Dispatch the event
        return this.dispatchEvent(event);
    }

    /*
    UTILS END
    */
}

NakedXOfX.register();