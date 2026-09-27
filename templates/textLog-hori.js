// 이 템플릿의 배치·렌더링·페이지 처리를 이 파일에서 관리합니다.
export const templateId = "textLog-hori";
export const author =
  "@baegop157902 | 넘친 글은 자동으로 다음페이지로 옮겨져요.";
// 좌표: [x, y, width, height]. hori/vert는 첨부 시안 기준입니다.
const layout = {
  gap: 60,
  fadeAxis: "x",
  lanes: [
    {
      title: [213, 114, 513, 43],
      sub: [213, 157, 513, 28],
      body: [213, 300, 513, 681],
    },
  ],
  gothic: [
    {
      title: [213, 191, 513, 43],
      sub: [213, 234, 513, 28],
      body: [213, 344, 513, 637],
    },
  ],
  decor: [[0, 0, 190, 1080]],
};
import {
  documentText,
  plainDocument,
  validateDocument,
} from "../js/RichText.js";
import { notify } from "../js/state.js";
const PAPER = { width: 780, height: 1080 };
const DEFAULT_BODY = `오늘의 작은 편리함이 내일의 습관이 된다. 반복되는 일은 손이 아니라 도구에 맡기는 편이 낫다. 필요한 순간에 바로 꺼내 쓸 수 있어야 진짜 도구다. 작은 도구 하나가 하루의 흐름을 바꾸기도 한다. 복잡한 과정을 줄이면 남는 시간은 더 중요한 일에 쓰인다.

──  가장 좋은 도구는 존재를 잊게 만들 만큼 자연스럽다.

완성도는 작은 배려가 쌓여 만들어진다. 빠르게 끝내고 다음으로 넘어가는 것, 그것이 핵심이다. 작은 도구 하나가 하루의 흐름을 바꾸기도 한다. 필요한 순간에 바로 꺼내 쓸 수 있어야 진짜 도구다.

군더더기를 덜어내면 필요한 것만 남는다. 불필요한 단계를 하나 지울 때마다 경험은 가벼워진다. 매일 쓰는 것일수록 더 다듬을 가치가 있다. 작은 도구 하나가 하루의 흐름을 바꾸기도 한다. 필요한 순간에 바로 꺼내 쓸 수 있어야 진짜 도구다.

반복되는 일은 손이 아니라 도구에 맡기는 편이 낫다.`;
function makeDoc(text) {
  return plainDocument(text, "#323232");
}
function sliceDoc(doc, start, end = Infinity) {
  const result = { lines: [{ runs: [] }] };
  let offset = 0;
  doc.lines.forEach((line, index) => {
    if (index) {
      if (offset >= start && offset < end) result.lines.push({ runs: [] });
      offset++;
    }
    for (const run of line.runs) {
      const a = Math.max(0, start - offset),
        b = Math.min(run.text.length, end - offset);
      if (b > a)
        result.lines.at(-1).runs.push({ ...run, text: run.text.slice(a, b) });
      offset += run.text.length;
    }
  });
  return result;
}
function joinDocs(a, b) {
  const doc = structuredClone(a);
  doc.lines.at(-1).runs.push(...structuredClone(b.lines[0].runs));
  doc.lines.push(...structuredClone(b.lines.slice(1)));
  return doc;
}
let context;
const widths = new Map();
function clearMeasureCache() {
  widths.clear();
}
function fontStyle(state, kind) {
  const serif = state.values.option === "serif";
  return {
    family: serif ? "NotoSerifCJKKR" : "Apple SD Gothic Neo",
    letterSpacing: serif ? -2.5 : -0.5,
    spaceScale: serif ? 2 : 1,
    weight:
      kind === "title"
        ? serif
          ? 600
          : 700
        : kind === "body" && serif
          ? 500
          : 400,
    lineHeight: kind === "body" ? (serif ? 1.5 : 1.3) : 1.3,
  };
}
// UTF-16 위치를 유지하여 자동 줄바꿈 이후에도 원문과 부분 서식을 정확히 나눕니다.
function measure(
  doc,
  {
    width,
    fontSize,
    family,
    weight,
    lineHeight,
    letterSpacing,
    spaceScale,
    indent = 0,
    continued = false,
  },
) {
  context ??= document.createElement("canvas").getContext("2d");
  const rows = [];
  let offset = 0;
  function advance(char, bold) {
    const w = bold ? 700 : weight,
      key = `${family}|${fontSize}|${w}|${letterSpacing}|${spaceScale}|${char}`;
    if (!widths.has(key)) {
      context.font = `${w} ${fontSize}px "${family}"`;
      // 표시 폭만 바꾸며 원문의 공백 수와 분할 위치는 그대로 유지합니다.
      widths.set(
        key,
        Math.max(0, context.measureText(char).width + letterSpacing) *
          (char === " " ? spaceScale : 1),
      );
    }
    return widths.get(key);
  }
  for (const [li, line] of doc.lines.entries()) {
    if (li) offset++;
    let row = {
      runs: [],
      width: 0,
      indent: li === 0 && continued ? 0 : indent,
      start: offset,
      end: offset,
    };
    function push() {
      rows.push(row);
      row = { runs: [], width: 0, indent: 0, start: offset, end: offset };
    }
    const chars = line.runs.flatMap((run) =>
      Array.from(run.text, (char) => ({
        ...run,
        text: char,
        advance: advance(char, run.bold),
      })),
    );
    for (let i = 0; i < chars.length; i++) {
      const run = chars[i];
      let reserved = 0;
      // 마침표·닫는 괄호가 다음 줄 첫 글자가 되지 않도록 앞 글자와 함께 보냅니다.
      for (
        let j = i + 1;
        j < chars.length &&
        /^[.,!?…:;)\]〉》」』】、。，！？]$/.test(chars[j].text);
        j++
      )
        reserved += chars[j].advance;
      if (
        row.runs.length &&
        (row.width + run.advance + reserved + row.indent) * 0.95 > width
      )
        push();
      const last = row.runs.at(-1);
      if (last && last.bold === run.bold && last.color === run.color) {
        last.text += run.text;
        last.width += run.advance;
      } else
        row.runs.push({
          text: run.text,
          bold: run.bold,
          color: run.color,
          width: run.advance,
        });
      row.width += run.advance;
      offset += run.text.length;
      row.end = offset;
    }
    push();
  }
  return {
    rows,
    height: rows.length * fontSize * lineHeight,
    line: fontSize * lineHeight,
  };
}
function overflow(doc, config, height) {
  const result = measure(doc, config),
    count = Math.max(1, Math.floor(height / result.line));
  if (result.rows.length <= count) return null;
  const cut = result.rows[count].start;
  if (cut >= documentText(doc).length) return null;
  return {
    before: sliceDoc(doc, 0, cut),
    after: sliceDoc(doc, cut),
    continued: cut > 0 && documentText(doc)[cut - 1] !== "\n",
  };
}
function drawText(
  parent,
  doc,
  box,
  style,
  align = "left",
  vertical = "top",
  indent = 0,
  continued = false,
) {
  const [x, y, width, height] = box,
    layout = measure(doc, { ...style, width, indent, continued });
  const group = new Konva.Group({
    x,
    y,
    clipX: 0,
    clipY: 0,
    clipWidth: width,
    clipHeight: height,
    listening: false,
    name: style.fieldId || "",
  });
  parent.add(group);
  const visibleHeight = Math.min(height, layout.height),
    start =
      vertical === "middle"
        ? (height - visibleHeight) / 2
        : vertical === "bottom"
          ? height - visibleHeight
          : 0;
  // 실제 렌더링된 글자 폭으로 줄을 정렬하여 굵기·색상이 섞여도 오른쪽 끝을 맞춥니다.
  layout.rows
    .slice(0, style.maxLines ?? Math.floor(height / layout.line))
    .forEach((row, index) => {
      const line = new Konva.Group({
        y: start + index * layout.line,
        listening: false,
        name: "textlog-line",
      });
      group.add(line);
      let cursor = 0;
      for (const run of row.runs) {
        const node = new Konva.Text({
          x: cursor,
          y: 0,
          // 캔버스에 그릴 때만 공백을 확장합니다. 입력·저장 데이터는 원문입니다.
          text:
            style.spaceScale === 2 ? run.text.replace(/ /g, "  ") : run.text,
          pdfSourceText: run.text,
          fontFamily: style.family,
          fontStyle: String(run.bold ? 700 : style.weight),
          fontSize: style.fontSize,
          fill: run.color,
          letterSpacing: style.letterSpacing,
          scaleX: 0.95,
          lineHeight: style.lineHeight,
          wrap: "none",
          listening: false,
        });
        line.add(node);
        cursor += node.width() * 0.95;
      }
      // 오른쪽 문단은 첫 줄도 같은 오른쪽 끝에 맞추고, 들여쓰기는 줄 길이에 반영합니다.
      line.x(align === "right" ? width - cursor : row.indent * 0.95);
    });
  return { height: visibleHeight, top: y + start };
}

