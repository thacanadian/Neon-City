import {THREE,rand,boxAt} from '../core/utils.js';

export class MapSystem{
  constructor(game){
    this.game=game;
    this.buildings=[];
    this.boxes=[];
    this.details=[];
    this.size=520;
    this.signWords=['NOIR','MOTEL','ARCADE','RAMEN','CLUB','DANGER','AUTO','DOCKS','WARE','POLICE'];
    this.create();
  }

  mat(c,e=.06){
    return new THREE.MeshStandardMaterial({color:0x15182b,emissive:c,emissiveIntensity:e,roughness:.72,metalness:.18});
  }

  glassMat(col){
    return new THREE.MeshStandardMaterial({color:0x111827,emissive:col,emissiveIntensity:.28,roughness:.42,metalness:.15});
  }

  addRoad(x,z,w,d,rot=0){
    const road=new THREE.Mesh(
      new THREE.PlaneGeometry(w,d),
      new THREE.MeshStandardMaterial({color:0x070912,roughness:.85})
    );
    road.rotation.x=-Math.PI/2;
    road.rotation.z=rot;
    road.position.set(x,.016,z);
    this.game.scene.add(road);

    const stripeMat=new THREE.MeshBasicMaterial({color:0x00ffff,transparent:true,opacity:.38});
    const count=Math.floor(w/24);
    for(let i=-count;i<=count;i++){
      const stripe=new THREE.Mesh(new THREE.PlaneGeometry(8,.18),stripeMat);
      stripe.rotation.x=-Math.PI/2;
      stripe.rotation.z=rot;
      const off=i*24;
      stripe.position.set(x+Math.cos(rot)*off,.026,z+Math.sin(rot)*off);
      this.game.scene.add(stripe);
    }
  }

  addStreetLamp(x,z,col=0x00ffff){
    const pole=new THREE.Mesh(
      new THREE.CylinderGeometry(.08,.08,4.2,8),
      new THREE.MeshStandardMaterial({color:0x222833,metalness:.5,roughness:.4})
    );
    pole.position.set(x,2.1,z);
    this.game.scene.add(pole);
    const lamp=new THREE.Mesh(
      new THREE.SphereGeometry(.22,10,8),
      new THREE.MeshBasicMaterial({color:col})
    );
    lamp.position.set(x,4.35,z);
    this.game.scene.add(lamp);
    const light=new THREE.PointLight(col,.45,13);
    light.position.copy(lamp.position);
    this.game.scene.add(light);
  }

  makeSignTexture(text,col){
    const c=document.createElement('canvas');
    c.width=256;c.height=96;
    const ctx=c.getContext('2d');
    ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(0,0,c.width,c.height);
    ctx.strokeStyle='#222';ctx.lineWidth=8;ctx.strokeRect(4,4,c.width-8,c.height-8);
    ctx.fillStyle='#'+col.toString(16).padStart(6,'0');
    ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=14;
    ctx.font='bold 34px Courier New';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(text,c.width/2,c.height/2);
    const tex=new THREE.CanvasTexture(c);
    tex.colorSpace=THREE.SRGBColorSpace;
    return tex;
  }

