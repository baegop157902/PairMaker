document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.querySelector(".save-btn");
    const modalOverlay = document.getElementById("modal-overlay");
    const closeModal = document.getElementById("close-modal");
    const downloadBtn = document.getElementById("download-btn");
    const modalImage = document.getElementById("modal-image");
    const canvas = document.getElementById("canvas-container");

    const uploadedImage = new Image();
        uploadedImage.onload = function () {
            const image = new Konva.Image({
                image: uploadedImage,
                width: 1920,
                height: 1080,
            });
            layer.add(image);
            layer.draw();
        };
    uploadedImage.src = '/path/to/your/image.png';


    // 미리보기
    saveBtn.addEventListener("click", function () {
        const dataURL = stage.toDataURL({ pixelRatio: 2 });
        modalImage.src = dataURL;
        modalOverlay.classList.remove("Modal-hidden");
    });
    

    // 닫기
    closeModal.addEventListener("click", function () {
        modalOverlay.classList.add("Modal-hidden");
    });

    // 저장
    downloadBtn.addEventListener("click", function () {
        const currentScale = stage.scale();
        const currentWidth = stage.width();
        const currentHeight = stage.height();

        stage.scale({ x: 1, y: 1 });
        stage.width(1920);
        stage.height(1080);
        stage.draw();

        const dataURL = stage.toDataURL({ pixelRatio: 1 });

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "페어틀생성기.png";
        link.click();

        stage.scale(currentScale);
        stage.width(currentWidth);
        stage.height(currentHeight);
        stage.batchDraw();


        const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        downloadBtn.addEventListener("click", function () {
            const dataURL = stage.toDataURL({ pixelRatio: 2 });

            if (isiOS) {
                const newWindow = window.open("", "_blank");
                newWindow.document.write('<img src="' + dataURL + '" />');
            } else {
                const link = document.createElement("a");
                link.href = dataURL;
                link.download = "페어틀생성기.png";
                link.click();
            }
        });

    });
});
