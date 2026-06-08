// 画面の部品を取得する。
const atkSearchInput = document.getElementById("atkSearchInput");
const defSearchInput = document.getElementById("defSearchInput");
const moveSearchInput = document.getElementById("moveSearchInput");
const atkEvInput = document.getElementById("atkEvInput");
const defEvInput = document.getElementById("defEvInput");
const hpEvInput = document.getElementById("hpEvInput");
const attackTypeSelect = document.getElementById("attackTypeSelect");
const defenceTypeSelect = document.getElementById("defenceTypeSelect");
const attackerSearch = document.getElementById("attackerSearch");
const defenderSearch = document.getElementById("defenderSearch");
const atkRankSelect = document.getElementById("atkRankSelect");
const defRankSelect = document.getElementById("defRankSelect");
const situationSelect = document.getElementById("situationSelect");
const atkTraitSelect = document.getElementById("atkTraitSelect");
const defTraitSelect = document.getElementById("defTraitSelect");
const barrierSelect = document.getElementById("barrierSelect");
const moveSearch = document.getElementById("moveSearch");
const hpInput = document.getElementById("hpInput");
const attackInput = document.getElementById("attackInput");
const powerInput = document.getElementById("powerInput");
const defenceInput = document.getElementById("defenceInput");
const speedInput1 = document.getElementById("speedInput1");
const speedInput2 = document.getElementById("speedInput2");
const stabCheck = document.getElementById("stabCheck");
const fieldCheck = document.getElementById("fieldCheck");
const vitalCheck = document.getElementById("vitalCheck");
const itemSelect = document.getElementById("itemSelect");
const weatherSelect = document.getElementById("weatherSelect");
const calcButton = document.getElementById("calcButton");
const resultArea = document.getElementById("resultArea");

// データを格納する配列である。
let pokedex = [];
let moveDex = [];

// CSVのテキストをポケモンの配列に変換する関数である。
function parsePokemonCSV(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    
    // 1行目のヘッダーを飛ばすためにインデックス1から開始する。
    for (let i = 1; i < lines.length; i++) {
        // 空の行は無視する。
        if (!lines[i].trim()) continue; 
        
        // カンマで区切って配列にする。
        const data = lines[i].split(',');

        // 名前にフォルムを結合する。
        let pokemonName = data[1];
        let formName = data[2];
        
        // フォルムが通常以外、かつ空欄ではない場合、名前の後ろに付与する。
        if (formName && formName !== "通常" && formName !== "") {
            pokemonName = pokemonName + "(" + formName + ")";
        }

        // 必要な列を取得する。
        result.push({
            name: pokemonName,
            type1: data[3],
            type2: data[4] ? data[4].trim() : "なし",
            hp: Number(data[5]),
            attack: Number(data[6]),
            defence: Number(data[7]),
            spAttack: Number(data[8]),
            spDefence: Number(data[9]),
            speed: Number(data[10]),
            ability1: data[11] ? data[11].trim() : "",
            ability2: data[12] ? data[12].trim() : "",
            hiddenAbility: data[13] ? data[13].trim() : ""
        });
    }
    return result;
}

