/**
 * @class NakedStickyOverflow
 * @classdesc This web component makes elements or a group of elements horizontally scrollable on overflow while still allowing position: sticky elements to work. With thanks to https://dbushell.com/2025/08/01/anatomy-of-a-web-component/ and https://gomakethings.com/bulletproof-web-component-loading/ for making the component more robust.
 * @version 3.0.0
 * @license https://patrickgrey.co.uk/projects/naked-web-components/LICENCE/
 *  
 * @property {number} data-scroll-speed - the speed of scrolling (lower is slower) e.g. <naked-sticky-overflow data-scroll-speed="1">
 * @property {string} data-hide-button-text - toggle the default button text (defaults to true) e.g. <naked-sticky-overflow data-hide-button-text="false">
 * @property {string} data-hide-button-icon - toggle the button icon (defaults to false) e.g. <naked-sticky-overflow data-hide-button-icon="true">
 * 
 * @author Patrick Grey
 * @example <naked-sticky-overflow><table>...</table></naked-sticky-overflow>
 * 
 */

export default class NakedStickyOverflow extends HTMLElement {

    #buttonLeft = null
    #buttonLeftText = null
    #buttonRight = null
    #buttonRightText = null
    #buttonContainer = null
    #hideButtonText = "true"
    #hideButtonIcon = "false"
    #firstChild = null
    #maxWidth = "100vw"
    #maximumScroll = 0 //limit scrolling to width of content
    #currentTranslateX = 0 //track scrolling progress
    #handleLeftDownInterval = null
    #handleRightDownInterval = null
    #scrollSpeed = 3
    #isReady = false
    #controller // An abort controller to allow multiple listeners to be removed at once

    static register(tagName) {
        if ("customElements" in window) {
            customElements.define(tagName || "naked-sticky-overflow", NakedStickyOverflow);
        }
    }

    /**
    * @function debounce Limit a functions call rate.
    * @param  {Function} func Function to be called
    * @param  {Number} timeout Delay in between function calls
    */
    #debounce(func, timeout = 200) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    /**
    * @function visuallyHideElement Decorate the styles of an element to make it visually hidden.
    * @param  {node} element The element to be decorated
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
    * @function isOverflowing 'getter' provide a public overflow property on the class for external checking.
    */
    get isOverflowing() {
        return this.clientWidth < this.scrollWidth
    }

    /**
    * @function init Initiate class properties and build component.
    */
    #init() {
        this.#controller = new AbortController();
        this.#isReady = true
        // Get configuration from data attributes
        if (this.dataset.scrollSpeed) this.#scrollSpeed = parseInt(this.dataset.scrollSpeed)
        if (this.dataset.hideButtonText) this.#hideButtonText = this.dataset.hideButtonText
        if (this.dataset.hideButtonIcon) this.#hideButtonIcon = this.dataset.hideButtonIcon

