/**
 * @class NakedFilter
 * @classdesc Shows and hides things depending on your humans input. You can work "HTML first" by wrapping the component around HTML e.g. a label and text input or a label and select element or a fieldset that contains radio inputs with labels. If you use [data-item-attribute-selector] (selects and radios only) but not [data-item-text-selector], the component will look for the existence of that attribute. In this case, the select or radio should have only values of true and false. If [data-item-text-selector] has a value, the component will look for that value on the attribute.
 * 
 * @version 3.1.0
 * @license https://patrickgrey.co.uk/projects/naked-web-components/LICENCE/
 * 
 * 
* @property {string}   `data-type`: ["input", "select", "radio"] the filter UI type (default is input). If you are enhancing a select or radio input set, you must set the data-type.
* @property {string}   `data-label`: Will be the text used for the filter element label. If a label already exists in the component, that will be used.
* @property {string}   `data-items-selector`: A selector string. for the list of items you want to filter e.g.
    `<naked-filter data-items-selector="tbody>tr">`
* @property {string}   `data-item-text-selector`: where to find the text in the item to filter on. e.g. `<naked-filter data-item-text-selector=":scope>td:nth-child(2)>span" >`
 * @property {string} `data-item-attribute-selector` - If data-item-attribute-has-value doesn't exist, the filter will search for the existance of an attribute on the item instead of text. If data-item-attribute-has-value is used, the filter will search for the value of that attribute
 * @property {string} `data-item-attribute-has-value` - Search for the value of an attribute on the item.
 * @property {string} `data-display-type` - the style.display value when showing an item. Defaults to "table-row" as I think this component will be used most often on tables e.g. `<naked-filter data-display-type="block">` will result in style.display = "block", instead of the default style.display = "table-row".
 * 
 * 
 * @author Patrick Grey
 * @example <div><naked-filter data-items-selector="tbody>tr" data-item-text-selector=":scope>td:nth-child(2)>span"></naked-filter></div>
 * 
 * 
 */

export default class NakedFilter extends HTMLElement {

    #isReady = false
    #controller // An abort controller to allow multiple listeners to be removed at once
    #items
    #textSelector = ""
    #attributeSelector = ""
    #attributeHasValue = false
    #ATTRIBUTE_TEXT = "data-item-attribute-has-value"
    #model = []
    #displayType = "table-row"
    #elementType = "input"
    #element
    #elementRadios = []
    #labelText = ""
    #label = undefined
    #EMPTY = "EMPTY"
    #ALL = "all"
    #SELECT = "select"
    #INPUT = "input"
    #RADIO = "radio"
    #value = this.#ALL
    #override

    static register(tagName) {
        if ("customElements" in window) {
            customElements.define(tagName || "naked-filter", NakedFilter)
        }
    }

    /*
    EVENT HANDLERS
    */

