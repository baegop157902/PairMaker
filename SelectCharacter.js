document.addEventListener("DOMContentLoaded", function () {
    const characterButton = document.querySelector(".character-button");

    let clonedButton = null;
    let isCloned = false;

    window.addEventListener("scroll", function () {
        const rect = characterButton.getBoundingClientRect();
        const isOutOfView = rect.top < 0;

        if (isOutOfView && !isCloned) {
            createClonedButton();
        } else if (!isOutOfView && isCloned) {
            removeClonedButton();
        }
    });

    function createClonedButton() {
        clonedButton = characterButton.cloneNode(true);
        clonedButton.classList.add("fixed");

        syncRadioState(characterButton, clonedButton);

        document.body.appendChild(clonedButton);
        isCloned = true;

        setupRadioSync(clonedButton, characterButton);
        setupRadioSync(characterButton, clonedButton);
    }

    function removeClonedButton() {
        if (clonedButton) {
            syncRadioState(clonedButton, characterButton);
            clonedButton.remove();
            isCloned = false;
        }
    }

    function syncRadioState(source, target) {
        const sourceRadios = source.querySelectorAll("input[type='radio']");
        const targetRadios = target.querySelectorAll("input[type='radio']");

        sourceRadios.forEach((radio, index) => {
            targetRadios[index].checked = radio.checked;
        });
    }

    function setupRadioSync(source, target) {
        const sourceRadios = source.querySelectorAll("input[type='radio']");
        const targetRadios = target.querySelectorAll("input[type='radio']");

        sourceRadios.forEach((radio, index) => {
            radio.addEventListener("change", function () {
                targetRadios[index].checked = radio.checked;
            });
        });
    }
});
