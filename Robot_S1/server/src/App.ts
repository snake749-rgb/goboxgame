import i18n from "@root/i18n";
import { changeLanguage } from "i18next";

console.log("(server)：", i18n.t("welcome_game"));
console.log("(server)：", i18n.t("welcome_ap"));
// 规范化语言代码（如 en_US -> en-US），并按需保存到玩家实体上。这是为了让服务端代码也能够根据玩家语言进行响应。（初始设定里面没有这个！建议之后加上！@开发者）当然App之后要使用i18n.t时也要传入对应的语言参数lng。
function normalizeLang(l: any): string {
  if (!l || typeof l !== "string") return "en";
  return l.split(".")[0].replace("_", "-");
}

remoteChannel.onServerEvent(({ entity, args }) => {
  (entity as any).lang = normalizeLang(args);
});

world.addCollisionFilter('player','player');//关闭玩家碰撞
world.useOBB=true;//开启OBB碰撞检测以提升性能

// 这段代码的意思是：
// 当有任何新玩家(onPlayerJoin)加入这个世界(world)时，
// 我们就执行括号里的操作
world.onPlayerJoin(({ entity }) => {
  const changedEntity = entity as unknown as any;

  //玩家积分初始化为0
  changedEntity.score = 0;
  changedEntity.time=0;// 玩家游戏时间初始化为0
  //changedEntity.scorePerMinute=0;// 玩家每分钟得分初始化为0 // 该数据可由客户端计算，无需服务端存储
  changedEntity.questsChain=0;// 玩家任务链数初始化为0

  //玩家拿着的箱子的来源是否为传送带
  changedEntity.fromConveyor = false;

  // 玩家是否正在自动寻找传送带箱子
  changedEntity.searchingAutoBox = false;

  // 禁止跳跃
  entity.player.enableJump = false;

  // 从场景中查找机器人实体并复制它的 mesh
  const source = world.querySelector("#和平队长-1"); // 机器人暂定和平队长）））
  if (source) {
    changedEntity.mesh = (source as any).mesh; // 带类型断言以避免 TS 报错
  }
  
  // 玩家大小
  entity.meshScale = new GameVector3(2 / 16, 2 / 16, 2 / 16);
  entity.player.scale = 2 / 16; // 视角大小也受此数值影响

  // 玩家本身的皮肤消失
  entity.player.invisible = true;

  //玩家潜行、走路和跑步速度相等且为定值v
  let playerSpeed = 0.6;
  entity.player.walkSpeed = entity.player.runSpeed = playerSpeed;
  // 潜行速度设置无效，可能是引擎问题
});

let wareHouse = [0,0]// 仓库中绿箱子和红箱子的数量，上限10个

