document.addEventListener('DOMContentLoaded', function () {
    const selectElements = document.querySelectorAll('#left-sub-font, #right-sub-font');

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

    selectElements.forEach(selectElement => {
        document.querySelectorAll(`#${selectElement.id} option`).forEach(option => {
            const fontKey = option.className;
            if (fontStyles[fontKey]) {
                option.style.fontFamily = fontStyles[fontKey];
            }
        });

        //
        selectElement.addEventListener('change', function() {
            const selectedFont = selectElement.value;
            const selectedFontFamily = fontStyles[selectedFont] || '"Arial", sans-serif';

            selectElement.style.fontFamily = selectedFontFamily;
        });

        selectElement.addEventListener('mousedown', function() {
            document.querySelectorAll(`#${selectElement.id} option`).forEach(option => {
                const fontKey = option.className;
                const selectedFontFamily = fontStyles[fontKey] || '"Arial", sans-serif';
                option.style.fontFamily = selectedFontFamily;
            });
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const leftTextInput = document.getElementById('left-etc-name');
    const rightTextInput = document.getElementById('right-etc-name');
    const leftFontPreview = document.getElementById('left-font-preview');
    const rightFontPreview = document.getElementById('right-font-preview');
    const leftFontSelect = document.getElementById('left-sub-font');
    const rightFontSelect = document.getElementById('right-sub-font');

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

    function updateFontPreview() {
        const leftFont = leftFontSelect.value;
        const rightFont = rightFontSelect.value;
        
        leftFontPreview.textContent = leftTextInput.value || "폰트 미리보기";
        rightFontPreview.textContent = rightTextInput.value || "폰트 미리보기";

        leftFontPreview.style.fontFamily = fontStyles[leftFont] || '"Arial", sans-serif';
        rightFontPreview.style.fontFamily = fontStyles[rightFont] || '"Arial", sans-serif';
    }

    leftTextInput.addEventListener('input', updateFontPreview);
    rightTextInput.addEventListener('input', updateFontPreview);

    leftFontSelect.addEventListener('change', updateFontPreview);
    rightFontSelect.addEventListener('change', updateFontPreview);

    updateFontPreview();
});