// ダブルクォーテーションで囲まれた改行やカンマに対応したCSV解析関数である。
function parseCSVRobust(text) {
    let result = [];
    let row = [];
    let cell = '';
    let insideQuotes = false; 

    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        
        if (char === '"') {
            if (insideQuotes && text[i + 1] === '"') {
                cell += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            row.push(cell);
            cell = '';
        } else if (char === '\n' && !insideQuotes) {
            row.push(cell);
            result.push(row);
            row = [];
            cell = '';
        } else if (char === '\r' && !insideQuotes) {
            if (text[i + 1] === '\n') i++;
            row.push(cell);
            result.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }
    
    if (cell || row.length > 0) {
        row.push(cell);
        result.push(row);
    }
    return result;
}

// CSVのテキストを技の配列に変換する関数である。
function parseMoveCSV(csvText) {
    const rows = parseCSVRobust(csvText);
    const result = [];
    
    // 1行目のヘッダーを飛ばす。
    for (let i = 1; i < rows.length; i++) {
        const data = rows[i];
        
        // データが不足している行や名前が空の行は無視する。
        if (data.length < 4 || !data[0].trim()) continue;

        // 分類を内部用のコードに変換する。
        let categoryCode = "";
        if (data[2] === "ぶつり") {
            categoryCode = "atk";
        } else if (data[2] === "とくしゅ") {
            categoryCode = "spAtk";
        } else {
            categoryCode = "status"; 
        }

       
        result.push({
            name: data[0],
            type: data[1],
            category: categoryCode,
            power: Number(data[3]) || 0,
            isContact: data[6] ? (data[6].trim() === "〇") : false, // 接触技 (7列目)
            isSound:   data[7] ? (data[7].trim() === "〇") : false, // 音技 (8列目)
            isPunch:   data[8] ? (data[8].trim() === "〇") : false, // パンチ技 (9列目)
            isBite:    data[9]? (data[9].trim() === "〇"): false, // 牙技 (10列目)
            isAura:    data[10]? (data[10].trim() === "〇"): false  // 波動技 (11列目)
        });
    }
    return result;
}

// アプリ起動時にサーバー上のCSVを自動で読み込む関数である。
async function initApp() {
    try {
        const pokeResponse = await fetch('./pokemon.csv');
        const pokeText = await pokeResponse.text();
        pokedex = parsePokemonCSV(pokeText);

        const moveResponse = await fetch('./move.csv');
        const moveText = await moveResponse.text();
        moveDex = parseMoveCSV(moveText);

        // セレクトボックスを初期化する。
        updateSelectBox(attackerSearch, pokedex, "");
        updateSelectBox(defenderSearch, pokedex, "");
        updateSelectBox(moveSearch, moveDex, "");
        
        console.log("データの読み込みが完了した。");
    } catch (error) {
        console.error("データの読み込みに失敗した。", error);
    }
}

// ひらがなをカタカナに変換する関数である。
function hiraToKata(str) {
    // ひらがなの範囲にある文字を見つけたら、文字コードに96(16進数で0x60)を足してカタカナに変換する。
    return str.replace(/[\u3041-\u3096]/g, function(match) {
        let chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
    });
}

// セレクトボックスを更新し、検索時に並び替え（ソート）を行う共通関数である。
function updateSelectBox(selectElement, dataArray, keyword) {
    selectElement.innerHTML = '<option value="">選択してください</option>';
    
    //入力されたキーワードを強制的にカタカナに変換する。
    let kataKeyword = hiraToKata(keyword);
    
    let matchedItems = [];

    for (let i = 0; i < dataArray.length; i++) {
        let dataName = dataArray[i].name;
        
        //変換された kataKeyword を使って含まれているかチェックする。
        if (dataName.includes(kataKeyword)) {
            matchedItems.push({ index: i, name: dataName });
        }
    }

    // 検索キーワードから始まる名前を優先して上に並び替える処理である。
    matchedItems.sort((a, b) => {
        //ここもkataKeyword を使う。
        let aStarts = a.name.startsWith(kataKeyword);
        let bStarts = b.name.startsWith(kataKeyword);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0; 
    });

    for (let j = 0; j < matchedItems.length; j++) {
        let item = matchedItems[j];
        let option = document.createElement("option");
        option.text = item.name;
        option.value = item.index;
        selectElement.appendChild(option);
    }
}

// 特性のセレクトボックスを自動で更新する関数である。
function updateTraitSelect(selectElement, pokemon) {
    selectElement.innerHTML = ''; // 中身を一旦リセットする

    // CSVのデータから特性1を追加
    if (pokemon.ability1) {
        let option1 = document.createElement("option");
        option1.text = pokemon.ability1;
        option1.value = pokemon.ability1; // valueに「あついしぼう」などの名前を入れる
        selectElement.appendChild(option1);
    }
    // 特性2を追加
    if (pokemon.ability2) {
        let option2 = document.createElement("option");
        option2.text = pokemon.ability2;
        option2.value = pokemon.ability2;
        selectElement.appendChild(option2);
    }
    // 夢特性を追加
    if (pokemon.hiddenAbility) {
        let option3 = document.createElement("option");
        option3.text = pokemon.hiddenAbility + " (夢)";
        option3.value = pokemon.hiddenAbility;
        selectElement.appendChild(option3);
    }

    // 「特性なし/無視」の選択肢を追加
    let optionNone = document.createElement("option");
    optionNone.text = "特性なし / 無視";
    optionNone.value = "none";
    selectElement.appendChild(optionNone);
}

// ページ読み込み時に初期化関数を実行する。
initApp();

// 検索ボックスの入力イベントを設定する。
atkSearchInput.addEventListener("input", function() {
    updateSelectBox(attackerSearch, pokedex, this.value);
});

defSearchInput.addEventListener("input", function() {
    updateSelectBox(defenderSearch, pokedex, this.value);
});

moveSearchInput.addEventListener("input", function() {
    updateSelectBox(moveSearch, moveDex, this.value);
});

// 技が変更されたときの処理である。
moveSearch.addEventListener("change", function(){
    let index = moveSearch.value;

    if (index !== ""){
        let selectedMove = moveDex[index];
        powerInput.value = selectedMove.power;

        if(selectedMove.category === "atk"){
            attackTypeSelect.value = "attack";
            defenceTypeSelect.value = "defence";
        } else if (selectedMove.category === "spAtk"){
            attackTypeSelect.value = "spAttack";
            defenceTypeSelect.value = "spDefence";
        }

        updateAttacker();
        updateDefender();
    }
});

// 攻撃側のポケモンや設定が変更されたときの処理である。
function updateAttacker(){
    let index = attackerSearch.value;

    if(index !== ""){
        let selectedPokemon = pokedex[index];
        let statType = attackTypeSelect.value;
        let baseAttack = selectedPokemon[statType];
        let baseSpeed1 = selectedPokemon.speed;

        let nature = 1.1; 
        let atkEv = Number(atkEvInput.value); 
        
        // チャンピオンズ仕様のステータス計算である。
        let coreStat = Math.floor((baseAttack * 2 + 31) * 50 / 100) + 5 + atkEv;
        let finalStat = Math.floor(coreStat * nature);


       // 特性の処理である。
        let trait = atkTraitSelect.value;
        if ((trait === "ちからもち" || trait === "ヨガパワー") && statType === "attack") {
            finalStat = Math.floor(finalStat * 2);
        }

        if((trait === "はりきり") && statType === "attack"){
            finalStat = Math.floor(finalStat * 1.5);
        }

        
        attackInput.value = finalStat;

        let speedEvCalc1 = Math.floor(252 / 4);
        let finalSpeed1 = Math.floor((baseSpeed1 * 2 + 31 + speedEvCalc1) * 50 / 100) + 50 + 10;
        speedInput1.value = finalSpeed1;
    }
}

// 防御側のポケモンや設定が変更されたときの処理である。
function updateDefender(){
    let index = defenderSearch.value;

    if(index !== ""){
        let selectedPokemon = pokedex[index];
        let defStatType = defenceTypeSelect.value;

        let baseHP = selectedPokemon.hp;
        let baseDef = selectedPokemon[defStatType];
        let baseSpeed2 = selectedPokemon.speed;

        let nature = 1.1;
        let defEv = Number(defEvInput.value);
        
        // チャンピオンズ仕様の防御力計算である。
        let defCore = Math.floor((baseDef * 2 + 31) * 50 / 100) + 5 + defEv;
        let finalDef = Math.floor(defCore * nature);
        defenceInput.value = finalDef;

        // チャンピオンズ仕様のHP計算である。
        let hpEv = Number(hpEvInput.value);
        let finalHP = Math.floor((baseHP * 2 + 31) * 50 / 100) + 60 + hpEv; 
        hpInput.value = finalHP;

        let speedEvCalc2 = Math.floor(252 / 4);
        let finalSpeed2 = Math.floor((baseSpeed2 * 2 + 31 + speedEvCalc2) * 50 / 100) + 50 + 10;
        speedInput2.value = finalSpeed2;
    }
}

// 攻撃・防御の各種設定が変更された際にステータスを更新する。
// 攻撃側のポケモンが選ばれたときに、特性ボックスを書き換えてからステータスを更新する。
attackerSearch.addEventListener("change", function() {
    let index = attackerSearch.value;
    if (index !== "") {
        // ★攻撃側のセレクトボックス（atkTraitSelect）を更新！
        updateTraitSelect(atkTraitSelect, pokedex[index]);
    }
    updateAttacker();
});

// 防御側のポケモンが選ばれたときの処理。
defenderSearch.addEventListener("change", function() {
    let index = defenderSearch.value;
    if (index !== "") {
        // ★防御側のセレクトボックス（defTraitSelect）を更新！
        updateTraitSelect(defTraitSelect, pokedex[index]);
    }
    updateDefender();
});

// その他の設定変更時の処理
attackTypeSelect.addEventListener("change", updateAttacker);
atkTraitSelect.addEventListener("change", updateAttacker);
atkEvInput.addEventListener("change", updateAttacker);

defenceTypeSelect.addEventListener("change", updateDefender);
defTraitSelect.addEventListener("change", updateDefender);
defEvInput.addEventListener("change", updateDefender);
hpEvInput.addEventListener("change", updateDefender);

// 攻撃の種類を手動で変更した場合、防御側も自動で合わせる。
attackTypeSelect.addEventListener("change", function() {
    if (attackTypeSelect.value === "attack") {
        defenceTypeSelect.value = "defence";
    } else if (attackTypeSelect.value === "spAttack") {
        defenceTypeSelect.value = "spDefence";
    }
    updateDefender();
});

// タイプ相性を判定する関数である。
function checkTypeMatch(defType, moveType){
    // 相手が単タイプで、type2が「なし」の場合は1.0倍を返す。
    if (defType === "なし" || !defType || !moveType) {
        return 1.0;
    }

    const typeChart = {
        "ノーマル": { "いわ": 0.5, "はがね": 0.5, "ゴースト": 0 },
        "ほのお":   { "くさ": 2.0, "こおり": 2.0, "むし": 2.0, "はがね": 2.0, "ほのお": 0.5, "みず": 0.5, "いわ": 0.5, "ドラゴン": 0.5 },
        "みず":     { "ほのお": 2.0, "じめん": 2.0, "いわ": 2.0, "みず": 0.5, "くさ": 0.5, "ドラゴン": 0.5 },
        "でんき":   { "みず": 2.0, "ひこう": 2.0, "でんき": 0.5, "くさ": 0.5, "ドラゴン": 0.5, "じめん": 0 },
        "くさ":     { "みず": 2.0, "じめん": 2.0, "いわ": 2.0, "ほのお": 0.5, "くさ": 0.5, "どく": 0.5, "ひこう": 0.5, "むし": 0.5, "ドラゴン": 0.5, "はがね": 0.5 },
        "こおり":   { "くさ": 2.0, "じめん": 2.0, "ひこう": 2.0, "ドラゴン": 2.0, "ほのお": 0.5, "みず": 0.5, "こおり": 0.5, "はがね": 0.5 },
        "かくとう": { "ノーマル": 2.0, "こおり": 2.0, "いわ": 2.0, "あく": 2.0, "はがね": 2.0, "どく": 0.5, "ひこう": 0.5, "エスパー": 0.5, "むし": 0.5, "フェアリー": 0.5, "ゴースト": 0 },
        "どく":     { "くさ": 2.0, "フェアリー": 2.0, "どく": 0.5, "じめん": 0.5, "いわ": 0.5, "ゴースト": 0.5, "はがね": 0 },
        "じめん":   { "ほのお": 2.0, "でんき": 2.0, "どく": 2.0, "いわ": 2.0, "はがね": 2.0, "くさ": 0.5, "むし": 0.5, "ひこう": 0 },
        "ひこう":   { "くさ": 2.0, "かくとう": 2.0, "むし": 2.0, "でんき": 0.5, "いわ": 0.5, "はがね": 0.5 },
        "エスパー": { "かくとう": 2.0, "どく": 2.0, "エスパー": 0.5, "はがね": 0.5, "あく": 0 },
        "むし":     { "くさ": 2.0, "エスパー": 2.0, "あく": 2.0, "ほのお": 0.5, "かくとう": 0.5, "どく": 0.5, "ひこう": 0.5, "ゴースト": 0.5, "はがね": 0.5, "フェアリー": 0.5 },
        "いわ":     { "ほのお": 2.0, "こおり": 2.0, "ひこう": 2.0, "むし": 2.0, "かくとう": 0.5, "じめん": 0.5, "はがね": 0.5 },
        "ゴースト": { "エスパー": 2.0, "ゴースト": 2.0, "あく": 0.5, "ノーマル": 0 },
        "ドラゴン": { "ドラゴン": 2.0, "はがね": 0.5, "フェアリー": 0 },
        "あく":     { "エスパー": 2.0, "ゴースト": 2.0, "かくとう": 0.5, "あく": 0.5, "フェアリー": 0.5 },
        "はがね":   { "こおり": 2.0, "いわ": 2.0, "フェアリー": 2.0, "ほのお": 0.5, "みず": 0.5, "でんき": 0.5, "はがね": 0.5 },
        "フェアリー":{ "かくとう": 2.0, "ドラゴン": 2.0, "あく": 2.0, "ほのお": 0.5, "どく": 0.5, "はがね": 0.5 }
    };

    if (typeChart[moveType] && typeChart[moveType][defType] !== undefined) {
        return typeChart[moveType][defType];
    }
    return 1.0;
}

// ランク補正の倍率を計算する関数である。
function getRankModifier(rank) {
    if (rank >= 0) {
        return (2 + rank) / 2;
    } else {
        return 2 / (2 - rank);
    }
}

// 最終的なダメージ計算を行う関数である。
function calculateDamage(power, attack, defence, atkRank, defRank, isStab, vital, modifier, item, field, defTrait, moveType, weather, situationModifier, statType, barrier, atkTrait, isContact, isPunch, isBite, isAura){
    if(field === true){
        power = Math.floor(power * 1.3);
    }

   if (atkTrait === "かたいつめ" && isContact === true) {
        power = Math.floor(power * 1.3);
    }

    if (atkTrait === "てつのこぶし" && isPunch === true) {
        power = Math.floor(power * 1.2);
    }

    if (atkTrait === "パンクロック" && isBite === true) {
        power = Math.floor(power * 1.3);
    }

    if (atkTrait === "がんじょうあご" && isContact === true) {
        power = Math.floor(power * 1.3);
    }

    if (atkTrait === "メガランチャー" && isAura === true) {
        power = Math.floor(power * 1.5);
    }

    

    if(weather === "sun"){
        if(moveType === "ほのお") power = Math.floor(power * 1.5);
    }

    let tempAtkRank = atkRank;
    let tempDefRank = defRank;

    if(vital === true){
        // 急所の場合、自身に不利なランク補正を無視する。
        if (tempAtkRank < 0) {
            tempAtkRank = 0;
        }
        if (tempDefRank > 0) {
            tempDefRank = 0;
        }
    }

    let atkRankMod = getRankModifier(tempAtkRank);
    let defRankMod = getRankModifier(tempDefRank);

    let finalAtk = Math.floor(attack * atkRankMod);
    let finalDef = Math.floor(defence * defRankMod);

    // 基本ダメージを計算する。
    let step2 = Math.floor(22 * power * finalAtk / finalDef);    
    let baseDamage = Math.floor(step2 / 50) + 2;

    // やけどの処理である。
    if (statType === "attack" && situationModifier === 0.5) {
    if(atkTrait === "こんじょう"){
            baseDamage = Math.floor(baseDamage * 1.5);
        }

    else{ baseDamage = Math.floor(baseDamage * 0.5);
    }
    }

    
    // 壁の処理である。
    if (vital === false) { 
        if (statType === "attack" && barrier === "reflect") {
            baseDamage = Math.floor(baseDamage * 0.5); 
        } else if (statType === "spAttack" && barrier === "lightScreen") {
            baseDamage = Math.floor(baseDamage * 0.5); 
        }
    }

    // 防御側の特性処理である。
    if(defTrait === "あついしぼう" && (moveType === "ほのお" || moveType === "こおり") ){
        baseDamage = Math.floor(baseDamage / 2);
    }

    
   // 急所のダメージ補正である。
    if(vital === true){
        if(atkTrait === "スナイパー"){
            // スナイパーなら急所ダメージ2.25倍！
            baseDamage = Math.floor(baseDamage * 2.25);
        } else {
            // 通常の急所は1.5倍
            baseDamage = Math.floor(baseDamage * 1.5);
        }
    }

    // 乱数によるダメージのブレを計算する。
    let minDamage = Math.floor(baseDamage * 0.85);
    let maxDamage = Math.floor(baseDamage * 1.0); 

    // タイプ一致の補正である。
    if (isStab === true) {
        minDamage = Math.floor(minDamage * 1.5);
        maxDamage = Math.floor(maxDamage * 1.5);
    }

    // タイプ相性の補正である。
    minDamage = Math.floor(minDamage * modifier);
    maxDamage = Math.floor(maxDamage * modifier);

    // 持ち物による補正である。
    if (item === "typeBoost") {
        minDamage = Math.floor(minDamage * 1.2);
        maxDamage = Math.floor(maxDamage * 1.2);
    }

    return [minDamage, maxDamage]; 
}

// 計算ボタンがクリックされた時の処理である。
calcButton.addEventListener("click", function() {
    let attack = Number(attackInput.value);
    let power = Number(powerInput.value);
    let defence = Number(defenceInput.value);

    let situationModifier = Number(situationSelect.value); 
    let statType = attackTypeSelect.value;

    let atkRank = Number(atkRankSelect.value); 
    let defRank = Number(defRankSelect.value);

    let moveIndex = moveSearch.value;
    let moveType = "";
    let isContact = false;
    let isPunch = false;
    let isBite = false;
    let isAura = false;
    
    if(moveIndex !== ""){
        moveType = moveDex[moveIndex].type;
        isContact = selectedMove.isContact;
        isPunch = selectedMove.isPunch;
        isBite = selectedMove.isBite;
        isAura = selectedMove.isAura;
    }    

    let defIndex = defenderSearch.value;
    let defType1 = pokedex[defIndex].type1;
    let defType2 = pokedex[defIndex].type2;

    let mod1 = checkTypeMatch(defType1, moveType); 
    let mod2 = checkTypeMatch(defType2, moveType);
    let modifier = mod1 * mod2;

    let defenderHP = Number(hpInput.value);

    let field = fieldCheck.checked;
    let isStab = stabCheck.checked;
    let vital  = vitalCheck.checked;

    let defTrait = document.getElementById("defTraitSelect").value;
    let barrier = barrierSelect.value;
    let weather = weatherSelect.value;
    let item = itemSelect.value;

    // 関数に引数を渡してダメージを計算する。
    let damageRange = calculateDamage(power, attack, defence, atkRank, defRank, isStab, vital, modifier, item, field, defTrait, moveType, weather, situationModifier, statType, barrier, atkTrait, isContact, isPunch, isBite, isAura);
    let minDamage = damageRange[0];
    let maxDamage = damageRange[1];

    // HPに対する割合を計算する。
    let minPercent = (minDamage / defenderHP) * 100;
    minPercent = Math.floor(minPercent * 100) / 100;
    let maxPercent = (maxDamage / defenderHP) * 100;
    maxPercent = Math.floor(maxPercent * 100) / 100;

    // 確定・乱数で倒せる発数を判定する。
    let hitCountText = "";
    if(minPercent >= 100){
        hitCountText = "（確定1発）";
    } else if(maxPercent >= 100){
        hitCountText = "（乱数1発）";
    } else if(minPercent >= 50){
        hitCountText = "（確定2発）";
    } else if(maxPercent >= 50){
        hitCountText = "（乱数2発）";
    } else if(minPercent >= 33.3){
        hitCountText = "（確定3発）";
    } else {
        hitCountText = "（4発以上）";
    }
    
    // 結果を画面に出力する。
    let resultText = "ダメージ:" + minDamage + " ～ " + maxDamage + "<br>";   
    resultText += "割合: " + minPercent + "% ～ " + maxPercent + "%<br>";
    resultText += "目安: " + hitCountText;

    resultArea.innerHTML = resultText;
});