    /**
    * @function handleChange Handle input value changes.
    */
    #handleChange(event) {
        //This works as only one component will run show all
        this.showAllItems()
        this.#emit('change')
    }

    /*
    EVENT HANDLERS END
    */

    /*
    GENERAL FUNCTIONS
    */

    /**
    * @function addElemenet Check for existing elements. If none, create and return input element.
    */
    #addElemenet(dynamicID) {
        let element = undefined
        if (this.#elementType === this.#INPUT) {
            element = document.createElement("input")
            element.type = "text"
        } else if (this.#elementType === this.#SELECT) {
            element = document.createElement("select")
            this.#buildSelect(element)
        } else if (this.#elementType === this.#RADIO) {
            element = this.querySelector(`fieldset`)
        }

        // this.#element = element

        if (this.#elementType === this.#INPUT || this.#elementType === this.#SELECT) {
            element.id = dynamicID
            element.style.fontSize = "inherit"
            // element.style.minHeight = "42px"
            // if (this.#elementType === this.#SELECT) element.style.minHeight = "48px"
        } else if (this.#elementType === this.#RADIO) {

        }

        return element
    }

    /**
    * @function addLabel Create and return a label. Text is wrapped in a span for styling
    */
    #addLabel(dynamicID) {
        const label = document.createElement("label")
        const span = document.createElement("span")
        span.textContent = this.#labelText
        label.append(span)
        label.setAttribute("for", dynamicID)
        return label
    }

    /**
    * @function buildSelect Build unique select options based on text in items
    */
    #buildSelect(element) {
        // * @function addLiveRegion If required.
        const optionAll = document.createElement("option")
        // #addLiveRegion() {
        optionAll.text = "Show all"
        optionAll.value = this.#ALL
        element.append(optionAll)
        let tempArray = []
        this.#model.forEach(item => {
            tempArray.push(item.text)
        })
        tempArray.sort()
        const optionsArray = new Set(tempArray)
        let emptyOption = null
        optionsArray.forEach(text => {
            const option = document.createElement("option")
            option.text = option.value = text === "" ? this.#EMPTY : text
            if (option.value === this.#EMPTY) emptyOption = option
            element.append(option)
        })

        if (emptyOption) element.append(emptyOption)
    }

    /**
    * @function showAllItems Public reset to show all items
    */
    showAllItems() {
        this.#model.forEach(itemObject => {
            itemObject.item.style.display = this.#displayType
        })
    }


    /**
    * @function addLiveRegion If required.
    */
    #addLiveRegion() {
        if (!document.querySelector(`p[data-naked-filter-live]`)) {
            const p = document.createElement("p")
            p.setAttribute("data-naked-filter-live", "")
            p.setAttribute("aria-live", "polite")
            this.#visuallyHideElement(p)
            document.body.append(p)
        }
    }

    /**
    * @function announceFilter Screen readers announce that filter occured.
    */
    #announceFilter() {
        const live = document.querySelector(`p[data-naked-filter-live]`)
        live.textContent = `${this.#labelText} filtered`

        setTimeout(() => {
            live.textContent = "";
        }, 1000)
    }

    /**
    * @function runFilter Loop over each item and check if should be hidden
    * @param  {String} searchTerm The term to er search for.
    */
    #runFilter(searchTerm) {
        console.log("runFilter");
        this.#model.forEach(itemObject => {
            const fullText = itemObject.text.toLowerCase()

            if (this.#elementType === this.#INPUT && !fullText.includes(searchTerm.toLowerCase())) {
                itemObject.item.style.display = "none"
            } else if (this.#elementType === this.#SELECT || this.#elementType === this.#RADIO) {
                if (this.#attributeSelector != "" && !this.#attributeHasValue) {
                    if (searchTerm === "true") {
                        if (!itemObject.item.hasAttribute(this.#attributeSelector)) itemObject.item.style.display = "none"
                    } else {
                        if (itemObject.item.hasAttribute(this.#attributeSelector)) itemObject.item.style.display = "none"
                    }
                } else if (this.#attributeSelector != "" && this.#attributeHasValue) {
                    if (itemObject.item.hasAttribute(this.#attributeSelector)) {
                        // Hide items with attribute but without matching value
                        if (itemObject.item.getAttribute(this.#attributeSelector) != searchTerm) {
                            itemObject.item.style.display = "none"
                        }
                    } else { //Hide items without attribute
                        itemObject.item.style.display = "none"
                    }
                } else if (this.#textSelector != "" && fullText != searchTerm.toLowerCase() && searchTerm != this.#EMPTY) {
                    itemObject.item.style.display = "none" // Search by text, not attribute
                } else if (searchTerm === this.#EMPTY && fullText != "") {
                    itemObject.item.style.display = "none" // Search for empty content of text selector
                }
            }
        })

        this.#announceFilter()
    }

    /**
    * @function getItemText Get the text from an item using the text selector if it exists
    * @param  {Element} item The term to extract text from.
    */
    #getItemText(item) {
        let text = ""
        if (this.#textSelector != "") {
            if (item.querySelector(this.#textSelector)) {
                text = item.querySelector(this.#textSelector).textContent.trim()
            }
        } else {
            text = item.textContent.trim()
        }
        return text
    }

    #addHandlers() {
        if (this.#elementType === this.#INPUT) {
            this.#element.addEventListener("input", (event) => { this.#handleChange(event) })
            this.#element.addEventListener("keyup", (event) => { this.#handleChange(event) })
        } else if (this.#elementType === this.#SELECT) {
            this.#element.addEventListener("change", (event) => { this.#handleChange(event) })
        }
    }

    /**
    * @function init Initiate class properties and build component.
    */
    #init() {
        this.#controller = new AbortController()
        this.#isReady = true

        this.#emit('get-override');

        if (this.dataset.filterType) this.#elementType = this.dataset.filterType

        if (
            this.#elementType != this.#INPUT &&
            this.#elementType != this.#SELECT &&
            this.#elementType != this.#RADIO
        ) {
            return console.warn(`data-filter-type ${this.dataset.filterType} not recognised.`)
        }

        let elementSelector = `input[type="text"]`
        if (this.#elementType === this.#SELECT) {
            elementSelector = `select`
        } else if (this.#elementType === this.#RADIO) {
            elementSelector = `input[type="radio"]`
            if (this.querySelectorAll(elementSelector).length === 0) return console.warn(`.<naked-filter> with type "radio" needs existing radio inputs.`)
        }

        // Check that existing elements have the correct HTML elements
        if (this.children.length !== 0 && (!this.querySelector(`label`) || !this.querySelector(elementSelector))) {
            return console.warn(`<naked-filter> component has content but either a label or an element or both are missing.`)
        }

        if (this.dataset.label) this.#labelText = this.dataset.label
        if (this.dataset.displayType) this.#displayType = this.dataset.displayType
        if (this.dataset.itemsSelector) this.#items = Array.from(document.querySelectorAll(this.dataset.itemsSelector))
        if (!this.#items) return console.warn("No filterable items were found.")

        this.#textSelector = (this.dataset.itemTextSelector) ? this.dataset.itemTextSelector : ""
        this.#attributeSelector = (this.dataset.itemAttributeSelector) ? this.dataset.itemAttributeSelector : ""
        this.#attributeHasValue = this.hasAttribute(this.#ATTRIBUTE_TEXT)

        this.#items.forEach(item => {
            const text = this.#getItemText(item)
            this.#model.push({ item, text })
        })

        // console.log("this.#model: ", this.#model);

        this.#addLiveRegion()
        const dynamicID = window.crypto.randomUUID()
        // Use existing elements
        if (this.children.length !== 0) {
            if (this.#elementType === this.#INPUT || this.#elementType === this.#SELECT) {
                this.#element = this.querySelector(elementSelector)
                // init listener
                this.#addHandlers()
            } else if (this.#elementType === this.#RADIO) {
                this.#element = this
                this.querySelectorAll(elementSelector).forEach(radio => {
                    this.#elementRadios.push(radio)
                    radio.addEventListener("change", (event) => {
                        if (radio.checked) {
                            this.value = radio.value
                            this.#handleChange(event)
                        }
                    })
                })
            }
        } else { // Create new elements as none exist
            this.#element = this.#addElemenet(dynamicID)
            this.#label = this.#addLabel(dynamicID)
            const div = document.createElement("div")
            this.append(this.#label)
            div.append(this.#element)
            this.append(div)
            this.#addHandlers()
        }


        document.addEventListener("naked-filter:change", (event) => {
            const searchTerm = this.#element.value
            if (this.#override) {
                this.#override(searchTerm)
            } else {
                if (this.#elementType === this.#INPUT) {
                    if (searchTerm != "") this.#runFilter(searchTerm)
                } else if (this.#elementType === this.#SELECT) {
                    if (searchTerm != this.#ALL) this.#runFilter(searchTerm)
                } else if (this.#elementType === this.#RADIO) {
                    if (searchTerm != this.#ALL) this.#runFilter(searchTerm)
                }
            }
        }, {
            signal: this.#controller.signal
        })

        this.#emit('ready')
    }

    /**
     * @function setOverride connectedCallback #emits a custom event. When external code detects that event,
     * this function can be called to pass in an override filter function. The override function
     * will run instead of the default one.
     * @param  {function} override a function used to prepare text before comparison for sorting
     * @see compare
    */
    setOverride(override) {
        this.#override = override
    }

    /*
    GENERAL FUNCTIONS END
    */

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
    * @function disconnectedCallback Tidy up when component is removed.
    */
    disconnectedCallback() {
        this.#controller.abort()
    }



    /*
    GETS
    */

    /**
    * @function isReady 'getter' provide a public ready property on the class for external checking.
    */
    get isReady() {
        return this.#isReady
    }

    get value() {
        return this.#value
    }

    set value(_value) {
        this.#value = _value
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
        let event = new CustomEvent(`naked-filter:${type}`, {
            bubbles: true,
            cancelable: true,
            detail: detail
        });

        // Dispatch the event
        return this.dispatchEvent(event);
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

    /*
    UTILS END
    */


}

NakedFilter.register();