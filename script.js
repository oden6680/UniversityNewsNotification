const WEBHOOK_URL = 'DiscordのWebHook'

const scraping = () =>{
  const URL = "スクレイピングしたいwebサイトのURL";
  let response = UrlFetchApp.fetch(URL);
  let html = response.getContentText("UTF-8");

  //この部分はWeb際のによって変更する必要あり
  let newsData = Parser.data(html)
    .from("<p class=\"c-txt-v2\">")
    .to("</p>")
    .iterate();

  return newsData;
}

function writeSpreadsheet(item){
  const id = "googleスプレッドシートのID";
  let ss = SpreadsheetApp.openById(id);
  let sheet = ss.getActiveSheet();
  for(let i = 0; i < item.length; i++){
    sheet.getRange(i+1, 1).setValue(item[i]);
  }
}

const getSpreadsheet = () =>{
  const id = "スプレッドシートのID";
  let ss = SpreadsheetApp.openById(id);
  let sheet = ss.getActiveSheet();
  let range = sheet.getRange(1, 1, 11);
  const ssData = range.getValues();

  let resultData = [];
  for (i of ssData){
    resultData.push(i[0]);
  }
  return resultData;
}

const main = () =>{
  const todayNews = scraping();
  const yesterdayNews = getSpreadsheet();
  
  let diffNews = todayNews.filter((val) => !yesterdayNews.includes(val))

  let message = "今日の新しいお知らせはありません。\n最新のお知らせはこちらから確認できます。\n https://chs.nihon-u.ac.jp/information/ \n";

  if (diffNews.length != 0){
    writeSpreadsheet(todayNews);
    let extensionMessage = ""
    for (i of diffNews){
      extensionMessage += "◇" + i + "\n";
    }
    message = "以下の新しいお知らせがあります。確認してください。\n" + extensionMessage + "最新のお知らせはこちらから確認できます。\n https://chs.nihon-u.ac.jp/information/ \n"
  }

  const payload = {
    username: "文理学部からのお知らせ",
    content: message,
  };

  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  });
}

//GASで毎日同じ時間にプログラムを実行するトリガーが設定できないので、プログラムを走らせた時に次のトリガーを自動で設定する必要がある
//以下はトリガー設定用の関数
const setTrigger = () => {
  let triggerDay = new Date();
  triggerDay.setDate(triggerDay.getDate() + 1)
  triggerDay.setHours(0);
  triggerDay.setMinutes(00);

  ScriptApp.newTrigger("main")
      .timeBased()
      .at(triggerDay)
      .create();
}
 