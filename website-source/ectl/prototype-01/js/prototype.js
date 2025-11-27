(() => {

    const POST = "post"
    const GET = "get"
    let isClose = false
    const isDev = (document.querySelector("body[data-is-dev]")) ? true : false

    // Start
    //  Normal week
    //  Ends Saturday
    //  Ends Sunday
    //  Starts Saturday
    //  Starts Sunday

    // End
    //  

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
        // console.log("url: ", url);

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
        const article = document.querySelector(`article[data-course-id]`)
        const formData = new FormData(form)
        const jsonData = Object.fromEntries(formData.entries())
        jsonData["tutors"] = formData.getAll("tutors")
        jsonData["courseID"] = article.dataset.courseId
        return jsonData
    }

    async function showToast() {
        const toast = document.querySelector(`.pt-info.pt-success`)
        toast.style.display = "flex"
        await new Promise(r => setTimeout(r, 2000))
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

    const isWeekday = date => date.getDay() % 6 !== 0
    const isWeekend = date => date.getDay() % 6 === 0

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

    function getWeekendCount(date, days) {
        // const currentDate = new Date(date)
        let nextDate = new Date(date)

        // THIS DOESNT ACCOUNT FOR SATURDAYS AS NEXT DATE IS ALSO WEEKEND

        let weekendDays = 0
        for (let index = 0; index < days; index++) {
            if (isWeekend(nextDate)) weekendDays++
            nextDate.setDate(nextDate.getDate() + 1)
        }

        //If saturday selected, add on sunday too as will need to get past
        // nextDate.setDate(nextDate.getDate() + 1)
        // console.log("nextDate: ", nextDate);
        // console.log("nextDate.getDay(): ", nextDate.getDay());

        if (nextDate.getDay() === 0) {
            // console.log("weekendDays: ", weekendDays);

            weekendDays++
        }
        return weekendDays
    }

    function getDaysDifference(date, days) {
        // let nextDate = new Date(currentDate)

        // let addWeekendDays = 0
        // for (let index = 0; index < days; index++) {
        //     nextDate.setDate(nextDate.getDate() + 1)
        //     if (isWeekend(nextDate)) addWeekendDays++
        // }

        const addWeekendDays = getWeekendCount(date, days)
        // console.log("addWeekendDays: ", addWeekendDays);

        const currentDate = new Date(date)
        let newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + parseInt(days) - 1 + addWeekendDays)
        return newDate
    }

    function setDuration(dateStart, dateEnd) {
        const ptDuration = document.querySelector(`#ptDuration`)
        const startDate = new Date(dateStart)
        const endDate = new Date(dateEnd)
        const timeDifference = endDate - startDate
        const daysDifference = (timeDifference / (1000 * 3600 * 24)) + 1
        const reduceWeekendDays = getWeekendCount(dateStart, daysDifference)
        // console.log("reduceWeekendDays: ", reduceWeekendDays);

        ptDuration.value = daysDifference - reduceWeekendDays
    }

    function handleEndDateChange(event) {
        console.log("handleEndDateChange");

        //If weekend selected, reset to 


        // const ptDuration = document.querySelector(`#ptDuration`)
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

        // If start date is a weekend, set real start to Monday
        let trueStartDate = new Date(ptStartDate.value)
        if (trueStartDate.getDay() === 0) {
            trueStartDate.setDate(trueStartDate.getDate() + 1)
        } else if (trueStartDate.getDay() === 6) {
            trueStartDate.setDate(trueStartDate.getDate() + 2)
        }

        if (parseInt(ptDuration.value) === 0) {
            ptEndDate.value = getDateString(trueStartDate)
            setTitleDates()
            return
        }

        let endDate = new Date(trueStartDate)

        const duration = parseInt(ptDuration.value)
        let workdayCount = 1
        let dateCount = 0
        let isFinished = false
        while (!isFinished) {
            trueStartDate.setDate(trueStartDate.getDate() + 1)
            if (!isWeekend(trueStartDate)) {
                workdayCount++
            }
            dateCount++
            if (workdayCount >= duration) isFinished = true
        }
        endDate.setDate(endDate.getDate() + dateCount)
        ptEndDate.value = getDateString(endDate)
        setTitleDates()
    }

    function handleDurationChange(event) {
        const ptDuration = document.querySelector(`#ptDuration`)
        const ptStartDate = document.querySelector(`#ptStartDate`)
        const ptEndDate = document.querySelector(`#ptEndDate`)
        console.log("ptDuration.value: ", ptDuration.value);


        if (ptStartDate.value === "") return
        handleStartDateChange()
        // // console.log("getWeekendCount: ", getWeekendCount);
        // const weekendDays = getWeekendCount()

        // const diff = getDaysDifference(ptStartDate.value, parseInt(ptDuration.value))
        // console.log("diff: ", diff);

        // ptEndDate.value = getDateString(getDaysDifference(ptStartDate.value, parseInt(ptDuration.value)))
        // setTitleDates()
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
        // const popbutton = document.querySelector(`button[popovertarget="instancesPopover"]`)
        // popbutton.click()
    }

    addEventListener("load", (event) => { init() })
})();