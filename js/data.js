"use strict";
/* ==== DATA - tach rieng de script generate audio dung chung ==== */

const PRAISE = ['Giỏi quá!','Tuyệt vời!','Bé làm đúng rồi!','Xuất sắc!','Hay lắm!','Bé thật là siêu!','Quá đỉnh luôn!'];
const CHEER = ['Bé cố lên nhé!','Thử lại nào, bé làm được mà!','Gần đúng rồi, cố lên!'];
const HELLO = ['Chào bé! Hôm nay chơi gì nào?','Bé ơi, học mà chơi nào!','Hôm nay bé muốn vẽ hay đọc nhỉ?','Thỏ Bông nhớ bé lắm!'];
const JOKES = ['Thỏ Bông đây! Bé giỏi lắm!','Hí hí, cù léc nè!','Bé học giỏi, Thỏ Bông thưởng cà rốt!','Yêu bé nhất trên đời!'];

const STICKERS = [
  {em:'🦄',nm:'Ngựa thần'},{em:'🐬',nm:'Cá heo'},{em:'🦖',nm:'Khủng long'},{em:'🚀',nm:'Tên lửa'},
  {em:'🌈',nm:'Cầu vồng'},{em:'🍦',nm:'Que kem'},{em:'🎠',nm:'Ngựa gỗ'},{em:'🧸',nm:'Gấu bông'},
  {em:'🦋',nm:'Bươm bướm'},{em:'🐳',nm:'Cá voi'},{em:'🎪',nm:'Rạp xiếc'},{em:'🏰',nm:'Lâu đài'},
  {em:'🧜‍♀️',nm:'Tiên cá'},{em:'🦕',nm:'Khủng long cổ dài'},{em:'🎨',nm:'Bảng màu'},{em:'🪁',nm:'Cánh diều'},
  {em:'🎡',nm:'Đu quay'},{em:'🍭',nm:'Kẹo mút'},{em:'👑',nm:'Vương miện'},{em:'🦩',nm:'Hồng hạc'},
  {em:'🐙',nm:'Bạch tuộc'},{em:'🛸',nm:'Đĩa bay'},{em:'⛄',nm:'Người tuyết'},{em:'🧚',nm:'Cô tiên'}
];
const STICKER_COST = 8; // 8 sao = 1 sticker mới

/* ============ DATA ============ */
const LETTER_NAMES = {
  a:'a', ă:'á', â:'ớ', b:'bờ', c:'cờ', d:'dờ', đ:'đờ', e:'e', ê:'ê', g:'gờ',
  h:'hờ', i:'i', k:'ca', l:'lờ', m:'mờ', n:'nờ', o:'o', ô:'ô', ơ:'ơ', p:'pờ',
  q:'quy', r:'rờ', s:'sờ', t:'tờ', u:'u', ư:'ư', v:'vờ', x:'xờ', y:'y dài',
  f:'ép', j:'giây', w:'vê kép', z:'dét',
  0:'không',1:'một',2:'hai',3:'ba',4:'bốn',5:'năm',6:'sáu',7:'bảy',8:'tám',9:'chín'
};
const EXAMPLES = {
  a:{w:'quả táo',em:'🍎'}, ă:{w:'mặt trăng',em:'🌙'}, â:{w:'cái ấm',em:'🫖'},
  b:{w:'quả bóng',em:'⚽'}, c:{w:'con cá',em:'🐟'}, d:{w:'con dê',em:'🐐'},
  đ:{w:'đèn',em:'💡'}, e:{w:'em bé',em:'👶'}, ê:{w:'con ếch',em:'🐸'},
  g:{w:'con gà',em:'🐔'}, h:{w:'bông hoa',em:'🌸'}, i:{w:'bí đỏ',em:'🎃'},
  k:{w:'cái kẹo',em:'🍬'}, l:{w:'chiếc lá',em:'🍃'}, m:{w:'con mèo',em:'🐱'},
  n:{w:'con nai',em:'🦌'}, o:{w:'con ong',em:'🐝'}, ô:{w:'ô tô',em:'🚗'},
  ơ:{w:'cái nơ',em:'🎀'}, p:{w:'đèn pin',em:'🔦'}, q:{w:'quả quýt',em:'🍊'},
  r:{w:'con rùa',em:'🐢'}, s:{w:'ngôi sao',em:'⭐'}, t:{w:'con tôm',em:'🦐'},
  u:{w:'con cua',em:'🦀'}, ư:{w:'quả dưa',em:'🍉'}, v:{w:'con voi',em:'🐘'},
  x:{w:'xe đạp',em:'🚲'}, y:{w:'yo-yo',em:'🪀'},
  f:{w:'fish – con cá',em:'🐟'}, j:{w:'juice – nước ép',em:'🧃'},
  w:{w:'water – nước',em:'💧'}, z:{w:'zebra – ngựa vằn',em:'🦓'},
  0:{w:'không có gì',em:'🫧'},1:{w:'một quả bóng',em:'🎈'},2:{w:'hai quả bóng',em:'🎈🎈'},
  3:{w:'ba quả bóng',em:'🎈🎈🎈'},4:{w:'bốn quả bóng',em:'🎈🎈🎈🎈'},
  5:{w:'năm ngôi sao',em:'⭐⭐⭐⭐⭐'},6:{w:'sáu bông hoa',em:'🌸🌸🌸🌸🌸🌸'},
  7:{w:'bảy quả táo',em:'🍎🍎🍎🍎🍎🍎🍎'},8:{w:'tám con ong',em:'🐝🐝🐝🐝🐝🐝🐝🐝'},
  9:{w:'chín trái tim',em:'💖💖💖💖💖💖💖💖💖'}
};
const VN_LETTERS = ['a','ă','â','b','c','d','đ','e','ê','g','h','i','k','l','m','n',
  'o','ô','ơ','p','q','r','s','t','u','ư','v','x','y'];
const WRITE_SETS = {
  low: [...VN_LETTERS,'f','j','w','z'],
  up:  [...VN_LETTERS,'f','j','w','z'].map(c=>c.toUpperCase()),
  num: ['0','1','2','3','4','5','6','7','8','9']
};
const VOWELS = ['a','e','i','o','u','ơ','ô','ê'];
const VAN_ITEMS = [
  ['b','a'],['b','o'],['b','i'],['c','a'],['c','o'],['m','a'],['m','e'],
  ['l','a'],['l','o'],['t','i'],['t','a'],['n','o'],['n','a'],['h','a'],['h','o'],
  ['v','e'],['v','o'],['s','o'],['d','a'],['đ','o']
];
const TONE_SETS = [
  ['ba','bà','bá','bả','bã','bạ'],
  ['la','là','lá','lả','lã','lạ'],
  ['ma','mà','má','mả','mã','mạ'],
  ['be','bè','bé','bẻ','bẽ','bẹ'],
  ['bo','bò','bó','bỏ','bõ','bọ'],
  ['me','mè','mé','mẻ','mẽ','mẹ']
];
/* Vần có âm cuối — nửa sau HK1 SGK lớp 1; week = tuần học, lộ trình mở dần (bhv_learn) */
const VAN2 = [
  {van:'an',week:10,words:[{w:'bàn tay',tieng:'bàn',em:'🖐️'},{w:'hoa lan',tieng:'lan',em:'🌸'}]},
  {van:'ăn',week:10,words:[{w:'cái khăn',tieng:'khăn',em:'🧣'},{w:'ăn cơm',tieng:'ăn',em:'🍚'}]},
  {van:'on',week:10,words:[{w:'hình tròn',tieng:'tròn',em:'⭕'},{w:'cơm ngon',tieng:'ngon',em:'😋'}]},
  {van:'ôn',week:10,words:[{w:'số bốn',tieng:'bốn',em:'4️⃣'},{w:'ôn bài',tieng:'ôn',em:'📖'}]},
  {van:'ơn',week:11,words:[{w:'con lợn',tieng:'lợn',em:'🐷'},{w:'cảm ơn',tieng:'ơn',em:'🙏'}]},
  {van:'en',week:11,words:[{w:'hoa sen',tieng:'sen',em:'🪷'},{w:'cái kèn',tieng:'kèn',em:'🎺'}]},
  {van:'ên',week:11,words:[{w:'cây nến',tieng:'nến',em:'🕯️'},{w:'mũi tên',tieng:'tên',em:'🏹'}]},
  {van:'in',week:11,words:[{w:'đèn pin',tieng:'pin',em:'🔦'},{w:'số chín',tieng:'chín',em:'9️⃣'}]},
  {van:'am',week:12,words:[{w:'quả cam',tieng:'cam',em:'🍊'},{w:'số tám',tieng:'tám',em:'8️⃣'}]},
  {van:'ăm',week:12,words:[{w:'số năm',tieng:'năm',em:'5️⃣'},{w:'con tằm',tieng:'tằm',em:'🐛'}]},
  {van:'em',week:12,words:[{w:'em bé',tieng:'em',em:'👶'},{w:'que kem',tieng:'kem',em:'🍦'}]},
  {van:'ôm',week:12,words:[{w:'con tôm',tieng:'tôm',em:'🦐'},{w:'ôm mẹ',tieng:'ôm',em:'🤗'}]},
  {van:'ai',week:13,words:[{w:'cái tai',tieng:'tai',em:'👂'},{w:'con nai',tieng:'nai',em:'🦌'}]},
  {van:'ay',week:13,words:[{w:'máy bay',tieng:'bay',em:'✈️'},{w:'chạy bộ',tieng:'chạy',em:'🏃'}]},
  {van:'oi',week:13,words:[{w:'con voi',tieng:'voi',em:'🐘'},{w:'chó sói',tieng:'sói',em:'🐺'}]},
  {van:'ôi',week:13,words:[{w:'cái nồi',tieng:'nồi',em:'🍲'},{w:'ngọn đồi',tieng:'đồi',em:'⛰️'}]},
  {van:'ao',week:14,words:[{w:'ngôi sao',tieng:'sao',em:'⭐'},{w:'cái áo',tieng:'áo',em:'👕'}]},
  {van:'eo',week:14,words:[{w:'con mèo',tieng:'mèo',em:'🐱'},{w:'viên kẹo',tieng:'kẹo',em:'🍬'}]},
  {van:'au',week:14,words:[{w:'rau xanh',tieng:'rau',em:'🥬'},{w:'màu đỏ',tieng:'màu',em:'🔴'}]},
  {van:'âu',week:14,words:[{w:'con trâu',tieng:'trâu',em:'🐃'},{w:'quả dâu',tieng:'dâu',em:'🍓'}]},
  {van:'ui',week:14,words:[{w:'cái túi',tieng:'túi',em:'👜'},{w:'ngọn núi',tieng:'núi',em:'🏔️'}]},
  {van:'at',week:15,words:[{w:'cái bát',tieng:'bát',em:'🥣'},{w:'ca hát',tieng:'hát',em:'🎤'}]},
  {van:'ăt',week:15,words:[{w:'đôi mắt',tieng:'mắt',em:'👀'},{w:'cắt giấy',tieng:'cắt',em:'✂️'}]},
  {van:'ôt',week:15,words:[{w:'cà rốt',tieng:'rốt',em:'🥕'},{w:'cột cờ',tieng:'cột',em:'🚩'}]},
  {van:'it',week:15,words:[{w:'con vịt',tieng:'vịt',em:'🦆'},{w:'miếng thịt',tieng:'thịt',em:'🥩'}]},
  {van:'ut',week:15,words:[{w:'cây bút',tieng:'bút',em:'✏️'},{w:'sút bóng',tieng:'sút',em:'⚽'}]},
  {van:'ang',week:16,words:[{w:'cây bàng',tieng:'bàng',em:'🌳'},{w:'màu vàng',tieng:'vàng',em:'💛'}]},
  {van:'ăng',week:16,words:[{w:'ông trăng',tieng:'trăng',em:'🌙'},{w:'cái răng',tieng:'răng',em:'🦷'}]},
  {van:'ông',week:16,words:[{w:'ông bà',tieng:'ông',em:'👴'},{w:'dòng sông',tieng:'sông',em:'🏞️'}]},
  {van:'anh',week:17,words:[{w:'quả chanh',tieng:'chanh',em:'🍋'},{w:'bức tranh',tieng:'tranh',em:'🖼️'}]},
  {van:'inh',week:17,words:[{w:'cái kính',tieng:'kính',em:'👓'},{w:'máy tính',tieng:'tính',em:'💻'}]},
  {van:'ach',week:17,words:[{w:'cuốn sách',tieng:'sách',em:'📚'},{w:'viên gạch',tieng:'gạch',em:'🧱'}]}
];
/* Âm ghép (chữ ghép) tuần 5-9 SGK — app dạy từ 'chó, thỏ' thì phải dạy đọc 'ch, th' */
const DIGRAPHS = [
  {d:'ch',name:'chờ',week:5,words:[{w:'chó con',em:'🐶',tieng:'chó'},{w:'chiếc lá',em:'🍃',tieng:'chiếc'}]},
  {d:'kh',name:'khờ',week:5,words:[{w:'khỉ con',em:'🐵',tieng:'khỉ'},{w:'khăn quàng',em:'🧣',tieng:'khăn'}]},
  {d:'th',name:'thờ',week:6,words:[{w:'thỏ trắng',em:'🐰',tieng:'thỏ'},{w:'thước kẻ',em:'📏',tieng:'thước'}]},
  {d:'nh',name:'nhờ',week:6,words:[{w:'nhà ga',em:'🚉',tieng:'nhà'},{w:'nhãn vở',em:'🏷️',tieng:'nhãn'}]},
  {d:'ph',name:'phờ',week:6,words:[{w:'phở bò',em:'🍜',tieng:'phở'},{w:'pháo hoa',em:'🎆',tieng:'pháo'}]},
  {d:'ng',name:'ngờ',week:7,words:[{w:'ngôi sao',em:'⭐',tieng:'ngôi'},{w:'ngón tay',em:'👆',tieng:'ngón'}]},
  {d:'ngh',name:'ngờ kép',week:7,words:[{w:'nghé con',em:'🐃',tieng:'nghé'},{w:'nghe nhạc',em:'🎧',tieng:'nghe'}]},
  {d:'gh',name:'gờ kép',week:7,words:[{w:'ghế gỗ',em:'🪑',tieng:'ghế'},{w:'ghi ta',em:'🎸',tieng:'ghi'}]},
  {d:'qu',name:'quờ',week:8,words:[{w:'quả cam',em:'🍊',tieng:'quả'},{w:'quần áo',em:'👖',tieng:'quần'}]},
  {d:'gi',name:'giờ',week:8,words:[{w:'giày dép',em:'👟',tieng:'giày'},{w:'giường ngủ',em:'🛏️',tieng:'giường'}]},
  {d:'tr',name:'trờ',week:9,words:[{w:'trứng gà',em:'🥚',tieng:'trứng'},{w:'trường học',em:'🏫',tieng:'trường'}]}
];

