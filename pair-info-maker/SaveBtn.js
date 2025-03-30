document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.querySelector(".save-btn");
    const modalOverlay = document.getElementById("modal-overlay");
    const closeModal = document.getElementById("close-modal");
    const downloadBtn = document.getElementById("download-btn");
    const modalImage = document.getElementById("modal-image");
    const canvas = document.getElementById("canvas-container");


    // 미리보기
    saveBtn.addEventListener("click", function () {
        const dataURL = stage.toDataURL({
            pixelRatio: 1920 / stage.width()
        });
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
        stage.width(baseWidth);
        stage.height(baseHeight);
        stage.draw();

        const dataURL = stage.toDataURL();

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "페어틀생성기.png";
        link.click();

        stage.scale(currentScale);
        stage.width(currentWidth);
        stage.height(currentHeight);
        stage.batchDraw();

        // iOS:
        const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (isiOS) {
            window.open(dataURL, "_blank");
        } else {
            const link = document.createElement("a");
            link.href = dataURL;
            link.download = "페어틀생성기.png";
            link.click();
        }
    });
});