        // Count the number of root children inside component. :scope gives us access to first level elements
        const childCount = this.querySelectorAll(`:scope > *`).length
        // Wrap children for scrolling if more than one
        if (childCount > 1) {
            this.#firstChild = this.#addScrollContainer()
        } else {
            // Override existing wrapper for progressive enhancement
            this.#firstChild = this.firstElementChild
            this.#firstChild.style.width = "minmax(fit-content, 100%)"
            this.#firstChild.style.overflow = "initial"
        }
        this.style.display = "block"
        // This is key. Sticky positions will only work with overflow clip
        this.style.overflow = "clip"
        // Required to force overflow
        this.style.maxWidth = this.#maxWidth
        this.style.position = "relative"
        // Maximum distance to scroll
        this.#maximumScroll = (this.scrollWidth - this.clientWidth) * -1
        this.#addButtons()
        this.#initButtons()
        globalThis.addEventListener("resize", this.#handleResize, {
            signal: this.#controller.signal
        })
        this.#checkForOverflow()
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
    * @function disconnectedCallback Tidy up when component is removed.
    */
    disconnectedCallback() {
        this.#controller.abort();
    }

    /**
    * @function addScrollContainer If we have a group of elements on the root of the component, we need to wrap them to have one thing to scroll (I think?)
    */
    #addScrollContainer() {
        const div = document.createElement("div")
        // :scope gives us access to first level elements
        this.querySelectorAll(`:scope > *`).forEach(node => {
            div.append(node)
        })
        this.append(div)
        return div
    }

    /**
    * @function addButtons Add scroll buttons inside a container for positioning
    */
    #addButtons() {
        this.#buttonContainer = document.createElement("div")
        this.#buttonLeft = document.createElement("button")
        this.#buttonRight = document.createElement("button")
        this.#buttonLeftText = document.createElement("span")
        this.#buttonRightText = document.createElement("span")
        this.#buttonLeft.innerHTML = `<svg data-scroll-icon-left aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M12 21a9 9 0 1 0 0 -18a9 9 0 0 0 0 18" /> <path d="M8 12l4 4" /> <path d="M8 12h8" /> <path d="M12 8l-4 4" /></svg>`
        this.#buttonRight.innerHTML = `<svg data-scroll-icon-right aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18" /> <path d="M16 12l-4 -4" /> <path d="M16 12h-8" /> <path d="M12 16l4 -4" /></svg>`
        this.#buttonContainer.dataset.scrollContainer = ""
        this.#buttonLeft.dataset.scrollLeft = ""
        this.#buttonRight.dataset.scrollRight = ""
        this.#buttonLeftText.textContent = "scroll left"
        this.#buttonRightText.textContent = "scroll right"
        this.#buttonLeft.append(this.#buttonLeftText)
        this.#buttonRight.prepend(this.#buttonRightText)
        this.#buttonContainer.style.position = "sticky"
        this.#buttonContainer.style.top = "0"
        this.#buttonContainer.style.zIndex = "2000"
        this.#buttonContainer.style.width = "100%"
        this.#buttonContainer.style.display = "flex"
        this.#buttonContainer.style.justifyContent = "space-between"
        this.#buttonLeft.style.opacity = this.#buttonRight.style.opacity = 0.7
        this.#buttonLeft.style.display = this.#buttonRight.style.display = "flex"
        this.#buttonLeft.style.flexWrap = this.#buttonRight.style.flexWrap = "wrap"
        this.#buttonLeft.style.alignItems = this.#buttonRight.style.alignItems = "center"
        this.#buttonContainer.append(this.#buttonLeft)
        this.#buttonContainer.append(this.#buttonRight)
        this.prepend(this.#buttonContainer)

        if (this.#hideButtonText === "true") {
            this.#visuallyHideElement(this.#buttonLeftText)
            this.#visuallyHideElement(this.#buttonRightText)
        }

        if (this.#hideButtonIcon === "true") {
            const iconLeft = this.#buttonLeft.querySelector(`[data-scroll-icon-left]`)
            iconLeft.style.display = "none"
            const iconRight = this.#buttonRight.querySelector(`[data-scroll-icon-right]`)
            iconRight.style.display = "none"
        }
    }

    /**
    * @function initButtons Add button behaviour for various input types
    */
    #initButtons() {

        const signal = {
            signal: this.#controller.signal
        }

        const eventNamesIn = ["mousedown", "touchstart"]
        eventNamesIn.forEach(eventName => {
            this.#buttonLeft.addEventListener(eventName, () => {
                clearInterval(this.#handleLeftDownInterval)
                this.handleLeftDown(this)
            }, signal)

            this.#buttonRight.addEventListener(eventName, () => {
                clearInterval(this.#handleRightDownInterval)
                this.handleRightDown(this)
            }, signal)
        })

        this.#buttonLeft.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                clearInterval(this.#handleLeftDownInterval)
                this.handleLeftDown(this)
            }
        }, signal)

        this.#buttonRight.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                clearInterval(this.#handleRightDownInterval)
                this.handleRightDown(this)
            }
        }, signal)

        const eventNamesOut = ["mouseup", "mouseleave", "touchend", "touchcancel"]
        eventNamesOut.forEach(eventName => {
            this.#buttonLeft.addEventListener(eventName, () => { clearInterval(this.#handleLeftDownInterval) })
            this.#buttonRight.addEventListener(eventName, () => { clearInterval(this.handleRightDownInterval) })
            document.addEventListener(eventName, () => { clearInterval(this.#handleLeftDownInterval) })
            document.addEventListener(eventName, () => { clearInterval(this.#handleRightDownInterval) })
        }, signal)

        this.#buttonLeft.addEventListener("keyup", (event) => {
            if (event.key === "Enter") clearInterval(this.#handleLeftDownInterval)
        }, signal)

        this.#buttonRight.addEventListener("keyup", (event) => {
            if (event.key === "Enter") clearInterval(this.#handleRightDownInterval)
        }, signal)

        this.#emit('ready')
    }

    /**
    * @function handleLeftDown Scroll content to the right
    */
    handleLeftDown() {
        this.#handleLeftDownInterval = setInterval(() => {
            if (this.#currentTranslateX < 0) {
                this.#currentTranslateX += this.#scrollSpeed
                // Note: scroll() doesn't seem to work with overflow clip so a transform is used instead
                this.#firstChild.style.transform = `translateX(${this.#currentTranslateX}px)`
            } else {
                this.#currentTranslateX = 0
                this.#firstChild.style.transform = `translateX(0px)`
            }
        }, 10)
    }

    /**
    * @function handleRightDown Scroll content to the left
    */
    handleRightDown() {
        this.#handleRightDownInterval = setInterval(() => {
            if (this.#maximumScroll < this.#currentTranslateX) {
                this.#currentTranslateX -= this.#scrollSpeed
                // Note: scroll() doesn't seem to work with overflow clip so a transform is used instead
                this.#firstChild.style.transform = `translateX(${this.#currentTranslateX}px)`
            } else {
                this.#currentTranslateX = this.#maximumScroll
                this.#firstChild.style.transform = `translateX(${this.#maximumScroll}px)`
            }
        }, 10)
    }

    /**
    * @function checkForOverflow Only show buttons when overflow happens
    */
    #checkForOverflow() {
        const scrollContainer = document.querySelector(`[data-scroll-container]`)
        scrollContainer.style.display = this.isOverflowing ? "flex" : "none"
    }

    /**
    * @function handleResize Debounced resize handler. Scrolling and scroll tracking is also reset here.
    */
    #handleResize = this.#debounce(() => {
        this.#checkForOverflow()
        this.#maximumScroll = (this.scrollWidth - this.clientWidth) * -1
        this.#currentTranslateX = 0
        this.#firstChild.style.transform = `translateX(0px)`
    }, 20);

    /**
     * @function emit Emit a custom event
     * @param  {String} type   The event name suffix
     * @param  {Object} detail Details to include with the event
     */
    #emit(type, detail = {}) {

        // Create a new event
        let event = new CustomEvent(`naked-sticky-overflow:${type}`, {
            bubbles: true,
            cancelable: true,
            detail: detail
        });

        // Dispatch the event
        return this.dispatchEvent(event);
    }


}

NakedStickyOverflow.register();