export const templateId = '2p-simple';
export const author = '@baegop157902';
export const size = {
    width: 1920,
    height: 1080
};
export const fonts = [
    'Pretendard',
    'Apple SD Gothic Neo',
    'Black Han Sans',
    'Song Myung',
    'Cafe24 PRO UP',
    'Grandiflora One',
    'Tektur',
    'Lilita One',
    'GOFIRE',
    'Top Speed',
    'Orandakan Kana',
    'Iansui',
    'Dela Gothic One',
    'Kaisei Decol'
];

const characterGroups = [
    ['profile', '두상'],
    ['name', '이름&캐프'],
    ['LD', '전신 배경'],
    ['SD', '서브 이미지'],
    ['description', '외관설명'],
    ['colors', '머리·눈 색'],
    ['add-1', '추가 이미지 1'],
    ['add-2', '추가 이미지 2'],
    ['add-3', '추가 이미지 3'],
    ['flat', '한 줄 설명']
];

export function groups(_state, side) {
    if (side === 'common') return [['bg', '배경']];
    if (side === 'left' || side === 'right') return characterGroups;
    return [];
}

export const positions = {
    'common-bg-image': { x: 0, y: 0, ...size },
    'left-LD-image': {
        x: 0,
        y: 0,
        width: 336,
        height: 1080
    },
    'right-LD-image': {
        x: 1584,
        y: 0,
        width: 336,
        height: 1080
    },
    'left-profile-image': {
        x: 285,
        y: 45,
        width: 194,
        height: 194
    },
    'right-profile-image': {
        x: 1440,
        y: 45,
        width: 194,
        height: 194
    },
    'left-SD-image': {
        x: 657,
        y: 216,
        width: 244,
        height: 338
    },
    'right-SD-image': {
        x: 1023,
        y: 216,
        width: 244,
        height: 338
    },
    'left-add-1': {
        x: 290,
        y: 712,
        width: 199,
        height: 199
    },
    'left-add-2': {
        x: 510,
        y: 712,
        width: 199,
        height: 199
    },
    'left-add-3': {
        x: 730,
        y: 712,
        width: 199,
        height: 199
    },
    'right-add-1': {
        x: 994,
        y: 712,
        width: 199,
        height: 199
    },
    'right-add-2': {
        x: 1213,
        y: 712,
        width: 199,
        height: 199
    },
    'right-add-3': {
        x: 1432,
        y: 712,
        width: 199,
        height: 199
    }
};

export function imageId(side, group) {
    return group.startsWith('add-') ? `${side}-${group}` : `${side}-${group}-image`;
}

export function fields(side, group) {
    const field = (key, label, type = 'text') => ({
        id: `${side}-${key}`,
        label,
        type
    });
    switch (group) {
        case 'bg':
            return [
                {
                    ...field('bg-mode', '배경 선택', 'radio'),
                    options: [
                        { value: 'color', label: '단색' },
                        { value: 'image', label: '이미지' }
                    ]
                },
                {
                    ...field('bg-color', '배경색', 'color'),
                    visibleWhen: { id: `${side}-bg-mode`, value: 'color' }
                },
                {
                    ...field('bg-blur', '배경 흐리게', 'checkbox'),
                    visibleWhen: { id: `${side}-bg-mode`, value: 'image' }
                }
            ];
        case 'profile':
        case 'add-1':
        case 'add-2':
        case 'add-3':
            return [
                field(`${group}-background-enabled`, '배경', 'checkbox'),
                { ...field(`${group}-background-color`, '배경색', 'color'),
                    visibleWhen: `${side}-${group}-background-enabled` }
            ];
        case 'name':
            return [field('korea-name', '이름'), field('korea-name-color', '이름 색상', 'color'), field('etc-name', '캐치프레이즈'), field('etc-name-color', '캐치프레이즈 색상', 'color'), field('sub-font', '캐치프레이즈 폰트', 'font'), field('small-check', '더 작은 텍스트', 'checkbox')];
        case 'description':
            return [
                field('clothes-title', '평소외관 제목'),
                field('clothes', '평소의상 내용', 'textarea'),
                field('charac-title', '외관특징 제목'),
                field('charac', '외관특징 내용', 'textarea'),
                field('cm', '키 (cm)'),
                field('animal', '모에화')
            ];
        case 'colors':
            return [field('hair', '머리 색', 'color'), field('left-eyes', '왼쪽 눈', 'color'), field('right-eyes', '오른쪽 눈', 'color')];
        case 'flat':
            return [field('flat', '한 줄 설명', 'textarea'), field('flat-back-color', '배경 색상', 'color'), field('flat-text-color', '글자 색상', 'color')];
        default:
            return [];
    }
}

