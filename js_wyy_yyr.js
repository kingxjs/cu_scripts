/**
 * 网易云音乐签到
 * @author: github@laoxinH
 * @version: 1.0
 * 每天10点10分执行自动打卡
 ==============cookie获取方式===================
 打开网页网易云音乐--" 获取cookie
[Script]
cron "0 21 * * *" script-path=js_wyy_yyr.js
 */


 const $ = new Env("网易云音乐签到");
 // CrytoJS加密
 const encrypt = require('./utils/wyy_crypto')
 const queryString = require('querystring')
 const ntf = $.isNode() ? require('./sendNotify') : '';
 var cookie = ""||$.getdata("Cookie_wyy")|| process.env.Cookie_wyy; // nodejs用户请直接将获取的cookie填写到双引号中

if (!cookie) {
    console.log($.name, "📢请打开: https://music.163.com 并登录获取cookie", "nodejs用户请自行通过浏览器抓取", "quanx等ios用户打开网址将自动获取");
    if (!$.isNode()) {
        $.msg($.name, "📢请打开: https://music.163.com 并登录获取cookie", "nodejs用户请自行通过浏览器抓取", "quanx等ios用户打开网址将自动获取")
    }
    return;
}
const csrf_token = cookie.match(/__csrf=(\w)+/)[0].substring(7);
const songList = [4872567, 1336856498, 359735, 1463505060, 472141618, 1362521421, 25780279, 1374489910, 1300287, 17982528, 4226232, 186843, 553543179, 135028, 1314931825, 394524, 26883589, 33699518, 31877511, 3413782, 1761766, 29450577, 31311126, 357238, 453268744, 327451, 863553295, 456136072, 387457, 394543, 1341054243, 29450573, 536623692, 16426485, 406072193, 356480, 91429, 91444, 17276013, 270615, 863554092, 109579, 209245, 5235179, 482979317, 31311140, 485413811, 209436, 570097955, 418603177, 91448, 461080452, 186046, 1302066297, 216764, 306991, 4873341, 189552, 85562, 1776816, 863553296, 5134005, 188591, 472137696, 109528, 863489981, 28784206, 157808, 422427460, 19145688, 2176169, 25730796, 82268, 299518, 17261721, 4281062, 31529024, 461584268, 186699, 656405, 5280037, 5272970, 317885, 28186082, 273915, 110669, 497400537, 38582036, 26620455, 28642832, 447925066, 136951, 28138269, 4334701, 5247458, 27937432, 437715323, 28111201, 118976, 277686, 30394928, 40249668, 233292, 102651, 102600, 449643461, 390536, 34364196, 28176037, 28009992, 390557, 60398, 4237530, 210991, 438462712, 112167, 63750, 5251587, 25641848, 507815173, 2001320, 164009, 29392759, 534067044, 109073, 29019489, 93948, 1078365, 4279075, 28315774, 5046367, 22746144, 208958, 390558, 444003233, 562594267, 29750958, 28287189, 2308680, 17177367, 188878, 306975, 251464, 1297750769, 35920348, 214921, 1295824647, 194092, 67339, 98021, 5280076, 156292, 28038055, 27902937, 328895, 5248928, 82056, 31721541, 262938, 259365, 260703, 195595, 5232526, 332743, 82457, 215368, 326710, 26145723, 22701801, 417596048, 5282403, 64638, 418602584, 417250673, 224000, 213617, 526116080, 239682, 445886392, 18127640, 28695638, 28885472, 28310930, 1039333, 27937466, 394841, 812400, 491943068, 536622304, 28409805, 541687281, 452620634, 67288, 67570, 188747, 528335245, 1777667, 531051217, 419373997, 158403, 287752, 234252, 235096, 190241, 299454, 454069805, 460410002, 463159617, 416700932, 86477, 68075, 139558, 28138170, 363409, 117220, 344156, 240055, 1217823, 422463688, 346079, 29544259, 1215494, 2007506, 27514865, 210089, 22715757, 346085, 174119, 298900, 92939, 190380, 94961, 29431270, 330008, 514055051, 109938, 26608529, 186492, 300538, 299460, 299650, 376647, 451768026, 29999506, 211442, 188555, 189714, 29732659, 407459600, 394488, 17858810, 493275349, 3932076, 487206688, 26584442, 636165, 1475363, 410801521, 194405, 1348599, 258684, 151646, 156772, 151618, 329925, 156736, 31967217, 468252710, 27180681, 29593805, 350760, 30394959, 95651, 413829873, 409650012, 28793502, 186469, 37955044, 33728453, 387588, 5043818, 29759733, 490595478, 64293, 189718, 426343036, 379785, 427142762, 25643130, 65107, 364958, 185643, 29017261, 439139384, 30394202, 407759199, 28643022, 4900975, 32272267, 640565, 474932841, 475207448, 317108, 5280161, 105431, 409031377, 442314991, 422428548, 444269202, 21809247, 5280051, 26026783, 109496, 445238199, 3405868, 28188171, 3413895, 16779718, 27198279, 306967, 455311479, 34690628, 292587, 5041846, 427610763, 428642306, 413829859, 413831994, 26620638, 417595364, 26092806, 417596830, 31421442, 185878, 186018, 415792918, 185815, 185904, 448916053, 440411424, 408307090, 28497537, 29717271, 437859519, 442869498, 188703, 19673369, 29592146, 426881505, 426881503, 426881487, 287035, 3879733, 274863, 27867449, 406072144, 411314656, 16629199, 27510434, 406072138, 27646786, 28009051, 25731320, 26060065, 406238, 27733284, 27747330, 34078196, 423703429, 29535690, 17793698, 595682, 187408, 28378127, 186820, 287039, 27646205, 668248, 38592976, 33233915, 31273654, 299604, 431357712, 414706021, 29379816, 41666363, 740649, 4898499, 28786397, 28461734, 740558, 480353, 92429, 26608941, 33911781, 541230, 740611, 730669, 624879, 30431376, 22748769, 659094, 741961, 28940202, 28288503, 28188434, 428095913, 27678663, 30352891, 28940201, 31445554, 4433364, 16607998, 624899, 27867140, 22781037, 28940203, 22676620, 26099351, 28830803, 740508, 694286, 818186, 593007, 857619, 22697895, 22748787, 411921855, 22773649, 297587, 605740, 27874938, 625273, 296837, 386837, 28668277, 409941447, 39443443, 25657280, 356034, 238831, 28285910, 26127556, 31814411, 408814900, 412319476, 30500470, 229616, 229594, 28310921, 33544485, 28923659, 25643258, 30070681, 25643236, 25642946, 29850094, 155785, 186842, 208904, 209326, 30431370, 33162225, 33162226, 199768, 287061, 2004435, 4874623, 30431366, 171269, 171530, 27906147, 400875271, 400876303, 28283665, 35847388, 287634, 26211155, 152392, 152444, 369128, 4273642, 422132917, 5093684, 260175, 26075553, 21564643, 21253953, 431795577, 29450578, 21597340, 27904144, 451620178, 202373, 466768491, 29217536, 27901423, 27908100, 34998481, 504624714, 557581476, 573384240, 96945, 5269046, 640866, 146225, 234263, 277766, 187837, 25643229, 26447698, 620487, 27808295, 2866921, 176062, 310909, 290823, 421885447, 4876565, 343065, 30841620, 28717724, 31750709, 95638, 17990609, 448393515, 29850531, 740291, 741919, 32217106, 442016663, 185643, 382029, 417859076, 145223, 427016671, 411314657, 411314659, 411315635, 365598, 32196201, 355961, 423703430, 423703423, 186457, 409031377, 444269202, 21809247, 5280051, 26026783, 445238199, 19572271, 28188171, 3405868, 16779718, 27198279, 306967, 34690628, 5041846, 428642306, 413831994, 417595364, 417596830, 186014, 185878, 440411424, 29592146, 27510434, 411314656, 406072138, 28009051, 25731320, 27733284, 27747330, 29535690, 186820, 287039, 28940201, 27867140, 26099351, 694286, 22748787, 22773649, 27874938, 386837, 356034, 31814411, 30500470, 28310921, 25643354, 167880, 30431370, 33162226, 287061, 401722038, 171269, 2117005, 29774430, 152390, 152389, 152394, 152426, 152444, 768801, 369128, 480426313, 37955044, 36668810, 28814036, 475279499, 31789010, 25657282, 1347133940, 448749148, 415904452, 34072434, 424995313, 460043704, 422132237, 513357140, 1334246005, 464035016, 1318733599, 446557042, 436675656, 504492138, 1347227968, 1366537490, 516750031, 1380022214, 33085220, 483024211, 566435601, 862657136, 511921537, 552650454, 1384309833, 417833443, 509135896, 514206286, 1304861566, 410519101, 28566356, 22843786, 28208212, 1332582424, 28718301, 483242395, 2639477, 28481189, 27829053, 549484811, 468882987, 470573623, 564742278, 539982411, 33522489, 553899593, 545947179, 472948115, 451680013, 572763271, 1364343491, 500684078, 476630942, 1366775011, 489110016, 31245090, 473940907, 26548584, 1359113596, 1324159296, 436514415, 1356580767, 427595940, 1311535958, 27871272, 444324644, 522617477, 564094072, 530967641, 1299871688, 33035577, 523042017, 30569536, 442869240, 32102058, 468517531, 461544312, 423118986, 1344440225, 1362822707, 1314780499, 507795651, 468490459, 487587444, 864648486, 546838014, 32432811, 470795480, 532776335, 28921696, 4433364, 28854398, 28639182, 864648551, 553479159, 1403074111, 1323832567, 463352636, 33337002, 573673964, 457552086, 451991303, 1320697603, 3026554, 28593339, 483024225, 523421716, 1326439375, 556053856, 29418363, 456185577, 572166420, 31234202, 405485737, 1296896326, 3986241, 19292984, 1299563871, 573582024, 4164331, 20671335, 28254519, 31053184, 22843782, 28157586, 29482234, 27914279, 1331322046, 28188171, 864513777, 506196018, 493042797, 28832241, 32019331, 556216490, 506288341, 431096716, 487454620, 1318522028, 25657233, 475597835, 402061023, 460043710, 436016463, 574928272, 490602245, 526161446, 439122515, 34144434, 31108473, 25657280, 511678913, 36019282, 509612912, 19094999, 466794339, 553813030, 412175989, 423118988, 29709781, 428375694, 474305506, 34913089, 32574252, 5093684, 505665222, 417859039, 471411255, 31356499, 485612576, 29787426, 29592100, 473865426, 421148673, 515601126, 448317566, 39224884, 21792987, 31081299, 32022492, 16375205, 543987451, 483156032, 557704117, 543927569, 475072054, 543006339, 479408216, 531842654, 1310319885, 414979759, 28796621, 534072344, 544231701, 415792222, 39324743, 28402345, 32807699, 1314777725, 505828528, 529557738, 464647338, 29910080, 545655045, 440310367, 471565537, 554217208, 460323657, 29771146, 404276447, 469272852, 491082791, 533017528, 503123018, 1294889892, 491271737, 437909145, 25657274, 465920383, 521416693, 529824982, 556066474, 571336983, 534228257, 427542186, 487375361, 567316473, 424155395, 28959074, 29535349, 1318511471, 1346474112, 1301572238, 1313070706, 412951708, 418602088, 520928254, 552145020, 4331105, 28864241, 546722490, 2526625, 421423245, 569870379, 1309262455, 34749984, 32897242, 480648464, 865606053, 37722278, 424495485, 454069978, 5134011, 493275043, 36990266, 463159617, 406072193, 464674427, 2188235, 862768857, 471969020, 30212890, 22843785, 460043703, 2639750, 41667979, 2080139, 2119755, 27560017, 2175282, 4154790, 22481464, 30841076, 425065695, 475174840, 41462775, 18611643, 3407082, 2001276, 418603096, 423997615, 30070142, 457567102, 1076292, 26092806, 36496695, 37169348, 414670127, 27984052, 472361236, 456185056, 28844472, 19032216, 21795464, 18374823, 4109336, 32341765, 461518895, 29480187, 3160951, 28248872, 5046367, 19567918, 424155394, 32341392, 468490461, 19711382, 2080326, 28756834, 34228719, 3154082, 17753288, 3555220, 18298949, 27646851, 28828120, 26131191, 524164335, 30431647, 415792064, 32069280, 33497559, 515573352, 3026583, 449824945, 420397141, 456175020, 468490458, 426291544, 518895684, 515573993, 441429244, 500637550, 29806043, 28111294, 29713617, 29422008, 473602620, 440208476, 32639368, 33291435, 423227295, 402070862, 444269135, 18708516, 493283657, 32102397, 415793249, 17112299, 509728841, 3026556, 18638057, 411314681, 481764066, 442495638, 29722263, 38592976, 460043372, 423228325, 461518855, 451703096, 442315372, 457537752, 25862803, 411315504, 440101136, 37653063, 465675773, 515269424, 472361096, 31234244, 525240439, 441491080, 461932356, 436668683, 525940336, 2701514, 503855598, 439121048, 213737, 229090, 427142481, 29009655, 428591384, 507532195, 520274067, 20953761, 483024028, 444548120, 469104843, 401249910, 403012527, 19207074, 26060065, 520525412, 491294233, 33418570, 17996972, 18680851, 480517594, 32835004, 430053872, 35864736, 18836961, 458238099, 31370203, 492145159, 494865824, 2587251, 3550532, 27706564, 3852042, 466122659, 28347352, 21253966, 466122460, 466794276, 489041829, 460298206, 26407811, 511236571, 447296411, 28727903, 4380582, 27846862, 416700932, 1695569, 227724, 432698441, 439076364, 18449193, 410801521, 465920775, 402070863, 31654042, 471761048, 492146902, 503058959, 473817398, 16426574, 409916250, 464035863, 491950183, 499465427, 512621703, 515453363, 2925107, 29922545, 27566922, 403710307, 26349699, 19032267, 1807824, 29019227, 29966565, 30496792, 456084222, 497463179, 493285618, 30798612, 17706537, 457552211, 28661564, 437605840, 461544126, 28493605, 28315789, 516823096, 1807865, 27845535, 4108623, 29561089, 28768434, 428203132, 1936565, 438803640, 522444650, 28859948, 26217020, 445666806, 5048990, 21224493, 3157058, 27598731, 32341393, 21224495, 500410102, 28282082, 475597495, 30953009, 512376599, 19572271, 500412390, 2001320, 457800857, 2866921, 29750825, 438900437, 27949374, 28694864, 28240407, 3402885, 473404348, 444356814, 30394891, 26213616, 425100405, 409647737, 19830038, 498331794, 420922950, 441491167, 466126510, 461347998]
$.userInfo = {};
$.msg = '';
!(async () => {
    // 如果不是nodejs环境执行获取ck
    if (!$.isNode() && $request.headers) {
        const cookieKey = "Cookie_wyy";
        const cookieVal = $request.headers["Cookie"];
        if ($.setval(cookieVal, cookieKey)) {
            $.log($.name, "cookie获取成功", cookieVal);
            $.msg($.name, "cookie获取成功!", "cookie: " + cookieVal);
        } else {
            $.log($.name, "cookie获取失败");
        }
    }
    if (!cookie) {
        console.log($.name, "📢请打开: https://music.163.com 并登录获取cookie", "nodejs用户请自行通过浏览器抓取", "quanx等ios用户打开网址将自动获取");
        if (!$.isNode()) {
            $.msg($.name, "📢请打开: https://music.163.com 并登录获取cookie", "nodejs用户请自行通过浏览器抓取", "quanx等ios用户打开网址将自动获取")
        }
        return;
    }
    await get_level();
    //PC/Web端签到
    await sign();
    //安卓端签到
    await sign(1);
    //分享歌曲
    await sendSong();
    //分享朋友圈
    //await dailyTask("2");
    //云贝信息
    await yunbei();
    //云贝已完成任务（领取云贝）
    await yunbei_tasks_todo();
    //云贝账户
    await yunbei_info();
    //vip任务
    await vipTasks();
    //vip信息
    await vip_growthpoint();
    // 通知
    await sendNotify();
})()