world.onPlayerJoin(async({ entity }) => {// 玩家任务分配
  const changedEntity = entity as unknown as any;
  changedEntity.task = [0,0,0,-1,-1] as [number,number,number,number,number];
  // 任务格式：
  // [任务类型编号（1：绿箱子，2：红箱子，3：限时任务，4：无错误收集，5：通用分拣站收集），
  // 任务具体所需进度（在一定范围内的随机数），
  // 玩家进度，
  // 任务总时间（秒）（如果是限时任务），
  // 任务剩余时间（秒）（如果是限时任务）]
  changedEntity.task[0] = Math.floor(Math.random()*2+1)// 随机生成任务类型，由于是第一次，玩家可能没准备好，不会生成限时任务
  if(changedEntity.task[0]==1 || changedEntity.task[0]==2){// 非限时任务
    changedEntity.task[1] = Math.floor(Math.random()*3+6);// 任务目标数量 6-8 个
  }
  /*
  else{// 限时任务
    changedEntity.task[1] = Math.floor(Math.random()*3+5);// 任务目标数量 5-7 个
    changedEntity.task[3] = 60;// 任务时间 60 秒
    changedEntity.task[4] = changedEntity.task[3];
  }
  */
  //注意！！为了调整游戏平衡，任务参数在这里经过了修改！！
  while (true) {
    await sleep(1000); // 每隔1秒检查一次任务状态
    changedEntity.time += 1;// 玩家游戏时间增加1秒
    // 发送任务进度更新到客户端
    remoteChannel.sendClientEvent(entity as GamePlayerEntity,`T${changedEntity.task[0]}${(changedEntity.task[1].toString().padStart(2, '0'))}${changedEntity.task[2].toString().padStart(2, '0')}${changedEntity.task[3].toString().padStart(3, '0')}${changedEntity.task[4].toString().padStart(3, '0')}`);
    remoteChannel.sendClientEvent(entity as GamePlayerEntity,`E${changedEntity.time.toString().padStart(6,'0')}${Math.floor(changedEntity.score/(changedEntity.time/60)).toString().padStart(4,'0')}${changedEntity.questsChain.toString().padStart(3,'0')}`);// 发送效率面板数据到客户端，每分钟得分记小数点点后两位
    if (changedEntity.task[2] >= changedEntity.task[1]) {
      changedEntity.questsChain += 1; // 任务链数加1
      // 任务完成，分配新任务
      entity.player.dialog({
        type: GameDialogType.TEXT,
        content: i18n.t("task_completed", { num: 20, lng: (entity as any).lang || "zh-CN" })// 任务完成奖励20分（100分太多了故改为20分）
      })
      changedEntity.score += 20;
      remoteChannel.sendClientEvent(entity as GamePlayerEntity,`U${changedEntity.score.toString().padStart(4, '0')}`);// 通知客户端更新积分显示
    }
    //else if 允许玩家卡点完成限时任务
    else if(changedEntity.task[0]==3){// 限时任务
      changedEntity.task[4] -= 1;
      if(changedEntity.task[4]<=0){
        changedEntity.questsChain=0;// 任务链数清零
        // 任务失败，分配新任务
        entity.player.dialog({
          type: GameDialogType.TEXT,
          content: i18n.t("task_failed", { lng: (entity as any).lang || "zh-CN" })
        })
      }
      else{
        continue; // 任务未完成，继续等待
      }
    }
    else if(changedEntity.task[0]==4){// 无错误收集任务
      if(changedEntity.task[2]<=0){// 任务失败，进度-1
        changedEntity.questsChain=0;// 任务链数清零
        // 任务失败，分配新任务
        entity.player.dialog({
          type: GameDialogType.TEXT,
          content: i18n.t("task_failed", { lng: (entity as any).lang || "zh-CN" })
        })
      }
      else{
        continue; // 任务未完成，继续等待
      }
    }
    else{
      continue; // 任务未完成，继续等待
    }
    // 分配新任务
    changedEntity.task[0] = Math.floor(Math.random()*5+1);// 随机生成任务类型
    if(changedEntity.task[0]==1 || changedEntity.task[0]==2){// 非限时任务
      changedEntity.task[1] = Math.floor(Math.random()*3+6);// 任务目标数量 6-8 个
      changedEntity.task[2] = 0; // 重置任务进度
      changedEntity.task[3] = -1;
      changedEntity.task[4] = -1;
    }
    else if (changedEntity.task[0] == 3) {// 限时任务
      changedEntity.task[1] = Math.floor(Math.random()*2+4);// 任务目标数量 4-5 个
      changedEntity.task[2] = 0; // 重置任务进度
      changedEntity.task[3] = 60;// 任务时间 60 秒
      changedEntity.task[4] = changedEntity.task[3];
    }
    else if(changedEntity.task[0]==4){// 无错误收集任务
      changedEntity.task[1] = Math.floor(Math.random()*4+7);// 任务目标数量 7-10 个
      changedEntity.task[2] = 0; // 重置任务进度
      changedEntity.task[3] = -1;
      changedEntity.task[4] = -1;
    }
    else if(changedEntity.task[0]==5){// 通用分拣站收集任务
      changedEntity.task[1] = Math.floor(Math.random()*4+7);// 任务目标数量 7-10 个
      changedEntity.task[2] = 0; // 重置任务进度
      changedEntity.task[3] = -1;
      changedEntity.task[4] = -1;
    }
  }
});

// 设置箱子生成数量限制
const boxMaxCount = 10;
// 设置箱子生成间隔时间 （秒）
const boxSpawnInterval = 3;

