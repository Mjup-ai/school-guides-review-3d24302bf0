/* Local candidate only: retain every operation; reduce visible workload. */
function focusCurrent(){
 const target=document.querySelector('#work-unit')||document.querySelector('.step')||document.querySelector('#view');
 if(!target)return;
 const tabs=document.querySelector('#tabs');
 const offset=(tabs?tabs.getBoundingClientRect().height:0)+12;
 scrollTo(0,Math.max(0,target.getBoundingClientRect().top+scrollY-offset));
}
(function(){
 const isWeb=typeof DOCS!=='undefined';
 const safe=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 function state(){
  const route=location.hash.replace(/^#\/?/,'')||(isWeb?DOCS[0].code:(STAFF_MODE?'acct':'each'));
  if(isWeb){const d=DOCS.find(d=>d.code===route)||DOCS[0];return {route:d.code,all:steps(d)};}
  const p=PHASES.find(p=>p.key===route);return p?{route:p.key,all:p.steps}:null;
 }
 function unit(s){
  if(s.intro)return '作るものを見て、始める';
  const t=s.sourceTitle||s.t;
  const bits=t.split('｜');
  const id=bits[1]&&bits[1].match(/^(ID\d+[^：]*)/);
  return id?bits[0]+'｜'+id[1].trim():bits[0];
 }
 const originalView=view;
 view=function(){
  originalView();
  const st=state();if(!st){
   if(!isWeb&&!STAFF_MODE&&store.finished&&store.finished.each){
    document.querySelector('#view').insertAdjacentHTML('afterbegin','<section class="card" id="completion-check"><h2>最後の完成確認</h2><p>手順の確認を記録しました。実際の提出完了は別に確かめます。</p><ol><li>文字と公式帯を確認したPNGを保存した</li><li>自分が公開した今回の投稿が開ける</li><li>5項目と直接URLを手元に保存した（提出成功の確認ではありません）</li></ol><p>練習で公開していない場合は納品完了ではありません。未完の項目とカード番号をメモし、必要ならDiscordの自分の事業所で前に質問を書いたチャンネルまたはスレッドへ相談します。</p></section>');
   }
   return;
  }
  const {all,route}=st;const cur=Math.max(0,Math.min(all.length-1,+(store['cur.'+route]||0)));
  const units=[];all.forEach((s,i)=>{const title=unit(s);const last=units[units.length-1];if(last&&last.title===title)last.end=i;else units.push({title,start:i,end:i});});
  const g=units.find(g=>g.start<=cur&&g.end>=cur);const gi=units.indexOf(g);
  const bar=document.querySelector('#barlab');
  if(bar){
   const detail=document.createElement('details');detail.className='more progress-detail';
   detail.innerHTML='<summary>全体の確認記録を見る（提出完了の記録ではありません）</summary>';
   bar.textContent=all.filter((_,i)=>store[route+'.'+i]).length+' / '+all.length+' 操作を確認';
   const progress=bar.previousElementSibling;if(progress)detail.appendChild(progress);
   bar.before(detail);detail.appendChild(bar);
  }
  const count=document.querySelector('#view > .small');if(count)count.remove();
  const step=document.querySelector('.step');
  if(isWeb&&step&&route==='easy1'&&g&&/写真|ID14|ID19/.test(g.title)){
   step.insertAdjacentHTML('beforeend','<p class="small" data-photo-spec>B03の写真：ID19「写真の説明」は「今月は入れません」。写真の下に説明文を追加しません。ALTには「机の上のヘッドホンとパソコン」を入力します。ALTは、写真が見えない時に内容を伝える文です。写真の下には表示されません。</p>');
  }
  if(isWeb&&step&&g){
   const aid=/ID1(?:[^0-9]|$)/.test(g.title)?'<summary>記事を開けないとき</summary><p>CMSの一覧では、記事名を押すと文字の編集になる場合があります。記事の行にある「編集」を押すと、本文を入力する画面が開きます。別の記事を選んでいないか、開いたタイトルを確かめます。</p>':/ライブプレビュー|保存されたか確認/.test(g.title)?'<summary>保存とプレビューを確かめるとき</summary><p>入力後は、もう一度同じ記事を開き、文・写真・ALTが残っていることを確かめます。「ライブプレビュー」は、公開前の記事の見た目を表示するボタンです。押すと画面上に別のページ名が増え、そのページが開きます。「公開」は押しません。プレビューはURLを知っている人が見られるので、個人情報を入れず、指定された提出先以外へ送りません。</p>':'';
   if(aid)step.insertAdjacentHTML('beforeend','<details class="more" data-real-studio-help>'+aid+'</details>');
  }
  if(step&&!showAll){
   const panel=document.createElement('section');panel.id='work-unit';panel.className='work-unit';
   panel.innerHTML='<p class="small">今のまとまり '+(gi+1)+' / '+units.length+'</p><h2>'+safe(g.title.replace(/^\d+\.\s*/,''))+'</h2><p>このまとまりの '+(cur-g.start+1)+' / '+(g.end-g.start+1)+' 操作目。</p><details class="more"><summary>まとまりと再開位置を見る</summary><ol>'+units.map((x,i)=>'<li'+(x===g?' aria-current="step"':'')+'>'+safe(x.title.replace(/^\d+\.\s*/,''))+(x===g?' ← 今ここ':'')+'</li>').join('')+'</ol><p>再開位置：'+safe(route)+'／カード '+(cur+1)+'。同じPC・同じブラウザなら、開き直しても今のカードから続けられます。休むときは下の「休む」を押します。</p></details>';
   step.before(panel);
   const number=step.querySelector('.num');if(number&&!step.classList.contains('done'))number.textContent=cur-g.start+1;
   const title=step.querySelector('h3');title.insertAdjacentHTML('beforebegin','<span class="now-label">今やる1つ</span>');
   const label=step.querySelector('label.ok');if(label)label.lastChild.textContent='この操作を確認';
   const nx=document.querySelector('#next');if(nx&&cur===all.length-1)nx.textContent='手順の確認を終える（提出は別に確認）';
   if(cur===g.end){step.insertAdjacentHTML('beforeend','<p class="unit-end">ここでひと区切りです。'+(gi<units.length-1?'次は「'+safe(units[gi+1].title.replace(/^\d+\.\s*/,''))+'」。':'最後に、保存した成果物を開き、元の課題・案件の提出先を確認します。実案件はフォーム未照合のため送信せず止まります。送信後の表示も未確認です。')+' このページのチェックだけでは、保存・公開・提出は完了しません。</p>');}
  }
  if(isWeb&&store.finished&&store.finished[route]){
   const message=document.createElement('section');message.className='card';message.id='completion-check';
   message.innerHTML='<h2>最後の完成確認</h2><p>手順の確認記録を付けました。実際に提出できたかは別に確かめます。Schoolアプリで送信したことと、運営の検収完了は別です。</p><ol><li>記事の入力が残っている</li><li>プレビューURLとPC・スマホ画像2枚を保存した</li><li>URL・画像2枚・案件記号を手元に保存した（提出成功の確認ではありません）</li></ol><p>未完のものはカード番号と一緒にメモし、Discordの自分の事業所で前に質問を書いたチャンネルまたはスレッドへ伝えられます。準備タブでは作業用コピーが開けたら初級へ進みます。ログインや、誰が使えるかの設定を変える時は、アカウントを管理する人に相談します。</p>';
   document.querySelector('#view').appendChild(message);
  }
 };
 document.addEventListener('click',e=>{
  if(e.target.closest('a[href="#/each"]'))setTimeout(focusCurrent,0);
 });
 view();
})();
