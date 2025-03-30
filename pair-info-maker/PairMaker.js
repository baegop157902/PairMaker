const konvaPlaceholders = {};

function createPlaceholder(inputId, targetGroup, position) {
    const img = new Image();
    img.src = './assets/DefaultImg.png';

    const placeholder = new Konva.Image({
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        image: img,
    });

    if (inputId.includes("profile")) {
        placeholder.setAttrs({
        cornerRadius: position.width / 2,
        shadowColor: "#231705",
        shadowBlur: 10,
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0.26,
        fill: "#ffffff",
        });
    } else if (inputId.includes("add")) {
        placeholder.setAttrs({
        cornerRadius: 10,
        shadowColor: "#231705",
        shadowBlur: 10,
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0.26,
        fill: "#ffffff",
        });
    }
    targetGroup.add(placeholder);
    konvaPlaceholders[inputId] = placeholder;
}

const imagePositions = {
    "left-LD-image": { x: 0, y: 0, width: 336, height: 1080 },
    "right-LD-image": { x: 1584, y: 0, width: 336, height: 1080 },

    "left-profile-image": { x: 290, y: 45, width: 194, height: 194 },
    "left-SD-image": { x: 657, y: 216, width: 244, height: 338 },
    "left-add-1": { x: 290, y: 712, width: 199, height: 199 },
    "left-add-2": { x: 510, y: 712, width: 199, height: 199 },
    "left-add-3": { x: 730, y: 712, width: 199, height: 199 },

    "right-profile-image": { x: 1440, y: 45, width: 194, height: 194 },
    "right-SD-image": { x: 1023, y: 216, width: 244, height: 338 },
    "right-add-1": { x: 994, y: 712, width: 199, height: 199 },
    "right-add-2": { x: 1214, y: 712, width: 199, height: 199 },
    "right-add-3": { x: 1434, y: 712, width: 199, height: 199 },
};

const baseWidth = 1920;
const baseHeight = 1080;
const container = document.getElementById("canvas-container");

const stage = new Konva.Stage({
    container: "canvas-container",
    width: container.clientWidth,
    height: (container.clientWidth / baseWidth) * baseHeight,
});
const layer = new Konva.Layer();
stage.add(layer);

const scaleX = stage.width() / baseWidth;
const scaleY = stage.height() / baseHeight;
stage.scale({ x: scaleX, y: scaleY });

// 창 크기 변경
window.addEventListener("resize", () => {
    const newWidth = container.clientWidth;
    const newHeight = (newWidth / baseWidth) * baseHeight;
    stage.width(newWidth);
    stage.height(newHeight);
    const newScaleX = newWidth / baseWidth;
    const newScaleY = newHeight / baseHeight;
    stage.scale({ x: newScaleX, y: newScaleY });
    layer.draw();
});


// 배경
const background = new Konva.Rect({
    x: 0,
    y: 0,
    width: baseWidth,
    height: baseHeight,
    fill: "#F6F6F6",
});
layer.add(background);
background.moveToBottom();



const LDGroup = new Konva.Group();
const LDGradationGroup = new Konva.Group();
const TextBoxGroup = new Konva.Group();
const EtcImageBoxGroup = new Konva.Group();

layer.add(LDGroup);
layer.add(LDGradationGroup);
layer.add(TextBoxGroup);
layer.add(EtcImageBoxGroup);

createPlaceholder("left-LD-image", LDGroup, imagePositions["left-LD-image"]);
createPlaceholder("right-LD-image", LDGroup, imagePositions["right-LD-image"]);


const Line = new Konva.Line({
    points: [962, 190, 962, 1035],
    stroke: "#9A9A9A",
    strokeWidth: 1,
    lineCap: 'round',
    lineJoin: 'round',
    dash: [14, 12]
})

const LeftGradation = new Konva.Rect({
    x: 0,
    y: 0,
    width: 340,
    height: 1080,
    fillLinearGradientStartPoint: { x: 0, y: 0 },
    fillLinearGradientEndPoint: { x: 340, y: 0 },
    fillLinearGradientColorStops: [0.8, 'rgba(246, 246, 246, 0)', 1, 'rgba(246, 246, 246, 1)']
})

