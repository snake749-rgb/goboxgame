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
brandtext.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体

//左下角效率面板图标
const efficiency = UiImage.create();
efficiency.zIndex = 1;
efficiency.parent = ui;
efficiency.backgroundOpacity = 0;
efficiency.size.offset.x = 380;
efficiency.size.offset.y = 200;
efficiency.position.offset.x = 0;
efficiency.position.offset.y = 570;
efficiency.image = "picture/Eff.png";

//效率面板文字
const efficiencyText1 = UiText.create();
efficiencyText1.zIndex = 2;
efficiencyText1.parent = efficiency; //文字在效率面板上
efficiencyText1.textColor.x = 255;
efficiencyText1.textColor.y = 255;
efficiencyText1.textColor.z = 0;
efficiencyText1.textFontSize = 20;
efficiencyText1.position.offset.x = -40;
efficiencyText1.position.offset.y = 0;
efficiencyText1.textXAlignment = "Center";
efficiencyText1.textYAlignment = "Center";
efficiencyText1.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体
efficiencyText1.textContent = `${i18n.t("total_time")}`;

const efficiencyText2 = UiText.create();
efficiencyText2.zIndex = 2;
efficiencyText2.parent = efficiency; //文字在效率面板上
efficiencyText2.textColor.x = 175;
efficiencyText2.textColor.y = 255;
efficiencyText2.textColor.z = 0;
efficiencyText2.textFontSize = 13;
efficiencyText2.position.offset.x = 90;
efficiencyText2.position.offset.y = 0;
efficiencyText2.textXAlignment = "Center";
efficiencyText2.textYAlignment = "Center";
efficiencyText2.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体
efficiencyText2.textContent = `${i18n.t("points_per_minute")}`;

const efficiencyText3 = UiText.create();
efficiencyText3.zIndex = 2;
efficiencyText3.parent = efficiency; //文字在效率面板上
efficiencyText3.textColor.x = 255;
efficiencyText3.textColor.y = 255;
efficiencyText3.textColor.z = 0;
efficiencyText3.textFontSize = 17;
efficiencyText3.position.offset.x = 220;
efficiencyText3.position.offset.y = 0;
efficiencyText3.textXAlignment = "Center";
efficiencyText3.textYAlignment = "Center";
efficiencyText3.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体
efficiencyText3.textContent = `${i18n.t("quests_chain")}`;

const efficiencyValue1 = UiText.create();
efficiencyValue1.zIndex = 2;
efficiencyValue1.parent = efficiency; //文字在效率面板上
efficiencyValue1.textColor.x = 255;
efficiencyValue1.textColor.y = 255;
efficiencyValue1.textColor.z = 0;
efficiencyValue1.textFontSize = 20;
efficiencyValue1.position.offset.x = -40;
efficiencyValue1.position.offset.y = 140;
efficiencyValue1.textXAlignment = "Center";
efficiencyValue1.textYAlignment = "Center";
efficiencyValue1.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体
efficiencyValue1.textContent = `0 s`;

const efficiencyValue2 = UiText.create();
efficiencyValue2.zIndex = 2;
efficiencyValue2.parent = efficiency; //文字在效率面板上
efficiencyValue2.textColor.x = 175;
efficiencyValue2.textColor.y = 255;
efficiencyValue2.textColor.z = 0;
efficiencyValue2.textFontSize = 20;
efficiencyValue2.position.offset.x = 90;
efficiencyValue2.position.offset.y = 140;
efficiencyValue2.textXAlignment = "Center";
efficiencyValue2.textYAlignment = "Center";
efficiencyValue2.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体
efficiencyValue2.textContent = `0`;

const efficiencyValue3 = UiText.create();
efficiencyValue3.zIndex = 2;
efficiencyValue3.parent = efficiency; //文字在效率面板上
efficiencyValue3.textColor.x = 255;
efficiencyValue3.textColor.y = 255;
efficiencyValue3.textColor.z = 0;
efficiencyValue3.textFontSize = 20;
efficiencyValue3.position.offset.x = 220;
efficiencyValue3.position.offset.y = 140;
efficiencyValue3.textXAlignment = "Center";
efficiencyValue3.textYAlignment = "Center";
efficiencyValue3.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体
efficiencyValue3.textContent = `0`;


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

const text4 = UiText.create();//任务限时文字（仅限部分任务）
text4.zIndex = 1;
text4.parent = ui;
text4.textColor.x = 0;
text4.textColor.y = 0;
text4.textColor.z = 0;
text4.textContent = `${i18n.t("little_hint")}`;
text4.textFontSize = 20;
text4.position.offset.x = 620;
text4.position.offset.y = 0;
text4.textXAlignment = "Center";
text4.textYAlignment = "Center";
text4.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体

// 右下角仓库空间提示文字
const spacePic = UiImage.create();
spacePic.zIndex = 1;
spacePic.parent = ui;
spacePic.size.offset.x = 400;
spacePic.size.offset.y = 200;
spacePic.position.offset.x = 1050;
spacePic.position.offset.y = 570;
spacePic.image = "picture/Space.png";

//仓库空间提示文字
const spaceText1 = UiText.create();
spaceText1.zIndex = 2;
spaceText1.parent = spacePic; //文字在界面上
spaceText1.textColor.x = 0;
spaceText1.textColor.y = 255;
spaceText1.textColor.z = 0;
spaceText1.textContent = `0/10`;
spaceText1.textFontSize = 30;
spaceText1.position.offset.x = 5;
spaceText1.position.offset.y = 140;
spaceText1.textXAlignment = "Center";
spaceText1.textYAlignment = "Center";
spaceText1.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体

const spaceText2 = UiText.create();
spaceText2.zIndex = 2;
spaceText2.parent = spacePic; //文字在界面上
spaceText2.textColor.x = 255;
spaceText2.textColor.y = 0;
spaceText2.textColor.z = 0;
spaceText2.textContent = `0/10`;
spaceText2.textFontSize = 30;
spaceText2.position.offset.x = 195;
spaceText2.position.offset.y = 140;
spaceText2.textXAlignment = "Center";
spaceText2.textYAlignment = "Center";
spaceText2.textFontFamily = UITextFontFamily.CodeNewRomanBold; // 使用等宽粗体字体

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
  else if(event[0]=="E"){
    // 更新效率面板显示
    efficiencyValue1.textContent = `${Math.round(event.slice(1,7))} s`;
    efficiencyValue2.textContent = `${Math.round(event.slice(7,11))}`;
    efficiencyValue3.textContent = `${Math.round(event.slice(11,14))}`;
  }
  else if(event[0]=="F"){
    // 仓库已满提示
    middleWarning.textContent = i18n.t("warehouse_full");
    setTimeout(() => {
      middleWarning.textContent = "";
    }, 2000); // 2秒后清除提示信息
  }
  else if(event[0]=="X"){
    // 更新仓库储量显示
    spaceText1.textContent = `${Math.round(event.slice(1,3))}/10`;
    spaceText2.textContent = `${Math.round(event.slice(3,5))}/10`;
  }
  else if(event[0]=="A"){
    // 提示仓库重新清空
    middleWarning.textContent = i18n.t("warehouse_cleared");
    middleWarning.textColor.x = 0;
    middleWarning.textColor.y = 255;
    middleWarning.textColor.z = 0;
    middleWarning.textFontSize = 40;
    setTimeout(() => {
      middleWarning.textContent = "";
      middleWarning.textColor.x = 255;
      middleWarning.textColor.y = 0;
      middleWarning.textColor.z = 0;
      middleWarning.textFontSize = 100;
    }, 2000); // 2秒后清除提示信息
  }
});