//import "./_client_bundle.js"; // 用 ESModule 导入（比 require 更安全）
import i18n from "@root/i18n";

// 当前i18n配置已支持语言自动切换，客户端下默认会跟随用户浏览器语言设置。例如，若用户浏览器语言为 zh-CN，则界面将显示为简体中文。
console.log("(client)：", i18n.t("welcome_game"));
console.log("(client)：", i18n.t("welcome_ap"));
console.log(
  "(client)：",
  i18n.t("navigator.language", { language: navigator.language })
);
// 将客户端语言发送给服务端，便于服务端为你定制提示语言
remoteChannel.sendServerEvent(navigator.language);
//remoteChannel.sendServerEvent(navigator.language);

/*
function setValue(dictionary: { x: any; y: any; z: any; },x: any,y: any,z: any){
  dictionary.x=x
  dictionary.y=y
  dictionary.z=z
}
  */
// 左上角仓储图标
const house = UiImage.create();
house.zIndex = 1;
house.parent = ui;
house.backgroundOpacity = 0;//透明背景
house.size.offset.x = 300;
house.size.offset.y = 300;
house.position.offset.x = 0;
house.position.offset.y = -40;
house.image = "picture/仓储图标.png";

//挂牌图标
const brand = UiImage.create();
brand.zIndex = 2;
brand.parent = ui;
brand.backgroundOpacity = 0;
brand.size.offset.x = 220;
brand.size.offset.y = 82;
brand.position.offset.x = 40;
brand.position.offset.y = 30;
brand.image = "picture/挂牌.png";

//挂牌上显示收集箱子数量的文字
const brandtext = UiText.create();
brandtext.zIndex = 3;
brandtext.parent = brand; //文字在挂牌上
brandtext.textColor.x = 0;
brandtext.textColor.y = 0;
brandtext.textColor.z = 255;
brandtext.textContent = i18n.t("points_earned.num", { num: 0 }); //初始为0个箱子
brandtext.textFontSize = 20;
brandtext.position.offset.x = 10;
brandtext.position.offset.y = 30;
brandtext.textXAlignment = "Center";
brandtext.textYAlignment = "Center";

// 右上角任务图标
const task = UiImage.create();
task.zIndex = 1;
task.parent = ui;
task.backgroundOpacity = 0;
task.size.offset.x = 300;
task.size.offset.y = 450;
task.position.offset.x = 1150;
task.position.offset.y = -20;
task.image = "picture/仓储任务面板.png";

const text1 = UiText.create();//任务说明文字
text1.zIndex = 2;
text1.parent = task;
text1.textColor.x = 0;
text1.textColor.y = 0;
text1.textColor.z = 255;
text1.textContent = `${i18n.t("task_description")}
`;
text1.textFontSize = 20;
text1.position.offset.x = 60;
text1.position.offset.y = 115;
text1.textXAlignment = "Left";
text1.textYAlignment = "Top";
text1.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体

const text1A = UiText.create();//任务说明文字（太长得换字号）
text1A.zIndex = 2;
text1A.parent = task;
text1A.textColor.x = 0;
text1A.textColor.y = 0;
text1A.textColor.z = 255;
text1A.textContent = ``;
text1A.textFontSize = 12;// 较小字号
text1A.position.offset.x = 60;
text1A.position.offset.y = 140;
text1A.textXAlignment = "Left";
text1A.textYAlignment = "Top";
text1A.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体

const text2 = UiText.create();//任务进度文字
text2.zIndex = 2;
text2.parent = task;
text2.textColor.x = 0;
text2.textColor.y = 0;
text2.textColor.z = 255;
text2.textContent = `${i18n.t("task_progress")}
`;
text2.textFontSize = 20;
text2.position.offset.x = 60;
text2.position.offset.y = 197;
text2.textXAlignment = "Left";
text2.textYAlignment = "Top";
text2.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体

const text3 = UiText.create();//任务限时文字（仅限部分任务）
text3.zIndex = 2;
text3.parent = task;
text3.textColor.x = 0;
text3.textColor.y = 0;
text3.textColor.z = 255;
text3.textContent = `${i18n.t("task_time")}
`;
text3.textFontSize = 20;
text3.position.offset.x = 60;
text3.position.offset.y = 279;
text3.textXAlignment = "Left";
text3.textYAlignment = "Top";
text3.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体

//中心类型错误提示信息
const middleWarning = UiText.create();
middleWarning.zIndex = 1;
middleWarning.parent = ui; //文字在界面上
middleWarning.textColor.x = 255;
middleWarning.textColor.y = 0;
middleWarning.textColor.z = 0;
middleWarning.textContent = ""; //初始为空
middleWarning.textFontSize = 100;
middleWarning.position.offset.x = 625;
middleWarning.position.offset.y = 350;
middleWarning.textXAlignment = "Center";
middleWarning.textYAlignment = "Center";
middleWarning.textFontFamily = UITextFontFamily.BoldRound; // 使用粗体字体

remoteChannel.events.on("client",(event)=>{
  if(event[0]=="U"){
    // 更新界面显示
    brandtext.textContent = i18n.t("points_earned.num", { num: Math.round(event.slice(1,5)) })
  }
  else if(event[0]=="W"){
    // 显示类型错误信息
    middleWarning.textContent = i18n.t("wrong_type");
    setTimeout(() => {
      middleWarning.textContent = "";
    }, 2000); // 2秒后清除提示信息
  }
  else if(event[0]=="T"){
    // 更新任务面板显示
    text1.textContent = `${i18n.t("task_description")}`
    text1A.textContent = `${i18n.t(`tasks.${event.slice(1,2)}` as any, { num: Math.round(event.slice(2,4)), time: Math.round(event.slice(6,9)) })}`;
    text2.textContent = `${i18n.t("task_progress")}
${Math.round(event.slice(4,6))} / ${Math.round(event.slice(2,4))}`;
    text3.textContent = `${i18n.t("task_time")}
${Math.round(event.slice(9,12))} (s)`;
    if(event.slice(6,9)=="0-1"){// 非限时任务
      text3.textContent = `${i18n.t("task_time")}
--`;
    }
  }
});