export function initialState(id = templateId) {
    const values = {
        'common-bg-mode': 'color',
        'common-bg-color': '#f6f6f6',
        'common-bg-blur': false,
        'common-bg-image-citation': ''
    };
    for (const side of ['left', 'right']) {
        for (const group of ['profile', 'add-1', 'add-2', 'add-3']) {
            values[`${side}-${group}-background-enabled`] = false;
            values[`${side}-${group}-background-color`] = '#ffffff';
        }
        Object.assign(values, {
            [`${side}-LD-image-citation`]: '',
            [`${side}-profile-image-citation`]: '',
            [`${side}-SD-image-citation`]: '',
            [`${side}-add-1-citation`]: '',
            [`${side}-add-2-citation`]: '',
            [`${side}-add-3-citation`]: '',

            [`${side}-korea-name`]: '이름',
            [`${side}-etc-name`]: 'Name',
            [`${side}-sub-font`]: 'Pretendard',
            [`${side}-small-check`]: false,
            [`${side}-korea-name-color`]: '#323232',
            [`${side}-etc-name-color`]: '#323232',
            [`${side}-clothes-title`]: '평소외관',
            [`${side}-charac-title`]: '외관특징',
            [`${side}-clothes`]: '여기에 설명을 적어주세요.',
            [`${side}-charac`]: '여기에 설명을 적어주세요.',
            [`${side}-cm`]: '',
            [`${side}-animal`]: '',
            [`${side}-hair`]: '#323232',
            [`${side}-left-eyes`]: '#323232',
            [`${side}-right-eyes`]: '#323232',
            [`${side}-flat`]: '여기에 설명을 적어주세요.',
            [`${side}-flat-back-color`]: '#323232',
            [`${side}-flat-text-color`]: '#ffffff'
        });
    }
    return {
        schemaVersion: 1,
        templateId: id,
        values,
        touched: {},
        images: {},
        stickers: []
    };
}

// 이전 저장 파일에는 배경 선택과 제목 입력값이 없습니다. 기존 값·이미지는 보존합니다.
export function migrateState(source) {
    const raw = structuredClone(source);
    if (!raw.values || typeof raw.values !== 'object' || Array.isArray(raw.values)) return raw;
    raw.values = { ...initialState().values, ...raw.values };
    return raw;
}

export function restoreState(_raw, next) {
    // 공통 검증기가 이 기본값에 저장된 입력값과 이미지를 병합합니다.
    next.values = { ...initialState().values, ...next.values };
    return next;
}

// 실제 이미지의 알파를 줄입니다. 원본 저장 데이터와 배경색은 바꾸지 않습니다.
function fadeLDImage(image, box, left) {
    const canvas = document.createElement('canvas');
    canvas.width = box.width;
    canvas.height = box.height;
    const ctx = canvas.getContext('2d');
    const ratio = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight);
    const width = box.width / ratio, height = box.height / ratio;
    ctx.drawImage(image, (image.naturalWidth - width) / 2, (image.naturalHeight - height) / 2,
        width, height, 0, 0, box.width, box.height);
    const mask = ctx.createLinearGradient(0, 0, box.width, 0);
    if (left) {
        mask.addColorStop(0, '#000');
        mask.addColorStop(0.8, '#000');
        mask.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
        mask.addColorStop(0, 'rgba(0,0,0,0)');
        mask.addColorStop(0.2, '#000');
        mask.addColorStop(1, '#000');
    }
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, box.width, box.height);
    return canvas;
}

