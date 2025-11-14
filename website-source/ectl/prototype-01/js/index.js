import { initActionMenus } from './action-menus.js'

(() => {

    let isAdmin = true
    let workflowTexts = []
    let workflowUnique
    let alertsModel = []
    let datesModel = []
    const isDev = (document.querySelector("body[data-is-dev]")) ? true : false
    const fpDrawer = document.querySelector(`#fpDrawer`)
    const fpDrawerContent = fpDrawer.querySelector(`iframe[data-drawer-content]`)

    /*
    ##     ## ######## #### ##        ######
    ##     ##    ##     ##  ##       ##    ##
    ##     ##    ##     ##  ##       ##
    ##     ##    ##     ##  ##        ######
    ##     ##    ##     ##  ##             ##
    ##     ##    ##     ##  ##       ##    ##
     #######     ##    #### ########  ######
    */

    /**
    * @function debounce Limit a functions call rate.
    * @param  {Function} func Function to be called
    * @param  {Number} timeout Delay in between function calls
    */
    function debounce(func, timeout = 200) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout)
        };
    }

    function removeMultipleSpaces(text) {
        return text ? text.replace(/\s+/g, " ") : ""
    }

    function getTextNoCommas(text) {
        return text ? removeMultipleSpaces(text).replaceAll(",", " ").trim() : ""
    }

    function removeNewLines(text) {
        return text ? text.replace(/[\r\n]+/gm, ' ') : ""
    }

    /*
    ########  ########  ######  #### ######## ########
    ##     ## ##       ##    ##  ##       ##  ##
    ##     ## ##       ##        ##      ##   ##
    ########  ######    ######   ##     ##    ######
    ##   ##   ##             ##  ##    ##     ##
    ##    ##  ##       ##    ##  ##   ##      ##
    ##     ## ########  ######  #### ######## ########
    */

    // const handleResize = debounce(() => {
    //     const filtersContainer = document.querySelector(`.fp-filters-top`)
    //     const height = filtersContainer.clientHeight - 2
    //     const thead = document.querySelector(`thead`)
    //     thead.style.top = height + "px"
    // }, 20);

    // globalThis.addEventListener("resize", handleResize)

    // if (document.readyState !== 'loading') {
    //     handleResize()
    // }
    // document.addEventListener('DOMContentLoaded', () => { handleResize() });

    // handleResize()

    /*
    ##     ## ########    ###    ########  ######## ########
    ##     ## ##         ## ##   ##     ## ##       ##     ##
    ##     ## ##        ##   ##  ##     ## ##       ##     ##
    ######### ######   ##     ## ##     ## ######   ########
    ##     ## ##       ######### ##     ## ##       ##   ##
    ##     ## ##       ##     ## ##     ## ##       ##    ##
    ##     ## ######## ##     ## ########  ######## ##     ##
    */

    // const print = document.querySelector(`[data-print]`)
    // print.addEventListener("click", (event) => { window.print() })


    /*
     ######  ##       ########    ###    ########
    ##    ## ##       ##         ## ##   ##     ##
    ##       ##       ##        ##   ##  ##     ##
    ##       ##       ######   ##     ## ########
    ##       ##       ##       ######### ##   ##
    ##    ## ##       ##       ##     ## ##    ##
     ######  ######## ######## ##     ## ##     ##
    */

    // const clear = document.querySelector(`button[data-clear-filters]`)
    // clear.addEventListener("click", (event) => {
    //     const fpDateSelectCalendar = document.querySelector(`#fpDateSelectCalendar`)
    //     fpDateSelectCalendar.value = ``
    //     updateDateUI()
    //     document.querySelectorAll(`naked-filter`).forEach(nakedFilter => {
    //         const input = nakedFilter.querySelector(`input[type="text"]`)
    //         if (input) input.value = ""
    //         const select = nakedFilter.querySelector(`select`)
    //         if (select) select.value = "all"
    //         const radio = nakedFilter.querySelector(`input[type="radio"][value="all"]`)
    //         if (radio) {
    //             radio.checked = true
    //         }
    //         nakedFilter.showAllItems()
    //     })
    // })

    /*
       ###    ##       ######## ########  ########  ######
      ## ##   ##       ##       ##     ##    ##    ##    ##
     ##   ##  ##       ##       ##     ##    ##    ##
    ##     ## ##       ######   ########     ##     ######
    ######### ##       ##       ##   ##      ##          ##
    ##     ## ##       ##       ##    ##     ##    ##    ##
    ##     ## ######## ######## ##     ##    ##     ######
    */
    function getClassCount(div, selector) {
        const elements = div.querySelectorAll(selector)
        return elements ? elements.length : 0
    }

    function buildAlertsModel() {
        document.querySelectorAll(`#fpRequestTable>tbody>tr`).forEach(tr => {
            // span classes are "fp-h", "fp-w" or "fp-i"
            // levels:
            // h = high
            // w = warning
            // i = info"
            const div = tr.querySelector(`td:nth-child(${isAdmin ? 2 : 1})>div`)
            const highCount = getClassCount(div, `span.fp-h`)
            const warnCount = getClassCount(div, `span.fp-w`)
            const infoCount = getClassCount(div, `span.fp-i`)
            const workflows = div.querySelectorAll(`p`)
            const workflowCount = workflows.length
            const urgentCount = highCount + warnCount
            const alertCount = urgentCount + infoCount
            let workflowTextClean = ""
            const worflowArray = Array.from(workflows)
            worflowArray.forEach(item => {
                workflowTextClean += item.textContent.trim() + " "
                workflowTexts.push(item.textContent.trim())
            })

            const dataObject = {
                tr,
                urgentCount,
                alertCount,
                workflowTextClean,
                workflowCount
            }
            alertsModel.push(dataObject)
        })
        workflowUnique = [...new Set(workflowTexts)]
    }

    function filterOverride() {
        const fopFilterAlertsSelect = fopFilterAlerts.querySelector(`#fopFilterAlerts select`)
        const value = fopFilterAlertsSelect.value
        if (value === "all") return
        alertsModel.forEach(dataObject => {
            if (value === "urgent") {
                dataObject.tr.style.display = (dataObject.urgentCount > 0) ? "table-row" : "none"
            } else if (value === "alerts") {
                dataObject.tr.style.display = (dataObject.alertCount > 0) ? "table-row" : "none"
            }
            else if (value === "workflow") {
                dataObject.tr.style.display = (dataObject.workflowCount > 0) ? "table-row" : "none"
            } else {
                dataObject.tr.style.display = (dataObject.workflowTextClean.includes(value)) ? "table-row" : "none"
            }
        })

    }

    function initAlertsFilter() {
        buildAlertsModel()
        const fopFilterAlerts = document.querySelector(`#fopFilterAlerts`)
        fopFilterAlerts.addEventListener("naked-filter:get-override", (event) => {
            fopFilterAlerts.setOverride(filterOverride)
        })
        const fopFilterAlertsSelect = fopFilterAlerts.querySelector(`select`)
        workflowUnique.forEach(workflowText => {
            if (workflowText != "") {
                const option = document.createElement("option")
                // #addLiveRegion() {
                option.text = workflowText
                option.value = workflowText
                fopFilterAlertsSelect.append(option)
            }
        })
    }

    /*
    ########     ###    ########  ####  #######   ######
    ##     ##   ## ##   ##     ##  ##  ##     ## ##    ##
    ##     ##  ##   ##  ##     ##  ##  ##     ## ##
    ########  ##     ## ##     ##  ##  ##     ##  ######
    ##   ##   ######### ##     ##  ##  ##     ##       ##
    ##    ##  ##     ## ##     ##  ##  ##     ## ##    ##
    ##     ## ##     ## ########  ####  #######   ######
    */
    function initRadioFilter() {
        const fpClassroomVirtuals = document.querySelector(`input[type="radio"]#fpClassroomVirtuals`)
        const fpNeedsActionAll = document.querySelector(`#fpNeedsActionAll`)

        fpRadioFilter.addEventListener("naked-filter:ready", (event) => {
            fpNeedsActionAll.click()
            fpClassroomVirtuals.click()
        })
        fpNeedsActionAll.click()
        fpClassroomVirtuals.click()
    }




    /*
     ######  ########    ###    ######## ##     ##  ######
    ##    ##    ##      ## ##      ##    ##     ## ##    ##
    ##          ##     ##   ##     ##    ##     ## ##
     ######     ##    ##     ##    ##    ##     ##  ######
          ##    ##    #########    ##    ##     ##       ##
    ##    ##    ##    ##     ##    ##    ##     ## ##    ##
     ######     ##    ##     ##    ##     #######   ######
    */

    function initStatusFilter() {
        const fopFilterStatus = document.querySelector(`#fopFilterStatus`)
        if (fopFilterStatus) {
            fopFilterStatus.addEventListener("naked-filter:change", (event) => {
                // Filter alerts here.
            })
        }
    }

    /*
    ########  ########     ###    ##      ## ######## ########
    ##     ## ##     ##   ## ##   ##  ##  ## ##       ##     ##
    ##     ## ##     ##  ##   ##  ##  ##  ## ##       ##     ##
    ##     ## ########  ##     ## ##  ##  ## ######   ########
    ##     ## ##   ##   ######### ##  ##  ## ##       ##   ##
    ##     ## ##    ##  ##     ## ##  ##  ## ##       ##    ##
    ########  ##     ## ##     ##  ###  ###  ######## ##     ##
    */

    function setDrawerTitle(title) {
        const titleH2 = document.querySelector(`.fp-drawer-header>h2`)
        titleH2.textContent = title
    }

    function toggleLoading(show) {
        const loading = fpDrawer.querySelector(`#fpDrawer .fp-loading`)
        loading.style.display = show ? "block" : "none"
    }

    function clearContent() {
        fpDrawerContent.url = isDev ? "./blank/" : "/blank/"
    }

    function handleDrawerClick(event) {
        const button = event.currentTarget
        const url = button.dataset.url
        const width = button.dataset.width
        if (width) {
            fpDrawer.style.width = width
        } else {
            fpDrawer.style.width = "95vw"
        }

        if (!url) {
            fpDrawer.dataset.url = ""
            toggleLoading(false)
            clearContent()
            setDrawerTitle("Opening button needs a data-url attribute.")
        } else if (fpDrawer.dataset.url === url) {
            console.warn("Page already loaded.")
        }
        else {
            fpDrawerContent.setAttribute("src", url)
        }

        const h2 = fpDrawer.querySelector(`.fp-drawer-header h2`)
        const tr = button.closest(`tr`)
        const title = tr.querySelector(`td:nth-child(2)`)?.textContent
        const code = tr.querySelector(`td:nth-child(3)`)?.textContent
        h2.innerHTML = `${title} <span>[${code}]</span>`
    }

    function handleIframeLoad(event) {
        const title = fpDrawerContent.contentDocument.title
        // const h2 = fpDrawer.querySelector(`.fp-drawer-header h2`)
        // h2.textContent = title
    }

    function initDrawer() {
        document.querySelectorAll(`#fpRequestTable>tbody>tr>td:nth-child(${isAdmin ? 8 : 7})>a`).forEach(link => {
            link.addEventListener("click", (event) => {
                event.preventDefault()
            })
        })

        fpDrawerContent.addEventListener(`load`, handleIframeLoad)


        // const close = fpDrawer.querySelector(`.fp-drawer-header button`)
        document.querySelectorAll(`button[commandfor="fpDrawer"]`).forEach(button => {
            button.addEventListener("click", handleDrawerClick)
        })
        // close.addEventListener("click", (event) => { toggleLoading(true) })
    }

    /*
     ######  ######## ##               ########   #######  ##      ##
    ##    ## ##       ##               ##     ## ##     ## ##  ##  ##
    ##       ##       ##               ##     ## ##     ## ##  ##  ##
     ######  ######   ##       ####### ########  ##     ## ##  ##  ##
          ## ##       ##               ##   ##   ##     ## ##  ##  ##
    ##    ## ##       ##               ##    ##  ##     ## ##  ##  ##
     ######  ######## ########         ##     ##  #######   ###  ###
    */

    function handleDisabledLink(event) {
        event.preventDefault()
    }

    function processRows(rows) {
        const container = document.querySelector(`#fpRequestTable>thead>tr.fp-row-select`)
        // 
        const approve = container.querySelector(`a[data-approve]`)
        const reject = container.querySelector(`a[data-reject]`)
        const card = container.querySelector(`a[data-card]`)
        const bank = container.querySelector(`a[data-bank]`)

        approve.dataset.disabled = false
        reject.dataset.disabled = false
        card.dataset.disabled = false
        bank.dataset.disabled = false

        let idArray = []
        rows.forEach(row => {
            if (!row.hasAttribute("data-ap")) {
                approve.dataset.disabled = true
                reject.dataset.disabled = true
            }

            if (!row.hasAttribute("data-py")) {
                card.dataset.disabled = true
                bank.dataset.disabled = true
            }

            idArray.push(row.dataset.id)
        })

        const ids = idArray.join(",")
        const approveOriginal = approve.href.split("?")[0]
        approve.href = approveOriginal + `?ids=[${ids}]`
        const rejectOriginal = reject.href.split("?")[0]
        reject.href = rejectOriginal + `?ids=[${ids}]`
        const cardOriginal = card.href.split("?")[0]
        card.href = cardOriginal + `?ids=[${ids}]`
        const bankOriginal = bank.href.split("?")[0]
        bank.href = bankOriginal + `?ids=[${ids}]`

        document.querySelectorAll(`.fp-select-container a[data-disabled]`).forEach(link => {
            link.removeEventListener("click", handleDisabledLink)
        })

        document.querySelectorAll(`.fp-select-container a[data-disabled="true"]`).forEach(link => {
            link.addEventListener("click", handleDisabledLink)
        })
    }

    function clearRows() {
        const selectedRows = getSelectedRows()
        selectedRows.forEach(row => {
            row.classList.remove("fp-row-highlight")
        })
        const selectActions = document.querySelector(`#fpRequestTable>thead>tr.fp-row-select`)
        selectActions.style.display = "none"
    }

    function getSelectedRows() {
        return document.querySelectorAll(`#fpRequestTable>tbody>tr.fp-row-highlight`)
    }

    function addBodyBehaviour() {
        const tbody = document.querySelector(`#fpRequestTable>tbody`)
        tbody.addEventListener("click", (event) => {
            const target = event.target
            const details = target.closest("details")
            const link = target.closest("button")
            const count = document.querySelector(`[data-row-selected-count]`)

            // A  link or details element was clicked - do nothing
            if (details || link) return

            const selectActions = document.querySelector(`#fpRequestTable>thead>tr.fp-row-select`)
            const tr = target.closest("tr")
            tr.classList.toggle("fp-row-highlight")

            const selectedRows = getSelectedRows()
            selectedRows.length === 0 ? clearRows() : selectActions.style.display = "table-row"
            count.textContent = `${selectedRows.length} selected`

            if (selectedRows.length > 0) processRows(selectedRows)
        })
    }

    function initSelectRows() {
        const clear = document.querySelector(`button[data-clear]`)
        clear.addEventListener("click", (event) => {
            clearRows()
        })
        addBodyBehaviour()
        //add listenner to body
        const body = document.querySelector(`body`)
        body.addEventListener("naked-table-sort:sort-clicked", (event) => { addBodyBehaviour() })

    }

    /*
    ########     ###    ######## ########  ######
    ##     ##   ## ##      ##    ##       ##    ##
    ##     ##  ##   ##     ##    ##       ##
    ##     ## ##     ##    ##    ######    ######
    ##     ## #########    ##    ##             ##
    ##     ## ##     ##    ##    ##       ##    ##
    ########  ##     ##    ##    ########  ######
    */

    function processDates(dateA, dateB) {
        let newA = removeMultipleSpaces(removeNewLines(dateA)).trim()
        let newB = removeMultipleSpaces(removeNewLines(dateB)).trim()
        newA = newA.split(" ")[0]
        newB = newB.split(" ")[0]

        if (newA) {
            newA = newA.split("-").reverse().join("-")
        }

        if (newB) {
            newB = newB.split("-").reverse().join("-")
        }

        return { newA, newB }
    }

    function initDateSort() {
        const dateSorter = document.querySelector(`th[data-sort-property="dates"] > naked-table-sort`)
        dateSorter.addEventListener("naked-table-sort:get-conversion", (event) => {
            dateSorter.setConversion(processDates)
        })
    }

    /**
    * @function showAllDateItems Public reset to show all items
    */
    function showAllDateItems() {
        // console.log("showAllDateItems");
        datesModel.forEach(row => {
            row.tr.style.display = "table-row"
        })
    }


    function reverseDate(dateString) {
        return dateString.split("-").reverse().join("-")
    }

    function filterDates(dateRange) {
        // console.log("date filter", dateRange);
        if (!dateRange) return
        const range = dateRange.split("/")
        const dateFrom = range[0]
        const dateTo = range[1]

        //filter by date -maybe move this above event dispatch
        datesModel.forEach(row => {
            if (!row.dateFrom && !row.dateTo) {
                row.tr.style.display = "none"
            } else if (row.dateFrom && !row.dateTo) {
                const isStartInRange = row.dateFrom >= dateFrom && row.dateFrom <= dateTo
                if (!isStartInRange) {
                    row.tr.style.display = "none"
                }
            } else {
                const isStartInRange = row.dateFrom >= dateFrom && row.dateFrom <= dateTo
                const isEndInRange = row.dateTo >= dateFrom && row.dateTo <= dateTo
                if (!isStartInRange && !isEndInRange) {
                    row.tr.style.display = "none"
                }
            }
            //if only start date

        })


    }

    function updateDateUI() {
        // console.log("updateDateUI");
        const datesFilter = document.querySelector(`#datesFilter`)
        const summary = datesFilter.querySelector(`summary`)
        const fpDateSelectCalendar = datesFilter.querySelector(`#fpDateSelectCalendar`)
        if (fpDateSelectCalendar.value === ``) {
            summary.removeAttribute("data-has-value")
        } else {
            summary.setAttribute("data-has-value", "")
        }
    }


    function initCallyDateRange() {

        document.querySelectorAll(`#fpRequestTable>tbody>tr`).forEach(tr => {
            const td = tr.querySelector(`td:nth-child(${isAdmin ? 5 : 4})`)
            const dateFrom = td.dataset.f != "" ? reverseDate(td.dataset.f) : ""
            const dateTo = td.dataset.f != "" ? reverseDate(td.dataset.t) : ""
            datesModel.push({ tr, dateFrom, dateTo })
        })
        // console.log("datesModel: ", datesModel);

        const datesFilter = document.querySelector(`#datesFilter`)
        const fpDateSelectCalendar = datesFilter.querySelector(`#fpDateSelectCalendar`)
        // monitorEvents(fpDateSelectCalendar)
        const body = document.querySelector(`body`)
        body.addEventListener("click", (event) => {
            const details = event.target.closest("details")
            if (!details) datesFilter.open = false
        })

        let custEvent = new CustomEvent(`naked-filter:change`, {
            bubbles: true,
            cancelable: true,
            detail: {}
        })
        const callyYear = datesFilter.querySelector(`#callyYear`)
        callyYear.value = new Date().getFullYear()
        callyYear.addEventListener("change", (event) => {
            const newValue = new Date()
            newValue.setFullYear(callyYear.value)
            const newValueString = newValue.toISOString().split("T")[0]
            fpDateSelectCalendar.value = `${newValueString}/${newValueString}`
            document.dispatchEvent(custEvent)
        })

        fpDateSelectCalendar.addEventListener("rangeend", (event) => {
            showAllDateItems()
            filterDates(fpDateSelectCalendar.value)
            fpDateSelectCalendar.dispatchEvent(custEvent)
            updateDateUI()
        })

        document.addEventListener("naked-filter:change", (event) => {
            // console.log("aked-filter:change");
            filterDates(fpDateSelectCalendar.value)
            updateDateUI()
        })

        const clear = document.querySelector(`button[data-date-clear]`)
        clear.addEventListener("click", (event) => {
            fpDateSelectCalendar.value = ``
            showAllDateItems()
            fpDateSelectCalendar.dispatchEvent(custEvent)
            updateDateUI()
        })



    }

    /*
     ######   ######  ##     ##
    ##    ## ##    ## ##     ##
    ##       ##       ##     ##
    ##        ######  ##     ##
    ##             ##  ##   ##
    ##    ## ##    ##   ## ##
     ######   ######     ###
    */



    function initCSV() {
        const hiddenCSVLink = document.createElement('a')
        hiddenCSVLink.target = '_blank'
        hiddenCSVLink.download = 'manageRequests.csv'

        const button = document.querySelector(`button[data-csv]`)
        const headerArray = ["Alerts", "Course Code", "Date", "Name", "Job title", "Department", "Price", "Status"]
        if (isAdmin) headerArray.unshift("Cost Centre")

        const csvArray = [headerArray]

        button.addEventListener("click", (event) => {
            if (button.disabled) return
            document.querySelectorAll(`#fpRequestTable>tbody>tr`).forEach(tr => {
                const index = isAdmin ? 1 : 0
                let rowArray = []

                if (isAdmin) {
                    const costCentre = tr.querySelector(`td:nth-child(${index})`)
                    rowArray.push(getTextNoCommas(costCentre.textContent))
                }

                const alerts = tr.querySelectorAll(`td:nth-child(${index + 1}) span`)
                const alertsArray = []
                alerts.forEach(alert => {
                    alertsArray.push(getTextNoCommas(alert.textContent))
                })
                const alertsText = alertsArray.length > 0 ? `"${alertsArray.toString()}"` : ``
                rowArray.push(alertsText)

                const courseCode = tr.querySelector(`td:nth-child(${index + 3}) > div`)
                rowArray.push(getTextNoCommas(courseCode.textContent))

                const datesTD = tr.querySelector(`td:nth-child(${index + 4})`)
                rowArray.push(removeNewLines(getTextNoCommas(datesTD.textContent)))

                const nameTD = tr.querySelector(`td:nth-child(${index + 5})`)
                const container = nameTD.querySelector(`details`)
                if (container) {
                    let name = container.querySelector(`summary`)?.textContent
                    let jobTitle = container.querySelector(`div>p:nth-child(1)`)?.textContent
                    let department = container.querySelector(`div>p:nth-child(2)`)?.textContent
                    jobTitle = jobTitle?.replace("Job title: ", "")
                    department = department?.replace("Department: ", "")
                    rowArray.push(getTextNoCommas(name ? name : ""))
                    rowArray.push(getTextNoCommas(jobTitle ? jobTitle : ""))
                    rowArray.push(getTextNoCommas(department ? department : ""))
                } else {
                    const reserved = nameTD.querySelector(`p`)
                    if (reserved) {
                        rowArray.push(getTextNoCommas(reserved.textContent))
                        rowArray.push("")
                        rowArray.push("")
                    } else {
                        rowArray.push("")
                        rowArray.push("")
                        rowArray.push("")
                    }
                }
                // rowArray.push(removeNewLines(getTextNoCommas(nameTD.textContent)))

                const priceTD = tr.querySelector(`td:nth-child(${index + 6})`)
                rowArray.push(removeNewLines(getTextNoCommas(priceTD.textContent)))

                const statusTD = tr.querySelector(`td:nth-child(${index + 7})`)
                rowArray.push(removeNewLines(getTextNoCommas(statusTD.textContent)))

                csvArray.push(rowArray)
            })

            let csv = ""
            csvArray.forEach((rowArray, index) => {
                csv += rowArray.toString()
                if ((index + 1) != csvArray.length) csv += '\r\n'
            })

            hiddenCSVLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenCSVLink.click()
        })

    }

    /*
    #### ##    ## #### ########
     ##  ###   ##  ##     ##
     ##  ####  ##  ##     ##
     ##  ## ## ##  ##     ##
     ##  ##  ####  ##     ##
     ##  ##   ###  ##     ##
    #### ##    ## ####    ##
    */

    async function init() {
        // isAdmin = document.querySelector(`article`).dataset.role === "admin" ? true : false;
        // initAlertsFilter()
        // initStatusFilter()
        // initDateSort()
        // initSelectRows()
        // initRadioFilter()
        // await initActionMenus(isAdmin ? 3 : 2)
        initDrawer()
        // initCallyDateRange()
        // initCSV()

        window.addEventListener(
            "message",
            (event) => {
                // console.log(event.data)
                if (!event.data.success || !event.data.isCreateCourse) {
                    // Error handling
                }
                else {
                    fpDrawer.close()
                    fpDrawerContent.src = "./blank/"
                }
            },
            false
        );
    }

    init()

})()