function createBox(color?:string, fromConveyor?:boolean) {
  // 检查当前箱子数量
    const currentBoxCount = world.querySelectorAll(".spawned-box").length;
    if (currentBoxCount < boxMaxCount) {
      // 创建一个新的箱子实体
      let aORb=Math.random()<0.5?"mesh/A类货物.vb":"mesh/B类货物.vb";// 随机选择A类或B类货物
      if(color){// 如果指定颜色则生成对应颜色箱子
        aORb = color=="绿"?"mesh/A类货物.vb":"mesh/B类货物.vb";
      }
      
      let boxPosition = new GameVector3(
          Math.random() * 121 + 3,
          12,
          Math.random() * 121 + 3
        );
      while(1){
        if(boxPosition.x+boxPosition.z<230 && boxPosition.x+boxPosition.z>22){// 避免生成在分拣站内部
          break;
        }
        if(boxPosition.x>63 && boxPosition.x<68 && boxPosition.z>59 && boxPosition.z<68){// 避免生成在通用分拣站内部
          break;
        }
        boxPosition = new GameVector3(
          Math.random() * 121 + 3,
          12,
          Math.random() * 121 + 3
        );
      }
      if(fromConveyor){
        boxPosition = new GameVector3(63.5,10,126.5);// 传送带箱子固定生成在传送带起始位置
      }
      const box=world.createEntity({
        mesh: aORb as any, // 类型断言以避免 TS 报错
        position: boxPosition,
        meshScale: new GameVector3(3 / 16, 3 / 16, 3 / 16),
        tags: ["spawned-box"],
        collides: true,
        fixed: false,
        gravity: true,
        meshOrientation: new GameQuaternion(0,1,0,0).rotateY(Math.random()*Math.PI*2),// 随机朝向
        friction: 0.8
      });
      const colorList={"mesh/A类货物.vb":[new GameRGBColor(0, 0.5, 0),'绿'],"mesh/B类货物.vb":[new GameRGBColor(1,0.4,0.00),'红']} as {[key: string]: [GameRGBColor,string]};
      const colorListEng={"mesh/A类货物.vb":[new GameRGBColor(0, 0.5, 0),'Green'],"mesh/B类货物.vb":[new GameRGBColor(1,0.4,0.00),'Red']} as {[key: string]: [GameRGBColor,string]};
      // 设置箱子名称显示
      (box as any).showEntityName = true as any
      (box as any).nameRadius = 600 as any
      (box as any).nameColor = colorList[aORb][0];
      (box as any).customName = (fromConveyor?'传送带上的':'')+colorList[aORb][1]+'色标准箱 / '+colorListEng[aORb][1]+' box'+(fromConveyor?' from conveyor':'')
    }
}
world.onTick(({tick}) => {
  // 每隔一段时间生成一个箱子
  if (tick%(Math.floor(boxSpawnInterval*20)) == 0) {// 20 tick 大约等于 1 秒
    createBox('',false); // 随机颜色生成箱子
  }
  if(tick%40 == 0){// 每40 tick 检查一次传送带生成的箱子是否可以解锁掉落
    if(Math.random()<0.4){// 40% 概率解锁一个传送带箱子
      createBox('',true); // 生成一个传送带箱子
    }
  }
  if(tick%30 == 0){// 每30 tick 检查一次场景中的箱子状态， 之所以不每个 tick 都检查是为了提升性能（不然真的很卡>_<）
    world.querySelectorAll(".spawned-box").forEach((box)=>{
      if(box.position.y<0){// 如果箱子掉落到地面以下则移除
        box.destroy();
      }
      if(box.customName.startsWith('传送带上的') && box.position.z<10){// 传送带箱子到达传送带尽头则移除
        box.destroy();
      }
    });
  }
  if(tick%20 == 0){// 每20 tick 更新一次仓库储量UI
    remoteChannel.sendClientEvent(world.querySelectorAll('player'),`X${wareHouse[0].toString().padStart(2, '0')}${wareHouse[1].toString().padStart(2, '0')}`);// 通知客户端更新仓库储量显示
  }
  if((tick-1)%1200 == 0){// 每1200 tick （约1分钟）清空仓库储量
    wareHouse = [0,0];
    world.querySelectorAll('player').forEach((p)=>{
      remoteChannel.sendClientEvent(p as GamePlayerEntity,`AgainEmpty`); // 通知客户端显示仓库清空提示
    });
  }
});