export function createPairScene(stage, openEditor) {
    const K = window.Konva;
    const layer = new K.Layer();
    stage.add(layer);
    const bg = new K.Rect({
        ...size,
        fill: '#F6F6F6'
    });
    layer.add(bg);
    const ld = new K.Group(),
        guides = new K.Group({
            listening: false
        }),
        boxes = new K.Group(),
        content = new K.Group();
    layer.add(ld, guides, boxes, content);
    const imageNodes = new Map(),
        textBindings = [],
        nameSizeBindings = [],
        colorBindings = [];
    const defaults = initialState().values;
    let currentValues = defaults;
    let backgroundImage = null;
    let filteredBackgroundImage = null;
    let backgroundBlurred = false;
    function refreshCanvasBackground() {
        const imageMode = currentValues['common-bg-mode'] === 'image';
        const item = imageNodes.get('common-bg-image');
        bg.fill(imageMode ? '#F6F6F6' : currentValues['common-bg-color']);
        item.image.visible(imageMode && !!backgroundImage);
        item.rect.visible(false);
        item.plus.visible(false);
        const blur = imageMode && !!backgroundImage && currentValues['common-bg-blur'] === true;
        // 다른 입력값을 바꿀 때마다 큰 배경 이미지를 다시 캐시하지 않습니다.
        if (filteredBackgroundImage !== backgroundImage || backgroundBlurred !== blur) {
            item.image.clearCache();
            item.image.filters(blur ? [K.Filters.Blur] : []);
            item.image.blurRadius(blur ? 10 : 0);
            if (blur) item.image.cache();
            filteredBackgroundImage = backgroundImage;
            backgroundBlurred = blur;
        }
    }
    function updateBackground(id, item) {
        if (id === 'common-bg-image') return;
        const side = id.startsWith('left-') ? 'left' : 'right';
        const group = id.slice(side.length + 1).replace(/-image$/, '');
        const supported = ['profile', 'add-1', 'add-2', 'add-3'].includes(group);
        const hasImage = !!item.image.image();
        if (group === 'LD') {
            // 투명한 선택 영역을 남겨 업로드 후에도 전신 이미지를 클릭할 수 있게 합니다.
            if (hasImage) {
                item.rect.fillPriority('color');
                item.rect.fill('rgba(0,0,0,0)');
                return;
            }
            item.rect.fillPriority('linear-gradient');
            item.rect.fillLinearGradientStartPoint({ x: 0, y: 0 });
            item.rect.fillLinearGradientEndPoint({ x: item.p.width, y: 0 });
            item.rect.fillLinearGradientColorStops(side === 'left'
                ? [0, '#323232', 0.8, '#323232', 1, 'rgba(50,50,50,0)']
                : [0, 'rgba(50,50,50,0)', 0.2, '#323232', 1, '#323232']);
            return;
        }
        const fill = !hasImage ? '#323232' : supported && currentValues[`${side}-${group}-background-enabled`]
            ? currentValues[`${side}-${group}-background-color`] : supported ? 'rgba(0,0,0,0)' : null;
        item.rect.fill(fill);
    }
    const shadow = {
        shadowColor: '#231705',
        shadowBlur: 10,
        shadowOffset: {
            x: 0,
            y: 0
        },
        shadowOpacity: 0.26
    };

    function clickable(node, side, group) {
        node.on('click tap', e => {
            e.cancelBubble = true;
            openEditor(side, group, node);
        });
        node.on('mouseenter', () => {
            stage.container().style.cursor = 'pointer';
        });
        node.on('mouseleave', () => {
            stage.container().style.cursor = '';
        });
    }

    function addImage(id, parent) {
        const p = positions[id],
            round = id.includes('profile') ? p.width / 2 : id.includes('add') ? 10 : 0;
        const group = new K.Group({
            x: p.x,
            y: p.y
        });
        const rect = new K.Rect({
            width: p.width,
            height: p.height,
            fill: '#323232',
            cornerRadius: round,
            ...(round ? shadow : {})
        });
        const clip = new K.Group({
            clipFunc(ctx) {
                ctx.beginPath();
                ctx.roundRect(0, 0, p.width, p.height, round);
                ctx.closePath();
            }
        });
        const image = new K.Image({
            width: p.width,
            height: p.height,
            listening: false
        });
        clip.add(image);
        const plus = new K.Text({
            text: '+',
            width: p.width,
            height: p.height,
            align: 'center',
            verticalAlign: 'middle',
            fill: '#fff',
            fontSize: 28,
            listening: false
        });

        const citationText = new K.Text({
            width: p.width,
            y: p.height - 20, // 글자크기(14) + 하단여백(6) = 밑에서 20px 띄움
            align: 'center',
            fontSize: 14,
            fontFamily: 'Pretendard',
            fill: '#5f5f5f',
            stroke: '#ffffff',
            strokeWidth: 2,
            fillAfterStrokeEnabled: true,
            listening: false,
            visible: false
        });

        group.add(rect, clip, plus, citationText);
        parent.add(group);
        const side = id.startsWith('common-') ? 'common' : id.startsWith('left') ? 'left' : 'right';
        const key = id.slice(side.length + 1).replace(/-image$/, '');
        clickable(group, side, key);
        imageNodes.set(id, {
            image,
            plus,
            rect,
            p,
            citationText
        });
    }
    // 원래 단색 배경 뒤가 아니라, 같은 배경 위치를 이미지로 대체합니다.
    addImage('common-bg-image', layer);
    imageNodes.get('common-bg-image').image.getParent().getParent().moveToBottom();
    bg.moveToBottom();
    clickable(bg, 'common', 'bg');
    addImage('left-LD-image', ld);
    addImage('right-LD-image', ld);
    guides.add(new K.Line({
        points: [962, 190, 962, 1035],
        stroke: '#9A9A9A',
        strokeWidth: 1,
        dash: [14, 12]
    }));
    for (const [side, x] of [
            ['left', 290],
            ['right', 994]
        ]) {
        boxes.add(new K.Rect({
            x,
            y: 186,
            width: 640,
            height: 480,
            fill: '#fff',
            cornerRadius: 10,
            ...shadow
        }));
        const flat = new K.Rect({
            x,
            y: 932,
            width: 640,
            height: 103,
            fill: '#323232',
            cornerRadius: 10,
            ...shadow
        });
        boxes.add(flat);
        clickable(flat, side, 'flat');
        colorBindings.push([flat, `${side}-flat-back-color`]);
    }
    Object.keys(positions).filter(id => !id.includes('-LD-') && id !== 'common-bg-image').forEach(id => addImage(id, content));

    function text(attrs, binding, side, group) {
        const node = new K.Text({
            fontFamily: 'Pretendard',
            fill: '#323232',
            fontSize: 18,
            ...attrs
        });
        content.add(node);
        if (binding) textBindings.push([node, binding]);
        if (side) clickable(node, side, group);
        return node;
    }
    for (const side of ['left', 'right']) {
        const left = side === 'left',
            x = left ? 500 : 994,
            align = left ? 'left' : 'right';
        const nameText = text({
            x,
            y: 80,
            width: 424,
            fontSize: 32,
            fontStyle: '600',
            wrap: 'none',
            align
        }, {
            text: `${side}-korea-name`,
            color: `${side}-korea-name-color`
        }, side, 'name');
        const catchphraseText = text({
            x,
            y: 122,
            width: 430,
            fontSize: 48,
            fontStyle: '800',
            wrap: 'none',
            verticalAlign: 'middle',
            align
        }, {
            text: `${side}-etc-name`,
            color: `${side}-etc-name-color`,
            font: `${side}-sub-font`
        }, side, 'name');
        nameSizeBindings.push({side, nameText, catchphraseText});
        text({
            x: left ? 333 : 1278,
            y: 269,
            width: 308,
            align,
            text: '평소외관',
            fontSize: 20,
            fontStyle: '700'
        }, { text: `${side}-clothes-title` }, side, 'description');
        text({
            x: left ? 333 : 1278,
            y: 370,
            width: 308,
            align,
            text: '외관특징',
            fontSize: 20,
            fontStyle: '700'
        }, { text: `${side}-charac-title` }, side, 'description');
        text({
            x: left ? 333 : 1278,
            y: 296,
            width: 308,
            height: 52,
            align,
            wrap: 'char',
            lineHeight: 1.4
        }, {
            text: `${side}-clothes`
        }, side, 'description');
        text({
            x: left ? 333 : 1278,
            y: 398,
            width: 308,
            height: 150,
            align,
            wrap: 'char',
            lineHeight: 1.4
        }, {
            text: `${side}-charac`
        }, side, 'description');
        text({
            x: left ? 657 : 1023,
            y: 581,
            width: 244,
            align: 'center',
            fontSize: 20,
            fill: '#7B7B7B'
        }, {
            text: `${side}-cm`,
            suffix: ' cm'
        }, side, 'description');
        text({
            x: left ? 657 : 1023,
            y: 612,
            width: 244,
            align: 'center',
            fontSize: 20,
            fill: '#7B7B7B'
        }, {
            text: `${side}-animal`,
            suffix: ' 모에화'
        }, side, 'description');
        text({
            x: left ? 336 : 1344,
            y: 550,
            text: 'HAIR',
            fontSize: 20,
            fontStyle: '700'
        }, null, side, 'colors');
        text({
            x: left ? 492 : 1500,
            y: 550,
            text: 'EYES',
            fontSize: 20,
            fontStyle: '700'
        }, null, side, 'colors');
        for (const [key, cx] of [
                ['hair', left ? 333 : 1341],
                ['left-eyes', left ? 456 : 1464],
                ['right-eyes', left ? 526 : 1534]
            ]) {
            const node = new K.Rect({
                x: cx,
                y: 582,
                width: 52,
                height: 52,
                fill: '#323232',
                cornerRadius: 10,
                ...shadow,
                shadowBlur: 4,
                shadowOpacity: 0.2
            });
            content.add(node);
            colorBindings.push([node, `${side}-${key}`]);
            clickable(node, side, 'colors');
        }
        text({
            x: left ? 290 : 994,
            y: 932,
            width: 640,
            height: 103,
            align: 'center',
            verticalAlign: 'middle',
            fontSize: 21,
            wrap: 'char',
            lineHeight: 1.5
        }, {
            text: `${side}-flat`,
            color: `${side}-flat-text-color`
        }, side, 'flat');
    }
    return {
        layer,
        updateValues(values) {
            currentValues = { ...defaults, ...values };
            values = currentValues;
            refreshCanvasBackground();
            for (const [id, item] of imageNodes) {
                updateBackground(id, item);
                
                if (item.citationText) {
                    const textVal = values[`${id}-citation`];
                    const hasImg = !!item.image.image() && (id !== 'common-bg-image' || values['common-bg-mode'] === 'image');
                    if (hasImg && textVal && textVal.trim() !== '') {
                        item.citationText.text('ⓒ ' + textVal);
                        item.citationText.visible(true);
                    } else {
                        item.citationText.visible(false);
                    }
                }
            }
            for (const [node, b] of textBindings) {
                node.text(values[b.text] + (b.suffix || ''));
                if (b.color) node.fill(values[b.color]);
                if (b.font) node.fontFamily(values[b.font]);
            }
            for (const [node, key] of colorBindings) node.fill(values[key]);
            for (const {side, nameText, catchphraseText} of nameSizeBindings) {
                const small = values[`${side}-small-check`] === true;
                nameText.setAttrs({y: small ? 100 : 80, fontSize: small ? 24 : 32});
                catchphraseText.setAttrs({y: small ? 136 : 122, fontSize: small ? 28 : 48});
            }
            layer.batchDraw();
        },
        updateImage(id, img) {
            const item = imageNodes.get(id);
            if (!item) return;
            item.image.image(img || null);
            item.plus.visible(!img);
            updateBackground(id, item);

            if (img) {
                const r = Math.max(item.p.width / img.naturalWidth, item.p.height / img.naturalHeight);
                const w = item.p.width / r,
                    h = item.p.height / r;
                item.image.crop({
                    x: (img.naturalWidth - w) / 2,
                    y: (img.naturalHeight - h) / 2,
                    width: w,
                    height: h
                });
                if (id.includes('-LD-')) {
                    item.image.image(fadeLDImage(img, item.p, id.startsWith('left-')));
                    item.image.crop({ x: 0, y: 0, width: item.p.width, height: item.p.height });
                }
            }
            if (id === 'common-bg-image') {
                backgroundImage = img || null;
                // 새로운 원본과 크롭으로 흐림 캐시를 다시 만듭니다.
                filteredBackgroundImage = null;
                refreshCanvasBackground();
            }
            
            if (item.citationText) {
                const textVal = currentValues[`${id}-citation`];
                item.citationText.visible(!!img && !!textVal && textVal.trim() !== '' && (id !== 'common-bg-image' || currentValues['common-bg-mode'] === 'image'));
            }
            layer.batchDraw();
        }
    };
}