const WORD_ITEMS = [
  {em:'🐱', w:'con mèo'},{em:'🐶', w:'con chó'},{em:'🐟', w:'con cá'},
  {em:'🐔', w:'con gà'},{em:'🐘', w:'con voi'},{em:'🍎', w:'quả táo'},
  {em:'🍌', w:'quả chuối'},{em:'🏠', w:'cái nhà'},{em:'🚗', w:'ô tô'},{em:'🌸', w:'bông hoa'},
  {em:'🦆', w:'con vịt'},{em:'🐰', w:'con thỏ'},{em:'🐵', w:'con khỉ'},{em:'🍊', w:'quả cam'},
  {em:'🚌', w:'xe buýt'},{em:'✈️', w:'máy bay'},{em:'🦋', w:'con bướm'},{em:'⭐', w:'ngôi sao'},
  {em:'☀️', w:'mặt trời'},{em:'🌙', w:'mặt trăng'},
  {em:'🐄', w:'con bò'},{em:'🐷', w:'con heo'},{em:'🐴', w:'con ngựa'},{em:'🐑', w:'con cừu'},
  {em:'🐐', w:'con dê'},{em:'🐸', w:'con ếch'},{em:'🐯', w:'con hổ'},{em:'🐭', w:'con chuột'},
  {em:'🐝', w:'con ong'},{em:'🐢', w:'con rùa'},
  {em:'🦀', w:'con cua'},{em:'🐌', w:'con ốc'},{em:'🐦', w:'con chim'},{em:'🐻', w:'con gấu'},
  {em:'🍍', w:'quả dứa'},{em:'🥭', w:'quả xoài'},{em:'🍉', w:'quả dưa hấu'},{em:'🚲', w:'xe đạp'},
  {em:'🪑', w:'cái ghế'},{em:'👒', w:'cái mũ'},{em:'👟', w:'đôi giày'},{em:'🌈', w:'cầu vồng'}
];
const SENTENCES = [
  {say:'Con gì kêu meo meo?', html:'Con ___ kêu meo meo 🐱', a:'mèo', d:['chó','gà']},
  {say:'Con gì kêu gâu gâu?', html:'Con ___ kêu gâu gâu 🐶', a:'chó', d:['mèo','vịt']},
  {say:'Con gì gáy ò ó o?', html:'Con ___ gáy ò ó o 🐔', a:'gà', d:['chó','cá']},
  {say:'Con gì bơi dưới nước?', html:'Con ___ bơi dưới nước 🐟', a:'cá', d:['gà','thỏ']},
  {say:'Con gì có cái vòi dài?', html:'Con ___ có vòi dài 🐘', a:'voi', d:['mèo','vịt']},
  {say:'Con gì thích ăn cà rốt?', html:'Con ___ thích ăn cà rốt 🐰', a:'thỏ', d:['cá','voi']},
  {say:'Con gì hay leo trèo?', html:'Con ___ hay leo trèo 🐵', a:'khỉ', d:['gà','cá']},
  {say:'Quả gì màu vàng, cong cong?', html:'Quả ___ màu vàng 🍌', a:'chuối', d:['táo','cam']},
  {say:'Quả gì màu đỏ, tròn tròn?', html:'Quả ___ màu đỏ 🍎', a:'táo', d:['chuối','na']},
  {say:'Ban đêm, cái gì sáng trên trời cùng ông trăng?', html:'Ngôi ___ sáng lấp lánh ⭐', a:'sao', d:['cá','hoa']},
  {say:'Con gì bay lượn trên trời?', html:'Con ___ bay trên trời 🐦', a:'chim', d:['cá','bò']},
  {say:'Con gì chậm chạp, mang mai trên lưng?', html:'Con ___ mang mai trên lưng 🐢', a:'rùa', d:['ong','chim']},
  {say:'Con gì cho bé sữa uống?', html:'Con ___ cho sữa 🐄', a:'bò', d:['gà','mèo']},
  {say:'Con gì nhỏ xíu, làm ra mật ngọt?', html:'Con ___ làm mật ngọt 🐝', a:'ong', d:['bướm','cá']},
  {say:'Ban đêm, cái gì tròn tròn sáng trên trời?', html:'Mặt ___ sáng ban đêm 🌙', a:'trăng', d:['trời','sao']},
  {say:'Quả gì màu cam, cùng tên với màu cam?', html:'Quả ___ màu cam 🍊', a:'cam', d:['táo','chuối']}
];
const EN_THEMES = {
  '🐾 Animals':[
    {em:'🐶',w:'dog',vi:'con chó'},{em:'🐱',w:'cat',vi:'con mèo'},{em:'🐟',w:'fish',vi:'con cá'},
    {em:'🐦',w:'bird',vi:'con chim'},{em:'🐰',w:'rabbit',vi:'con thỏ'},{em:'🦁',w:'lion',vi:'sư tử'},
    {em:'🐘',w:'elephant',vi:'con voi'},{em:'🐵',w:'monkey',vi:'con khỉ'},
    {em:'🐻',w:'bear',vi:'con gấu'},{em:'🦆',w:'duck',vi:'con vịt'},
    {em:'🐄',w:'cow',vi:'con bò'},{em:'🐷',w:'pig',vi:'con heo'},{em:'🐴',w:'horse',vi:'con ngựa'},
    {em:'🐑',w:'sheep',vi:'con cừu'},{em:'🐐',w:'goat',vi:'con dê'},{em:'🐔',w:'chicken',vi:'con gà'},
    {em:'🐸',w:'frog',vi:'con ếch'},{em:'🐯',w:'tiger',vi:'con hổ'},
    {em:'🦒',w:'giraffe',vi:'hươu cao cổ'},{em:'🦓',w:'zebra',vi:'ngựa vằn'}
  ],
  '🌈 Colors':[
    {em:'🔴',w:'red',vi:'màu đỏ'},{em:'🔵',w:'blue',vi:'màu xanh dương'},{em:'🟢',w:'green',vi:'màu xanh lá'},
    {em:'🟡',w:'yellow',vi:'màu vàng'},{em:'🟣',w:'purple',vi:'màu tím'},{em:'🟠',w:'orange',vi:'màu cam'},
    {em:'⚫',w:'black',vi:'màu đen'},{em:'⚪',w:'white',vi:'màu trắng'}
  ],
  '🔢 Numbers':[
    {em:'1️⃣',w:'one',vi:'số một'},{em:'2️⃣',w:'two',vi:'số hai'},{em:'3️⃣',w:'three',vi:'số ba'},
    {em:'4️⃣',w:'four',vi:'số bốn'},{em:'5️⃣',w:'five',vi:'số năm'},{em:'6️⃣',w:'six',vi:'số sáu'},
    {em:'7️⃣',w:'seven',vi:'số bảy'},{em:'8️⃣',w:'eight',vi:'số tám'},
    {em:'9️⃣',w:'nine',vi:'số chín'},{em:'🔟',w:'ten',vi:'số mười'}
  ],
  '🍔 Food':[
    {em:'🍎',w:'apple',vi:'quả táo'},{em:'🍌',w:'banana',vi:'quả chuối'},{em:'🥛',w:'milk',vi:'sữa'},
    {em:'🥚',w:'egg',vi:'quả trứng'},{em:'🍰',w:'cake',vi:'bánh kem'},{em:'🍞',w:'bread',vi:'bánh mì'},
    {em:'🍚',w:'rice',vi:'cơm'},{em:'🍬',w:'candy',vi:'kẹo'},
    {em:'🍊',w:'orange',vi:'quả cam'},{em:'🥭',w:'mango',vi:'quả xoài'},
    {em:'🍉',w:'watermelon',vi:'dưa hấu'},{em:'🍍',w:'pineapple',vi:'quả dứa'},
    {em:'🍅',w:'tomato',vi:'cà chua'},{em:'🍦',w:'ice cream',vi:'kem'},
    {em:'🧃',w:'juice',vi:'nước ép'},{em:'💧',w:'water',vi:'nước'}
  ],
  '👃 Body':[
    {em:'👁️',w:'eye',vi:'mắt'},{em:'👃',w:'nose',vi:'mũi'},{em:'👄',w:'mouth',vi:'miệng'},
    {em:'👂',w:'ear',vi:'tai'},{em:'✋',w:'hand',vi:'bàn tay'},{em:'🦶',w:'foot',vi:'bàn chân'},
    {em:'💪',w:'arm',vi:'cánh tay'},{em:'🦵',w:'leg',vi:'cái chân'}
  ],
  '👨‍👩‍👧 Family':[
    {em:'👩',w:'mom',vi:'mẹ'},{em:'👨',w:'dad',vi:'bố'},{em:'👶',w:'baby',vi:'em bé'},
    {em:'👵',w:'grandma',vi:'bà'},{em:'👴',w:'grandpa',vi:'ông'},
    {em:'👧',w:'sister',vi:'chị gái'},{em:'👦',w:'brother',vi:'anh trai'}
  ],
  '🎒 School':[
    {em:'📖',w:'book',vi:'quyển sách'},{em:'🖊️',w:'pen',vi:'cái bút'},{em:'✏️',w:'pencil',vi:'bút chì'},
    {em:'🎒',w:'bag',vi:'cặp sách'},{em:'📏',w:'ruler',vi:'thước kẻ'},
    {em:'🖍️',w:'crayon',vi:'bút sáp màu'},{em:'🪑',w:'chair',vi:'cái ghế'}
  ],
  '☀️ Weather':[
    {em:'☀️',w:'sun',vi:'mặt trời'},{em:'🌧️',w:'rain',vi:'mưa'},{em:'☁️',w:'cloud',vi:'mây'},
    {em:'❄️',w:'snow',vi:'tuyết'},{em:'🌈',w:'rainbow',vi:'cầu vồng'},
    {em:'⭐',w:'star',vi:'ngôi sao'},{em:'🌙',w:'moon',vi:'mặt trăng'}
  ],
  '🧸 Toys':[
    {em:'🧸',w:'teddy bear',vi:'gấu bông'},{em:'⚽',w:'ball',vi:'quả bóng'},{em:'🎈',w:'balloon',vi:'bóng bay'},
    {em:'🪁',w:'kite',vi:'cánh diều'},{em:'🪆',w:'doll',vi:'búp bê'},{em:'🤖',w:'robot',vi:'người máy'},
    {em:'📦',w:'box',vi:'cái hộp'},{em:'🎸',w:'guitar',vi:'đàn ghi ta'}
  ],
  '👕 Clothes':[
    {em:'👕',w:'shirt',vi:'cái áo'},{em:'👖',w:'pants',vi:'quần dài'},{em:'👗',w:'dress',vi:'cái váy'},
    {em:'👟',w:'shoes',vi:'đôi giày'},{em:'🧦',w:'socks',vi:'đôi tất'},{em:'👒',w:'hat',vi:'cái mũ'},
    {em:'🧥',w:'jacket',vi:'áo khoác'},{em:'🥾',w:'boots',vi:'đôi ủng'}
  ],
  '🚌 Transport':[
    {em:'🚌',w:'bus',vi:'xe buýt'},{em:'🚗',w:'car',vi:'ô tô con'},{em:'🚲',w:'bike',vi:'xe đạp'},
    {em:'✈️',w:'plane',vi:'máy bay'},{em:'⛵',w:'boat',vi:'thuyền buồm'},{em:'🚂',w:'train',vi:'tàu hoả'},
    {em:'🚁',w:'helicopter',vi:'trực thăng'},{em:'🚚',w:'truck',vi:'xe tải'},
    {em:'🛵',w:'motorbike',vi:'xe máy'},{em:'🚢',w:'ship',vi:'tàu thuỷ'}
  ],
  '🏃 Actions':[
    {em:'🏃',w:'run',vi:'chạy'},{em:'🤸',w:'jump',vi:'nhảy'},{em:'🏊',w:'swim',vi:'bơi'},
    {em:'🎤',w:'sing',vi:'hát'},{em:'💃',w:'dance',vi:'nhảy múa'},{em:'😴',w:'sleep',vi:'ngủ'},
    {em:'🍽️',w:'eat',vi:'ăn'},{em:'📖',w:'read',vi:'đọc sách'}
  ],
  '🏠 House':[
    {em:'🛏️',w:'bed',vi:'cái giường'},{em:'🚪',w:'door',vi:'cái cửa'},{em:'🪟',w:'window',vi:'cửa sổ'},
    {em:'📺',w:'TV',vi:'ti vi'},{em:'🛋️',w:'sofa',vi:'ghế sô pha'},{em:'💡',w:'lamp',vi:'cái đèn'},
    {em:'🛁',w:'bath',vi:'bồn tắm'},{em:'☎️',w:'phone',vi:'điện thoại'},
    {em:'☕',w:'cup',vi:'cái cốc'},{em:'🔑',w:'key',vi:'chìa khoá'}
  ],
  '😊 Feelings':[
    {em:'😊',w:'happy',vi:'vui'},{em:'😢',w:'sad',vi:'buồn'},{em:'😠',w:'angry',vi:'tức giận'},
    {em:'🥵',w:'hot',vi:'nóng'},{em:'🥶',w:'cold',vi:'lạnh'},{em:'😋',w:'hungry',vi:'đói bụng'}
  ],
  '⚽ Sports':[
    {em:'⚽',w:'football',vi:'bóng đá'},{em:'🏀',w:'basketball',vi:'bóng rổ'},{em:'🎾',w:'tennis',vi:'quần vợt'},
    {em:'🏸',w:'badminton',vi:'cầu lông'},{em:'⚾',w:'baseball',vi:'bóng chày'},{em:'🏑',w:'hockey',vi:'khúc côn cầu'},
    {em:'🛹',w:'skateboard',vi:'ván trượt'},{em:'🏓',w:'table tennis',vi:'bóng bàn'}
  ],
  '🌿 Nature':[
    {em:'🌳',w:'tree',vi:'cái cây'},{em:'🌼',w:'flower',vi:'bông hoa'},{em:'🌊',w:'sea',vi:'biển'},
    {em:'🏖️',w:'beach',vi:'bãi biển'},{em:'🐚',w:'shell',vi:'vỏ sò'},{em:'⛰️',w:'mountain',vi:'ngọn núi'},
    {em:'🍃',w:'leaf',vi:'chiếc lá'},{em:'🌷',w:'garden',vi:'khu vườn'}
  ]
};


