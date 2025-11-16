(() => {

    const POST = "post"
    const GET = "get"
    let isClose = false
    const isDev = (document.querySelector("body[data-is-dev]")) ? true : false

    function addCode(codeText) {
        const code = document.querySelector(`[data-code]`)
        code.textContent = code.textContent + codeText
    }

    function initVirtual() {
        const virtualContainer = document.querySelector(`[data-virtual-container]`)
        const virtualButton = document.querySelector(`input[data-virtual]`)
        virtualButton.addEventListener("change", (event) => {
            virtualContainer.style.display = virtualButton.checked ? "block" : "none"
        })
    }

    function handleError(error) {
        toggleError(true)
        const content = document.querySelector(`[data-warn-content]`)
        content.textContent = error.message
    }

    async function sendData(method, url, _sendData) {
        toggleError(false)
        //try {
        let response
        if (method === POST) {
            response = await fetch(url)
            // response = await fetch(url, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: _sendData
            // })
        } else {
            response = await fetch(url)
        }
        const data = await response.json()
        if (response.ok) {
            return { data, "success": true }
        } else {
            handleError(error)
            return { "success": false }
        }
        // } catch (error) {
        //     handleError(error)
        //     return { "success": false }
        // }
    }

    async function getDurationCode() {

        const courseID = document.querySelector(`article[data-course-id]`)?.dataset.courseId
        addCode(`Send /api/course/get/ [POST]:
    
${JSON.stringify({ courseID })}

--------
`)
        const ptDuration = document.querySelector(`#ptDuration`)
        const courseCode = document.querySelector(`[data-course-code]`)
        const url = isDev ? `../data/get-duration-code.json` : `/ectl/prototype-01/data/get-duration-code.json`
        console.log("url: ", url);

        const result = await sendData(POST, url, { courseID })
        if (result.success) {
            ptDuration.value = result.data.duration
            courseCode.textContent = result.data.code
            addCode(`Receive:
                
${JSON.stringify(result.data)}

--------`)
        }
    }

    function toggleError(toggle) {
        const warn = document.querySelector(`.pt-info.pt-warn`)
        warn.style.display = toggle ? "flex" : "none"
    }

    function disableSaveButtons() {
        const buttonSwitch = document.querySelector(`[data-save-switch]`)
        const buttonClose = document.querySelector(`[data-save-close]`)
        const buttonSave = document.querySelector(`[data-save]`)
        buttonSwitch.disabled = true
        buttonSave.disabled = true
        buttonClose.disabled = true
    }

    function enableSaveButtons() {
        const buttonSwitch = document.querySelector(`[data-save-switch]`)
        const buttonClose = document.querySelector(`[data-save-close]`)
        const buttonSave = document.querySelector(`[data-save]`)
        buttonSwitch.disabled = false
        buttonSave.disabled = false
        buttonClose.disabled = false
    }

    function getFormData() {
        const form = document.querySelector(`form[data-form]`)
        const formData = new FormData(form)
        const jsonData = Object.fromEntries(formData.entries())
        jsonData["tutors"] = formData.getAll("tutors")
        return jsonData
    }

    async function showToast() {
        const toast = document.querySelector(`.pt-info.pt-success`)
        toast.style.display = "flex"
        await new Promise(r => setTimeout(r, 200000))
        toast.style.display = "none"
    }

    async function initSave() {
        const form = document.querySelector(`form[data-form]`)
        form.addEventListener("submit", async (event) => {
            event.preventDefault()
            disableSaveButtons()
            const jsonData = getFormData()
            const url = isDev ? `../data/post-success.json` : `/ectl/prototype-01/data/post-success.json`
            const result = await sendData(POST, url, jsonData)
            await new Promise(r => setTimeout(r, 2000))
            if (result.success) {
                showToast()
            }
            enableSaveButtons()
            if (isClose) {
                top.postMessage(
                    { success: true, isCreateCourse: true, action: "close" }
                );
                isClose = false
            }

            addCode(`
Send /api/course/save/ [POST]:
    
${JSON.stringify(jsonData)}

--------
`)

            addCode(`Receive:
                
${JSON.stringify(result)}

--------`)
        })
    }

    function initSaveClose() {
        const button = document.querySelector(`button[data-save-close]`)
        button.addEventListener("click", (event) => { isClose = true })

    }

    function getDateString(date) {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        const yyyy = date.getFullYear();
        if (dd < 10) {
            dd = `0${dd}`;
        }
        if (mm < 10) {
            mm = `0${mm}`;
        }
        return `${yyyy}-${mm}-${dd}`
    }

    function addDays(date, days) {
        const currentDate = new Date(date)
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + parseInt((days - 1)))
        return newDate
    }

    function setDuration(dateStart, dateEnd) {
        const ptDuration = document.querySelector(`#ptDuration`)
        const startDate = new Date(dateStart)
        const endDate = new Date(dateEnd)
        const timeDifference = endDate - startDate;
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        ptDuration.value = daysDifference + 1
    }

    function handleEndDateChange(event) {
        const ptDuration = document.querySelector(`#ptDuration`)
        const ptStartDate = document.querySelector(`#ptStartDate`)
        const ptEndDate = document.querySelector(`#ptEndDate`)
        if (!ptStartDate.value) ptStartDate.value = ptEndDate.value
        setDuration(ptStartDate.value, ptEndDate.value)
        setTitleDates()
    }

    function handleStartDateChange(event) {
        const ptDuration = document.querySelector(`#ptDuration`)
        const ptStartDate = document.querySelector(`#ptStartDate`)
        const ptEndDate = document.querySelector(`#ptEndDate`)

        if (ptEndDate.value < ptStartDate.value) {
            ptEndDate.value = ""
        }
        ptEndDate.min = ptStartDate.value
        ptEndDate.value = getDateString(addDays(ptStartDate.value, ptDuration.value))
        setDuration(ptStartDate.value, ptEndDate.value)
        setTitleDates()
    }

    function handleDurationChange(event) {
        const ptDuration = document.querySelector(`#ptDuration`)
        const ptStartDate = document.querySelector(`#ptStartDate`)
        const ptEndDate = document.querySelector(`#ptEndDate`)

        if (ptStartDate.value === "") return
        ptEndDate.value = getDateString(addDays(ptStartDate.value, ptDuration.value))
        setTitleDates()
    }

    function initDates() {
        document.querySelectorAll(`input[type="date"]`).forEach(item => {
            item.addEventListener("click", (event) => { item.showPicker() })
        })

        const ptStartDate = document.querySelector(`#ptStartDate`)
        const ptEndDate = document.querySelector(`#ptEndDate`)
        const ptDuration = document.querySelector(`#ptDuration`)

        ptStartDate.min = getDateString(new Date())
        ptEndDate.min = getDateString(new Date())

        ptStartDate.addEventListener("change", handleStartDateChange)
        ptEndDate.addEventListener("change", handleEndDateChange)
        ptDuration.addEventListener("change", handleDurationChange)

    }

    function setTitleDates() {
        const ptEndDate = document.querySelector(`#ptEndDate`)
        const ptStartDate = document.querySelector(`#ptStartDate`)
        const title = document.querySelector(`[data-dates-selected]`)

        if (ptEndDate.value === "" || ptStartDate.value === "") {
            title.textContent = ""
            return
        }
        title.textContent = `[${ptStartDate.value} to ${ptEndDate.value}]`
    }

    async function init() {
        await getDurationCode()
        initVirtual()
        initDates()
        initSave()
        initSaveClose()
    }

    addEventListener("load", (event) => { init() })
})();