async function get_level() {
    let data = {
        "type": 0
    };
    const opts = getOpts(data, "https://music.163.com/weapi/user/level");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("签到失败: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            if (data != null && data.code == 200) {
                $.userInfo = data.data;
                resolve(data);
            } else {
                $.logErr("失败");
                $.log("获取用户等级信息: " + data.msg);
                resolve(null);
            }
        })
    })
}

async function sendSong() {
    let data = {
        type: "song",
        id: songList[Math.floor(Math.random() * songList.length)],
        msg: "分享歌曲",
        csrf_token: csrf_token
    };
    const opts = getOpts(data, "https://music.163.com/weapi/share/friends/resource");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("签到失败: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            if (data != null && data.code == 200) {
                $.msg += `分享歌曲：成功\r\n`;
                $.log("分享歌曲：成功")
                resolve(data);
            } else {
                $.msg += `分享歌曲：${data.msg}\r\n`;
                $.log("分享歌曲: " +data.msg);
                resolve(null);
            }
        })
    })
}
//获取 VIP 信息
async function vip_info() {
    let data = {

    };
    const opts = getOpts(data, "https://music.163.com/weapi/music-vip-membership/front/vip/info");
    return new Promise(resolve => {
        $.post(opts, async (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("VIP信息: " + err);
                resolve(null);
            }
            console.info(data)
            data = $.toObj(data);
            if (data.code == 200) {
                
                resolve(data);
            }else{
                $.msg += `VIP信息：${data.msg}\r\n`;
                $.log("VIP信息: " + data.msg);
                resolve(null);
            }
        })
    })
}
//vip任务
async function vipTasks() {
    let data = {

    };
    const opts = getOpts(data, "https://music.163.com/weapi/vipnewcenter/app/level/task/list");
    return new Promise(resolve => {
        $.post(opts, async (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("VIP任务: " + err);
                resolve(null);
            }
            console.info(data)
            data = $.toObj(data);
            if (data.code == 200) {
                $.growthPoint = 0;
                for (let index = 0; index < data.data.taskList.length; index++) {
                    const task = data.data.taskList[index];
                    for (let j = 0; j < task.taskItems.length; j++) {
                        const item = task.taskItems[j];
                        if (item.unGetIds && item.unGetIds.length > 0) {
                            await vip_growthpoint_get(item.unGetIds.join(','))
                            $.growthPoint += item.growthPoint;
                            // $.msg += `完成 ${task.seqName}：${item.action}，${item.description}\r\n`;
                            $.log(`完成 ${task.seqName}：${item.action}，${item.description}`)
                        }
                    }
                }
                resolve(data);
            } else {
                $.msg += `vip任务：${data.msg}\r\n`;
                $.log("vip任务: " + data.msg);
                resolve(null);
            }
        })
    })
}