// 玩家与箱子接触时触发事件
world.onEntityContact(({entity, other}) => {
  if (!entity.isPlayer || !other.hasTag("spawned-box")) return;

  // 如果是玩家与箱子接触且玩家还未拿到任何箱子，移除箱子实体并让玩家拿起箱子
  if(entity.mesh=="mesh/和平队长.vb"){// 确保玩家当前没有拿箱子
    if(other.customName.startsWith('传送带上的')){// 如果箱子是传送带生成的则标记玩家拿到的箱子来源为传送带
      (entity as any).fromConveyor = true;
    }
    // 移除箱子实体
    other.destroy();
    // 给玩家更换为拿箱子的 mesh
    entity.mesh = ("mesh/和平队长"+other.mesh[5]+".vb") as any; // 根据箱子类型更换为对应的拿箱子模型
    // 告诉玩家收集到了一个箱子
    entity.player?.directMessage(i18n.t(("box_picked.color"+other.mesh[5]) as any, { lng: (entity as any).lang || "zh-CN" }));
  }
});

// 玩家按下空格试图放下货物时，如果在正确的分拣站内则放下货物就得一分
function rightBoxType(entity: GameEntity){
  const changedEntity = entity as unknown as any;
  if(wareHouse[0]>=10 && entity.mesh=="mesh/和平队长A.vb" || wareHouse[1]>=10 && entity.mesh=="mesh/和平队长B.vb"){// 仓库已满
    remoteChannel.sendClientEvent(entity as GamePlayerEntity,`Full`); // 通知客户端显示仓库已满提示
    return;
  }
  if(entity.mesh=="mesh/和平队长A.vb"){
    wareHouse[0] += 1;
  }
  else if(entity.mesh=="mesh/和平队长B.vb"){
    wareHouse[1] += 1;
  }
  // i.如果货物类型与分拣站类型匹配，则货物消失，收集数量+1。
  entity.player?.directMessage(i18n.t(("right_type."+changedEntity.fromConveyor) as any, { lng: (entity as any).lang || "zh-CN" }));// 提示正确，得分
  changedEntity.score += 1;// 玩家积分加1
  if((changedEntity.task[0]==1 && entity.mesh=="mesh/和平队长A.vb") ||
      (changedEntity.task[0]==2 && entity.mesh=="mesh/和平队长B.vb") ||
      changedEntity.task[0]==3 || changedEntity.task[0]==4){// 任务进度加1
    changedEntity.task[2] += 1;
  }
  if(changedEntity.fromConveyor){
    changedEntity.fromConveyor = false;// 重置货物来源状态
    changedEntity.score += 1;// 如果货物来源是传送带，额外加1分
  }
  remoteChannel.sendClientEvent(entity as GamePlayerEntity,`U${changedEntity.score.toString().padStart(4, '0')}`);// 通知客户端更新箱子收集数量
  entity.mesh = "mesh/和平队长.vb" as any; // 放下箱子，恢复为未拿箱子模型
}

// 否则提示错误并让货物掉落回场景中
function wrongBoxType(entity: GameEntity){
  const changedEntity = entity as unknown as any;
  //ii.如果不匹配，则在屏幕中央显示红色错误提示“类型错误！”，货物掉落回场景中，可重新拾取。
  entity.player?.directMessage(i18n.t("wrong_type", { lng: (entity as any).lang || "zh-CN" }));
  remoteChannel.sendClientEvent(entity as GamePlayerEntity,`Wrong`); // 通知客户端显示错误提示
  if(changedEntity.task[0]==4){// 无错误收集任务进度为负（失败标志）
    changedEntity.task[2]=-1;
  }
  //记录箱子颜色以重新生成
  let resetColor = '红';
  if(entity.mesh[5]=='A'){
    resetColor = '绿';
  }
  // 让玩家放下错误类型的箱子，箱子重新掉落
  entity.mesh = "mesh/和平队长.vb" as any; // 放下箱子，恢复为未拿箱子模型
  createBox(resetColor, false);// 重新生成一个箱子，模拟掉落回场景中，但是无论如何都不是传送带来的，否则可能出现传送带箱子互相覆盖的bug
  (entity as any).fromConveyor = false;// 重置货物来源状态
}

// 创建通用分拣站区域
const genericSortingStationArea = world.addZone({
  selector: "player", // 检测玩家实体
  bounds: new GameBounds3(
    new GameVector3(59, 8, 59), // 区域低处顶点坐标
    new GameVector3(68, 15, 68) // 区域高处顶点坐标
  ) // 设置区域范围
});