const RightGradation = new Konva.Rect({
    x: 1580,
    y: 0,
    width: 340,
    height: 1080,
    fillLinearGradientStartPoint: { x: 0, y: 0 },
    fillLinearGradientEndPoint: { x: 340, y: 0 },
    fillLinearGradientColorStops: [0, 'rgba(246, 246, 246, 1)', 0.2, 'rgba(246, 246, 246, 0)']
})

LDGradationGroup.add(Line);
LDGradationGroup.add(LeftGradation);
LDGradationGroup.add(RightGradation);


const box1 = new Konva.Rect({
    x: 290,
    y: 186,
    width: 640,
    height: 480,
    fill: "#FFFFFF",
    shadowColor: "#231705",
    shadowBlur: 10,
    shadowOffset: { x: 0, y: 0 },
    shadowOpacity: 0.26,
    cornerRadius: 10,
});

const box2 = new Konva.Rect({
    x: 994,
    y: 186,
    width: 640,
    height: 480,
    fill: "#FFFFFF",
    shadowColor: "#231705",
    shadowBlur: 10,
    shadowOffset: { x: 0, y: 0 },
    shadowOpacity: 0.26,
    cornerRadius: 10,
});

TextBoxGroup.add(box1);
TextBoxGroup.add(box2);



function CreateEtcBox(initialX, colorID) {
    const colorValue = document.getElementById(colorID)?.value || '#323232';

    const EtcBox = new Konva.Rect({
        x: initialX,
        y: 932,
        width: 640,
        height: 103,
        fill: colorValue,
        cornerRadius: 10,
        shadowColor: "#231705",
        shadowBlur: 10,
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0.26,
        cornerRadius: 10,
    })

    TextBoxGroup.add(EtcBox);
    layer.batchDraw();

    document.getElementById(colorID).addEventListener('input', function () {
        EtcBox.fill(this.value);
        layer.batchDraw();
    });

    return EtcBox;
}

const leftEtcBox = CreateEtcBox(290, 'left-flat-back-color');
const rightEtcBox = CreateEtcBox(994, 'right-flat-back-color');

createPlaceholder("left-profile-image", EtcImageBoxGroup, imagePositions["left-profile-image"]);
createPlaceholder("right-profile-image", EtcImageBoxGroup, imagePositions["right-profile-image"]);
createPlaceholder("left-SD-image", EtcImageBoxGroup, imagePositions["left-SD-image"]);
createPlaceholder("right-SD-image", EtcImageBoxGroup, imagePositions["right-SD-image"]);
createPlaceholder("left-add-1", EtcImageBoxGroup, imagePositions["left-add-1"]);
createPlaceholder("left-add-2", EtcImageBoxGroup, imagePositions["left-add-2"]);
createPlaceholder("left-add-3", EtcImageBoxGroup, imagePositions["left-add-3"]);
createPlaceholder("right-add-1", EtcImageBoxGroup, imagePositions["right-add-1"]);
createPlaceholder("right-add-2", EtcImageBoxGroup, imagePositions["right-add-2"]);
createPlaceholder("right-add-3", EtcImageBoxGroup, imagePositions["right-add-3"]);


//텍스트 & 컬러박스:: 한글이름
function CreateKoreaName(textID, colorID, initialX, initialAlign) {
    const textValue = document.getElementById(textID)?.value || '이름';
    const colorValue = document.getElementById(colorID)?.value || '#323232';

    const KoreaName = new Konva.Text({
        text: textValue,
        fill: colorValue,
        x: initialX,
        y: 82,
        width: 446,
        fontSize: 32,
        fontStyle: "600",
        align: initialAlign,
        fontFamily: 'Apple SD Gothic Neo',
        wrap: "none"
    });

    EtcImageBoxGroup.add(KoreaName);
    layer.batchDraw();

    // 입력 폼 연결: 텍스트 내용
    document.getElementById(textID).addEventListener('input', function () {
        KoreaName.text(this.value);
        layer.batchDraw();
    });

    // 입력 폼 연결: 텍스트 색상
    document.getElementById(colorID).addEventListener('input', function () {
        KoreaName.fill(this.value);
        layer.batchDraw();
    });

    return KoreaName;
}


