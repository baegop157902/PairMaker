import { notify, validateState } from './state.js';
import { makeArchive, readArchive, archiveName } from './ShareArchive.js';

function openDB() {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('pair-editor-saves',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('slots',{keyPath:'key'});
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('이 브라우저에서 저장소를 열 수 없어요. 편집 파일로 내보내 주세요.'));
  });
}
async function slotAction(method,key,value){
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('slots',['get','getAll'].includes(method)?'readonly':'readwrite'),store=tx.objectStore('slots');let result;
    const request=method==='put'?store.put(value):method==='getAll'?store.getAll():store[method](key);
    request.onsuccess=()=>result=request.result;
    tx.oncomplete=()=>{db.close();resolve(result);};
    tx.onerror=tx.onabort=()=>{db.close();reject(new Error('저장 공간이 부족하거나 저장에 실패했어요. 편집 파일을 내보내 주세요.'));};
  });
}
function download(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function modal(title){
  const dialog=document.createElement('dialog');dialog.className='save-dialog';
  const heading=document.createElement('h2');heading.textContent=title;
  const close=document.createElement('button');close.type='button';close.innerHTML='<i class="bi bi-x" aria-hidden="true"></i>';close.setAttribute('aria-label','닫기');close.className='dialog-close floating-close';close.onclick=()=>dialog.close();
  dialog.append(heading,close);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();return dialog;
}
function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await fn();}catch(error){notify(error.message);}finally{b.disabled=false;}};return b;}


// PDF 도구는 다운로드할 때만 불러오며 서버로 편집 데이터를 전송하지 않습니다.
let pdfTools;
function loadPdfTools() {
  return pdfTools ??= Promise.all([
    ['PDFLib', 'pdf-lib.min.js'], ['fontkit', 'fontkit.umd.min.js']
  ].map(([global, file]) => window[global] ? Promise.resolve() : new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('../vendor/pdf/' + file, import.meta.url);
    script.onload = resolve;
    script.onerror = () => { script.remove(); reject(new Error('PDF 도구를 불러오지 못했어요. 다시 시도해 주세요.')); };
    document.head.append(script);
  }))).catch(error => { pdfTools = null; throw error; });
}
// 배경 이미지 → 실제 PDF 텍스트 → 스티커 순으로 같은 캔버스 배치를 재현합니다.
async function pagePdf(pageIds, renderPage, size, progress, signal) {
  await loadPdfTools(); signal.throwIfAborted();
  const lib = window.PDFLib, doc = await lib.PDFDocument.create();
  const fonts = new Map();
  async function getFont(serif, weight) {
    const family = serif ? 'serif' : 'gothic', key = family + weight;
    if (fonts.has(key)) return fonts.get(key);
    const response = await fetch(new URL(`../vendor/pdf/${family}-${weight}.ttf.zlib`, import.meta.url), { signal });
    if (!response.ok) throw new Error('PDF 글꼴을 불러오지 못했어요.');
    doc.registerFontkit(window.fontkit);
    const font = await doc.embedFont(window.fflate.unzlibSync(new Uint8Array(await response.arrayBuffer())), { subset: false });
    fonts.set(key, font); return font;
  }
  const coverage = new Map();
  async function textWithFallback(items) {
    const result = [];
    for (const item of items) {
      const font = await getFont(item.serif, item.weight);
      if (!coverage.has(font)) coverage.set(font, new Set(font.getCharacterSet()));
      let current = null, advance = 0;
      for (const [index, char] of [...item.text].entries()) {
        const fallback = !coverage.get(font).has(char.codePointAt(0));
        const serif = fallback ? !item.serif : item.serif;
        const weight = !serif ? (item.weight >= 600 ? 700 : 400) : item.weight;
        if (!current || current.serif !== serif || current.weight !== weight) {
          current = { ...item, text: '', advances: [], x: item.x + advance, serif, weight };
          result.push(current);
        }
        current.text += char; current.advances.push(item.advances[index]);
        advance += item.advances[index];
      }
    }
    return result;
  }
  async function paintImage(page, canvas) {
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value)
      : reject(new Error('PDF 이미지 생성에 실패했어요.')), 'image/png'));
    const image = await doc.embedPng(await blob.arrayBuffer());
    page.drawImage(image, { x: 0, y: 0, width: size.width * .75, height: size.height * .75 });
  }
  for (let i = 0; i < pageIds.length; i++) {
    signal.throwIfAborted(); progress(i + 1, pageIds.length);
    await new Promise(resolve => setTimeout(resolve, 0));
    const { canvas, text, overlay } = renderPage(pageIds[i]);
    try {
      const page = doc.addPage([size.width * .75, size.height * .75]);
      await paintImage(page, canvas);
      for (const item of await textWithFallback(text)) {
        if (!item.text) continue;
        const font = await getFont(item.serif, item.weight), fontKey = page.node.newFontDictionary(font.name, font.ref);
        const fontSize = item.size * .75, parts = lib.PDFArray.withContext(doc.context);
        [...item.text].forEach((char, index) => {
          parts.push(font.encodeText(char));
          const natural = font.widthOfTextAtSize(char, fontSize);
          parts.push(lib.PDFNumber.of((natural - item.advances[index] * .75 / item.scaleX) * 1000 / fontSize));
        });
        const color = /^#[0-9a-f]{6}$/i.test(item.color) ? item.color : '#323232';
        const rgb = [1, 3, 5].map(start => parseInt(color.slice(start, start + 2), 16) / 255);
        page.pushOperators(lib.pushGraphicsState(), lib.setFillingRgbColor(...rgb),
          lib.beginText(), lib.setFontAndSize(fontKey, fontSize),
          lib.setTextMatrix(item.scaleX, 0, 0, 1, item.x * .75,
            page.getHeight() - (item.y + item.size * .85) * .75),
          lib.PDFOperator.of('TJ', [parts]), lib.endText(), lib.popGraphicsState());
      }
      if (overlay) await paintImage(page, overlay);
    } finally { canvas.width = canvas.height = 1; if (overlay) overlay.width = overlay.height = 1; }
  }
  signal.throwIfAborted();
  return new Blob([await doc.save()], { type: 'application/pdf' });
}

