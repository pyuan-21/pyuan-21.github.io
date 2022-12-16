//  Jul 20, 2018
var isGameOver=false;//用于结束游戏的值
var gameScore=0;//游戏得分
var dir=0;//左上右下代表1、2、3、4.初始值0代表无方向
var grid_btn_pos=0;//用于作为格子元素的id区分的标号
var free_grids=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];//存放空闲格子的编号。每次move后都得重新写入.用splice()进行删除.用push()添加

function grid(value,pos,btn_pos,isMerge){//格子构造函数
	this.value=value;//存放格子的值2的i次方(i>0).0代表无值
	this.pos=pos;//存放grid_status中格子所在的下标
	this.btn_pos=btn_pos;//与grid_btn_pos关联.存放的是对应的html元素btn的id的数字标号.初值-1代表无指向任何html元素
	this.isMerge=isMerge;//判断是否是经过融合的格子,初始值为false
	this.next=function(dir){
		if(dir!=0){//有dir方向的情况才返回grid的dir方向的下一个格子的编号
			var row=Math.floor(pos/4);
			var col=pos%4;
			switch(dir){
			case 1:col=(col==0)?col:col-1;break;
			case 2:row=(row==0)?row:row-1;break;
			case 3:col=(col==3)?col:col+1;break;
			case 4:row=(row==3)?row:row+1;break;
			default:break;
			}
			var next_pos=row*4+col;
			return next_pos;
		}
	}
	this.prev=function(dir){
		if(dir!=0){//有dir方向的情况才返回grid的dir方向的下一个格子的编号
			var row=Math.floor(pos/4);
			var col=pos%4;
			switch(dir){
			case 1:col=(col==3)?col:col+1;break;
			case 2:row=(row==3)?row:row+1;break;
			case 3:col=(col==0)?col:col-1;break;
			case 4:row=(row==0)?row:row-1;break;
			default:break;
			}
			var prev_pos=row*4+col;
			return prev_pos;
		}
	}
	this.last=function(dir){
		if(dir!=0){//有dir方向的情况才返回grid的dir方向的最后一个格子的编号
			var row=Math.floor(pos/4);
			var col=pos%4;
			switch(dir){
			case 1:col=0;break;
			case 2:row=0;break;
			case 3:col=3;break;
			case 4:row=3;break;
			default:break;
			}
			var last_pos=row*4+col;
			return last_pos;
		}
	}
}
var grids_status=[];//存放格子对象
for(var i=0;i<16;i++){
	grids_status.push(new grid(0,i,-1,false));
}
function getFontSize(value){//根据格子的值给它指定数字大小像素和颜色
	if(Math.floor(value/10)==0){//1位数
		return "45px";
	}else if(Math.floor(value/100)==0){//2位数
		return "40px";
	}else if(Math.floor(value/1000)==0){//3位数
		return "35px";
	}else if(Math.floor(value/10000)==0){//4位数
		return "30px";
	}else if(Math.floor(value/100000)==0){//5位数
		return "25px";
	}else{//6位数及其以上
		return "20px";
	}
}
function getFontColor(value){
	if(value<=4){
		return "black";
	}
	else{
		return "white";
	}
}
function getBG_Color(value){//根据格子的值给它指定背景颜色代码
	switch(value){
	case 0:return "#EEE8CD";break;
	case 2:return "#FFFFF0";break;
	case 4:return "#FFFACD";break;
	case 8:return "#FFA54F";break;
	case 16:return "#FF8247";break;
	case 32:return "#FF7256";break;
	case 64:return "#FF3030";break;
	case 128:return "#FFFF00";break;
	case 256:return "#FFD700";break;
	case 512:return "#FFC125";break;
	case 1024:return "#FFB90F";break;
	case 2048:return "#EEC900";break;
	case 4096:return "#76EE00";break;
	default:return "#000000";
	}
}
function emerge(){//grid_btn_pos只有这个函数才会增加它的值,理想情况下也不会溢出,大概..
	if(free_grids.length==0)gameover();
	else{
		//改写grid_status中元素
		var num=Math.ceil((free_grids.length-1)*Math.random());
		var pos=free_grids.splice(num, 1);//从free_grids中随机取出一个编号
		if(2*Math.random()<=1.5){//随机数的结果位0-2之间的浮点数.
			grids_status[pos].value=2;
			grids_status[pos].btn_pos=grid_btn_pos;
		}
		else{
			grids_status[pos].value=4;
			grids_status[pos].btn_pos=grid_btn_pos;
		}
		//上面决定好格子里面的值之后,就要往页面添加这个元素.添加的时候应该是隐藏的,之后再用动画让他显示出来
		$("#grids").append("<button id=\"grid_"+grid_btn_pos+"\" type=\"button\" class=\"btn btn-default btn-lg background-btn-init\" disabled=\"disabled\" style=\"text-align:center;font-size:"+getFontSize(grids_status[pos].value)+";color:"+getFontColor(grids_status[pos].value)+";font-weight:bold;background-color:"+getBG_Color(grids_status[pos].value)+";\">"+grids_status[pos].value+"</button>");
		var x=$("#pos_"+pos).position().top;
		var y=$("#pos_"+pos).position().left;
		$("#grid_"+grid_btn_pos).css({
			position:'absolute',
			top:x+10,
			left:y+10,
		});
		$("#grid_"+grid_btn_pos).animate({
			width:100,
			height:100,
			top:x,
			left:y,
		},300);
		grid_btn_pos++;
	}
}
function move(){//移动的实质是改写grid_status上grid的属性、free_grids的值以及对html中代表grid的元素进行变化
	var row,col,now_pos,target_pos,del_btn_pos;//行、列、当前格子编号、目标格子编号、融合元素要删除的html元素id下标(即格子id下标)
	var r_init,c_init,r_cre,c_cre,r_end,c_end;//init初始值、cre变化量、end结束值
	var isMove=false;//是否有格子移动了
	switch(dir){//计算遍历的方向
	case 1:r_init=0;c_init=1;r_cre=1;c_cre=1;r_end=4;c_end=4;break;
	case 2:r_init=1;c_init=0;r_cre=1;c_cre=1;r_end=4;c_end=4;break;
	case 3:r_init=0;c_init=2;r_cre=1;c_cre=-1;r_end=4;c_end=1;break;
	case 4:r_init=2;c_init=0;r_cre=-1;c_cre=1;r_end=1;c_end=4;break;break;
	default:return;break;
	}
	//决定好遍历方向后开始遍历每个格子
	for(row=r_init;;row+=r_cre){//这样的嵌套循环可能会使动画不太同步,如果很明显,回头改写
		for(col=c_init;;col+=c_cre){//对每个格子都进行同样操作
			now_pos=row*4+col;//获取当前格子编号
			target_pos=now_pos;//初始值为当前编号
			del_btn_pos=-1;//初始值设置为-1,用于下面播放动画时删除元素做判断,保证不出错
			//计算移动的坐标target_pos
			while(true){
				if(grids_status[now_pos].value==0){//如果是个空grid的话立马退出
					break;
					}
				target_pos=grids_status[target_pos].next(dir);
				if(grids_status[target_pos].value==0){//可达到,不是最后一格就重复
					if(target_pos==grids_status[now_pos].last(dir)){
						grids_status[target_pos].value=grids_status[now_pos].value;
						grids_status[target_pos].btn_pos=grids_status[now_pos].btn_pos;
						grids_status[target_pos].isMerge=grids_status[now_pos].isMerge;
						grids_status[now_pos].value=0;
						grids_status[now_pos].btn_pos=-1;
						grids_status[now_pos].isMerge=false;
						isMove=true;
						break;
					}
					continue;
				}
				else if(grids_status[target_pos].isMerge==false && grids_status[target_pos].value==grids_status[now_pos].value){//可达到,但只能移动到这了
					grids_status[target_pos].value+=grids_status[now_pos].value;
					del_btn_pos=grids_status[target_pos].btn_pos;//保存好要删除的下标
					grids_status[target_pos].btn_pos=grids_status[now_pos].btn_pos;
					grids_status[target_pos].isMerge=true;
					grids_status[now_pos].value=0;
					grids_status[now_pos].btn_pos=-1;
					grids_status[now_pos].isMerge=false;
					gameScore+=grids_status[target_pos].value;//计算得分
					isMove=true;
					break;
				}
				else{//无法再移动
					target_pos=grids_status[target_pos].prev(dir);//目标的上一个
					if(target_pos!=now_pos){
						grids_status[target_pos].value=grids_status[now_pos].value;
						grids_status[target_pos].btn_pos=grids_status[now_pos].btn_pos;
						grids_status[target_pos].isMerge=grids_status[now_pos].isMerge;
						grids_status[now_pos].value=0;
						grids_status[now_pos].btn_pos=-1;
						grids_status[now_pos].isMerge=false;
						isMove=true;
					}
					break;
				}
			}
			//播放动画并且改变得分
			if(target_pos!=now_pos){//目标坐标和起始坐标不一致就要移动.
				var x=$("#pos_"+target_pos).position().top;
				var y=$("#pos_"+target_pos).position().left;
				$("#grid_"+grids_status[target_pos].btn_pos).animate({
					top:x,
					left:y,
				},200);
				if(grids_status[target_pos].isMerge){//如果是融合需要播放融合动画,并修改元素颜色和删除多余元素
					$("#grid_"+grids_status[target_pos].btn_pos).css({
						"font-size":getFontSize(grids_status[target_pos].value),
						"color":getFontColor(grids_status[target_pos].value),
						"background-color":getBG_Color(grids_status[target_pos].value),
					});
					$("#grid_"+grids_status[target_pos].btn_pos).animate({
						width:110,
						height:110,
						top:x-5,
						left:y-5,
					},200);
					$("#grid_"+grids_status[target_pos].btn_pos).animate({
						width:100,
						height:100,
						top:x,
						left:y,
					},200);
					$("#grid_"+grids_status[target_pos].btn_pos).html(grids_status[target_pos].value);
					//改变得分
					$("#score").html(gameScore);
					//删除元素,这里应该是播放完融合动画之后再删除的，但是放在animate回调函数里面并不能正确地访问外部变量del_btn_pos
					if(del_btn_pos!=-1){
						$("#grid_"+del_btn_pos).remove();
					}
				}
			}
			if(col==(c_end-1))break;
		}
		if(row==(r_end-1))break;
	}
	
	//根据grid_status改变free_grids,还有把grid_status中isMerge恢复默认
	free_grids.splice(0,free_grids.length);//先清空
	for(var m=0;m<16;m++){
		grids_status[m].isMerge=false;
		if(grids_status[m].value==0){
			free_grids.push(grids_status[m].pos);
		}
	}
	if(isMove)emerge();
	if(free_grids.length==0)canContinue();//当格子被铺满时,需要判断能否继续游戏
}
function canContinue(){
	//遍历所有格子上下左右方向看能否融合.有一个则成功.否则不能继续游戏
	var isContinue=false;
	for(var n=0;n<16;n++){
		if((grids_status[n].next(1)!=n) && (grids_status[n].value==grids_status[grids_status[n].next(1)].value)){
			isContinue=true;break;
		}else if((grids_status[n].next(2)!=n) && (grids_status[n].value==grids_status[grids_status[n].next(2)].value)){
			isContinue=true;break;
		}else if((grids_status[n].next(3)!=n) && (grids_status[n].value==grids_status[grids_status[n].next(3)].value)){
			isContinue=true;break;
		}else if((grids_status[n].next(4)!=n) && (grids_status[n].value==grids_status[grids_status[n].next(4)].value)){
			isContinue=true;break;
		}
	}
	if(!isContinue)
		gameover();
}
function gameStart(){
	emerge();
	emerge();
	$(document).keydown(function(event){
		switch(event.which){
		case 65:dir=1;break;//a
		case 37:dir=1;break;//←
		case 87:dir=2;break;//w
		case 38:dir=2;break;//↑
		case 68:dir=3;break;//d
		case 39:dir=3;break;//→
		case 83:dir=4;break;//s
		case 40:dir=4;break;//↓
		default:dir=0;
		}
		if(dir!=0&&(!isGameOver)){//按下正确的方向键并且游戏没有结束
			move();
		}
	});
}
function gameover(){
	isGameOver=true;
	alert("Game Over!");
}
function restart(){
	location.reload();
	/*****************如果用下面代码会出现明显问题,why?
	isGameOver=false;
	gameScore=0;
	dir=0;
	grid_btn_pos=0;
	free_grids=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
	grids_status=[];//存放格子对象
	for(var i=0;i<16;i++){
		grids_status.push(new grid(0,i,-1,false));
	}
	$("#score").html(gameScore);
	$("#pos_15").nextAll().remove();
	gameStart();
	*****************/
}
function onClickMove(argument) {
	dir=argument;
	if(dir!=0&&(!isGameOver)){//按下正确的方向键并且游戏没有结束
		move();
	}
}

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

if(window.mobileCheck()){
	alert("using mobile!");
}

gameStart();