//텍스트 & 컬러박스:: 영어이름
const fontMap = {
    appleSDGothic: "Apple SD Gothic Neo",
    BlackHanSans: "Black Han Sans",
    SongMyung: "Song Myung",
    Tektur: "Tektur",
    LilitaOne: "Lilita One",
    Iansui: "Iansui",
    DelaGothicOne: "Dela Gothic One",
    KaiseiDecol: "Kaisei Decol"
};

function CreateOtherName(textID, colorID, initialX, initialAlign, fontID) {
    const textValue = document.getElementById(textID)?.value || 'Name';
    const colorValue = document.getElementById(colorID)?.value || '#323232';
    const selectedFont = document.getElementById(fontID)?.value || 'appleSDGothic';
    const fontValue = fontMap[selectedFont] || 'Apple SD Gothic Neo';

    const OtherName = new Konva.Text({
        fontFamily: fontValue,
        text: textValue,
        fill: colorValue,
        x: initialX,
        y: 126,
        width: 446,
        fontSize: 50,
        fontStyle: "800",
        align: initialAlign,
        wrap: "none"
    });

    EtcImageBoxGroup.add(OtherName);
    layer.batchDraw();

    document.getElementById(textID).addEventListener('input', function () {
        OtherName.text(this.value);
        layer.batchDraw();
    });

    document.getElementById(colorID).addEventListener('input', function () {
        OtherName.fill(this.value);
        layer.batchDraw();
    });

    document.getElementById(fontID).addEventListener('change', function () {
        OtherName.fontFamily(fontMap[this.value] || 'Apple SD Gothic Neo');
        layer.batchDraw();
    });

    return OtherName;
}


//텍스트:: 외관설명류 제목
function CreateMainText(initialX, initialY, textID, initialAlign) {
    const MainText = new Konva.Text({
        text: textID,
        fill: "#323232",
        x: initialX,
        y: initialY,
        fontSize: 20,
        fontStyle: "700",
        align: initialAlign,
        fontFamily: 'Apple SD Gothic Neo',
        wrap: "none"
    })

    EtcImageBoxGroup.add(MainText);
}


//텍스트:: 입력란
function CreateInfoText(initialX, initialY, textID, initialAlign) {
    const textValue = document.getElementById(textID)?.value || '여기에 설명을 적어주세요.';

    const InfoText = new Konva.Text({
        text: textValue,
        fill: "#323232",
        x: initialX,
        y: initialY,
        fontSize: 18,
        fontStyle: "400",
        align: initialAlign,
        fontFamily: 'Apple SD Gothic Neo',
        wrap: "char",
        width: 308,
        lineHeight: 1.4
    })

    EtcImageBoxGroup.add(InfoText);
    layer.batchDraw();

    document.getElementById(textID).addEventListener('input', function () {
        InfoText.text(this.value);
        layer.batchDraw();
    });

    return InfoText;
}

//텍스트:: cm + 모에화
function CreateInfoText2(initialX, initialY, textID, suffixID) {
    const baseText = document.getElementById(textID)?.value || '';
    const textValue = baseText + suffixID;
    
    const InfoText2 = new Konva.Text({
        text: textValue,
        fill: "#7B7B7B",
        x: initialX,
        y: initialY,
        fontSize: 20,
        fontStyle: "400",
        align: "center",
        fontFamily: 'Apple SD Gothic Neo',
        wrap: "none",
        width: 244
    })

    EtcImageBoxGroup.add(InfoText2);
    layer.batchDraw();

    document.getElementById(textID).addEventListener('input', function () {
        InfoText2.text(this.value + suffixID);
        layer.batchDraw();
    });

    return InfoText2;
}

//컬러박스
function CreateColorbox(initialX, colorID) {
    const colorValue = document.getElementById(colorID)?.value || '#323232';

    const ColorBox = new Konva.Rect({
        x: initialX,
        y: 582,
        width: 52,
        height: 52,
        fill: colorValue,
        shadowColor: "#231705",
        shadowBlur: 4,
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0.2,
        cornerRadius: 10,
    })

    EtcImageBoxGroup.add(ColorBox);

    document.getElementById(colorID).addEventListener('input', function () {
        ColorBox.fill(this.value);
        layer.batchDraw();
    });

    return ColorBox;
}