//会员成长值
async function vip_growthpoint() {
    let data = {

    };
    const opts = getOpts(data, "https://music.163.com/weapi/vipnewcenter/app/level/growhpoint/basic");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("会员信息: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            if (data.code == 200) {
                $.msg += `VIP等级：${data.data.userLevel.level}（${data.data.userLevel.levelName}）,当前成长值：${data.data.userLevel.growthPoint}，今日增加： ${$.growthPoint}\r\n`;
                $.log(`VIP等级：${data.data.userLevel.level}（${data.data.userLevel.levelName}）,当前成长值：${data.data.userLevel.growthPoint}，今日增加： ${$.growthPoint}`)
                resolve(data);
            }else{
                $.msg += `会员信息：${data.msg}\r\n`;
                $.log("会员信息: " + data.msg);
                resolve(null);
            }
        })
    })
}
//领取会员成长值
async function vip_growthpoint_get(unGetIds) {
    let data = {
        taskIds: unGetIds
    };
    const opts = getOpts(data, "https://music.163.com/weapi/vipnewcenter/app/level/task/reward/get");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("领取会员成长值: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            if (data.code == 200) {
                resolve(data);
            }else{
                $.msg += `领取会员成长值：失败\r\n`;
                $.log("领取会员成长值: " + $.toStr(data));
                resolve(null);
            }
        })
    })
}
//云贝信息
async function yunbei() {
    let data = {

    };
    const opts = getOpts(data, "https://music.163.com/api/point/signed/get");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("云贝信息: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            if (data.code == 200) {
                // $.msg += `云贝签到：已签到 ${data.data.days}天，明日签到可领取 ${data.data.shells} 云贝\r\n`;
                $.log(`云贝签到：已签到 ${data.data.days}天，明日签到可领取 ${data.data.shells} 云贝`)
                resolve(data);
            }else{
                $.logErr(err);
                $.log("云贝todo任务: " + err);
                resolve(null);
            }
        })
    })
}

