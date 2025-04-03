document.addEventListener('DOMContentLoaded', function () {
    const fontStyles = {
        "AppleSDGothic": '"Apple SD Gothic Neo", sans-serif',
        "Tektur": '"Tektur", sans-serif',
        "LilitaOne": '"Lilita One", sans-serif',
        "Iansui": '"Iansui", cursive',
        "DelaGothicOne": '"Dela Gothic One", sans-serif',
        "KaiseiDecol": '"Kaisei Decol", serif',
        "BlackHanSans": '"Black Han Sans", sans-serif',
        "SongMyung": '"Song Myung", serif'
    };

    const selectElements = document.querySelectorAll('#left-sub-font, #right-sub-font');
    const textInputs = document.querySelectorAll('#left-etc-name, #right-etc-name');
    const fontPreviews = {
        "left-sub-font": document.getElementById('left-font-preview'),
        "right-sub-font": document.getElementById('right-font-preview')
    };

    selectElements.forEach(selectElement => {
        selectElement.querySelectorAll('option').forEach(option => {
            const fontKey = option.className;
            if (fontStyles[fontKey]) {
                option.style.fontFamily = fontStyles[fontKey];
            }
        });

        selectElement.addEventListener('change', updateFontPreview);
    });

    textInputs.forEach(input => input.addEventListener('input', updateFontPreview));

    function updateFontPreview() {
        selectElements.forEach(selectElement => {
            const selectedFont = selectElement.value;
            const fontFamily = fontStyles[selectedFont] || '"Arial", sans-serif';
            const previewElement = fontPreviews[selectElement.id];

            const textInput = document.querySelector(`#${selectElement.id.replace('-sub-font', '-etc-name')}`);
            previewElement.textContent = textInput.value || "폰트 미리보기";
            previewElement.style.fontFamily = fontFamily;
        });
    }

    updateFontPreview();
});