//텍스트: 납작캐해
function CreateFlatbox(initialX, textID, colorID) {
    const textValue = document.getElementById(textID)?.value || '여기에 설명을 적어주세요.';
    const colorValue = document.getElementById(colorID)?.value || '#323232';

    const Flatbox = new Konva.Text({
        text: textValue,
        fill: colorValue,
        x: initialX,
        y: 932,
        fontSize: 21,
        fontStyle: "400",
        align: 'center',
        verticalAlign: 'middle',
        fontFamily: 'Apple SD Gothic Neo',
        wrap: "char",
        width: 640,
        height: 103,
        lineHeight: 1.5
    })

    EtcImageBoxGroup.add(Flatbox);
    layer.batchDraw();

    document.getElementById(textID).addEventListener('input', function () {
        Flatbox.text(this.value);
        layer.batchDraw();
    });

    document.getElementById(colorID).addEventListener('input', function () {
        Flatbox.fill(this.value);
        layer.batchDraw();
    });

    return Flatbox;
}



// 텍스트 생성
const LeftKoreaName = CreateKoreaName('left-korea-name', 'left-korea-name-color', 502, "left");
const RightKoreaName = CreateKoreaName('right-korea-name', 'right-korea-name-color', 974, "right");

const LeftOtherName = CreateOtherName('left-etc-name', 'left-etc-name-color', 502, "left", 'left-sub-font');
const RightOtherName = CreateOtherName('right-etc-name', 'right-etc-name-color', 974, "right", 'right-sub-font');

const main1 = CreateMainText(333, 269, "평소의상", "left");
const main2 = CreateMainText(1516, 269, "평소의상", "left");
const main3 = CreateMainText(333, 358, "외관특징", "left");
const main4 = CreateMainText(1516, 358, "외관특징", "left");
const main5 = CreateMainText(337, 554, "HAIR", "center");
const main6 = CreateMainText(495, 554, "EYES", "center");
const main7 = CreateMainText(1345, 552, "HAIR", "center");
const main8 = CreateMainText(1509, 552, "EYES", "center");

const leftClothes = CreateInfoText(333, 296, 'left-clothes', "left");
const leftCharacter = CreateInfoText(333, 386, 'left-charac', "left");
const rightClothes = CreateInfoText(1278, 296, 'right-clothes', "right");
const rightCharacter = CreateInfoText(1278, 386, 'right-charac', "right");

const leftCm = CreateInfoText2(657, 581, 'left-cm', " cm");
const leftMoe = CreateInfoText2(657, 612, 'left-animal', " 모에화");
const rightCm = CreateInfoText2(1023, 581, 'right-cm', " cm");
const rightMoe = CreateInfoText2(1023, 612, 'right-animal', " 모에화");

const leftHair = CreateColorbox(333, 'left-hair');
const leftLeye = CreateColorbox(458, 'left-left-eyes');
const leftReye = CreateColorbox(528, 'left-right-eyes');
const rightHair = CreateColorbox(1339, 'right-hair');
const rightLeye = CreateColorbox(1468, 'right-left-eyes');
const rightReye = CreateColorbox(1538, 'right-right-eyes');

const leftFlat = CreateFlatbox(290, 'left-flat', 'left-flat-text-color');
const rightFlat = CreateFlatbox(994, 'right-flat', 'right-flat-text-color');

layer.draw();




function updatePlaceholderImage(inputId) {
    const croppedImage = window.croppedImages[inputId];
    const placeholder = konvaPlaceholders[inputId];

    const img = new Image();

    img.onload = function () {
        placeholder.image(img);
        placeholder.setAttrs({
        x: imagePositions[inputId].x,
        y: imagePositions[inputId].y,
        width: imagePositions[inputId].width,
        height: imagePositions[inputId].height,
        });
        layer.draw();
    };
    
    img.src = croppedImage;
}
