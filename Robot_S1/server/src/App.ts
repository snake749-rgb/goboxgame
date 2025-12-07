import i18n from "@root/i18n";

console.log("(server)：", i18n.t("welcome_game"));
console.log("(server)：", i18n.t("welcome_ap"));

world.addCollisionFilter('player','player');//关闭玩家碰撞
world.useOBB=true;//开启OBB碰撞检测以提升性能

// 这段代码的意思是：
// 当有任何新玩家(onPlayerJoin)加入这个世界(world)时，
// 我们就执行括号里的操作
world.onPlayerJoin(({ entity }) => {
  //玩家积分初始化为0
  (entity as any).score = 0;

  // 禁止跳跃
  entity.player.enableJump = false;

  // 从场景中查找机器人实体并复制它的 mesh
  const source = world.querySelector("#和平队长-1"); // 机器人暂定和平队长）））
  if (source) {
    (entity as any).mesh = (source as any).mesh; // 带类型断言以避免 TS 报错
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

// 设置箱子生成数量限制
const boxMaxCount = 10;
// 设置箱子生成间隔时间 （秒）
const boxSpawnInterval = 3;

function createBox(){
  // 检查当前箱子数量
    const currentBoxCount = world.querySelectorAll(".spawned-box").length;
    if (currentBoxCount < boxMaxCount) {
      // 创建一个新的箱子实体
      let aORb=Math.random()<0.5?"mesh/A类货物.vb":"mesh/B类货物.vb";// 随机选择A类或B类货物
      
      let boxPosition = new GameVector3(
          Math.random() * 121 + 3,
          12,
          Math.random() * 121 + 3
        );
      while(1){
        if(boxPosition.x+boxPosition.z<230 && boxPosition.x+boxPosition.z>22){// 避免生成在分拣站内部
          break;
        }
        boxPosition = new GameVector3(
          Math.random() * 121 + 3,
          12,
          Math.random() * 121 + 3
        );
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
      // 设置箱子名称显示
      (box as any).showEntityName = true as any
      (box as any).nameRadius = 600 as any
      (box as any).nameColor = colorList[aORb][0];
      (box as any).customName = colorList[aORb][1]+'色标准箱'
    }
}
world.onTick(({tick}) => {
  // 每隔一段时间生成一个箱子
  if (tick%(Math.floor(boxSpawnInterval*20)) == 0) {// 20 tick 大约等于 1 秒
    createBox();
  }
});

// 玩家与箱子接触时触发事件
world.onEntityContact(({entity, other}) => {
  if (!entity.isPlayer || !other.hasTag("spawned-box")) return;

  // 如果是玩家与箱子接触且玩家还未拿到任何箱子，移除箱子实体并让玩家拿起箱子
  if(entity.mesh=="mesh/和平队长.vb"){// 确保玩家当前没有拿箱子
    // 移除箱子实体
    other.destroy();
    // 给玩家更换为拿箱子的 mesh
    entity.mesh = ("mesh/和平队长"+other.mesh[5]+".vb") as any; // 根据箱子类型更换为对应的拿箱子模型
    // 告诉玩家收集到了一个箱子
    entity.player?.directMessage(i18n.t(("box_picked.color"+other.mesh[5]) as any));
  }
});

// 玩家按下空格试图放下货物时，如果在正确的分拣站内则放下货物就得一分
function rightBoxType(entity: GameEntity){
  // i.如果货物类型与分拣站类型匹配，则货物消失，收集数量+1。
  entity.player?.directMessage(i18n.t("right_type"));// 提示正确，得分
  (entity as any).score += 1;// 玩家积分加1
  remoteChannel.sendClientEvent(entity as GamePlayerEntity,`U${((entity as any).score).toString().padStart(4, '0')}`);// 通知客户端更新箱子收集数量
  entity.mesh = "mesh/和平队长.vb" as any; // 放下箱子，恢复为未拿箱子模型
}

// 否则提示错误并让货物掉落回场景中
function wrongBoxType(entity: GameEntity){
  //ii.如果不匹配，则在屏幕中央显示红色错误提示“类型错误！”，货物掉落回场景中，可重新拾取。
  entity.player?.directMessage(i18n.t("wrong_type"));
  remoteChannel.sendClientEvent(entity as GamePlayerEntity,`Wrong`); // 通知客户端显示错误提示
  
  // 让玩家放下错误类型的箱子，箱子重新掉落
  entity.mesh = "mesh/和平队长.vb" as any; // 放下箱子，恢复为未拿箱子模型
  createBox();// 重新生成一个箱子，模拟掉落回场景中
}

world.onPlayerJoin(({ entity }) => {
    entity.player.onKeyUp(({ keyCode }) => {
        if (keyCode != 32) return; // 32 是空格键的 keyCode
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
    })
})
