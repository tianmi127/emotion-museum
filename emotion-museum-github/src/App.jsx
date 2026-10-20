import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import home from '../pages/情绪博物馆-首页.svg?raw';
import guide from '../pages/情绪博物馆-功能导览.svg?raw';
import moodSelect from '../pages/情绪博物馆-心情选择.svg?raw';
import moodRecord from '../pages/情绪博物馆-心情记录.svg?raw';
import calendar from '../pages/情绪博物馆-心情日历.svg?raw';
import galleries from '../pages/情绪博物馆-情绪展馆.svg?raw';
import galleryDetail from '../pages/情绪博物馆-展厅详情.svg?raw';
import release from '../pages/情绪博物馆-释放压力.svg?raw';
import chat from '../pages/情绪博物馆-陪伴聊天.svg?raw';
import badges from '../pages/情绪博物馆-成长勋章.svg?raw';
import privacyPage from '../pages/情绪博物馆-隐私设置.svg?raw';

const pages = [
  { name: '首页', svg: home },
  { name: '功能导览', svg: guide },
  { name: '心情选择', svg: moodSelect },
  { name: '心情记录', svg: moodRecord },
  { name: '心情日历', svg: calendar },
  { name: '情绪展馆', svg: galleries },
  { name: '开心展厅', svg: galleryDetail },
  { name: '释放压力', svg: release },
  { name: '陪伴聊天', svg: chat },
  { name: '成长勋章', svg: badges },
  { name: '隐私设置', svg: privacyPage },
];
const moods = ['开心', '难过', '生气', '焦虑', '平静', '疲惫', '委屈', '尴尬', '孤独', '兴奋', '迷茫', '释然'];
const badgeNames = ['第一次开心', '发现小星星', '第一次写下', '善待自己', '给心放晴', '勇敢面对', '馆长徽章', '坚持表达'];
const roomNames = ['开心', '平静', '难过', '生气', '焦虑', '疲惫'];
const roomBounds = [[25, 163, 156, 108], [199, 163, 166, 108], [25, 314, 156, 108], [199, 314, 166, 108], [25, 465, 156, 108], [199, 465, 166, 108]];
const navItems = [
  { label: '展厅', page: 0 }, { label: '日历', page: 4 }, { label: '收藏', page: 5 },
  { label: '成长', page: 9 }, { label: '我的', page: 10 },
];
const defaultPrivacy = [true, false, true, false];
const emotionArt = (() => {
  const doc = new DOMParser().parseFromString(moodSelect, 'image/svg+xml');
  return [...doc.querySelectorAll('image')].slice(0, 12).map((node) => node.getAttribute('href') || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href'));
})();
const roomContent = {
  '开心': { color: '#F8EABB', weather: '晴天色', lead: '小小的开心，也值得收藏。', sub: '这里收着那些让心亮一下的瞬间。', cards: [['被老师点名表扬', '9月28日', '那一刻，我觉得自己可以。'], ['朋友发来的小猫', '9月16日', '普通的一天，被可爱接住了。']] },
  '难过': { color: '#F2C2D0', weather: '雨天色', lead: '难过的时候，也可以被好好收藏。', sub: '眼泪落下以后，心会慢慢轻一点。', cards: [['没说出口的话', '10月8日', '今天先允许自己难过一会儿。'], ['有人陪我走回家', '9月21日', '那段路好像没有那么长了。']] },
  '生气': { color: '#F3B1A0', weather: '晚霞色', lead: '生气也在提醒你：有些事很重要。', sub: '把边界和委屈，认真放在这里。', cards: [['我说出了不舒服', '10月5日', '这一次，我没有再假装没关系。'], ['深呼吸以后', '9月24日', '我先照顾好自己，再继续沟通。']] },
  '焦虑': { color: '#DDD1E9', weather: '薄雾色', lead: '脑袋很吵的时候，先停一停。', sub: '那些担心都可以暂时放在展柜里。', cards: [['睡前写下三件事', '10月11日', '写出来以后，好像没那么挤了。'], ['等待结果的下午', '9月28日', '我不知道答案，但我已经尽力。']] },
  '平静': { color: '#C6E0E6', weather: '微风色', lead: '平静的时刻，也值得留下来。', sub: '把这份松弛感，留给未来的自己。', cards: [['阳台上的十分钟', '10月16日', '风吹过来，什么也不用赶。'], ['慢慢吃完一顿饭', '9月30日', '今天有好好照顾自己。']] },
  '疲惫': { color: '#C9D9DF', weather: '阴天色', lead: '累了就歇一会儿，不必逞强。', sub: '休息不是停下，是给自己一点空间。', cards: [['凌晨三点的画稿', '10月11日', '疲惫，也有一点坚持。'], ['终于睡了个好觉', '9月16日', '今天先到这里，已经够了。']] },
  '委屈': { color: '#F4C4D2', weather: '樱花色', lead: '没关系，你的感受有人认真听。', sub: '这里给那些说不出口的委屈留个位置。', cards: [['那天我没有解释', '10月9日', '不是不在意，只是有点累了。'], ['终于说出我不喜欢', '9月18日', '我的感受，也值得被看见。']] },
  '尴尬': { color: '#F4D2B4', weather: '蜜桃色', lead: '小小的尴尬，过一会儿就会散。', sub: '把脸红的瞬间也当成可爱的收藏。', cards: [['叫错名字的早晨', '10月6日', '现在想想，好像也没那么糟。'], ['大家一起笑了', '9月20日', '原来只有我记了这么久。']] },
  '孤独': { color: '#C7D3E4', weather: '月夜色', lead: '一个人的时候，也要抱抱自己。', sub: '这间小屋会安静地陪你待一会儿。', cards: [['一个人看完的电影', '10月4日', '片尾曲响起时，心安静了一点。'], ['没有发出的消息', '9月12日', '我想念谁，也可以先告诉自己。']] },
  '兴奋': { color: '#F8E3A0', weather: '星星色', lead: '这份雀跃，值得好好珍藏。', sub: '把闪闪发亮的瞬间，留给以后回看。', cards: [['等到了期待的消息', '10月14日', '我开心得想立刻告诉所有人。'], ['周末终于要来了', '9月25日', '光是想一想就觉得很快乐。']] },
  '迷茫': { color: '#C6DCEB', weather: '海雾色', lead: '暂时没有答案，也没有关系。', sub: '慢一点走，路会一点点显出来。', cards: [['站在路口的傍晚', '10月2日', '不知道去哪儿，也可以先休息。'], ['写下三个可能', '9月10日', '我不需要今天就决定一切。']] },
  '释然': { color: '#D6E9C8', weather: '新芽色', lead: '放下了一点点，就是很好的开始。', sub: '愿你带着轻一点的心，继续往前走。', cards: [['终于不再反复想起', '10月17日', '有些事过去了，就让它过去吧。'], ['把旧信收进盒子', '9月7日', '谢谢那时的我，已经可以告别。']] },
};

function getStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value == null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function Artboard({ page, svg, scale, onNavigate, showToast, showModal, selectedMoods, setSelectedMoods, mood, setMood, draft, setDraft, activeRoom, setActiveRoom, releaseChoice, setReleaseChoice, selectedDay, setSelectedDay, privacy, setPrivacy, chatDraft, setChatDraft }) {
  const [pressedKey, setPressedKey] = useState('');
  const rect = (label, x, y, width, height, action, extra = {}) => (
    <rect key={`${label}-${x}-${y}`} x={x} y={y} width={width} height={height}
      fill={pressedKey === `${label}-${x}-${y}` ? '#F6BCD14D' : 'transparent'} pointerEvents="all" role="button" tabIndex="0" aria-label={label}
      style={{ cursor: 'pointer', outline: 'none', transformBox: 'fill-box', transformOrigin: 'center', transition: 'transform 160ms ease, fill 160ms ease' }}
      onPointerDown={() => { const key = `${label}-${x}-${y}`; setPressedKey(key); window.setTimeout(() => setPressedKey(''), 240); }}
      onClick={action} onKeyDown={(e) => e.key === 'Enter' && action()}>
      <title>{label}</title>
    </rect>
  );
  const nav = () => navItems.map((item, i) => rect(item.label, i * 78, 764, 78, 80, () => onNavigate(item.page)));
  const makeMood = (name) => {
    setSelectedMoods((selected) => selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name]);
  };
  const sendChatMessage = () => {
    const text = chatDraft.trim();
    if (!text) { showToast('写一句想说的话吧'); return; }
    const messages = getStored('museumChat', []);
    messages.push(text);
    localStorage.setItem('museumChat', JSON.stringify(messages));
    setChatDraft('');
    showModal('阿团收到了', `“${text}”\n\n我会陪你把这份心情放好。`, [{ label: '继续说说' }, { label: '结束对话', action: () => onNavigate(0), secondary: true }]);
  };
  const [monthSelection] = useState(10);
  const dayRects = [];
  const xCenters = [31, 78, 125, 172, 219, 266, 313];
  const yRows = [184, 227, 270, 313, 356];
  for (let day = 1; day <= 31; day += 1) {
    const index = day + 3;
    const row = Math.floor(index / 7);
    const col = index % 7;
    dayRects.push(rect(`选择 2026 年 10 月 ${day} 日`, xCenters[col] - 20, yRows[row] - 23, 40, 39, () => {
      setSelectedDay(day);
      showToast(`已选择 2026 年 10 月 ${day} 日`);
    }));
  }
  let interactions = [];
  if (page === 0) {
    interactions = [
      rect('记录今天的心情', 27, 456, 336, 49, () => onNavigate(2)),
      rect('查看心情日历', 318, 532, 72, 36, () => onNavigate(4)),
      rect('选择最近几天', 28, 568, 334, 56, () => onNavigate(4)),
      rect('打开最近展品', 28, 680, 336, 57, () => onNavigate(4)),
      ...nav(),
    ];
  } else if (page === 1) {
    const destinations = [3, 5, 7, 4, 10];
    const labels = ['记录心情', '逛逛展厅', '释放压力', '回看日历', '保护隐私'];
    interactions = [rect('‹', 12, 8, 46, 54, () => onNavigate(0)), ...labels.map((label, i) => rect(label, 26, [139, 252, 365, 478, 591][i], 338, 91, () => onNavigate(destinations[i])))];
  } else if (page === 2) {
    interactions = moods.map((name, i) => {
      const x = 28 + (i % 3) * 128;
      const y = 145 + Math.floor(i / 3) * 120;
      return rect(`选择${name}`, x, y, 78, 108, () => makeMood(name));
    });
      selectedMoods.forEach((name) => {
      const i = moods.indexOf(name);
      interactions.push(<rect key={`selected-${name}`} className="selection-pulse" x={28 + (i % 3) * 128} y={145 + Math.floor(i / 3) * 120} width="78" height="77" rx="16" fill="none" stroke="#e99fba" strokeWidth="2" pointerEvents="none" />);
    });
    interactions.push(rect('自由表达心情', 82, 642, 274, 42, () => onNavigate(3)));
    interactions.push(rect('继续并写下心情', 27, 708, 336, 49, () => {
      const chosen = selectedMoods.length ? selectedMoods : ['焦虑'];
      setMood(chosen.join('、'));
      localStorage.setItem('museumMood', JSON.stringify(chosen));
      onNavigate(3);
    }));
  } else if (page === 3) {
    const chosenMoods = Array.isArray(mood) ? mood : String(mood || '焦虑').split('、');
    const chosenMood = chosenMoods[0] || '焦虑';
    const pillLabel = `${chosenMood}${chosenMoods.length > 1 ? ` +${chosenMoods.length - 1}` : ''}`;
    interactions = [
      <rect key="cover-record-placeholder" x="42" y="257" width="120" height="24" fill="#FFFCF5" pointerEvents="none" />,
      <foreignObject key="record-textarea" x="46" y="261" width="242" height="213" style={{ pointerEvents: 'auto' }}>
        <textarea xmlns="http://www.w3.org/1999/xhtml" aria-label="把此刻的心情写下来" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="我现在想——" maxLength={280}
          style={{ width: '100%', height: '100%', border: 0, outline: 0, resize: 'none', padding: 0, margin: 0, background: 'transparent', color: '#594c45', font: '14px/39px PingFang SC, sans-serif', overflowY: 'auto', pointerEvents: 'auto', touchAction: 'auto' }} />
      </foreignObject>,
      <rect key="record-mood-cover" x="34" y="180" width="73" height="26" rx="12" fill="#E6DCEF" pointerEvents="none" />,
      <text key="record-mood" x="70" y="194" textAnchor="middle" dominantBaseline="middle" fill="#514640" fontSize={pillLabel.length > 4 ? '10' : '12'} pointerEvents="none">{pillLabel}</text>,
      <rect key="record-mood-note-cover" x="121" y="179" width="128" height="28" fill="#FFF9F0" pointerEvents="none" />,
      <text key="record-mood-note" x="125" y="194" dominantBaseline="middle" fill="#887969" fontSize="11" pointerEvents="none">{chosenMoods.length > 1 ? `还有 ${chosenMoods.length - 1} 种心情` : '可以稍后修改'}</text>,
      rect('更换心情', 28, 172, 82, 42, () => onNavigate(2)),
      rect('只想说说', 28, 546, 154, 44, () => { setChatDraft(draft); onNavigate(8); }),
      rect('帮我理清', 207, 546, 155, 44, () => { setChatDraft(draft ? `可以陪我理一理这件事吗？ ${draft}` : '可以陪我理一理这件事吗？'); onNavigate(8); }),
      rect('收进我的展厅', 27, 696, 336, 49, () => {
        const records = getStored('museumRecords', []);
        records.unshift({ mood: chosenMood || '焦虑', text: draft, date: new Date().toLocaleDateString('zh-CN') });
        localStorage.setItem('museumRecords', JSON.stringify(records));
        setDraft('');
        showModal('已经收进你的展厅', '这份心情只属于你。你可以在日历里慢慢回看。', [
          { label: '去看看', action: () => onNavigate(4) },
          { label: '继续逛逛', action: () => onNavigate(5), secondary: true },
        ]);
      }),
    ];
  } else if (page === 4) {
    interactions = [...dayRects, rect('查看所选日期的展品', 27, 498, 336, 132, () => {
      const records = getStored('museumRecords', []);
      if (records.length) showModal(`${selectedDay} 日的展品`, `${records[0].mood} · ${records[0].date}\n${records[0].text || '你给这一天留了一个位置。'}`, [{ label: '知道了' }]);
      else showToast(`10 月 ${selectedDay} 日还没有新增展品`);
    }), ...nav()];
  } else if (page === 5) {
    interactions = roomBounds.map(([x, y, width, height], i) => rect(`${roomNames[i]}展厅`, x, y, width, height, () => {
      setActiveRoom(roomNames[i]);
      onNavigate(6);
    }));
    interactions.push(rect('查看其他情绪展厅', 25, 602, 340, 76, () => showModal('其他情绪展厅', '委屈、尴尬、孤独、兴奋、迷茫和释然也都可以收藏。当前这份设计稿提供了开心展厅详情页。', [{ label: '知道了' }])));
    interactions.push(...nav());
  } else if (page === 6) {
    interactions = [
      rect('打开第一件展品', 27, 397, 336, 105, () => showModal('被老师点名表扬', '9 月 28 日\n那一刻，我觉得自己可以。', [{ label: '收起' }])),
      rect('打开第二件展品', 27, 530, 336, 105, () => showModal('朋友发来的小猫', '9 月 16 日\n普通的一天，被可爱接住了。', [{ label: '收起' }])),
      ...nav(),
    ];
  } else if (page === 7) {
    const choices = ['撕成小小的碎片', '把云朵吹远一点', '先放进情绪瓶'];
    interactions = choices.map((label, i) => rect(label, 27, [230, 358, 486][i], 336, 104, () => setReleaseChoice(i)));
    if (releaseChoice >= 0) interactions.push(<rect key="release-selected" x="31" y={[230, 358, 486][releaseChoice] + 4} width="328" height="96" rx="14" fill="none" stroke="#8ebda0" strokeWidth="2" pointerEvents="none" />);
    interactions.push(rect('继续释放', 27, 688, 336, 49, () => {
      const choice = choices[releaseChoice < 0 ? 0 : releaseChoice];
      showModal('给这份心情一个出口', `你选择了「${choice}」。\n你可以保留展签，也可以删除原文。`, [
        { label: '保留展签', action: () => onNavigate(5) },
        { label: '删除这份记录', action: () => { localStorage.removeItem('museumDraft'); onNavigate(0); }, secondary: true },
      ]);
    }));
  } else if (page === 8) {
    const suggestions = [['陪我聊聊', '我想继续说说。', 27, 94], ['给我建议', '你可以给我一些建议吗？', 133, 100], ['先安静会儿', '我想先安静一会儿。', 245, 112]];
    interactions = suggestions.map(([label, text, x, width]) => rect(label, x, 499, width, 39, () => setChatDraft(text)));
    interactions.push(
      <rect key="cover-chat-placeholder" x="35" y="639" width="210" height="29" fill="#FFFCF5" pointerEvents="none" />,
      <foreignObject key="chat-input" x="34" y="623" width="278" height="55" style={{ pointerEvents: 'auto' }}>
        <input xmlns="http://www.w3.org/1999/xhtml" aria-label="输入想对阿团说的话" value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); } }} placeholder="想说什么，都可以…"
          style={{ width: '100%', height: '100%', border: 0, outline: 0, padding: '0 8px', margin: 0, background: 'transparent', color: '#594c45', font: '13px PingFang SC, sans-serif', pointerEvents: 'auto', touchAction: 'auto' }} />
      </foreignObject>,
      rect('发送消息给阿团', 317, 633, 34, 34, sendChatMessage),
    );
  } else if (page === 9) {
    interactions = badgeNames.map((label, i) => {
      const x = 24 + (i % 4) * 88;
      const y = 145 + Math.floor(i / 4) * 153;
      return rect(label, x, y, 78, 112, () => showToast(`已获得：${label}`));
    });
    interactions.push(rect('打开年度纪念册', 28, 476, 334, 143, () => showModal('年度纪念册', '把这一年的展品慢慢装订成一本故事。\n纪念册将在 12 月开放。', [{ label: '知道了' }])));
    interactions.push(...nav());
  } else if (page === 10) {
    const labels = ['仅自己可见', '允许 AI 参考过往记录', '回看时折叠原文', '分享单件展品'];
    const yTops = [193, 296, 399, 502];
    interactions = yTops.flatMap((y, i) => {
      const on = privacy[i];
      return [
        <rect key={`switch-bg-${i}`} x="302" y={y} width="42" height="24" rx="12" fill={on ? '#B8D9C3' : '#DDD4C6'} pointerEvents="none" />,
        <circle key={`switch-dot-${i}`} cx={on ? 326 : 314} cy={y + 12} r="8.5" fill="#FFFCF5" pointerEvents="none" />,
        rect(labels[i], 298, y - 3, 50, 30, () => {
          if (i === 0) { showToast('展品始终仅自己可见'); return; }
          const next = privacy.map((value, index) => index === i ? !value : value);
          setPrivacy(next);
          localStorage.setItem('museumPrivacy', JSON.stringify(next));
        }),
        <rect key={`status-cover-${i}`} x="298" y={y + 31} width="50" height="18" fill="#FFF9F0" pointerEvents="none" />,
        <text key={`status-${i}`} x="323" y={y + 44} textAnchor="middle" fill="#887969" fontSize="8.5" pointerEvents="none">{i === 0 ? '始终开启' : i === 3 ? (on ? '已开启' : '需确认') : (on ? '开启' : '关闭')}</text>,
      ];
    });
    interactions.push(rect('隐私和数据说明', 27, 590, 336, 60, () => showModal('你的数据，由你带走。', '展品默认只对自己可见。你可以随时导出，也可以彻底删除私人记录。', [{ label: '知道了' }])));
    interactions.push(rect('删除本机记录', 27, 676, 250, 40, () => showModal('删除所有私人记录？', '这会清除本机保存的心情展品与聊天内容。此操作无法撤销。', [
      { label: '取消', secondary: true },
      { label: '确认删除', action: () => { localStorage.removeItem('museumRecords'); localStorage.removeItem('museumChat'); showToast('本机记录已删除'); } },
    ])));
  }

  const backRect = page > 0 ? rect('返回上一页', 12, 8, 46, 54, () => onNavigate(-1, { back: true })) : null;
  const dynamicRoom = page === 6 ? roomContent[activeRoom] || roomContent['开心'] : null;
  const dynamicRoomArt = page === 6 ? emotionArt[Math.max(0, moods.indexOf(activeRoom))] : null;
  const customTitle = page === 6 ? (
    <g key="dynamic-room-title" pointerEvents="none">
      <rect x="60" y="15" width="280" height="54" fill="#FFF9F0" />
      <text x="65" y="42" fill="#514640" fontSize="20" fontWeight="700">{activeRoom}展厅</text>
      <text x="66" y="62" fill="#8C806F" fontSize="10.5">{dynamicRoom.weather} · 3 件展品</text>
    </g>
  ) : null;
  const roomOverlay = page === 6 ? <g className="room-redraw" pointerEvents="none">
    <path d="M0 108 Q96 84 194 108 T390 108 V319 H0Z" fill={dynamicRoom.color} />
    <image className="motion-mascot" href={dynamicRoomArt} x="143" y="127" width="105" height="99" preserveAspectRatio="xMidYMid meet" />
    <rect x="22" y="326" width="350" height="45" fill="#FFF9F0" />
    <text x="28" y="350" fill="#EF91B5" fontSize="18" fontWeight="700">{dynamicRoom.lead}</text>
    <text x="28" y="372" fill="#887969" fontSize="10.5">{dynamicRoom.sub}</text>
    {dynamicRoom.cards.map((card, index) => {
      const y = index === 0 ? 410 : 543;
      return <g key={card[0]}>
        <rect x="121" y={y + 10} width="182" height="66" fill="#FFFCF5" />
        <text x="127" y={y + 20} fill="#514640" fontSize="11.5" fontWeight="700">{card[0]}</text>
        <text x="127" y={y + 40} fill="#887969" fontSize="10">{card[1]}</text>
        <text x="127" y={y + 62} fill="#887969" fontSize="9.5">{card[2]}</text>
        <rect x="301" y={y + 39} width="48" height="48" fill="#FFFCF5" />
        <image className="motion-mascot" href={dynamicRoomArt} x="306" y={y + 44} width="39" height="42" preserveAspectRatio="xMidYMid meet" />
      </g>;
    })}
  </g> : null;

  return <div className={`artboard artboard-page-${page}`} data-page={page} style={{ transform: `scale(${scale})` }}>
    <div className="design-layer" dangerouslySetInnerHTML={{ __html: svg }} />
    <svg className="interaction-layer" xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844" aria-label={`${pages[page].name}交互层`}>
      {roomOverlay}
      {interactions}
      {customTitle}
    {page === 3 && <g key="dynamic-record-emotion" pointerEvents="none">
      <rect x="287" y="76" width="78" height="80" fill="#FFF9F0" />
      <image className="motion-mascot" href={emotionArt[Math.max(0, moods.indexOf(Array.isArray(mood) ? mood[0] : String(mood).split('、')[0]))]} x="294" y="82" width="62" height="65" preserveAspectRatio="xMidYMid meet" />
    </g>}
      {backRect}
    </svg>
  </div>;
}