// 페이지 및 입력 제한
const MAX = 30,
  MAX_TEXT = 50000;
let fontReady;
function loadAssets() {
  if (!document.querySelector("[data-textlog-style]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("../css/textlog.css", import.meta.url);
    link.dataset.textlogStyle = "";
    document.head.append(link);
  }
  return (fontReady ??= Promise.resolve().then(async () => {
    const font = new FontFace(
      "NotoSerifCJKKR",
      `url("${new URL("../vendor/textlog/NotoSerifCJKKR.ttf", import.meta.url)}")`,
      { weight: "100 900" },
    );
    await font.load();
    document.fonts.add(font);
    await document.fonts.load('400 22px "Apple SD Gothic Neo"', "오늘의");
    clearMeasureCache();
  }));
}
const pageSide = (n) => `page-${n}`,
  key = (n, lane, name) => `${pageSide(n)}-lane-${lane}-${name}`;
const pageNumber = (side) =>
  /^page-(\d+)$/.test(side) ? Number(side.slice(5)) : null;
const clone = (object) => structuredClone(object);
const laneCount = layout.lanes.length;
function laneBox(state, lane) {
  return state.values.option === "gothic" && layout.gothic
    ? layout.gothic[lane]
    : layout.lanes[lane];
}
const positions = {
  bgimg: { x: 0, y: 0, ...PAPER },
  ...Object.fromEntries(
    layout.decor.map((box, i) => [
      `subimg-${i}`,
      { x: box[0], y: box[1], width: box[2], height: box[3] },
    ]),
  ),
};
export function defaultValues(side, body = "") {
  const n = pageNumber(side);
  if (n === null) return {};
  return Object.assign(
    {},
    ...layout.lanes.map((_, lane) =>
      Object.fromEntries(
        Object.entries({
          titletext: "로렘 입숨",
          subtitletext: "의미 없는 더미 텍스트를 로렘 입숨이라고 합니다.",
          titlecheck: false,
          contenttext: body,
          contentalign: "middle",
          contentParagraph: 30,
        }).map(([name, value]) => [key(n, lane, name), value]),
      ),
    ),
  );
}
function backgroundDefaults() {
  return {
    option: "serif",
    bgcheck: "solid",
    bgcolor: "#f9f9f9",
    bgblur: false,
    bgopacity: 100,
    "bgimg-citation": "",
    ...Object.fromEntries(
      layout.decor.flatMap((_, i) => [
        [`subcheck-${i}`, "solid"],
        [`subcolor-${i}`, "#666666"],
        [`subblur-${i}`, false],
        [`subopacity-${i}`, 100],
        [`subimg-${i}-citation`, ""],
      ]),
    ),
  };
}
export function initialState() {
  const values = {
      ...backgroundDefaults(),
      ...defaultValues("page-1", DEFAULT_BODY),
    },
    richText = {};
  for (const [id, text] of Object.entries(values))
    if (/(?:titletext|contenttext)$/.test(id)) {
      const doc = makeDoc(text);
      for (const line of doc.lines)
        if (line.runs[0]?.text.startsWith("──"))
          line.runs.forEach((r) => (r.color = "#888888"));
      richText[id] = doc;
    }
  return {
    schemaVersion: 1,
    templateId,
    pages: [1],
    activePage: 1,
    view: "single",
    values,
    richText,
    continuations: {},
    touched: {},
    images: {},
    stickers: [],
  };
}
function offset(state, id) {
  const i = state.pages.indexOf(id);
  return state.view === "all"
    ? { x: (i % 3) * 790, y: Math.floor(i / 3) * 1090 }
    : { x: 0, y: 0 };
}
export function getSize(state) {
  return state.view === "all"
    ? {
        width: Math.min(3, state.pages.length) * 790 - 10,
        height: Math.ceil(state.pages.length / 3) * 1090 - 10,
      }
    : PAPER;
}
function createPage(state, after, source) {
  const n = Array.from({ length: MAX }, (_, i) => i + 1).find(
    (n) => !state.pages.includes(n),
  );
  if (!n) return null;
  state.pages.splice(after + 1, 0, n);
  Object.assign(state.values, defaultValues(pageSide(n)));
  if (source)
    for (let lane = 0; lane < laneCount; lane++)
      for (const field of [
        "titletext",
        "subtitletext",
        "titlecheck",
        "contentalign",
        "contentParagraph",
      ]) {
        const from = key(source, lane, field),
          to = key(n, lane, field);
        state.values[to] = state.values[from];
        state.touched[to] = state.touched[from] === true;
        if (state.richText[from])
          state.richText[to] = clone(state.richText[from]);
      }
  return n;
}
export function addPage(store) {
  if (store.state.pages.length >= MAX) {
    notify("페이지는 최대 30장까지 추가할 수 있어요.");
    return null;
  }
  let n;
  store.change((s) => {
    n = createPage(s, s.pages.length - 1, s.activePage);
    s.activePage = n;
  }, "structure");
  return pageSide(n);
}
function removePage(store, side, open) {
  const n = pageNumber(side);
  if (store.state.pages.length <= 1) return;
  if (!confirm("이 페이지의 글과 스티커를 삭제할까요?")) return;
  store.change((s) => {
    const index = s.pages.indexOf(n);
    s.pages.splice(index, 1);
    s.activePage = s.pages[Math.min(index, s.pages.length - 1)];
    for (const map of [s.values, s.richText, s.touched, s.continuations])
      for (const id of Object.keys(map))
        if (id.startsWith(side + "-")) delete map[id];
    s.stickers = s.stickers.filter((item) => item.pageId !== n);
  }, "structure");
  open?.(pageSide(store.state.activePage), "title-0");
}
const groups = layout.lanes.flatMap((_, i) => [
  [`title-${i}`, laneCount === 1 ? "제목&부제목" : `${i + 1}p 제목&부제목`],
  [`body-${i}`, laneCount === 1 ? "본문" : `${i + 1}p 본문`],
]);
const optionGroups = [
  ["layout", "레이아웃"],
  ...layout.decor.map((_, i) => [
    `decor-${i}`,
    laneCount === 1 ? "꾸밈요소" : `${i + 1}p 꾸밈요소`,
  ]),
];
export function tabs(state) {
  return [
    { id: "options", label: "옵션&배경", groups: optionGroups },
    ...state.pages.map((n, i) => ({
      id: pageSide(n),
      label: `${i + 1}p`,
      heading: `${i + 1}p`,
      groups,
    })),
    {
      id: "add-page",
      label: "+",
      icon: "bi bi-plus",
      type: "action",
      ariaLabel: "페이지 추가",
      disabled: state.pages.length >= MAX,
      onClick: ({ store }) => addPage(store),
    },
    {
      id: "stickers",
      label: "스티커",
      type: "stickers",
      groups: [],
      fixed: true,
    },
  ];
}
const field = (id, label, type = "text", extra = {}) => ({
  id,
  label,
  type,
  ...extra,
});
const options = (...pairs) => pairs.map(([value, label]) => ({ value, label }));
function backgroundFields(group) {
  const bg = group === "layout",
    i = Number(group.split("-")[1]),
    mode = bg ? "bgcheck" : `subcheck-${i}`,
    color = bg ? "bgcolor" : `subcolor-${i}`,
    blur = bg ? "bgblur" : `subblur-${i}`,
    opacity = bg ? "bgopacity" : `subopacity-${i}`;
  return [
    ...(bg
      ? [
          field("option", "글꼴옵션", "radio", {
            options: options(["serif", "명조"], ["gothic", "고딕"]),
          }),
          field("layout-divider", "", "separator"),
        ]
      : []),
    field(mode, bg ? "배경설정" : "꾸밈요소 선택", "radio", {
      options: options(["solid", "단색"], ["image", "이미지"]),
    }),
    field(color, bg ? "배경색" : "꾸밈 색상", "color", {
      visibleWhen: { id: mode, value: "solid" },
    }),
    field(blur, "이미지 블러", "checkbox", {
      visibleWhen: { id: mode, value: "image" },
    }),
    field(opacity, "이미지 불투명도", "number", {
      min: 0,
      max: 100,
      visibleWhen: { id: mode, value: "image" },
    }),
  ];
}
export function fields(side, group) {
  if (side === "options") return backgroundFields(group);
  const n = pageNumber(side);
  if (!n) return [];
  const lane = Number(group.split("-")[1]),
    f = (name, label, type, extra = {}) =>
      field(key(n, lane, name), label, type, extra),
    rich = { defaultColor: "#323232", showLabel: true };
  return group.startsWith("title-")
    ? [
        f("titletext", "제목", "richtext", {
          ...rich,
          editorRows: 1,
          note: "글자를 선택한 뒤 굵게 또는 색상을 적용하세요. (20자 내외 추천)",
          clearDefault: true,
        }),
        f("subtitletext", "부제목", "richtext", {
          ...rich,
          editorRows: laneCount === 2 ? 2 : 1,
          note: "글자를 선택한 뒤 굵게 또는 색상을 적용하세요. (30자 내외 추천)",
          clearDefault: true,
        }),
        f("titlecheck", `본문과 ${layout.gap}px 간격 유지`, "checkbox"),
      ]
    : [
        f("contenttext", "본문", "richtext", {
          ...rich,
          maxLength: MAX_TEXT,
          note: "입력을 마치면 넘친 본문이 다음 장의 같은 쪽으로 이어집니다. (최대 50,000자)",
        }),
        f("contentalign", "정렬", "radio", {
          options: options(
            ["top", "위쪽 정렬"],
            ["middle", "가운데 정렬"],
            ["bottom", "하단 정렬"],
          ),
        }),
        f("contentParagraph", "들여쓰기", "number", { min: 0, max: 50 }),
      ];
}
export function imageField(side, group) {
  if (side !== "options") return null;
  const id =
      group === "layout" ? "bgimg" : `subimg-${Number(group.split("-")[1])}`,
    mode =
      group === "layout"
        ? "bgcheck"
        : `subcheck-${Number(group.split("-")[1])}`;
  return {
    id,
    ...positions[id],
    visibleWhen: { id: mode, value: "image" },
    placement: "afterFields",
  };
}
function bodyConfig(state, n, lane) {
  return {
    ...fontStyle(state, "body"),
    fontSize: 22,
    width: laneBox(state, lane).body[2],
    indent: state.values[key(n, lane, "contentParagraph")],
    continued: state.continuations[key(n, lane, "contenttext")] === true,
  };
}
let paginating = false,
  overflowWarning = false;
function paginate(store) {
  if (paginating || document.querySelector("[data-rich-editor]:focus")) return;
  paginating = true;
  try {
    const next = clone(store.state);
    let changed = false,
      capped = false;
    for (let index = 0; index < next.pages.length; index++)
      for (let lane = 0; lane < laneCount; lane++) {
        const n = next.pages[index],
          id = key(n, lane, "contenttext"),
          doc = next.richText[id] || makeDoc(next.values[id]);
        const split = overflow(
          doc,
          bodyConfig(next, n, lane),
          laneBox(next, lane).body[3],
        );
        if (!split || !documentText(split.after)) continue;
        if (index === next.pages.length - 1) {
          if (next.pages.length >= MAX) {
            capped = true;
            continue;
          }
          createPage(next, index, n);
        }
        const target = key(next.pages[index + 1], lane, "contenttext"),
          old = next.richText[target] || makeDoc(next.values[target]);
        const joined = joinDocs(split.after, old);
        if (documentText(joined).length > MAX_TEXT) {
          capped = true;
          continue;
        }
        next.richText[id] = split.before;
        next.values[id] = documentText(split.before);
        next.richText[target] = joined;
        next.values[target] = documentText(joined);
        next.continuations[target] = split.continued;
        next.touched[target] = true;
        changed = true;
      }
    if (changed) store.change((s) => Object.assign(s, next), "structure");
    if (capped && !overflowWarning)
      notify("페이지 한도에 도달했어요. 넘친 글은 입력폼에 보존되어 있습니다.");
    overflowWarning = capped;
  } finally {
    paginating = false;
  }
}
export function restoreState(raw, next) {
  if (
    !Array.isArray(raw.pages) ||
    !raw.pages.length ||
    raw.pages.length > MAX ||
    raw.pages.some((n) => !Number.isInteger(n) || n < 1 || n > MAX) ||
    new Set(raw.pages).size !== raw.pages.length
  )
    throw new Error("페이지 목록이 올바르지 않아요.");
  next.pages = [...raw.pages];
  next.activePage = next.pages.includes(raw.activePage)
    ? raw.activePage
    : next.pages[0];
  next.view = raw.view === "all" ? "all" : "single";
  next.values = {
    ...backgroundDefaults(),
    ...Object.assign({}, ...next.pages.map((n) => defaultValues(pageSide(n)))),
  };
  next.richText = {};
  next.continuations = {};
  for (const n of next.pages)
    for (let lane = 0; lane < laneCount; lane++) {
      const id = key(n, lane, "contenttext");
      if (raw.continuations?.[id] === true) next.continuations[id] = true;
    }
  return next;
}
export function restoreFormatting(raw, next) {
  for (const n of next.pages)
    for (let lane = 0; lane < laneCount; lane++)
      for (const name of ["titletext", "subtitletext", "contenttext"]) {
        const id = key(n, lane, name);
        next.richText[id] = raw.richText?.[id]
          ? validateDocument(
              raw.richText[id],
              next.values[id],
              name === "contenttext" ? MAX_TEXT : 1000,
            )
          : makeDoc(next.values[id]);
      }
}
export function createScene(stage, openEditor, store) {
  const layer = new Konva.Layer();
  stage.add(layer);
  const images = new Map(),
    bitmapCache = new Map();
  let signature = "",
    timer,
    readyDone = false;
  const controls = document.createElement("nav");
  controls.className = "textlog-controls";
  controls.setAttribute("aria-label", "텍스트 로그 페이지");
  const prev = document.createElement("button"),
    next = document.createElement("button"),
    toggle = document.createElement("button"),
    add = document.createElement("button"),
    counter = document.createElement("span");
  for (const [button, label, icon] of [
    [prev, "이전 페이지", "bi-arrow-left-circle-fill"],
    [next, "다음 페이지", "bi-arrow-right-circle-fill"],
    [add, "페이지 추가", "bi-plus"],
  ]) {
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.title = label;
    const i = document.createElement("i");
    i.className = `bi ${icon}`;
    button.append(i);
  }
  prev.className = "textlog-prev";
  next.className = "textlog-next";
  toggle.type = "button";
  counter.setAttribute("aria-live", "polite");
  controls.append(counter, toggle, add);
  stage.container().append(prev, next);
  for (const button of [prev, next])
    button.addEventListener("click", (event) => event.stopPropagation());
  const area = document.querySelector(".canvas-area"),
    canvas = document.querySelector("#konva-container");
  area.classList.add("textlog-canvas-area");
  area.append(controls);
  // 버튼은 캔버스 자식입니다. 창·사이드바의 위치가 바뀌어도 캔버스와 함께 움직입니다.
  let controlsFrame = 0;
  function placeControls() {
    const a = area.getBoundingClientRect(),
      c = canvas.getBoundingClientRect();
    prev.style.left = Math.max(a.left + 2 - c.left, -42) + "px";
    next.style.left =
      Math.min(a.right - c.left - next.offsetWidth - 2, c.width + 6) + "px";
  }
  function scheduleControls() {
    cancelAnimationFrame(controlsFrame);
    controlsFrame = requestAnimationFrame(placeControls);
  }
  const controlsObserver = new ResizeObserver(scheduleControls);
  for (const node of [controls, area, canvas]) controlsObserver.observe(node);
  canvas.addEventListener("editor:resize", scheduleControls);
  window.addEventListener("resize", scheduleControls);
  window.addEventListener("scroll", scheduleControls, true);
  document
    .querySelector(".editor-main")
    .addEventListener("transitionend", scheduleControls);

  // 7장부터 현재 선택하거나 마우스로 가리킨 페이지를 별도 UI에 확대합니다.
  const compactPreview = matchMedia("(max-width:1024px)");
  const preview = document.createElement("section");
  preview.className = "member-preview textlog-preview";
  preview.hidden = true;
  const previewHeader = document.createElement("div");
  previewHeader.className = "member-preview-header";
  const previewTitle = document.createElement("strong");
  const previewClose = document.createElement("button");
  previewClose.type = "button";
  previewClose.className = "floating-close";
  previewClose.textContent = "×";
  previewClose.setAttribute("aria-label", "페이지 미리보기 닫기");
  previewHeader.append(previewTitle, previewClose);
  const previewHost = document.createElement("div");
  previewHost.className = "textlog-preview-canvas";
  previewHost.setAttribute("role", "img");
  const resize = document.createElement("button");
  resize.type = "button";
  resize.className = "member-preview-resize";
  resize.textContent = "◢";
  resize.setAttribute("aria-label", "미리보기 크기 조절");
  preview.append(previewHeader, previewHost, resize);
  document.body.append(preview);
  const previewStage = new Konva.Stage({
      container: previewHost,
      width: 1,
      height: 1,
    }),
    previewLayer = new Konva.Layer({ listening: false });
  previewStage.add(previewLayer);
  const showPreview = document.createElement("button");
  showPreview.type = "button";
  showPreview.textContent = "미리보기";
  showPreview.hidden = true;
  controls.append(showPreview);
  let previewClosed = false,
    hoveredPage = null,
    previewFrame = 0,
    previewPlaced = false,
    previewDrag = null;
  function positionPreview(left, top) {
    preview.style.left =
      Math.max(0, Math.min(innerWidth - preview.offsetWidth, left)) + "px";
    preview.style.top =
      Math.max(0, Math.min(innerHeight - preview.offsetHeight, top)) + "px";
  }
  previewClose.onclick = () => {
    previewClosed = true;
    preview.hidden = true;
    queuePreview();
  };
  showPreview.onclick = () => {
    previewClosed = false;
    queuePreview();
  };
  preview.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest(".floating-close")) return;
    const r = preview.getBoundingClientRect();
    previewDrag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      resize: e.target === resize,
    };
    preview.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  preview.addEventListener("pointermove", (e) => {
    if (!previewDrag || previewDrag.id !== e.pointerId) return;
    const d = previewDrag;
    if (d.resize) {
      preview.style.width =
        Math.min(innerWidth - 16, Math.max(220, d.width + e.clientX - d.x)) +
        "px";
      preview.style.height =
        Math.min(innerHeight - 16, Math.max(240, d.height + e.clientY - d.y)) +
        "px";
      queuePreview();
    } else positionPreview(d.left + e.clientX - d.x, d.top + e.clientY - d.y);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    preview.addEventListener(event, () => (previewDrag = null));
  async function renderPreview() {
    previewFrame = 0;
    const many = store.state.pages.length >= 7,
      desktop = !compactPreview.matches && store.state.view === "all";
    showPreview.hidden = !(many && desktop && previewClosed);
    preview.hidden = !(many && desktop && !previewClosed);
    if (preview.hidden) return;
    await window.pairEditor?.waitForDraw();
    if (preview.hidden) return;
    const id =
      store.state.view === "all" && store.state.pages.includes(hoveredPage)
        ? hoveredPage
        : store.state.activePage;
    const source = layer.findOne("." + pageSide(id));
    if (!source) return;
    const width = Math.max(1, previewHost.clientWidth),
      height = Math.max(1, previewHost.clientHeight),
      scale = Math.min(width / PAPER.width, height / PAPER.height);
    previewStage.size({ width, height });
    previewLayer.destroyChildren();
    previewLayer.scale({ x: scale, y: scale });
    previewLayer.position({
      x: (width - PAPER.width * scale) / 2,
      y: (height - PAPER.height * scale) / 2,
    });
    previewLayer.add(
      source.clone({ x: 0, y: 0, visible: true, listening: false }),
    );
    for (const item of store.state.stickers.filter(
      (item) => item.pageId === id,
    )) {
      const node = window.pairEditor?.stickers.layer.findOne("#" + item.id);
      if (node)
        previewLayer.add(
          node.clone({ x: item.x, y: item.y, visible: true, listening: false }),
        );
    }
    previewLayer.draw();
    const label = `${store.state.pages.indexOf(id) + 1}p 미리보기`;
    previewTitle.textContent = label;
    previewHost.setAttribute("aria-label", label);
    const r = preview.getBoundingClientRect(),
      a = area.getBoundingClientRect();
    positionPreview(
      previewPlaced ? r.left : a.left + 8,
      previewPlaced ? r.top : a.bottom - r.height - 8,
    );
    previewPlaced = true;
  }
  function queuePreview() {
    if (!previewFrame) previewFrame = requestAnimationFrame(renderPreview);
  }
  new ResizeObserver(queuePreview).observe(previewHost);
  window.addEventListener("resize", queuePreview);
  compactPreview.addEventListener("change", queuePreview);
  store.subscribe(queuePreview);
  // PC 입력창의 마지막 대상·카테고리는 템플릿별로 브라우저에 기억합니다.
  const preferenceKey = templateId + ":desktop-editor-tab";
  let editorPreference = { target: "options", category: "layout" };
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey));
    if (
      saved &&
      ["options", "page"].includes(saved.target) &&
      typeof saved.category === "string"
    )
      editorPreference = saved;
  } catch {}
  function openPageEditor(id, node) {
    if (store.state.activePage !== id)
      store.change((s) => (s.activePage = id), "view");
    previewClosed = false;
    queuePreview();
    if (compactPreview.matches) {
      openEditor(pageSide(id), "title-0", node);
      return;
    }
    const optionsSelected = editorPreference.target === "options",
      choices = optionsSelected ? optionGroups : groups;
    const category = choices.some(([key]) => key === editorPreference.category)
      ? editorPreference.category
      : choices[0][0];
    openEditor(optionsSelected ? "options" : pageSide(id), category, node);
  }
  window.addEventListener("editor:selection", (event) => {
    const { side, category, userInitiated } = event.detail;
    if (
      !userInitiated ||
      compactPreview.matches ||
      !(side === "options" || pageNumber(side))
    )
      return;
    editorPreference = {
      target: side === "options" ? "options" : "page",
      category,
    };
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(editorPreference));
    } catch {}
  });

  function go(id, open = true) {
    if (!store.state.pages.includes(id)) return;
    store.change((s) => {
      s.activePage = id;
      s.view = "single";
    }, "view");
    if (open) openPageEditor(id);
  }
  prev.onclick = () =>
    go(
      store.state.pages[store.state.pages.indexOf(store.state.activePage) - 1],
    );
  next.onclick = () =>
    go(
      store.state.pages[store.state.pages.indexOf(store.state.activePage) + 1],
    );
  toggle.onclick = () =>
    store.change((s) => (s.view = s.view === "all" ? "single" : "all"), "view");
  add.onclick = () => addPage(store);
  window.addEventListener("editor:selection", (e) => {
    const n = pageNumber(e.detail.side);
    if (
      e.detail.userInitiated &&
      n &&
      store.state.pages.includes(n) &&
      (n !== store.state.activePage || store.state.view === "all")
    )
      store.change((s) => {
        s.activePage = n;
        s.view = "single";
      }, "view");
  });
  function bitmap(id, box, mode, color, blur, opacity, reverse = false) {
    const source = mode === "image" ? images.get(id) : null,
      cacheKey = JSON.stringify([id, mode, color, blur, opacity]);
    const old = bitmapCache.get(id);
    if (old?.key === cacheKey && old.source === source) return old.canvas;
    const canvas = document.createElement("canvas");
    canvas.width = box.width;
    canvas.height = box.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = mode === "image" ? "#f9f9f9" : color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (source) {
      ctx.save();
      ctx.globalAlpha = opacity / 100;
      if (blur) ctx.filter = "blur(10px)";
      const ratio = Math.max(
        box.width / source.naturalWidth,
        box.height / source.naturalHeight,
      );
      ctx.drawImage(
        source,
        (box.width - source.naturalWidth * ratio) / 2,
        (box.height - source.naturalHeight * ratio) / 2,
        source.naturalWidth * ratio,
        source.naturalHeight * ratio,
      );
      ctx.restore();
    }
    if (id !== "bgimg") {
      ctx.globalCompositeOperation = "destination-in";
      const alpha =
        layout.fadeAxis === "x"
          ? ctx.createLinearGradient(0, 0, box.width, 0)
          : ctx.createLinearGradient(0, 0, 0, box.height);
      alpha.addColorStop(0, reverse ? "transparent" : "#000");
      alpha.addColorStop(1, reverse ? "#000" : "transparent");
      ctx.fillStyle = alpha;
      ctx.fillRect(0, 0, box.width, box.height);
    }
    bitmapCache.set(id, { key: cacheKey, source, canvas });
    return canvas;
  }
  // 화면과 PDF가 같은 페이지 렌더링을 사용합니다.
  function drawPage(state, n, index) {
    const v = state.values;
    const group = new Konva.Group({
      ...offset(state, n),
      clipX: 0,
      clipY: 0,
      clipWidth: 780,
      clipHeight: 1080,
      name: pageSide(n),
    });
    const bg = new Konva.Image({
      ...PAPER,
      image: bitmap(
        "bgimg",
        PAPER,
        v.bgcheck,
        v.bgcolor,
        v.bgblur,
        v.bgopacity,
      ),
    });
    group.add(bg);
    group.on("click tap", () => {
      if (state.view === "all") {
        go(n);
        return;
      }
      openPageEditor(n, group);
    });
    group.on("mouseenter", () => {
      hoveredPage = n;
      queuePreview();
    });
    group.on("mouseleave", () => {
      hoveredPage = null;
      queuePreview();
    });
    layout.decor.forEach((box, i) =>
      group.add(
        new Konva.Image({
          ...positions[`subimg-${i}`],
          image: bitmap(
            `subimg-${i}`,
            positions[`subimg-${i}`],
            v[`subcheck-${i}`],
            v[`subcolor-${i}`],
            v[`subblur-${i}`],
            v[`subopacity-${i}`],
            box[4],
          ),
          listening: false,
        }),
      ),
    );
    for (let lane = 0; lane < laneCount; lane++) {
      const boxes = laneBox(state, lane),
        bodyId = key(n, lane, "contenttext"),
        doc = state.richText[bodyId] || makeDoc(v[bodyId]),
        config = bodyConfig(state, n, lane),
        result = drawText(
          group,
          doc,
          boxes.body,
          { ...config, fieldId: bodyId },
          boxes.align,
          v[key(n, lane, "contentalign")],
          config.indent,
          config.continued,
        );
      const titleBox = [...boxes.title],
        subBox = [...boxes.sub];
      if (v[key(n, lane, "titlecheck")]) {
        const delta = result.top - layout.gap - (subBox[1] + subBox[3]);
        titleBox[1] += delta;
        subBox[1] += delta;
      }
      for (const [name, box, type, size] of [
        ["titletext", titleBox, "title", 32],
        ["subtitletext", subBox, "sub", 20],
      ]) {
        const id = key(n, lane, name);
        drawText(
          group,
          state.richText[id] || makeDoc(v[id]),
          box,
          {
            ...fontStyle(state, type),
            fontSize: size,
            maxLines: type === "sub" && laneCount === 2 ? 2 : 1,
            fieldId: id,
          },
          boxes.align,
        );
      }
    }
    const style = fontStyle(state, "sub");
    group.add(
      new Konva.Text({
        x: 698,
        y: 1027,
        width: 56,
        text: String(index + 1),
        fontFamily: style.family,
        fontStyle: "400",
        fontSize: 20,
        name: "textlog-page-number",
        fill: "#aaaaaa",
        align: "right",
        listening: false,
      }),
    );
    for (const id of Object.keys(positions)) {
      const credit = v[id + "-citation"];
      if (
        credit &&
        v[id === "bgimg" ? "bgcheck" : `subcheck-${id.split("-")[1]}`] ===
          "image" &&
        images.has(id)
      ) {
        const p = positions[id];
        group.add(
          new Konva.Text({
            name: "textlog-credit-" + id,
            x: p.x + 4,
            y:
              id === "bgimg"
                ? PAPER.height - 24
                : layout.fadeAxis === "x"
                  ? p.y + 8
                  : p.y + p.height - 20,
            width: Math.min(p.width - 8, PAPER.width - p.x - 8),
            text: "ⓒ " + credit,
            fontFamily: "sans-serif",
            fontSize: 12,
            fill: "#666666",
            align: "center",
            listening: false,
          }),
        );
      }
    }
    return group;
  }
  function draw() {
    const state = store.state,
      v = state.values;
    const sig = JSON.stringify([
      state.pages,
      state.activePage,
      state.view,
      v,
      state.richText,
      state.continuations,
    ]);
    if (sig === signature) return;
    signature = sig;
    layer.destroyChildren();
    state.pages.forEach((n, index) => {
      if (state.view !== "all" && n !== state.activePage) return;
      layer.add(drawPage(state, n, index));
    });
    const index = state.pages.indexOf(state.activePage);
    prev.disabled = index <= 0;
    next.disabled = index >= state.pages.length - 1;
    prev.hidden = next.hidden = state.view === "all";
    toggle.textContent = state.view === "all" ? "개별보기" : "전체보기";
    counter.textContent = `${index + 1} / ${state.pages.length}`;
    add.disabled = state.pages.length >= MAX;
    layer.batchDraw();
    requestAnimationFrame(placeControls);
    queuePreview();
  }
  function schedule() {
    clearTimeout(timer);
    if (readyDone) timer = setTimeout(() => paginate(store), 180);
  }
  store.subscribe((_state, kind) => {
    if (kind !== "stickers" && kind !== "view") schedule();
  });
  document.fonts.addEventListener("loadingdone", () => {
    clearMeasureCache();
    signature = "";
    draw();
    schedule();
  });
  const ready = loadAssets().then(() => {
    readyDone = true;
    draw();
    schedule();
  });
  return {
    layer,
    ready,
    updateState() {},
    updateValues: draw,
    updateImage(id, image) {
      if (image) images.set(id, image);
      else images.delete(id);
      bitmapCache.delete(id);
      signature = "";
      draw();
    },
    // 편집 상태를 바꾸지 않고 페이지 한 장과 해당 스티커만 출력합니다.
    renderPdfPage(state, pageId, stickerLayer) {
      const group = drawPage(state, pageId, state.pages.indexOf(pageId));
      group.position({ x: 0, y: 0 });
      group.listening(false);
      try {
        const text = group
          .find("Text")
          .map((node) => {
            const position = node.getAbsolutePosition(),
              scale = node.getAbsoluteScale();
            const raw = node.getAttr("pdfSourceText") ?? node.text();
            const alignOffset =
              node.align() === "right"
                ? node.width() - node.getTextWidth()
                : node.align() === "center"
                  ? (node.width() - node.getTextWidth()) / 2
                  : 0;
            const doubled =
              node.hasOwnProperty("attrs") &&
              node.getAttr("pdfSourceText") !== undefined &&
              state.values.option === "serif";
            const advances = [...raw].map(
              (char) =>
                (node.measureSize(char === " " && doubled ? "  " : char).width +
                  node.letterSpacing() * (char === " " && doubled ? 2 : 1)) *
                scale.x,
            );
            const result = {
              text: raw,
              x: position.x + alignOffset * scale.x,
              y: position.y,
              size: node.fontSize() * scale.y,
              scaleX: scale.x / scale.y,
              color: node.fill(),
              weight: parseInt(node.fontStyle(), 10) || 400,
              serif: node.fontFamily() === "NotoSerifCJKKR",
              advances,
              lane: node
                .getAncestors()
                .some((parent) => parent.name().includes("lane-1"))
                ? 1
                : 0,
            };
            node.hide();
            return result;
          })
          .sort((a, b) => a.lane - b.lane || a.y - b.y || a.x - b.x);
        const canvas = group.toCanvas({ x: 0, y: 0, ...PAPER, pixelRatio: 2 });
        group.destroyChildren();
        for (const item of state.stickers.filter(
          (item) => item.pageId === pageId,
        )) {
          const node = stickerLayer.findOne("#" + item.id);
          if (node)
            group.add(
              node.clone({
                x: item.x,
                y: item.y,
                visible: true,
                listening: false,
              }),
            );
        }
        const overlay = group.children.length
          ? group.toCanvas({ x: 0, y: 0, ...PAPER, pixelRatio: 2 })
          : null;
        return { canvas, text, overlay };
      } finally {
        group.destroy();
      }
    },
    paginate: () => paginate(store),
  };
}
export default {
  templateId,
  size: PAPER,
  pdfExport: true,
  author,
  positions,
  getSize,
  groups,
  tabs,
  fields,
  imageField,
  initialState,
  defaultValues,
  restoreState,
  restoreFormatting,
  createScene,
  formOptions: {
    desktopTabs: (state) => ["options", pageSide(state.activePage)],
    desktopCategories: true,
    scrollTabs: true,
    panelClass: "textlog-editor",
    preservePanelPosition: true,
    panelPositionKey: templateId + ":floating-position",
    selectionLabel: "편집할 페이지",
  },
  formActions: (side, state) =>
    pageNumber(side)
      ? [
          {
            label: "이 페이지 삭제",
            disabled: state.pages.length <= 1,
            onClick: ({ store, open }) => removePage(store, side, open),
          },
        ]
      : [],
  finishTextEdit: paginate,
  addPage,
  selectSticker(item, store) {
    if (item && store.state.activePage !== item.pageId)
      store.change((s) => (s.activePage = item.pageId), "view");
  },
  stickerBounds: (item, state) => ({ ...offset(state, item.pageId), ...PAPER }),
  stickerDefaults: (state) => ({ pageId: state.activePage }),
  stickerSize: () => PAPER,
  stickerPlacement: (item, state) => {
    const pos = offset(state, item.pageId);
    return {
      x: item.x + pos.x,
      y: item.y + pos.y,
      visible: state.view === "all" || item.pageId === state.activePage,
    };
  },
  stickerCoordinates: (node, item, state) => {
    const pos = offset(state, item.pageId);
    return { x: node.x() - pos.x, y: node.y() - pos.y };
  },
  restoreSticker(raw, item, state) {
    if (!state.pages.includes(raw.pageId))
      throw new Error("스티커 페이지가 올바르지 않아요.");
    item.pageId = raw.pageId;
  },
};