  addBillboard(x,z,w,d,h,col){
    const text=this.signWords[Math.floor(Math.random()*this.signWords.length)];
    const tex=this.makeSignTexture(text,col);
    const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true});
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(7,w+1),2.25),mat);
    const front=Math.random()<.5;
    if(front){
      sign.position.set(x,h*.68,z-d/2-.08);
    }else{
      sign.position.set(x+w/2+.08,h*.68,z);
      sign.rotation.y=Math.PI/2;
    }
    this.game.scene.add(sign);
  }

  decorateBuilding(x,z,w,d,h,col){
    const litMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:col,emissiveIntensity:.85,roughness:.35});
    const dimMat=new THREE.MeshStandardMaterial({color:0x0a1120,emissive:col,emissiveIntensity:.12,roughness:.6});
    const trimMat=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.95});

    // Window light bands on front and side. Big visual upgrade without thousands of tiny meshes.
    const rows=Math.max(1,Math.min(9,Math.floor(h/2.6)));
    for(let r=0;r<rows;r++){
      const y=1.8+r*(h-3)/Math.max(1,rows-1);
      const mat=Math.random()<.7?litMat:dimMat;
      const front=new THREE.Mesh(new THREE.BoxGeometry(Math.max(1.2,w*.68),.09,.055),mat);
      front.position.set(x,y,z-d/2-.04);
      this.game.scene.add(front);
      if(Math.random()<.75){
        const side=new THREE.Mesh(new THREE.BoxGeometry(.055,.09,Math.max(1.2,d*.68)),mat);
        side.position.set(x+w/2+.04,y,z);
        this.game.scene.add(side);
      }
    }

    // Neon vertical trim on taller buildings.
    if(h>8){
      for(const sx of [-1,1]){
        const strip=new THREE.Mesh(new THREE.BoxGeometry(.08,h*.86,.08),trimMat);
        strip.position.set(x+sx*w/2,yClamp(h*.5,.8,h-.8),z-d/2-.07);
        this.game.scene.add(strip);
      }
    }

    // Rooftop details: vents, antennas, glowing roof cap.
    if(Math.random()<.65){
      const ac=new THREE.Mesh(new THREE.BoxGeometry(Math.min(2.5,w*.45),.55,Math.min(2,d*.45)),new THREE.MeshStandardMaterial({color:0x2a2f3a,metalness:.35,roughness:.55}));
      ac.position.set(x+rand(-w*.18,w*.18),h+.28,z+rand(-d*.18,d*.18));
      this.game.scene.add(ac);
    }
    if(Math.random()<.38){
      const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,rand(2,5),7),trimMat);
      antenna.position.set(x+rand(-w*.25,w*.25),h+1.5,z+rand(-d*.25,d*.25));
      this.game.scene.add(antenna);
    }
    if(Math.random()<.28 && h>7)this.addBillboard(x,z,w,d,h,col);
  }


  addPropBox(x,z,w,d,h,col,em=.35){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:em,roughness:.55,metalness:.2}));
    m.position.set(x,h/2,z);
    this.game.scene.add(m);
    this.details.push(m);
    return m;
  }

  addCityProps(){
    // Small objects that make the city feel less empty, without blocking gameplay.
    for(let i=0;i<34;i++){
      const x=rand(-245,245), z=rand(-245,245);
      if(Math.abs(x)<22||Math.abs(z)<22) continue;
      if(this.collides(x,z,2,2)) continue;
      const kind=Math.random();
      if(kind<.34){
        this.addPropBox(x,z,1.2,.65,1.4,0x00ffff,.45); // vending / neon kiosk
      }else if(kind<.62){
        this.addPropBox(x,z,1.4,1.4,.75,0xff00aa,.24); // crate/dumpster
      }else{
        const cone=new THREE.Mesh(new THREE.ConeGeometry(.45,1.1,8),new THREE.MeshStandardMaterial({color:0xff7700,emissive:0xff3300,emissiveIntensity:.35}));
        cone.position.set(x,.55,z);this.game.scene.add(cone);this.details.push(cone);
      }
    }
    // Docks containers.
    for(let i=0;i<18;i++){
      const x=rand(135,240), z=rand(145,235);
      if(this.collides(x,z,5,2.5)) continue;
      const c=this.addPropBox(x,z,rand(5,9),rand(2,3),rand(1.7,2.4),Math.random()<.5?0x2255ff:0xff5522,.18);
      c.rotation.y=Math.random()<.5?0:Math.PI/2;
    }
    // Industrial pipes/tanks.
    for(let i=0;i<12;i++){
      const x=rand(55,220),z=rand(-220,-50);
      if(this.collides(x,z,3,3)) continue;
      const tank=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,2.4,18),new THREE.MeshStandardMaterial({color:0x333942,metalness:.55,roughness:.4,emissive:0xff7700,emissiveIntensity:.08}));
      tank.position.set(x,1.2,z);this.game.scene.add(tank);this.details.push(tank);
    }
  }

  addBuilding(x,z,w,d,h,col){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),this.mat(col));
    m.position.set(x,h/2,z);
    this.game.scene.add(m);
    this.buildings.push(m);
    this.boxes.push(boxAt(x,h/2,z,w+1,h,d+1));

    const ed=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.75}));
    ed.position.copy(m.position);
    this.game.scene.add(ed);
    this.decorateBuilding(x,z,w,d,h,col);
  }

  addDistrictPad(d){
    const pad=new THREE.Mesh(
      new THREE.PlaneGeometry(210,210),
      new THREE.MeshBasicMaterial({color:d.col,transparent:true,opacity:.035,depthWrite:false})
    );
    pad.rotation.x=-Math.PI/2;
    pad.position.set(d.x,.018,d.z);
    this.game.scene.add(pad);
  }

  create(){
    const g=this.game;
    const ground=new THREE.Mesh(
      new THREE.PlaneGeometry(this.size,this.size,80,80),
      new THREE.MeshStandardMaterial({color:0x101426,roughness:.92})
    );
    ground.rotation.x=-Math.PI/2;
    g.scene.add(ground);

    // Main roads and side roads so the map reads like an actual city.
    this.addRoad(0,0,this.size,18,0);
    this.addRoad(0,0,this.size,18,Math.PI/2);
    this.addRoad(-130,0,this.size*.75,11,Math.PI/2);
    this.addRoad(130,0,this.size*.75,11,Math.PI/2);
    this.addRoad(0,-130,this.size*.75,11,0);
    this.addRoad(0,130,this.size*.75,11,0);

    for(let x=-235;x<=235;x+=34){this.addStreetLamp(x,11,0x00ccff);this.addStreetLamp(x,-11,0xff00aa)}
    for(let z=-235;z<=235;z+=34){this.addStreetLamp(11,z,0x00ff99);this.addStreetLamp(-11,z,0xffcc00)}

    const districts=[
      {name:'Downtown',x:-120,z:-120,col:0x00ccff,count:60,h:[10,38]},
      {name:'Industrial',x:120,z:-120,col:0xff7700,count:38,h:[5,16]},
      {name:'Suburbs',x:-120,z:120,col:0x00ff66,count:44,h:[3,9]},
      {name:'Docks',x:120,z:120,col:0x8844ff,count:28,h:[4,13]}
    ];
    this.districts=districts;
    for(const d of districts)this.addDistrictPad(d);

    // Docks water patch.
    const water=new THREE.Mesh(
      new THREE.PlaneGeometry(125,85),
      new THREE.MeshBasicMaterial({color:0x0044aa,transparent:true,opacity:.32})
    );
    water.rotation.x=-Math.PI/2;
    water.position.set(185,.02,195);
    g.scene.add(water);

    for(const d of districts){
      for(let i=0;i<d.count;i++){
        let x=d.x+rand(-85,85),z=d.z+rand(-85,85);
        if(Math.hypot(x,z)<32)continue;
        // Leave the main roads more open.
        if(Math.abs(x)<17||Math.abs(z)<17||Math.abs(x+130)<11||Math.abs(x-130)<11||Math.abs(z+130)<11||Math.abs(z-130)<11)continue;
        this.addBuilding(x,z,rand(5,15),rand(5,15),rand(d.h[0],d.h[1]),d.col);
      }
    }

    // Neon commercial strip across center.
    for(let i=0;i<18;i++){
      const z=rand(-8,8),x=rand(-245,245);
      if(Math.hypot(x,z)<22)continue;
      this.addBuilding(x,z,rand(8,18),rand(5,12),rand(4,12),0xff0066);
    }

    this.addCityProps();
  }

  collides(x,z,sx=1,sz=1){
    const b=boxAt(x,.9,z,sx,1.8,sz);
    return this.boxes.some(bb=>b.intersectsBox(bb));
  }

  districtName(x,z){return x<0&&z<0?'Downtown':x>=0&&z<0?'Industrial':x<0&&z>=0?'Suburbs':'Docks';}
}

function yClamp(v,a,b){return Math.max(a,Math.min(b,v));}