async function yunbei_info() {
    let data = {

    };
    const opts = getOpts(data, "https://music.163.com/api/v1/user/info");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("云贝信息: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            try {
                if (data.code == 200) {
                    $.msg += `云贝账户：当前 ${data.data?.userPoint?.balance} 云贝，今日增加：${$.taskPoint} 云贝\r\n`;
                    $.log(`云贝账户：当前 ${data.data?.userPoint?.balance} 云贝，今日增加：${$.taskPoint} 云贝`)
                    resolve(data);
                } else {
                    $.logErr(err);
                    $.log("云贝todo任务: " + err);
                    resolve(null);
                }
            } catch {

            }
        })
    })
}
//云贝所有任务
async function yunbei_tasks() {
    let data = {

    };
    const opts = getOpts(data, "https://music.163.com/api/usertool/task/list/all");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("云贝所有任务: " + err);
                resolve(null);
            }
            data = $.toObj(data);
        })
    })
}
//云贝todo任务
async function yunbei_tasks_todo() {
    let data = {

    };
    const opts = getOpts(data, "https://music.163.com/api/usertool/task/todo/query");
    return new Promise(resolve => {
        $.post(opts, async (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("云贝todo任务: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            if (data.code == 200) {
                $.taskPoint = 0;
                for (let index = 0; index < data.data.length; index++) {
                    const item = data.data[index];
                    if (item.completed) {
                        await yunbei_task_finish(item.userTaskId, item.depositCode);
                        $.taskPoint+=item.taskPoint;
                        $.log(`云贝任务：${item.taskName} 已完成，领取 ${item.taskPoint}云贝`)
                        await $.wait((1 + Math.random()) * 1000)
                    }
                }
                // if (taskPoint > 0)
                //     $.msg += `云贝任务：领取 ${taskPoint}云贝\r\n`;
                resolve(data);
            }else{
                $.logErr(err);
                $.log("云贝todo任务: " + err);
                resolve(null);
            }
        })
    })
}
//云贝完成任务(领取云贝)
async function yunbei_task_finish(userTaskId, depositCode) {
    let data = {
        userTaskId: userTaskId,
        depositCode: depositCode || '0',
    };
    const opts = getOpts(data, "https://music.163.com/api/usertool/task/point/receive");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("云贝完成任务: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            if (data.code == 200) {
                resolve(data);
            }else{
                $.logErr(err);
                $.log("云贝完成任务: " + err);
                resolve(null);
            }
        })
    })
}
//云贝推歌
async function yunbei_rcmd_song(songId, reason) {
    let data = {
        songId: songId,
        reason: reason || '好歌献给你',
        scene: '',
        fromUserId: -1
    };
    const opts = getOpts(data, "https://music.163.com/weapi/yunbei/rcmd/song/submit");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("云贝推歌: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            if (data.code == 200) {
                $.msg += `云贝推歌：成功\r\n`;
                $.log(`云贝推歌：成功`)
            } else {
                $.log(`云贝推歌：失败`)
            }
        })
    })
}

