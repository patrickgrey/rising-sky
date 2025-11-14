const bodyBackendIsDev = document.querySelector("body[data-is-backend-dev]")
const ISBACKENDDEV = bodyBackendIsDev ? true : false
let actionMenuCellIndex = 0
const menuTemplate = document.querySelector("#fopActionMenu")
const fpDrawer = document.querySelector(`#fpDrawer`)
const fpDrawerContent = fpDrawer.querySelector(`iframe[data-drawer-content]`)

// Used to keep first menu open. Can be deleted
// let testMenu = true
// Used to keep first menu open. Can be deleted END

const ISDEV = (document.querySelector("body[data-is-dev]")) ? true : false

let apiURL = `/ilp/customs/requestmanagement/api/actions/get`

function getMenuItemConfig(id, actions) {
    let config = null
    actions.forEach(action => {
        if (action.id === id) config = action
    })
    return config
}

function handleHrefButton(event) {
    open(event.target.dataset.href, "_blank");
}

function positionToast(currentPopover) {
    let bottom = 20
    document.querySelectorAll(`[popover="manual"][data-toast]`).forEach(popover => {
        const rect = popover.getClientRects()
        if (rect[0]) {
            bottom += rect[0].height + 20
        }
    })
    if (bottom > 0) {
        currentPopover.style.bottom = `${bottom}px`
    }
}

async function toast(title, content, styleClasses = null, delay = 5000) {
    const toastTemplate = document.querySelector("#fopToast")
    const clone = toastTemplate.content.cloneNode(true)
    const popover = clone.querySelector(`[popover="manual"]`)
    if (styleClasses) popover.classList.add(styleClasses)
    const titleElement = popover.querySelector(`[data-title]`)
    const contentElement = popover.querySelector(`[data-content]`)
    titleElement.textContent = title
    contentElement.innerHTML = content
    document.body.append(popover)
    positionToast(popover)
    popover.showPopover()
    await new Promise(resolve => setTimeout(resolve, delay))
    popover.remove()
}

function deleteRow(rowID) {
    const deleteRow = document.querySelector(`tr[data-id="${rowID}"]`)
    deleteRow.remove()
    const fpTableCount = document.querySelector(`#fpTableCount`)
    fpTableCount.refresh()
}

function getHTML(htmlString) {
    //Memory leak?
    const temporaryTemplate = document.createElement("template");
    temporaryTemplate.innerHTML = atob(htmlString);
    return temporaryTemplate.content.firstElementChild;
}

function updateRow(rowID, htmlString, actions) {
    const oldRow = document.querySelector(`tr[data-id="${rowID}"]`)
    if (!oldRow) return
    const updatedRow = getHTML(htmlString)
    oldRow.replaceWith(updatedRow)
    const request = { "registrationId": rowID, actions }
    addActionSelect(updatedRow, request)
}

function addRow(rowID, htmlString, tbody, actions) {
    const newRow = getHTML(htmlString);
    tbody.prepend(newRow);
    const fpTableCount = document.querySelector(`#fpTableCount`)
    fpTableCount.refresh()
    console.log("actions: ", actions);

    const request = { "registrationId": rowID, actions }
    addActionSelect(newRow, request)
}

async function handleApiButton(event) {
    const button = event.currentTarget
    const tr = button.closest("tr")
    let url = `${button.dataset.api}/${tr.dataset.id}`
    if (ISDEV) {
        url = `./data/no-ui-update.json?id=${tr.dataset.id}`
    }
    try {
        const response = await fetch(url)
        if (response.status === 200) {
            const json = await response.json();
            if (json.success) {
                toast(`Success!`, `<p>${event.target.innerText} success! You may need to remove some filters to see the result.</p>`, `fp-toast-success`)
                if (json.content.action === "create") {
                    addRow(json.content.rowID, json.content.html, document.querySelector(`#fpRequestTable tbody`), json.content.actions)
                } else if (json.content.action === "update") {
                    updateRow(json.content.rowID, json.content.html, json.content.actions)
                }
                else if (json.content.action === "delete") {
                    deleteRow(json.content.rowID)
                }
            } else {
                toast(`Error!`, `<p>Sorry, there was a problem completing that action: ${json.error}</p>`, `fp-toast-error`)
            }
        } else {
            toast(`Error!`, `<p>Sorry, the API call was not successful.</p>`, `fp-toast-error`)
        }
    } catch (error) {
        toast(`Error!`, `<p>Sorry, there was a problem calling the API: ${error}</p>`, `fp-toast-error`)
    }

}

function handleDrawerButton(event) {
    const button = event.currentTarget
    const url = button.dataset.url
    fpDrawerContent.setAttribute("src", url)
}