export default function App() {
  const deviceRef = useRef(null);
  const [fit, setFit] = useState(1);
  const [page, setPage] = useState(0);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [mood, setMood] = useState(() => getStored('museumMood', ['焦虑']));
  const [draft, setDraft] = useState(() => sessionStorage.getItem('museumDraft') || '');
  const [chatDraft, setChatDraft] = useState(() => sessionStorage.getItem('museumChatDraft') || '');
  const [activeRoom, setActiveRoom] = useState('开心');
  const [releaseChoice, setReleaseChoice] = useState(-1);
  const [selectedDay, setSelectedDay] = useState(11);
  const [privacy, setPrivacy] = useState(() => getStored('museumPrivacy', defaultPrivacy));
  const [toastText, setToastText] = useState('');
  const [dialog, setDialog] = useState(null);
  const historyRef = useRef([]);
  const toastTimer = useRef(null);
  const current = useMemo(() => pages[page], [page]);

  useEffect(() => {
    if (!deviceRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setFit(entry.contentRect.width / 390));
    observer.observe(deviceRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { sessionStorage.setItem('museumDraft', draft); }, [draft]);
  useEffect(() => { sessionStorage.setItem('museumChatDraft', chatDraft); }, [chatDraft]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const navigate = useCallback((destination, options = {}) => {
    if (options.back) {
      const previous = historyRef.current.pop();
      setPage(previous ?? 0);
      return;
    }
    const next = Number(destination);
    if (!Number.isInteger(next) || next < 0 || next >= pages.length || next === page) return;
    historyRef.current.push(page);
    setPage(next);
  }, [page]);
  const showToast = useCallback((text) => {
    setToastText(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(''), 2200);
  }, []);
  const showModal = useCallback((title, body, actions) => setDialog({ title, body, actions }), []);
  const pickScreen = useCallback((index) => {
    if (index === page) return;
    historyRef.current.push(page);
    setPage(index);
  }, [page]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight') pickScreen((page + 1) % pages.length);
      if (event.key === 'ArrowLeft') pickScreen((page + pages.length - 1) % pages.length);
      if (event.key === 'Escape') setDialog(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page, pickScreen]);

  const touch = useRef({ x: 0, y: 0 });
  const onTouchStart = (event) => { touch.current = { x: event.changedTouches[0].screenX, y: event.changedTouches[0].screenY }; };
  const onTouchEnd = (event) => {
    const dx = event.changedTouches[0].screenX - touch.current.x;
    const dy = event.changedTouches[0].screenY - touch.current.y;
    if (Math.abs(dx) > 105 && Math.abs(dx) > Math.abs(dy) * 1.4) pickScreen((page + (dx < 0 ? 1 : pages.length - 1)) % pages.length);
  };

  return <main className="app-shell min-h-screen w-full items-center gap-8 bg-[#f3eee7] px-7 py-7 text-[#594c45] md:grid md:grid-cols-[270px_minmax(0,1fr)]">
    <aside className="sidebar hidden md:flex md:flex-col md:justify-center">
      <h1 className="text-[22px] font-bold tracking-wide">情绪博物馆</h1>
      <p className="mb-6 mt-2 text-[13px] text-[#978575]">一座给心情留位置的小博物馆</p>
      <p className="mb-3 ml-3 text-[11px] tracking-[.16em] text-[#aa9c8d]">页面导航 · 11 SCREENS</p>
      <nav className="grid gap-1" aria-label="页面导航">
        {pages.map((item, index) => <button key={item.name} onClick={() => pickScreen(index)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#fffaf4] ${index === page ? 'bg-[#f8dce7] font-semibold text-[#7b4b5d]' : ''}`}>
          <span className="w-6 text-xs tabular-nums text-[#b09b88]">{String(index + 1).padStart(2, '0')}</span>{item.name}
        </button>)}
      </nav>
      <p className="ml-1 mt-4 text-xs leading-6 text-[#9c8b7a]">点页面里的卡片、按钮和底部导航。<br />左右方向键也能切页，手机上可左右滑动。</p>
    </aside>
    <section className="stage flex min-h-[100dvh] items-center justify-center md:min-h-0" aria-label={`${current.name}页面`}>
      <div ref={deviceRef} className="phone relative mx-auto aspect-[390/844] w-[min(390px,46.2085dvh)] overflow-hidden bg-[#fff9f0] md:shadow-[0_18px_60px_#584a3824]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <Artboard page={page} svg={current.svg} scale={fit} onNavigate={navigate} showToast={showToast} showModal={showModal}
          selectedMoods={selectedMoods} setSelectedMoods={setSelectedMoods} mood={mood} setMood={setMood} draft={draft} setDraft={setDraft}
          activeRoom={activeRoom} setActiveRoom={setActiveRoom} releaseChoice={releaseChoice} setReleaseChoice={setReleaseChoice}
          selectedDay={selectedDay} setSelectedDay={setSelectedDay} privacy={privacy} setPrivacy={setPrivacy} chatDraft={chatDraft} setChatDraft={setChatDraft} />
        {toastText && <div className="pointer-events-none absolute left-1/2 top-[8%] z-20 -translate-x-1/2 rounded-full bg-[#594c45]/95 px-4 py-2 text-xs text-white">{toastText}</div>}
        {dialog && <div className="absolute inset-0 z-30 grid place-items-center bg-[#3d342d]/35 p-6" onClick={(event) => event.target === event.currentTarget && setDialog(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="w-full rounded-[22px] border-2 border-[#594c45] bg-[#fffaf2] px-5 py-6 text-center shadow-xl">
            <h2 id="dialog-title" className="mb-2 text-lg font-bold">{dialog.title}</h2>
            <p className="mb-5 whitespace-pre-line text-[13px] leading-6 text-[#8e7d6b]">{dialog.body}</p>
            <div className="flex flex-wrap justify-center gap-2.5">{dialog.actions.map((action, index) => <button key={`${action.label}-${index}`} onClick={() => { setDialog(null); action.action?.(); }} className={`rounded-xl border-[1.5px] border-[#594c45] px-4 py-2.5 text-[13px] font-semibold ${action.secondary ? 'bg-[#fffaf2]' : 'bg-[#f8dce7]'}`}>{action.label}</button>)}</div>
          </section>
        </div>}
      </div>
      <div className="sr-only" aria-live="polite">{toastText}</div>
    </section>
  </main>;
}