const SONGS = [
  {em:'🔤', title:'ABC Song', vi:'Bài hát bảng chữ cái', bpm:100, lines:[
    {t:'A B C D E F G', n:[[60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2]]},
    {t:'H I J K L M N O P', n:[[65,1],[65,1],[64,1],[64,1],[62,.5],[62,.5],[62,.5],[62,.5],[60,2]]},
    {t:'Q R S — T U V', n:[[67,1],[67,1],[65,2],[64,1],[64,1],[62,2]]},
    {t:'W — X — Y and Z', n:[[67,1],[67,1],[65,2],[64,1],[64,1],[62,2]]},
    {t:'Now I know my A B C', n:[[60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2]]},
    {t:'Next time won’t you sing with me', n:[[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2]]}
  ]},
  {em:'⭐', title:'Twinkle Twinkle Little Star', vi:'Ngôi sao nhỏ lấp lánh', bpm:96, lines:[
    {t:'Twinkle, twinkle, little star', n:[[60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2]]},
    {t:'How I wonder what you are', n:[[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2]]},
    {t:'Up above the world so high', n:[[67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2]]},
    {t:'Like a diamond in the sky', n:[[67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2]]},
    {t:'Twinkle, twinkle, little star', n:[[60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2]]},
    {t:'How I wonder what you are', n:[[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2]]}
  ]},
  {em:'🐑', title:'Mary Had a Little Lamb', vi:'Mary có chú cừu nhỏ', bpm:108, lines:[
    {t:'Mary had a little lamb', n:[[64,1],[62,1],[60,1],[62,1],[64,1],[64,1],[64,2]]},
    {t:'Little lamb, little lamb', n:[[62,1],[62,1],[62,2],[64,1],[67,1],[67,2]]},
    {t:'Mary had a little lamb', n:[[64,1],[62,1],[60,1],[62,1],[64,1],[64,1],[64,1]]},
    {t:'Its fleece was white as snow', n:[[64,1],[62,1],[62,1],[64,1],[62,1],[60,3]]}
  ]},
  {em:'🐏', title:'Baa Baa Black Sheep', vi:'Chú cừu đen', bpm:100, lines:[
    {t:'Baa, baa, black sheep, have you any wool?', n:[[60,1],[60,1],[67,1],[67,1],[69,.5],[69,.5],[69,.5],[69,.5],[67,2]]},
    {t:'Yes sir, yes sir, three bags full', n:[[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2]]},
    {t:'One for the master, one for the dame', n:[[67,.5],[67,.5],[67,1],[65,1],[64,.5],[64,.5],[64,1],[62,2]]},
    {t:'One for the little boy who lives down the lane', n:[[67,.5],[67,.5],[67,.5],[67,.5],[65,1],[64,.5],[64,.5],[64,.5],[64,.5],[62,1],[60,2]]}
  ]},
  {em:'🐮', title:'Old MacDonald Had a Farm', vi:'Bác nông dân MacDonald', bpm:112, lines:[
    {t:'Old MacDonald had a farm', n:[[60,1],[60,1],[60,1],[55,1],[57,1],[57,1],[55,2]]},
    {t:'E-I-E-I-O', n:[[64,1],[64,1],[62,1],[62,1],[60,2]]},
    {t:'And on his farm he had a cow', n:[[55,.5],[60,1],[60,1],[60,1],[55,1],[57,1],[57,1],[55,2]]},
    {t:'E-I-E-I-O', n:[[64,1],[64,1],[62,1],[62,1],[60,2]]}
  ]},
  {em:'🌧️', title:'Rain, Rain, Go Away', vi:'Mưa ơi, đi chỗ khác', bpm:96, lines:[
    {t:'Rain, rain, go away', n:[[67,1],[67,1],[64,1.5],[69,1],[64,1.5]]},
    {t:'Come again another day', n:[[67,.5],[67,.5],[67,1],[64,1],[69,1],[67,1],[64,1.5]]},
    {t:'Little Johnny wants to play', n:[[67,.5],[67,.5],[67,1],[64,1],[69,1],[67,1],[64,1.5]]},
    {t:'Rain, rain, go away', n:[[67,1],[67,1],[64,1.5],[69,1],[67,1],[64,1.5]]}
  ]},
  {em:'🚣', title:'Row, Row, Row Your Boat', vi:'Chèo thuyền nào', bpm:88, lines:[
    {t:'Row, row, row your boat', n:[[60,1.5],[60,1.5],[60,1],[62,.5],[64,1.5]]},
    {t:'Gently down the stream', n:[[64,1],[62,.5],[64,1],[65,.5],[67,3]]},
    {t:'Merrily, merrily, merrily, merrily', n:[[72,.5],[72,.5],[72,.5],[67,.5],[67,.5],[67,.5],[64,.5],[64,.5],[64,.5],[60,.5],[60,.5],[60,.5]]},
    {t:'Life is but a dream', n:[[67,1],[65,.5],[64,1],[62,.5],[60,3]]}
  ]},
  {em:'🌉', title:'London Bridge Is Falling Down', vi:'Cầu Luân Đôn sắp đổ rồi', bpm:104, lines:[
    {t:'London Bridge is falling down', n:[[67,1.5],[69,.5],[67,1],[65,1],[64,1],[65,1],[67,2]]},
    {t:'Falling down, falling down', n:[[62,1],[64,1],[65,2],[64,1],[65,1],[67,2]]},
    {t:'London Bridge is falling down', n:[[67,1.5],[69,.5],[67,1],[65,1],[64,1],[65,1],[67,2]]},
    {t:'My fair lady', n:[[62,1],[67,1],[64,1],[60,2]]}
  ]},
  {em:'😄', title:'If You’re Happy and You Know It', vi:'Nếu bé vui hãy vỗ tay', bpm:112, lines:[
    {t:'If you’re happy and you know it, clap your hands!', n:[[60,.5],[60,.5],[65,.5],[65,.5],[65,.5],[65,.5],[65,.5],[65,.5],[64,.5],[65,.5],[67,2]]},
    {t:'If you’re happy and you know it, clap your hands!', n:[[62,.5],[62,.5],[67,.5],[67,.5],[67,.5],[67,.5],[67,.5],[67,.5],[65,.5],[67,.5],[69,2]]},
    {t:'If you’re happy and you know it, then your face will surely show it', n:[[69,.5],[69,.5],[70,.5],[70,.5],[70,.5],[70,.5],[70,.5],[70,.5],[69,.5],[67,.5],[65,.5],[65,.5],[65,.5],[65,.5],[64,.5],[65,.5],[67,1.5]]},
    {t:'If you’re happy and you know it, clap your hands!', n:[[67,.5],[67,.5],[65,.5],[65,.5],[65,.5],[65,.5],[64,.5],[65,.5],[64,.5],[62,.5],[60,2]]}
  ]},
  {em:'🙆', title:'Head, Shoulders, Knees and Toes', vi:'Đầu, vai, đầu gối, ngón chân', bpm:108, lines:[
    {t:'Head, shoulders, knees and toes, knees and toes', n:[[60,1],[64,1],[67,.5],[67,.5],[67,1],[67,.5],[67,.5],[67,.5],[67,1]]},
    {t:'Head, shoulders, knees and toes, knees and toes', n:[[62,1],[65,1],[69,.5],[69,.5],[69,1],[69,.5],[69,.5],[69,.5],[69,1]]},
    {t:'And eyes and ears and mouth and nose', n:[[64,.5],[65,.5],[67,1],[65,.5],[64,.5],[62,1],[64,.5],[62,.5],[60,2]]},
    {t:'Head, shoulders, knees and toes, knees and toes', n:[[60,1],[64,1],[67,.5],[67,.5],[67,1],[67,.5],[67,.5],[67,1]]}
  ]},
  {em:'🕷️', title:'Itsy Bitsy Spider', vi:'Chú nhện tí hon', bpm:96, lines:[
    {t:'The itsy bitsy spider climbed up the water spout', n:[[67,.5],[60,.5],[60,.5],[60,.5],[62,.5],[64,.5],[64,.5],[64,.5],[62,.5],[60,.5],[62,.5],[64,.5],[60,1]]},
    {t:'Down came the rain and washed the spider out', n:[[64,.5],[64,.5],[65,.5],[67,1],[67,.5],[65,.5],[64,.5],[65,.5],[67,.5],[64,1]]},
    {t:'Out came the sun and dried up all the rain', n:[[60,.5],[60,.5],[62,.5],[64,1],[64,.5],[62,.5],[60,.5],[62,.5],[64,.5],[60,1]]},
    {t:'And the itsy bitsy spider climbed up the spout again', n:[[67,.5],[67,.5],[60,.5],[60,.5],[60,.5],[62,.5],[64,.5],[64,.5],[62,.5],[60,.5],[62,.5],[64,.5],[60,1.5]]}
  ]},
  {em:'🎂', title:'Happy Birthday', vi:'Chúc mừng sinh nhật', bpm:100, lines:[
    {t:'Happy birthday to you', n:[[60,.75],[60,.25],[62,1],[60,1],[65,1],[64,2]]},
    {t:'Happy birthday to you', n:[[60,.75],[60,.25],[62,1],[60,1],[67,1],[65,2]]},
    {t:'Happy birthday dear friend', n:[[60,.75],[60,.25],[72,1],[69,1],[65,1],[64,1],[62,2]]},
    {t:'Happy birthday to you', n:[[70,.75],[70,.25],[69,1],[65,1],[67,1],[65,2]]}
  ]},
  /* 4 bài dân ca/đồng dao Việt Nam (public domain — không tác giả bản quyền), lang:'vi-VN' để đọc lời bằng giọng Việt */
  {em:"🎋", title:"Bắc Kim Thang", vi:"Bài đồng dao Nam Bộ", bpm:104, lang:'vi-VN', lines:[
    {t:"Bắc kim thang cà lang bí rợ", n:[[67,1],[67,1],[67,1],[64,0.5],[64,0.5],[67,1],[69,1],[67,2]]},
    {t:"Cột qua kèo là kèo qua cột", n:[[69,1],[67,1],[64,1],[62,0.5],[64,0.5],[62,1],[60,1],[62,2]]},
    {t:"Chú bán dầu qua cầu mà té", n:[[67,1],[67,1],[69,1],[72,0.5],[69,0.5],[67,1],[64,1],[62,2]]},
    {t:"Chú bán ếch ở lại làm chi", n:[[62,1],[64,1],[62,1],[60,0.5],[62,0.5],[60,1],[57,1],[60,2]]},
    {t:"Con le le đánh trống thổi kèn", n:[[67,1],[67,0.5],[67,0.5],[69,1],[67,1],[64,1],[62,1],[64,2]]},
    {t:"Con bìm bịp thổi tò tí te tò te", n:[[64,0.5],[64,0.5],[64,1],[62,0.5],[62,0.5],[60,1],[62,0.5],[60,0.5],[57,3]]}
  ]},
  {em:"🕊️", title:"Cò Lả", vi:"Cánh cò bay lả bay la", bpm:92, lang:'vi-VN', lines:[
    {t:"Con cò cò bay lả lả bay la", n:[[69,1],[67,1],[69,1],[72,0.5],[69,0.5],[67,1],[65,1],[67,2]]},
    {t:"Bay từ cửa phủ bay ra cánh đồng", n:[[67,0.5],[69,0.5],[67,1],[65,1],[62,1],[65,1],[62,1],[60,2]]},
    {t:"Tình tính tang là tang tính tình", n:[[60,1],[62,1],[65,1],[65,0.5],[67,0.5],[65,1],[62,2]]},
    {t:"Ơi bạn rằng, ơi bạn ơi", n:[[67,1],[69,1],[67,1],[65,1],[62,1],[60,2]]},
    {t:"Rằng có biết biết hay chăng", n:[[62,1],[65,1],[65,0.5],[67,0.5],[65,1],[62,2]]},
    {t:"Rằng có nhớ nhớ hay chăng", n:[[62,1],[65,1],[62,0.5],[62,0.5],[60,1],[60,2]]}
  ]},
  {em:"🌳", title:"Lý Cây Xanh", vi:"Chim hót líu lo trên cành", bpm:108, lang:'vi-VN', lines:[
    {t:"Cái cây xanh xanh, thì lá cũng xanh", n:[[67,1],[67,1],[69,1],[67,1],[67,0.5],[69,0.5],[72,1],[67,2]]},
    {t:"Chim đậu trên cành, chim hót líu lo", n:[[67,1],[69,1],[67,1],[64,1],[67,0.5],[67,0.5],[64,1],[62,2]]},
    {t:"Líu lo là líu lo", n:[[64,0.5],[62,0.5],[64,1],[62,1],[60,2]]},
    {t:"Líu lo là líu lo", n:[[64,0.5],[62,0.5],[64,1],[62,1],[60,2]]}
  ]},
  {em:"🥁", title:"Trống Cơm", vi:"Tiếng trống cơm rộn ràng", bpm:112, lang:'vi-VN', lines:[
    {t:"Tình bằng có cái trống cơm", n:[[64,1],[67,1],[67,1],[69,1],[67,1],[64,2]]},
    {t:"Khen ai khéo vỗ ố mấy bông mà nên bông", n:[[67,0.5],[69,0.5],[72,1],[69,0.5],[67,0.5],[69,0.5],[67,0.5],[64,1],[62,1],[64,2]]},
    {t:"Một bầy tang tình con xít", n:[[62,0.5],[62,0.5],[64,1],[62,1],[60,1],[57,2]]},
    {t:"Ố mấy lội, lội, lội sông", n:[[60,0.5],[62,0.5],[64,1],[64,1],[62,1],[60,2]]},
    {t:"Ố mấy đi tìm, em nhớ thương ai", n:[[64,0.5],[64,0.5],[67,1],[69,1],[67,0.5],[64,0.5],[62,1],[60,2]]},
    {t:"Con mắt ố mấy lim dim", n:[[62,1],[64,1],[62,0.5],[62,0.5],[60,1],[57,2]]}
  ]}
];

