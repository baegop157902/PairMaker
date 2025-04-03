window.croppedImages = {};

document.addEventListener('DOMContentLoaded', function () {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const cropContainer = document.querySelector('.crop-container');
    const imagePreview = document.getElementById('image-preview');
    const cropButton = document.getElementById('crop-button');
    const closeButton = document.getElementById('close-button');
    let cropper;
    let activeLabel = null;

    fileInputs.forEach(fileInput => {
        const label = fileInput.nextElementSibling;

        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    cropContainer.style.display = 'flex';
                    activeLabel = label;

                    imagePreview.onload = function () {
                        if (cropper) {
                            cropper.destroy();
                        }

                        cropper = new Cropper(imagePreview, {
                            aspectRatio: NaN,
                            viewMode: 1,
                            autoCropArea: 1,
                            dragMode: 'move',
                            scalable: true,
                            ready() {
                                setMaxCropBox();
                            }
                        });
                    };
                };
                reader.readAsDataURL(file);

                fileInput.value = '';
            }
        });
    });

    function setMaxCropBox() {
        if (!cropper) return;
        const imageData = cropper.getImageData();
        cropper.setCropBoxData({
            left: 0,
            top: 0,
            width: imageData.width,
            height: imageData.height
        });
    }

    document.getElementById('aspect-1-1').addEventListener('click', function () {
        if (cropper) {
            cropper.setAspectRatio(1);
            setMaxCropBox();
        }
    });

    document.getElementById('aspect-ld').addEventListener('click', function () {
        if (cropper) {
            cropper.setAspectRatio(14 / 45);
            setMaxCropBox();
        }
    });

    document.getElementById('aspect-token').addEventListener('click', function () {
        if (cropper) {
            cropper.setAspectRatio(1 / 1.426);
            setMaxCropBox();
        }
    });

    cropButton.addEventListener("click", function () {
        if (!cropper || !activeLabel) return;

        const croppedCanvas = cropper.getCroppedCanvas();
        if (!croppedCanvas) return;

        const croppedImage = croppedCanvas.toDataURL();
        const inputId = activeLabel.previousElementSibling.id;

        window.croppedImages[inputId] = croppedImage;

        updatePlaceholderImage(inputId);

        activeLabel.style.backgroundImage = `url(${croppedImage})`;
        activeLabel.style.backgroundSize = "cover";
        activeLabel.style.backgroundPosition = "center";
        activeLabel.style.backgroundColor = "#FFFFFF";

        const icon = activeLabel.querySelector("i");
        if (icon) icon.style.display = "none";

        cropContainer.style.display = "none";
    });

    closeButton.addEventListener('click', function () {
        cropContainer.style.display = 'none';
    });

});