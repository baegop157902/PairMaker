document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.querySelector(".save-btn");
    const modalOverlay = document.getElementById("modal-overlay");
    const closeModal = document.getElementById("close-modal");
    const downloadBtn = document.getElementById("download-btn");
    const modalImage = document.getElementById("modal-image");

    // iOS 확인
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // 미리보기
    saveBtn.addEventListener("click", function () {
        const dataURL = stage.toDataURL({ pixelRatio: 2 });
        modalImage.src = dataURL;
        modalOverlay.classList.remove("Modal-hidden");
    });

    // 닫기 버튼
    closeModal.addEventListener("click", function () {
        modalOverlay.classList.add("Modal-hidden");
    });

    // 다운로드 버튼
    downloadBtn.addEventListener("click", function () {
        if (isiOS) {
            // iOS에서는 새 창에 이미지 표시
            const dataURL = stage.toDataURL({ pixelRatio: 2 });
            const newWindow = window.open("", "_blank");
            newWindow.document.write('<img src="' + dataURL + '" />');
        } else {
            // 현재 스테이지 상태 저장
            const currentScale = stage.scale();
            const currentWidth = stage.width();
            const currentHeight = stage.height();

            // 다운로드를 위한 캔버스 크기 변경
            stage.scale({ x: 1, y: 1 });
            stage.width(1920);
            stage.height(1080);
            stage.draw();

            // 이미지 다운로드
            const dataURL = stage.toDataURL({ pixelRatio: 1 });
            const link = document.createElement("a");
            link.href = dataURL;
            link.download = "페어틀생성기.png";
            link.click();

            // 원래 상태로 복원
            stage.scale(currentScale);
            stage.width(currentWidth);
            stage.height(currentHeight);
            stage.batchDraw();
        }
    });
});
