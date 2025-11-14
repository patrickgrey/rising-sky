async function initHelpProcess() {
    console.log("initHelpProcess");
    // const inlcude = document.currentScript.parentElement
    const container = document.querySelector(".fp-graph-overflow");

    container.querySelectorAll(`.fp-graph-button-show`).forEach(button => {
        button.addEventListener("click", function (event) {
            const span = button.querySelector("span");
            const target = button.dataset.target;
            const info = container.querySelector("#" + target);
            info.dataset.open = info.dataset.open === "false" ? "true" : "false";
            span.textContent = info.dataset.open === "false" ? "+" : "-";
        })
    })

    const fpParticipantSelection = container.querySelector("#fpParticipantSelection");
    const dialog = container.querySelector("#fpParticipantSelectionInfo");
    const button = dialog.querySelector("button[autofocus]");

    fpParticipantSelection.addEventListener("click", function (event) {
        dialog.showModal();
    })

    button.addEventListener("click", function (event) {
        dialog.close();
    })

    const fpShowAll = container.querySelector("#fpShowAll");
    fpShowAll.addEventListener("click", function (event) {
        container.querySelectorAll(`.fp-graph-info-container`).forEach(container => {
            if (fpShowAll.dataset.open === "false") {
                container.dataset.open = "true"
                // dialog.showModal();
            } else {
                container.dataset.open = "false"
                // dialog.close();
            }
        })

        container.querySelectorAll(`.fp-graph-button-show`).forEach(button => {
            const span = button.querySelector("span");
            span.textContent = fpShowAll.dataset.open === "false" ? "-" : "+";
        })

        fpShowAll.dataset.open = fpShowAll.dataset.open === "false" ? "true" : "false";
        fpShowAll.textContent = fpShowAll.dataset.open === "false" ? "Show all" : "Hide all";
    })

    const url = new URL(document.location.href);
    const searchParams = new URLSearchParams(url.search);
    if (searchParams.has("step")) {
        const step = searchParams.get("step")
        const columns = container.querySelectorAll(`.fp-graph-column-label`)
        columns[step - 1].classList.add("fp-graph-column-label-highlight")
    }

}

initHelpProcess()