async function dailyTask(type) {
    let data = {
        type: type,
    };
    const opts = getOpts(data, "https://music.163.com/eapi/point/dailyTask");
    opts.headers['Content-Type']='application/x-www-form-urlencoded'
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log("分享朋友圈: " + err);
                resolve(null);
            }
            console.info(data)
            data = $.toObj(data);
            if (data != null && data.code == 200) {
                $.log("分享朋友圈", "成功!!")
                resolve(data);
            } else {
                $.log("分享朋友圈: " + data.msg);
                resolve(null);
            }
        })
    })
}
async function sign(type) {
    type = type || 0;
    let data = {
        "type": type || 0
    };
    const opts = getOpts(data, "https://music.163.com/weapi/point/dailyTask");
    return new Promise(resolve => {
        $.post(opts, (err, res, data) => {
            if (err) {
                $.logErr(err);
                $.log((type == 0 ? 'PC端' : 'app端') + "签到失败: " + err);
                resolve(null);
            }
            data = $.toObj(data);
            if (data != null && data.code == 200) {
                $.msg += `${type == 0 ? 'PC端' : 'app端'}签到：成功"\r\n`;
                $.log((type == 0 ? 'PC端' : 'app端') + "签到", "成功!!")
                resolve(data);
            } else {
                $.msg += `${type == 0 ? 'PC端' : 'app端'}签到：${data.msg}\r\n`;
             
                $.log((type == 0 ? 'PC端' : 'app端') + "签到: " + data.msg);
                resolve(null);
            }
        })
    })
}