export function attachSaving(store,stage,stickers,waitForDraw,scene) {
  const {size,initialState}=store.definition;
  const draftKey=store.state.templateId+':autosave';
  let queue=Promise.resolve();
  function cacheCurrent(){
    const revision=store.revision,snapshot=structuredClone(store.state);
    queue=queue.catch(()=>{}).then(()=>slotAction('put',draftKey,{key:draftKey,state:snapshot,savedAt:Date.now()})).then(()=>{if(store.revision===revision)store.markSaved();});
    queue.catch(()=>notify('자동저장에 실패했어요. 저장공간을 확인하거나 편집 파일을 내보내 주세요.'));
    return queue;
  }
  const ready=(async()=>{
    const revision=store.revision;
    try{
      const draft=await slotAction('get',draftKey);
      if(draft?.state){const next=await validateState(draft.state,store.definition);if(store.revision===revision){store.replace(next);await waitForDraw();notify('최근 편집을 불러왔어요.');}}
    }catch{notify('자동저장 내용을 복원하지 못했어요. 저장슬롯이나 편집 파일을 이용해 주세요.');}
    store.subscribe(()=>cacheCurrent());
    if(store.revision!==revision&&store.dirty)cacheCurrent();
  })();
  async function outputCanvas(pixelRatio=1){
    await waitForDraw();await document.fonts.ready;
    const previous={width:stage.width(),height:stage.height(),scale:stage.scale()};
    const transformerVisible=stickers.transformer.visible();
    try{
      const originalSize={...(store.definition.getSize?.(store.state)??size)};
      stickers.transformer.hide();stage.scale({x:1,y:1});stage.size(originalSize);stage.draw();
      return stage.toCanvas({pixelRatio});
    }finally{
      stage.size({width:previous.width,height:previous.height});stage.scale(previous.scale);
      stickers.transformer.visible(transformerVisible);stage.draw();stickers.positionDelete();
    }
  }
  async function apply(raw){
    const next=await validateState(raw,store.definition);
    if(store.dirty&&!confirm('현재 편집 내용을 불러온 내용으로 바꿀까요? 저장하지 않은 변경은 사라집니다.'))return false;
    store.replace(next);await waitForDraw();notify('편집 내용을 불러왔어요.');return true;
  }
  async function slots(){
    const dialog=modal('저장슬롯');
    const create=button('새 슬롯 만들기',async()=>{
      const revision=store.revision,snapshot=structuredClone(store.state);
      const key=store.state.templateId+':slot:'+crypto.randomUUID();
      const preview=(await outputCanvas(0.2)).toDataURL('image/png');
      await slotAction('put',key,{key,name:window.editorTemplate?.title||'새 슬롯',state:snapshot,preview,savedAt:Date.now()});
      if(store.revision===revision)store.markSaved();await refresh();notify('새 슬롯에 저장했어요.');
    });
    const note=document.createElement('p');note.textContent='이 기기에 저장됩니다. 인터넷 캐시기록을 삭제하면 데이터가 날아가요!';dialog.append(note);
    create.className='new-save-slot';create.innerHTML='<i class="bi bi-plus" aria-hidden="true"></i> 새 슬롯 만들기';dialog.append(create);
    const listing=document.createElement('div');listing.className='save-slots';dialog.append(listing);
    async function refresh(){
      listing.replaceChildren();
      const records=(await slotAction('getAll')).filter(r=>r.key!==draftKey&&r.state?.templateId===store.state.templateId).sort((a,b)=>b.savedAt-a.savedAt);
      for(let record of records){
        const key=record.key;
        if(!dialog.isConnected)return;
        const row=document.createElement('article');row.className='save-slot';
        const nameRow=document.createElement('div');nameRow.className='slot-name-row';
        const label=document.createElement('input');label.className='slot-name';label.value=record.name||'저장슬롯';label.maxLength=40;label.setAttribute('aria-label','슬롯 이름');
        const edit=document.createElement('button');edit.type='button';edit.className='slot-name-edit';edit.innerHTML='<i class="bi bi-pencil-square"></i>';edit.setAttribute('aria-label','슬롯 이름 수정');edit.onclick=()=>{label.focus();label.select();};nameRow.append(label,edit);row.append(nameRow);
        let nameWrite=Promise.resolve();
        label.addEventListener('change',()=>{const name=label.value.trim()||'저장슬롯';label.value=name;nameWrite=nameWrite.catch(()=>{}).then(async()=>{const latest=await slotAction('get',key);if(!latest)return;record={...latest,key,name};await slotAction('put',key,record);}).catch(()=>notify('슬롯 이름 저장에 실패했어요.'));});
        label.addEventListener('keydown',e=>{if(e.key==='Enter')label.blur();});
        const footer=document.createElement('div');footer.className='slot-footer';
        const time=document.createElement('time');time.textContent=new Date(record.savedAt).toLocaleString();time.dateTime=new Date(record.savedAt).toISOString();
        const image=document.createElement('img');image.src=record.preview;image.alt='저장된 편집 미리보기';row.append(image);
        const actions=document.createElement('div');actions.className='dialog-actions';
        actions.append(button('덮어쓰기',async()=>{
          await nameWrite;
          if(!confirm('이 슬롯의 기존 저장 내용을 덮어쓸까요?'))return;
          const revision=store.revision;
          const snapshot=structuredClone(store.state),preview=(await outputCanvas(0.2)).toDataURL('image/png');
          await slotAction('put',key,{key,name:label.value.trim()||'저장슬롯',state:snapshot,preview,savedAt:Date.now()});
          if(store.revision===revision)store.markSaved();notify('슬롯에 저장했어요.');await refresh();
        }));
        {
          actions.append(button('불러오기',async()=>{if(await apply(record.state))dialog.close();}));
          actions.append(button('삭제',async()=>{await nameWrite;if(confirm('이 슬롯을 삭제할까요? 삭제한 저장은 복구할 수 없습니다.')){await slotAction('delete',key);await refresh();}}));
        }
        actions.querySelectorAll('button').forEach(b=>b.classList.add(b.textContent==='삭제'?'slot-action-delete':'slot-action-primary'));
        footer.append(time,actions);row.append(footer);listing.append(row);
      }
    }
    await refresh();
  }
  function transfer(){
    const dialog=modal('편집 파일');const note=document.createElement('p');note.textContent='파일로 내보냅니다. 다른 사람에게 전송하여 파일을 함께 편집하거나, 백업 할 수 있어요.';dialog.append(note);
    const exportButton=button('페어틀 내보내기(zip)',async()=>{
      download(makeArchive(store.state),archiveName());notify('이미지와 편집 내용을 ZIP으로 내보냈어요.');
    });exportButton.className='export-file-button';dialog.append(exportButton);
    const zone=document.createElement('div');zone.className='import-file zip-dropzone';
    const input=document.createElement('input');input.type='file';input.accept='.zip,application/zip';input.hidden=true;
    const choose=document.createElement('button');choose.type='button';choose.textContent='페어틀 불러오기';choose.className='zip-import-button';choose.onclick=()=>input.click();
    const hint=document.createElement('p');hint.textContent='.zip 파일을 불러와주세요.';
    const status=document.createElement('p');status.className='zip-import-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    zone.append(choose,hint,input,status);dialog.append(zone);
    let busy=false,dragDepth=0;
    function clearDrag(){dragDepth=0;zone.classList.remove('is-dragover');}
    async function importFile(file){
      if(!file||busy)return;
      busy=true;input.disabled=true;choose.disabled=true;zone.classList.add('is-loading');zone.setAttribute('aria-busy','true');status.textContent='편집 ZIP을 불러오는 중이에요…';
      try{const raw=await readArchive(file);if(await apply(raw))dialog.close();else status.textContent='불러오기를 취소했어요.';}
      catch(error){status.textContent=error instanceof SyntaxError?'올바른 편집 ZIP 파일이 아니에요.':error.message;}
      finally{busy=false;input.disabled=false;choose.disabled=false;zone.classList.remove('is-loading');zone.setAttribute('aria-busy','false');}
    }
    input.onchange=()=>{const file=input.files[0];input.value='';importFile(file);};
    zone.addEventListener('dragenter',e=>{if(![...(e.dataTransfer?.types||[])].includes('Files'))return;e.preventDefault();dragDepth++;zone.classList.add('is-dragover');});
    zone.addEventListener('dragover',e=>{e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect=busy?'none':'copy';zone.classList.add('is-dragover');});
    zone.addEventListener('dragleave',e=>{e.preventDefault();if(--dragDepth<=0)clearDrag();});
    zone.addEventListener('drop',e=>{e.preventDefault();clearDrag();const files=e.dataTransfer?.files;if(files?.length!==1){status.textContent='ZIP 파일을 하나씩 넣어주세요.';return;}importFile(files[0]);});
    dialog.addEventListener('dragover',e=>e.preventDefault());
    dialog.addEventListener('drop',e=>{e.preventDefault();if(!zone.contains(e.target)){clearDrag();status.textContent='점선 영역 안에 ZIP 파일을 놓아주세요.';}});
  }
  async function png(){
    const canvas=await outputCanvas();const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 생성에 실패했어요.')),'image/png'));
    const dialog=modal('이미지 다운로드'),image=document.createElement('img');image.className='download-preview';image.alt='완성 이미지';
    const url=URL.createObjectURL(blob);image.src=url;dialog.append(image);
    const note=document.createElement('p');note.className='download-note';note.textContent=`${canvas.width} × ${canvas.height} px · 모바일에서는 이미지를 길게 눌러 저장할 수도 있어요.`;
    const downloadButton=button('PNG 다운로드',()=>download(blob,store.state.templateId+'.png'));downloadButton.className='png-download';dialog.append(note,downloadButton);
    if (store.definition.pdfExport && scene?.renderPdfPage) {
      const status = document.createElement('p');
      status.className = 'download-note'; status.setAttribute('role', 'status');
      status.textContent = 'PDF는 전체 페이지를 저장하며, 텍스트를 선택·복사할 수 있어요.';
      const controller = new AbortController();
      dialog.addEventListener('close', () => controller.abort(), { once: true });
      const pdfButton = button('PDF 다운로드', async () => {
        try {
          scene.paginate?.();
          await waitForDraw(); await document.fonts.ready;
          controller.signal.throwIfAborted();
          const snapshot = structuredClone(store.state);
          const pdf = await pagePdf(snapshot.pages,
            id => scene.renderPdfPage(snapshot, id, stickers.layer), size,
            (page, total) => { status.textContent = `PDF 만드는 중… ${page} / ${total}p`; }, controller.signal);
          download(pdf, snapshot.templateId + '.pdf');
          status.textContent = `${snapshot.pages.length}페이지 PDF를 저장했어요.`;
        } catch (error) {
          if (controller.signal.aborted) return;
          status.textContent = 'PDF 저장에 실패했어요. 다시 시도해 주세요.';
          throw error;
        }
      });
      pdfButton.className = 'png-download pdf-download';
      const actions = document.createElement('div');
      actions.className = 'textlog-download-actions';
      actions.append(downloadButton, pdfButton);
      dialog.append(actions, status);
    }
    dialog.addEventListener('close',()=>URL.revokeObjectURL(url),{once:true});
  }
  async function reset(){
    if(!confirm('현재 편집한 페어틀을 초기화하고 초기화면으로 불러올까요?'))return;
    await ready;
    store.replace(initialState(store.state.templateId));
    await waitForDraw();await queue;
    notify('기본 양식으로 초기화했어요.');
  }
  for(const [action,fn] of [['reset',reset],['slots',slots],['export',transfer],['download',png]]){
    const b=document.querySelector(`[data-action="${action}"]`);b.disabled=false;
    b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(error){notify(error.message);}finally{b.disabled=false;}});
  }
  window.addEventListener('beforeunload',e=>{if(store.dirty){e.preventDefault();e.returnValue='';}});
  return {outputCanvas,apply,slots,transfer,png,reset,ready,flushCache:()=>queue};
}