export const fontLabels = {
    'Pretendard': '[한영일] 프리텐다드',
    'Apple SD Gothic Neo': '[한영일중] 애플 SD 고딕',
    'Black Han Sans': '[한영] Black Han Sans',
    'Song Myung': '[한영] 송명체',
    'Cafe24 PRO UP': '[한영] 카페24 PRO UP',
    'Grandiflora One': '[한영] 능소화',
    'Tektur': '[영] Tektur',
    'Lilita One': '[영] Lilita One',
    'GOFIRE': '[영] GOFIRE',
    'Top Speed': '[영] Top Speed',
    'Orandakan Kana': '[영] Orandakan Kana',
    'Iansui': '[영일] Iansui',
    'Dela Gothic One': '[영일중] Dela Gothic One',
    'Kaisei Decol': '[영일중] Kaisei Decol'
};

export const tabs = [{
        id: 'common',
        label: '공통',
        heading: '공통'
    },
    {
        id: 'left',
        label: '왼쪽 캐릭터',
        heading: '왼쪽'
    },
    {
        id: 'right',
        label: '오른쪽 캐릭터',
        heading: '오른쪽'
    },
    {
        id: 'stickers',
        label: '스티커',
        type: 'stickers'
    },
];
export function imageField(side, group) {
    const id = imageId(side, group);
    if (!positions[id]) return null;
    return {
        id,
        ...positions[id],
        ...(side === 'common' && group === 'bg' ? {
            visibleWhen: { id: 'common-bg-mode', value: 'image' },
            placement: 'afterFields'
        } : {}),
        round: group === 'profile',
        className: group === 'LD' ? 'image-upload-ld' : ''
    };
}
export function fontSample(side, group) {
    return group === 'name' ? {
        textId: `${side}-etc-name`,
        fontId: `${side}-sub-font`
    } : null;
}
export default {
    templateId,
    author,
    size,
    fonts,
    fontLabels,
    tabs,
    groups,
    fields,
    positions,
    imageField,
    fontSample,
    initialState,
    restoreState,
    migrateState,
    createScene: createPairScene
};