const PICS = [
`<svg viewBox="0 0 400 300">
  <path class="region" d="M270 150 L355 100 L355 200 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="175" cy="150" rx="105" ry="62" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M150 92 Q182 35 220 94 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M160 205 Q185 250 215 203 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="58" cy="85" r="12" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="45" cy="48" r="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle cx="108" cy="135" r="10" fill="#333"/>
  <path d="M75 165 Q85 175 95 165" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <circle class="region" cx="345" cy="52" r="30" fill="#fff" stroke="#333" stroke-width="4"/>
  <polygon class="region" points="55,140 195,35 335,140" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="85" y="140" width="220" height="125" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="165" y="190" width="60" height="75" rx="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="105" y="160" width="42" height="42" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="245" y="160" width="42" height="42" fill="#fff" stroke="#333" stroke-width="4"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <ellipse class="region" cx="130" cy="105" rx="62" ry="45" transform="rotate(-25 130 105)" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="270" cy="105" rx="62" ry="45" transform="rotate(25 270 105)" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="140" cy="195" rx="48" ry="36" transform="rotate(20 140 195)" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="260" cy="195" rx="48" ry="36" transform="rotate(-20 260 195)" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="200" cy="155" rx="16" ry="62" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle cx="193" cy="102" r="4" fill="#333"/><circle cx="207" cy="102" r="4" fill="#333"/>
  <path d="M192 90 Q180 60 168 55" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round"/>
  <path d="M208 90 Q220 60 232 55" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <rect class="region" x="194" y="150" width="12" height="110" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="160" cy="220" rx="35" ry="16" transform="rotate(-30 160 220)" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="240" cy="220" rx="35" ry="16" transform="rotate(30 240 220)" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="200" cy="70" rx="26" ry="40" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="253" cy="100" rx="26" ry="40" transform="rotate(60 253 100)" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="233" cy="160" rx="26" ry="40" transform="rotate(120 233 160)" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="167" cy="160" rx="26" ry="40" transform="rotate(-120 167 160)" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="147" cy="100" rx="26" ry="40" transform="rotate(-60 147 100)" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="200" cy="120" r="28" fill="#fff" stroke="#333" stroke-width="4"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <path class="region" d="M120 145 L150 90 H250 L280 145 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="60" y="145" width="280" height="65" rx="18" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="165" y="102" width="70" height="43" rx="6" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="125" cy="215" r="30" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="275" cy="215" r="30" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle cx="125" cy="215" r="11" fill="#333"/><circle cx="275" cy="215" r="11" fill="#333"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <path class="region" d="M200 25 Q245 85 245 175 H155 Q155 85 200 25 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M155 150 L110 220 L155 205 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M245 150 L290 220 L245 205 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M175 178 Q200 250 225 178 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="200" cy="115" r="20" fill="#fff" stroke="#333" stroke-width="4"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <path class="region" d="M115 195 Q55 185 30 140 L55 205 Q85 220 118 215 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="200" cy="195" rx="85" ry="48" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M255 175 Q285 90 305 62 L335 82 Q310 105 288 185 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <ellipse class="region" cx="325" cy="68" rx="26" ry="17" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="155" y="228" width="22" height="42" rx="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="225" y="228" width="22" height="42" rx="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle cx="332" cy="64" r="4" fill="#333"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <path class="region" d="M135 105 L120 35 L180 80 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M265 105 L280 35 L220 80 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="200" cy="150" r="75" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M200 240 L160 220 L160 260 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M200 240 L240 220 L240 260 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle cx="175" cy="140" r="7" fill="#333"/><circle cx="225" cy="140" r="7" fill="#333"/>
  <path d="M192 168 L200 176 L208 168" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round"/>
  <path d="M120 155 L75 148 M120 170 L78 175 M280 155 L325 148 M280 170 L322 175" stroke="#333" stroke-width="3" stroke-linecap="round"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <circle class="region" cx="135" cy="145" r="48" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="265" cy="145" r="48" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="200" cy="105" r="70" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="183" y="185" width="34" height="85" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="170" cy="110" r="13" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="230" cy="130" r="13" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="200" cy="70" r="13" fill="#fff" stroke="#333" stroke-width="4"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <path class="region" d="M162 165 L200 275 L238 165 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="168" cy="135" r="34" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="232" cy="135" r="34" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="200" cy="92" r="38" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="200" cy="48" r="11" fill="#fff" stroke="#333" stroke-width="4"/>
  <path d="M178 190 L210 200 M188 220 L212 228" stroke="#333" stroke-width="3" stroke-linecap="round"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <circle class="region" cx="200" cy="32" r="9" fill="#fff" stroke="#333" stroke-width="4"/>
  <path d="M200 41 L200 58" stroke="#333" stroke-width="4"/>
  <rect class="region" x="158" y="58" width="84" height="58" rx="10" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="182" cy="86" r="9" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="218" cy="86" r="9" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="140" y="128" width="120" height="92" rx="12" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="98" y="138" width="38" height="20" rx="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="264" y="138" width="38" height="20" rx="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="172" cy="162" r="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="200" cy="162" r="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="228" cy="162" r="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="163" y="222" width="26" height="44" rx="8" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="211" y="222" width="26" height="44" rx="8" fill="#fff" stroke="#333" stroke-width="4"/>
</svg>`,
`<svg viewBox="0 0 400 300">
  <rect class="region" x="82" y="95" width="54" height="150" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="264" y="95" width="54" height="150" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M76 95 L109 40 L142 95 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M258 95 L291 40 L324 95 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <rect class="region" x="136" y="150" width="128" height="95" fill="#fff" stroke="#333" stroke-width="4"/>
  <path class="region" d="M176 245 L176 200 Q200 178 224 200 L224 245 Z" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="109" cy="130" r="10" fill="#fff" stroke="#333" stroke-width="4"/>
  <circle class="region" cx="291" cy="130" r="10" fill="#fff" stroke="#333" stroke-width="4"/>
  <path d="M109 40 L109 16" stroke="#333" stroke-width="4"/>
  <path class="region" d="M109 16 L139 24 L109 32 Z" fill="#fff" stroke="#333" stroke-width="4"/>
</svg>`,
`<svg viewBox="0 0 400 300"><ellipse cx="200" cy="282" rx="185" ry="12" fill="#fff" stroke="#333" stroke-width="4"/><path d="M266 206 Q312 198 320 162 L336 170 Q330 214 270 222 Z" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="328" cy="158" rx="14" ry="18" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="200" cy="215" rx="75" ry="55" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="168" cy="256" rx="22" ry="15" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="232" cy="256" rx="22" ry="15" fill="#fff" stroke="#333" stroke-width="4"/><path d="M238 101 Q276 99 290 118 Q276 137 238 135 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M239 133 Q267 158 264 182 Q240 185 215 157 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M217 156 Q219 194 200 208 Q181 194 183 156 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M185 157 Q160 185 136 182 Q133 158 161 133 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M162 135 Q124 137 110 118 Q124 99 162 101 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M161 103 Q133 78 136 54 Q160 51 185 79 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M183 80 Q181 42 200 28 Q219 42 217 80 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M215 79 Q240 51 264 54 Q267 78 239 103 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="168" cy="72" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="232" cy="72" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="200" cy="120" r="52" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="200" cy="140" rx="26" ry="19" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="182" cy="106" r="6" fill="#333" stroke="#333" stroke-width="3"/><circle cx="218" cy="106" r="6" fill="#333" stroke="#333" stroke-width="3"/><polygon points="191,131 209,131 200,143" fill="#333" stroke="#333" stroke-width="3"/></svg>`,
`<svg viewBox="0 0 400 300"><circle cx="46" cy="46" r="24" fill="#fff" stroke="#333" stroke-width="4"/><rect x="12" y="252" width="376" height="16" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="332" cy="78" rx="18" ry="14" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="356" cy="44" rx="14" ry="11" fill="#fff" stroke="#333" stroke-width="4"/><rect x="300" y="124" width="26" height="48" fill="#fff" stroke="#333" stroke-width="4"/><rect x="291" y="106" width="44" height="22" rx="6" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="255" cy="160" rx="15" ry="12" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="320,212 372,254 320,254" fill="#fff" stroke="#333" stroke-width="4"/><rect x="215" y="168" width="110" height="58" rx="12" fill="#fff" stroke="#333" stroke-width="4"/><rect x="142" y="108" width="86" height="26" rx="8" fill="#fff" stroke="#333" stroke-width="4"/><rect x="150" y="128" width="70" height="98" rx="8" fill="#fff" stroke="#333" stroke-width="4"/><rect x="162" y="142" width="46" height="36" rx="6" fill="#fff" stroke="#333" stroke-width="4"/><rect x="28" y="178" width="110" height="50" rx="8" fill="#fff" stroke="#333" stroke-width="4"/><rect x="40" y="188" width="86" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="58" cy="240" r="18" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="108" cy="240" r="18" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="58" cy="240" r="7" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="108" cy="240" r="7" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="245" cy="240" r="22" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="305" cy="240" r="22" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="245" cy="240" r="8" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="305" cy="240" r="8" fill="#fff" stroke="#333" stroke-width="3"/></svg>`,
`<svg viewBox="0 0 400 300"><ellipse cx="200" cy="284" rx="150" ry="12" fill="#fff" stroke="#333" stroke-width="4"/><path d="M241 203 L313 145 Q360 148 339 189 L252 223 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M222 190 L265 107 Q309 90 306 137 L241 203 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M200 185 L205 92 Q238 59 255 103 L222 190 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M200 185 L195 92 Q162 59 145 103 L178 190 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M178 190 L135 107 Q91 90 94 137 L159 203 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M159 203 L87 145 Q40 148 61 189 L148 223 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="304" cy="180" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="271" cy="143" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="225" cy="123" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="175" cy="123" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="129" cy="143" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="96" cy="180" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="304" cy="180" r="4" fill="#333" stroke="#333" stroke-width="3"/><circle cx="271" cy="143" r="4" fill="#333" stroke="#333" stroke-width="3"/><circle cx="225" cy="123" r="4" fill="#333" stroke="#333" stroke-width="3"/><circle cx="175" cy="123" r="4" fill="#333" stroke="#333" stroke-width="3"/><circle cx="129" cy="143" r="4" fill="#333" stroke="#333" stroke-width="3"/><circle cx="96" cy="180" r="4" fill="#333" stroke="#333" stroke-width="3"/><polygon points="182,266 172,292 194,292" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="218,266 228,292 206,292" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="200" cy="226" rx="36" ry="50" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="200" cy="238" rx="20" ry="32" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="200" cy="158" r="22" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="193" cy="153" r="4" fill="#333" stroke="#333" stroke-width="3"/><circle cx="207" cy="153" r="4" fill="#333" stroke="#333" stroke-width="3"/><polygon points="193,164 207,164 200,176" fill="#333" stroke="#333" stroke-width="3"/><circle cx="189" cy="133" r="4" fill="#333" stroke="#333" stroke-width="3"/><circle cx="200" cy="130" r="4" fill="#333" stroke="#333" stroke-width="3"/><circle cx="211" cy="133" r="4" fill="#333" stroke="#333" stroke-width="3"/></svg>`,
`<svg viewBox="0 0 400 300"><circle cx="352" cy="46" r="25" fill="#fff" stroke="#333" stroke-width="4"/><path d="M198 192 Q152 172 130 192 Q152 218 198 206 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M202 198 Q248 178 270 198 Q248 224 202 212 Z" fill="#fff" stroke="#333" stroke-width="4"/><rect x="189" y="148" width="22" height="84" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="155,232 245,232 232,292 168,292" fill="#fff" stroke="#333" stroke-width="4"/><rect x="150" y="222" width="100" height="22" rx="4" fill="#fff" stroke="#333" stroke-width="4"/><path d="M233 111 Q279 106 292 120 Q279 134 233 129 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M232 132 Q272 155 274 174 Q256 178 221 147 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M219 148 Q238 191 228 208 Q211 199 201 154 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M181 148 Q162 191 172 208 Q189 199 199 154 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M168 132 Q128 155 126 174 Q144 178 179 147 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M167 111 Q121 106 108 120 Q121 134 167 129 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M179 93 Q144 62 126 66 Q128 85 168 108 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M199 86 Q189 41 172 32 Q162 49 181 92 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M201 86 Q211 41 228 32 Q238 49 219 92 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M221 93 Q256 62 274 66 Q272 85 232 108 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="200" cy="120" r="38" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="200" cy="120" r="17" fill="#fff" stroke="#333" stroke-width="4"/></svg>`,
`<svg viewBox="0 0 400 300"><polygon points="83,57 114,64 83,72" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="82,72 99,99 72,82" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="72,83 64,114 57,83" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="56,82 29,99 46,72" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="46,57 14,64 46,72" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="46,56 29,29 56,46" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="57,46 64,14 72,46" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="72,46 99,29 82,56" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="64" cy="64" r="22" fill="#fff" stroke="#333" stroke-width="4"/><path d="M258 58 Q250 38 270 34 Q274 18 296 22 Q312 10 324 24 Q342 24 340 42 Q350 56 332 58 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M144 52 Q138 36 154 32 Q158 18 176 22 Q190 12 198 26 Q212 28 208 44 Q214 52 198 54 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M158 176 Q126 158 112 130 Q136 136 152 152 Q150 122 160 102 Q174 128 170 158 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M238 82 Q244 46 272 38 Q266 62 258 80 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M148 158 Q175 78 255 76 Q330 76 347 132 L354 146 Q340 150 328 138 Q300 116 258 120 Q200 126 178 172 Q170 186 158 196 Q146 180 148 158 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M226 114 Q246 148 236 174 Q214 150 220 112 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="318" cy="112" r="5" fill="#333" stroke="#333" stroke-width="3"/><ellipse cx="82" cy="270" rx="70" ry="24" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="318" cy="270" rx="70" ry="24" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="200" cy="276" rx="78" ry="18" fill="#fff" stroke="#333" stroke-width="4"/></svg>`,
`<svg viewBox="0 0 400 300"><path d="M344 22 Q310 30 310 66 Q310 102 344 110 Q276 108 276 66 Q276 24 344 22 Z" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="60,26 67,43 84,50 67,57 60,74 53,57 36,50 53,43" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="80,104 88,122 106,130 88,138 80,156 72,138 54,130 72,122" fill="#fff" stroke="#333" stroke-width="3"/><rect x="12" y="244" width="376" height="24" rx="10" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="142,102 154,50 184,84" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="258,102 246,50 216,84" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="200" cy="165" rx="78" ry="92" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="128" cy="178" rx="25" ry="54" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="272" cy="178" rx="25" ry="54" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="200" cy="210" rx="44" ry="42" fill="#fff" stroke="#333" stroke-width="4"/><path d="M160 197 Q179 176 198 197 Z" fill="#fff" stroke="#333" stroke-width="3"/><path d="M202 197 Q221 176 240 197 Z" fill="#fff" stroke="#333" stroke-width="3"/><path d="M160 224 Q179 203 198 224 Z" fill="#fff" stroke="#333" stroke-width="3"/><path d="M202 224 Q221 203 240 224 Z" fill="#fff" stroke="#333" stroke-width="3"/><path d="M180 248 Q200 227 220 248 Z" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="168" cy="122" r="30" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="232" cy="122" r="30" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="168" cy="122" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="232" cy="122" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="168" cy="122" r="7" fill="#333" stroke="#333" stroke-width="3"/><circle cx="232" cy="122" r="7" fill="#333" stroke="#333" stroke-width="3"/><polygon points="200,144 187,158 200,176 213,158" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="172" cy="252" rx="15" ry="10" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="228" cy="252" rx="15" ry="10" fill="#fff" stroke="#333" stroke-width="4"/></svg>`,
`<svg viewBox="0 0 400 300"><circle cx="46" cy="46" r="24" fill="#fff" stroke="#333" stroke-width="4"/><path d="M118 64 Q110 46 130 42 Q134 26 156 30 Q170 18 184 32 Q202 32 200 50 Q210 62 192 66 Z" fill="#fff" stroke="#333" stroke-width="4"/><rect x="10" y="262" width="380" height="26" fill="#fff" stroke="#333" stroke-width="4"/><rect x="130" y="128" width="168" height="36" fill="#fff" stroke="#333" stroke-width="4"/><rect x="158" y="128" width="24" height="36" fill="#fff" stroke="#333" stroke-width="4"/><rect x="204" y="128" width="24" height="36" fill="#fff" stroke="#333" stroke-width="4"/><rect x="250" y="128" width="24" height="36" fill="#fff" stroke="#333" stroke-width="4"/><rect x="120" y="160" width="210" height="76" rx="8" fill="#fff" stroke="#333" stroke-width="4"/><rect x="128" y="198" width="160" height="22" rx="4" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="248" cy="180" r="13" fill="#fff" stroke="#333" stroke-width="4"/><rect x="306" y="104" width="48" height="32" rx="8" fill="#fff" stroke="#333" stroke-width="4"/><rect x="290" y="132" width="80" height="104" rx="10" fill="#fff" stroke="#333" stroke-width="4"/><rect x="304" y="146" width="52" height="40" rx="6" fill="#fff" stroke="#333" stroke-width="4"/><rect x="358" y="214" width="28" height="24" rx="4" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="170" cy="242" r="26" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="322" cy="242" r="26" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="170" cy="242" r="10" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="322" cy="242" r="10" fill="#fff" stroke="#333" stroke-width="4"/></svg>`,
`<svg viewBox="0 0 400 300"><circle cx="48" cy="46" r="22" fill="#fff" stroke="#333" stroke-width="4"/><path d="M25 260 A175 175 0 0 1 375 260 L350 260 A150 150 0 0 0 50 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M50 260 A150 150 0 0 1 350 260 L325 260 A125 125 0 0 0 75 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M75 260 A125 125 0 0 1 325 260 L300 260 A100 100 0 0 0 100 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M100 260 A100 100 0 0 1 300 260 L275 260 A75 75 0 0 0 125 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M125 260 A75 75 0 0 1 275 260 L250 260 A50 50 0 0 0 150 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M150 58 Q162 44 172 56 Q182 44 194 58 Q182 52 172 60 Q162 52 150 58 Z" fill="#333" stroke="#333" stroke-width="3"/><path d="M240 76 Q252 62 262 74 Q272 62 284 76 Q272 70 262 78 Q252 70 240 76 Z" fill="#333" stroke="#333" stroke-width="3"/><path d="M18 280 Q10 254 30 246 Q36 224 62 230 Q80 216 100 230 Q126 222 132 244 Q158 246 152 268 Q158 282 138 284 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M382 280 Q390 254 370 246 Q364 224 338 230 Q320 216 300 230 Q274 222 268 244 Q242 246 248 268 Q242 282 262 284 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="174" cy="248" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="190" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="174" cy="280" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="158" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="174" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="226" cy="248" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="242" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="226" cy="280" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="210" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="226" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/></svg>`,
`<svg viewBox="0 0 400 300"><ellipse cx="200" cy="282" rx="185" ry="10" fill="#fff" stroke="#333" stroke-width="4"/><path d="M322 150 Q352 165 348 200 Q346 214 334 208 Q342 182 316 166 Z" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="235" cy="180" rx="95" ry="68" fill="#fff" stroke="#333" stroke-width="4"/><rect x="185" y="220" width="28" height="52" rx="9" fill="#fff" stroke="#333" stroke-width="4"/><rect x="262" y="220" width="28" height="52" rx="9" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="158" cy="128" rx="38" ry="48" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="162" cy="130" rx="22" ry="30" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="112" cy="132" r="55" fill="#fff" stroke="#333" stroke-width="4"/><path d="M78 170 Q52 205 68 245 Q74 258 88 250 Q76 218 100 182 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="98" cy="120" r="6" fill="#333"/><path d="M85 150 Q95 160 107 152" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/><circle cx="345" cy="248" r="26" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="345,232 350,243 362,243 353,251 356,263 345,256 334,263 337,251 328,243 340,243" fill="#fff" stroke="#333" stroke-width="3"/></svg>`,
`<svg viewBox="0 0 400 300"><ellipse cx="200" cy="282" rx="185" ry="10" fill="#fff" stroke="#333" stroke-width="4"/><rect x="52" y="185" width="20" height="85" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="62" cy="150" r="42" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="34" cy="178" r="26" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="92" cy="178" r="26" fill="#fff" stroke="#333" stroke-width="4"/><path d="M330 190 Q352 210 346 238 Q344 250 333 244 Q340 222 322 202 Z" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="255" cy="210" rx="78" ry="48" fill="#fff" stroke="#333" stroke-width="4"/><rect x="205" y="240" width="16" height="42" fill="#fff" stroke="#333" stroke-width="4"/><rect x="238" y="240" width="16" height="42" fill="#fff" stroke="#333" stroke-width="4"/><rect x="276" y="240" width="16" height="42" fill="#fff" stroke="#333" stroke-width="4"/><rect x="306" y="240" width="16" height="42" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="190,215 155,85 192,78 222,210" fill="#fff" stroke="#333" stroke-width="4"/><path d="M158 45 L152 26 M176 42 L178 22" fill="none" stroke="#333" stroke-width="3"/><circle cx="151" cy="22" r="6" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="179" cy="16" r="6" fill="#fff" stroke="#333" stroke-width="3"/><ellipse cx="196" cy="52" rx="13" ry="8" transform="rotate(-30 196 52)" fill="#fff" stroke="#333" stroke-width="3"/><ellipse cx="168" cy="68" rx="34" ry="25" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="150" cy="62" r="5" fill="#333"/><circle cx="140" cy="76" r="3" fill="#333"/><circle cx="185" cy="120" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="175" cy="160" r="8" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="200" cy="188" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="250" cy="200" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="285" cy="225" r="10" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="230" cy="230" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="295" cy="188" r="8" fill="#fff" stroke="#333" stroke-width="3"/></svg>`,
`<svg viewBox="0 0 400 300"><ellipse cx="200" cy="282" rx="185" ry="10" fill="#fff" stroke="#333" stroke-width="4"/><path d="M55 250 Q52 220 60 200" fill="none" stroke="#333" stroke-width="4"/><ellipse cx="42" cy="232" rx="13" ry="6" transform="rotate(-35 42 232)" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="60" cy="176" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="74" cy="188" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="68" cy="204" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="50" cy="204" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="46" cy="188" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="60" cy="192" r="8" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="108,200 82,214 110,216" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="150" cy="232" rx="30" ry="13" transform="rotate(25 150 232)" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="255" cy="232" rx="30" ry="13" transform="rotate(-25 255 232)" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="330" cy="178" r="25" fill="#fff" stroke="#333" stroke-width="4"/><path d="M108 195 Q108 88 200 88 Q292 88 292 195 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M100 195 L300 195 L288 218 L112 218 Z" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="172,118 228,118 244,152 228,186 172,186 156,152" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="136" cy="145" r="13" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="264" cy="145" r="13" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="200" cy="103" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="337" cy="170" r="5" fill="#333"/><path d="M325 190 Q334 197 343 189" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/></svg>`,
`<svg viewBox="0 0 400 300"><circle cx="48" cy="46" r="22" fill="#fff" stroke="#333" stroke-width="4"/><path d="M48 14 L48 4 M80 46 L90 46 M25 23 L18 16 M71 23 L78 16" fill="none" stroke="#333" stroke-width="3"/><rect x="10" y="250" width="380" height="38" rx="10" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="90,246 96,260 110,262 100,271 103,285 90,277 77,285 80,271 70,262 84,260" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="310" cy="266" r="16" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="310" cy="266" r="7" fill="#fff" stroke="#333" stroke-width="3"/><ellipse cx="122" cy="128" rx="38" ry="12" transform="rotate(-40 122 128)" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="278" cy="128" rx="38" ry="12" transform="rotate(40 278 128)" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="80" cy="92" r="25" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="80,92 48,76 54,106" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="320" cy="92" r="25" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="320,92 352,76 346,106" fill="#fff" stroke="#333" stroke-width="3"/><path d="M140 210 Q120 235 100 242 M160 218 Q150 242 135 252 M260 210 Q280 235 300 242 M240 218 Q250 242 265 252" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round"/><ellipse cx="200" cy="175" rx="72" ry="48" fill="#fff" stroke="#333" stroke-width="4"/><path d="M175 130 L168 102 M225 130 L232 102" fill="none" stroke="#333" stroke-width="4"/><circle cx="168" cy="95" r="11" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="232" cy="95" r="11" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="168" cy="97" r="4" fill="#333"/><circle cx="232" cy="97" r="4" fill="#333"/><path d="M185 190 Q200 202 215 190" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/></svg>`,
`<svg viewBox="0 0 400 300"><path d="M40 70 Q30 50 50 46 Q54 30 74 34 Q88 24 98 38 Q114 40 110 56 Q116 70 98 72 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M300 160 Q294 146 308 143 Q311 132 325 135 Q335 128 342 138 Q354 140 351 152 Q355 160 342 162 Z" fill="#fff" stroke="#333" stroke-width="4"/><rect x="55" y="36" width="135" height="9" rx="4" fill="#fff" stroke="#333" stroke-width="4"/><rect x="210" y="36" width="135" height="9" rx="4" fill="#fff" stroke="#333" stroke-width="4"/><rect x="194" y="45" width="12" height="18" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="328,82 352,44 358,88" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="352" cy="60" r="15" fill="#fff" stroke="#333" stroke-width="3"/><path d="M340 60 L364 60 M352 48 L352 72" fill="none" stroke="#333" stroke-width="3"/><polygon points="240,100 345,82 345,104 245,128" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="175" cy="115" rx="72" ry="52" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="145" cy="103" rx="30" ry="24" fill="#fff" stroke="#333" stroke-width="4"/><rect x="192" y="98" width="40" height="48" rx="8" fill="#fff" stroke="#333" stroke-width="3"/><path d="M150 165 L150 185 M215 165 L215 185" fill="none" stroke="#333" stroke-width="4"/><rect x="115" y="185" width="160" height="9" rx="5" fill="#fff" stroke="#333" stroke-width="4"/></svg>`,
`<svg viewBox="0 0 400 300"><circle cx="350" cy="48" r="24" fill="#fff" stroke="#333" stroke-width="4"/><path d="M350 12 L350 20 M386 48 L378 48 M324 22 L330 28 M376 22 L370 28" fill="none" stroke="#333" stroke-width="3"/><path d="M60 60 Q68 52 76 60 M76 60 Q84 52 92 60 M104 85 Q112 77 120 85 M120 85 Q128 77 136 85" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/><polygon points="204,28 240,40 204,52" fill="#fff" stroke="#333" stroke-width="4"/><rect x="196" y="28" width="9" height="172" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="213,55 213,185 305,185" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="188,60 188,185 105,185" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="55" cy="215" rx="16" ry="9" transform="rotate(-20 55 215)" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="66,220 80,208 78,226" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="50" cy="212" r="2" fill="#333"/><path d="M95 205 L305 205 L272 252 L128 252 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="160" cy="228" r="8" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="200" cy="228" r="8" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="240" cy="228" r="8" fill="#fff" stroke="#333" stroke-width="3"/><path d="M10 252 Q35 240 60 252 Q85 264 110 252 Q135 240 160 252 Q185 264 210 252 Q235 240 260 252 Q285 264 310 252 Q335 240 360 252 Q380 260 390 252 L390 290 L10 290 Z" fill="#fff" stroke="#333" stroke-width="4"/></svg>`,
`<svg viewBox="0 0 400 300"><path d="M300 292 Q296 250 302 226" fill="none" stroke="#333" stroke-width="4"/><ellipse cx="283" cy="258" rx="14" ry="7" transform="rotate(-30 283 258)" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="302" cy="180" r="14" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="328" cy="195" r="14" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="328" cy="225" r="14" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="302" cy="240" r="14" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="276" cy="225" r="14" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="276" cy="195" r="14" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="302" cy="210" r="15" fill="#fff" stroke="#333" stroke-width="4"/><path d="M115 90 Q100 70 88 64 M130 88 Q124 62 112 50" fill="none" stroke="#333" stroke-width="3"/><circle cx="85" cy="61" r="5" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="110" cy="47" r="5" fill="#fff" stroke="#333" stroke-width="3"/><ellipse cx="172" cy="52" rx="26" ry="15" transform="rotate(-20 172 52)" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="212" cy="50" rx="28" ry="16" transform="rotate(-10 212 50)" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="250,105 278,112 250,122" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="195" cy="110" rx="58" ry="40" fill="#fff" stroke="#333" stroke-width="4"/><path d="M170 74 Q160 110 170 146 M198 71 Q189 110 198 149 M224 76 Q217 110 224 144" fill="none" stroke="#333" stroke-width="4"/><circle cx="127" cy="110" r="26" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="120" cy="103" r="5" fill="#333"/><path d="M115 120 Q124 128 133 121" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/></svg>`,
`<svg viewBox="0 0 400 300"><ellipse cx="200" cy="280" rx="185" ry="10" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="60" cy="264" rx="34" ry="9" fill="#fff" stroke="#333" stroke-width="4"/><path d="M88 258 L96 244 M92 262 L102 252" fill="none" stroke="#333" stroke-width="3"/><circle cx="97" cy="242" r="3" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="103" cy="250" r="3" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="58" cy="242" r="20" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="58" cy="242" r="9" fill="#fff" stroke="#333" stroke-width="3"/><ellipse cx="342" cy="52" rx="10" ry="14" transform="rotate(-20 342 52)" fill="#fff" stroke="#333" stroke-width="3"/><ellipse cx="360" cy="52" rx="10" ry="14" transform="rotate(20 360 52)" fill="#fff" stroke="#333" stroke-width="3"/><ellipse cx="344" cy="72" rx="8" ry="10" transform="rotate(20 344 72)" fill="#fff" stroke="#333" stroke-width="3"/><ellipse cx="358" cy="72" rx="8" ry="10" transform="rotate(-20 358 72)" fill="#fff" stroke="#333" stroke-width="3"/><rect x="128" y="155" width="144" height="108" rx="10" fill="#fff" stroke="#333" stroke-width="4"/><path d="M82 155 Q82 38 200 38 Q318 38 318 155 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="140" cy="90" r="13" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="205" cy="70" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="262" cy="100" r="12" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="115" cy="130" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="285" cy="135" r="8" fill="#fff" stroke="#333" stroke-width="3"/><path d="M168 263 L168 215 Q196 192 224 215 L224 263 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="215" cy="235" r="4" fill="#333"/><circle cx="250" cy="190" r="14" fill="#fff" stroke="#333" stroke-width="4"/><path d="M236 190 L264 190 M250 176 L250 204" fill="none" stroke="#333" stroke-width="3"/><polygon points="95,263 102,240 109,263" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="290,263 297,242 304,263" fill="#fff" stroke="#333" stroke-width="3"/></svg>`,
`<svg viewBox="0 0 400 300"><circle cx="55" cy="60" r="24" fill="#fff" stroke="#333" stroke-width="4"/><path d="M55 84 Q50 110 58 130" fill="none" stroke="#333" stroke-width="3"/><circle cx="345" cy="70" r="24" fill="#fff" stroke="#333" stroke-width="4"/><path d="M345 94 Q340 120 348 140" fill="none" stroke="#333" stroke-width="3"/><ellipse cx="200" cy="264" rx="150" ry="14" fill="#fff" stroke="#333" stroke-width="4"/><rect x="92" y="196" width="216" height="64" rx="8" fill="#fff" stroke="#333" stroke-width="4"/><path d="M92 196 Q103 222 114 196 Q125 222 136 196 Q147 222 158 196 Q169 222 180 196 Q191 222 202 196 Q213 222 224 196 Q235 222 246 196 Q257 222 268 196 Q279 222 290 196 Q301 222 308 200 L308 196 Z" fill="#fff" stroke="#333" stroke-width="4"/><rect x="132" y="138" width="136" height="58" rx="8" fill="#fff" stroke="#333" stroke-width="4"/><path d="M132 138 Q143 162 154 138 Q165 162 176 138 Q187 162 198 138 Q209 162 220 138 Q231 162 242 138 Q253 162 264 138 L268 138 Z" fill="#fff" stroke="#333" stroke-width="4"/><rect x="156" y="100" width="11" height="38" rx="3" fill="#fff" stroke="#333" stroke-width="4"/><rect x="194" y="100" width="11" height="38" rx="3" fill="#fff" stroke="#333" stroke-width="4"/><rect x="232" y="100" width="11" height="38" rx="3" fill="#fff" stroke="#333" stroke-width="4"/><path d="M161 96 Q154 82 161 72 Q168 82 161 96 Z" fill="#fff" stroke="#333" stroke-width="3"/><path d="M199 96 Q192 82 199 72 Q206 82 199 96 Z" fill="#fff" stroke="#333" stroke-width="3"/><path d="M237 96 Q230 82 237 72 Q244 82 237 96 Z" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="120" cy="250" r="9" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="285" cy="250" r="9" fill="#fff" stroke="#333" stroke-width="3"/></svg>`,
`<svg viewBox="0 0 400 300"><path d="M60 60 L60 84 M50 66 L70 78 M70 66 L50 78" fill="none" stroke="#333" stroke-width="3"/><path d="M330 40 L330 64 M320 46 L340 58 M340 46 L320 58" fill="none" stroke="#333" stroke-width="3"/><path d="M350 120 L350 144 M340 126 L360 138 M360 126 L340 138" fill="none" stroke="#333" stroke-width="3"/><ellipse cx="200" cy="272" rx="155" ry="16" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="115" cy="175" rx="17" ry="52" transform="rotate(15 115 175)" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="285" cy="175" rx="17" ry="52" transform="rotate(-15 285 175)" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="200" cy="165" rx="78" ry="100" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="200" cy="190" rx="50" ry="65" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="176" cy="105" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="224" cy="105" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="178" cy="107" r="4" fill="#333"/><circle cx="222" cy="107" r="4" fill="#333"/><polygon points="186,118 214,118 200,134" fill="#fff" stroke="#333" stroke-width="4"/><path d="M148 142 Q200 162 252 142 L252 160 Q200 180 148 160 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M238 158 L254 198 L226 190 Z" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="168" cy="266" rx="20" ry="9" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="232" cy="266" rx="20" ry="9" fill="#fff" stroke="#333" stroke-width="4"/></svg>`,
`<svg viewBox="0 0 400 300"><polygon points="75,41 79,50 89,50 81,57 84,67 75,61 66,67 69,57 61,50 71,50" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="115,156 119,165 129,165 121,172 124,182 115,176 106,182 109,172 101,165 111,165" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="320,66 324,75 334,75 326,82 329,92 320,86 311,92 314,82 306,75 316,75" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="345,146 349,155 359,155 351,162 354,172 345,166 336,172 339,162 331,155 341,155" fill="#fff" stroke="#333" stroke-width="3"/><path d="M330 165 L295 180 M334 172 L305 192" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/><path d="M258 45 Q175 55 175 140 Q175 225 258 235 Q205 210 205 140 Q205 70 258 45 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="188" cy="115" r="4" fill="#333"/><path d="M183 140 Q190 148 197 142" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/><path d="M60 230 Q50 212 68 208 Q72 194 90 198 Q102 188 112 200 Q128 202 124 216 Q130 230 112 232 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M10 290 Q100 240 200 290 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M180 290 Q280 235 390 290 Z" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="250,252 275,232 300,252" fill="#fff" stroke="#333" stroke-width="4"/><rect x="255" y="252" width="40" height="30" fill="#fff" stroke="#333" stroke-width="4"/><rect x="268" y="260" width="14" height="12" fill="#fff" stroke="#333" stroke-width="3"/></svg>`,
`<svg viewBox="0 0 400 300"><ellipse cx="200" cy="284" rx="170" ry="9" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="60,66 66,80 60,94 54,80" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="340,46 346,60 340,74 334,60" fill="#fff" stroke="#333" stroke-width="3"/><polygon points="360,140 366,154 360,168 354,154" fill="#fff" stroke="#333" stroke-width="3"/><path d="M70 150 Q60 135 48 145 Q38 155 48 168 L70 185 L92 168 Q102 155 92 145 Q80 135 70 150 Z" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="316" cy="180" r="18" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="330" cy="210" r="16" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="314" cy="238" r="15" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="225" cy="195" rx="82" ry="52" fill="#fff" stroke="#333" stroke-width="4"/><rect x="165" y="235" width="17" height="48" rx="6" fill="#fff" stroke="#333" stroke-width="4"/><rect x="205" y="235" width="17" height="48" rx="6" fill="#fff" stroke="#333" stroke-width="4"/><rect x="250" y="235" width="17" height="48" rx="6" fill="#fff" stroke="#333" stroke-width="4"/><rect x="288" y="235" width="17" height="48" rx="6" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="208" cy="98" r="18" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="216" cy="130" r="17" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="222" cy="162" r="16" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="170,180 148,85 200,75 225,185" fill="#fff" stroke="#333" stroke-width="4"/><polygon points="135,52 115,4 158,44" fill="#fff" stroke="#333" stroke-width="4"/><path d="M128 36 L142 46 M121 22 L136 33" fill="none" stroke="#333" stroke-width="3"/><polygon points="165,54 178,26 190,56" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="158" cy="46" r="13" fill="#fff" stroke="#333" stroke-width="4"/><ellipse cx="152" cy="78" rx="42" ry="30" transform="rotate(-12 152 78)" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="140" cy="74" r="5" fill="#333"/><path d="M132 64 L124 58 M138 62 L134 54" fill="none" stroke="#333" stroke-width="3"/><circle cx="118" cy="86" r="3" fill="#333"/></svg>`
];