async function sendNotify() {
    console.log("---------------------------发送通知--------------------------------")
    let msg = `--------【通知📢】${$.name}----------\r\n`;
    msg += "用户等级: " + `${$.userInfo.level}，距离升级还需听${$.userInfo.nextPlayCount - $.userInfo.nowPlayCount}首歌，距离升级还需登录${$.userInfo.nextLoginCount - $.userInfo.nowLoginCount}天` + "\r\n";
    msg += $.msg;
    $.log($.name, msg);
    await ntf.sendNotify($.name, msg);
}

function chooseUserAgent(ua = false) {
    const userAgentList = {
        mobile: [
            // iOS 13.5.1 14.0 beta with safari
            'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.',
            // iOS with qq micromsg
            'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML like Gecko) Mobile/14A456 QQ/6.5.7.408 V1_IPH_SQ_6.5.7_1_APP_A Pixel/750 Core/UIWebView NetType/4G Mem/103',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.15(0x17000f27) NetType/WIFI Language/zh',
            // Android -> Huawei Xiaomi
            'Mozilla/5.0 (Linux; Android 9; PCT-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.64 HuaweiBrowser/10.0.3.311 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; U; Android 9; zh-cn; Redmi Note 8 Build/PKQ1.190616.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.141 Mobile Safari/537.36 XiaoMi/MiuiBrowser/12.5.22',
            // Android + qq micromsg
            'Mozilla/5.0 (Linux; Android 10; YAL-AL00 Build/HUAWEIYAL-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.62 XWEB/2581 MMWEBSDK/200801 Mobile Safari/537.36 MMWEBID/3027 MicroMessenger/7.0.18.1740(0x27001235) Process/toolsmp WeChat/arm64 NetType/WIFI Language/zh_CN ABI/arm64',
            'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-cn; BKK-AL10 Build/HONORBKK-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/10.6 Mobile Safari/537.36',
        ],
        pc: [
            // macOS 10.15.6  Firefox / Chrome / Safari
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:80.0) Gecko/20100101 Firefox/80.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.30 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15',
            // Windows 10 Firefox / Chrome / Edge
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.30 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/13.10586',
            // Linux 就算了
        ],
    }
    let realUserAgentList =
        userAgentList[ua] || userAgentList.mobile.concat(userAgentList.pc)
    return ['mobile', 'pc', false].indexOf(ua) > -1
        ? realUserAgentList[Math.floor(Math.random() * realUserAgentList.length)]
        : ua
}
function cookieToJson(str) {
    let cookieArr = str.split(";");

    let cookieArray = [];
    cookieArr.forEach((i) => {
        let obj = {}
        let arr = i.split("=");
        obj[arr[0].trim()] = arr[1].trim();
        cookieArray.push(obj);
    });
    return cookieArray;
}
// 获取请求参数
function getOpts(data, url, crypto) {
    crypto = crypto || "weapi";
    var headers = {
        'User-Agent': chooseUserAgent(),
        "Content-Type": 'application/x-www-form-urlencoded',
        "Referer": 'application/x-www-form-urlencoded',
        "Cookie": cookie
    };
    if (url.includes('music.163.com')) {
        headers['Referer'] = 'https://music.163.com'
        url = `${url}?csrf_token=${csrf_token}`
    }
    if (crypto === 'weapi') {
        data.csrf_token = csrf_token || ''
        data = encrypt.weapi(data)
        url = url.replace(/\w*api/, 'weapi')
    } else if (crypto === 'linuxapi') {
        data = encrypt.linuxapi({
            method: method,
            url: url.replace(/\w*api/, 'api'),
            params: data,
        })
        headers['User-Agent'] =
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
        url = 'https://music.163.com/api/linux/forward'
    } else if (crypto === 'eapi') {
        const cookieObj = cookieToJson(cookie) || {}
        const csrfToken = csrf_token || ''
        const header = {
            osver: cookieObj.osver, //系统版本
            deviceId: cookieObj.deviceId, //encrypt.base64.encode(imei + '\t02:00:00:00:00:00\t5106025eb79a5247\t70ffbaac7')
            appver: cookieObj.appver || '8.0.0', // app版本
            versioncode: cookieObj.versioncode || '140', //版本号
            mobilename: cookieObj.mobilename, //设备model
            buildver: cookieObj.buildver || Date.now().toString().substr(0, 10),
            resolution: cookieObj.resolution || '1920x1080', //设备分辨率
            __csrf: csrfToken,
            os: cookieObj.os || 'android',
            channel: cookieObj.channel,
            requestId: `${Date.now()}_${Math.floor(Math.random() * 1000)
                .toString()
                .padStart(4, '0')}`,
        }
        if (cookieObj.MUSIC_U) header['MUSIC_U'] = cookieObj.MUSIC_U
        if (cookieObj.MUSIC_A) header['MUSIC_A'] = cookieObj.MUSIC_A
        headers['Cookie'] = Object.keys(header)
            .map(
                (key) =>
                    encodeURIComponent(key) + '=' + encodeURIComponent(header[key]),
            )
            .join('; ')
        data.header = header
        data = encrypt.eapi(url, data)
        url = url.replace(/\w*api/, 'eapi')
    }
    if (crypto === 'eapi') {
        headers = {
          ...headers,
          responseType: 'arraybuffer',
        }
      }
    let opts = {
        "method": "post",
        "url": `${url}`,
        "body": queryString.stringify(data),
        headers: headers
    };
    if (crypto === 'eapi') opts.encoding = null
    return opts;
}
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
 
 
