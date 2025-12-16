//import "./_client_bundle.js"; // 用 ESModule 导入（比 require 更安全）
import i18n from "@root/i18n";

// 当前i18n配置已支持语言自动切换，客户端下默认会跟随用户浏览器语言设置。例如，若用户浏览器语言为 zh-CN，则界面将显示为简体中文。
console.log("(client)：", i18n.t("welcome_game"));
console.log("(client)：", i18n.t("welcome_ap"));
console.log(
  "(client)：",
  i18n.t("navigator.language", { language: navigator.language })
);

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
house.backgroundOpacity = 0;
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
});