/* key = tên file ảnh THẬT trong assets/images (manifest) — hiện sau khi bé lưu tranh tô; en = từ tiếng Anh đọc kèm */
const PIC_META=[
  {em:'🐟',nm:'Cá',key:'fish',en:'fish'},{em:'🏠',nm:'Nhà',key:'house',en:'house'},
  {em:'🦋',nm:'Bướm',key:'butterfly',en:'butterfly'},{em:'🌸',nm:'Hoa',key:'flower',en:'flower'},
  {em:'🚗',nm:'Ô tô',key:'car',en:'car'},{em:'🚀',nm:'Tên lửa',key:'rocket',en:'rocket'},
  {em:'🦕',nm:'Khủng long',key:'dinosaur',en:'dinosaur'},{em:'🐱',nm:'Mèo',key:'cat',en:'cat'},
  {em:'🌳',nm:'Cây táo',key:'apple tree',en:'apple tree'},{em:'🍦',nm:'Kem',key:'ice cream',en:'ice cream'},
  {em:'🤖',nm:'Robot',key:'robot',en:'robot'},{em:'🏰',nm:'Lâu đài',key:'castle',en:'castle'},
  {em:'🦁',nm:'Sư tử',key:'lion',en:'lion'},{em:'🚂',nm:'Tàu hoả',key:'train',en:'train'},
  {em:'🦚',nm:'Con công',key:'peacock',en:'peacock'},{em:'🌻',nm:'Hướng dương',key:'sunflower',en:'sunflower'},
  {em:'🐬',nm:'Cá heo',key:'dolphin',en:'dolphin'},{em:'🦉',nm:'Cú mèo',key:'owl',en:'owl'},
  {em:'🚒',nm:'Xe cứu hoả',key:'fire truck',en:'fire truck'},{em:'🌈',nm:'Cầu vồng',key:'rainbow',en:'rainbow'},
  {em:'🐘',nm:'Voi',key:'elephant',en:'elephant'},{em:'🦒',nm:'Hươu cao cổ',key:'giraffe',en:'giraffe'},
  {em:'🐢',nm:'Rùa',key:'turtle',en:'turtle'},{em:'🦀',nm:'Cua',key:'crab',en:'crab'},
  {em:'🚁',nm:'Trực thăng',key:'helicopter',en:'helicopter'},{em:'⛵',nm:'Thuyền buồm',key:'boat',en:'boat'},
  {em:'🐝',nm:'Ong',key:'bee',en:'bee'},{em:'🍄',nm:'Nhà nấm',key:'mushroom',en:'mushroom'},
  {em:'🎂',nm:'Bánh kem',key:'cake',en:'cake'},{em:'🐧',nm:'Cánh cụt',key:'penguin',en:'penguin'},
  {em:'🌙',nm:'Đêm trăng',key:'night sky',en:'moon'},{em:'🦄',nm:'Kỳ lân',key:null,en:'unicorn'}
];

/* export cho node (scripts/list-phrases.cjs); browser bỏ qua */
if (typeof module !== 'undefined') {
  module.exports = { PRAISE, CHEER, HELLO, JOKES, STICKERS, STICKER_COST,
    LETTER_NAMES, EXAMPLES, VN_LETTERS, WRITE_SETS, VOWELS, VAN_ITEMS,
    TONE_SETS, WORD_ITEMS, SENTENCES, EN_THEMES, SONGS, PICS, PIC_META, VAN2, DIGRAPHS };
}