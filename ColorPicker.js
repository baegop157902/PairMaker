const konvaTextMap = {
    'left-korea-name-color': LeftKoreaName,
    'right-korea-name-color': RightKoreaName,
    'left-etc-name-color': LeftOtherName,
    'right-etc-name-color': RightOtherName,

    'left-hair': leftHair,
    'left-left-eyes': leftLeye,
    'left-right-eyes': leftReye,
    'right-hair': rightHair,
    'right-left-eyes': rightLeye,
    'right-right-eyes': rightReye,

    'left-flat-back-color': leftEtcBox,
    'right-flat-back-color': rightEtcBox,

    'left-flat-text-color': leftFlat,
    'right-flat-text-color': rightFlat,
};

document.addEventListener("DOMContentLoaded", function() {
    const colorPickers = document.querySelectorAll('.color-picker');

    colorPickers.forEach(function(picker) {
        const pickrInstance = Pickr.create({
            el: picker,
            theme: 'monolith', // 'classic', 'nano'
            components: {
                preview: true,
                opacity: false,
                hue: true,
                interaction: {
                    hex: false,
                    rgba: false,
                    hsla: false,
                    hsva: false,
                    cmyk: false,
                    input: true,
                    clear: false,
                    save: true
                }
            },
        });


        pickrInstance.on('save', (color, instance) => {
            const selectedColor = color.toHEXA().toString();

            if (konvaTextMap[picker.id]) {
                konvaTextMap[picker.id].fill(selectedColor);
                layer.batchDraw();
            }

            if (picker.id === 'left-flat-back-color') {
                document.querySelector('.left-flat-sample').style.backgroundColor = selectedColor;
            } else if (picker.id === 'left-flat-text-color') {
                document.querySelector('.left-flat-sample').style.color = selectedColor;
            } else if (picker.id === 'right-flat-back-color') {
                document.querySelector('.right-flat-sample').style.backgroundColor = selectedColor;
            } else if (picker.id === 'right-flat-text-color') {
                document.querySelector('.right-flat-sample').style.color = selectedColor;
            }

            instance.hide();
        });


        pickrInstance.on('init', instance => {
            const {result} = instance.getRoot().interaction;

            result.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    instance.applyColor();
                    instance.hide();
                }
            }, {capture: true});
        });
    });
});