function configMenuItem(config, menuItem) {
    if (config) {
        if (config.disabled) {
            menuItem.setAttribute("disabled", "")
            menuItem.addEventListener("click", (event) => {
                event.preventDefault()
            })
        }
        if (config.type === "url") {
            menuItem.setAttribute("data-href", config.url)
            menuItem.addEventListener("click", handleHrefButton)
        } else if (config.type === "drawer") {
            menuItem.setAttribute("data-url", config.url)
            menuItem.addEventListener("click", handleDrawerButton)
        }
        else if (config.type === "api") {
            menuItem.setAttribute("data-api", config.url)
            menuItem.addEventListener("click", handleApiButton)
        }
    } else {
        if (menuItem) menuItem.parentElement.remove()
    }
}

export function addActionSelect(tr, request) {

    const td = tr.querySelector(`td:nth-child(${actionMenuCellIndex})`)
    const clone = menuTemplate.content.cloneNode(true)
    const menu = clone.querySelector(`details`)

    // console.log("tr: ", tr);
    // console.log("request: ", request);



    // Used to keep first menu open. Can be deleted
    // if (testMenu) {
    //     testMenu = false
    //     menu.setAttribute("open", "")
    // }
    // Used to keep first menu open. Can be deleted END


    // Need to extract config part
    menu.querySelectorAll(`li > a, li > button`).forEach(menuItem => {
        const actionString = menuItem.dataset.action
        const id = actionString.replace("act-", "")
        // console.log("id: ", id);
        // console.log("request.actions: ", request.actions);

        //get item config from request data
        const config = getMenuItemConfig(id, request.actions)
        //Need to warn here but not break if id not found in UI
        // if (config) {
        configMenuItem(config, menuItem)
        // }

    })

    if (menu.querySelectorAll(`li`).length === 0) menu.setAttribute("disabled", "")

    td.appendChild(menu)
    return clone;
}

function updateUI(data) {
    let missedRequests = []

    document.querySelectorAll("tbody>tr").forEach((tr, index) => {
        const request = data[index]

        if (request.registrationId != tr.dataset.id) {
            missedRequests.push(request)
        } else {
            addActionSelect(tr, request)
        }
    })

    if (missedRequests.length != 0) {
        console.warn(`Requests in the action menu json may be out of order.`)
        missedRequests.forEach(request => {
            const tr = document.querySelector(`tbody>tr[data-id="${request.registrationId}"]`)
            if (tr) { addActionSelect(tr, request) } else {
                console.warn(`This request wasn't found in the table: ID ${request.registrationId}`)
            }
        })
    }

}

// Fetch action menu attributes json
// Need an ID for each row to match up?
export async function initActionMenus(columnIndex) {
    actionMenuCellIndex = columnIndex

    if (ISDEV) await new Promise(r => setTimeout(r, 100))

    if (ISDEV) apiURL = `./data/action-menus-2.json`

    if (ISBACKENDDEV) apiURL = `/api/actions/get`

    const body = document.querySelector(`body`)
    body.addEventListener("click", (event) => {
        // console.log("event: ", event);
        const detail = event.target.closest("details")
        if (detail) return
        //add escape key close
        const openDetail = document.querySelector(`details[name="actions"][open]`)
        if (openDetail) openDetail.open = false

    })
    try {

        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json()
        if (response.ok) {
            updateUI(data);
        }
        else {
            showError((data && data.message) || response.status)
        }
    }
    catch (error) {
        console.warn("error: ", error);
    }

    window.addEventListener(
        "message",
        (event) => {
            if (!event.data.success) {
                // notify(event.data.error);
                toast(`Error!`, `<p>Sorry, there was a problem with the action app: ${event.data.error}</p>`, `fp-toast-error`)
            }
            let data;
            if (typeof event.data.content === "string") {
                if (!ISDEV) {
                    data = JSON.parse(event.data.content).content;
                } else {
                    data = JSON.parse(event.data.content);
                }
            } else if (event.data.content.content) {
                data = event.data.content.content;
            } else {
                data = event.data.content;
            }

            if (!data.isMR) return;

            const fpDrawer = document.querySelector(`#fpDrawer`)
            const fpDrawerContent = fpDrawer.querySelector(`iframe[data-drawer-content]`)

            if (data.action === "switch") {
                if (data.subAction === "create") {
                    addRow(data.rowID, data.html, data.actions)
                } else if (data.subAction === "update") {
                    updateRow(data.rowID, data.html, data.actions)
                }
                else if (data.subAction === "delete") {
                    deleteRow(data.rowID)
                }
                fpDrawerContent.src = data.switchURL
            } else if (data.action === "create") {
                addRow(data.rowID, data.html, document.querySelector(`#fpRequestTable tbody`), data.actions)
            } else if (data.action === "update") {
                updateRow(data.rowID, data.html, data.actions)
            }
            else if (data.action === "delete") {
                deleteRow(data.rowID)
            }

            if (data.close) {
                fpDrawerContent.src = ISDEV ? `./blank/` : `/blank/`;
                fpDrawer.close();
            }

        },
        false
    )
}