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
const WORD_ITEMS = [
  {em:'🐱', w:'con mèo'},{em:'🐶', w:'con chó'},{em:'🐟', w:'con cá'},
  {em:'🐔', w:'con gà'},{em:'🐘', w:'con voi'},{em:'🍎', w:'quả táo'},
  {em:'🍌', w:'quả chuối'},{em:'🏠', w:'cái nhà'},{em:'🚗', w:'ô tô'},{em:'🌸', w:'bông hoa'},
  {em:'🦆', w:'con vịt'},{em:'🐰', w:'con thỏ'},{em:'🐵', w:'con khỉ'},{em:'🍊', w:'quả cam'},
  {em:'🚌', w:'xe buýt'},{em:'✈️', w:'máy bay'},{em:'🦋', w:'con bướm'},{em:'⭐', w:'ngôi sao'},
  {em:'☀️', w:'mặt trời'},{em:'🌙', w:'mặt trăng'}
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
  {say:'Ban đêm, cái gì sáng trên trời cùng ông trăng?', html:'Ngôi ___ sáng lấp lánh ⭐', a:'sao', d:['cá','hoa']}
];
const EN_THEMES = {
  '🐾 Animals':[
    {em:'🐶',w:'dog',vi:'con chó'},{em:'🐱',w:'cat',vi:'con mèo'},{em:'🐟',w:'fish',vi:'con cá'},
    {em:'🐦',w:'bird',vi:'con chim'},{em:'🐰',w:'rabbit',vi:'con thỏ'},{em:'🦁',w:'lion',vi:'sư tử'},
    {em:'🐘',w:'elephant',vi:'con voi'},{em:'🐵',w:'monkey',vi:'con khỉ'},
    {em:'🐻',w:'bear',vi:'con gấu'},{em:'🦆',w:'duck',vi:'con vịt'}
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
    {em:'🍚',w:'rice',vi:'cơm'},{em:'🍬',w:'candy',vi:'kẹo'}
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
    {em:'🚁',w:'helicopter',vi:'trực thăng'},{em:'🚚',w:'truck',vi:'xe tải'}
  ],
  '🏃 Actions':[
    {em:'🏃',w:'run',vi:'chạy'},{em:'🤸',w:'jump',vi:'nhảy'},{em:'🏊',w:'swim',vi:'bơi'},
    {em:'🎤',w:'sing',vi:'hát'},{em:'💃',w:'dance',vi:'nhảy múa'},{em:'😴',w:'sleep',vi:'ngủ'},
    {em:'🍽️',w:'eat',vi:'ăn'},{em:'📖',w:'read',vi:'đọc sách'}
  ],
  '🏠 House':[
    {em:'🛏️',w:'bed',vi:'cái giường'},{em:'🚪',w:'door',vi:'cái cửa'},{em:'🪟',w:'window',vi:'cửa sổ'},
    {em:'📺',w:'TV',vi:'ti vi'},{em:'🛋️',w:'sofa',vi:'ghế sô pha'},{em:'💡',w:'lamp',vi:'cái đèn'},
    {em:'🛁',w:'bath',vi:'bồn tắm'},{em:'☎️',w:'phone',vi:'điện thoại'}
  ],
  '😊 Feelings':[
    {em:'😊',w:'happy',vi:'vui'},{em:'😢',w:'sad',vi:'buồn'},{em:'😠',w:'angry',vi:'tức giận'},
    {em:'🥵',w:'hot',vi:'nóng'},{em:'🥶',w:'cold',vi:'lạnh'},{em:'😋',w:'hungry',vi:'đói bụng'}
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
`<svg viewBox="0 0 400 300"><circle cx="48" cy="46" r="22" fill="#fff" stroke="#333" stroke-width="4"/><path d="M25 260 A175 175 0 0 1 375 260 L350 260 A150 150 0 0 0 50 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M50 260 A150 150 0 0 1 350 260 L325 260 A125 125 0 0 0 75 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M75 260 A125 125 0 0 1 325 260 L300 260 A100 100 0 0 0 100 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M100 260 A100 100 0 0 1 300 260 L275 260 A75 75 0 0 0 125 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M125 260 A75 75 0 0 1 275 260 L250 260 A50 50 0 0 0 150 260 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M150 58 Q162 44 172 56 Q182 44 194 58 Q182 52 172 60 Q162 52 150 58 Z" fill="#333" stroke="#333" stroke-width="3"/><path d="M240 76 Q252 62 262 74 Q272 62 284 76 Q272 70 262 78 Q252 70 240 76 Z" fill="#333" stroke="#333" stroke-width="3"/><path d="M18 280 Q10 254 30 246 Q36 224 62 230 Q80 216 100 230 Q126 222 132 244 Q158 246 152 268 Q158 282 138 284 Z" fill="#fff" stroke="#333" stroke-width="4"/><path d="M382 280 Q390 254 370 246 Q364 224 338 230 Q320 216 300 230 Q274 222 268 244 Q242 246 248 268 Q242 282 262 284 Z" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="174" cy="248" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="190" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="174" cy="280" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="158" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="174" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="226" cy="248" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="242" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="226" cy="280" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="210" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="226" cy="264" r="11" fill="#fff" stroke="#333" stroke-width="3"/></svg>`
];

const PIC_META=[
  {em:'🐟',nm:'Cá'},{em:'🏠',nm:'Nhà'},{em:'🦋',nm:'Bướm'},{em:'🌸',nm:'Hoa'},
  {em:'🚗',nm:'Ô tô'},{em:'🚀',nm:'Tên lửa'},{em:'🦕',nm:'Khủng long'},{em:'🐱',nm:'Mèo'},
  {em:'🌳',nm:'Cây táo'},{em:'🍦',nm:'Kem'},{em:'🤖',nm:'Robot'},{em:'🏰',nm:'Lâu đài'},
  {em:'🦁',nm:'Sư tử'},{em:'🚂',nm:'Tàu hoả'},{em:'🦚',nm:'Con công'},{em:'🌻',nm:'Hướng dương'},{em:'🐬',nm:'Cá heo'},{em:'🦉',nm:'Cú mèo'},{em:'🚒',nm:'Xe cứu hoả'},{em:'🌈',nm:'Cầu vồng'}
];

/* export cho node (scripts/list-phrases.cjs); browser bỏ qua */
if (typeof module !== 'undefined') {
  module.exports = { PRAISE, CHEER, HELLO, JOKES, STICKERS, STICKER_COST,
    LETTER_NAMES, EXAMPLES, VN_LETTERS, WRITE_SETS, VOWELS, VAN_ITEMS,
    TONE_SETS, WORD_ITEMS, SENTENCES, EN_THEMES, SONGS, PICS, PIC_META };
}