genericSortingStationArea.onEnter(({ entity }) => {
  const changedEntity = entity as unknown as any;
  if(entity.mesh=="mesh/和平队长.vb") return;// 玩家当前没有拿箱子，直接返回
  if(changedEntity.task[0]==5){// 通用分拣站任务进度加1
    changedEntity.task[2] += 1;
  }
  changedEntity.score += 1;// 玩家积分加1
  changedEntity.fromConveyor = false;// 重置货物来源状态
  entity.player?.directMessage(i18n.t("generic_sorting_station", { lng: (entity as any).lang || "zh-CN" }));
  remoteChannel.sendClientEvent(entity as GamePlayerEntity,`U${changedEntity.score.toString().padStart(4, '0')}`);// 通知客户端更新箱子收集数量
  entity.mesh = "mesh/和平队长.vb" as any; // 放下箱子，恢复为未拿箱子模型
});

world.onPlayerJoin(({ entity }) => {
    entity.player.onKeyUp(async ({ keyCode }) => {
        if (keyCode == 32){ // 32 是空格键的 keyCode
          if (entity.mesh == "mesh/和平队长.vb") return;// 玩家当前没有拿箱子，直接返回
          // 检查玩家是否在分拣站区域内
          const pos = entity.position;
          if (pos.x >= 0 && pos.x <= 10 && pos.z >= 0 && pos.z <= 10) {
            // 在 A 类分拣站放下箱子
            if(entity.mesh=="mesh/和平队长A.vb"){
              rightBoxType(entity);
            }
            else{
              wrongBoxType(entity);
            }
          } else if (pos.x >= 117 && pos.x <= 127 && pos.z >= 117 && pos.z <= 127) {
            // 在 B 类分拣站放下箱子
            if(entity.mesh=="mesh/和平队长B.vb"){
              rightBoxType(entity);
            }
            else{
              wrongBoxType(entity);
            }
          }
        }
        else if(keyCode==69 && !(entity as any).searchingAutoBox){// E键自动定位到最近的传送带货物
          if(entity.mesh != "mesh/和平队长.vb"){// 玩家当前拿着箱子则不能自动定位
            entity.player.directMessage(i18n.t("cannot_auto_locate", { lng: (entity as any).lang || "zh-CN" }));
            return;
          }
          (entity as any).searchingAutoBox = true;
          entity.player.directMessage(i18n.t("auto_locating", { lng: (entity as any).lang || "zh-CN" }));
          //while(entity.mesh == "mesh/和平队长.vb"){
            entity.velocity = new GameVector3(0,0,0);// 静止
            let mindist = 1000;
            let nearestBox = entity as any;//随便赋值一下
            world.querySelectorAll(".spawned-box").forEach(async(box)=>{
              if(box.customName.startsWith('传送带上的')){// 只考虑传送带生成的箱子
                let dist = entity.position.distance(box.position);
                if(dist<mindist){
                  mindist = dist;
                  nearestBox = box;
                }
              }
            })
            if(mindist==1000){// 没有找到传送带箱子
              entity.player.directMessage(i18n.t("no_conveyor_box_found", { lng: (entity as any).lang || "zh-CN" }));
            (entity as any).searchingAutoBox = false;
              return;
            }
            console.log("最近传送带箱子距离：", mindist);
            entity.velocity = new GameVector3(0,0,0);// 清除速度避免冲突
            function subtract(a: GameVector3, b: GameVector3): GameVector3 {
              return new GameVector3(a.x - b.x, a.y - b.y, a.z - b.z);
            }
            while(entity.mesh == "mesh/和平队长.vb"){// 每次移动一段时间后重新计算距离和方向，避免越过箱子
              let direction = subtract(nearestBox.position, entity.position).normalize();
              entity.velocity = new GameVector3(direction.x * mindist / 6, direction.y * mindist / 6, direction.z * mindist / 6);// 设置速度向量，速度与距离成正比
              await sleep(400);// 等待 400 毫秒
              mindist = entity.position.distance(nearestBox.position);
              if(nearestBox.destroyed){// 箱子被销毁则停止自动寻找，可能被其他玩家捡走了，也可能到传送带尽头销毁了，还可能是玩家自己捡走了
                if(entity.mesh == "mesh/和平队长.vb"){// 玩家还没捡箱子才提示取消
                  entity.player.directMessage(i18n.t("auto_locate_canceled", { lng: (entity as any).lang || "zh-CN" }));
                  break;
                }
              }
            }
          //}
          (entity as any).searchingAutoBox = false;
        }
    })
})
